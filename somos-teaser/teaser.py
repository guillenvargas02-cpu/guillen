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
def fr(t):
    """Redondea un tiempo al cuadro exacto."""
    return round(t * FPS) / FPS


# ------------------------------------------------------------------ tiempos — música: propuesta 3 (152 BPM, Re)
# Tramo A de la canción: tensión → silencio → drop (77.27 s) = la TV se enciende y entra el material.
# Tramo B: tensión → silencio → golpe (127.37 s) = SOMOS en solitario; cierra con la TV apagándose.
T_OPEN = 36 / 30  # drop: la línea de luz se abre a la imagen
MUSIC_A_IN = 77.27 - T_OPEN
T_DOT = fr(0.10)  # aparece el punto de luz
T_LINE = fr(0.40)  # el punto se estira en línea
T_END = fr(97.87 - MUSIC_A_IN)  # fin del montaje (corte al tramo B de la canción)
MUSIC_B_IN = 124.17
T_CLAP2 = T_END + 24 / 30  # aparece MUY PRONTO (en el compás)
T_SIL = T_END + (126.83 - MUSIC_B_IN)  # silencio previo al golpe
T_LOGO = T_END + 96 / 30  # golpe 127.37 s: SOMOS en solitario
T_TV = fr(T_LOGO + 2.1)
TV_END = T_TV + 0.42
TOTAL = fr(TV_END + 0.07)
NFRAMES = int(round(TOTAL * FPS))


def m2t(m):
    """Tiempo de la canción (tramo A) → tiempo del video, redondeado a cuadro."""
    return fr(m - MUSIC_A_IN)


HITS = [(T_LOGO, 0.45)]

PRE, POST = 0.3, 0.3  # márgenes extraídos alrededor de cada fragmento

# ------------------------------------------------------------------ EDL
# clips: A=IMG_8097 B=IMG_8114(solo pantalla) C=IMG_8115 D=IMG_8120 E=163428 F=163233 G=163217
#        H=170555 I=171755 J=IMG_8111 K=173204 L=173909 M=174057
# Cada momento del material se usa una sola vez, a velocidad real. Cortes en los golpes de la canción.
# Transiciones limpias (sin deformar a nadie): cut, flash, punch (acercamiento rápido), leak (fuga de luz).
_CUTS = [77.30, 78.37, 79.81, 81.22, 82.52, 83.57, 84.61, 85.40, 86.70, 87.75, 88.79, 89.84, 90.88, 92.32, 93.74,
         94.53, 95.71, 96.87, 97.87]
_SHOTS = [  # (clip, entrada, transición, movimiento(z0, z1, cx, cy, dx, dy)) — encuadres distintos, sin repetir
    ("L", 1.00, "tvon", (1.06, 1.12, 0.45, 0.45, 0, 0)),    # la TV se enciende: el conductor escribe sus notas
    ("K", 4.20, "cut", (1.04, 1.10, 0.5, 0.4, 0, 0)),       # el equipo arma las lámparas bajo el candil
    ("H", 0.50, "punch", (1.04, 1.10, 0.45, 0.5, 0, 0)),    # conductor tras la cámara
    ("A", 9.60, "cut", (1.06, 1.12, 0.5, 0.45, 0, 0)),      # el conductor gesticula, de frente
    ("B", 11.0, "cut", (1.06, 1.14, 0.5, 0.42, 0, 0)),      # pantalla del switcher
    ("E", 2.40, "leak", (1.04, 1.10, 0.6, 0.35, 0, 0)),     # se revela la lámpara de globo
    ("C", 5.20, "flash", (1.08, 1.12, 0.55, 0.5, 0, 0)),    # el saludo (breve)
    ("A", 5.30, "cut", (1.10, 1.04, 0.55, 0.45, 0, 0)),     # conductor de perfil, de cerca
    ("M", 3.00, "punch", (1.04, 1.10, 0.5, 0.45, 0, 0)),    # escribe mientras lo observan
    ("G", 0.20, "cut", (1.04, 1.10, 0.5, 0.6, 0, 0)),       # visor de cámara en primer plano
    ("J", 0.30, "flash", (1.04, 1.10, 0.5, 0.45, 0, 0)),    # conductor riendo
    ("K", 9.50, "cut", (1.04, 1.10, 0.5, 0.45, 0, 0)),      # camarógrafo ajusta la cámara
    ("D", 9.20, "leak", (1.04, 1.10, 0.5, 0.45, 0, 0)),     # equipo ajustando luces
    ("C", 11.0, "flash", (1.06, 1.12, 0.5, 0.5, 0, 0)),     # entrevista a dos
    ("D", 0.50, "cut", (1.04, 1.10, 0.5, 0.45, 0, 0)),      # charla del equipo, de pie
    ("J", 6.40, "cut", (1.06, 1.14, 0.55, 0.5, 0, 0)),      # invitado tras la cámara
    ("G", 2.70, "punch", (1.04, 1.10, 0.5, 0.55, 0, 0)),    # conductor e invitado conversan, cámara en primer plano
    ("B", 14.6, "flash", (1.08, 1.18, 0.5, 0.42, 0, 0)),    # el programa en pantalla
]
EDL = [(T_OPEN if k == 0 else m2t(_CUTS[k]), T_END if k == len(_SHOTS) - 1 else m2t(_CUTS[k + 1]),
        c, src, 1.0, tin, mot) for k, (c, src, tin, mot) in enumerate(_SHOTS)]


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


def montage(t, fi):
    """Montaje con cortes limpios en los golpes de la canción (sin glitch ni desenfoques que deformen)."""
    i = slot_at(t)
    st, en, clip, src_in, speed, tin, mot = EDL[i]
    u = t - st
    img = footage_frame(i, u)
    if tin == "flash":
        k = 0.85 if i == 0 else 0.55
        img = img + k * env_hit(t, st, 0, 0.07) * np.array([1.0, 0.94, 0.9], np.float32)
    elif tin == "leak":
        img = img + light_leak(t, 0.9 * env_hit(t, st, 0, 0.30), i)
    elif tin == "punch" and u < 0.22:  # acercamiento rápido que se asienta (solo escala)
        img = fx.affine(img, 1 + 0.10 * (1 - ease_out(u / 0.22, 3)), border=cv2.BORDER_REFLECT)
    if i == len(EDL) - 1:  # último fragmento: se apaga hacia la línea de luz
        img = img * (1 - ease_in(lin(t, T_END - 0.20, T_END), 2))
    return img


# ------------------------------------------------------------------ escena completa
def tv_on_pre(t):
    """Antes del drop: un punto de luz que aparece de golpe y se dispara en una línea (reverso del apagado)."""
    img = np.zeros((H, W, 3), np.float32)
    if t < T_DOT:
        return img
    if t < T_LINE:
        q = ease_out_back(lin(t, T_DOT, T_DOT + 0.12), 2.2)
        g = np.zeros((H, W), np.float32)
        cv2.circle(g, (W // 2, H // 2), max(1, int(8 * S * q)), 1.0, -1, cv2.LINE_AA)
        g = fx.blur(g, 3 * S) * 1.7 + fx.soft_blur(g, 34 * S) * 0.9
        return img + g[..., None] * min(1.0, q)
    p = fx.ease_out_expo(lin(t, T_LINE, T_LINE + 0.14))
    tens = ease_in(lin(t, T_LINE + 0.25, T_OPEN), 2)  # en el silencio la línea se tensa
    flick = 1 + 0.06 * math.sin(t * 110) * tens
    return img + streak(W / 2, H / 2, (10 + 540 * p + 60 * tens) * S, (2.0 + 1.8 * tens) * S, (1.25 + 0.6 * tens) * flick)


def tv_on(img, u):
    """En el drop: la línea se abre verticalmente a la imagen (reverso exacto de `tv_off`)."""
    D = 0.11
    if u >= D:
        return img * (1 + 0.45 * math.exp(-(u - D) / 0.07))
    q = ease_out(u / D, 2.6)
    sy = max(2.0 / H, q)
    sx = 1 + 0.06 * (1 - q)
    hh, ww = max(2, int(H * sy)), int(W * sx)
    sq = cv2.resize(img, (ww, hh), interpolation=cv2.INTER_AREA) * (1 + 1.2 * (1 - q))
    out = np.zeros_like(img)
    x0, y0 = (W - ww) // 2, (H - hh) // 2
    xa, xb = max(0, x0), min(W, x0 + ww)
    out[y0:y0 + hh, xa:xb] = sq[:, xa - x0:xb - x0]
    return out + streak(W / 2, H / 2, W * 0.6, 3 * S, 0.8 * (1 - q))


def scene(t, fi):
    if t < T_OPEN:
        return tv_on_pre(t)
    if t < T_END:
        img = montage(t, fi)
        if t - T_OPEN < 0.5:
            img = tv_on(img, t - T_OPEN)
        return img
    return ending(t, fi)


# ------------------------------------------------------------------ cierre: línea de luz → blanco → SOMOS → TV vieja que se apaga
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
    if t < T_SIL:  # cuadro aparte: MUY PRONTO, suspenso
        dt = t - T_CLAP2
        span = T_SIL - T_CLAP2
        if dt < 0:  # la línea crece (aún sin texto)
            g = ease_out(lin(t, T_END, T_CLAP2), 3)
            return img + streak(W / 2, H / 2, (60 + 480 * g) * S, 2.2 * S, 0.4 + 0.9 * g)
        trk = round(0.40 + 0.16 * lin(dt, 0, span), 3)
        txt = _text_big(trk)
        th = txt.shape[0]
        opn = ease_out(lin(dt, 0.0, 0.28), 3) * (1 - ease_in(lin(dt, span - 0.24, span), 3))
        hh = th * 0.62 * opn
        lay = txt.copy()
        yy = np.abs(np.arange(th, dtype=np.float32) - th / 2)[:, None]
        lay[..., 3] *= clamp01((hh - yy) / (3 * S))
        img = fx.paste(img, lay, W / 2 - lay.shape[1] / 2, H / 2 - th / 2, 0.95)
        li = 1.6 * env_hit(t, T_CLAP2, 0, 0.12) + 0.18 + 1.2 * ease_in(lin(dt, span - 0.25, span), 2)
        half = (450 + 120 * (1 - opn)) * S
        img = img + streak(W / 2, H / 2 - hh, half, 1.8 * S, li * 0.6) + streak(W / 2, H / 2 + hh, half, 1.8 * S, li * 0.6)
        return img
    if t < T_LOGO:  # silencio: solo la línea, tensa, antes del golpe
        p = lin(t, T_SIL, T_LOGO)
        return img + streak(W / 2, H / 2, (520 + 200 * p) * S, (2.0 + 1.5 * p) * S, 1.1 + 0.6 * p)
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
    if e > 0.02 and not (T_OPEN <= t < T_END):  # sacudida solo en el logo, nunca en el material
        amp = 12 * S * e
        sx = amp * fx.hash_noise(11, t, 9)
        sy = amp * fx.hash_noise(29, t, 11)
        img = fx.affine(img, 1.0 + 0.01 * min(1, e), tx=sx, ty=sy, border=cv2.BORDER_REFLECT)
    white_end = t >= T_LOGO + 0.2
    if not white_end:
        img = fx.bloom(img, 0.74, 0.42)
    if white_end:
        img = np.clip(img, 0, 1) * (1 - (1 - _vig_all()) * 0.18)
    else:
        img = img * _vig_all()
    lum = fx.luminance(np.clip(img, 0, 1))[..., None]
    g = fx.grain(H, W, fi, 0.012 if white_end else 0.026)[..., None]
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
