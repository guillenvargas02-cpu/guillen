"""Etapa 3: sintetiza el sonido de la pluma sobre el papel, sincronizado con
cada trazo (renders/work/events.json) -> renders/work/audio.wav
"""
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

from prep import WORK

SR = 48000
rng = np.random.default_rng(7)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, hz, order=2):
    sos = signal.butter(order, hz, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def add(buf, start, mono, pan):
    """pan 0..1 (izq..der), potencia constante"""
    i = int(start * SR)
    if i >= buf.shape[0] or i < 0:
        return
    n = min(len(mono), buf.shape[0] - i)
    th = (0.25 + 0.5 * pan) * np.pi / 2
    buf[i:i + n, 0] += mono[:n] * np.cos(th)
    buf[i:i + n, 1] += mono[:n] * np.sin(th)


def scratch(dur, speed):
    """roce de plumon sobre papel: ruido filtrado cuya fuerza sigue la velocidad"""
    n = max(int(dur * SR), 64)
    pad = int(0.03 * SR)
    w = rng.standard_normal(n + pad)
    hi = bp(w, 1800, 7500)
    mid = bp(rng.standard_normal(n + pad), 500, 1600) * 0.55
    x = (hi + mid)[:n + pad]
    # variacion de velocidad de la mano (curvas = mas lento = mas suave)
    m = lp(rng.standard_normal(n + pad + SR)[SR // 2:SR // 2 + n + pad] * 6, 14)
    m = 0.58 + 0.42 * np.tanh(m)
    grain = 0.85 + 0.15 * lp(rng.standard_normal(n + pad) * 8, 90)  # fibra del papel
    env = np.ones(n + pad)
    a, r = min(int(0.006 * SR), n), min(int(0.03 * SR), n)
    env[:a] = np.linspace(0, 1, a)
    env[n:] = np.linspace(1, 0, pad) ** 2
    env[n - r:n] *= np.linspace(1, 0.6, r)
    return x * m * grain * env * (0.35 + 0.65 * speed)


def tap():
    """la punta toca el papel"""
    n = int(0.045 * SR)
    t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (170 - 600 * t) * t) * np.exp(-t / 0.011)
    click = bp(rng.standard_normal(n), 2500, 9000) * np.exp(-t / 0.0025)
    return 0.5 * thud + 0.35 * click


def whoosh(dur, f0, f1, q=1.2):
    """paso de hoja: ruido con filtro que barre"""
    n = int(dur * SR)
    w = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 256
    zi = None
    for s in range(0, n, blk):
        k = s / n
        f = f0 * (f1 / f0) ** k
        sos = signal.butter(2, [f / (1 + 0.5 / q), min(f * (1 + 0.5 / q), SR / 2 - 100)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        out[s:s + blk], zi = signal.sosfilt(sos, w[s:s + blk], zi=zi)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return out * env


def main():
    ev = json.load(open(os.path.join(WORK, "events.json")))
    total = ev["total"]
    buf = np.zeros((int(total * SR), 2))
    strokes = ev["events"]
    vmax = np.percentile([e["len"] / max(e["t1"] - e["t0"], 1e-3) for e in strokes], 90)
    last_tap = -1.0
    for e in sorted(strokes, key=lambda e: e["t0"]):
        dur = max(e["t1"] - e["t0"], 0.012)
        speed = min(1.0, (e["len"] / dur) / vmax)
        add(buf, e["t0"], scratch(dur, speed) * 0.5, e["x"])
        if e["len"] > 60 and e["t0"] - last_tap > 0.07:
            add(buf, e["t0"] - 0.004, tap() * (0.45 + 0.3 * rng.random()), e["x"])
            last_tap = e["t0"]
    pen = buf / np.percentile(np.abs(buf), 99.9)
    buf = np.zeros_like(buf)
    # entrada suave y paso de hoja
    add(buf, 0.0, whoosh(0.55, 500, 2400) * 0.5, 0.5)
    ts, td = ev["trans_start"], ev["trans_dur"]
    add(buf, ts - 0.05, whoosh(td + 0.15, 350, 3800) * 1.6, 0.35)
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    rustle = bp(rng.standard_normal(n), 2500, 10000) * (lp(np.abs(rng.standard_normal(n)) ** 6, 300) * 3) * np.exp(-((t - 0.2) / 0.16) ** 2)
    add(buf, ts, rustle * 0.9, 0.4)
    slap = np.sin(2 * np.pi * 95 * t[:4800]) * np.exp(-t[:4800] / 0.03)
    add(buf, ts + td - 0.06, slap * 0.5, 0.5)

    buf = pen * 0.42 + buf / np.percentile(np.abs(buf[buf != 0]), 99.5) * 0.4
    # un toque de sala y normalizacion
    wet = np.zeros_like(buf)
    for d, g in ((0.013, 0.22), (0.029, 0.14), (0.047, 0.08)):
        k = int(d * SR)
        wet[k:] += buf[:-k][:, ::-1] * g
    buf = buf + lp(wet.T, 5000).T
    buf = np.tanh(buf * 1.1) * 0.8
    f = int(0.25 * SR)
    buf[-f:] *= np.linspace(1, 0, f)[:, None]
    wavfile.write(os.path.join(WORK, "audio.wav"), SR, (buf * 32767).astype(np.int16))
    print("audio listo", buf.shape[0] / SR, "s  rms", float(np.sqrt((buf ** 2).mean())))


if __name__ == "__main__":
    main()
