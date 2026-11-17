#!/usr/bin/env python3
"""Video recap de la Albercada (Somos Impacto) — vertical 9:16, v2.

Todo el video se compone aquí, cuadro por cuadro, con numpy/OpenCV:
  · Apertura (0–2.04 s): alberca turquesa; un flotador blanco con SOMOS impreso cae al agua en
    el build-up y flota; Somos Impacto aparece debajo. En el golpe del coro (0:48.04 de la
    canción) un splash de agua cubre la pantalla y abre a la primera toma.
  · Desarrollo: tomas variadas (planos abiertos, detalles, close-ups) cortadas en los beats
    (118 BPM, 0.50867 s). Transiciones suaves: empujes con desenfoque de movimiento, fundidos
    con zoom y oleadas de agua. Textos: Albercada · así lo vivimos → Compartimos. → No pudo
    faltar la pizza 🍕 → Conversamos. → Nos divertimos. → Entre amigos, SOMOS más.
  · Cierre: se van todas las palabras menos SOMOS; su pleca crece a pantalla completa y queda
    el logo oficial (rosa sobre blanco) al centro.

Uso:
  python3 build.py preview            # 540x960 rápido → renders/preview.mp4
  python3 build.py final              # 2160x3840 (4K) → renders/albercada-somos-4k.mp4
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
SONG_START = 46.0          # t=0 del video = 0:46.00 de la canción
BEAT = 0.50867             # 118 BPM del coro
B0 = 2.04                  # 0:48.04 → golpe del coro = splash


def B(k):
    return B0 + k * BEAT


PINK = np.array([124, 0, 228], np.float32)  # Rosa Cívico #E4007C (BGR)
WHITE = np.array([255, 255, 255], np.float32)
F_TITLE = "Poppins-ExtraBoldItalic.ttf"
F_SUB = "HindSiliguri-SemiBold.ttf"


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


def ease_in_out_sine(u):
    u = clamp01(u)
    return -(math.cos(math.pi * u) - 1) / 2


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
    interp = cv2.INTER_AREA if scale < 0.7 else cv2.INTER_LINEAR
    lay = cv2.warpAffine(prem, M2, (x1 - x0, y1 - y0), flags=interp,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    if blur > 0.3:
        k = int(blur * 3) | 1
        lay = cv2.GaussianBlur(lay, (k, k), blur)
    lay *= opacity
    reg = frame[y0:y1, x0:x1].astype(np.float32)
    reg = reg * (1 - lay[..., 3:4]) + lay[..., :3] * 255.0
    frame[y0:y1, x0:x1] = np.clip(reg, 0, 255).astype(np.uint8)


def soft_shadow(img, blur, op, dy):
    """Agrega sombra suave debajo de una imagen PIL RGBA (con margen ya incluido)."""
    sa = img.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * op))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(sa)
    sh2 = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh2.paste(sh, (0, int(dy)))
    return Image.alpha_composite(sh2, img)


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
        self.vignette = (1 - 0.28 * np.clip(r, 0, 1) ** 2.4)[..., None].astype(np.float32)
        self.top_grad = np.clip(1 - yy[:, :1] / (900 * self.S), 0, 1) ** 1.6
        self.bot_grad = np.clip((yy[:, :1] - 1000 * self.S) / (920 * self.S), 0, 1) ** 1.4

    def font(self, name, size):
        key = (name, int(size))
        if key not in self.fonts:
            self.fonts[key] = ImageFont.truetype(str(FONTS / name), int(size))
        return self.fonts[key]

    def text(self, s, name, size, color=(255, 255, 255), shadow=0.35, tracking=0):
        """Texto → (capa premultiplicada, ancho px, alto px). size en px de diseño (1080)."""
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
            img = soft_shadow(img, 14 * self.S, shadow, 6 * self.S)
        out = (pil_to_prem(img), tw, th)
        self._text[key] = out
        return out

    def _load_brand(self):
        S = self.S
        # Logo SOMOS: alfa a partir del canal verde (rosa #E4007C sobre blanco), ×4 para nitidez.
        im = cv2.imread(str(A / "brand" / "somos.png"))
        g = im[:, :, 1].astype(np.float32)
        a = np.clip((255 - g) / 255.0, 0, 1)
        ys, xs = np.where(a > 0.05)
        a = a[ys.min() - 6: ys.max() + 7, xs.min() - 6: xs.max() + 7]
        self.logo_a1 = np.ascontiguousarray(a.astype(np.float32))
        big = cv2.resize(a, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
        self.logo_a4 = np.clip((big - 0.5) * 1.6 + 0.5, 0, 1).astype(np.float32)
        self.logo_h1, self.logo_w1 = a.shape

        # Somos Impacto en tarjeta blanca redondeada (como en la e-card) — sólo en la apertura
        imp = Image.open(A / "brand" / "somos-impacto.png").convert("RGB").crop((205, 680, 1775, 1475))
        cw, ch = int(330 * S), int(185 * S)
        lw2 = int(288 * S)
        lh2 = int(imp.height * lw2 / imp.width)
        imp = imp.resize((lw2, lh2), Image.LANCZOS)
        pad = int(40 * S)
        card = Image.new("RGBA", (cw + 2 * pad, ch + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(card).rounded_rectangle((pad, pad, pad + cw, pad + ch), radius=int(32 * S),
                                               fill=(255, 255, 255, 255))
        card.paste(imp, (pad + (cw - lw2) // 2, pad + (ch - lh2) // 2))
        card = soft_shadow(card, 16 * S, 0.45, 10 * S)
        self.impacto = pil_to_prem(card)

        # Ícono de pizza (con sombra)
        pz = Image.open(A / "brand" / "pizza.png").convert("RGBA")
        pw = int(430 * S)
        pz = pz.resize((pw, int(pz.height * pw / pz.width)), Image.LANCZOS)
        pad = int(50 * S)
        canvas = Image.new("RGBA", (pz.width + 2 * pad, pz.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(pz, (pad, pad), pz)
        self.pizza = pil_to_prem(soft_shadow(canvas, 18 * S, 0.45, 14 * S))


# ─────────────────────────── logo y pleca ───────────────────────────
def draw_logo(ctx, frame, cx, cy, width, opacity=1.0):
    """Logo SOMOS (rosa) centrado en (cx,cy) px de salida, ancho `width` px."""
    H, W = frame.shape[:2]
    s = width / ctx.logo_w1 / 4
    lh4, lw4 = ctx.logo_a4.shape
    x0 = int(max(0, cx - width / 2 - 4)); x1 = int(min(W, cx + width / 2 + 4))
    hh = width * ctx.logo_h1 / ctx.logo_w1
    y0 = int(max(0, cy - hh / 2 - 4)); y1 = int(min(H, cy + hh / 2 + 4))
    if x1 <= x0 or y1 <= y0:
        return
    M = np.array([[s, 0, cx - s * lw4 / 2 - x0], [0, s, cy - s * lh4 / 2 - y0]], np.float32)
    a = cv2.warpAffine(ctx.logo_a4, M, (x1 - x0, y1 - y0), flags=cv2.INTER_AREA, borderValue=0)[..., None]
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


# ─────────────────────────── agua ───────────────────────────
def caustics(w, h, time, sc=1.35):
    """Cáusticas de alberca (tileable water caustic), intensidad 0..1."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    TAU = 6.28318
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


def water_color(c, extra=0.0, vgrad=None):
    """Intensidad de cáustica → color turquesa de alberca (BGR uint8)."""
    h, w = c.shape
    if vgrad is None:
        vgrad = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    deep = np.array([168, 112, 6], np.float32) * (1 - vgrad) + np.array([190, 140, 12], np.float32) * vgrad
    mid = np.array([222, 198, 42], np.float32)
    k = np.clip(c * 1.25 + extra, -0.4, 1.4)[..., None]
    img = deep + (mid - deep) * np.clip(0.35 + 0.65 * smoothstep(0.0, 0.5, k), 0, 1)
    img = img + (np.array([255, 255, 245], np.float32) - img) * np.clip(k - 0.45, 0, 1) * 1.1
    return np.clip(img, 0, 255).astype(np.uint8)


# ─────────────────────────── flotador SOMOS ───────────────────────────
RING_R, RING_r = 240.0, 96.0        # radio mayor / radio del tubo (px de diseño)
PHI_L = 0.60                        # medio alto del logo impreso, en radianes del tubo
CAM_D = 10.0
T_LAND = 1.117                      # cae al agua en el golpe de 0:47.12
RING_G = (540.0, 870.0)


def draw_ring(ctx, frame, cx, cy, k, alpha):
    """Flotador blanco (toro visto desde arriba) con SOMOS impreso una vez.

    (cx,cy) centro en px de salida; k = px de salida por unidad de diseño; alpha = giro.
    """
    H, W = frame.shape[:2]
    Ro = (RING_R + RING_r) * k
    x0 = int(max(0, cx - Ro - 2)); x1 = int(min(W, cx + Ro + 3))
    y0 = int(max(0, cy - Ro - 2)); y1 = int(min(H, cy + Ro + 3))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    px = xx + 0.5 - cx
    py = yy + 0.5 - cy
    rho = np.sqrt(px * px + py * py) + 1e-6
    s = (rho / k - RING_R) / RING_r
    a = np.clip((1 - np.abs(s)) * RING_r * k + 0.5, 0, 1)
    sc = np.clip(s, -1, 1)
    nz = np.sqrt(1 - sc * sc)
    ux, uy = px / rho, py / rho
    nx, ny = sc * ux, sc * uy
    # logo impreso (una sola vez, en el arco superior)
    lh, lw = ctx.logo_a1.shape
    aspect = lw / lh
    delta = aspect * (2 * PHI_L * RING_r) / (2 * RING_R)
    theta = np.arctan2(py, px) - alpha
    phi = np.arcsin(sc)
    v = (PHI_L - phi) / (2 * PHI_L)
    ink = np.zeros_like(s)
    for cth in (-math.pi / 2,):  # un solo SOMOS, arriba
        dth = np.mod(theta - cth + math.pi, 2 * math.pi) - math.pi
        u = dth / (2 * delta) + 0.5
        mx = (u * (lw - 1)).astype(np.float32)
        my = (v * (lh - 1)).astype(np.float32)
        ink = np.maximum(ink, cv2.remap(ctx.logo_a1, mx, my, cv2.INTER_LINEAR, borderValue=0))
    # costura en el ecuador exterior / interior (sutil)
    seam = np.exp(-((np.abs(sc) - 0.985) / 0.012) ** 2) * 0.25
    L = np.array([-0.42, -0.60, 0.68]); L /= np.linalg.norm(L)
    ndl = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
    ndh = np.clip(nx * Hv[0] + ny * Hv[1] + nz * Hv[2], 0, 1)
    spec = ndh ** 70 * 1.15 + ndh ** 9 * 0.12
    lum = (0.60 + 0.52 * ndl) * (0.86 + 0.14 * nz) * (1 - seam)
    bounce = (1 - nz) ** 2 * 0.40
    alb_b = 1.0 * (1 - ink) + PINK[0] / 255 * ink
    alb_g = 1.0 * (1 - ink) + PINK[1] / 255 * ink
    alb_r = 1.0 * (1 - ink) + PINK[2] / 255 * ink
    bch = alb_b * lum * (1 + 0.03 * bounce) + spec
    gch = alb_g * lum * (1 - 0.10 * bounce) + spec
    rch = alb_r * lum * (1 - 0.50 * bounce) + spec
    col = np.stack([bch, gch, rch], axis=2) * 255
    a3 = a[..., None]
    reg = frame[y0:y1, x0:x1].astype(np.float32)
    frame[y0:y1, x0:x1] = np.clip(reg * (1 - a3) + col * a3, 0, 255).astype(np.uint8)


DROPS = np.random.default_rng(11).uniform(0, 1, (64, 4))


def ring_state(t):
    """Proyección (escala por altura), giro y centro de pantalla del flotador."""
    if t < T_LAND:
        u = t / T_LAND
        h = 7.4 * (1 - u * u)
        proj = CAM_D / (CAM_D - h)
        alpha = -0.10 - 1.9 * (T_LAND - t)
    else:
        h = 0.0
        a = t - T_LAND
        proj = 1 - 0.045 * math.exp(-a / 0.28) * math.sin(2 * math.pi * a / 0.42)
        alpha = -0.10 + 0.20 * a
    cam = 1 + 0.07 * ease_in_out_sine((t - T_LAND) / (B0 + 0.6 - T_LAND))
    cx = 540 + (RING_G[0] - 540) * proj
    cy = 960 + (RING_G[1] - 960) * proj
    cx = 540 + (cx - 540) * cam
    cy = 960 + (cy - 960) * cam
    return cx, cy, proj * cam, alpha, h, cam


def render_pool(ctx, t):
    W, H, S = ctx.W, ctx.H, ctx.S
    ww = min(W, 1080)
    wh = ww * 16 // 9
    ws = ww / 1080.0
    c = caustics(ww, wh, 31.0 + t * 0.85)
    yy, xx = np.mgrid[0:wh, 0:ww].astype(np.float32)
    dist = np.sqrt((xx / ws - RING_G[0]) ** 2 + (yy / ws - RING_G[1]) ** 2)
    rip = np.zeros_like(c)
    age = t - T_LAND
    if age > 0:
        for kk, dl in enumerate((0.0, 0.14, 0.30)):
            a2 = age - dl
            if a2 <= 0:
                continue
            Rr = RING_R + RING_r + 380 * a2 ** 0.8
            wd = 10 + 16 * a2
            amp = 0.55 * (1 - a2 / 1.6) ** 2 * (1, 0.65, 0.4)[kk]
            if amp > 0:
                x = (dist - Rr) / wd
                rip += amp * (np.exp(-x * x) - 0.6 * np.exp(-((x + 1.6) ** 2)))
        # ola dentro del hueco
        if age < 0.7:
            Rr = (RING_R - RING_r) * (1 - 0.8 * age / 0.7)
            x = (dist - Rr) / 9
            rip += 0.4 * (1 - age / 0.7) * np.exp(-x * x)
        # espuma en el borde al caer
        if age < 0.45:
            x = (dist - (RING_R + RING_r + 8)) / 14
            rip += 0.9 * (1 - age / 0.45) ** 1.5 * np.exp(-x * x)
    frame = water_color(c, rip)
    if ww != W:
        frame = cv2.resize(frame, (W, H), interpolation=cv2.INTER_CUBIC)
    cx, cy, k, alpha, h, cam = ring_state(t)
    # sombra del flotador (anillo) sobre el agua
    scx = (RING_G[0] + h * 30 + 14) * S
    scy = (RING_G[1] + h * 46 + 22) * S
    sf = (1 + 0.08 * h) * cam * S
    sb = (12 + 8 * h) * S
    ro, ri = (RING_R + RING_r) * sf, (RING_R - RING_r) * sf
    op = 0.40 / (1 + 0.35 * h)
    x0 = int(max(0, scx - ro - 3 * sb)); x1 = int(min(W, scx + ro + 3 * sb))
    y0 = int(max(0, scy - ro - 3 * sb)); y1 = int(min(H, scy + ro + 3 * sb))
    if x1 > x0 and y1 > y0:
        yy2, xx2 = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        dd = np.sqrt((xx2 - scx) ** 2 + (yy2 - scy) ** 2)
        sh = (1 - smoothstep(ro - sb, ro + sb, dd)) * smoothstep(ri - sb, ri + sb, dd)
        reg = frame[y0:y1, x0:x1].astype(np.float32)
        frame[y0:y1, x0:x1] = (reg * (1 - op * sh[..., None])).astype(np.uint8)
    # gotas al caer
    if 0 <= age < 0.5:
        lay = frame.copy()
        for j in range(40):
            ang = DROPS[j, 0] * 2 * math.pi
            sp = 220 + 420 * DROPS[j, 1]
            hgt = 2.4 * DROPS[j, 2] * 4 * (age / 0.5) * (1 - age / 0.5)
            pr = CAM_D / (CAM_D - hgt)
            r0 = RING_R + RING_r * (0.6 + 0.6 * DROPS[j, 3])
            gx = RING_G[0] + math.cos(ang) * (r0 + sp * age)
            gy = RING_G[1] + math.sin(ang) * (r0 + sp * age)
            px = 540 + (gx - 540) * pr * cam
            py = 960 + (gy - 960) * pr * cam
            rr = (6 + 9 * DROPS[j, 2]) * (1 - age / 0.5) * pr
            if rr * S > 0.6:
                cv2.circle(lay, (int(px * S * 16), int(py * S * 16)), int(rr * S * 16), (255, 252, 240),
                           -1, cv2.LINE_AA, 4)
        frame = cv2.addWeighted(lay, 0.92, frame, 0.08, 0)
    draw_ring(ctx, frame, cx * S, cy * S, k * S, alpha)
    # Somos Impacto (sólo aquí, en segundo plano frente a SOMOS)
    ti = T_LAND + 0.22
    if t >= ti:
        u = ease_out_back((t - ti) / 0.45, 1.6)
        op = clamp01((t - ti) / 0.12)
        bob = 6 * math.sin((t - ti) * 5.0)
        place(frame, ctx.impacto, 540 * S, (960 + (1470 - 960) * cam + bob) * S, 0.62 * u * cam, op)
    return frame


# ─────────────────────────── splash de agua ───────────────────────────
SPLASH = np.random.default_rng(5).uniform(0, 1, (70, 4))


def water_wipe(ctx, old, new, u, t, mode="radial", center=(540, 960)):
    """Oleada/splash de agua: cubre `old` y se abre mostrando `new`. u ∈ [0,1]."""
    W, H, S = ctx.W, ctx.H, ctx.S
    q = 4
    w, h = W // q, H // q
    sd = q / S  # unidades de diseño por pixel de la malla
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    X, Y = xx * sd, yy * sd
    if mode == "radial":
        dx, dy = X - center[0], Y - center[1]
        d = np.sqrt(dx * dx + dy * dy)
        th = np.arctan2(dy, dx)
        Rm = 1500.0
        wob1 = (1 + 0.06 * np.sin(6 * th + 9 * t) + 0.045 * np.sin(11 * th - 13 * t + 1)
                + 0.03 * np.sin(19 * th + 7 * t + 2) + 0.10 * np.maximum(0, np.sin(14 * th + 3)) ** 6)
        wob2 = 1 + 0.07 * np.sin(5 * th - 8 * t + 4) + 0.04 * np.sin(13 * th + 10 * t)
        R1 = Rm * ease_out_cubic(u / 0.48)
        R2 = Rm * ease_in_out_cubic((u - 0.36) / 0.64)
        e1 = d - R1 * wob1
        e2 = d - R2 * wob2 if R2 > 0 else np.full_like(d, 1e4)
    else:  # "up": la ola sube desde abajo y se va por arriba
        wave1 = 38 * np.sin(X / 85 + 9 * t) + 22 * np.sin(X / 33 - 12 * t + 1) + 12 * np.sin(X / 17 + 5 * t)
        wave2 = 34 * np.sin(X / 95 - 7 * t + 2) + 18 * np.sin(X / 41 + 10 * t)
        F1 = 2050 - 2350 * ease_out_cubic(u / 0.5) + wave1
        F2 = 2150 - 2450 * ease_in_out_cubic((u - 0.32) / 0.68) + wave2
        e1 = F1 - Y
        e2 = F2 - Y
    px = sd  # ancho de 1 px de malla en unidades de diseño
    a_cov = np.clip(0.5 - e1 / (2.2 * px), 0, 1)
    a_new = np.clip(0.5 - e2 / (2.2 * px), 0, 1)
    foam = (np.exp(-(e1 / 16) ** 2) * 0.95 + np.exp(-(e2 / 18) ** 2) * 0.85) * (a_cov + 0.25).clip(0, 1)
    foam *= 0.75 + 0.25 * np.sin(X / 11 + Y / 13 + 20 * t)
    c = caustics(w, h, 40 + t * 1.6, sc=1.0)
    under = old if u < 0.5 else new
    small = cv2.resize(under, (w, h), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), 3)
    wat = water_color(c, 0.0).astype(np.float32) * 0.72 + small.astype(np.float32) * 0.28
    wat = wat + (255 - wat) * np.clip(foam, 0, 1)[..., None]
    # a resolución completa
    up = lambda m: cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    A1 = up(a_cov)[..., None]
    A2 = up(a_new)[..., None]
    WAT = up(wat)
    out = old.astype(np.float32) * (1 - A1) + WAT * A1
    out = out * (1 - A2) + new.astype(np.float32) * A2
    out = np.clip(out, 0, 255).astype(np.uint8)
    # gotas que vuelan hacia la cámara
    if u < 0.75:
        lay = out.copy()
        for j in range(70):
            if mode == "radial":
                ang = SPLASH[j, 0] * 2 * math.pi
                rr0 = Rm * ease_out_cubic(u / 0.48) * (0.85 + 0.3 * SPLASH[j, 1]) + 380 * u * SPLASH[j, 2]
                gx = center[0] + math.cos(ang) * rr0
                gy = center[1] + math.sin(ang) * rr0
            else:
                gx = SPLASH[j, 0] * 1080
                gy = 2050 - 2350 * ease_out_cubic(u / 0.5) - 60 - 520 * u * SPLASH[j, 1]
            rad = (5 + 26 * SPLASH[j, 3] ** 2) * (1 + 1.2 * u)
            cv2.circle(lay, (int(gx * S * 16), int(gy * S * 16)), int(rad * S * 16), (255, 250, 232), -1,
                       cv2.LINE_AA, 4)
        a = 0.9 * (1 - u / 0.75)
        out = cv2.addWeighted(lay, a, out, 1 - a, 0)
    return out


# ─────────────────────────────── tomas ───────────────────────────────
GRADE = ("eq=contrast=1.07:brightness=-0.012:saturation=1.28:gamma=0.98,"
         "colorbalance=rs=-0.03:bs=0.04:rm=0.045:gm=0.01:bm=-0.035:rh=0.015:bh=-0.01,"
         "curves=all='0/0 0.18/0.15 0.5/0.52 0.85/0.88 1/0.97'")
PRE, POST = 0.45, 0.50   # pre/post-roll para que las transiciones tengan movimiento real


class Shot:
    def __init__(self, clip, tin, b0, b1, speed=1.0, z=(1.0, 1.07), c=(0.5, 0.5), c1=None, entry="cut"):
        self.clip, self.tin, self.speed = clip, tin, speed
        self.t0, self.t1 = B(b0), B(b1)
        self.z, self.c, self.c1, self.entry = z, c, (c1 or c), entry
        self.proc = None
        self.idx = -1
        self.last = None

    def open(self, ctx):
        start = max(0.0, self.tin - PRE * self.speed)
        self.pre = (self.tin - start) / self.speed
        n = int(math.ceil((self.t1 - self.t0 + self.pre + POST) * FPS)) + 2
        src = n / FPS * self.speed + 0.3
        vf = (f"setpts=(PTS-STARTPTS)/{self.speed},fps={FPS},"
              f"scale={ctx.W}:{ctx.H}:flags=lanczos,{GRADE},format=bgr24")
        cmd = ["ffmpeg", "-v", "quiet", "-ss", f"{start:.3f}", "-i", str(CL / f"20261115_{self.clip}.mp4"),
               "-t", f"{src:.3f}", "-an", "-vf", vf, "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:"]
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                     bufsize=ctx.W * ctx.H * 3 * 2)
        self.fsize = ctx.W * ctx.H * 3
        self.shape = (ctx.H, ctx.W, 3)

    def frame(self, ctx, t):
        if self.proc is None:
            self.open(ctx)
        k = max(0, int(round((t - self.t0 + self.pre) * FPS)))
        while self.idx < k:
            buf = self.proc.stdout.read(self.fsize)
            if len(buf) < self.fsize:
                break
            self.last = np.frombuffer(buf, np.uint8).reshape(self.shape)
            self.idx += 1
        return self.last

    def close(self):
        if self.proc:
            try:
                self.proc.stdout.close()
            except Exception:
                pass
            self.proc.kill()
            self.proc.wait()
            self.proc = None
        self.idx = -1
        self.last = None


# (clip, entrada s, beat inicio, beat fin, velocidad, zoom ini/fin, centro de encuadre, transición de entrada)
# Encuadres variados: abiertos, medios y detalles. Velocidad 1.0 en clips de 30 fps (sin
# tirones); cámara lenta sólo en los de 60 fps (150428, 152227, 161532).
EDL = [
    # ── Albercada · así lo vivimos ──  (entra con el splash)
    Shot("150439", 0.40, 0, 3, 1.0, (1.04, 1.12), (0.50, 0.42), entry="splash"),
    Shot("153740", 3.10, 3, 5, 1.0, (1.10, 1.18), (0.52, 0.55)),
    Shot("161532", 1.60, 5, 7, 0.6, (1.18, 1.28), (0.50, 0.45), entry="dissolve"),
    Shot("152227", 1.10, 7, 8, 1.0, (1.30, 1.36), (0.55, 0.60)),
    # ── Compartimos. ──
    Shot("150428", 2.40, 8, 10, 0.7, (1.35, 1.45), (0.58, 0.56), entry="push"),
    Shot("152219", 3.70, 10, 12, 1.0, (1.25, 1.33), (0.62, 0.64)),
    Shot("153930", 2.20, 12, 14, 1.0, (1.60, 1.72), (0.55, 0.58), entry="dissolve"),
    Shot("162145", 5.20, 14, 16, 1.0, (1.35, 1.45), (0.40, 0.62)),
    # ── No pudo faltar la pizza ──
    Shot("150439", 6.90, 16, 18.5, 1.0, (1.40, 1.58), (0.50, 0.68), entry="wave"),
    Shot("154211", 0.00, 18.5, 21, 1.0, (1.45, 1.62), (0.30, 0.74), entry="push"),
    # ── Conversamos. ──
    Shot("162427", 2.80, 21, 23, 1.0, (1.55, 1.63), (0.55, 0.62), entry="pushup"),
    Shot("162027", 1.60, 23, 26, 1.0, (1.60, 1.80), (0.70, 0.62)),
    Shot("162145", 0.40, 26, 27.5, 1.0, (1.55, 1.62), (0.36, 0.60)),
    Shot("162856", 8.90, 27.5, 29, 1.0, (1.65, 1.75), (0.64, 0.64)),
    Shot("162021", 0.00, 29, 30, 1.0, (1.45, 1.52), (0.62, 0.60)),
    Shot("162145", 9.00, 30, 33, 1.0, (1.55, 1.72), (0.62, 0.60), entry="dissolve"),
    # ── Nos divertimos. ──
    Shot("162027", 8.05, 33, 35, 1.0, (1.40, 1.48), (0.42, 0.62), entry="splash"),
    Shot("162506", 5.30, 35, 37, 1.0, (1.50, 1.58), (0.34, 0.60)),
    Shot("162027", 4.30, 37, 39, 1.0, (1.85, 1.95), (0.68, 0.60), entry="push"),
    Shot("152227", 2.80, 39, 40.5, 0.8, (1.45, 1.52), (0.60, 0.55)),
    Shot("154211", 3.50, 40.5, 42, 1.0, (1.55, 1.62), (0.70, 0.68)),
    Shot("161532", 4.40, 42, 45, 0.75, (1.30, 1.42), (0.58, 0.62), entry="dissolve"),
    # ── hacia el cierre ──
    Shot("163220", 5.40, 45, 49, 1.0, (1.35, 1.65), (0.60, 0.62), c1=(0.66, 0.60), entry="push"),
    Shot("162506", 0.50, 49, 59, 1.0, (1.04, 1.16), (0.50, 0.55), entry="dissolve"),
]
HD = {"cut": 0.0, "dissolve": 0.12, "push": 0.14, "pushup": 0.14, "wave": 0.28, "splash": 0.30}


def shot_at(t):
    for i, s in enumerate(EDL):
        if s.t0 <= t < s.t1:
            return i
    return len(EDL) - 1 if t >= EDL[-1].t0 else 0


def footage(ctx, t, i, extra_zoom=1.0):
    s = EDL[i]
    src = s.frame(ctx, t)
    W, H = ctx.W, ctx.H
    u = (t - s.t0) / (s.t1 - s.t0)
    uc = clamp01(u)
    e = ease_in_out_sine(uc) * 0.5 + uc * 0.5
    z = lerp(s.z[0], s.z[1], e) * extra_zoom
    if u < 0:  # pre-roll: sigue el mismo movimiento hacia atrás
        z = s.z[0] - (s.z[1] - s.z[0]) * 0.5 * (-u)
    cx = lerp(s.c[0], s.c1[0], e)
    cy = lerp(s.c[1], s.c1[1], e)
    if s.entry == "cut":
        z *= 1 + 0.045 * (1 - ease_out_cubic((t - s.t0) / 0.35)) if t >= s.t0 else 1.045
    z = max(z, 1.0)
    srcx = cx * W; srcy = cy * H
    hw, hh = W / (2 * z), H / (2 * z)
    srcx = min(max(srcx, hw), W - hw); srcy = min(max(srcy, hh), H - hh)
    M = np.array([[z, 0, W / 2 - z * srcx], [0, z, H / 2 - z * srcy]], np.float32)
    out = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return np.clip(out.astype(np.float32) * ctx.vignette, 0, 255).astype(np.uint8)


def dir_blur(img, length, axis):
    """Desenfoque de movimiento direccional (a media resolución)."""
    if length < 2:
        return img
    H, W = img.shape[:2]
    sm = cv2.resize(img, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    L = max(3, int(length / 2) | 1)
    ker = np.ones((1, L), np.float32) / L if axis == 0 else np.ones((L, 1), np.float32) / L
    sm = cv2.filter2D(sm, -1, ker, borderType=cv2.BORDER_REFLECT)
    return cv2.resize(sm, (W, H), interpolation=cv2.INTER_LINEAR)


def transition(ctx, kind, i_old, i_new, u, t):
    W, H = ctx.W, ctx.H
    if kind in ("wave", "splash"):
        old = footage(ctx, t, i_old) if i_old >= 0 else render_pool(ctx, t)
        new = footage(ctx, t, i_new)
        if kind == "splash":
            c = RING_G if i_old < 0 else (540, 960)
            return water_wipe(ctx, old, new, u, t, "radial", c)
        return water_wipe(ctx, old, new, u, t, "up")
    old = footage(ctx, t, i_old)
    new = footage(ctx, t, i_new)
    if kind == "dissolve":
        e = ease_in_out_sine(u)
        o = cv2.warpAffine(old, cv2.getRotationMatrix2D((W / 2, H / 2), 0, 1 + 0.10 * e), (W, H),
                           borderMode=cv2.BORDER_REFLECT)
        n = cv2.warpAffine(new, cv2.getRotationMatrix2D((W / 2, H / 2), 0, 1 + 0.10 * (1 - e)), (W, H),
                           borderMode=cv2.BORDER_REFLECT)
        return cv2.addWeighted(o, 1 - e, n, e, 0)
    # empuje con desenfoque de movimiento
    e = ease_in_out_cubic(u)
    vel = 6 * u * (1 - u)  # derivada aproximada de la curva (pico al centro)
    if kind == "push":
        off = int(round(e * W))
        canvas = np.empty_like(old)
        canvas[:, :W - off] = old[:, off:]
        canvas[:, W - off:] = new[:, :off]
        return dir_blur(canvas, vel * W * 0.16, 0)
    off = int(round(e * H))
    canvas = np.empty_like(old)
    canvas[:H - off] = old[off:]
    canvas[H - off:] = new[:off]
    return dir_blur(canvas, vel * H * 0.12, 1)


def render_footage(ctx, t):
    i = shot_at(t)
    s = EDL[i]
    hd = HD[s.entry]
    if hd > 0 and t < s.t0 + hd:
        return transition(ctx, s.entry, i - 1, i, (t - (s.t0 - hd)) / (2 * hd), t)
    if i + 1 < len(EDL):
        n = EDL[i + 1]
        hd = HD[n.entry]
        if hd > 0 and t >= n.t0 - hd:
            return transition(ctx, n.entry, i, i + 1, (t - (n.t0 - hd)) / (2 * hd), t)
    return footage(ctx, t, i)


# ───────────────────────────── textos ─────────────────────────────
def draw_title(ctx, frame, t):
    """'Albercada' (como en la e-card) + 'así lo vivimos'."""
    t_in, t_out = B(1.3), B(6.6)
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
    t2 = B(2.3)
    if t >= t2:
        u = ease_out_expo((t - t2) / 0.45)
        uo = clamp01((t - t_out) / 0.3)
        prem, tw, th = ctx.text("ASÍ LO VIVIMOS", F_SUB, 46, shadow=0, tracking=7)
        pw = tw / S + 70
        op = 1 - uo
        draw_pill(frame, 540 * S, 560 * S, pw * S * u, 84 * S, color=np.array([70, 48, 6], np.float32),
                  opacity=0.62 * op)
        if u > 0.3:
            place(frame, prem, 540 * S, (562 + 14 * (1 - u)) * S, 1.0, clamp01((u - 0.3) / 0.5) * op)


WORD_SIZE = 104


def bar_word(ctx, frame, word, t0, t1, cy=1330, size=WORD_SIZE):
    """Palabra blanca sobre barra rosa (paralelogramo) que entra y sale en barrido."""
    t = ctx._t
    if not (t0 <= t < t1 + 0.05):
        return
    S = ctx.S
    prem, tw, th = ctx.text(word, F_TITLE, size, shadow=0.0)
    bw = tw / S + 84
    bh = size * 1.36
    cx = 540
    ui = ease_out_expo((t - t0) / 0.32)
    uo = ease_in_out_cubic((t - (t1 - 0.32)) / 0.32)
    left = cx - bw / 2 + bw * uo
    right = cx - bw / 2 + bw * ui
    if right - left > 1:
        sk = bh * 0.21
        pts = np.array([[left + sk, cy - bh / 2], [right + sk, cy - bh / 2],
                        [right - sk, cy + bh / 2], [left - sk, cy + bh / 2]], np.float32) * S
        cv2.fillPoly(frame, [np.round(pts * 16).astype(np.int32)], (124, 0, 228), cv2.LINE_AA, 4)
    u = ease_out_expo((t - t0 - 0.10) / 0.45)
    op = clamp01((t - t0 - 0.10) / 0.14) * (1 - clamp01((t - (t1 - 0.36)) / 0.16))
    place(frame, prem, cx * S, (cy + 4 + 36 * (1 - u)) * S, 1 + 0.12 * (1 - u), op)


WORDS = [("Compartimos.", 8.15, 12.2), ("Conversamos.", 21.3, 25.2), ("Nos divertimos.", 33.5, 37.4)]
PIZZA = (16.55, 20.8)


def draw_words(ctx, frame, t):
    ctx._t = t
    for word, b0, b1 in WORDS:
        bar_word(ctx, frame, word, B(b0), B(b1))
    # No pudo faltar la pizza 🍕
    t0, t1 = B(PIZZA[0]), B(PIZZA[1])
    if t0 <= t < t1 + 0.05:
        S = ctx.S
        u = (t - t0) / 0.55
        e = ease_out_back(u, 2.0)
        uo = ease_in_cubic((t - (t1 - 0.30)) / 0.30)
        kb = math.floor((t - B0) / BEAT + 1e-6)
        bump = 1 + 0.06 * math.exp(-(t - B(kb)) / 0.10) if u > 1 else 1.0
        rot = lerp(-40, -6, ease_out_cubic(u)) + 4 * math.sin((t - t0) * 2 * math.pi / (2 * BEAT))
        place(frame, ctx.pizza, 540 * S, (470 - 30 * (1 - min(1.0, e))) * S,
              max(0.0, e) * bump * (1 - uo), clamp01(u * 4) * (1 - uo), rot=rot + 90 * uo)
        prem, tw, th = ctx.text("NO PUDO FALTAR", F_SUB, 54, tracking=6, shadow=0.5)
        u2 = ease_out_expo((t - t0 - 0.20) / 0.45)
        op2 = clamp01((t - t0 - 0.20) / 0.15) * (1 - clamp01((t - (t1 - 0.36)) / 0.16))
        place(frame, prem, 540 * S, (722 + 26 * (1 - u2)) * S, 1.0, op2)
        bar_word(ctx, frame, "la pizza", t0 + 0.30, t1, cy=832, size=118)


# ─────────────────────────── cierre ───────────────────────────
C_ENTRE, C_AMIGOS, C_PLECA, C_MAS = B(51), B(52), B(53), B(54)
C_EXIT = B(55)
C_MOVE = (B(55.2), B(56.4))
C_FILL = (B(56.5), B(57.6))
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
        drift = 1 + 0.08 * ease_out_cubic((t - C_FILL[1]) / (DUR - C_FILL[1]))
        draw_pill(frame, cx * S, cy * S, w * S, h * S, opacity=clamp01((t - C_PLECA) / 0.06), shadow=0.25 * (1 - fl))
        draw_logo(ctx, frame, cx * S, cy * S, lw * sc * S * drift)


# ─────────────────────────── cuadro completo ───────────────────────────
def render_frame(ctx, t):
    if t < B0:
        return render_pool(ctx, t)
    if t >= C_FILL[1] + 0.05:
        frame = np.full((ctx.H, ctx.W, 3), 255, np.uint8)
        draw_closing(ctx, frame, t)
        return frame
    s0 = EDL[0]
    if t < s0.t0 + 2 * HD["splash"]:
        frame = water_wipe(ctx, render_pool(ctx, t), footage(ctx, t, 0),
                           (t - B0) / (2 * HD["splash"]), t, "radial", RING_G)
    else:
        frame = render_footage(ctx, t)
    # oscurecer/desenfocar la última toma bajo el texto del cierre
    if t >= C_ENTRE - 0.05:
        e = ease_out_cubic((t - C_ENTRE) / 0.5)
        sm = cv2.resize(frame, (ctx.W // 4, ctx.H // 4), interpolation=cv2.INTER_AREA)
        sm = cv2.GaussianBlur(sm, (0, 0), 3.0 * e + 0.01)
        bl = cv2.resize(sm, (ctx.W, ctx.H), interpolation=cv2.INTER_LINEAR)
        frame = cv2.addWeighted(frame, 1 - 0.75 * e, bl, 0.75 * e, 0)
        frame = (frame.astype(np.float32) * (1 - 0.30 * e)).astype(np.uint8)
    # degradado superior para el título
    if B(1) <= t < B(7.3):
        a = clamp01((t - B(1.1)) / 0.3) * (1 - clamp01((t - B(6.8)) / 0.4))
        if a > 0:
            g = (ctx.top_grad * 0.45 * a)[..., None]
            frame = (frame.astype(np.float32) * (1 - g)).astype(np.uint8)
    draw_title(ctx, frame, t)
    draw_words(ctx, frame, t)
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


def manage_readers(t):
    for s in EDL:
        if s.proc is not None and t > s.t1 + POST:
            s.close()


def render(W, out, crf=16, preset="slow"):
    ctx = Ctx(W)
    build_audio()
    nf = int(round(DUR * FPS))
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ctx.W}x{ctx.H}",
         "-r", str(FPS), "-i", "pipe:", "-i", str(OUT / "audio.wav"),
         "-map", "0:v", "-map", "1:a", "-t", f"{DUR:.3f}",
         "-c:v", "libx264", "-crf", str(crf), "-preset", preset, "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", str(out)],
        stdin=subprocess.PIPE)
    for fi in range(nf):
        t = fi / FPS
        manage_readers(t)
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
            s.close()
        f = render_frame(ctx, t)
        p = OUT / f"still_{t:06.2f}.jpg"
        cv2.imwrite(str(p), f, [cv2.IMWRITE_JPEG_QUALITY, 90])
        print(p)
    for s in EDL:
        s.close()


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
