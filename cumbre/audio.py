#!/usr/bin/env python3
"""Mezcla de audio: música (opción 1, 120 BPM) editada en frase + diseño sonoro sintetizado + click del usuario.

Mapa de la música (segundos de la pista original):
  video 2.5-20.0  -> pista 106.76-124.26   (silencio de tensión; golpe en 107.26 = click del cursor a los 3.0 s;
                                            drop completo en 108.26 = 4.0 s, cuando el portal cubre la pantalla)
  video 20.0-35.0 -> pista 148.26-163.26   (corte en inicio de frase de 8 compases; el decaimiento de 160.26
                                            cierra el video de forma natural)
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
DUR = 35.0
SC = Path("/tmp/claude-0/-home-user-guillen/e79892bd-5db3-5f50-b81b-f961e67b318d/scratchpad")
N = int(DUR * SR)


def load(p):
    y, sr = sf.read(p, always_2d=True)
    assert sr == SR, sr
    return y.astype(np.float32)


def place(dst, src, t, gain=1.0):
    i = int(round(t * SR))
    j = min(len(dst), i + len(src))
    if j > i:
        dst[i:j] += src[: j - i] * gain


def env(n, a, d):
    """ataque/decay exponencial (segundos)."""
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-np.maximum(t - a, 0) / d)
    return e.astype(np.float32)


def stereo(x, width=0.0, seed=0):
    if width <= 0:
        return np.stack([x, x], 1)
    rng = np.random.default_rng(seed)
    d = int(rng.integers(8, 24))
    r = np.concatenate([np.zeros(d, np.float32), x[:-d]])
    return np.stack([x, x * (1 - width) + r * width], 1)


def noise(n, seed):
    return np.random.default_rng(seed).normal(0, 1, n).astype(np.float32)


def onepole_lp(x, fc):
    """filtro pasa-bajos de un polo con frecuencia de corte variable (array o escalar)."""
    fc = np.broadcast_to(np.asarray(fc, np.float32), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def whoosh(dur, f0, f1, seed, rev=False):
    n = int(dur * SR)
    t = np.linspace(0, 1, n, dtype=np.float32)
    fc = f0 * (f1 / f0) ** t
    x = noise(n, seed)
    lp = onepole_lp(x, fc)
    hp = lp - onepole_lp(lp, fc * 0.25)
    e = np.clip(np.sin(np.pi * t), 0, 1) ** 1.5
    y = hp * e
    if rev:
        y = y[::-1]
    return y / (np.abs(y).max() + 1e-9)


def sub_boom(dur=1.2, f0=72, f1=38):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * env(n, 0.004, 0.38)
    return (y / np.abs(y).max()).astype(np.float32)


def blip(freq, dur=0.05, seed=0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * 0.7 + np.sin(2 * np.pi * freq * 2.01 * t) * 0.3) * env(n, 0.001, dur / 4)
    return y.astype(np.float32)


def tone_sweep(dur, f0, f1, a=0.02, d=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(t / a, 1) * np.clip((dur - t) / (d or dur * 0.5), 0, 1)
    return (np.sin(ph) * 0.8 + np.sin(ph * 3) * 0.1) .astype(np.float32) * e.astype(np.float32)


def main():
    out = SC / "work"
    music = load(SC / "audio" / "opt1_full.wav")
    click = load(SC / "audio" / "click.wav")

    mix = np.zeros((N, 2), np.float32)

    # ---------------- música
    def seg(a, b):
        return music[int(round(a * SR)): int(round(b * SR))].copy()
    m1 = seg(106.76, 124.26 + 0.01)
    m2 = seg(148.26 - 0.01, 163.26)
    xf = int(0.01 * SR)  # crossfade de 10 ms en el beat
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    mus = np.zeros((N, 2), np.float32)
    i0 = int(2.5 * SR)
    mus[i0:i0 + len(m1)] += m1
    j0 = int(round(20.0 * SR)) - xf // 2
    m1_end = i0 + len(m1)
    # fundido cruzado
    mus[j0:j0 + xf] *= (1 - ramp)
    mus[j0 + xf:m1_end] = 0
    mus[j0:j0 + len(m2)] += m2[: N - j0] * np.concatenate([ramp, np.ones((len(m2) - xf, 1), np.float32)])[: N - j0]
    # el decaimiento natural termina en ~163; desvanecer los últimos 0.6 s por limpieza
    fade = np.ones(N, np.float32)
    k0 = int(34.3 * SR)
    fade[k0:] = np.linspace(1, 0, N - k0) ** 2
    mus *= fade[:, None]
    mix += mus * 0.92

    # ---------------- diseño sonoro de la intro
    # cama grave que crece hacia el click
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    drone = (np.sin(2 * np.pi * 46 * t) + 0.35 * np.sin(2 * np.pi * 92 * t + 0.4)) * (t / 3.0) ** 2.2
    air = whoosh(3.0, 300, 5000, 11) * (t / 3.0) ** 3
    place(mix, stereo((drone * 0.22 + air * 0.05).astype(np.float32), 0.4, 1), 0.0)
    # caret: dos tics suaves
    place(mix, stereo(blip(1800, 0.035)), 0.0, 0.10)
    place(mix, stereo(blip(1800, 0.035)), 0.30, 0.10)
    # línea de escaneo que se abre
    place(mix, stereo(tone_sweep(0.55, 420, 1400, 0.01) * 0.5, 0.5, 2), 0.45, 0.10)
    place(mix, stereo(whoosh(0.6, 800, 6000, 3), 0.6, 3), 0.48, 0.10)
    # "difusión": tics de datos en cada paso del mosaico (8 pasos entre 0.55 y 1.65 s)
    for i in range(8):
        tt = 0.55 + i * 1.10 / 8
        place(mix, stereo(blip(2400 + i * 260, 0.03), 0.3, 10 + i), tt, 0.075 * (0.6 + 0.4 * i / 7))
    # anillo de carga verde/rojo
    place(mix, stereo(tone_sweep(0.62, 260, 780, 0.05) * 0.45, 0.5, 4), 1.05, 0.12)
    place(mix, stereo(tone_sweep(0.55, 330, 990, 0.05) * 0.45, 0.5, 5), 1.18, 0.09)
    # tecleo del texto (caret)
    for i in range(7):
        place(mix, stereo(blip(3200 + (i % 3) * 300, 0.022)), 1.47 + i * 0.05, 0.05)
    for i in range(6):
        place(mix, stereo(blip(3000 + (i % 3) * 300, 0.022)), 1.68 + i * 0.055, 0.05)
    # entrada del cursor
    place(mix, stereo(whoosh(0.55, 500, 3000, 6), 0.5, 6), 1.92, 0.13)
    # CLICK (el usuario lo proporcionó): presión exactamente en 3.0 s, sobre el golpe de la música
    place(mix, click, 3.0, 1.15)
    place(mix, stereo(sub_boom(1.4, 80, 36), 0.0), 3.0, 0.42)
    # portal: aspiración que sube hasta el drop
    place(mix, stereo(whoosh(0.95, 200, 9000, 7), 0.7, 7), 3.08, 0.20)
    place(mix, stereo(sub_boom(1.6, 64, 32)), 4.0, 0.38)

    # ---------------- transiciones del cuerpo (discretas)
    for tt in (7.5, 17.0, 28.0):  # whip
        place(mix, stereo(whoosh(0.32, 900, 7000, int(tt * 10)), 0.6, int(tt)), tt - 0.16, 0.10)
    for tt in (12.0, 26.0):  # línea de escaneo
        place(mix, stereo(tone_sweep(0.40, 1800, 600, 0.01) * 0.5 + whoosh(0.40, 2000, 8000, int(tt)) * 0.3, 0.5, int(tt)), tt, 0.07)
    for tt in (13.0, 29.0):  # glitch
        g = noise(int(0.08 * SR), int(tt)) * env(int(0.08 * SR), 0.001, 0.02)
        g = np.sign(g) * np.minimum(np.abs(g), 0.6)
        place(mix, stereo(g.astype(np.float32), 0.5, 3), tt, 0.06)
    place(mix, stereo(np.concatenate([blip(2600 - i * 300, 0.03) for i in range(5)])), 15.0, 0.05)  # mosaico
    # seguimiento de rostro: dos tics de "fijación"
    place(mix, stereo(blip(2200, 0.03)), 5.62, 0.07)
    place(mix, stereo(blip(2900, 0.04)), 5.85, 0.08)

    # ---------------- cierre
    place(mix, stereo(whoosh(0.6, 500, 2500, 21), 0.5, 21), 33.05, 0.10)
    place(mix, click, 34.0, 1.05)
    place(mix, stereo(whoosh(0.55, 6000, 300, 22), 0.5, 22), 34.0, 0.12)
    place(mix, stereo(sub_boom(1.0, 70, 34)), 34.53, 0.30)
    place(mix, stereo(blip(1800, 0.035)), 34.55, 0.08)
    place(mix, stereo(blip(1800, 0.035)), 34.82, 0.08)

    # ---------------- master: normaliza a pico -1 dBFS (la sonoridad final -14 LUFS se fija al unir con el video)
    peak = np.abs(mix).max()
    print("peak pre", peak)
    x = mix / max(peak, 1e-9) * 0.89
    # fade-in de 10 ms / fade-out final
    x[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    sf.write(out / "audio.wav", x, SR, subtype="PCM_24")
    print("ok", out / "audio.wav")


if __name__ == "__main__":
    main()
