#!/usr/bin/env python3
"""Video 4K (3840x2160), 4 s: el cerebro se ilumina con una onda de energía desde el tronco."""
import subprocess
import sys

import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
FW, FH, FPS, DUR = 3840, 2160, 30, 4.0
N = int(FPS * DUR)
S = 5.3  # escala de la imagen original
BG = np.array([10, 15, 26], np.float32) / 255.0

src = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32) / 255.0
h0, w0 = src.shape[:2]
cx0, cy0 = (30 + 432) / 2, (55 + 380) / 2  # centro del cerebro en la imagen original

# Región de trabajo (el resto del cuadro es fondo plano)
RW, RH = 2900, FH
RX = (FW - RW) // 2


def up(chan, w, h):
    return np.asarray(Image.fromarray(chan.astype(np.float32), "F").resize((w, h), Image.LANCZOS))


uw, uh = round(w0 * S), round(h0 * S)
lum = (src.max(-1) - BG.max()) / (0.93 - BG.max())
mask_up = up(np.clip(lum, 0, 1), uw, uh)
white_up = up(np.clip((src.min(-1) - 0.35) / 0.4, 0, 1), uw, uh)  # nodos blanquecinos
col_up = np.stack([up(src[..., c], uw, uh) for c in range(3)], -1)


def place(a, fill):
    """Coloca la imagen escalada en la región de trabajo con el cerebro centrado."""
    shape = (RH, RW) + a.shape[2:]
    out = np.full(shape, fill, np.float32)
    ox = round(FW / 2 - RX - cx0 * S)
    oy = round(FH / 2 - cy0 * S)
    sx0, sy0 = max(0, -ox), max(0, -oy)
    dx0, dy0 = max(0, ox), max(0, oy)
    w = min(a.shape[1] - sx0, RW - dx0)
    h = min(a.shape[0] - sy0, RH - dy0)
    out[dy0:dy0 + h, dx0:dx0 + w] = a[sy0:sy0 + h, sx0:sx0 + w]
    return out


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# Trazo nítido: el escalado se re-afila con un umbral suave
M = smooth(0.22, 0.62, place(mask_up, 0))
Wn = smooth(0.1, 0.8, place(white_up, 0)) * M
C = place(col_up, 0)
C = C / np.maximum(C.max(-1, keepdims=True), 1e-3)  # tono puro de cada trazo
C[M < 0.01] = (0.32, 1.0, 0.68)
C = np.ascontiguousarray(C * np.array([0.62, 1.0, 0.86], np.float32))


def box(a, r):
    c = np.cumsum(np.pad(a, ((0, 0), (r + 1, r)), mode="edge"), 1)
    a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
    c = np.cumsum(np.pad(a, ((r + 1, r), (0, 0)), mode="edge"), 0)
    return (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)


def blur(a, sigma):
    k = 4
    small = np.asarray(Image.fromarray(a, "F").resize((RW // k, RH // k), Image.BOX))
    r = max(1, round(sigma / k / 1.7))
    for _ in range(3):
        small = box(small, r)
    return np.array(Image.fromarray(small.astype(np.float32), "F").resize((RW, RH), Image.BILINEAR))


G1 = blur(M, 14)
G2 = blur(M, 60)
G3 = blur(M, 260)
G3 /= G3.max()
GW = blur(Wn, 18)

# Campo de distancia desde el tronco cerebral, con borde orgánico
yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
ox = FW / 2 - RX + (268 - cx0) * S
oy = FH / 2 + (372 - cy0) * S
ang = np.arctan2(yy - oy, xx - ox)
D = np.hypot(xx - ox, yy - oy)
D = D / D[M > 0.5].max()
D = D + 0.025 * np.sin(ang * 7.0) + 0.018 * np.sin(ang * 13.0 + 1.3) + 0.012 * np.sin(D * 40)
del yy, xx, ang

rng = np.random.default_rng(7)
DITHER = (rng.random((RH, RW, 1), np.float32) - 0.5) / 255.0
bgframe = np.empty((FH, FW, 3), np.uint8)
bgframe[:] = np.round(BG * 255).astype(np.uint8)


def ease(x):
    x = np.clip(x, 0, 1)
    return 1 - (1 - x) ** 3


def frame(t):
    f = ease((t - 0.3) / 2.2) * 1.18 - 0.06  # posición del frente de la onda
    s = f - D
    lit = smooth(-0.01, 0.16, s)
    edge = np.exp(-((s - 0.005) / 0.035) ** 2) * (f < 1.1)
    settle = smooth(2.3, 3.0, t)
    flow = 0.5 + 0.5 * np.sin(D * 38 - t * 9.0)  # pulsos de energía recorriendo los trazos
    breathe = 1 + 0.06 * np.sin((t - 2.6) * 4.2) * settle
    I = (0.10 + 0.90 * lit * (0.85 + 0.15 * flow * lit)) * breathe
    hot = edge * 1.1
    spark = Wn * (edge * 2.2 + lit * (0.35 + 0.45 * flow) * (0.6 + 0.4 * settle))
    sparkg = GW * (edge * 3.0 + lit * 0.9 * (0.6 + 0.4 * flow))

    line = (M * I)[..., None] * C + (M * hot)[..., None] * np.array([0.45, 1.0, 0.8], np.float32)
    glow = ((G1 * 1.0 + G2 * 0.9) * (I + hot * 1.4))[..., None] * C * 0.75
    halo = (G3 * (0.05 + 0.16 * smooth(0.6, 2.6, t)) * breathe)[..., None] * np.array([0.1, 0.55, 0.38], np.float32)
    white = (spark * 0.9 + sparkg * 0.25)[..., None] * np.array([0.85, 1.0, 0.95], np.float32)

    x = line + glow + halo + white
    x = 1 - np.exp(-x * 1.15)  # compresión suave de las altas luces
    out = BG + x * (1 - BG) + DITHER
    img = bgframe.copy()
    img[:, RX:RX + RW] = np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)
    return img


if __name__ == "__main__":
    if len(sys.argv) > 3:  # modo vista previa: guarda fotogramas sueltos
        for t in map(float, sys.argv[3].split(",")):
            Image.fromarray(frame(t)).save(f"{OUT}_{t:.1f}.png")
        sys.exit()
    enc = subprocess.Popen([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{FW}x{FH}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-maxrate", "50M", "-bufsize", "100M",
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "5.1",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-movflags", "+faststart", OUT,
    ], stdin=subprocess.PIPE)
    for i in range(N):
        enc.stdin.write(frame(i / FPS).tobytes())
        print(f"\r{i + 1}/{N}", end="", flush=True)
    enc.stdin.close()
    enc.wait()
    print()
