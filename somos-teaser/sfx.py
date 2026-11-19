#!/usr/bin/env python3
"""Diseño sonoro y mezcla del teaser SOMOS.

Música: propuesta 3 (152 BPM, Re). Tramo A (tensión → silencio → drop = claqueta) y tramo B
(tensión → silencio → golpe = SOMOS).
Efectos sintetizados: encendido/apagado de TV de tubo, whooshes, impactos, acorde del logo.
Uso: python3 sfx.py   -> renders/audio.wav (48 kHz estéreo, -14 LUFS)
"""
import subprocess
from pathlib import Path

import numpy as np
from scipy import signal

import teaser as T

SR = 48000
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "renders"
MUSIC = ROOT / "assets" / "music" / "propuesta_teaser_3.m4a"
rng = np.random.default_rng(7)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR)).astype(np.float64)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def stereo(x, pan=0.0, width=0.0):
    l = x * np.sqrt(0.5 * (1 - pan))
    r = x * np.sqrt(0.5 * (1 + pan))
    if width:
        d = int(0.011 * SR)
        r = (1 - width) * r + width * np.concatenate([np.zeros(d), r[:-d]])
    return np.stack([l, r], 1)


def reverb(x, size=1.6, damp=4000, mix=0.3, predelay=0.012):
    """Reverb de convolución con IR sintética (sala grande / plató)."""
    n = int(size * SR)
    t = np.arange(n) / SR
    irs = []
    for s in (1, 2):
        g = np.random.default_rng(s).standard_normal(n) * np.exp(-t * 6.9 / size)
        g = lp(g, damp)
        g = np.concatenate([np.zeros(int(predelay * SR)), g])
        irs.append(g / np.sqrt(np.sum(g ** 2)))
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wet = np.stack([signal.fftconvolve(x[:, c], irs[c])[:len(x) + n] for c in (0, 1)], 1)
    dry = np.concatenate([x, np.zeros((len(wet) - len(x), 2))])
    return dry * (1 - mix) + wet * mix * 3.0


# ------------------------------------------------------------------ efectos
def boom(d=2.2, f_start=62, f_end=30, level=1.0):
    t = tt(d)
    f = f_end + (f_start - f_end) * np.exp(-t * 3.5)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.75)
    rumble = lp(noise(d), 180) * np.exp(-t / 0.35) * 0.6
    crack = hp(noise(d), 2500) * np.exp(-t / 0.02) * 0.35
    y = np.tanh(1.6 * (sub + rumble)) * 0.9 + crack
    return reverb(y * level, 2.4, 2500, 0.35)


def sweep_noise(d, f0, f1, curve=2.0, q=1.2):
    """Ruido filtrado con un pasa-banda que barre de f0 a f1 (por bloques)."""
    x = noise(d)
    out = np.zeros_like(x)
    blk = 512
    nb = int(np.ceil(len(x) / blk))
    zi = None
    for b in range(nb):
        p = (b / max(1, nb - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        lo, hi = fc / (1 + 1 / q), min(fc * (1 + 1 / q), SR / 2 - 100)
        sos = signal.butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[b * blk:(b + 1) * blk]
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[b * blk:(b + 1) * blk] = y
    return out


def whoosh(d=0.45, f0=300, f1=4000, pan0=0.6, pan1=-0.6, peak=0.6, level=1.0):
    t = tt(d)
    x = sweep_noise(d, f0, f1, 1.0)
    p = t / d
    env = np.where(p < peak, (p / peak) ** 2.2, np.exp(-(p - peak) / (1 - peak) * 4))
    y = x * env * level * 2.2
    pan = pan0 + (pan1 - pan0) * p
    return np.stack([y * np.sqrt(0.5 * (1 - pan)), y * np.sqrt(0.5 * (1 + pan))], 1)


def reverse_swell(d=0.6):
    y = boom(1.6, 80, 40, 0.6)[:, 0]
    y = reverb(hp(noise(1.0), 400) * np.exp(-tt(1.0) / 0.25), 1.6, 5000, 0.8)[:, 0][: int(d * SR)]
    y = y[::-1] * np.linspace(0, 1, len(y)) ** 2
    return stereo(y * 0.7, 0, 0.5)


def sting(d=3.2):
    """Acorde del logo: Re-La (quintas) con ataque de campana y cola larga."""
    t = tt(d)
    y = np.zeros_like(t)
    for f, a, dec in ((73.42, 0.30, 1.6), (146.83, 0.22, 1.4), (293.66, 0.16, 1.2), (440.0, 0.12, 1.0),
                      (587.33, 0.09, 0.9), (880.0, 0.06, 0.7), (1760.0, 0.03, 0.4)):
        for det in (-0.6, 0.6):
            y += np.sin(2 * np.pi * (f + det) * t) * a * np.exp(-t / dec)
    y *= 1 - np.exp(-t / 0.004)
    return reverb(y * 0.8, 2.8, 7000, 0.45)


def tick(pitch=1.0):
    d = 0.12
    t = tt(d)
    y = bp(noise(d), 1500 * pitch, 6000 * pitch) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 900 * pitch * t) * np.exp(-t / 0.015) * 0.3
    return reverb(y * 0.6, 0.6, 8000, 0.2)


def sparkle(d=0.7):
    t = tt(d)
    f = 5200 + 4000 * t / d
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.12 * (1 - np.exp(-t / 0.02))
    return reverb(y, 1.2, 12000, 0.4)


def tv_on_sound(d):
    """Aparece el punto de luz: golpe grave suave, 'ping' cristalino en Re-La y aire que sube hasta la apertura."""
    t = tt(d)
    att = 1 - np.exp(-t / 0.003)
    thump = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.09) * att * 0.5
    ping = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t / dec) for f, a, dec in
               ((1174.66, 0.10, 0.50), (1760.0, 0.06, 0.35), (2349.32, 0.03, 0.25))) * att
    air = bp(noise(d), 2000, 9000) * 0.015 * (t / d) ** 2
    return reverb(thump + ping + air, 1.6, 9000, 0.35)


def tv_off_sound():
    """Apagado de televisor de tubo: whine que cae, 'pop' eléctrico y estática breve."""
    d = 0.55
    t = tt(d)
    f = 9000 * np.exp(-t * 14) + 120
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * 0.25
    pop_t = int(0.30 * SR)
    pop = np.zeros_like(t)
    tp = t[: len(t) - pop_t]
    pop[pop_t:] = (np.sin(2 * np.pi * 70 * tp) * np.exp(-tp / 0.05) * 0.9 + hp(noise(d)[: len(tp)], 2000) * np.exp(-tp / 0.008) * 0.6)
    stat = hp(noise(d), 1200) * 0.12 * ((t > 0.02) & (t < 0.16))
    y = whine + pop + stat
    return reverb(y, 0.9, 5000, 0.2)


# ------------------------------------------------------------------ mezcla
def load_music():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(MUSIC), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def build():
    N = int(T.TOTAL * SR) + SR
    mix = np.zeros((N, 2))

    def add(x, at, gain=1.0):
        if x.ndim == 1:
            x = stereo(x)
        k = int(round(at * SR))
        if k < 0:
            x = x[-k:]
            k = 0
        e = min(N, k + len(x))
        mix[k:e] += x[: e - k] * gain

    # --- música: tramo A + tramo B
    mus = load_music()
    t = np.arange(N) / SR
    ka, kb = int(T.MUSIC_A_IN * SR), int(T.T_END * SR)
    A = mus[ka:ka + kb].copy()
    fo = int(0.012 * SR)
    A[-fo:] *= np.linspace(1, 0, fo)[:, None]
    m = np.zeros((N, 2))
    m[:len(A)] = A
    kbin = int(T.MUSIC_B_IN * SR)
    B = mus[kbin:kbin + (N - kb)].copy()
    B[:fo] *= np.linspace(0, 1, fo)[:, None]
    m[kb:kb + len(B)] += B
    # tras el golpe de SOMOS: filtro que cierra y se desvanece
    lpm = np.stack([lp(m[:, c], 480, 4) for c in (0, 1)], 1)
    x = np.clip((t - T.T_LOGO - 0.3) / 1.2, 0, 1)[:, None]
    m = m * (1 - x) + lpm * x
    fade = np.clip(1 - (t - (T.T_LOGO + 0.5)) / (T.TV_END - (T.T_LOGO + 0.5)), 0, 1) ** 1.5
    m *= np.where(t > T.T_LOGO + 0.5, fade, 1.0)[:, None]
    mix += m * 0.92

    # --- intro: la TV vieja se enciende (reverso del apagado del cierre)
    add(tv_on_sound(T.T_OPEN - T.T_DOT), T.T_DOT, 0.7)
    add(whoosh(0.22, 500, 7000, 0, 0, 0.5, 1.0), T.T_LINE - 0.08, 0.32)  # el punto se dispara en línea
    add(reverse_swell(0.40), T.T_OPEN - 0.40, 0.6)
    add(boom(2.0, 64, 32, 0.85), T.T_OPEN, 0.6)
    add(stereo(hp(noise(0.2), 1500) * np.exp(-tt(0.2) / 0.05) * 0.25, 0, 0.5), T.T_OPEN, 0.6)  # chispazo de estática

    # --- montaje: acentos discretos en las transiciones
    for i, (st, en, clip, src, sp, tin, mot) in enumerate(T.EDL[1:], 1):
        if tin == "flash":
            add(stereo(hp(noise(0.25), 3000) * np.exp(-tt(0.25) / 0.05) * 0.22, 0, 0.5), st, 0.45)
        elif tin == "punch":
            add(whoosh(0.22, 600, 4000, 0, 0, 0.7, 1.0), st - 0.15, 0.22)
        elif tin == "leak":
            add(whoosh(0.5, 300, 3000, -0.5, 0.5, 0.4, 1.0), st - 0.2, 0.22)

    # --- cierre: corte a la línea de luz → MUY PRONTO → silencio → SOMOS en solitario → TV vieja
    add(boom(2.4, 58, 30, 0.8), T.T_END, 0.55)
    d_line = T.T_SIL - T.T_END
    tl = tt(d_line)
    whine = np.sin(2 * np.pi * (3900 + 400 * tl / d_line) * tl) * 0.014 * np.minimum(1, tl / 0.3)
    add(stereo(whine, 0, 0.4), T.T_END, 1.0)
    add(whoosh(0.35, 800, 8000, 0, 0, 0.15, 1.0), T.T_CLAP2 - 0.03, 0.35)
    add(boom(2.0, 62, 30, 0.6), T.T_CLAP2, 0.45)
    ds = T.T_SIL - T.T_CLAP2
    ts = tt(ds)
    drone = (np.sin(2 * np.pi * 36.71 * ts) * 0.35 + np.sin(2 * np.pi * 73.42 * ts) * 0.12 +
             lp(noise(ds), 500) * 0.05) * np.minimum(1, ts / 0.2) * np.minimum(1, (ds - ts) / 0.1)
    add(stereo(drone, 0, 0.5), T.T_CLAP2 + 0.03, 0.75)
    add(reverse_swell(0.45), T.T_LOGO - 0.45, 0.8)
    add(boom(2.6, 70, 30, 0.8), T.T_LOGO, 0.55)
    add(whoosh(0.40, 600, 9000, 0, 0, 0.12, 1.0), T.T_LOGO - 0.02, 0.4)  # se abre el obturador de luz
    add(sting(), T.T_LOGO, 0.5)  # acorde Re-La (tonalidad de la canción)
    for k in range(5):  # cada letra aterriza
        add(tick(1.0 + 0.12 * k), T.T_LOGO + 0.07 + 0.055 * k + 0.24, 0.5)
    add(sparkle(), T.T_LOGO + 1.0, 0.3)
    add(tv_off_sound(), T.T_TV, 0.75)

    mix = mix[: int(T.TOTAL * SR)]
    fo = int(0.08 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    peak = np.abs(mix).max()
    mix = mix / peak * 0.89
    OUT.mkdir(exist_ok=True)
    raw = OUT / "audio_raw.wav"
    import wave
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.0:LRA=11",
                    "-ar", str(SR), str(OUT / "audio.wav")], check=True)
    print("ok", OUT / "audio.wav")


if __name__ == "__main__":
    build()
