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
DUR = 38.5          # tiempo de línea; al final se acelera 4 % (SPEED) sin cambiar el tono
SPEED = 1.04
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


def reverb(x, dur=2.0, wet=0.4, seed=0):
    """Reverb simple: convolución con ruido estéreo de caída exponencial (filtrado). Devuelve seco + húmedo."""
    from scipy.signal import fftconvolve
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    n = int(dur * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(100 + seed)
    ir = rng.normal(0, 1, (n, 2)).astype(np.float32) * np.exp(-t / (dur / 6.9))[:, None]
    ir[:, 0] = onepole_lp(ir[:, 0], 6000.0)
    ir[:, 1] = onepole_lp(ir[:, 1], 6000.0)
    ir /= np.sqrt((ir ** 2).sum(0))
    wetsig = np.stack([fftconvolve(x[:, c], ir[:, c]) for c in range(2)], 1).astype(np.float32)
    out = np.zeros_like(wetsig)
    out[: len(x)] += x * (1 - wet * 0.5)
    out += wetsig * wet
    return out


def main():
    out = SC / "work"
    music = load(SC / "audio" / "opt1_full.wav")
    click = load(SC / "audio" / "click.wav")

    mix = np.zeros((N, 2), np.float32)

    # ---------------- música
    def seg(a, b):
        return music[int(round(a * SR)): int(round(b * SR))].copy()
    m1 = seg(106.76, 124.26 + 0.01)
    m2 = seg(144.26 - 0.01, 162.76)  # empalme en compás: el photo dump cae en la parte alta y la cortinilla en el decaimiento (160.26)
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
    k0 = int(37.4 * SR)
    fade[k0:] = np.linspace(1, 0, N - k0) ** 2
    mus *= fade[:, None]
    mix += mus * 0.92

    # ---------------- diseño sonoro de la intro (cinematográfico: sin bips ni tonos)
    # cama grave oscura que crece hacia el click
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    drone = (np.sin(2 * np.pi * 43 * t) + 0.3 * np.sin(2 * np.pi * 86.3 * t + 0.4)) * (t / 3.0) ** 1.8
    rumble = onepole_lp(noise(n, 31), 180.0) * 3.0 * (t / 3.0) ** 2
    place(mix, stereo((drone * 0.20 + rumble * 0.10).astype(np.float32), 0.4, 1), 0.0)
    # golpe reverso: la cola de un impacto con reverb, invertida, que desemboca exactamente en el click
    hit = np.zeros(int(0.5 * SR), np.float32)
    hit[: int(0.4 * SR)] += sub_boom(0.4, 90, 45) * 0.6
    hit[: int(0.25 * SR)] += onepole_lp(noise(int(0.25 * SR), 41), 2500.0) * env(int(0.25 * SR), 0.001, 0.05) * 1.5
    rev_tail = reverb(np.stack([hit, hit], 1), 2.6, 0.9, seed=5)[: int(2.4 * SR)]
    rev_tail = rev_tail[::-1] * np.linspace(0.2, 1, len(rev_tail))[:, None] ** 1.5
    rev_tail /= np.abs(rev_tail).max() + 1e-9
    place(mix, rev_tail.astype(np.float32), 3.0 - len(rev_tail) / SR, 0.30)
    # la línea de escaneo se abre: aire suave
    place(mix, reverb(stereo(whoosh(0.7, 300, 2500, 3), 0.6, 3), 1.6, 0.35, seed=6), 0.42, 0.10)
    # el emblema se forma: pulso grave con reverb al empezar y "aire" al quedar nítido
    place(mix, reverb(stereo(sub_boom(0.9, 70, 40)), 2.0, 0.4, seed=7), 0.55, 0.20)
    puff = onepole_lp(noise(int(0.5 * SR), 51), 1800.0) * env(int(0.5 * SR), 0.06, 0.12)
    place(mix, reverb(stereo(puff.astype(np.float32), 0.5, 8), 2.2, 0.6, seed=8), 1.55, 0.18)
    # arcos verde y rojo: un solo barrido que cruza de izquierda a derecha
    sw = whoosh(0.75, 350, 3500, 4)
    pan = np.linspace(0, 1, len(sw), dtype=np.float32)
    place(mix, reverb(np.stack([sw * (1 - pan * 0.7), sw * (0.3 + pan * 0.7)], 1), 1.4, 0.3, seed=9), 1.02, 0.12)
    # entrada del cursor
    place(mix, stereo(whoosh(0.55, 500, 2500, 6), 0.5, 6), 1.92, 0.07)
    # CLICK (el usuario lo proporcionó): presión exactamente en 3.0 s, sobre el golpe de la música
    place(mix, click, 3.0, 1.15)
    place(mix, stereo(sub_boom(1.4, 80, 36), 0.0), 3.0, 0.42)
    # portal: aspiración que sube hasta el drop
    place(mix, stereo(whoosh(0.95, 200, 9000, 7), 0.7, 7), 3.08, 0.20)
    place(mix, stereo(sub_boom(1.6, 64, 32)), 4.0, 0.38)

    # ---------------- transiciones del cuerpo (discretas)
    for tt in (7.5, 15.5, 28.0):  # whip
        place(mix, stereo(whoosh(0.32, 900, 7000, int(tt * 10)), 0.6, int(tt)), tt - 0.16, 0.10)
    for tt in ():  # línea de escaneo (quitada)
        place(mix, stereo(tone_sweep(0.40, 1800, 600, 0.01) * 0.5 + whoosh(0.40, 2000, 8000, int(tt)) * 0.3, 0.5, int(tt)), tt, 0.07)
    for tt in ():  # glitch (quitado)
        g = noise(int(0.08 * SR), int(tt)) * env(int(0.08 * SR), 0.001, 0.02)
        g = np.sign(g) * np.minimum(np.abs(g), 0.6)
        place(mix, stereo(g.astype(np.float32), 0.5, 3), tt, 0.06)
    # seguimiento de rostro: dos tics de "fijación"

    # ---------------- cortinilla final
    # persianas: un roce corto por franja (alternando lados), del centro hacia afuera
    for i in range(8):
        order = abs(i - 3.5)
        tt = 35.55 + order * 0.045 + 0.06
        w = whoosh(0.20, 1500, 9000, 60 + i)
        l, r = (1.0, 0.35) if i % 2 == 0 else (0.35, 1.0)
        place(mix, np.stack([w * l, w * r], 1).astype(np.float32), tt, 0.05)
    # golpe a negro: sub + cuerpo grave con cola de reverb
    thud = sub_boom(1.2, 85, 34) * 0.8
    body = onepole_lp(noise(int(0.3 * SR), 71), 900.0) * env(int(0.3 * SR), 0.002, 0.06) * 2.0
    thud[: len(body)] += body
    place(mix, reverb(stereo(thud.astype(np.float32)), 2.8, 0.55, seed=12), 36.0, 0.42)
    # aparece el emblema: aire que sube y brillo suave cuando lo recorre la luz
    place(mix, reverb(stereo(whoosh(0.9, 250, 2200, 72), 0.6, 13), 2.4, 0.5, seed=13), 36.05, 0.09)
    place(mix, reverb(stereo(whoosh(0.9, 2500, 11000, 73), 0.7, 14), 2.4, 0.6, seed=14), 36.45, 0.05)

    # ---------------- photo dump: obturador suave en cada foto
    for k, tt in enumerate((31.5, 32.5, 33.0, 33.5, 34.0)):
        sh = np.zeros(int(0.12 * SR), np.float32)
        for off, g in ((0, 1.0), (0.045, 0.6)):
            n_ = int(0.03 * SR)
            c = onepole_lp(noise(n_, 80 + k * 3 + int(off * 100)), 5000.0) * env(n_, 0.0005, 0.006)
            sh[int(off * SR):int(off * SR) + n_] += c * g
        place(mix, reverb(stereo(sh, 0.4, 20 + k), 0.8, 0.25, seed=20 + k), tt - 0.01, 0.10)

    # ---------------- master: normaliza a pico -1 dBFS
    peak = np.abs(mix).max()
    print("peak pre", peak)
    x = mix / max(peak, 1e-9) * 0.89
    # fade-in de 10 ms / fade-out final
    x[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    sf.write(out / "audio_tl.wav", x, SR, subtype="PCM_24")
    # +4 % de velocidad sin cambiar el tono (rubberband), igual que el video
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out / "audio_tl.wav"), "-af",
                    f"rubberband=tempo={SPEED}:transients=crisp:detector=percussive:formant=preserved,"
                    f"atrim=0:{DUR / SPEED:.4f},afade=t=out:st={DUR / SPEED - 0.05:.4f}:d=0.05",
                    "-c:a", "pcm_s24le", str(out / "audio.wav")], check=True)
    print("ok", out / "audio.wav")


if __name__ == "__main__":
    main()
