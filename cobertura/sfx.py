#!/usr/bin/env python3
"""Banda sonora del video de COBERTURA: música editada + efectos de sonido sintetizados.

Todo es determinista (semilla fija). Uso: python3 sfx.py renders/
Salida: renders/audio.wav (48 kHz estéreo, -14 LUFS, pico -1 dBTP).
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt, lfilter

ROOT = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "renders"
SR = 48000
TOTAL = 29.90
BEAT = 0.487875
H1 = 3.40


def b(k):
    return H1 + k * BEAT


H2, H3 = b(16), b(48)
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- utilidades


def secs(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def reverb(x, decay=1.2, mix=0.25, pre=0.012):
    n = int(decay * SR)
    t = np.arange(n) / SR
    irl = rng.standard_normal(n) * np.exp(-t * 6.9 / decay)
    irr = rng.standard_normal(n) * np.exp(-t * 6.9 / decay)
    irl, irr = lp(irl, 7000), lp(irr, 6500)
    irl[: int(pre * SR)] = 0
    irr[: int(pre * SR)] = 0
    L = len(x) + n
    wl = np.pad(fftconvolve(x, irl), (0, 1))[:L]
    wr = np.pad(fftconvolve(x, irr), (0, 1))[:L]
    dry = np.pad(x, (0, n))
    s = np.max(np.abs(wl)) or 1
    return np.stack([dry + mix * wl / s * np.max(np.abs(x)), dry + mix * wr / s * np.max(np.abs(x))], 1)


def stereo(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], 1)


def sweep_filter(x, f0, f1, q=2.0):
    """Pasabanda con centro que barre de f0 a f1 (exponencial), por bloques."""
    n, blk = len(x), 256
    y = np.zeros(n)
    zi = np.zeros(2)
    for i in range(0, n, blk):
        p = i / n
        fc = f0 * (f1 / f0) ** p
        w0 = 2 * np.pi * fc / SR
        al = np.sin(w0) / (2 * q)
        bb = np.array([al, 0, -al]) / (1 + al)
        aa = np.array([1, -2 * np.cos(w0) / (1 + al), (1 - al) / (1 + al)])
        y[i : i + blk], zi = lfilter(bb, aa, x[i : i + blk], zi=zi)
    return y


# ---------------------------------------------------------------- efectos


def impact(big=1.0, d=2.6):
    t = secs(d)
    f = 38 + 70 * np.exp(-t / 0.09)  # caída de tono: golpe grave
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.55 * big))
    sub = np.tanh(sub * 1.8) / np.tanh(1.8)
    body = lp(noise(d), 1800) * np.exp(-t / 0.10) * 0.9
    snap = hp(noise(d), 2500) * np.exp(-t / 0.012) * 0.5
    x = sub * 1.0 + body + snap
    return reverb(norm(x), decay=2.2 * big, mix=0.35)


def whoosh(d=0.6, f0=300, f1=4000, into=True, pan=(-0.7, 0.7)):
    t = secs(d)
    p = t / d
    env = (p**2.2 if into else (1 - p) ** 1.6) * np.sin(np.pi * np.clip(p * 0.98 + 0.01, 0, 1)) ** 0.3
    if into:
        env = p**2.5
        env[-int(0.015 * SR):] *= np.linspace(1, 0, int(0.015 * SR))
    x = sweep_filter(noise(d), f0, f1, q=1.6) * env
    x = norm(x)
    pn = np.linspace(pan[0], pan[1], len(x))
    l, r = np.cos((pn + 1) * np.pi / 4), np.sin((pn + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * 1.3


def swish(d=0.35):
    t = secs(d)
    env = np.sin(np.pi * t / d) ** 2
    return stereo(norm(sweep_filter(noise(d), 900, 5000, q=2.2) * env), 0.2)


def reverse_cymbal(d=1.6):
    t = secs(d)
    env = (t / d) ** 3.2
    x = hp(noise(d), 4500) + 0.4 * bp(noise(d), 1500, 5000)
    x = x * env
    x[-int(0.008 * SR):] *= np.linspace(1, 0, int(0.008 * SR))
    w = reverb(norm(x), 0.6, 0.2)[: len(x)]
    return w


def riser(d=1.95, f0=180, f1=1800):
    t = secs(d)
    p = t / d
    f = f0 * (f1 / f0) ** (p**1.5)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    nz = sweep_filter(noise(d), 400, 9000, q=1.2)
    x = (0.35 * tone + norm(nz)) * p**2.2
    x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return stereo(norm(x))


def shutter():
    """Obturador de cámara: dos golpes mecánicos (abre/cierra) con cuerpo grave."""
    d = 0.16
    t = secs(d)
    x = np.zeros(len(t))
    for t0, g in ((0.0, 1.0), (0.055, 0.75)):
        i = int(t0 * SR)
        tt = t[: len(t) - i]
        clk = bp(noise(len(tt) / SR), 1800, 7000) * np.exp(-tt / 0.006)
        thk = np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / 0.018) * 0.6
        x[i:] += g * (clk + thk)
    return reverb(norm(x), 0.35, 0.12)


def paper_drop():
    d = 0.25
    t = secs(d)
    x = lp(noise(d), 1200) * np.exp(-t / 0.03) + np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.05) * 0.8
    return stereo(norm(x))


def heartbeat():
    d = 0.6
    t = secs(d)
    x = np.zeros(len(t))
    for t0, g in ((0.0, 1.0), (0.17, 0.7)):
        i = int(t0 * SR)
        tt = t[: len(t) - i]
        x[i:] += g * np.sin(2 * np.pi * (48 + 25 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.07)
    return stereo(norm(np.tanh(x * 2)))


def tick():
    d = 0.2
    t = secs(d)
    x = hp(noise(d), 3000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.03) * 0.7
    return stereo(norm(x))


def shimmer(d=1.6):
    t = secs(d)
    x = np.zeros(len(t))
    for k, f in enumerate((1568, 2093, 2637, 3136, 4186)):
        x += np.sin(2 * np.pi * f * t + k) * np.exp(-t / (0.5 + 0.1 * k)) * (1 - np.exp(-t / 0.02))
    x += hp(noise(d), 8000) * np.exp(-t / 0.15) * 0.3
    return reverb(norm(x), 1.5, 0.4)


def rumble(d=3.4):
    t = secs(d)
    p = t / d
    x = lp(noise(d), 120, 4) * 3 + np.sin(2 * np.pi * 42 * t) * 0.4
    return stereo(norm(x * p**1.8))


# ---------------------------------------------------------------- música


def load_music():
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", ROOT / "assets" / "music" / "musica.m4a", "-f", "f32le",
         "-ac", "2", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def edit_music(m):
    t_in, t_a = 1.12, 8.423  # golpe 1 (4.52 s de la pista) cae en H1 = 3.40 s
    t_b = t_a + 7.806  # se quitan 4 compases (123 BPM): el empalme cae en el mismo tiempo del compás
    xf = int(0.012 * SR)
    s1 = m[int(t_in * SR): int(t_a * SR) + xf].copy()
    s2 = m[int(t_b * SR): int((t_b + TOTAL) * SR)].copy()
    ramp = np.sqrt(np.linspace(0, 1, xf))[:, None]
    s1[-xf:] = s1[-xf:] * ramp[::-1] + s2[:xf] * ramp
    out = np.concatenate([s1, s2[xf:]])[: int(TOTAL * SR)]
    out[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
    return out


def suspense(m):
    """Último compás antes del golpe final: la música se ahoga (pasabajos) y luego silencio."""
    a, z0, z1 = b(44), 26.50, H3 - 0.012
    i0, i1 = int(a * SR), int(z0 * SR)
    n = i1 - i0
    blk = 256
    zi = np.zeros((2, 1, 2))
    for i in range(0, n, blk):
        p = i / n
        fc = 16000 * (420 / 16000) ** (p**0.8)
        sos = butter(2, fc, btype="low", fs=SR, output="sos")
        for c in range(2):
            seg = m[i0 + i: i0 + min(i + blk, n), c]
            m[i0 + i: i0 + min(i + blk, n), c], zi[c] = sosfilt(sos, seg, zi=zi[c])
    f = int(0.03 * SR)
    m[i1 - f: i1] *= np.linspace(1, 0, f)[:, None]
    m[i1: int(z1 * SR)] = 0
    k = int(z1 * SR)
    m[k: k + int(0.006 * SR)] *= np.linspace(0, 1, int(0.006 * SR))[:, None]
    # cola: se apaga sola, rematamos con un fundido corto
    e = int((TOTAL - 1.4) * SR)
    m[e:] *= np.linspace(1, 0, len(m) - e)[:, None] ** 1.5
    return m


# ---------------------------------------------------------------- mezcla


def place(bus, x, t, gain_db):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(bus) - i)
    bus[i: i + n] += x[:n] * 10 ** (gain_db / 20)


def ends_at(x, t):
    return t - len(x) / SR


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    music = suspense(edit_music(load_music()))
    sfx = np.zeros_like(music)

    # Cortinilla de entrada
    place(sfx, rumble(3.4), 0.0, -20)
    place(sfx, swish(0.45), 0.12, -20)
    place(sfx, paper_drop(), 0.55, -22)
    place(sfx, shimmer(1.6), 1.02, -26)
    w = whoosh(0.7, 250, 6000)
    place(sfx, w, ends_at(w, H1), -11)
    place(sfx, impact(1.0), H1, -6)

    # Acto 1: cortes con punch-in
    for t in (b(4), b(8), b(10)):
        place(sfx, swish(0.3), t - 0.15, -22)
    r = riser(b(16) - b(12))
    place(sfx, r, b(12), -17)

    # Golpe 2: photo dump
    place(sfx, impact(0.8), H2, -8)
    for k in (16, 18, 20, 22):
        place(sfx, shutter(), b(k), -9)
    for k in (24, 25, 26, 27, 28, 28.5, 29, 29.5):
        place(sfx, shutter(), b(k), -12)
        place(sfx, paper_drop(), b(k) + 0.03, -16)
    w = whoosh(b(32) - b(30), 200, 5000)
    place(sfx, w, b(30), -13)
    place(sfx, impact(0.5), b(32), -15)

    # Acto 3: ráfaga
    for t in (b(36), b(38)):
        place(sfx, swish(0.3), t - 0.15, -20)
    for k in (40, 41, 42, 43):
        place(sfx, tick(), b(k), -17)

    # Suspenso: latidos, platillo en reversa y silencio antes del golpe final
    for k, g in ((44, -12), (45, -10), (46, -8), (47, -6)):
        place(sfx, heartbeat(), b(k), g)
    rc = reverse_cymbal(1.35)
    place(sfx, rc, ends_at(rc, H3), -10)
    w = whoosh(0.5, 200, 7000)
    place(sfx, w, ends_at(w, H3), -13)
    place(sfx, impact(1.4, 3.2), H3, -4)
    place(sfx, shimmer(2.2), H3 + 0.05, -21)
    place(sfx, shimmer(1.6), H3 + 1.0, -27)

    mix = music * 0.82 + sfx
    raw = OUT / "mix_raw.wav"
    import soundfile as sf

    sf.write(raw, np.clip(mix / max(1.0, np.max(np.abs(mix)) / 0.98), -1, 1).astype(np.float32), SR,
             subtype="FLOAT")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
         "loudnorm=I=-14:TP=-1.0:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR),
         "-ac", "2", "-c:a", "pcm_s24le", OUT / "audio.wav"], check=True)
    print("audio:", OUT / "audio.wav")


if __name__ == "__main__":
    main()
