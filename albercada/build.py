#!/usr/bin/env python3
"""Video recap de la Albercada (Somos Impacto) — vertical 9:16.

Todo el video se compone aquí, cuadro por cuadro, con numpy/OpenCV:
  · Apertura: alberca turquesa (cáusticas procedurales), pelota de playa blanca que rebota
    en el agua al ritmo del build-up y se estrella contra la pantalla en el golpe del coro
    (0:48.04 de la canción) → todo blanco → logo SOMOS → zoom a través de la "O".
  · Desarrollo: 24 tomas cortadas en los beats (118 BPM, 0.50867 s), grade de verano,
    punches de zoom, whips, flashes, barridos rosa cívico, textos mínimos.
  · Cierre: "Entre amigos, SOMOS más" → se van todas las palabras menos SOMOS, la pleca
    crece hasta llenar la pantalla y queda el logo oficial (rosa sobre blanco) al centro.

Uso:
  python3 build.py preview            # 540x960, rápido, renders/preview.mp4
  python3 build.py final              # 2160x3840 (4K), renders/albercada-somos-4k.mp4
  python3 build.py stills 1.0 2.0 ... # cuadros sueltos a 1080 para revisar
"""
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
CL = A / "clips"
FONTS = A / "fonts"
OUT = ROOT / "renders"

FPS = 30
DUR = 34.0
NF = int(round(DUR * FPS))
SONG_START = 46.0          # t=0 del video = 0:46.00 de la canción (golpe del build-up)
BEAT = 0.50867             # 118 BPM del coro
B0 = 2.04                  # 0:48.04 → golpe del coro = impacto de la pelota


def B(k):
    return B0 + k * BEAT


PINK = np.array([124, 0, 228], np.float32)  # Rosa Cívico #E4007C en BGR
WHITE = np.array([255, 255, 255], np.float32)


# ───────────────────────────── utilidades ─────────────────────────────
def clamp01(x):
    return min(1.0, max(0.0, x))


def ease_out_expo(u):
    u = clamp01(u)
    return 1.0 if u >= 1 else 1 - 2 ** (-10 * u)


def ease_in_expo(u):
    u = clamp01(u)
    return 0.0 if u <= 0 else 2 ** (10 * u - 10)


def ease_in_out_cubic(u):
    u = clamp01(u)
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def ease_out_cubic(u):
    u = clamp01(u)
    return 1 - (1 - u) ** 3


def ease_in_cubic(u):
    u = clamp01(u)
    return u ** 3


def ease_out_back(u, s=1.9):
    u = clamp01(u)
    u -= 1
    return u * u * ((s + 1) * u + s) + 1


def ease_in_out_expo(u):
    u = clamp01(u)
    if u <= 0 or u >= 1:
        return u
    return 2 ** (20 * u - 10) / 2 if u < 0.5 else (2 - 2 ** (-20 * u + 10)) / 2


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def lerp(a, b, u):
    return a + (b - a) * u


# ─────────────────────── capas RGBA (premultiplicadas) ───────────────────────
def pil_to_prem(img):
    """PIL RGBA → numpy BGRA float32 premultiplicado (0..1)."""
    a = np.asarray(img, np.float32) / 255.0
    rgb = a[..., :3][..., ::-1] * a[..., 3:4]
    return np.concatenate([rgb, a[..., 3:4]], axis=2).copy()


def place(frame, prem, cx, cy, scale=1.0, opacity=1.0, rot=0.0, blur=0.0):
    """Compone una capa premultiplicada centrada en (cx,cy) px de salida."""
    if opacity <= 0.003 or scale <= 0.001:
        return
    h, w = prem.shape[:2]
    H, W = frame.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), rot, scale)
    M[0, 2] += cx - w / 2
    M[1, 2] += cy - h / 2
    corners = np.array([[0, 0, 1], [w, 0, 1], [0, h, 1], [w, h, 1]], np.float32) @ M.T
    x0 = int(max(0, math.floor(corners[:, 0].min()) - 2))
    y0 = int(max(0, math.floor(corners[:, 1].min()) - 2))
    x1 = int(min(W, math.ceil(corners[:, 0].max()) + 2))
    y1 = int(min(H, math.ceil(corners[:, 1].max()) + 2))
    if x1 <= x0 or y1 <= y0:
        return
    M2 = M.copy()
    M2[0, 2] -= x0
    M2[1, 2] -= y0
    lay = cv2.warpAffine(prem, M2, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    if blur > 0.3:
        k = int(blur * 3) | 1
        lay = cv2.GaussianBlur(lay, (k, k), blur)
    lay *= opacity
    reg = frame[y0:y1, x0:x1].astype(np.float32)
    reg = reg * (1 - lay[..., 3:4]) + lay[..., :3] * 255.0
    frame[y0:y1, x0:x1] = np.clip(reg, 0, 255).astype(np.uint8)


class Ctx:
    """Recursos dependientes de la resolución de salida."""

    def __init__(self, W):
        self.W = W
        self.H = W * 16 // 9
        self.S = W / 1080.0
        self.fonts = {}
        self._text = {}
        self._load_brand()
        yy, xx = np.mgrid[0:self.H, 0:self.W].astype(np.float32)
        r = np.sqrt(((xx - self.W / 2) / (self.W / 2)) ** 2 + ((yy - self.H / 2) / (self.H / 2)) ** 2) / math.sqrt(2)
        self.vignette = (1 - 0.30 * np.clip(r, 0, 1) ** 2.4)[..., None].astype(np.float32)
        self.top_grad = np.clip(1 - yy[:, :1] / (900 * self.S), 0, 1) ** 1.6  # (H,1)

    def font(self, name, size):
        key = (name, int(size))
        if key not in self.fonts:
            self.fonts[key] = ImageFont.truetype(str(FONTS / name), int(size))
        return self.fonts[key]

    def text(self, s, name, size, color=(255, 255, 255), shadow=0.35, tracking=0):
        """Texto → capa premultiplicada (con sombra suave). size en px de diseño (1080)."""
        key = (s, name, size, color, shadow, tracking)
        if key in self._text:
            return self._text[key]
        f = self.font(name, size * self.S)
        pad = int(60 * self.S)
        if tracking:
            widths = [f.getlength(c) + tracking * self.S for c in s]
            tw = int(sum(widths))
        else:
            tw = int(f.getlength(s))
        asc, desc = f.getmetrics()
        th = asc + desc
        img = Image.new("RGBA", (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        if tracking:
            x = pad
            for c, cw in zip(s, widths):
                d.text((x, pad), c, font=f, fill=color + (255,))
                x += cw
        else:
            d.text((pad, pad), s, font=f, fill=color + (255,))
        if shadow > 0:
            sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
            sa = img.split()[3].filter(ImageFilter.GaussianBlur(14 * self.S))
            sh.putalpha(sa.point(lambda v: int(v * shadow)))
            sh2 = Image.new("RGBA", img.size, (0, 0, 0, 0))
            sh2.paste(sh, (0, int(6 * self.S)))
            img = Image.alpha_composite(sh2, img)
        out = (pil_to_prem(img), tw, th)
        self._text[key] = out
        return out

    def _load_brand(self):
        # Logo SOMOS: alfa a partir del canal verde (rosa #E4007C sobre blanco), ×4 para zooms.
        im = cv2.imread(str(A / "brand" / "somos.png"))
        g = im[:, :, 1].astype(np.float32)
        a = np.clip((255 - g) / 255.0, 0, 1)
        ys, xs = np.where(a > 0.05)
        a = a[ys.min() - 6: ys.max() + 7, xs.min() - 6: xs.max() + 7]
        self.logo_a1 = a  # 1689+12 x 293+12
        up = 4
        big = cv2.resize(a, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
        big = np.clip((big - 0.5) * 1.6 + 0.5, 0, 1)  # bordes nítidos
        self.logo_a4 = big.astype(np.float32)
        lh, lw = a.shape
        # contra-forma (hueco) de la primera "O"
        m = (a < 0.5).astype(np.uint8)
        n, lab, st, cen = cv2.connectedComponentsWithStats(m, 4)
        holes = [i for i in range(1, n) if st[i, 0] > 0 and st[i, 1] > 0 and st[i, 0] + st[i, 2] < lw
                 and st[i, 1] + st[i, 3] < lh and st[i, 4] > 500]
        holes.sort(key=lambda i: cen[i][0])
        o = holes[0]
        self.o_center = (float(cen[o][0]), float(cen[o][1]))  # en px del logo ×1
        hole = (lab == o).astype(np.float32)
        hole = cv2.dilate(hole, np.ones((3, 3), np.uint8))
        hole = cv2.GaussianBlur(hole, (3, 3), 0.8)
        hb = cv2.resize(hole, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
        hb = np.clip((hb - 0.5) * 1.6 + 0.5, 0, 1) * (1 - self.logo_a4)
        self.hole_a4 = hb.astype(np.float32)
        self.logo_w1, self.logo_h1 = lw, lh

        # Somos Impacto en tarjeta blanca redondeada (como en la e-card)
        imp = Image.open(A / "brand" / "somos-impacto.png").convert("RGB").crop((205, 680, 1775, 1475))
        S = self.S
        cw, ch = int(268 * S), int(150 * S)
        lw2 = int(232 * S)
        lh2 = int(imp.height * lw2 / imp.width)
        imp = imp.resize((lw2, lh2), Image.LANCZOS)
        pad = int(30 * S)
        card = Image.new("RGBA", (cw + 2 * pad, ch + 2 * pad), (0, 0, 0, 0))
        shadow = Image.new("L", card.size, 0)
        ImageDraw.Draw(shadow).rounded_rectangle((pad, pad + int(6 * S), pad + cw, pad + ch + int(6 * S)),
                                                 radius=int(26 * S), fill=90)
        shadow = shadow.filter(ImageFilter.GaussianBlur(12 * S))
        black = Image.new("RGBA", card.size, (0, 0, 0, 255))
        card = Image.composite(black, card, shadow)
        mask = Image.new("L", card.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((pad, pad, pad + cw, pad + ch), radius=int(26 * S), fill=255)
        white = Image.new("RGBA", card.size, (255, 255, 255, 255))
        card = Image.composite(white, card, mask)
        card.paste(imp, (pad + (cw - lw2) // 2, pad + (ch - lh2) // 2))
        self.impacto = pil_to_prem(card)


# ─────────────────────────── logo y pleca ───────────────────────────
def draw_logo_card(ctx, frame, cx, cy, width, card=True, hole_footage=None, opacity=1.0):
    """Dibuja el logo SOMOS (rosa) centrado en (cx,cy) con ancho `width` px de salida.

    card=True → todo lo que no es el logo se vuelve blanco (logo oficial sobre fondo blanco),
    salvo el hueco de la primera O, que deja ver `hole_footage` (zoom a través de la O).
    El centro de escala es el centro del logo.
    """
    H, W = frame.shape[:2]
    up = 4
    s = width / ctx.logo_w1 / up  # escala desde la versión ×4
    lh4, lw4 = ctx.logo_a4.shape
    M = np.array([[s, 0, cx - s * lw4 / 2], [0, s, cy - s * lh4 / 2]], np.float32)
    if card:
        a = cv2.warpAffine(ctx.logo_a4, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)[..., None]
        out = WHITE * (1 - a) + PINK * a
        if hole_footage is not None:
            h = cv2.warpAffine(ctx.hole_a4, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)[..., None]
            out = out * (1 - h) + hole_footage.astype(np.float32) * h
        if opacity < 1:
            out = frame.astype(np.float32) * (1 - opacity) + out * opacity
        frame[:] = np.clip(out, 0, 255).astype(np.uint8)
    else:
        # sólo dentro del bbox
        x0 = int(max(0, cx - width / 2 - 4)); x1 = int(min(W, cx + width / 2 + 4))
        hh = width * ctx.logo_h1 / ctx.logo_w1
        y0 = int(max(0, cy - hh / 2 - 4)); y1 = int(min(H, cy + hh / 2 + 4))
        if x1 <= x0 or y1 <= y0:
            return
        M2 = M.copy(); M2[0, 2] -= x0; M2[1, 2] -= y0
        a = cv2.warpAffine(ctx.logo_a4, M2, (x1 - x0, y1 - y0), flags=cv2.INTER_AREA, borderValue=0)[..., None]
        a = a * opacity
        reg = frame[y0:y1, x0:x1].astype(np.float32)
        frame[y0:y1, x0:x1] = np.clip(reg * (1 - a) + PINK * a, 0, 255).astype(np.uint8)


def draw_pill(frame, cx, cy, w, h, color=WHITE, opacity=1.0, shadow=0.0):
    """Pleca (cápsula) con antialias exacto por SDF."""
    H, W = frame.shape[:2]
    r = h / 2
    hw = max(0.0, w / 2 - r)
    ext = 4 + (40 if shadow else 0)
    x0 = int(max(0, cx - w / 2 - ext)); x1 = int(min(W, cx + w / 2 + ext))
    y0 = int(max(0, cy - h / 2 - ext)); y1 = int(min(H, cy + h / 2 + ext + 10))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    px = np.maximum(np.abs(xx + 0.5 - cx) - hw, 0)
    py = yy + 0.5 - cy
    d = np.sqrt(px * px + py * py) - r
    reg = frame[y0:y1, x0:x1].astype(np.float32)
    if shadow:
        ds = np.sqrt(px * px + (py - h * 0.08) ** 2) - r
        sa = (1 - smoothstep(-h * 0.05, h * 0.35, ds)) * shadow * opacity
        reg = reg * (1 - sa[..., None])
    a = np.clip(0.5 - d, 0, 1)[..., None] * opacity
    frame[y0:y1, x0:x1] = np.clip(reg * (1 - a) + color * a, 0, 255).astype(np.uint8)


# ─────────────────────────── alberca + pelota ───────────────────────────
def caustics(w, h, time):
    """Cáusticas de alberca (tileable water caustic), devuelve intensidad 0..1."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    TAU = 6.28318
    sc = 1.35
    px = np.mod(xs / w * sc * TAU, TAU) - 250.0
    py = np.mod(ys / w * sc * TAU, TAU) - 250.0
    ix, iy = px.copy(), py.copy()
    c = np.ones_like(px)
    inten = 0.005
    for n in range(5):
        t = time * (1.0 - 3.5 / (n + 1))
        nx = px + np.cos(t - ix) + np.sin(t + iy)
        ny = py + np.sin(t - iy) + np.cos(t + ix)
        ix, iy = nx, ny
        a = px / (np.sin(ix + t) / inten)
        b = py / (np.cos(iy + t) / inten)
        c += 1.0 / np.sqrt(a * a + b * b + 1e-9)
    c /= 5.0
    c = 1.17 - np.power(np.clip(c, 0, None), 1.4)
    return np.clip(np.power(np.abs(c), 8.0), 0, 1)


# Rebotes de la pelota sobre los golpes del build-up (0:46.00, 0:46.55, 0:47.12, 0:47.63)
CONTACTS = [0.0, 0.553, 1.117, 1.628]
GROUND = [(310, 420), (600, 790), (380, 1150), (575, 1010)]
ARC_H = [2.1, 2.6, 3.1]
BALL_R0 = 92.0   # radio aparente sobre el agua (px de diseño)
CAM_D = 10.0     # distancia cámara-agua (unidades de altura)
IMPACT = B0


def ball_state(t):
    """(gx, gy, h) posición en el agua (diseño) y altura sobre el agua."""
    if t < CONTACTS[-1]:
        for i in range(3):
            a, b = CONTACTS[i], CONTACTS[i + 1]
            if a <= t < b:
                u = (t - a) / (b - a)
                gx = lerp(GROUND[i][0], GROUND[i + 1][0], u)
                gy = lerp(GROUND[i][1], GROUND[i + 1][1], u)
                return gx, gy, 4 * ARC_H[i] * u * (1 - u)
        return GROUND[0][0], GROUND[0][1], 0.0
    u = clamp01((t - CONTACTS[-1]) / (IMPACT - CONTACTS[-1]))
    gx = lerp(GROUND[-1][0], 540, u)
    gy = lerp(GROUND[-1][1], 960, u)
    h = 9.55 * u ** 2.4
    return gx, gy, h


def rot_matrix(t):
    ax = np.array([0.35, 0.9, 0.25]); ax /= np.linalg.norm(ax)
    ang = 2.2 * t + 1.2 * t ** 3 + 0.6
    K = np.array([[0, -ax[2], ax[1]], [ax[2], 0, -ax[0]], [-ax[1], ax[0], 0]])
    R = np.eye(3) + math.sin(ang) * K + (1 - math.cos(ang)) * K @ K
    tilt = np.array([[1, 0, 0], [0, math.cos(0.5), -math.sin(0.5)], [0, math.sin(0.5), math.cos(0.5)]])
    return tilt @ R


def draw_ball(frame, cx, cy, r, t, whiten=0.0):
    H, W = frame.shape[:2]
    x0 = int(max(0, cx - r - 2)); x1 = int(min(W, cx + r + 3))
    y0 = int(max(0, cy - r - 2)); y1 = int(min(H, cy + r + 3))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    dx = (xx + 0.5 - cx) / r
    dy = (yy + 0.5 - cy) / r
    d2 = dx * dx + dy * dy
    d = np.sqrt(d2)
    alpha = np.clip((1 - d) * r + 0.5, 0, 1)
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    R = rot_matrix(t).astype(np.float32)
    bx = R[0, 0] * dx + R[1, 0] * dy + R[2, 0] * nz
    by = R[0, 1] * dx + R[1, 1] * dy + R[2, 1] * nz
    bz = R[0, 2] * dx + R[1, 2] * dy + R[2, 2] * nz
    phi = np.arctan2(by, bx) + math.pi
    wedge = 2 * math.pi / 6
    f = np.mod(phi, wedge) / wedge
    ring = np.sqrt(np.clip(1 - bz * bz, 0, 1))
    ad = np.minimum(f, 1 - f) * wedge * ring
    seam_w = 0.022 + 1.2 / max(r, 1)
    seam = np.clip(1 - ad / seam_w, 0, 1) ** 1.5
    pidx = np.floor(phi / wedge).astype(np.int32) % 2
    capr = 0.935
    cap = np.abs(bz) > capr
    capedge = np.clip(1 - np.abs(np.abs(bz) - capr) / (0.012 + 0.8 / max(r, 1)), 0, 1)
    seam = np.where(cap, 0, seam)
    valve = (bz > 0.992).astype(np.float32)
    base = np.where(pidx == 0, 0.985, 0.952)
    base = np.where(cap, 0.965, base)
    L = np.array([-0.45, -0.62, 0.64]); L /= np.linalg.norm(L)
    ndl = np.clip(dx * L[0] + dy * L[1] + nz * L[2], 0, 1)
    Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
    ndh = np.clip(dx * Hv[0] + dy * Hv[1] + nz * Hv[2], 0, 1)
    lum = base * (0.62 + 0.50 * ndl) * (1 - 0.26 * seam - 0.22 * capedge - 0.15 * valve)
    lum *= (0.90 + 0.10 * nz)
    spec = ndh ** 90 * 1.2 + ndh ** 12 * 0.10
    bounce = np.clip(dy, 0, 1) * 0.28 + (1 - nz) ** 3 * 0.25
    rch = lum * (1 - 0.55 * bounce) + spec
    gch = lum * (1 - 0.10 * bounce) + spec
    bch = lum * (1 + 0.03 * bounce) + spec
    col = np.stack([bch, gch, rch], axis=2) * 255
    col = col * (1 - whiten) + 255 * whiten
    a = alpha[..., None]
    reg = frame[y0:y1, x0:x1].astype(np.float32)
    frame[y0:y1, x0:x1] = np.clip(reg * (1 - a) + col * a, 0, 255).astype(np.uint8)


DROPS = np.random.default_rng(7).uniform(0, 1, (4, 12, 3))


def render_pool(ctx, t):
    W, H, S = ctx.W, ctx.H, ctx.S
    ww = min(W, 1080)
    wh = ww * 16 // 9
    ws = ww / 1080.0
    c = caustics(ww, wh, 31.0 + t * 0.85)
    yy, xx = np.mgrid[0:wh, 0:ww].astype(np.float32)
    # ondas de cada rebote
    rip = np.zeros_like(c)
    for i, tc in enumerate(CONTACTS):
        age = t - tc
        if age < 0 or age > 1.6:
            continue
        gx, gy = GROUND[i]
        dist = np.sqrt((xx / ws - gx) ** 2 + (yy / ws - gy) ** 2)
        for k, delay in enumerate((0.0, 0.16)):
            a2 = age - delay
            if a2 <= 0:
                continue
            R = BALL_R0 * 0.9 + 420 * a2 ** 0.75
            wd = 9 + 16 * a2
            amp = 0.55 * (1 - a2 / 1.45) ** 2 * (1 if k == 0 else 0.6)
            if amp <= 0:
                continue
            x = (dist - R) / wd
            rip += amp * (np.exp(-x * x) - 0.6 * np.exp(-((x + 1.6) ** 2)))
    vgrad = (yy / wh)[..., None]
    deep = np.array([168, 112, 6], np.float32) * (1 - vgrad) + np.array([190, 140, 12], np.float32) * vgrad
    mid = np.array([220, 196, 40], np.float32)
    k = np.clip(c * 1.25 + rip, -0.4, 1.4)[..., None]
    img = deep + (mid - deep) * np.clip(0.35 + 0.65 * smoothstep(0.0, 0.5, k), 0, 1)
    img = img + (np.array([255, 255, 245], np.float32) - img) * np.clip(k - 0.45, 0, 1) * 1.1
    img = np.clip(img, 0, 255).astype(np.uint8)
    if ww != W:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_CUBIC)
    frame = img
    gx, gy, h = ball_state(t)
    # sombra de la pelota sobre el agua
    sx, sy = (gx + h * 38) * S, (gy + h * 54) * S
    sr = BALL_R0 * (1 + 0.10 * h) * S
    sb = (14 + 9 * h) * S
    op = 0.42 / (1 + 0.45 * h)
    x0 = int(max(0, sx - sr - 3 * sb)); x1 = int(min(W, sx + sr + 3 * sb))
    y0 = int(max(0, sy - sr - 3 * sb)); y1 = int(min(H, sy + sr + 3 * sb))
    if x1 > x0 and y1 > y0:
        yy2, xx2 = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        dd = np.sqrt((xx2 - sx) ** 2 + (yy2 - sy) ** 2)
        sh = 1 - smoothstep(sr - sb, sr + sb, dd)
        reg = frame[y0:y1, x0:x1].astype(np.float32)
        frame[y0:y1, x0:x1] = (reg * (1 - op * sh[..., None]) + np.array([90, 60, 0]) * op * 0.3 * sh[..., None]).astype(np.uint8)
    # gotas del splash
    for i, tc in enumerate(CONTACTS):
        age = t - tc
        if 0 <= age < 0.42:
            gx0, gy0 = GROUND[i]
            for j in range(12):
                ang = DROPS[i, j, 0] * 2 * math.pi
                sp = 260 + 380 * DROPS[i, j, 1]
                hgt = 1.8 * DROPS[i, j, 2] * 4 * (age / 0.42) * (1 - age / 0.42)
                proj = CAM_D / (CAM_D - hgt)
                px = 540 + ((gx0 + math.cos(ang) * sp * age) - 540) * proj
                py = 960 + ((gy0 + math.sin(ang) * sp * age) - 960) * proj
                rr = (5 + 7 * DROPS[i, j, 2]) * (1 - age / 0.42) * proj
                if rr * S > 0.6:
                    cv2.circle(frame, (int(px * S * 16), int(py * S * 16)), int(rr * S * 16), (255, 255, 255),
                               -1, cv2.LINE_AA, 4)
    # pelota
    proj = CAM_D / (CAM_D - h)
    bx = (540 + (gx - 540) * proj) * S
    by = (960 + (gy - 960) * proj) * S
    r = BALL_R0 * proj * S
    whiten = float(smoothstep(IMPACT - 0.10, IMPACT, t))
    draw_ball(frame, bx, by, r, t, whiten)
    if whiten > 0:
        frame[:] = np.clip(frame.astype(np.float32) * (1 - whiten * 0.6) + 255 * whiten * 0.6, 0, 255).astype(np.uint8)
    return frame


# ─────────────────────────────── tomas ───────────────────────────────
GRADE = ("eq=contrast=1.07:brightness=-0.012:saturation=1.30:gamma=0.98,"
         "colorbalance=rs=-0.03:bs=0.04:rm=0.045:gm=0.01:bm=-0.035:rh=0.015:bh=-0.01,"
         "curves=all='0/0 0.18/0.15 0.5/0.52 0.85/0.88 1/0.97'")


class Shot:
    def __init__(self, clip, tin, b0, b1, speed=1.0, z=(1.0, 1.07), c=(0.5, 0.5), c1=None, entry="punch"):
        self.clip, self.tin, self.speed = clip, tin, speed
        self.t0, self.t1 = B(b0), B(b1)
        self.z, self.c, self.c1, self.entry = z, c, (c1 or c), entry
        self.proc = None
        self.idx = -1
        self.last = None

    def open(self, ctx):
        n = int(math.ceil((self.t1 - self.t0) * FPS)) + 4
        src = n / FPS * self.speed + 0.4
        vf = (f"setpts=(PTS-STARTPTS)/{self.speed},fps={FPS},"
              f"scale={ctx.W}:{ctx.H}:flags=lanczos,{GRADE},format=bgr24")
        cmd = ["ffmpeg", "-v", "error", "-ss", f"{self.tin:.3f}", "-i", str(CL / f"20261115_{self.clip}.mp4"),
               "-t", f"{src:.3f}", "-an", "-vf", vf, "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:"]
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=ctx.W * ctx.H * 3 * 2)
        self.fsize = ctx.W * ctx.H * 3
        self.shape = (ctx.H, ctx.W, 3)

    def frame(self, ctx, k):
        if self.proc is None:
            self.open(ctx)
        while self.idx < k:
            buf = self.proc.stdout.read(self.fsize)
            if len(buf) < self.fsize:
                break
            self.last = np.frombuffer(buf, np.uint8).reshape(self.shape)
            self.idx += 1
        return self.last

    def close(self):
        if self.proc:
            self.proc.stdout.close()
            self.proc.kill()
            self.proc.wait()
            self.proc = None


# (clip, entrada en s, beat inicio, beat fin, velocidad, zoom, centro de encuadre)
# La persona de playera y gorra azul (protagonista) en: 154211, 162027, 162021, 162145(8.6),
# 163220, 161532(final) — ~37 % del desarrollo, intercalado con mesa, comida y gente.
EDL = [
    # ── llegada: cielo, sombrillas, la terraza ──  (se ve primero dentro de la O)
    Shot("150439", 0.10, 2, 6, 1.45, (1.0, 1.10), (0.5, 0.42), entry="none"),
    Shot("153740", 0.40, 6, 8, 1.60, (1.06, 1.14), (0.55, 0.45), entry="whip"),
    Shot("153930", 1.30, 8, 10, 1.50, (1.05, 1.12), (0.55, 0.55)),
    Shot("150428", 2.10, 10, 12, 0.80, (1.10, 1.18), (0.45, 0.42), entry="whip"),
    # ── compartimos: mesa, pizzas, refrescos ──
    Shot("152219", 2.70, 12, 14, 1.0, (1.08, 1.15), (0.55, 0.55), entry="flash"),
    Shot("154211", 2.95, 14, 16, 1.0, (1.18, 1.30), (0.62, 0.70)),
    Shot("152227", 0.70, 16, 17, 1.0, (1.08, 1.12), (0.5, 0.55), entry="whip"),
    Shot("161532", 0.30, 17, 18, 1.25, (1.05, 1.10), (0.45, 0.45)),
    Shot("162506", 4.40, 18, 20, 1.0, (1.06, 1.12), (0.55, 0.62)),
    # ── platicamos ──
    Shot("162427", 1.40, 20, 22, 1.0, (1.12, 1.20), (0.62, 0.52), entry="sweep"),
    Shot("162145", 0.40, 22, 24, 1.0, (1.10, 1.18), (0.45, 0.55)),
    Shot("162027", 1.50, 24, 28, 1.0, (1.30, 1.45), (0.66, 0.33)),
    Shot("162856", 0.40, 28, 30, 1.0, (1.20, 1.30), (0.58, 0.40)),
    Shot("162021", 0.05, 30, 31, 1.0, (1.12, 1.20), (0.62, 0.36), entry="whip"),
    Shot("162145", 8.60, 31, 34, 1.0, (1.22, 1.36), (0.60, 0.32)),
    Shot("162027", 8.05, 34, 36, 1.0, (1.12, 1.20), (0.52, 0.40), entry="whip"),
    # ── construimos ──
    Shot("163220", 1.80, 36, 38, 1.0, (1.15, 1.25), (0.60, 0.33), entry="sweep"),
    Shot("152227", 2.40, 38, 39, 1.0, (1.08, 1.14), (0.55, 0.55)),
    Shot("150428", 4.50, 39, 40, 1.0, (1.10, 1.16), (0.45, 0.62)),
    Shot("162506", 0.30, 40, 42, 1.0, (1.10, 1.18), (0.45, 0.60), entry="whip"),
    Shot("162027", 4.30, 42, 44, 1.0, (1.28, 1.40), (0.66, 0.32)),
    Shot("161532", 4.30, 44, 46, 0.85, (1.15, 1.25), (0.48, 0.66), entry="whip"),
    Shot("162856", 5.40, 46, 48, 1.0, (1.18, 1.28), (0.58, 0.40)),
    Shot("163220", 5.40, 48, 52, 1.0, (1.18, 1.42), (0.60, 0.40), c1=(0.66, 0.36)),
    # ── cierre ──
    Shot("162506", 5.40, 52, 59, 1.0, (1.04, 1.16), (0.52, 0.55), entry="flash"),
]

FLASHES = [s.t0 for s in EDL if s.entry == "flash"]
SWEEPS = [s.t0 for s in EDL if s.entry == "sweep"]
WHIPS = [s.t0 for s in EDL if s.entry == "whip"]


def shot_at(t):
    for i, s in enumerate(EDL):
        if s.t0 <= t < s.t1:
            return i
    return len(EDL) - 1


def footage(ctx, t, shot_idx=None, extra_zoom=1.0):
    i = shot_at(t) if shot_idx is None else shot_idx
    s = EDL[i]
    k = int(round((t - s.t0) * FPS))
    src = s.frame(ctx, max(0, k))
    W, H = ctx.W, ctx.H
    u = clamp01((t - s.t0) / (s.t1 - s.t0))
    z = lerp(s.z[0], s.z[1], ease_in_out_cubic(u) * 0.6 + u * 0.4)
    cx = lerp(s.c[0], s.c1[0], ease_in_out_cubic(u)); cy = lerp(s.c[1], s.c1[1], ease_in_out_cubic(u))
    if s.entry in ("punch", "flash", "sweep"):
        z *= 1 + 0.10 * (1 - ease_out_expo((t - s.t0) / 0.28))
    # pulso de zoom en cada beat (más fuerte en el 1 de cada compás)
    if B(3) <= t < B(52):
        kb = math.floor((t - B0) / BEAT + 1e-6)
        dt = t - B(kb)
        amp = 0.024 if kb % 4 == 0 else 0.010
        z *= 1 + amp * math.exp(-dt / 0.09)
    z *= extra_zoom
    ox = oy = 0.0
    # whip: barrido horizontal con desenfoque de movimiento alrededor del corte
    wb = 0.0
    for tc in WHIPS:
        d = (t - tc) * FPS
        if -3 <= d < 3:
            p = 1 - abs(d + 0.5) / 3.5
            ox = (-1 if d < 0 else 1) * W * 0.22 * p ** 1.5
            wb = p
    srcx = cx * W; srcy = cy * H
    hw, hh = W / (2 * z), H / (2 * z)
    srcx = min(max(srcx, hw), W - hw); srcy = min(max(srcy, hh), H - hh)
    M = np.array([[z, 0, W / 2 + ox - z * srcx], [0, z, H / 2 + oy - z * srcy]], np.float32)
    out = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    if wb > 0.05:
        sm = cv2.resize(out, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        kl = max(3, int(W / 4 * 0.10 * wb) | 1)
        ker = np.ones((1, kl), np.float32) / kl
        sm = cv2.filter2D(sm, -1, ker, borderType=cv2.BORDER_REFLECT)
        out = cv2.resize(sm, (W, H), interpolation=cv2.INTER_LINEAR)
    out = (out.astype(np.float32) * ctx.vignette)
    return np.clip(out, 0, 255).astype(np.uint8)


# ───────────────────────────── textos ─────────────────────────────
F_TITLE = "Poppins-ExtraBoldItalic.ttf"
F_SUB = "HindSiliguri-SemiBold.ttf"


def draw_title(ctx, frame, t):
    """'Albercada' (como en la e-card) + 'así lo vivimos' en cápsula translúcida."""
    t_in, t_out = B(4), B(10)
    if not (t_in - 0.05 <= t < t_out + 0.6):
        return
    S = ctx.S
    word = "Albercada"
    f = ctx.font(F_TITLE, 172 * S)
    total = f.getlength(word) / S
    x = 540 - total / 2
    cy = 400
    for i, ch in enumerate(word):
        adv = f.getlength(word[: i + 1]) / S - f.getlength(word[:i]) / S
        prem, tw, th = ctx.text(ch, F_TITLE, 172)
        ti = t_in + i * 0.035
        u = (t - ti) / 0.5
        if u > 0:
            e = ease_out_expo(u)
            dy = (1 - e) * 120
            op = clamp01(u * 2.5)
            sc = 1 + 0.35 * (1 - e)
            to = (t - (t_out + i * 0.022)) / 0.32
            if to > 0:
                dy -= 90 * ease_in_cubic(to)
                op *= 1 - clamp01(to)
            place(frame, prem, (x + tw / S / 2) * S, (cy + dy) * S, sc, op, blur=(1 - e) * 6 * S)
        x += adv
    # cápsula "ASÍ LO VIVIMOS"
    t2 = B(5)
    if t >= t2:
        u = ease_out_expo((t - t2) / 0.45)
        uo = clamp01((t - t_out) / 0.3)
        prem, tw, th = ctx.text("ASÍ LO VIVIMOS", F_SUB, 46, shadow=0, tracking=7)
        pw = tw / S + 70
        ph = 84
        op = (1 - uo)
        draw_pill(frame, 540 * S, 560 * S, pw * S * u, ph * S, color=np.array([70, 48, 6], np.float32),
                  opacity=0.62 * op)
        if u > 0.3:
            place(frame, prem, 540 * S, (562 + 14 * (1 - u)) * S, 1.0, clamp01((u - 0.3) / 0.5) * op)


WORDS = [("Compartimos.", 12, 16), ("Platicamos.", 21, 24), ("Construimos.", 40, 44)]


def draw_words(ctx, frame, t):
    S = ctx.S
    for word, b0, b1 in WORDS:
        t0, t1 = B(b0), B(b1)
        if not (t0 <= t < t1 + 0.05):
            continue
        prem, tw, th = ctx.text(word, F_TITLE, 112, shadow=0.0)
        bw = tw / S + 80
        bh = 150
        cx, cy = 540, 1330
        # barra rosa (paralelogramo) que entra desde la izquierda y sale hacia la derecha
        ui = ease_out_expo((t - t0) / 0.30)
        uo = ease_in_expo((t - (t1 - 0.30)) / 0.30)
        left = cx - bw / 2 + bw * uo
        right = cx - bw / 2 + bw * ui
        if right - left > 1:
            sk = bh * 0.21
            pts = np.array([[left + sk, cy - bh / 2], [right + sk, cy - bh / 2],
                            [right - sk, cy + bh / 2], [left - sk, cy + bh / 2]], np.float32) * S
            cv2.fillPoly(frame, [np.round(pts * 16).astype(np.int32)], (124, 0, 228), cv2.LINE_AA, 4)
        # palabra
        u = ease_out_expo((t - t0 - 0.10) / 0.40)
        op = clamp01((t - t0 - 0.10) / 0.12) * (1 - clamp01((t - (t1 - 0.36)) / 0.16))
        kb = math.floor((t - B0) / BEAT + 1e-6)
        bump = 1 + 0.03 * math.exp(-(t - B(kb)) / 0.08) if t > t0 + 0.4 else 1.0
        place(frame, prem, cx * S, (cy + 4 + 40 * (1 - u)) * S, bump * (1 + 0.15 * (1 - u)), op)


def draw_bug(ctx, frame, t):
    """Somos Impacto arriba al centro durante el desarrollo."""
    t0, t1 = B(4.5), B(51)
    if not (t0 <= t < t1 + 0.4):
        return
    u = ease_out_back((t - t0) / 0.5, 1.6)
    op = clamp01((t - t0) / 0.15) * (1 - clamp01((t - t1) / 0.35))
    place(frame, ctx.impacto, 540 * ctx.S, 175 * ctx.S, u, op)


def draw_sweeps(ctx, frame, t):
    S = ctx.S
    for tc in SWEEPS:
        u = (t - (tc - 0.17)) / 0.36
        if not (0 <= u <= 1):
            continue
        e = ease_in_out_cubic(u)
        bw = 1400
        xc = lerp(-1100, 2180, e)
        sk = 380
        pts = np.array([[xc - bw / 2 + sk, -20], [xc + bw / 2 + sk, -20],
                        [xc + bw / 2 - sk, 1940], [xc - bw / 2 - sk, 1940]], np.float32) * S
        cv2.fillPoly(frame, [np.round(pts * 16).astype(np.int32)], (124, 0, 228), cv2.LINE_AA, 4)
        xw = xc - bw / 2 - 70
        pts2 = np.array([[xw - 40 + sk, -20], [xw + sk, -20], [xw - sk, 1940], [xw - 40 - sk, 1940]], np.float32) * S
        cv2.fillPoly(frame, [np.round(pts2 * 16).astype(np.int32)], (255, 255, 255), cv2.LINE_AA, 4)


def draw_flash(frame, t):
    a = 0.0
    for tc in FLASHES:
        if tc - 1 / FPS <= t < tc + 0.4:
            a = max(a, 0.85 * math.exp(-max(0.0, t - tc) / 0.07) if t >= tc else 0.35)
    if a > 0.01:
        frame[:] = np.clip(frame.astype(np.float32) * (1 - a) + 255 * a, 0, 255).astype(np.uint8)


# ─────────────────────────── cierre ───────────────────────────
C_ENTRE, C_AMIGOS, C_PLECA, C_MAS = B(52), B(53), B(54), B(55)
C_EXIT = B(56)
C_MOVE = (B(56.2), B(57.4))
C_FILL = (B(57.5), B(58.6))
LINE2_LOGO_W = 330.0


def closing_layout(ctx):
    S = ctx.S
    fs = 124
    pe, tw_e, _ = ctx.text("Entre", F_TITLE, fs)
    pa, tw_a, _ = ctx.text("amigos,", F_TITLE, fs)
    pm, tw_m, _ = ctx.text("más", F_TITLE, fs)
    sp = ctx.font(F_TITLE, fs * S).getlength(" ") / S
    l1 = tw_e / S + sp + tw_a / S
    x1 = 540 - l1 / 2
    lw = LINE2_LOGO_W
    lh = lw * ctx.logo_h1 / ctx.logo_w1
    pill_h = lh * 2.05
    pill_w = lw + lh * 1.7
    l2 = pill_w + 34 + tw_m / S
    x2 = 540 - l2 / 2
    return {
        "entre": (pe, x1 + tw_e / S / 2, 850),
        "amigos": (pa, x1 + tw_e / S + sp + tw_a / S / 2, 850),
        "mas": (pm, x2 + pill_w + 34 + tw_m / S / 2, 1028),
        "pill": (x2 + pill_w / 2, 1022, pill_w, pill_h, lw),
    }


def draw_closing(ctx, frame, t):
    if t < C_ENTRE:
        return
    S = ctx.S
    L = closing_layout(ctx)

    def word(key, tin):
        prem, cx, cy = L[key]
        u = (t - tin) / 0.42
        if u <= 0:
            return
        e = ease_out_back(u, 1.7)
        op = clamp01(u * 3)
        # salida: se disuelven (escala + desenfoque + desvanecido)
        uo = clamp01((t - (C_EXIT + {"entre": 0.0, "amigos": 0.06, "mas": 0.12}[key])) / 0.38)
        if uo >= 1:
            return
        eo = ease_in_cubic(uo)
        place(frame, prem, cx * S, (cy + 50 * (1 - min(1.0, e)) - 30 * eo) * S, (0.7 + 0.3 * e) * (1 + 0.25 * eo),
              op * (1 - eo), blur=eo * 18 * S)

    word("entre", C_ENTRE)
    word("amigos", C_AMIGOS)
    word("mas", C_MAS)
    if t >= C_PLECA:
        px, py, pw, ph, lw = L["pill"]
        u = ease_out_back((t - C_PLECA) / 0.45, 1.8)
        mv = ease_in_out_cubic((t - C_MOVE[0]) / (C_MOVE[1] - C_MOVE[0]))
        cx = lerp(px, 540, mv); cy = lerp(py, 960, mv)
        sc = u * lerp(1.0, 2.0, mv)
        fl = ease_in_out_expo((t - C_FILL[0]) / (C_FILL[1] - C_FILL[0]))
        w = lerp(pw * sc, 2700, fl); h = lerp(ph * sc, 2500, fl)
        # empuje final muy lento del logo
        drift = 1 + 0.08 * ease_out_cubic((t - C_FILL[1]) / (DUR - C_FILL[1]))
        draw_pill(frame, cx * S, cy * S, w * S, h * S, opacity=clamp01((t - C_PLECA) / 0.06), shadow=0.25 * (1 - fl))
        draw_logo_card(ctx, frame, cx * S, cy * S, lw * sc * S * drift, card=False)


# ─────────────────────────── apertura (logo) ───────────────────────────
LOGO_W = 860.0


def draw_intro_logo(ctx, frame, t):
    """t ∈ [IMPACT, B(3)): blanco + logo; desde B(2) zoom a través de la O."""
    S = ctx.S
    W, H = ctx.W, ctx.H
    u = (t - IMPACT) / 0.34
    sc = 0.55 + 0.45 * ease_out_back(u, 2.2)
    for kb in (1, 2):
        if t >= B(kb):
            sc *= 1 + 0.035 * math.exp(-(t - B(kb)) / 0.09)
    # sacudida del impacto
    amp = 22 * math.exp(-(t - IMPACT) / 0.10)
    shx = amp * math.sin((t - IMPACT) * 97.0)
    shy = amp * math.cos((t - IMPACT) * 71.0)
    cx, cy = 540 + shx, 960 + shy
    zt = (t - B(2)) / (B(3) - B(2))
    hole = None
    if zt > 0:
        e = ease_in_expo(zt) * 0.85 + ease_in_cubic(zt) * 0.15
        k = math.exp(math.log(46.0) * e)
        # el centro de la O se desplaza al centro de pantalla mientras crece
        ox_logo = (ctx.o_center[0] - ctx.logo_w1 / 2) * (LOGO_W / ctx.logo_w1)
        oy_logo = (ctx.o_center[1] - ctx.logo_h1 / 2) * (LOGO_W / ctx.logo_w1)
        ocx = lerp(540 + ox_logo, 540, ease_in_out_cubic(min(1.0, zt * 1.6)))
        ocy = lerp(960 + oy_logo, 960, ease_in_out_cubic(min(1.0, zt * 1.6)))
        cx = ocx - ox_logo * k
        cy = ocy - oy_logo * k
        sc = k
        hole = footage(ctx, t, 0, extra_zoom=lerp(1.45, 1.0, ease_out_cubic(zt)))
    frame[:] = 255
    draw_logo_card(ctx, frame, cx * S, cy * S, LOGO_W * sc * S, card=True, hole_footage=hole,
                   opacity=1.0)
    # onda rosa en el blanco al golpe (eco del agua)
    if zt <= 0:
        for j, dl in enumerate((0.0, 0.13)):
            a2 = t - IMPACT - dl
            if 0 < a2 < 0.9:
                R = 260 + 1100 * ease_out_cubic(a2 / 0.9)
                op = 0.45 * (1 - a2 / 0.9) ** 1.5 * (1 if j == 0 else 0.6)
                th = max(1, int((10 - 6 * a2) * S))
                ov = frame.copy()
                cv2.circle(ov, (int(540 * S * 16), int(960 * S * 16)), int(R * S * 16), (124, 0, 228), th, cv2.LINE_AA, 4)
                frame[:] = cv2.addWeighted(ov, op, frame, 1 - op, 0)


# ─────────────────────────── cuadro completo ───────────────────────────
def render_frame(ctx, t):
    if t < IMPACT:
        return render_pool(ctx, t)
    if t < B(3):
        frame = np.empty((ctx.H, ctx.W, 3), np.uint8)
        draw_intro_logo(ctx, frame, t)
        return frame
    if t >= C_FILL[1] + 0.05:
        frame = np.full((ctx.H, ctx.W, 3), 255, np.uint8)
        draw_closing(ctx, frame, t)
        return frame
    frame = footage(ctx, t)
    # oscurecer/desenfocar la última toma bajo el texto del cierre
    if t >= C_ENTRE - 0.05:
        e = ease_out_cubic((t - C_ENTRE) / 0.5)
        sm = cv2.resize(frame, (ctx.W // 4, ctx.H // 4), interpolation=cv2.INTER_AREA)
        sm = cv2.GaussianBlur(sm, (0, 0), 3.0 * e + 0.01)
        bl = cv2.resize(sm, (ctx.W, ctx.H), interpolation=cv2.INTER_LINEAR)
        frame = cv2.addWeighted(frame, 1 - 0.75 * e, bl, 0.75 * e, 0)
        frame = (frame.astype(np.float32) * (1 - 0.30 * e)).astype(np.uint8)
    # degradado superior para el título
    if B(3) <= t < B(11):
        a = clamp01((t - B(3.5)) / 0.3) * (1 - clamp01((t - B(10.3)) / 0.4))
        if a > 0:
            g = (ctx.top_grad * 0.45 * a)[..., None]
            frame = (frame.astype(np.float32) * (1 - g)).astype(np.uint8)
    draw_flash(frame, t)
    draw_title(ctx, frame, t)
    draw_words(ctx, frame, t)
    draw_bug(ctx, frame, t)
    draw_sweeps(ctx, frame, t)
    draw_closing(ctx, frame, t)
    return frame


# ─────────────────────────── audio y salida ───────────────────────────
def build_audio():
    OUT.mkdir(exist_ok=True)
    raw = OUT / "mix_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(A / "cancion.m4a"), "-af",
                    f"atrim=start={SONG_START}:duration={DUR},asetpts=PTS-STARTPTS,"
                    f"afade=t=in:d=0.03,afade=t=out:st={DUR - 1.6:.2f}:d=1.6",
                    "-ar", "48000", "-ac", "2", str(raw)], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.0:LRA=11",
                    "-ar", "48000", str(OUT / "audio.wav")], check=True)


def render(W, out, crf=16, preset="slow", t_from=0.0, t_to=DUR):
    ctx = Ctx(W)
    build_audio()
    f0, f1 = int(round(t_from * FPS)), int(round(t_to * FPS))
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ctx.W}x{ctx.H}",
         "-r", str(FPS), "-i", "pipe:", "-ss", f"{t_from:.3f}", "-i", str(OUT / "audio.wav"),
         "-map", "0:v", "-map", "1:a", "-t", f"{(f1 - f0) / FPS:.3f}",
         "-c:v", "libx264", "-crf", str(crf), "-preset", preset, "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", str(out)],
        stdin=subprocess.PIPE)
    active = set()
    for fi in range(f0, f1):
        t = fi / FPS
        # abrir/cerrar lectores según la toma vigente (la primera también se usa dentro de la O)
        need = {shot_at(t)} if t >= B(2) - 0.02 else set()
        for i in list(active - need):
            if EDL[i].t1 < t:
                EDL[i].close()
                active.discard(i)
        active |= need
        frame = render_frame(ctx, t)
        enc.stdin.write(np.ascontiguousarray(frame).tobytes())
        if fi % 30 == 0:
            print(f"  {t:5.1f}s", flush=True)
    enc.stdin.close()
    enc.wait()
    for s in EDL:
        s.close()
    print("listo:", out)


def stills(times, W=1080):
    ctx = Ctx(W)
    OUT.mkdir(exist_ok=True)
    for t in times:
        for s in EDL:
            s.close(); s.idx = -1; s.last = None
        f = render_frame(ctx, t)
        p = OUT / f"still_{t:06.2f}.jpg"
        cv2.imwrite(str(p), f, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(p)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "preview"
    if cmd == "preview":
        render(540, OUT / "preview.mp4", crf=20, preset="veryfast")
    elif cmd == "hd":
        render(1080, OUT / "albercada-somos-1080.mp4", crf=17, preset="slow")
    elif cmd == "final":
        render(2160, OUT / "albercada-somos-4k.mp4", crf=16, preset="slow")
    elif cmd == "stills":
        stills([float(x) for x in sys.argv[2:]])
