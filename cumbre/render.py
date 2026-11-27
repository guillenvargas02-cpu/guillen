#!/usr/bin/env python3
"""Cumbre México — video de highlights 4K (2160x3840, 30 fps, 35 s).

Uso:
  python3 render.py cache                 # extrae los frames 8K que usa el corte (una vez)
  python3 render.py snap 2.5 6 15.2 ...   # frames sueltos a JPG para revisar
  python3 render.py video                 # render completo -> work/video.mp4 (sin audio)

El audio se arma aparte con audio.py y se une con mux.
"""
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

cv2.setNumThreads(4)
W, H, FPS = 2160, 3840, 30
SPEED = 1.04        # todo el video va 4 % más rápido (la música se acelera igual, sin cambiar de tono)
TL = 38.5           # duración en "tiempo de línea" (antes de acelerar)
DUR = TL / SPEED    # ~37.0 s reales
NFR = int(round(DUR * FPS))


def tl(f):
    """tiempo de la línea de edición para el frame de salida f."""
    return f * SPEED / FPS

UP = Path("/root/.claude/uploads/e79892bd-5db3-5f50-b81b-f961e67b318d")
SC = Path(os.environ.get("CUMBRE_WORK", "/tmp/claude-0/-home-user-guillen/e79892bd-5db3-5f50-b81b-f961e67b318d/scratchpad/work"))
CACHE = SC / "cache"
LOGO = SC / "logo"

GOLD = np.array([0.86, 0.70, 0.42], np.float32)  # dorado del emblema (RGB)

# ------------------------------------------------------------------ fuentes
# 8K: se decodifican y guardan a 2592x4608 (1.2x del cuadro) para poder hacer punch-in sin perder nitidez.
# SR: tomas de WhatsApp reescaladas x4 con Real-ESRGAN (2304x4096).
CLIPS = {
    "B1": dict(file="04ea024a", kind="8k", fps=30),   # salón principal (92 frames, ~28 fps reales)
    "B2": dict(file="7ac4b10d", kind="8k", fps=30),   # salón principal lleno, plano general
    "B3": dict(file="f9a3aa99", kind="8k", fps=30),   # salón principal, mesas
    "SP": dict(file="8a2fcfb0", kind="8k", fps=30),   # ponente de pie, entrevista con celular
    "AU": dict(file="aa8393e0", kind="8k", fps=30),   # público grabando con el celular
    "P1": dict(file="1c6993a2", kind="sr", fps=30),   # ponente sentado con micrófono
    "P2": dict(file="4e770089", kind="sr", fps=30),   # ponente, brazos abiertos
    "P3": dict(file="e3ccea3a", kind="sr", fps=30),   # pantalla "Video con IA" + ponente
    "P4": dict(file="8706a718", kind="sr", fps=30),   # ponente, plano cercano
    "P5": dict(file="e4b4e34b", kind="sr", fps=30),   # asistente viendo el celular
}

# ------------------------------------------------------------------ corte (EDL)
# t0/t1 en segundos del video; src = segundo de la fuente; z = zoom inicial/final; a = ancla (x, y) normalizada
# tr = transición de entrada; g = ajuste de color (exp, temp, sat)
# La música (opción 1, 120 BPM) tiene beats en múltiplos de 0.5 s del video: todos los cortes caen en beat.
EDL = [
    dict(t0=3.0, t1=5.5, c="B1", src=0.00, z=(1.00, 1.07), a=(0.50, 0.56), tr="portal"),       # salón lleno (única vez)
    dict(t0=5.5, t1=7.5, c="SP", src=3.00, z=(1.16, 1.24), a=(0.36, 0.42), tr="cut"),          # ponente: presentación
    dict(t0=7.5, t1=8.5, c="B2", src=2.40, z=(1.00, 1.06), a=(0.50, 0.55), tr="whip"),         # salón lleno, plano general
    dict(t0=8.5, t1=10.0, c="P3", src=1.50, z=(1.04, 1.10), a=(0.40, 0.50), tr="cut"),         # panel hablando
    dict(t0=10.0, t1=12.5, c="P1", src=9.50, z=(1.12, 1.22), a=(0.40, 0.38), tr="punch"),      # ponente señala
    dict(t0=12.5, t1=13.5, c="P5", src=3.00, speed=1.5, z=(1.04, 1.08), a=(0.45, 0.45), tr="cut"),  # paneo panel + pantalla
    dict(t0=13.5, t1=15.5, c="P2", src=0.00, z=(1.06, 1.14), a=(0.42, 0.36), tr="cut"),        # ponente, brazos abiertos
    dict(t0=15.5, t1=16.5, c="P2", src=7.00, speed=2.0, z=(1.04, 1.08), a=(0.50, 0.40), tr="whip"),  # paneo a "PULSO 360"
    dict(t0=16.5, t1=18.0, c="P3", src=9.20, z=(1.00, 1.07), a=(0.45, 0.50), tr="cut"),        # "Video con IA" + ponente
    dict(t0=18.0, t1=19.0, c="AU", src=4.20, speed=1.5, z=(1.04, 1.08), a=(0.50, 0.55), tr="cut"),  # paneo del público al escenario
    dict(t0=19.0, t1=20.0, c="P4", src=0.00, z=(1.04, 1.10), a=(0.30, 0.40), tr="cut"),        # ponente, plano cercano
    dict(t0=20.0, t1=22.0, c="SP", src=7.60, z=(1.12, 1.20), a=(0.30, 0.42), tr="cut"),        # ponente entrevistado
    dict(t0=22.0, t1=23.0, c="P3", src=3.50, speed=2.0, z=(1.04, 1.08), a=(0.45, 0.50), tr="cut"),  # paneo del panel a la pantalla
    dict(t0=23.0, t1=25.0, c="P1", src=21.00, z=(1.12, 1.20), a=(0.45, 0.38), tr="punch"),     # ponente, mano arriba
    dict(t0=25.0, t1=26.0, c="B3", src=0.20, z=(1.07, 1.00), a=(0.45, 0.55), tr="cut"),        # salón principal, mesas
    dict(t0=26.0, t1=28.0, c="P2", src=3.00, z=(1.06, 1.14), a=(0.42, 0.36), tr="cut"),        # ponente explicando
    dict(t0=28.0, t1=29.0, c="P4", src=2.20, z=(1.02, 1.08), a=(0.45, 0.38), tr="whip"),       # ponente escuchando
    dict(t0=29.0, t1=30.5, c="P1", src=3.50, z=(1.10, 1.18), a=(0.45, 0.36), tr="cut"),        # ponente, gesto
    dict(t0=30.5, t1=31.5, c="SP", src=12.00, z=(1.10, 1.18), a=(0.36, 0.40), tr="cut"),        # sonrisa -> photo dump
]


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def ease_out(x, p=3):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** p


def ease_in(x, p=3):
    x = min(max(x, 0.0), 1.0)
    return x ** p


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


# ------------------------------------------------------------------ tiempo de fuente
def src_time(shot, t):
    u = t - shot["t0"]
    if shot.get("speed") == "ramp":
        # 3.0-4.0: cámara lenta 0.25x dentro del portal; 4.0-5.5: rampa hasta tiempo real en el drop
        if u <= 1.0:
            return shot["src"] + 0.25 * u
        # integral de v(w) = 0.25 + 0.75*smooth(w/1.0) para w = u-1
        w, acc, n = u - 1.0, 0.0, 200
        for i in range(n):
            ww = (i + 0.5) / n * w
            acc += (0.25 + 0.75 * smooth(ww / 1.0)) * (w / n)
        return shot["src"] + 0.25 + acc
    return shot["src"] + u * shot.get("speed", 1.0)


def src_frame(shot, t):
    fps = CLIPS[shot["c"]]["fps"]
    # índice relativo al primer frame del corte: monotónico y sin repetir (velocidad >= 0.25x en 120 fps)
    return int(round(src_time(shot, t) * fps + 1e-6))


def shot_out_frames(s):
    return [f for f in range(NFR) if s["t0"] - 1e-6 <= tl(f) < s["t1"] - 1e-6]


def needed_frames():
    need = {}
    for s in EDL:
        for f in shot_out_frames(s):
            need.setdefault(s["c"], set()).add(src_frame(s, tl(f)))
    return need


def check_no_repeats():
    need, seen = {}, {}
    for i, s in enumerate(EDL):
        idx = [src_frame(s, tl(f)) for f in shot_out_frames(s)]
        assert len(idx) == len(set(idx)), f"frames repetidos dentro del plano {i}"
        for k in idx:
            assert (s["c"], k) not in seen, f"frame {s['c']}:{k} repetido en planos {seen[(s['c'], k)]} y {i}"
            seen[(s["c"], k)] = i
    return True


# ------------------------------------------------------------------ cache de frames
def build_cache():
    for c, frames in needed_frames().items():
        info = CLIPS[c]
        if info["kind"] != "8k":
            continue
        d = CACHE / c
        d.mkdir(parents=True, exist_ok=True)
        todo = sorted(k for k in frames if not (d / f"{k:05d}.jpg").exists())
        if not todo:
            continue
        src = next(UP.glob(f"{info['file']}-*.mp4"))
        sel = "+".join(f"eq(n\\,{k})" for k in todo)
        print(c, len(todo), "frames")
        tmp = d / "tmp"
        tmp.mkdir(exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf",
                        f"select='{sel}',scale=2592:4608:flags=lanczos", "-fps_mode", "passthrough",
                        "-q:v", "1", "-qmin", "1", str(tmp / "%05d.jpg")], check=True)
        out = sorted(tmp.glob("*.jpg"))
        assert len(out) == len(todo), (c, len(out), len(todo))
        for k, p in zip(todo, out):
            p.rename(d / f"{k:05d}.jpg")
        tmp.rmdir()


_img_cache = {}


def load_src(c, k):
    key = (c, k)
    if key in _img_cache:
        return _img_cache[key]
    info = CLIPS[c]
    if info["kind"] == "8k":
        im = cv2.imread(str(CACHE / c / f"{k:05d}.jpg"), cv2.IMREAD_COLOR)
    else:
        p = SC / "sr" / info["file"] / f"{k:05d}.png"
        if p.exists():
            im = cv2.imread(str(p), cv2.IMREAD_COLOR)
        else:  # vista previa mientras termina el reescalado IA
            im = cv2.imread(str(SC / "lr" / info["file"] / f"{k:05d}.png"), cv2.IMREAD_COLOR)
            im = cv2.resize(im, (2304, 4096), interpolation=cv2.INTER_LANCZOS4)
    if len(_img_cache) > 6:
        _img_cache.clear()
    _img_cache[key] = im
    return im


# ------------------------------------------------------------------ color
def grade_luts():
    """Curva base: levanta sombras un poco, contraste medio suave, hombro en altas (ni oscuro ni brillante)."""
    x = np.arange(256, dtype=np.float32) / 255
    return x


def measure(im):
    small = cv2.resize(im, (108, 192), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    lum = small[..., 2] * 0.2126 + small[..., 1] * 0.7152 + small[..., 0] * 0.0722
    return float(np.median(lum)), small.reshape(-1, 3).mean(0)


GRADE = {  # por clip: (exposición, balance r, balance b, saturación, mezcla de sombras)
    "B1": (1.04, 1.05, 0.90, 0.92), "B2": (1.02, 1.05, 0.90, 0.90), "B3": (1.04, 1.05, 0.90, 0.92),
    "SP": (1.00, 0.98, 1.03, 1.02), "AU": (1.08, 0.98, 1.02, 1.04),
    "P1": (1.03, 1.00, 1.00, 1.03), "P2": (1.03, 1.00, 1.00, 1.03), "P3": (1.06, 1.00, 1.00, 1.04),
    "P4": (1.04, 1.00, 1.00, 1.02), "P5": (1.06, 0.99, 1.01, 1.03),
}


def tone(x):
    """Tone curve on linear-ish 0..1 display values: soft S, lifted blacks to 0.02, highlight shoulder."""
    x = np.clip(x, 0, None)
    s = x + 0.10 * np.sin(np.clip(x, 0, 1) * np.pi * 2) * 0.0  # placeholder for clarity
    # contraste suave alrededor de 0.45
    c = 0.45 + (x - 0.45) * 1.08
    # hombro: comprime por encima de 0.80 para que nada se vea "quemado"
    k = 0.80
    over = np.maximum(c - k, 0)
    c = np.where(c > k, k + (1 - k) * (1 - np.exp(-over / (1 - k))), c)
    return np.clip(0.018 + c * (1 - 0.018), 0, 1)


def grade(img_bgr, c):
    exp, rb, bb, sat = GRADE[c]
    f = img_bgr.astype(np.float32) * (1 / 255)
    f[..., 2] *= exp * rb
    f[..., 1] *= exp
    f[..., 0] *= exp * bb
    lum = f[..., 2] * 0.2126 + f[..., 1] * 0.7152 + f[..., 0] * 0.0722
    f = lum[..., None] + (f - lum[..., None]) * sat
    return tone(f)


# ------------------------------------------------------------------ geometría del plano
def place(img, z, a, extra_shift=(0, 0), out=(W, H)):
    sh, sw = img.shape[:2]
    base = max(out[0] / sw, out[1] / sh)
    s = base * z
    cw, ch = out[0] / s, out[1] / s
    cx = min(max(a[0] * sw, cw / 2), sw - cw / 2) + extra_shift[0] / s
    cy = min(max(a[1] * sh, ch / 2), sh - ch / 2) + extra_shift[1] / s
    cx = min(max(cx, cw / 2), sw - cw / 2)
    cy = min(max(cy, ch / 2), sh - ch / 2)
    M = np.float32([[s, 0, -(cx - cw / 2) * s], [0, s, -(cy - ch / 2) * s]])
    return cv2.warpAffine(img, M, out, flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT), (M, s)


def shot_at(t):
    for i, s in enumerate(EDL):
        if s["t0"] - 1e-6 <= t < s["t1"] - 1e-6:
            return i, s
    return None, None


def shot_frame(s, t, shake=(0, 0), zoom_mul=1.0):
    """Frame graded (float32 BGR 0..1) for shot s at video time t."""
    k = src_frame(s, t)
    im = load_src(s["c"], k)
    u = (t - s["t0"]) / (s["t1"] - s["t0"])
    z = (s["z"][0] + (s["z"][1] - s["z"][0]) * smooth(u * 0.85 + 0.15 * u)) * zoom_mul
    out, M = place(im, z, s["a"], shake)
    return grade(out, s["c"]), M, k


# ------------------------------------------------------------------ recursos gráficos
def load_layer(name):
    L = cv2.imread(str(LOGO / f"L_{name}.png"), cv2.IMREAD_UNCHANGED).astype(np.float32) / 65535
    return L  # BGRA


_layers = {}


def layer(name):
    if name not in _layers:
        _layers[name] = load_layer(name)
    return _layers[name]


CIRCLE = None


def circle():
    global CIRCLE
    if CIRCLE is None:
        CIRCLE = np.load(LOGO / "circle.npy")
    return CIRCLE


def over(dst, rgb, a):
    """alpha over (float)."""
    if a.ndim == 2:
        a = a[..., None]
    dst *= (1 - a)
    dst += rgb * a
    return dst


def cursor_sprite(scale=1.0):
    """Puntero de mouse clásico, blanco con contorno oscuro y sombra suave. Devuelve BGRA float + punta."""
    ss = 4
    pts = np.array([[0, 0], [0, 100], [24, 77], [41, 115], [57, 108], [40, 71], [72, 71]], np.float32)
    pts *= 1.25 * scale
    pad = 40
    w = int(pts[:, 0].max() + pad * 2)
    h = int(pts[:, 1].max() + pad * 2)
    big = np.zeros((h * ss, w * ss), np.uint8)
    inner = np.zeros_like(big)
    P = ((pts + pad) * ss).astype(np.int32)
    cv2.fillPoly(big, [P], 255, cv2.LINE_AA)
    cv2.polylines(big, [P], True, 255, int(7 * ss * scale), cv2.LINE_AA)  # contorno
    cv2.fillPoly(inner, [P], 255, cv2.LINE_AA)
    er = int(4.5 * ss * scale)
    inner = cv2.erode(inner, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (er, er)))
    big = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    inner = cv2.resize(inner, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    shadow = cv2.GaussianBlur(big, (0, 0), 9 * scale)
    shadow = np.roll(np.roll(shadow, int(8 * scale), 0), int(5 * scale), 1) * 0.45
    col = np.zeros((h, w, 3), np.float32) + 0.07  # contorno casi negro
    col = col * (1 - inner[..., None]) + np.float32([0.98, 0.98, 0.98]) * inner[..., None]
    a = np.maximum(big, shadow * (1 - big))
    col = np.where(big[..., None] > 0, col, 0)
    return np.dstack([col, a]), (pad, pad)


_cursor = None


def draw_cursor(frame, x, y, press=0.0, alpha=1.0):
    global _cursor
    if _cursor is None:
        _cursor = cursor_sprite(1.3)
    spr, (px, py) = _cursor
    sc = 1.0 - 0.12 * press
    M = np.float32([[sc, 0, x - px * sc], [0, sc, y - py * sc]])
    h, w = spr.shape[:2]
    x0, y0 = int(max(0, x - px * sc - 2)), int(max(0, y - py * sc - 2))
    x1, y1 = int(min(W, x0 + w + 4)), int(min(H, y0 + h + 4))
    if x1 <= x0 or y1 <= y0:
        return frame
    M[0, 2] -= x0
    M[1, 2] -= y0
    patch = cv2.warpAffine(spr, M, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderValue=0)
    a = patch[..., 3:4] * alpha
    frame[y0:y1, x0:x1] = frame[y0:y1, x0:x1] * (1 - a) + patch[..., :3] * a
    return frame


def ring(frame, cx, cy, r, width, color, alpha):
    if alpha <= 0.002 or r <= 0:
        return frame
    m = np.zeros((H, W), np.uint8)
    cv2.circle(m, (int(cx * 16), int(cy * 16)), int(r * 16), 255, max(1, int(width)), cv2.LINE_AA, shift=4)
    a = m.astype(np.float32) / 255 * alpha
    glow = cv2.GaussianBlur(a, (0, 0), width * 2.5) * 0.6
    a = np.clip(a + glow, 0, 1)
    return over(frame, np.float32(color), a)


def gold_bgr():
    return GOLD[::-1].copy()


# ------------------------------------------------------------------ intro (0 - 4 s)
def mosaic(img, block):
    if block <= 1:
        return img
    h, w = img.shape[:2]
    small = cv2.resize(img, (max(1, w // block), max(1, h // block)), interpolation=cv2.INTER_AREA)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)


def caret(frame, cx, cy, hgt, wid, alpha, color=None):
    if alpha <= 0:
        return frame
    color = gold_bgr() if color is None else color
    x0, x1 = int(cx - wid / 2), int(math.ceil(cx + wid / 2))
    y0, y1 = int(cy - hgt / 2), int(math.ceil(cy + hgt / 2))
    m = np.zeros((H, W), np.float32)
    m[max(0, y0):min(H, y1), max(0, x0):min(W, x1)] = 1
    glow = cv2.GaussianBlur(m, (0, 0), 14) * 0.9
    return over(frame, color, np.clip((m + glow) * alpha, 0, 1))


def arc_mask(name, prog, start_deg, direction):
    """Revela un arco (verde/rojo) barriendo el ángulo alrededor del centro del círculo: anillo de carga."""
    L = layer(name)
    cx, cy, R = circle()
    yy, xx = np.mgrid[0:H, 0:W]
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx)) - start_deg) * direction % 360
    span = 200.0
    edge = prog * span
    m = np.clip((edge - ang) / 6.0, 0, 1)
    return L, m


_angle_cache = {}


def angle_field():
    if "a" not in _angle_cache:
        cx, cy, R = circle()
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        _angle_cache["a"] = np.degrees(np.arctan2(yy - cy, xx - cx)).astype(np.float32)
        _angle_cache["r"] = np.hypot(yy - cy, xx - cx).astype(np.float32)
    return _angle_cache["a"], _angle_cache["r"]


def logo_composite(t, glow=0.0):
    """Logo armándose. Devuelve (rgb BGR float, alpha) del logo completo en el instante t (0..3)."""
    rgb = np.zeros((H, W, 3), np.float32)
    A = np.zeros((H, W), np.float32)

    def add(L, m):
        nonlocal rgb, A
        a = L[..., 3] * m
        rgb = rgb * (1 - a[..., None]) + L[..., :3] * a[..., None]
        A = A + a * (1 - A)

    cx, cy, R = circle()
    # 1) emblema dorado: "difusión" — de mosaico con ruido a nítido (0.55 - 1.65 s)
    p = (t - 0.55) / 1.10
    if p > 0:
        G = layer("gold")
        steps = [64, 40, 24, 14, 8, 4, 2, 1]
        i = min(int(p * len(steps)), len(steps) - 1)
        blk = steps[i]
        # banda de revelado vertical (entre las dos líneas de escaneo)
        span = ease_out(min((t - 0.55) / 0.45, 1), 2)
        y_top, y_bot = cy - 120 - span * 760, cy - 120 + span * 760
        band = np.zeros((H, 1), np.float32)
        band[int(max(0, y_top)):int(min(H, y_bot))] = 1
        if blk > 1:
            g = mosaic(G, blk)
            rng = np.random.default_rng(1000 + i)
            nz = rng.random((H // blk + 1, W // blk + 1)).astype(np.float32)
            nz = cv2.resize(nz, (W, H), interpolation=cv2.INTER_NEAREST)[:H, :W]
            amt = 0.55 * (1 - i / len(steps))
            ga = np.clip(g[..., 3] * (1 - amt + amt * nz * 1.6), 0, 1)
            g = np.dstack([g[..., :3] * (0.85 + 0.3 * nz[..., None]), ga])
        else:
            g = G
        add(g, np.broadcast_to(band, (H, W)))
    # 2) arcos verde y rojo: anillo de carga (1.05 - 1.75 s)
    ang, rr = angle_field()
    for name, t0, d in (("green", 1.05, 0.55), ("red", 1.18, 0.55)):
        pr = ease_io((t - t0) / d)
        if pr <= 0:
            continue
        L = layer(name)
        # el verde corre de arriba-izquierda hacia abajo; el rojo desde abajo hacia arriba-derecha
        if name == "green":
            a0 = 200.0  # grados (izquierda-arriba) recorriendo en sentido antihorario visual hacia abajo
            sweep = ((a0 - ang) % 360)
        else:
            a0 = 120.0
            sweep = ((a0 - ang) % 360)
        edge = pr * 230.0
        m = np.clip((edge - sweep) / 4.0 + 1, 0, 1) if pr < 1 else np.ones((H, W), np.float32)
        add(L, m)
    # 3) CUMBRE / MÉXICO: tecleo de izquierda a derecha con caret dorado en el borde
    carets = []
    for name, t0, d in (("t_cumbre", 1.45, 0.36), ("t_mexico", 1.66, 0.36)):
        pr = (t - t0) / d
        if pr <= 0:
            continue
        L = layer(name)
        ys, xs = np.where(L[..., 3] > 0.3)
        x0, x1 = xs.min() - 10, xs.max() + 20
        ex = x0 + (x1 - x0) * ease_out(pr, 2)
        xx = np.arange(W, dtype=np.float32)[None, :]
        m = np.clip((ex - xx) / 18.0, 0, 1)
        add(L, np.broadcast_to(m, (H, W)))
        if pr < 1.25:
            carets.append((ex + 14, (ys.min() + ys.max()) / 2, ys.max() - ys.min() + 24, 1 - smooth((pr - 1.0) / 0.25)))
    # 4) subtítulos y CDMX: suben y se enfocan
    for name, t0 in (("t_sub1", 1.95), ("t_sub2", 2.05), ("t_cdmx", 2.18)):
        pr = ease_out((t - t0) / 0.40, 3)
        if pr <= 0:
            continue
        L = layer(name)
        dy = (1 - pr) * 26
        Ls = np.roll(L, int(round(dy)), 0)
        if pr < 1:
            Ls = cv2.GaussianBlur(Ls, (0, 0), max(0.1, (1 - pr) * 6))
        add(Ls, np.full((H, W), pr, np.float32))
    if glow > 0:
        bloom = cv2.GaussianBlur(rgb * A[..., None], (0, 0), 30) * glow
        rgb = rgb + bloom
    return rgb, A, carets


def background(t):
    """Negro profundo con un halo cálido muy tenue detrás del emblema."""
    cx, cy, R = circle()
    ang, rr = angle_field()
    k = smooth((t - 0.5) / 1.5)
    halo = np.exp(-(rr / 1300.0) ** 2) * 0.055 * k
    bg = np.empty((H, W, 3), np.float32)
    base = 0.012
    for i, cval in enumerate(gold_bgr()):
        bg[..., i] = base + halo * cval
    return bg


# cursor de la intro: entra por abajo a la derecha y aterriza en el emblema
CLICK_T = 3.0
CUR_TARGET = (1092.0, 1150.0)


def intro_cursor_pos(t):
    p0 = np.array([2050.0, 3350.0])
    p1 = np.array([1650.0, 1500.0])  # punto de control (curva)
    p2 = np.array(CUR_TARGET)
    u = ease_out((t - 1.95) / 0.75, 3)
    pos = (1 - u) ** 2 * p0 + 2 * (1 - u) * u * p1 + u ** 2 * p2
    # micro-movimiento de "hover" antes del click
    if t > 2.70:
        w = smooth((t - 2.70) / 0.25)
        pos = pos + np.array([math.sin(t * 9) * 3, -6 * w])
    return pos


def intro_frame(t):
    frame = background(t)
    cx, cy, R = circle()
    # caret parpadeando (0 - 0.45) -> se estira en línea de escaneo (0.45 - 0.62) -> se abre en dos líneas
    if t < 0.45:
        on = 1.0 if (t < 0.18 or 0.30 <= t) else 0.0
        frame = caret(frame, cx, cy - 120, 120, 12, on)
    elif t < 1.05:
        u = ease_out((t - 0.45) / 0.17, 3)
        wid = 12 + u * 1300
        hgt = 120 - u * 114
        split = ease_out(min(max((t - 0.55) / 0.45, 0), 1), 2) * 760
        fade = 1 - smooth((t - 0.85) / 0.20)
        if split < 2:
            frame = caret(frame, cx, cy - 120, hgt, wid, 1.0)
        else:
            frame = caret(frame, cx, cy - 120 - split, 5, wid, fade)
            frame = caret(frame, cx, cy - 120 + split, 5, wid, fade)
    hover = smooth((t - 2.6) / 0.35)
    click_flash = math.exp(-max(0, t - CLICK_T) / 0.10) if t >= CLICK_T else 0.0
    rgb, A, carets = logo_composite(t, glow=0.18 * hover + 0.9 * click_flash)
    frame = frame * (1 - A[..., None]) + rgb * A[..., None] if False else over(frame, rgb, A)
    for (x, y, h, a) in carets:
        frame = caret(frame, x, y, h, 10, a)
    return frame


def portal_frame(t, footage):
    """3.0 - 4.0 s: tras el click el círculo del emblema se vuelve ventana hacia el evento y la cámara lo atraviesa."""
    cx, cy, R = circle()
    u = (t - CLICK_T) / 1.0
    # radio de la ventana: abre dentro del anillo y luego crece acelerando hasta cubrir el cuadro
    r_in = R * 0.92 * ease_out(min(u / 0.16, 1), 3)
    grow = ease_in(max(u - 0.12, 0) / 0.88, 3)
    r = r_in + grow * 3600
    zoom = 1 + grow * 5.5  # empuje de cámara a través del logo
    # logo escalado alrededor del centro del círculo
    rgb, A, _ = logo_composite(3.0, glow=0.9 * math.exp(-max(0, u) / 0.10) + 0.18)
    M = np.float32([[zoom, 0, cx - cx * zoom], [0, zoom, cy - cy * zoom]])
    rgbA = np.dstack([rgb * A[..., None], A])
    rgbA = cv2.warpAffine(rgbA, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)
    if grow > 0.02:
        rgbA = cv2.GaussianBlur(rgbA, (0, 0), 1 + grow * 18)
    fade = 1 - smooth((u - 0.16) / 0.30)
    frame = background(3.0)
    # ventana circular con borde suave + leve aberración en el borde
    ang, rr = angle_field()
    m = np.clip((r - rr) / 6.0, 0, 1)
    frame = over(frame, footage, m)
    # anillo dorado fino en el borde de la ventana
    frame = ring(frame, cx, cy, r, 5, gold_bgr() * 1.1, (1 - grow) * 0.85 * smooth(u / 0.08))
    a = rgbA[..., 3] * fade
    col = rgbA[..., :3] / np.maximum(rgbA[..., 3:4], 1e-4)
    frame = over(frame, col, a)
    return frame


# ------------------------------------------------------------------ efectos de transición / plano
def motion_blur(img, length, horizontal=True):
    n = max(1, int(length))
    if n < 2:
        return img
    k = np.zeros((1, n) if horizontal else (n, 1), np.float32)
    k[:] = 1.0 / n
    return cv2.filter2D(img, -1, k, borderType=cv2.BORDER_REFLECT)


def rgb_split(img, px):
    if px < 1:
        return img
    out = img.copy()
    out[..., 2] = np.roll(img[..., 2], int(px), 1)
    out[..., 0] = np.roll(img[..., 0], -int(px), 1)
    return out


def slices(img, seed, amp):
    rng = np.random.default_rng(seed)
    out = img.copy()
    y = 0
    while y < H:
        hgt = int(rng.integers(40, 260))
        if rng.random() < 0.45:
            out[y:y + hgt] = np.roll(img[y:y + hgt], int(rng.normal(0, amp)), 1)
        y += hgt
    return out


def scanline(frame, y, strength):
    """Línea dorada de escaneo con estela: guiño a visión por computadora."""
    if strength <= 0:
        return frame
    yy = np.arange(H, dtype=np.float32)[:, None]
    core = np.exp(-((yy - y) / 3.0) ** 2)
    trail = np.where(yy < y, np.exp(-(y - yy) / 220.0), 0) * 0.10
    a = np.clip((core + trail) * strength, 0, 1)
    a = np.broadcast_to(a, (H, W))
    lift = frame + (np.where(yy < y, 1, 0) * np.exp(-np.abs(yy - y) / 400.0) * 0.06 * strength)[..., None]
    return over(lift, gold_bgr() * 1.15, a * 0.85)


_vign = None
_grain = None


def finish(frame, fidx):
    global _vign, _grain
    if _vign is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.70)) ** 2)
        _vign = (1 - 0.16 * np.clip(d, 0, 1.4) ** 2.2)[..., None].astype(np.float32)
        rng = np.random.default_rng(7)
        _grain = [cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.7) for _ in range(4)]
    frame = frame * _vign
    g = _grain[fidx % 4]
    lum = frame.mean(2, keepdims=True)
    frame = frame + g[..., None] * 0.012 * (0.4 + 0.6 * np.clip(1 - np.abs(lum - 0.45) * 1.6, 0, 1))
    return np.clip(frame, 0, 1)


# ------------------------------------------------------------------ seguimiento de rostro (guiño IA)
def face_track(shot):
    """Caja del rostro por frame (coords de salida) con Haar + suavizado. Se guarda en cache."""
    f0, f1 = int(round(shot["t0"] * FPS)), int(round(shot["t1"] * FPS))
    p = SC / f"track_{shot['c']}_{f0}.json"
    if p.exists():
        return {int(k): v for k, v in json.loads(p.read_text()).items()}
    det = cv2.FaceDetectorYN.create(str(SC.parent / "models" / "yunet.onnx"), "", (W // 4, H // 4), 0.6)
    boxes = {}
    for f in range(f0, f1):
        t = f / FPS
        k = src_frame(shot, t)
        im = load_src(shot["c"], k)
        u = (t - shot["t0"]) / (shot["t1"] - shot["t0"])
        z = shot["z"][0] + (shot["z"][1] - shot["z"][0]) * smooth(u * 0.85 + 0.15 * u)
        out, (M, s) = place(im, z, shot["a"])
        small = cv2.resize(out, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        _, fs = det.detect(small)
        if fs is not None and len(fs):
            x, y, w, h = max(fs, key=lambda b: b[2] * b[3])[:4]
            boxes[f] = [float(x) * 4, float(y) * 4, float(w) * 4, float(h) * 4]
    # rellenar y suavizar
    keys = sorted(boxes)
    if not keys:
        return {}
    arr = np.array([[f] + boxes[f] for f in keys], np.float32)
    res = {}
    for f in range(f0, f1):
        v = [np.interp(f, arr[:, 0], arr[:, j]) for j in range(1, 5)]
        res[f] = v
    for j in range(4):  # media móvil
        vals = np.array([res[f][j] for f in range(f0, f1)])
        ker = np.ones(7) / 7
        sm = np.convolve(np.pad(vals, 3, mode="edge"), ker, mode="valid")
        for i, f in enumerate(range(f0, f1)):
            res[f][j] = float(sm[i])
    p.write_text(json.dumps(res))
    return res


def brackets(frame, box, prog, alpha):
    """Esquinas doradas que se cierran sobre el rostro y se fijan."""
    if alpha <= 0:
        return frame
    x, y, w, h = box
    pad = 0.30
    x -= w * pad
    y -= h * pad
    w *= 1 + 2 * pad
    h *= 1 + 2 * pad
    k = 1 + 0.9 * (1 - ease_out(prog, 3))  # llega desde más grande
    cx, cy = x + w / 2, y + h / 2
    w, h = w * k, h * k
    x, y = cx - w / 2, cy - h / 2
    L = min(w, h) * 0.20
    m = np.zeros((H, W), np.uint8)
    th = 6
    sh = 4
    def ln(p, q):
        cv2.line(m, (int(p[0] * 16), int(p[1] * 16)), (int(q[0] * 16), int(q[1] * 16)), 255, th, cv2.LINE_AA, shift=sh)
    for (px, py, dx, dy) in ((x, y, 1, 1), (x + w, y, -1, 1), (x, y + h, 1, -1), (x + w, y + h, -1, -1)):
        ln((px, py), (px + dx * L, py))
        ln((px, py), (px, py + dy * L))
    # mira central mínima
    c = 14
    ln((cx - c, cy), (cx + c, cy))
    ln((cx, cy - c), (cx, cy + c))
    a = m.astype(np.float32) / 255
    a = np.clip(a + cv2.GaussianBlur(a, (0, 0), 8) * 0.7, 0, 1) * alpha
    return over(frame, gold_bgr() * 1.1, a)


# ------------------------------------------------------------------ textos
# Un plano con texto y el siguiente sin texto; frases cortas, tono político e inspirador.
# Estilo: Montserrat (la tipografía del logo), línea ligera + línea en negrita con la palabra clave en dorado.
FONT = SC.parent / "fonts" / "Montserrat-VF.ttf"
TEXTS = [
    dict(t0=5.62, t1=7.42, lines=[[("Compartiendo", "l")], [("nuestra", "b"), ("visión", "g")]]),
    dict(t0=10.12, t1=12.42, lines=[[("Ideas para", "l")], [("cambiar", "b"), ("México", "g")]]),
    dict(t0=20.12, t1=21.92, lines=[[("Abrimos", "l")], [("nuevos", "b"), ("diálogos", "g")]]),
    dict(t0=26.08, t1=27.95, lines=[[("La nueva forma", "l")], [("de hacer", "b"), ("política", "g")]]),
    dict(t0=34.12, t1=35.70, cy=0.205 * H, lines=[[("Esto apenas", "l")], [("comienza", "g")]]),  # arriba: zona limpia de la foto
]
TX_X = 170            # margen izquierdo
TX_CY = 0.635 * H     # centro vertical del bloque (fuera de la zona de botones de Reels/TikTok)
SIZE = {"l": 118, "b": 150, "g": 150}
WEIGHT = {"l": 300, "b": 800, "g": 800}
_word_cache = {}


def word_sprite(word, style):
    """Palabra como sprite BGRA float (blanco o dorado) con sombra suave para leerse sobre cualquier toma."""
    key = (word, style)
    if key in _word_cache:
        return _word_cache[key]
    from PIL import Image, ImageDraw, ImageFont
    f = ImageFont.truetype(str(FONT), SIZE[style])
    f.set_variation_by_axes([WEIGHT[style]])
    asc, desc = f.getmetrics()
    w = int(math.ceil(f.getlength(word))) + 8
    h = asc + desc + 8
    im = Image.new("L", (w, h), 0)
    ImageDraw.Draw(im).text((4, 4), word, font=f, fill=255)
    a = np.asarray(im, np.float32) / 255
    col = gold_bgr() * 1.08 if style == "g" else np.float32([0.97, 0.97, 0.97])
    spr = (np.dstack([np.broadcast_to(col, (h, w, 3)), a]).astype(np.float32), asc)
    _word_cache[key] = spr
    return spr


def text_layout(item):
    """Posiciones (x, y_top) de cada palabra y alto de cada línea."""
    out, y = [], 0.0
    lh = []
    for line in item["lines"]:
        hmax = max(SIZE[st] for _, st in line)
        lh.append(hmax * 1.08)
    total = sum(lh)
    cy = item.get("cy", TX_CY)
    y = cy - total / 2
    for li, line in enumerate(item["lines"]):
        x = TX_X
        base = y + lh[li] * 0.86
        for word, st in line:
            spr, asc = word_sprite(word, st)
            out.append((li, word, st, x, base - asc - 4, spr))
            x += spr.shape[1] - 8 + SIZE[st] * 0.26
        y += lh[li]
    return out, cy - total / 2, total


def text_layer(frame, t):
    for item in TEXTS:
        if not (item["t0"] <= t < item["t1"] + 0.01):
            continue
        u_in = t - item["t0"]
        u_out = item["t1"] - t
        words, top, total = text_layout(item)
        cy = top + total / 2
        # sombra/viñeta local muy suave detrás del bloque (sin cajas)
        a_blk = smooth(u_in / 0.25) * smooth(u_out / 0.25)
        yy, xx = np.ogrid[0:H, 0:W]
        g = np.exp(-(((xx - TX_X - 380) / 900.0) ** 2 + ((yy - cy) / (total * 0.9 + 160)) ** 2)).astype(np.float32)
        frame = frame * (1 - 0.38 * a_blk * g[..., None])
        # barra dorada corta que se dibuja sobre el bloque
        bw = 120 * ease_out(u_in / 0.35, 3) * smooth(u_out / 0.20)
        if bw > 1:
            y0 = int(top - 46)
            frame[y0:y0 + 8, TX_X:TX_X + int(bw)] = frame[y0:y0 + 8, TX_X:TX_X + int(bw)] * 0.1 + gold_bgr() * 1.1 * 0.9
        for n, (li, word, st, x, y, spr) in enumerate(words):
            d_in = 0.07 * n
            p_in = ease_out((u_in - d_in) / 0.45, 4)
            p_out = ease_in((0.30 - u_out + 0.03 * n) / 0.30, 2) if u_out < 0.30 + 0.03 * n else 0.0
            if p_in <= 0:
                continue
            h, w = spr.shape[:2]
            # la palabra sube desde detrás de una línea de corte (máscara) y sale hacia arriba
            dy = (1 - p_in) * h * 0.9 - p_out * h * 0.9
            yi = int(round(y + dy))
            xi = int(round(x))
            clip_top, clip_bot = int(y) - 2, int(y) + h + 2
            y0, y1 = max(yi, clip_top, 0), min(yi + h, clip_bot, H)
            x0, x1 = max(xi, 0), min(xi + w, W)
            if y1 <= y0 or x1 <= x0:
                continue
            sub = spr[y0 - yi:y1 - yi, x0 - xi:x1 - xi]
            a = sub[..., 3:4] * (1 - p_out)
            # sombra
            sh = cv2.GaussianBlur(sub[..., 3], (0, 0), 10)[..., None] * 0.45 * (1 - p_out)
            region = frame[y0:y1, x0:x1]
            region = region * (1 - sh)
            frame[y0:y1, x0:x1] = region * (1 - a) + sub[..., :3] * a
    return frame


# ------------------------------------------------------------------ photo dump
PHOTO_DIR = SC / "photos"
PHOTOS = [  # una foto por beat; solo la última lleva texto
    dict(t0=31.5, t1=32.5, n=1), dict(t0=32.5, t1=33.0, n=2), dict(t0=33.0, t1=33.5, n=3),
    dict(t0=33.5, t1=34.0, n=4), dict(t0=34.0, t1=36.0, n=5),
]
_photos = {}


def load_photo(n):
    if n in _photos:
        return _photos[n]
    from PIL import Image, ImageOps
    cands = sorted(PHOTO_DIR.glob(f"{n}.*"))
    if not cands:
        im = np.full((H, W, 3), 30, np.uint8)  # marcador mientras llegan las fotos
        cv2.putText(im, f"FOTO {n}", (600, 1900), cv2.FONT_HERSHEY_SIMPLEX, 6, (120, 120, 120), 12)
        _photos[n] = ("cover", im)
        return _photos[n]
    pim = ImageOps.exif_transpose(Image.open(cands[0])).convert("RGB")
    a = np.asarray(pim)[:, :, ::-1].copy()
    mode = "cover" if a.shape[1] / a.shape[0] < 0.75 else "framed"
    _photos[n] = (mode, a)
    return _photos[n]


def photo_frame(t):
    ph = next(p for p in PHOTOS if p["t0"] - 1e-6 <= t < p["t1"] - 1e-6)
    u = t - ph["t0"]
    d = ph["t1"] - ph["t0"]
    mode, img = load_photo(ph["n"])
    pop = 1 + 0.10 * (1 - ease_out(u / 0.18, 3))       # entra con un pequeño golpe de escala
    drift = 1.0 + 0.05 * (u / max(d, 0.5))              # y sigue acercándose suave
    if img.dtype != np.float32:
        if mode == "cover":
            out, _ = place(img, pop * drift, (0.5, 0.45))
            frame = tone(out.astype(np.float32) / 255 * 1.02)
        else:
            # foto horizontal: fondo desenfocado de la misma foto + foto completa encima
            bg, _ = place(img, 1.0, (0.5, 0.5))
            bg = cv2.GaussianBlur(bg, (0, 0), 40).astype(np.float32) / 255 * 0.45
            fw = int(W * 0.92 * pop * drift)
            fh = int(fw * img.shape[0] / img.shape[1])
            fg = cv2.resize(img, (fw, fh), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
            x0, y0 = (W - fw) // 2, int(H * 0.40 - fh / 2)
            frame = bg
            xs, ys = max(0, x0), max(0, y0)
            frame[ys:ys + fh, xs:xs + fw] = fg[ys - y0:ys - y0 + min(fh, H - ys), xs - x0:xs - x0 + min(fw, W - xs)]
            frame = tone(frame)
    else:
        frame = img.copy()
    # destello breve de cámara al entrar cada foto
    frame = frame + 0.30 * math.exp(-u / 0.05)
    return frame


# ------------------------------------------------------------------ cortinilla final
BLIND_T0, CARD_T = 35.55, 36.0


def blinds(frame, t):
    """Persianas negras que entran alternando lados, escalonadas desde el centro, con un filo dorado fino."""
    if t < BLIND_T0:
        return frame
    n = 8
    hb = H / n
    out = frame
    xx = np.arange(W, dtype=np.float32)[None, :]
    for i in range(n):
        order = abs(i - (n - 1) / 2)  # del centro hacia afuera
        t0 = BLIND_T0 + order * 0.045
        p = ease_io((t - t0) / 0.26)
        if p <= 0:
            continue
        y0, y1 = int(round(i * hb)), int(round((i + 1) * hb))
        if i % 2 == 0:
            edge = p * (W + 60) - 30
            m = np.clip((edge - xx) / 26.0, 0, 1)
            line = np.exp(-((xx - edge) / 3.0) ** 2)
        else:
            edge = W - p * (W + 60) + 30
            m = np.clip((xx - edge) / 26.0, 0, 1)
            line = np.exp(-((xx - edge) / 3.0) ** 2)
        band = out[y0:y1]
        band = band * (1 - m[..., None]) + 0.008 * m[..., None]
        la = (line * 0.75 * (1 - p))[..., None]
        band = band * (1 - la) + gold_bgr() * 1.1 * la
        out[y0:y1] = band
    return out


_emblem = None


def emblem_rgba():
    """Emblema (figura dorada + arcos) sin texto, centrado en el cuadro."""
    global _emblem
    if _emblem is None:
        rgb = np.zeros((H, W, 3), np.float32)
        A = np.zeros((H, W), np.float32)
        for name in ("gold", "green", "red"):
            L = layer(name)
            a = L[..., 3]
            rgb = rgb * (1 - a[..., None]) + L[..., :3] * a[..., None]
            A = A + a * (1 - A)
        cx, cy, R = circle()
        dy = H * 0.46 - 1120.0  # centro visual del emblema -> centro del cuadro
        M = np.float32([[1, 0, 0], [0, 1, dy]])
        _emblem = cv2.warpAffine(np.dstack([rgb * A[..., None], A]), M, (W, H), flags=cv2.INTER_LINEAR)
    return _emblem


def endcard(t):
    frame = np.full((H, W, 3), 0.008, np.float32)
    u = t - CARD_T
    p = ease_out((u - 0.12) / 0.80, 3)
    if p <= 0:
        return frame
    E = emblem_rgba()
    cy = H * 0.46
    k = (1.06 - 0.06 * p) * 1.22
    M = np.float32([[k, 0, W / 2 - W / 2 * k], [0, k, cy - cy * k]])
    E = cv2.warpAffine(E, M, (W, H), flags=cv2.INTER_LINEAR)
    if p < 1:
        E = cv2.GaussianBlur(E, (0, 0), 0.3 + 7 * (1 - p))
    # revelado diagonal + brillo que recorre el emblema
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = (xx * 0.55 + yy) / (W * 0.55 + H)  # 0 arriba-izquierda -> 1 abajo-derecha
    d = (d - 0.18) / 0.45
    reveal = np.clip((p * 1.4 - d) / 0.25, 0, 1)
    sweep_c = -0.3 + 1.6 * ease_io((u - 0.45) / 0.9)
    shine = np.exp(-((d - sweep_c) / 0.06) ** 2) * 0.55 * (1 - smooth((u - 1.3) / 0.2))
    a = E[..., 3] * reveal
    col = E[..., :3] / np.maximum(E[..., 3:4], 1e-4)
    col = col + shine[..., None] * (gold_bgr() * 0.5 + 0.5)
    glow = cv2.GaussianBlur(a, (0, 0), 40) * 0.25 * p
    frame = over(frame, gold_bgr() * 0.6, np.clip(glow, 0, 1))
    frame = over(frame, col, a)
    return frame * (1 - smooth((t - (CARD_T + 2.05)) / 0.42))


# ------------------------------------------------------------------ frame
def render_frame(fidx):
    t = tl(fidx)
    if t < CLICK_T:
        return finish(intro_frame(t), fidx)
    i, s = shot_at(t)
    if s is None:
        if t < CARD_T:  # photo dump (+ persianas sobre la última foto)
            frame = photo_frame(t)
            frame = text_layer(frame, t)
            return finish(blinds(frame, t), fidx)
        return finish(endcard(t), fidx)
    u = t - s["t0"]
    shake = (0, 0)
    zoom_mul = 1.0
    tr = s["tr"]
    # golpes de cámara en transiciones
    if tr == "punch" and u < 0.25:
        zoom_mul = 1 + 0.10 * (1 - ease_out(u / 0.25, 3))
    if (tr == "flash" or (i == 0 and t >= 4.0)) and u < 0.3:
        uu = u if i else t - 4.0
        if uu < 0.3:
            amp = 18 * math.exp(-uu / 0.08)
            shake = (amp * math.sin(uu * 90), amp * math.cos(uu * 70))
    frame, M, k = shot_frame(s, t, shake, zoom_mul)
    if i == 0 and t < 4.0:
        frame = portal_frame(t, frame)
    # ---- efectos de entrada
    if tr == "flash" and u < 0.20:
        frame = frame + (gold_bgr() * 0.35 + 0.65) * (0.55 * math.exp(-u / 0.05))
    if i == 0 and 4.0 <= t < 4.25:
        frame = frame + (gold_bgr() * 0.35 + 0.65) * (0.35 * math.exp(-(t - 4.0) / 0.05))
    if tr == "whip" and u < 0.12:
        frame = motion_blur(frame, 90 * (1 - u / 0.10)) if u < 0.10 else frame
    if tr == "glitch" and u < 0.10:
        n = int(u * FPS)
        frame = slices(rgb_split(frame, 22 - n * 9), 31 + fidx, 60 - n * 25)
    if tr == "mosaic" and u < 0.24:
        steps = [48, 24, 12, 6, 3, 1, 1, 1]
        b = steps[min(int(u * FPS), len(steps) - 1)]
        frame = mosaic(frame, b)
    if tr == "scan" and u < 0.40:
        frame = scanline(frame, -40 + ease_io(u / 0.40) * (H + 80), 1.0)
    # ---- salida en whip: el plano anterior se barre al irse
    nxt = EDL[i + 1] if i + 1 < len(EDL) else None
    if nxt and nxt["tr"] == "whip" and s["t1"] - t <= 0.07:
        frame = motion_blur(frame, 90 * (1 - (s["t1"] - t) / 0.07 * 0.5))
    if nxt and nxt["tr"] == "glitch" and s["t1"] - t <= 0.034:
        frame = rgb_split(frame, 12)
    # ---- seguimiento de rostro (solo en la presentación del ponente)
    if s.get("fx") == "track":
        tr_ = face_track(s)
        if fidx in tr_:
            prog = u / 0.35
            a = smooth(u / 0.12) * (1 - smooth((u - 1.55) / 0.30))
            frame = brackets(frame, tr_[fidx], prog, a)
    frame = text_layer(frame, t)
    # cursor de la intro desapareciendo tras el click + onda dorada
    if t < 3.6:
        cx, cy = CUR_TARGET
        ur = (t - CLICK_T) / 0.55
        frame = ring(frame, cx, cy, 30 + ease_out(ur, 3) * 520, 6, gold_bgr() * 1.15, (1 - ur) * 0.9)
        pos = intro_cursor_pos(t)
        press = 1.0 if t < CLICK_T + 0.165 else 0.0
        frame = draw_cursor(frame, pos[0], pos[1], press, 1 - smooth((t - 3.17) / 0.20))
    return finish(frame, fidx)


def render_intro_cursor(frame, t):
    if 1.95 <= t < CLICK_T:
        pos = intro_cursor_pos(t)
        frame = draw_cursor(frame, pos[0], pos[1], 0.0, smooth((t - 1.95) / 0.10))
    return frame


_render_frame = render_frame


def render(fidx):
    t = tl(fidx)
    fr = _render_frame(fidx)
    if t < CLICK_T:
        fr = render_intro_cursor(fr, t)
    return fr


def to8(frame):
    return (np.clip(frame, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    cmd = sys.argv[1]
    check_no_repeats()
    if cmd == "cache":
        build_cache()
    elif cmd == "snap":
        out = SC / "snaps"
        out.mkdir(exist_ok=True)
        for v in sys.argv[2:]:
            f = int(round(float(v) / SPEED * FPS))  # v en tiempo de línea
            img = to8(render(f))
            cv2.imwrite(str(out / f"s_{float(v):06.2f}.jpg"), cv2.resize(img, (540, 960), interpolation=cv2.INTER_AREA))
            cv2.imwrite(str(out / f"full_{float(v):06.2f}.png"), img)
            print("snap", v)
    elif cmd == "video":
        a = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        b = int(sys.argv[3]) if len(sys.argv) > 3 else NFR
        out = SC / f"video_{a:04d}_{b:04d}.mkv"
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                              "-r", str(FPS), "-i", "-", "-c:v", "ffv1", "-level", "3", "-threads", "4", str(out)],
                             stdin=subprocess.PIPE)
        import time
        t0 = time.time()
        for f in range(a, b):
            p.stdin.write(to8(render(f)).tobytes())
            if f % 15 == 0:
                print(f, f"{time.time() - t0:.0f}s", flush=True)
        p.stdin.close()
        p.wait()
        print("OK", out)


if __name__ == "__main__":
    main()
