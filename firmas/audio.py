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


MUSIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "musica.m4a")
MUSIC_DROP = 22.33   # s en la cancion donde entra el ritmo
VIDEO_DROP = None    # se alinea con el final del cambio de hoja


def pen_bus(strokes, total):
    """pluma fina: un solo roce continuo y suave cuya intensidad sigue los trazos"""
    n = int(total * SR)
    envs = np.zeros((n, 2))
    vmax = np.percentile([e["len"] / max(e["t1"] - e["t0"], 1e-3) for e in strokes], 90)
    for e in strokes:
        dur = max(e["t1"] - e["t0"], 0.02)
        speed = min(1.0, (e["len"] / dur) / vmax)
        k = int(dur * SR)
        a, r = min(int(0.03 * SR), k // 2 + 1), int(0.07 * SR)
        w = np.ones(k + r)
        w[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
        w[k:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
        add(envs, e["t0"], w * (0.45 + 0.55 * speed), e["x"])
    envs = np.tanh(envs * 0.9)  # dos firmas a la vez no suenan al doble
    envs = lp(envs.T, 25).T.clip(0)
    out = np.zeros((n, 2))
    for c in range(2):
        w = rng.standard_normal(n)
        body = bp(w, 900, 3800)                               # roce sedoso
        air = bp(rng.standard_normal(n), 4200, 7500) * 0.22   # un poco de aire
        nib = bp(rng.standard_normal(n), 2300, 2900, 2) * 0.5  # caracter de la punta
        flutter = 0.7 + 0.3 * np.tanh(lp(rng.standard_normal(n) * 7, 9))
        grain = 0.88 + 0.12 * lp(rng.standard_normal(n) * 8, 70)
        out[:, c] = (body + air + nib) * flutter * grain * envs[:, c]
    return out


def soft_tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t / 0.004) * 0.6 + np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.008) * 0.3


def load_music(start, total):
    import subprocess
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{start:.3f}", "-t", f"{total:.3f}", "-i", MUSIC,
                          "-f", "s16le", "-ar", str(SR), "-ac", "2", "-"], capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float64) / 32768
    out = np.zeros((int(total * SR), 2))
    out[:min(len(m), len(out))] = m[:len(out)]
    return out


def main():
    ev = json.load(open(os.path.join(WORK, "events.json")))
    total = ev["total"]
    n = int(total * SR)
    strokes = ev["events"]
    pen = pen_bus(strokes, total)
    ticks = np.zeros((n, 2))
    seen = set()
    for e in sorted(strokes, key=lambda e: e["t0"]):
        key = (e["page"], e["group"])
        if key not in seen:           # solo al apoyar la pluma en cada firma
            seen.add(key)
            add(ticks, e["t0"] - 0.003, soft_tick(), e["x"])
    pen = pen / np.percentile(np.abs(pen), 99.9) * 0.20 + ticks * 0.10

    ts, td = ev["trans_start"], ev["trans_dur"]
    fx = np.zeros((n, 2))
    add(fx, ts - 0.05, whoosh(td + 0.15, 300, 2600) * 1.0, 0.4)
    fx = fx / np.abs(fx).max() * 0.16

    music = load_music(MUSIC_DROP - (ts + td), total)
    fi, fo = int(0.35 * SR), int(1.3 * SR)
    music[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2
    music[-fo:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fo)))[:, None]
    music *= 0.62

    wet = np.zeros_like(pen)
    for d, g in ((0.017, 0.2), (0.031, 0.12)):
        k = int(d * SR)
        wet[k:] += pen[:-k][:, ::-1] * g
    buf = music + pen + lp(wet.T, 4000).T + fx
    buf = np.tanh(buf * 1.05) / np.tanh(1.05) * 0.94
    wavfile.write(os.path.join(WORK, "audio.wav"), SR, (buf * 32767).astype(np.int16))
    wavfile.write(os.path.join(WORK, "pluma_sola.wav"), SR, (np.clip(pen * 3, -1, 1) * 32767).astype(np.int16))
    print("audio listo", n / SR, "s")


if __name__ == "__main__":
    main()
