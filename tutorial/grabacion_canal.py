#!/usr/bin/env python3
"""Prepara la grabación del canal (acceso → bienvenida → desplazarse → Enlace de invitación).

La grabación muestra datos personales (Clave de Elector y CURP de Eduardo, nombre y teléfono
de un promovido ya registrado). Se difuminan siguiendo el desplazamiento del chat:

  1. `offsets`: mide cuánto se desplaza el chat en cada cuadro (correlación entre cuadros)
     y guarda una tira "documento" cosida para ubicar las zonas sensibles.
  2. `render`: aplica el difuminado en coordenadas de documento y codifica el clip final.

Uso:  python3 -I grabacion_canal.py offsets FUENTE.mp4
      python3 -I grabacion_canal.py render  FUENTE.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets" / "grabacion"
WORK = Path(sys.argv[3]) if len(sys.argv) > 3 else OUT
T0, T1 = 3.5, 16.5  # tramo útil de la grabación (s)
W, H = 1200, 2132  # columna de la app, igual que cuestionario.mp4
CROP = "crop=2048:3640:294:200"
FPS = 30
CHAT = (170, 1990)  # franja del chat (sin encabezado ni barra inferior), en px de W×H
SMALL = 4  # factor de reducción para medir


def frames(src, w, h):
    cmd = ["ffmpeg", "-loglevel", "error", "-ss", str(T0), "-to", str(T1), "-i", src,
           "-vf", f"{CROP},scale={w}:{h}:flags=area,fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)
    p.wait()


def measure(src):
    w, h = W // SMALL, H // SMALL
    y0, y1 = CHAT[0] // SMALL, CHAT[1] // SMALL
    prev, pos, offs, strips = None, 0.0, [], []
    for f in frames(src, w, h):
        g = f.mean(axis=2)[y0:y1]
        if prev is not None:
            best, bd = 0, 1e9
            for d in range(-140, 141):
                a = prev[max(0, d): len(prev) + min(0, d)]
                b = g[max(0, -d): len(g) + min(0, -d)]
                if len(a) < 120:
                    continue
                e = np.abs(a - b).mean()
                if e < bd - 1e-6:
                    bd, best = e, d
            pos += best
        offs.append(pos)
        strips.append(f[y0:y1])
        prev = g
    offs = np.array(offs)
    # documento cosido (escala reducida) para ubicar zonas
    top = int(offs.min())
    doc = np.full((int(offs.max() - top) + (y1 - y0), w, 3), 255, np.uint8)
    for o, s in zip(offs, strips):
        y = int(o - top)
        doc[y : y + len(s)] = s
    Image.fromarray(doc).save(WORK / "canal_doc.png")
    (WORK / "canal_offsets.json").write_text(json.dumps({"offsets": offs.tolist(), "top": top, "small": SMALL, "chat": CHAT}))
    print("frames", len(offs), "rango", offs.min(), offs.max())


def render(src):
    meta = json.loads((WORK / "canal_offsets.json").read_text())
    zones = json.loads((ROOT / "canal_zonas.json").read_text())  # [[x0, y0_doc, x1, y1_doc], ...] en px reducidos
    offs, top = np.array(meta["offsets"]), meta["top"]
    y0 = CHAT[0]
    enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
                            "-g", "30", "-movflags", "+faststart", str(OUT / "canal.mp4")], stdin=subprocess.PIPE)
    for i, f in enumerate(frames(src, W, H)):
        im = Image.fromarray(f)
        o = offs[min(i, len(offs) - 1)]
        if i < zones["chat_from"]:  # todavía es la pantalla de acceso: sin chat que difuminar
            o = None
        elif i <= zones["settled_at"]:  # fundido acceso→canal: la medición no es fiable, el canal ya está quieto
            o = zones["settled_offset"]
        for x0, d0, x1, d1 in zones["doc"] if o is not None else []:
            ya = int((d0 + top - o) * SMALL) + y0
            yb = int((d1 + top - o) * SMALL) + y0
            ya, yb = max(ya, CHAT[0]), min(yb, CHAT[1])
            if yb - ya < 4:
                continue
            box = (x0 * SMALL, ya, x1 * SMALL, yb)
            im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(16)), box)
        for t0, t1, x0, ya, x1, yb in zones.get("fixed", []):  # zonas fijas por tiempo (px completos)
            t = T0 + i / FPS
            if t0 <= t <= t1:
                box = (x0, ya, x1, yb)
                im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(16)), box)
        enc.stdin.write(np.asarray(im).tobytes())
    enc.stdin.close()
    enc.wait()


if __name__ == "__main__":
    {"offsets": measure, "render": render}[sys.argv[1]](sys.argv[2])
