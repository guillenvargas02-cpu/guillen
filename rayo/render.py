#!/usr/bin/env python3
"""Ícono del rayo animado: borde y rayo se iluminan de forma sutil.

Todo se dibuja con campos de distancia (SDF) en float32, en luz lineal,
y se codifica con ffmpeg. Loop perfecto: el último cuadro empalma con el primero.

    python3 render.py --size 2160 --fps 60 --out renders/rayo_2160.mp4
"""
import argparse, subprocess, sys, os
import numpy as np
from multiprocessing import Pool

# ---------------------------------------------------------------- paleta (sRGB del diseño original)
BG      = (11, 22, 39)     # #0B1627 fondo
FILL    = (10, 41, 51)     # #0A2933 relleno del bloque
BORDER  = (7, 74, 75)      # #074A4B contorno
BOLT    = (0, 207, 168)    # #00CFA8 rayo
GLOW    = (0, 230, 190)    # tono de la luz emitida
HOT     = (190, 255, 238)  # núcleo caliente (casi blanco menta)

def lin(c):
    c = np.asarray(c, np.float32) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)

def srgb(x):
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)

# ---------------------------------------------------------------- tiempo
DUR = 8.0          # segundos por loop
T_LAP0, T_LAP1 = 0.5, 3.3   # el haz recorre el contorno
T_FIRE = 3.35               # el rayo se enciende

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)

def ease_inout(u):
    # sinusoidal: arranca y frena suave
    return 0.5 - 0.5 * np.cos(np.pi * np.clip(u, 0, 1))

def inv_ease_inout(s):
    return np.arccos(1 - 2 * np.clip(s, 0, 1)) / np.pi

# ---------------------------------------------------------------- geometría
G = {}

def sd_round_box(px, py, half, r):
    qx = np.abs(px) - (half - r)
    qy = np.abs(py) - (half - r)
    out = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0))
    ins = np.minimum(np.maximum(qx, qy), 0)
    return out + ins - r

def sd_polygon(px, py, pts):
    d = np.full(px.shape, np.inf, np.float32)
    s = np.ones(px.shape, np.float32)
    n = len(pts)
    for i in range(n):
        ax, ay = pts[i - 1]
        bx, by = pts[i]
        ex, ey = bx - ax, by - ay
        wx, wy = px - ax, py - ay
        h = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
        dx, dy = wx - ex * h, wy - ey * h
        d = np.minimum(d, dx * dx + dy * dy)
        c1 = py >= ay
        c2 = py < by
        c3 = ex * wy > ey * wx
        flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
        s = np.where(flip, -s, s)
    return s * np.sqrt(d)

def build(size):
    S = size
    # unidad base = 1 px del diseño original (bloque de 112 px)
    tile_px = 0.56 * S
    k = tile_px / 112.0
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    cx = cy = (S - 1) / 2.0
    X = (x - cx) / k          # coordenadas en px del diseño
    Y = (y - cy) / k
    G['k'] = k
    G['X'], G['Y'] = X, Y

    # bloque: 112x112, radio 30, contorno 4
    d_tile = sd_round_box(X, Y, 56.0, 30.0)
    G['d_tile'] = d_tile

    # rayo: esqueleto (simetría central) + redondeo de 1 unidad Lucide (= 2.33 px)
    u = 2.33
    skel = [(0.75, -9.7), (-0.1, -2.0), (8.3, -2.0), (-0.75, 9.7), (0.1, 2.0), (-8.3, 2.0)]
    skel = [(a * u, b * u + 0.5) for a, b in skel]
    d_bolt = sd_polygon(X, Y, skel) - 1.0 * u
    G['d_bolt'] = d_bolt

    aa = 0.75 / k  # medio píxel de salida en unidades de diseño
    cov = lambda d: np.clip(0.5 - d / (2 * aa), 0, 1).astype(np.float32)
    G['m_tile'] = cov(d_tile)
    G['m_inner'] = cov(d_tile + 4.0)               # interior sin el contorno
    G['m_ring'] = G['m_tile'] - G['m_inner']
    G['m_bolt'] = cov(d_bolt)

    # parámetro de perímetro s∈[0,1) (horario, desde arriba al centro)
    ang = np.arctan2(X, -Y)                          # 0 arriba, crece en sentido horario
    th = np.linspace(-np.pi, np.pi, 4097)
    # punto del borde (mitad del contorno) para cada ángulo → longitud de arco
    rr = 54.0; rc = 28.0
    bx_, by_ = np.sin(th), -np.cos(th)
    # radio del rectángulo redondeado en dirección (bx,by) por bisección
    lo = np.zeros_like(th); hi = np.full_like(th, 80.0)
    for _ in range(40):
        mid = (lo + hi) / 2
        inside = sd_round_box(bx_ * mid, by_ * mid, rr, rc) < 0
        lo = np.where(inside, mid, lo); hi = np.where(inside, hi, mid)
    ex_, ey_ = bx_ * lo, by_ * lo
    seg = np.hypot(np.diff(ex_), np.diff(ey_))
    arc = np.concatenate([[0], np.cumsum(seg)])
    i0 = np.searchsorted(th, 0.0)
    total = arc[-1]
    arc = np.mod(arc - arc[i0], total) / total
    arc[i0] = 0.0
    s = np.interp(ang, th, arc).astype(np.float32)
    G['s'] = s
    # instante en que la cabeza del haz pasa por cada punto
    G['t_pass'] = (T_LAP0 + (T_LAP1 - T_LAP0) * inv_ease_inout(s)).astype(np.float32)

    # caídas de luz precalculadas (en px de diseño)
    dt_out = np.maximum(d_tile, 0)
    d_ring = np.abs(d_tile + 2.0) - 2.0              # distancia al anillo del contorno
    dr = np.maximum(d_ring, 0)
    G['ring_tight'] = (np.exp(-dr / 1.6)).astype(np.float32)
    G['ring_wide'] = (np.exp(-dr / 7.0) * 0.6 + np.exp(-dr / 22.0) * 0.4).astype(np.float32)
    G['ring_mid'] = (np.exp(-dr / 3.5)).astype(np.float32)
    # la luz exterior no debe "ensuciar" el interior: se atenúa dentro
    inner_damp = np.where(d_tile < -4.0, np.exp((d_tile + 4.0) / 5.0), 1.0).astype(np.float32)
    G['ring_wide'] *= inner_damp
    G['ring_mid'] *= inner_damp
    G['ring_tight'] *= np.where(d_tile < -4.0, np.exp((d_tile + 4.0) / 1.2), 1.0).astype(np.float32)

    db = np.maximum(d_bolt, 0)
    G['bolt_tight'] = (np.exp(-db / 1.8)).astype(np.float32)
    G['bolt_mid'] = (np.exp(-db / 6.0)).astype(np.float32)
    G['bolt_wide'] = (np.exp(-db / 18.0)).astype(np.float32)

    # luz ambiental detrás del bloque y viñeta del fondo
    r = np.hypot(X, Y)
    G['ambient'] = (np.exp(-(dt_out / 34.0) ** 1.3) * (1 - G['m_tile'])).astype(np.float32)
    G['vignette'] = (1.0 - 0.45 * smooth(60, 150, r)).astype(np.float32)

    # relleno: leve degradado vertical (luz de arriba)
    G['fill_grad'] = (1.0 + 0.06 * np.clip(-Y / 56.0, -1, 1)).astype(np.float32)
    # brillo de arista superior del contorno (vidrio)
    G['rim_top'] = (np.clip(-Y / 56.0, 0, 1) ** 2).astype(np.float32)

    # coordenada diagonal para el destello que cruza el rayo y el bloque
    G['diag'] = ((X * 0.6 + Y * 0.8)).astype(np.float32)

    G['lin'] = {n: lin(c) for n, c in dict(BG=BG, FILL=FILL, BORDER=BORDER, BOLT=BOLT, GLOW=GLOW, HOT=HOT).items()}

# ---------------------------------------------------------------- un cuadro
def frame(t, seed=0):
    L = G['lin']
    T = t % DUR

    breathe = 0.5 - 0.5 * np.cos(2 * np.pi * T / 4.0)          # 0..1, periodo 4 s
    # encendido del rayo: subida rápida y caída exponencial, cero al cerrar el loop
    rise = smooth(T_FIRE - 0.05, T_FIRE + 0.22, T)
    decay = np.exp(-max(T - (T_FIRE + 0.22), 0) / 1.1)
    fire = rise * decay * (1 - smooth(7.2, 7.95, T))
    # el contorno queda "cargado" tras el recorrido
    charge = smooth(T_LAP1 - 0.6, T_LAP1 + 0.1, T) * np.exp(-max(T - (T_LAP1 + 0.1), 0) / 1.6) * (1 - smooth(7.0, 7.95, T))

    # --- haz que recorre el contorno
    e = T - G['t_pass']                                           # >0: ya pasó
    head = np.where(e >= 0, np.exp(-np.maximum(e, 0) / 0.07), np.exp(np.minimum(e, 0) / 0.035))
    trail = np.where(e >= 0, np.exp(-e / 0.55), 0.0)
    lap_env = smooth(T_LAP0 - 0.1, T_LAP0 + 0.25, T) * (1 - smooth(T_LAP1 + 0.05, T_LAP1 + 0.35, T))
    beam = (head * 1.0 + trail * 0.28) * lap_env
    beam = beam + trail * 0.0  # (la estela residual la cubre "charge")

    ring_level = 0.16 + 0.06 * breathe + 0.40 * charge + 0.25 * fire      # brillo base del contorno
    ring_light = ring_level + 1.6 * beam                                  # luz del contorno por píxel

    # --- fondo
    col = L['BG'][None, None, :] * G['vignette'][..., None]
    amb = (0.007 + 0.004 * breathe + 0.018 * fire + 0.010 * charge) * G['ambient']
    col = col + amb[..., None] * L['GLOW']

    # --- resplandor exterior del contorno
    halo = G['ring_wide'] * (0.010 + 0.006 * breathe + 0.040 * charge + 0.030 * fire)
    halo = halo + G['ring_mid'] * 0.10 * beam + G['ring_tight'] * 0.22 * beam
    col = col + (halo * (1 - G['m_inner']))[..., None] * L['GLOW']

    # --- relleno del bloque + luz que el rayo proyecta sobre la superficie
    bolt_level = 0.50 + 0.10 * breathe + 0.60 * fire
    spill = (G['bolt_wide'] * 0.035 + G['bolt_mid'] * 0.035) * bolt_level
    # destello de vidrio que cruza el bloque al encenderse
    sweep_tile = np.exp(-((G['diag'] - (-90 + 180 * smooth(T_FIRE + 0.05, T_FIRE + 1.2, T))) / 14.0) ** 2)
    sweep_tile *= smooth(T_FIRE, T_FIRE + 0.15, T) * (1 - smooth(T_FIRE + 1.0, T_FIRE + 1.2, T))
    fill = L['FILL'][None, None, :] * G['fill_grad'][..., None] + (spill[..., None] * L['GLOW']) \
        + (0.012 * sweep_tile)[..., None] * L['HOT']
    m_in = G['m_inner'][..., None]
    col = col * (1 - m_in) + fill * m_in
    # luz interna junto al contorno (el borde ilumina el vidrio por dentro)
    inner_glow = np.exp(np.minimum(G['d_tile'] + 4.0, 0) / 5.0) * G['m_inner'] * (0.03 * ring_level + 0.12 * beam)
    col = col + inner_glow[..., None] * L['GLOW']

    # --- contorno
    bl = np.clip(ring_light, 0, None)[..., None]
    ring_col = L['BORDER'] * (1 + 0.25 * G['rim_top'])[..., None] \
        + L['GLOW'] * (0.45 * bl * (1 - np.exp(-bl))) \
        + L['HOT'] * (0.55 * (beam * head)[..., None])
    m_r = G['m_ring'][..., None]
    col = col * (1 - m_r) + ring_col * m_r

    # --- resplandor del rayo (bloom)
    bloom = G['bolt_tight'] * 0.20 + G['bolt_mid'] * 0.07 + G['bolt_wide'] * 0.018
    col = col + ((bloom * bolt_level) * (1 - G['m_bolt']))[..., None] * L['GLOW']

    # --- rayo
    pos = -40 + 80 * smooth(T_FIRE - 0.02, T_FIRE + 0.65, T)
    shimmer = np.exp(-((G['diag'] - pos) / 5.0) ** 2) * smooth(T_FIRE - 0.05, T_FIRE + 0.05, T) \
        * (1 - smooth(T_FIRE + 0.55, T_FIRE + 0.7, T))
    core = np.clip(-G['d_bolt'] / 6.0, 0, 1)                      # más caliente hacia el centro
    hot = np.clip(0.10 * breathe + 0.38 * fire * (0.4 + 0.6 * core) + 0.65 * shimmer, 0, 1)
    bolt_col = L['BOLT'][None, None, :] * (1.0 + 0.10 * breathe + 0.35 * fire) + hot[..., None] * (L['HOT'] - L['BOLT'])
    m_b = G['m_bolt'][..., None]
    col = col * (1 - m_b) + bolt_col * m_b

    # --- tonemap suave solo en altas luces
    knee = 0.80
    over = np.maximum(col - knee, 0)
    col = np.where(col > knee, knee + (1 - knee) * (1 - np.exp(-over / (1 - knee))), col)

    out = srgb(col) * 255.0
    # tramado (dither) leve para evitar bandas en los degradados
    rng = np.random.default_rng(seed)
    out += (rng.random(out.shape[:2], np.float32) - rng.random(out.shape[:2], np.float32))[..., None] * 0.6
    return np.clip(out + 0.5, 0, 255).astype(np.uint8)

def _init(size):
    build(size)

def _job(args):
    i, fps = args
    return frame(i / fps, seed=i).tobytes()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--size', type=int, default=2160)
    ap.add_argument('--fps', type=int, default=60)
    ap.add_argument('--loops', type=int, default=1)
    ap.add_argument('--out', default='renders/rayo.mp4')
    ap.add_argument('--crf', type=float, default=16)
    ap.add_argument('--preset', default='veryslow')
    ap.add_argument('--still', type=float, nargs='*', help='solo exportar PNGs en estos segundos')
    a = ap.parse_args()

    if a.still:
        from PIL import Image
        build(a.size)
        os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
        for t in a.still:
            Image.fromarray(frame(t)).save(f"{os.path.splitext(a.out)[0]}_{t:05.2f}.png")
        return

    n = int(round(DUR * a.fps)) * a.loops
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{a.size}x{a.size}', '-r', str(a.fps), '-i', '-',
           '-c:v', 'libx264', '-preset', a.preset, '-crf', str(a.crf), '-tune', 'film',
           *([] if a.crf == 0 else ['-profile:v', 'high']), '-pix_fmt', 'yuv420p',
           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
           '-vf', 'scale=out_color_matrix=bt709:out_range=tv',
           '-movflags', '+faststart', a.out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(os.cpu_count(), initializer=_init, initargs=(a.size,)) as pool:
        for j, buf in enumerate(pool.imap(_job, [(i, a.fps) for i in range(n)], chunksize=2)):
            ff.stdin.write(buf)
            if j % 60 == 0:
                print(f'{j}/{n}', file=sys.stderr, flush=True)
    ff.stdin.close()
    sys.exit(ff.wait())

if __name__ == '__main__':
    main()
