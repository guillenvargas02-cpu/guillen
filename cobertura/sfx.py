#!/usr/bin/env python3
"""Banda sonora del video de COBERTURA: la canción completa + efectos de sonido sintetizados.

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
BEAT = 60 / 124
D1 = 2.68  # drop de la canción


def g(k):
    return D1 + k * BEAT


DUMP, B_IN, R_IN, LOGO = g(16), g(36), g(44), g(50)
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


def prep_music(m):
    """La canción entra completa desde 0 s (cabe en 29.9 s); sólo un fundido final corto."""
    out = m[: int(TOTAL * SR)].copy()
    if len(out) < int(TOTAL * SR):
        out = np.pad(out, ((0, int(TOTAL * SR) - len(out)), (0, 0)))
    e = int((TOTAL - 0.8) * SR)
    out[e:] *= np.linspace(1, 0, len(out) - e)[:, None] ** 1.5
    return out


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
    music = prep_music(load_music())
    sfx = np.zeros_like(music)

    # Cortinilla de entrada (sube la canción): el logo se arma y la cámara cruza la O en el drop
    place(sfx, rumble(D1), 0.0, -22)
    place(sfx, swish(0.45), 0.12, -21)
    place(sfx, paper_drop(), 0.5, -23)
    w = whoosh(0.6, 250, 6000)
    place(sfx, w, ends_at(w, D1), -12)
    place(sfx, impact(1.0), D1, -7)

    # Entrevista: cortes con punch-in
    for t in (g(4), g(8), g(10), g(12)):
        place(sfx, swish(0.3), t - 0.15, -22)
    r = riser(g(16) - g(12))
    place(sfx, r, g(12), -20)

    # Photo dump
    place(sfx, impact(0.8), DUMP, -9)
    for k in (16, 18, 20, 22):
        place(sfx, shutter(), g(k), -9)
    for k in (24, 25, 26, 27, 28, 28.5, 29, 29.5):
        place(sfx, shutter(), g(k), -12)
        place(sfx, paper_drop(), g(k) + 0.03, -16)
    w = whoosh(g(32) - g(30), 200, 5000)
    place(sfx, w, g(30), -14)
    place(sfx, impact(0.5), g(32), -15)
    place(sfx, swish(0.3), g(34) - 0.15, -21)

    # Quiebre de bajo: golpe grave, latidos crecientes y platillo en reversa hacia el regreso
    place(sfx, impact(1.2, 2.6), B_IN, -10)
    for k, gain in ((40, -15), (41, -13), (42, -11), (43, -9)):
        place(sfx, heartbeat(), g(k), gain)
    rc = reverse_cymbal(1.4)
    place(sfx, rc, ends_at(rc, R_IN), -11)

    # Regreso: impacto y un golpe en cada corte de la ráfaga
    place(sfx, impact(1.3, 2.8), R_IN, -6)
    for k in (45, 46, 47, 48, 49):
        place(sfx, tick(), g(k), -16)
        place(sfx, swish(0.25), g(k) - 0.12, -24)

    # Logo final
    w = whoosh(0.45, 200, 7000)
    place(sfx, w, ends_at(w, LOGO), -14)
    place(sfx, impact(1.4, 3.0), LOGO, -6)
    place(sfx, shimmer(2.2), LOGO + 0.05, -21)
    place(sfx, shimmer(1.6), LOGO + 1.0, -27)

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
