#!/usr/bin/env python3
"""Teaser SOMOS — motor de render (estudio, claqueta→pleca, montaje, efectos y post).

Uso:
  python3 teaser.py slots                 # extrae los fragmentos del EDL desde work/mezz
  python3 teaser.py still 5.6 7.0 ...     # cuadros sueltos a work/stills (revisión)
  python3 teaser.py render [--preview]    # video sin audio a renders/
"""
import json
import math
import os
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

import fx
from fx import PINK, WHITE, clamp01, lin, smooth, ease_in, ease_out, ease_in_out, ease_out_back, env_hit

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"
SLOTS_DIR = WORK / "slots"
MEZZ = WORK / "mezz"
OUT = ROOT / "renders"
FONT = ROOT / "assets" / "fonts"

PREVIEW = os.environ.get("TEASER_PREVIEW") == "1"
W, H = (1080, 1920) if PREVIEW else (2160, 3840)
S = W / 1080.0  # px por unidad de diseño (diseño en 1080x1920)
FPS = 30
TOTAL = 35.0
NFRAMES = int(round(TOTAL * FPS))


def fr(t):
    """Redondea un tiempo al cuadro exacto."""
    return round(t * FPS) / FPS


# ------------------------------------------------------------------ tiempos (música desde 2.30 s)
MUSIC_OFFSET = 2.30
T_LIGHTS = [fr(0.32), fr(2.04), fr(3.76)]  # golpes de la intro = encendido de reflectores
T_CLAP1 = fr(5.48)  # entra la batería
T_ZOOM0, T_ZOOM1 = fr(6.78), fr(7.20)
T_M1 = fr(7.20)
T_BREAK = fr(18.99)
T_M2 = fr(22.41)
T_HUGE = fr(24.33)
T_END = fr(30.30)
T_CLAP2 = fr(31.18)
T_TEXT = fr(32.05)
T_OFF = fr(33.75)

# Golpes para sacudida/aberración (tiempo, fuerza)
HITS = [(T_CLAP1, 1.0), (fr(8.89), 0.45), (fr(12.33), 0.35), (fr(14.05), 0.3), (fr(15.74), 0.5),
        (T_M2, 0.55), (T_HUGE, 1.0), (fr(27.77), 0.55), (T_CLAP2, 0.8), (fr(32.47), 0.8)]

PRE, POST = 0.6, 0.6
CORT = 0.22  # media duración de la cortinilla  # márgenes extraídos alrededor de cada fragmento

# ------------------------------------------------------------------ EDL
# clips: A=IMG_8097 B=IMG_8114(solo pantalla) C=IMG_8115 D=IMG_8120 E=163428 F=163233 G=163217
#        H=170555 I=171755 J=IMG_8111
# (inicio, fin, clip, entrada, velocidad, transición de entrada, movimiento(z0, z1, cx, cy, dx, dy))
EDL = [
    # --- Montaje 1 (cortes en compases: 1.72 s / 0.86 s)
    (T_M1, fr(8.89), "A", 0.30, 1.0, "zoomO", (1.30, 1.04, 0.5, 0.5, 0, 0)),
    (fr(8.89), fr(9.76), "E", 2.40, 1.0, "flash", (1.10, 1.02, 0.6, 0.35, 0, 0)),
    (fr(9.76), fr(10.63), "H", 1.20, 1.0, "whip", (1.08, 1.16, 0.45, 0.5, 0, 0)),
    (fr(10.63), fr(11.48), "B", 11.2, 1.0, "zoom", (1.05, 1.18, 0.5, 0.42, 0, 0)),
    (fr(11.48), fr(12.33), "D", 9.40, 1.0, "whip", (1.12, 1.04, 0.5, 0.45, 0, 0)),
    (fr(12.33), fr(13.19), "G", 0.60, 1.0, "logo", (1.04, 1.12, 0.5, 0.6, 0, 0)),
    (fr(13.19), fr(14.05), "A", 5.20, 1.0, "leak", (1.15, 1.06, 0.55, 0.45, 0, 0)),
    # redoble: cortes de 0.21 s
    (fr(14.05), fr(14.26), "C", 1.00, 1.0, "flash", (1.10, 1.14, 0.5, 0.5, 0, 0)),
    (fr(14.26), fr(14.47), "F", 4.60, 1.0, "glitch", (1.10, 1.14, 0.5, 0.4, 0, 0)),
    (fr(14.47), fr(14.68), "B", 13.0, 1.0, "cut", (1.25, 1.30, 0.5, 0.42, 0, 0)),
    (fr(14.68), fr(14.89), "J", 1.20, 1.0, "flash", (1.05, 1.10, 0.5, 0.45, 0, 0)),
    (fr(14.89), fr(15.10), "D", 10.6, 1.0, "glitch", (1.10, 1.14, 0.5, 0.5, 0, 0)),
    (fr(15.10), fr(15.31), "E", 5.60, 1.0, "cut", (1.10, 1.14, 0.6, 0.3, 0, 0)),
    (fr(15.31), fr(15.52), "G", 2.60, 1.0, "flash", (1.10, 1.16, 0.5, 0.6, 0, 0)),
    (fr(15.52), fr(15.74), "H", 3.20, 1.0, "glitch", (1.20, 1.26, 0.45, 0.5, 0, 0)),
    (fr(15.74), fr(17.07), "C", 4.70, 0.85, "zoom", (1.22, 1.08, 0.55, 0.5, 0, 0)),
    (fr(17.07), T_BREAK, "F", 3.40, 1.0, "whip", (1.04, 1.12, 0.65, 0.35, 0, 0)),
    # --- Quiebre: cámara lenta, oscuro, misterio
    (T_BREAK, fr(20.71), "J", 6.40, 0.55, "dip", (1.10, 1.20, 0.55, 0.5, 0, 0)),
    (fr(20.71), T_M2, "B", 12.2, 0.6, "leak", (1.10, 1.32, 0.5, 0.40, 0, 0)),
    # --- Montaje 2: escalada
    (T_M2, fr(23.06), "I", 1.00, 1.0, "flash", (1.18, 1.08, 0.45, 0.5, 0, 0)),
    (fr(23.06), fr(23.71), "B", 14.4, 1.0, "whip", (1.10, 1.22, 0.5, 0.42, 0, 0)),
    (fr(23.71), T_HUGE, "D", 1.20, 1.0, "glitch", (1.08, 1.16, 0.5, 0.45, 0, 0)),
    (T_HUGE, fr(24.98), "C", 15.4, 1.0, "strobe", (1.16, 1.06, 0.5, 0.5, 0, 0)),
    (fr(24.98), fr(25.40), "A", 9.20, 1.0, "whip", (1.10, 1.16, 0.55, 0.45, 0, 0)),
    (fr(25.40), fr(25.84), "E", 7.00, 1.0, "flash", (1.06, 1.14, 0.6, 0.4, 0, 0)),
    (fr(25.84), fr(26.49), "J", 2.40, 1.0, "zoom", (1.15, 1.05, 0.5, 0.45, 0, 0)),
    (fr(26.49), fr(27.14), "G", 3.80, 1.0, "whip", (1.06, 1.16, 0.5, 0.6, 0, 0)),
    (fr(27.14), fr(27.77), "C", 17.4, 1.0, "glitch", (1.10, 1.18, 0.5, 0.5, 0, 0)),
    (fr(27.77), fr(28.42), "F", 6.20, 1.0, "flash", (1.20, 1.06, 0.6, 0.35, 0, 0)),
    (fr(28.42), fr(29.07), "B", 15.2, 1.0, "zoom", (1.12, 1.30, 0.5, 0.42, 0, 0)),
    (fr(29.07), fr(29.74), "H", 4.40, 1.0, "whip", (1.08, 1.18, 0.45, 0.5, 0, 0)),
    (fr(29.74), T_END, "C", 19.0, 0.7, "glitch", (1.10, 1.30, 0.5, 0.5, 0, 0)),
]


# ------------------------------------------------------------------ utilidades de recursos
def font(weight, px):
    return ImageFont.truetype(str(FONT / f"HindSiliguri-{weight}.ttf"), int(round(px)))


def text_rgba(text, weight, size_d, tracking=0.0, color=(255, 255, 255)):
    """Texto blanco a RGBA float con interletrado (`tracking` en em)."""
    f = font(weight, size_d * S)
    sp = tracking * size_d * S
    widths = [f.getlength(c) for c in text]
    tw = int(sum(widths) + sp * (len(text) - 1)) + 8
    asc, desc = f.getmetrics()
    img = Image.new("RGBA", (tw, asc + desc + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 4
    for c, w in zip(text, widths):
        d.text((x, 4), c, font=f, fill=color + (255,))
        x += w + sp
    a = np.asarray(img).astype(np.float32) / 255.0
    return a


@lru_cache(None)
def logo_alpha_hi():
    """Alfa del logotipo vectorial (6K) recortado a su caja."""
    im = cv2.imread(str(ROOT / "assets" / "brand" / "somos-logo-6k.png"), cv2.IMREAD_UNCHANGED)
    a = im[..., 3]
    ys, xs = np.where(a > 8)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32) / 255.0


PLECA_RATIO = 568.79 / 157.36  # medida en el manual (pág. 17)
LOGO_IN_PLECA = 432.17 / 568.79


def build_pleca(pw):
    """Pleca blanca con el logo rosa. Devuelve dict con rgb, a, counter (hueco de la primera O), en un lienzo
    con margen."""
    pw = int(round(pw))
    ph = int(round(pw / PLECA_RATIO))
    pad = int(ph * 0.25)
    cw, ch = pw + 2 * pad, ph + 2 * pad
    pill = fx.rounded_rect_mask(cw, ch, pw, ph, ph / 2)
    la = logo_alpha_hi()
    lw = int(round(pw * LOGO_IN_PLECA))
    lh = int(round(lw * la.shape[0] / la.shape[1]))
    lsm = cv2.resize(la, (lw, lh), interpolation=cv2.INTER_AREA)
    logo = np.zeros((ch, cw), np.float32)
    lx, ly = (cw - lw) // 2, (ch - lh) // 2
    logo[ly:ly + lh, lx:lx + lw] = lsm
    # hueco de la primera O
    binv = (la < 0.5).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(binv, connectivity=4)
    holes = [i for i in range(1, n) if st[i, 0] > 0 and st[i, 1] > 0 and st[i, 0] + st[i, 2] < la.shape[1]
             and st[i, 1] + st[i, 3] < la.shape[0] and st[i, 4] > 1000]
    first = min(holes, key=lambda i: st[i, 0])
    hole = (lab == first).astype(np.float32)
    hole = cv2.resize(hole, (lw, lh), interpolation=cv2.INTER_AREA)
    counter = np.zeros((ch, cw), np.float32)
    counter[ly:ly + lh, lx:lx + lw] = hole
    hx = lx + cen[first][0] * lw / la.shape[1]
    hy = ly + cen[first][1] * lh / la.shape[0]
    rgb = np.ones((ch, cw, 3), np.float32) * (1 - logo[..., None]) + PINK * logo[..., None]
    return dict(rgb=rgb, a=pill, logo=logo, counter=counter, w=cw, h=ch, pw=pw, ph=ph, hole=(hx, hy))


# ------------------------------------------------------------------ claqueta
CL_W, CL_BH, CL_SH = 700, 470, 70  # ancho, alto del pizarrón y de cada barra (diseño)
CL_GAP = 4
BOARD_PLECA_W = 520  # ancho de la pleca impresa en la pizarra (diseño)


def stripes_img(w, h, flip=False):
    """Barra con franjas diagonales blanco / negro (claqueta clásica, sin rosa)."""
    ss = 2
    W2, H2 = w * ss, h * ss
    img = np.zeros((H2, W2, 3), np.float32)
    img[:] = (0.94, 0.94, 0.94)
    sw = int(70 * S * ss)
    slant = int(46 * S * ss) * (-1 if flip else 1)
    k = 0
    for x in range(-2 * sw, W2 + 2 * sw, sw):
        if k % 2 == 0:
            pts = np.array([[x, 0], [x + sw, 0], [x + sw + slant, H2], [x + slant, H2]], np.int32)
            cv2.fillPoly(img, [pts], (0.035, 0.035, 0.04), cv2.LINE_AA)
        k += 1
    img = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
    return img


def rgba(rgb, a):
    return np.dstack([rgb, a]).astype(np.float32)


@lru_cache(None)
def clapper_parts():
    s = S
    bw, bh, sh = int(CL_W * s), int(CL_BH * s), int(CL_SH * s)
    # pizarrón
    board = np.zeros((bh, bw, 3), np.float32)
    yy = np.linspace(0, 1, bh, dtype=np.float32)[:, None]
    board[:] = (0.030, 0.030, 0.034)
    board += (0.018 * (1 - yy))[..., None]
    a = fx.rounded_rect_mask(bw, bh, bw, bh, 10 * s)
    lay = rgba(board, a)
    # marco fino de gis; la pizarra solo lleva SOMOS (en su pleca, como pide el manual sobre fondo oscuro)
    ink = np.zeros((bh, bw), np.float32)
    lw = max(1, int(2.0 * s))
    cv2.rectangle(ink, (int(16 * s), int(16 * s)), (int((CL_W - 16) * s), int((CL_BH - 16) * s)), 0.35, lw, cv2.LINE_AA)
    lay[..., :3] = lay[..., :3] * (1 - ink[..., None]) + 0.9 * ink[..., None]
    plain = lay.copy()
    Pq = build_pleca(BOARD_PLECA_W * s)
    _paste_rgba(lay, np.dstack([Pq["rgb"], Pq["a"]]), (bw - Pq["w"]) / 2, (bh - Pq["h"]) / 2)
    # barras
    def stick(flip):
        st = stripes_img(bw, sh, flip)
        m = fx.rounded_rect_mask(bw, sh, bw, sh, 4 * s)
        edge = np.zeros((sh, bw), np.float32)
        cv2.rectangle(edge, (0, 0), (bw - 1, sh - 1), 1.0, max(1, int(2 * s)))
        st = st * (1 - 0.6 * edge[..., None])
        return rgba(st, m)

    top = stick(False)
    bot = stick(True)
    # bisagra
    for L in (top, bot):
        cv2.circle(L, (int(14 * s), int(sh / 2)), int(9 * s), (0.55, 0.55, 0.58, 1.0), -1, cv2.LINE_AA)
    return dict(board=lay, plain=plain, top=top, bot=bot, bw=bw, bh=bh, sh=sh)


@lru_cache(None)
def closed_plain_clapper():
    lay, pad, oy = clapper_layer(0.0, plain=True)
    lay = lay.copy()
    gy = np.linspace(1.0, 0.0, lay.shape[0], dtype=np.float32)[:, None, None]
    gx = np.linspace(-1.0, 1.0, lay.shape[1], dtype=np.float32)[None, :, None]
    lay[..., :3] *= (0.62 + 0.55 * gy ** 1.5) * (1 - 0.12 * gx ** 2)
    return lay, pad, oy


def clapper_layer(angle_deg, blur_steps=1, prev_angle=None, plain=False):
    """Claqueta completa (RGBA) en un lienzo local. Origen de diseño = esquina sup-izq del pizarrón."""
    P = clapper_parts()
    s = S
    pad = int(260 * s)
    cw = P["bw"] + 2 * pad
    ch = P["bh"] + P["sh"] * 2 + int(CL_GAP * s) + 2 * pad
    oy = pad + P["sh"] * 2 + int(CL_GAP * s)  # y del pizarrón
    lay = np.zeros((ch, cw, 4), np.float32)
    _paste_rgba(lay, P["plain" if plain else "board"], pad, oy)
    _paste_rgba(lay, P["bot"], pad, oy - P["sh"])
    # barra superior girando en la bisagra (izquierda)
    piv = (pad + 6 * s, oy - P["sh"] - CL_GAP * s)
    angles = [angle_deg] if blur_steps <= 1 or prev_angle is None else \
        list(np.linspace(prev_angle, angle_deg, blur_steps))
    acc = np.zeros_like(lay)
    for ang in angles:
        tl = np.zeros_like(lay)
        _paste_rgba(tl, P["top"], pad, piv[1] - P["sh"])
        M = cv2.getRotationMatrix2D(piv, ang, 1.0)
        acc += cv2.warpAffine(tl, M, (cw, ch), flags=cv2.INTER_LINEAR)
    acc /= len(angles)
    _paste_rgba(lay, acc, 0, 0)
    return lay, pad, oy


def _paste_rgba(dst, src, x, y):
    """Composición RGBA sobre RGBA (premultiplicando)."""
    H_, W_ = dst.shape[:2]
    h, w = src.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W_, x + w), min(H_, y + h)
    if x0 >= x1 or y0 >= y1:
        return
    s_ = src[y0 - y:y1 - y, x0 - x:x1 - x]
    d = dst[y0:y1, x0:x1]
    sa = s_[..., 3:4]
    da = d[..., 3:4]
    oa = sa + da * (1 - sa)
    rgb = (s_[..., :3] * sa + d[..., :3] * da * (1 - sa)) / np.maximum(oa, 1e-6)
    dst[y0:y1, x0:x1, :3] = rgb
    dst[y0:y1, x0:x1, 3:4] = oa


def place_layer(frame, layer, cx, cy, scale=1.0, rot_y=0.0, rot_x=0.0, light=1.0, opacity=1.0, anchor=None):
    """Coloca una capa RGBA con perspectiva (giro Y/X en grados) centrada en (cx, cy) px."""
    h, w = layer.shape[:2]
    ax, ay = anchor if anchor else (w / 2, h / 2)
    pts = np.array([[0, 0], [w, 0], [w, h], [0, h]], np.float32) - [ax, ay]
    f = 2200 * S
    ry, rx = math.radians(rot_y), math.radians(rot_x)
    out = []
    for x, y in pts:
        x, y = x * scale, y * scale
        z = 0.0
        x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
        y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
        k = f / (f + z)
        out.append([cx + x * k, cy + y * k])
    M = cv2.getPerspectiveTransform((pts + np.array([ax, ay], np.float32)).astype(np.float32), np.array(out, np.float32))
    warped = cv2.warpPerspective(layer, M, (W, H), flags=cv2.INTER_LINEAR)
    a = warped[..., 3:4] * opacity
    return frame * (1 - a) + warped[..., :3] * light * a


# ------------------------------------------------------------------ estudio (reflectores de tungsteno)
LW, LH = W // 4, H // 4
LIGHTS = [  # pos, objetivo (diseño), semiapertura (grados)
    dict(pos=(130, 150), tgt=(600, 1330), half=13.0),
    dict(pos=(950, 120), tgt=(480, 1330), half=13.0),
    dict(pos=(540, -120), tgt=(540, 1460), half=10.5),
]


@lru_cache(None)
def haze_tex():
    return fx.fbm(LW * 2, LH * 2, 7, octaves=6, base=3)


@lru_cache(None)
def beam_fields():
    yy, xx = np.mgrid[0:LH, 0:LW].astype(np.float32)
    out = []
    sl = LW / 1080.0
    for L in LIGHTS:
        px, py = L["pos"][0] * sl, L["pos"][1] * sl
        tx, ty = L["tgt"][0] * sl, L["tgt"][1] * sl
        dx, dy = tx - px, ty - py
        n = math.hypot(dx, dy)
        dx, dy = dx / n, dy / n
        vx, vy = xx - px, yy - py
        along = vx * dx + vy * dy
        perp = np.abs(vx * dy - vy * dx)
        ang = np.degrees(np.arctan2(perp, np.maximum(along, 1e-3)))
        half = L["half"]
        cone = smooth((half + 3.5 - ang) / 7.0) * (along > 0)
        core = np.exp(-(ang / half) ** 2 * 1.6)
        fall = 1.0 / (1.0 + (along / (n * 1.15)) ** 2)
        beam = cone * (0.55 + 0.45 * core) * fall
        rx = math.tan(math.radians(half)) * n * 1.25
        pool = np.exp(-((xx - tx) / rx) ** 2 - ((yy - ty) / (rx * 0.22)) ** 2)
        out.append((beam.astype(np.float32), pool.astype(np.float32)))
    return out


def light_state(i, t, ons, offs):
    """Intensidad (0..~1.3) y color de un reflector viejo: parpadeo al encender, filamento calentando."""
    ton = ons[i]
    toff = offs[i] if offs else None
    if ton is None or t < ton:
        return 0.0, np.array([1.0, 0.5, 0.2], np.float32)
    dt = t - ton
    if dt < 0.16:
        fl = [0.55, 0.12, 0.7, 0.3, 0.85][int(dt * FPS) % 5]
        inten = fl
    else:
        inten = 0.55 + 0.45 * ease_out((dt - 0.16) / 0.7, 2)
    warm = ease_out(dt / 0.9, 2)
    hum = 1 + 0.025 * math.sin(t * 47 + i) + 0.015 * math.sin(t * 13.3 + 2 * i)
    inten *= hum
    if toff is not None and t >= toff:
        k = math.exp(-(t - toff) / 0.22)
        inten *= k
        warm *= k ** 0.5
    col = np.array([1.0, 0.50 + 0.30 * warm, 0.20 + 0.36 * warm], np.float32)
    return inten, col


@lru_cache(None)
def dust():
    r = np.random.RandomState(3)
    n = 260
    return dict(x=r.rand(n) * 1080, y=r.rand(n) * 1700 + 60, s=0.6 + r.rand(n) ** 3 * 2.6, ph=r.rand(n) * 6.28,
                sp=0.3 + r.rand(n))


def studio(t, ons, offs=None, surge=0.0, cam=1.0, cam_c=(540, 1000)):
    """Plató oscuro con haces volumétricos. Devuelve imagen HxWx3 y las intensidades."""
    fields = beam_fields()
    hz = haze_tex()
    ox = int((t * 9) % LW)
    oy = int((t * 4) % LH)
    haze = hz[oy:oy + LH, ox:ox + LW]
    haze2 = hz[(LH - oy // 2) % LH:(LH - oy // 2) % LH + LH, (ox // 2):(ox // 2) + LW]
    hzm = 0.35 + 0.65 * (0.6 * haze + 0.4 * haze2)
    img = np.zeros((LH, LW, 3), np.float32)
    yy = np.linspace(0, 1, LH, dtype=np.float32)[:, None, None]
    base = np.array([0.010, 0.010, 0.012], np.float32)
    img[:] = base * (1.2 - 0.5 * yy)
    states = []
    total = 0.0
    for i, (beam, pool) in enumerate(fields):
        inten, col = light_state(i, t, ons, offs)
        inten *= 1 + surge
        states.append((inten, col))
        total += inten
        if inten <= 0:
            continue
        img += (beam * hzm * 0.42)[..., None] * col * inten
        img += (pool * 0.055)[..., None] * col * inten
    # rebote en el fondo (ciclorama) y piso
    img += (np.exp(-((yy - 0.62) / 0.35) ** 2) * 0.020 * total) * np.array([1.0, 0.8, 0.62], np.float32)
    img = cv2.resize(img, (W // 2, H // 2), interpolation=cv2.INTER_LINEAR)
    # polvo en suspensión, solo visible dentro de los haces
    D = dust()
    sh = (W // 2) / 1080.0
    lit = cv2.resize(sum(f[0] * st[0] for f, st in zip(fields, states)) if total > 0 else np.zeros((LH, LW), np.float32),
                     (W // 2, H // 2))
    if total > 0:
        part = np.zeros((H // 2, W // 2), np.float32)
        for x, y, s_, ph, sp in zip(D["x"], D["y"], D["s"], D["ph"], D["sp"]):
            px = (x + 14 * math.sin(t * 0.4 * sp + ph)) * sh
            py = (y - t * 9 * sp + 10 * math.cos(t * 0.3 + ph)) % 1800 * sh + 40 * sh
            b = lit[int(min(H // 2 - 1, max(0, py))), int(min(W // 2 - 1, max(0, px)))]
            if b < 0.03:
                continue
            tw = 0.6 + 0.4 * math.sin(t * 3 * sp + ph * 3)
            cv2.circle(part, (int(px * 16), int(py * 16)), max(1, int(s_ * sh * 16)), float(b * tw * 1.4), -1,
                       cv2.LINE_AA, 4)
        part = fx.blur(part, 0.6 * sh)
        img += part[..., None] * np.array([1.0, 0.86, 0.7], np.float32)
    # lentes de los fresnel y destellos anamórficos
    for i, L in enumerate(LIGHTS):
        inten, col = states[i]
        if inten <= 0 or L["pos"][1] < 0:
            continue
        px, py = L["pos"][0] * sh, L["pos"][1] * sh
        g = np.zeros((H // 2, W // 2), np.float32)
        cv2.circle(g, (int(px), int(py)), int(30 * sh), 1.0, -1, cv2.LINE_AA)
        core = fx.blur(g, 3 * sh) * 1.6 + fx.soft_blur(g, 40 * sh) * 0.9 + fx.soft_blur(g, 120 * sh) * 0.35
        img += core[..., None] * col * inten
        st = np.zeros((H // 2, W // 2), np.float32)
        cv2.ellipse(st, (int(px), int(py)), (int(520 * sh), int(3 * sh)), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
        st = fx.blur(st, 4 * sh)
        img += st[..., None] * np.array([1.0, 0.72, 0.5], np.float32) * inten * 0.55
    img = cv2.resize(img, (W, H), interpolation=cv2.INTER_LINEAR)
    if cam != 1.0:
        img = fx.affine(img, cam, cx=cam_c[0] * S, cy=cam_c[1] * S, border=cv2.BORDER_REFLECT)
    return img, states


# ------------------------------------------------------------------ pleca / logo en escena
@lru_cache(None)
def pleca_std():
    return build_pleca(620 * S)


@lru_cache(None)
def pleca_hi():
    return build_pleca(2400 if not PREVIEW else 1400)


def draw_pleca(frame, cx, cy, scale=1.0, opacity=1.0, glint=None, logo_reveal=1.0, glow=0.0, P=None, rot_y=0.0,
               rot_x=0.0, light=1.0):
    P = P or pleca_std()
    rgb = P["rgb"].copy()
    a = P["a"] * opacity
    if logo_reveal < 1.0:
        w = P["w"]
        xs = np.linspace(0, 1, w, dtype=np.float32)[None, :]
        lx0 = (P["w"] - P["pw"] * LOGO_IN_PLECA) / 2 / w
        lx1 = 1 - lx0
        edge = lx0 + (lx1 - lx0 + 0.08) * logo_reveal
        m = clamp01((edge - xs) / 0.06)
        lg = P["logo"] * m
        rgb = np.ones_like(rgb) * (1 - lg[..., None]) + PINK * lg[..., None]
    if glint is not None:
        hh, ww = a.shape
        yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
        d = (xx + yy * 0.6) / (ww + hh * 0.6)
        band = np.exp(-((d - glint) / 0.035) ** 2) * 0.55
        rgb = rgb + band[..., None] * (1 - P["logo"][..., None] * 0.6)
    lay = np.dstack([rgb, a])
    if glow > 0:
        g = fx.soft_blur(np.ascontiguousarray(a), 40 * S)
        lay_g = np.dstack([np.ones_like(rgb) * np.array([1, 0.85, 0.92], np.float32), g * glow])
        frame = place_layer(frame, lay_g, cx, cy, scale, rot_y, rot_x)
    return place_layer(frame, lay, cx, cy, scale, rot_y, rot_x, light=light)


def pleca_frame(cx, cy, scale=1.0, P=None):
    """Pleca transformada al cuadro completo: (rgb, alfa)."""
    P = P or pleca_std()
    M = np.array([[scale, 0, cx - P["w"] / 2 * scale], [0, scale, cy - P["h"] / 2 * scale]], np.float32)
    rgb = cv2.warpAffine(P["rgb"], M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(1, 1, 1))
    a = cv2.warpAffine(P["a"], M, (W, H), flags=cv2.INTER_LINEAR)
    return rgb, a


def light_cut(frame, cx, cy, dt):
    """Corte de luz anamórfico horizontal al golpe de la claqueta (sin círculos)."""
    if dt < 0 or dt > 0.7:
        return frame
    grow = ease_out(dt / 0.16, 3)
    k = math.exp(-dt / 0.22)
    yy = (np.arange(H, dtype=np.float32) - cy)[:, None]
    xx = (np.arange(W, dtype=np.float32) - cx)[None, :]
    half = 40 * S + W * 0.75 * grow
    hx = np.exp(-(xx / half) ** 2 * 2.2)
    core = np.exp(-(yy / (3.0 * S)) ** 2) * hx
    soft = np.exp(-(yy / (26 * S)) ** 2) * hx * 0.35
    col = np.array([1.0, 0.92, 0.86], np.float32)
    return frame + (core * 1.4 + soft)[..., None] * col * k


def shockwave(frame, cx, cy, dt, strength=1.0):
    if dt < 0 or dt > 0.6:
        return frame
    r = (60 + 1100 * ease_out(dt / 0.6, 3)) * S
    th = (40 * (1 - dt / 0.6) + 6) * S
    m = np.zeros((H // 4, W // 4), np.float32)
    cv2.circle(m, (int(cx / 4), int(cy / 4)), int(r / 4), 1.0, max(1, int(th / 4)), cv2.LINE_AA)
    m = cv2.resize(fx.blur(m, th / 10), (W, H))
    k = (1 - dt / 0.6) ** 2 * 0.8 * strength
    return frame + m[..., None] * PINK * k + m[..., None] * 0.25 * k


# ------------------------------------------------------------------ secuencias claqueta → pleca
CLAP_C = (540, 1000)  # centro de la claqueta en diseño
PLECA_C = (540, 960)


def clapper_sequence(t, tc, ons, offs, intro=True):
    """Claqueta en el plató, cierra en `tc` y se transforma en la pleca."""
    dt = t - tc
    surge = 0.4 * env_hit(t, tc, 0.0, 0.22)
    if intro:
        cam = 1.0 + 0.10 * ease_in_out(lin(t, 0.0, tc), 2) + 0.03 * ease_out(lin(t, tc, tc + 1.6))
    else:
        cam = 1.06 + 0.06 * ease_out(lin(t, T_END, tc)) + 0.03 * ease_out(lin(t, tc, tc + 2.5))
    img, states = studio(t, ons, offs, surge, cam=cam)
    s = S
    lightk = 0.10 * (states[0][0] + states[1][0]) + 0.85 * states[2][0]
    lightk = min(1.25, lightk) * (1 + surge * 0.4)
    # ángulo de la barra
    if intro:
        open_t0, open_t1 = fr(3.92), fr(4.55)
        close_t0 = tc - 4 / FPS
    else:
        open_t0, open_t1 = T_END - 0.3, T_END + 0.05
        close_t0 = tc - 4 / FPS
    def ang_at(tt):
        if tt >= tc:
            return 0.0
        if tt >= close_t0:
            return 36.0 * (1 - ease_in((tt - close_t0) / (tc - close_t0), 2.4))
        a = 36.0 * ease_out((tt - open_t0) / (open_t1 - open_t0), 3) if tt >= open_t0 else 0.0
        if tt > open_t1:
            a += 1.2 * math.sin((tt - open_t1) * 9) * math.exp(-(tt - open_t1) * 2)
        return a
    ang = ang_at(t)
    blur_steps = 5 if close_t0 <= t < tc + 0.5 / FPS and dt < 0 else 1
    floaty = 10 * math.sin(t * 1.3) * s
    if dt < 0:
        rot_y = (-10 + 6 * ease_in_out(lin(t, 0, tc))) if intro else -8 + 8 * lin(t, T_END, tc)
        rise = (1 - ease_out(lin(t, fr(3.4), fr(4.4)), 3)) * 70 * s if intro else (1 - ease_out(lin(t, T_END, T_END + 0.5))) * 120 * s
        lay, pad, oy = clapper_layer(ang, blur_steps, ang_at(t - 1 / FPS))
        lay = lay.copy()
        gy = np.linspace(1.0, 0.0, lay.shape[0], dtype=np.float32)[:, None, None]
        gx = np.linspace(-1.0, 1.0, lay.shape[1], dtype=np.float32)[None, :, None]
        lay[..., :3] *= (0.62 + 0.55 * gy ** 1.5) * (1 - 0.12 * gx ** 2)
        cx, cy = CLAP_C[0] * s, CLAP_C[1] * s + floaty + rise
        anchor = (pad + CL_W * s / 2, oy + CL_BH * s / 2 - 70 * s)
        img = place_layer(img, lay, cx, cy - 70 * s, scale=cam, rot_y=rot_y, rot_x=4, light=lightk, anchor=anchor)
        return img
    # --- tras el golpe: la claqueta cae y la pleca SOMOS se libera y avanza al centro
    rot_end = -4.0 if intro else 0.0
    board_cy = CLAP_C[1] * s + floaty
    pb = ease_in(dt / 0.5, 2)
    if pb < 0.98:
        lay, pad, oy = closed_plain_clapper()
        vb = int(pb * 160 * s)
        if vb > 2:
            lay = np.dstack([fx.box_blur_v(lay[..., :3], vb), fx.box_blur_v(lay[..., 3], vb)])
        anchor = (pad + CL_W * s / 2, oy + CL_BH * s / 2 - 70 * s)
        img = place_layer(img, lay, CLAP_C[0] * s, board_cy - 70 * s + 1150 * s * pb, scale=cam * (1 - 0.06 * pb),
                          rot_y=rot_end, rot_x=4 + 18 * pb, light=lightk * (1 - 0.5 * pb), opacity=1 - pb ** 2,
                          anchor=anchor)
    q = ease_out(dt / 0.45, 3)
    qs = ease_out_back(dt / 0.50, 1.5)
    k0 = BOARD_PLECA_W / 620.0
    grow = 1.0 + 0.04 * ease_out(lin(t, tc + 0.4, tc + 1.6 if intro else tc + 3.0), 2)
    sc = cam * (k0 + (1 - k0) * qs) * grow
    cx = CLAP_C[0] * s
    cy = board_cy + (PLECA_C[1] * s - board_cy) * q
    gl = None
    g0 = tc + (0.75 if intro else 1.05)
    if g0 <= t <= g0 + 0.55:
        gl = -0.1 + 1.2 * ease_in_out((t - g0) / 0.55, 2)
    glow = 0.10 + 0.25 * env_hit(t, tc, 0, 0.3)
    if not intro and offs:
        glow += 0.30 * ease_out(lin(t, offs[0], offs[0] + 0.4), 2)
    img = draw_pleca(img, cx, cy, sc, glint=gl, glow=glow,
                     rot_y=rot_end * (1 - q), rot_x=4 * (1 - q), light=lightk + (1 - lightk) * ease_out(dt / 0.12, 2))
    if 0 <= dt < 0.22:  # impulso de la pleca hacia cámara
        img = fx.zoom_blur(img, 0.10 * (1 - dt / 0.22) ** 2, cx, cy)
    img = light_cut(img, cx, cy, dt)
    img += ((0.55 if intro else 0.35) * env_hit(t, tc, 0, 0.05)) * np.array([1.0, 0.9, 0.86], np.float32)
    return img


def zoom_through(t, base_img):
    """Entra a la escena atravesando la primera O de SOMOS."""
    P = pleca_hi()
    p = lin(t, T_ZOOM0, T_ZOOM1)
    sc_std = 1.10 * (620 * S) / P["pw"]  # misma escala visual que la pleca estándar (cam≈1.1)
    k = sc_std * (90.0 ** ease_in(p, 2.4))
    hx, hy = P["hole"]
    # el hueco se desplaza al centro del cuadro mientras entramos
    cx0, cy0 = PLECA_C[0] * S, PLECA_C[1] * S
    off_x = (hx - P["w"] / 2) * sc_std
    off_y = (hy - P["h"] / 2) * sc_std
    q = ease_in_out(p, 2)
    tx = cx0 + off_x + (W / 2 - (cx0 + off_x)) * q
    ty = cy0 + off_y + (H / 2 - (cy0 + off_y)) * q
    M = np.array([[k, 0, tx - hx * k], [0, k, ty - hy * k]], np.float32)
    rgb = cv2.warpAffine(P["rgb"], M, (W, H), flags=cv2.INTER_LINEAR)
    a = cv2.warpAffine(P["a"], M, (W, H), flags=cv2.INTER_LINEAR)
    hole = cv2.warpAffine(P["counter"], M, (W, H), flags=cv2.INTER_LINEAR)
    bg = fx.zoom_blur(fx.affine(base_img, 1 + 0.6 * ease_in(p, 2), cx=tx, cy=ty, border=cv2.BORDER_REFLECT),
                      0.25 * ease_in(p, 2), tx, ty)
    out = fx.over(bg, rgb, a)
    foot = footage_frame(0, t - T_M1)
    reveal = smooth((k / sc_std - 1.5) / 5.0)
    out = fx.over(out, foot, hole * reveal)
    zb = 0.45 * math.sin(math.pi * p) ** 2
    out = fx.zoom_blur(out, zb, W / 2, H / 2)
    return out


# ------------------------------------------------------------------ material
def slot_meta(i):
    return json.loads((SLOTS_DIR / f"{i:02d}" / "meta.json").read_text())


@lru_cache(maxsize=4)
def _load(i, k):
    p = SLOTS_DIR / f"{i:02d}" / f"{k + 1:04d}.jpg"
    im = cv2.imread(str(p), cv2.IMREAD_COLOR)
    im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    if im.shape[1] != W:
        im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
    return im.astype(np.float32) / 255.0


@lru_cache(None)
def _meta(i):
    return slot_meta(i)


def raw_frame(i, u):
    """Cuadro del fragmento i a tiempo local u (segundos de salida desde su inicio), con mezcla subcuadro."""
    st, en, clip, src_in, speed, tin, mot = EDL[i]
    m = _meta(i)
    src_t = src_in + u * speed
    kf = (src_t - m["start"]) * FPS
    n = m["n"]
    kf = min(max(kf, 0), n - 1)
    k0 = int(math.floor(kf))
    fr_ = kf - k0
    a = _load(i, k0)
    if fr_ > 0.08 and k0 + 1 < n and speed < 0.99:
        a = a * (1 - fr_) + _load(i, k0 + 1) * fr_
    return a


@lru_cache(None)
def _vig():
    return fx.vignette_mask(W, H, 0.55)[..., None]


def pink_protect(img, sat_boost=1.18):
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    m = clamp01((r - g * 1.5 - 0.06) * 4) * clamp01((b - g * 1.05) * 6)
    lum = fx.luminance(img)[..., None]
    boosted = lum + (img - lum) * sat_boost
    return img * (1 - m[..., None]) + boosted * m[..., None]


def footage_frame(i, u, extra_dark=0.0):
    st, en, clip, src_in, speed, tin, mot = EDL[i]
    z0, z1, cx, cy, dx, dy = mot
    dur = en - st
    p = clamp01(u / max(dur, 1e-3))
    z = z0 + (z1 - z0) * float(fx.ease_out(p, 1.6) if z1 < z0 else p)
    img = raw_frame(i, u)
    img = fx.affine(img, z, cx=cx * W, cy=cy * H, tx=(0.5 - cx) * W * (z - 1) / z * 0 + dx * S,
                    ty=dy * S, border=cv2.BORDER_REFLECT)
    img = fx.grade(img, contrast=1.16, sat=0.80, exposure=-0.55 - extra_dark)
    img = pink_protect(img)
    img = img * _vig()
    return img


def slot_at(t):
    for i, e in enumerate(EDL):
        if e[0] <= t < e[1]:
            return i
    return None


@lru_cache(None)
def leak_tex():
    return fx.fbm(W // 8, H // 8, 21, octaves=4, base=2)


def light_leak(t, amount, phase=0.0):
    tex = leak_tex()
    h, w = tex.shape
    sh = int((t * 120 + phase * 300) % w)
    tx = np.roll(tex, sh, axis=1)
    xs = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    grad = np.exp(-((xs - (0.15 + 0.7 * ((t * 0.9 + phase) % 1))) / 0.35) ** 2)
    m = clamp01(tx * 1.6 - 0.35) * grad
    col = np.dstack([m * 1.0, m * 0.42, m * 0.30]) + np.dstack([m * 0.5, m * 0.0, m * 0.25]) * (1 - grad)[..., None]
    col = cv2.resize(col.astype(np.float32), (W, H))
    return col * amount


def glitch(img_a, img_b, frame_idx, strength=1.0):
    rng = np.random.RandomState(frame_idx * 7 + 3)
    base = img_b if frame_idx % 2 == 0 else img_a
    out = base.copy()
    off = int((18 + 30 * rng.rand()) * S * strength)
    out[..., 0] = np.roll(base[..., 0], off, axis=1)
    out[..., 2] = np.roll(base[..., 2], -off, axis=1)
    for _ in range(int(6 * strength)):
        y0 = rng.randint(0, H - 40)
        hh = int((20 + rng.rand() * 160) * S)
        sx = int((rng.rand() - 0.5) * 220 * S * strength)
        out[y0:y0 + hh] = np.roll(out[y0:y0 + hh], sx, axis=1)
    if rng.rand() < 0.5:
        y0 = rng.randint(0, H - 40)
        out[y0:y0 + int(8 * S)] = PINK * 0.9
    return out


def cortinilla(t, tc, img_a, img_b):
    """Cortinilla con barras rosa cívico y la pleca cruzando al centro."""
    p = lin(t, tc - CORT, tc + CORT)
    out = img_a if p < 0.5 else img_b
    out = out.copy()
    bars = 3
    bh = H / bars
    for k in range(bars):
        d = k * 0.07
        pin = fx.ease_out_expo(lin(p, 0.0 + d, 0.42 + d))
        pout = fx.ease_in_expo(lin(p, 0.55 + d * 0.6, 0.92 + d * 0.6))
        x0 = W * (1 - pin) - W * pout
        if pin <= 0 or pout >= 1:
            continue
        y0, y1 = int(k * bh), int((k + 1) * bh)
        xa, xb = int(max(0, x0)), int(min(W, x0 + W))
        if xa < xb:
            out[y0:y1, xa:xb] = PINK
    pl = lin(p, 0.18, 0.86)
    if 0 < pl < 1:
        e = pl
        xx = (1.0 - 2.0 * (0.5 + 0.5 * math.copysign(abs(2 * e - 1) ** 2.4, 2 * e - 1)))
        speed = abs(2 * e - 1) ** 1.4
        rgb, alpha = pleca_frame(W / 2 + xx * W * 0.9, H / 2, 1.0)
        bl = int(speed * 160 * S)
        if bl > 2:
            rgb = fx.box_blur_h(rgb * alpha[..., None], bl)
            alpha = fx.box_blur_h(alpha, bl)
            rgb = rgb / np.maximum(alpha[..., None], 1e-4)
        out = fx.over(out, rgb, alpha)
    return out


def montage(t, fi):
    i = slot_at(t)
    st, en, clip, src_in, speed, tin, mot = EDL[i]
    u = t - st
    extra = 0.0
    is_break = T_BREAK <= st < T_M2
    if is_break:
        extra = 0.55 + 0.9 * ease_in(lin(t, T_M2 - 0.45, T_M2), 2)
    img = footage_frame(i, u, extra)
    if is_break:
        lum = fx.luminance(img)[..., None]
        img = lum + (img - lum) * 0.5
        img = np.clip((img - 0.035) * 1.12, 0, None)
        img = img * (0.92 + 0.08 * math.sin(t * 31))
        img *= ease_out(lin(t, T_BREAK, T_BREAK + 0.5), 2)
    # transición de entrada del fragmento actual
    prev = i - 1
    if tin == "flash":
        img = img + 0.75 * env_hit(t, st, 0, 0.065) * np.array([1.0, 0.94, 0.9], np.float32)
    elif tin == "leak":
        img = img + light_leak(t, (0.6 if is_break else 1.3) * env_hit(t, st, 0, 0.35), i)
    elif tin == "whip" and u < 0.12:
        p = u / 0.12
        off = (1 - ease_out(p, 3)) * W * 0.6
        img = fx.affine(img, 1.0, tx=off, border=cv2.BORDER_REFLECT)
        img = fx.box_blur_h(img, (1 - p) * 220 * S)
    elif tin == "zoom" and u < 0.16:
        p = u / 0.16
        img = fx.zoom_blur(fx.affine(img, 1 + 0.5 * (1 - ease_out(p, 3))), 0.35 * (1 - p))
    elif tin == "glitch" and u < 0.10 and prev >= 0:
        img_a = footage_frame(prev, t - EDL[prev][0])
        img = glitch(img_a, img, fi, 1.0)
    elif tin == "logo" and u < CORT and prev >= 0:
        img_a = footage_frame(prev, t - EDL[prev][0])
        img = cortinilla(t, st, img_a, img)
    elif tin == "strobe" and u < 0.24:
        k = int(u * FPS)
        if k in (0, 1):
            img = draw_pleca(np.zeros((H, W, 3), np.float32) + PINK, W / 2, H / 2, 1.25)
        elif k == 3:
            img = draw_pleca(np.zeros((H, W, 3), np.float32) + 0.01, W / 2, H / 2, 1.12)
        elif k in (2, 4):
            img = img + 0.6
        elif k == 5:
            img = img + PINK * 0.35
    elif tin == "dip":
        pass
    # salida del fragmento: anticipa la transición del siguiente
    nxt = i + 1
    if nxt < len(EDL):
        nst, ntin = EDL[nxt][0], EDL[nxt][5]
        r = nst - t  # tiempo restante
        if ntin == "whip" and r < 0.12:
            p = 1 - r / 0.12
            img = fx.affine(img, 1.0, tx=-ease_in(p, 3) * W * 0.6, border=cv2.BORDER_REFLECT)
            img = fx.box_blur_h(img, p * 220 * S)
        elif ntin == "zoom" and r < 0.14:
            p = 1 - r / 0.14
            img = fx.zoom_blur(fx.affine(img, 1 + 0.6 * ease_in(p, 2)), 0.35 * p)
        elif ntin == "glitch" and r < 0.07:
            img = glitch(img, footage_frame(nxt, t - nst), fi, 0.8)
        elif ntin == "logo" and r < CORT:
            img = cortinilla(t, nst, img, footage_frame(nxt, t - nst))
        elif ntin == "flash" and r < 0.05:
            img = img + 0.5 * (1 - r / 0.05)
        elif ntin == "dip" and r < 0.35:
            img = img * (1 - ease_in(1 - r / 0.35, 2))
    if i == len(EDL) - 1:  # último fragmento: se apaga hacia el final
        img = img * (1 - ease_in(lin(t, T_END - 0.25, T_END), 2))
    return img




# ------------------------------------------------------------------ escena completa
def scene(t, fi):
    if t < T_CLAP1:
        return clapper_sequence(t, T_CLAP1, T_LIGHTS, None, intro=True)
    if t < T_ZOOM0:
        return clapper_sequence(t, T_CLAP1, T_LIGHTS, None, intro=True)
    if t < T_ZOOM1:
        base = clapper_sequence(t, T_CLAP1, T_LIGHTS, None, intro=True)
        return zoom_through(t, base)
    if t < T_END:
        return montage(t, fi)
    return ending(t, fi)


# ------------------------------------------------------------------ cierre: línea de luz → blanco → SOMOS → TV vieja que se apaga
T_LOGO = fr(32.47)  # SOMOS en solitario
T_TV = fr(34.55)
LOGO_END_W = 700  # ancho del logo en el cierre (diseño)


@lru_cache(None)
def end_letters():
    """Letras del logo (alfa) separadas, en un lienzo con margen para su entrada."""
    la = logo_alpha_hi()
    lw = int(round(LOGO_END_W * S))
    lh = int(round(lw * la.shape[0] / la.shape[1]))
    n, lab, st, cen = cv2.connectedComponentsWithStats((la > 0.02).astype(np.uint8), connectivity=8)
    order = sorted(range(1, n), key=lambda i: st[i, 0])
    padx, pady = int(160 * S), int(420 * S)
    letters = []
    for i in order:
        m = la * (lab == i)
        m = cv2.resize(m, (lw, lh), interpolation=cv2.INTER_AREA)
        letters.append(m)
    return dict(letters=letters, lw=lw, lh=lh, padx=padx, pady=pady)


def streak(cx, cy, half, thick, inten):
    yy = (np.arange(H, dtype=np.float32) - cy)[:, None]
    xx = (np.arange(W, dtype=np.float32) - cx)[None, :]
    hx = np.exp(-(xx / max(half, 1.0)) ** 2 * 2.2)
    core = np.exp(-(yy / thick) ** 2) * hx
    soft = np.exp(-(yy / (thick * 9)) ** 2) * hx * 0.35
    wide = np.exp(-(yy / (thick * 40)) ** 2) * hx * 0.08
    return (core * 1.5 + soft + wide)[..., None] * np.array([1.0, 0.95, 0.92], np.float32) * inten


def logo_end_canvas(dt):
    """Alfa del logo con la entrada letra por letra (caen siguiendo la itálica) y su brillo."""
    E = end_letters()
    lw, lh, px, py = E["lw"], E["lh"], E["padx"], E["pady"]
    acc = np.zeros((lh + 2 * py, lw + 2 * px), np.float32)
    for k, m in enumerate(E["letters"]):
        p = lin(dt, 0.07 + 0.055 * k, 0.07 + 0.055 * k + 0.42)
        if p <= 0:
            continue
        e = ease_out_back(p, 1.35)
        d = (1 - e) * 300 * S
        dx, dy = d * 0.22, -d
        lay = m * min(1.0, p * 3.5)
        vb = int((1 - p) ** 2 * 120 * S)
        if vb > 2:
            lay = fx.box_blur_v(lay, vb)
        M = np.array([[1, 0, px + dx], [0, 1, py + dy]], np.float32)
        acc = np.maximum(acc, cv2.warpAffine(lay, M, (acc.shape[1], acc.shape[0]), flags=cv2.INTER_LINEAR))
    return acc


def tv_off(img, u):
    """Apagado de televisor viejo: la imagen se comprime en una línea, luego en un punto."""
    out = np.zeros_like(img)
    D1, D2, D3 = 0.15, 0.15, 0.12
    if u < D1:
        q = ease_in(u / D1, 2.6)
        sy = max(2.0 / H, 1 - q * 0.996)
        sx = 1 + 0.06 * q
        hh = max(2, int(H * sy))
        ww = int(W * sx)
        sq = cv2.resize(img, (ww, hh), interpolation=cv2.INTER_AREA)
        sq = sq * (1 + 1.2 * q)
        x0 = (W - ww) // 2
        y0 = (H - hh) // 2
        xa, xb = max(0, x0), min(W, x0 + ww)
        out[y0:y0 + hh, xa:xb] = sq[:, xa - x0:xb - x0]
        out = out + streak(W / 2, H / 2, W * 0.6, 3 * S, 0.6 * q)
    elif u < D1 + D2:
        q = ease_in((u - D1) / D2, 2.2)
        out = out + streak(W / 2, H / 2, W * 0.5 * (1 - q) + 6 * S, 3 * S, 1.3)
    elif u < D1 + D2 + D3:
        q = (u - D1 - D2) / D3
        g = np.zeros((H, W), np.float32)
        cv2.circle(g, (W // 2, H // 2), int(7 * S), 1.0, -1, cv2.LINE_AA)
        g = fx.blur(g, 3 * S) * 1.6 + fx.soft_blur(g, 30 * S) * 0.8
        out = out + g[..., None] * (1 - q) ** 2
    return out


def ending(t, fi):
    img = np.zeros((H, W, 3), np.float32)
    if t < T_CLAP2:  # la línea de luz nace del negro
        g = ease_out(lin(t, T_END, T_END + 0.6), 3)
        p = lin(t, T_END, T_CLAP2)
        inten = (0.25 + 1.0 * ease_in(p, 2)) * (1 + 0.07 * math.sin(t * 95))
        return img + streak(W / 2, H / 2, (30 + 420 * g + 120 * p) * S, (1.6 + 1.2 * p) * S, inten)
    if t < T_LOGO:  # cuadro aparte: MUY PRONTO, suspenso
        dt = t - T_CLAP2
        span = T_LOGO - T_CLAP2
        trk = round(0.40 + 0.16 * lin(dt, 0, span), 3)
        txt = _text_big(trk)
        th = txt.shape[0]
        opn = ease_out(lin(dt, 0.0, 0.28), 3) * (1 - ease_in(lin(dt, span - 0.22, span - 0.02), 3))
        hh = th * 0.62 * opn
        lay = txt.copy()
        yy = np.abs(np.arange(th, dtype=np.float32) - th / 2)[:, None]
        lay[..., 3] *= clamp01((hh - yy) / (3 * S))
        flick = 1 + 0.05 * math.sin(t * 63) * (1 - lin(dt, 0, 0.6))
        img = fx.paste(img, lay, W / 2 - lay.shape[1] / 2, H / 2 - th / 2, 0.95 * flick)
        li = 1.6 * env_hit(t, T_CLAP2, 0, 0.12) + 0.18 + 1.4 * ease_in(lin(dt, span - 0.25, span), 2)
        half = (450 + 120 * (1 - opn)) * S
        img = img + streak(W / 2, H / 2 - hh, half, 1.8 * S, li * 0.6 * (1 if opn > 0.02 else 0)) + \
            streak(W / 2, H / 2 + hh, half, 1.8 * S, li * 0.6)
        return img
    dt = t - T_LOGO
    # el obturador de luz se abre a blanco
    o = fx.ease_out_expo(lin(dt, 0, 0.32))
    hh = max(2 * S, H * 0.5 * o)
    yy = np.abs(np.arange(H, dtype=np.float32) - H / 2)
    edge = (10 + 80 * (1 - o)) * S
    m = clamp01((hh - yy) / edge)[:, None, None]
    img = img + m
    if dt < 0.32:
        img = img + streak(W / 2, H / 2 - hh, W, 4 * S, 0.8 * (1 - o)) + streak(W / 2, H / 2 + hh, W, 4 * S, 0.8 * (1 - o))
    # SOMOS en solitario (rosa cívico sobre blanco: uso oficial)
    a = logo_end_canvas(dt)
    sc = 1.0 + 0.035 * ease_out(lin(dt, 0.45, T_TV - T_LOGO), 1.5)
    cx, cy = W / 2, H / 2
    M = np.array([[sc, 0, cx - a.shape[1] / 2 * sc], [0, sc, cy - a.shape[0] / 2 * sc]], np.float32)
    aw = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
    col = np.broadcast_to(PINK, img.shape).copy()
    g0 = 1.0
    if g0 <= dt <= g0 + 0.6:
        gp = (dt - g0) / 0.6
        xx = np.arange(W, dtype=np.float32)[None, :] / W
        yv = np.arange(H, dtype=np.float32)[:, None] / H
        dd = xx + (yv - 0.5) * 0.9
        band = np.exp(-((dd - (-0.2 + 1.4 * gp)) / 0.05) ** 2) * 0.55
        col = col + band[..., None] * (1 - PINK)
    img = img * (1 - aw) + col * aw
    img = img + 0.5 * env_hit(t, T_LOGO, 0, 0.07)
    if t >= T_TV:
        img = tv_off(np.clip(img, 0, 1), t - T_TV)
    return img


@lru_cache(maxsize=64)
def _text_big(trk):
    return text_rgba("MUY PRONTO", 500, 72, trk)


@lru_cache(maxsize=64)
def _text_cache(trk):
    return text_rgba("MUY PRONTO", 500, 46, trk)


# ------------------------------------------------------------------ post
@lru_cache(None)
def _vig_all():
    return fx.vignette_mask(W, H, 0.38)[..., None]


def hit_env(t, decay=0.16):
    return sum(a * math.exp(-(t - th) / decay) for th, a in HITS if t >= th)


def post(img, t, fi):
    e = hit_env(t)
    if e > 0.02:
        amp = 16 * S * e
        sx = amp * fx.hash_noise(11, t, 9)
        sy = amp * fx.hash_noise(29, t, 11)
        img = fx.affine(img, 1.0 + 0.012 * min(1, e), tx=sx, ty=sy, border=cv2.BORDER_REFLECT)
    white_end = t >= T_LOGO + 0.2
    if not white_end:
        img = fx.bloom(img, 0.74, 0.42)
    img = fx.chroma(img, (1.2 + 9 * min(1.0, e)) * S * (0.4 if white_end else 1.0))
    if white_end:
        img = np.clip(img, 0, 1) * (1 - (1 - _vig_all()) * 0.18)
    else:
        img = img * _vig_all()
    lum = fx.luminance(np.clip(img, 0, 1))[..., None]
    g = fx.grain(H, W, fi, 0.012 if white_end else 0.030)[..., None]
    img = img + g * (0.55 + 0.45 * (1 - lum))
    return np.clip(img, 0, 1)


def render_frame(fi):
    t = fi / FPS
    img = scene(t, fi)
    img = post(img, t, fi)
    return (img * 255 + 0.5).astype(np.uint8)


# ------------------------------------------------------------------ CLI
def extract_slots():
    SLOTS_DIR.mkdir(parents=True, exist_ok=True)
    for i, (st, en, clip, src_in, speed, tin, mot) in enumerate(EDL):
        d = SLOTS_DIR / f"{i:02d}"
        d.mkdir(exist_ok=True)
        start = max(0.0, src_in - PRE * speed)
        dur = (en - st + PRE + POST) * speed + (src_in - PRE * speed - start if src_in - PRE * speed < 0 else 0)
        for f in d.glob("*.jpg"):
            f.unlink()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-i", str(MEZZ / f"{clip}.mp4"),
                        "-t", f"{dur:.3f}", "-q:v", "2", str(d / "%04d.jpg")], check=True)
        n = len(list(d.glob("*.jpg")))
        (d / "meta.json").write_text(json.dumps(dict(start=start, n=n, clip=clip)))
        print(f"slot {i:02d} {clip} {src_in:.2f}s x{speed} -> {n} cuadros")


def stills(times):
    out = WORK / "stills"
    out.mkdir(exist_ok=True)
    for t in times:
        fi = int(round(float(t) * FPS))
        im = render_frame(fi)
        cv2.imwrite(str(out / f"f{fi:04d}.jpg"), cv2.cvtColor(im, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
        print("still", t, fi)


def _worker(fi):
    return fi, render_frame(fi).tobytes()


def render(start=0, end=None):
    import multiprocessing as mp
    OUT.mkdir(exist_ok=True)
    end = end or NFRAMES
    name = "teaser_preview_noaudio.mp4" if PREVIEW else "teaser_4k_noaudio.mp4"
    crf = "18" if PREVIEW else "12"
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "medium" if PREVIEW else "slow", "-crf", crf,
           "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
           str(OUT / name)]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nproc = int(os.environ.get("TEASER_PROCS", "4"))
    with mp.get_context("fork").Pool(nproc, maxtasksperchild=60) as pool:
        for k, (fi, buf) in enumerate(pool.imap(_worker, range(start, end), chunksize=2)):
            ff.stdin.write(buf)
            if k % 30 == 0:
                print(f"frame {fi}/{end}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("ok", OUT / name)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "render"
    if cmd == "slots":
        extract_slots()
    elif cmd == "still":
        stills(sys.argv[2:])
    elif cmd == "render":
        a = [x for x in sys.argv[2:] if not x.startswith("--")]
        render(int(a[0]) if a else 0, int(a[1]) if len(a) > 1 else None)
