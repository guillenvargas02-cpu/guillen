#!/usr/bin/env python3
"""Diseño sonoro y mezcla del teaser SOMOS.

Música: propuesta 1 desde 2.30 s (los golpes de su intro = encendido de los reflectores).
Efectos sintetizados: clunk de reflector viejo + zumbido de balastro, claqueta, whooshes, glitch, riser, impacto.
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
MUSIC = ROOT / "assets" / "music" / "propuesta_teaser_1.m4a"
CLIP_J = Path("/root/.claude/uploads/55edaf88-889f-5488-977a-7b311e9e3b41/a1e80d0a-IMG_8111.MOV")
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
def clunk(big=1.0):
    """Interruptor/breaker de un reflector viejo: golpe mecánico doble, cuerpo grave y resonancia metálica."""
    d = 0.6
    t = tt(d)
    x = np.zeros_like(t)
    for off, g in ((0.0, 1.0), (0.032, 0.55)):
        k = int(off * SR)
        tr = hp(noise(d), 1800) * np.exp(-t / 0.0035) * 0.9
        mech = bp(noise(d), 250, 1400) * np.exp(-t / 0.028) * 0.8
        x[k:] += (tr + mech)[: len(x) - k] * g
    f = 95 * np.exp(-t * 4) + 42
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11) * 1.1 * big
    ring = sum(np.sin(2 * np.pi * fr * t + p) * a for fr, a, p in
               ((1180, 0.05, 0.3), (1735, 0.035, 1.1), (2645, 0.025, 2.0), (3820, 0.015, 0.7))) * np.exp(-t / 0.10)
    y = x * 0.55 + thump + ring
    return reverb(y, 1.8, 3500, 0.32) * 0.9


def hum(d, fade_in=0.5, fade_out=0.3, level=1.0, start_pitch=1.0):
    """Zumbido de balastro / filamento (60 Hz y armónicos con un poco de 'buzz')."""
    t = tt(d)
    f0 = 60 * start_pitch
    x = 0.5 * np.sin(2 * np.pi * f0 * t) + 0.32 * np.sin(2 * np.pi * 2 * f0 * t) + 0.12 * np.sin(2 * np.pi * 3 * f0 * t)
    buzz = hp(np.tanh(4 * np.sin(2 * np.pi * 2 * f0 * t)), 400) * 0.06
    fil = bp(noise(d), 3000, 9000) * 0.012 * (1 + 0.5 * np.sin(2 * np.pi * 7 * t))
    y = (x * 0.35 + buzz + fil) * level
    env = np.minimum(1, t / fade_in) * np.minimum(1, (d - t) / fade_out)
    return stereo(y * env, 0, 0.4)


def clap_sound():
    """Golpe de claqueta de madera + sala."""
    d = 0.5
    t = tt(d)
    tr = hp(noise(d), 700) * np.exp(-t / 0.005)
    body = (np.sin(2 * np.pi * 540 * t) * np.exp(-t / 0.022) * 0.6 + np.sin(2 * np.pi * 1960 * t) * np.exp(-t / 0.011) * 0.3)
    k = int(0.0045 * SR)
    tr2 = np.concatenate([np.zeros(k), tr[:-k]]) * 0.5
    y = tr * 0.9 + tr2 + body
    return reverb(y, 1.2, 6000, 0.28) * 1.0


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


def zap(d=0.11, seed=0):
    r = np.random.default_rng(seed)
    t = tt(d)
    y = np.zeros_like(t)
    seg = int(0.012 * SR)
    for k in range(0, len(t), seg):
        f = r.choice([180, 420, 880, 1600, 3100])
        y[k:k + seg] = np.sign(np.sin(2 * np.pi * f * t[k:k + seg])) * r.uniform(0.3, 1)
    y = np.round(y * 6) / 6
    y = hp(y, 150) * np.exp(-t / 0.08) * 0.35
    return stereo(y, r.uniform(-0.5, 0.5), 0.3)


def riser(d=0.9):
    t = tt(d)
    p = t / d
    n = sweep_noise(d, 400, 9000, 1.6, 0.9) * 1.5
    f = 180 * (8 ** p ** 1.5)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12
    y = (n + tone) * p ** 2.2
    return reverb(y, 1.4, 6000, 0.25)[: len(y)]


def reverse_swell(d=0.6):
    y = boom(1.6, 80, 40, 0.6)[:, 0]
    y = reverb(hp(noise(1.0), 400) * np.exp(-tt(1.0) / 0.25), 1.6, 5000, 0.8)[:, 0][: int(d * SR)]
    y = y[::-1] * np.linspace(0, 1, len(y)) ** 2
    return stereo(y * 0.7, 0, 0.5)


def sting(d=3.2):
    """Acorde del logo: Fa-Do (quintas) con ataque de campana y cola larga."""
    t = tt(d)
    y = np.zeros_like(t)
    for f, a, dec in ((87.31, 0.30, 1.6), (174.61, 0.22, 1.4), (349.23, 0.16, 1.2), (523.25, 0.12, 1.0),
                      (698.46, 0.09, 0.9), (1046.5, 0.06, 0.7), (2093.0, 0.03, 0.4)):
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


def load_clip_audio(path, start, dur):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", str(path), "-vn", "-f", "f32le",
                          "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
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

    # --- música
    mus = load_music()
    m0 = int(T.MUSIC_OFFSET * SR)
    m = mus[m0:m0 + N].copy()
    if len(m) < N:
        m = np.concatenate([m, np.zeros((N - len(m), 2))])
    t = np.arange(N) / SR
    # final: tras la segunda claqueta, filtro que cierra y desvanece
    kf = int(T.T_CLAP2 * SR)
    lpm = np.stack([lp(m[:, c], 420, 4) for c in (0, 1)], 1)
    x = np.clip((t - T.T_CLAP2) / 1.4, 0, 1)[:, None]
    m = m * (1 - x) + lpm * x
    fade = np.clip(1 - (t - (T.T_CLAP2 + 0.4)) / (T.TOTAL - 0.25 - (T.T_CLAP2 + 0.4)), 0, 1) ** 1.6
    m *= np.where(t > T.T_CLAP2 + 0.4, fade, 1.0)[:, None]
    # ducking ligero bajo los golpes de claqueta
    mix += m * 0.92

    # --- intro: tono de sala + reflectores
    room = stereo(lp(noise(T.T_M1 + 0.5), 900) * 0.006, 0, 0.6)
    room[:, :] *= np.minimum(1, np.arange(len(room))[:, None] / (0.4 * SR))
    add(room, 0.0)
    for i, tl in enumerate(T.T_LIGHTS):
        add(clunk(1.0 + 0.15 * i), tl - 0.004, 0.55)
        add(hum(T.T_M1 + 0.3 - tl, 0.35, 0.45, 0.10 - 0.02 * i, 1.0 + 0.004 * i), tl + 0.02, 1.0)
    # claqueta 1
    add(stereo(bp(noise(0.5), 300, 2500) * np.exp(-tt(0.5) / 0.15) * 0.08, 0.2), 3.92)  # roce al abrir
    add(clap_sound(), T.T_CLAP1 - 0.003, 0.75)
    add(boom(2.0, 64, 32, 0.85), T.T_CLAP1, 0.7)
    add(whoosh(0.30, 2500, 600, -0.3, 0.3, 0.2, 0.5), T.T_CLAP1 + 0.05, 0.35)  # el pizarrón cae
    # zoom a través de la O
    add(whoosh(0.55, 250, 7000, 0, 0, 0.85, 1.0), T.T_ZOOM0 - 0.1, 0.55)

    # --- transiciones del montaje
    for i, (st, en, clip, src, sp, tin, mot) in enumerate(T.EDL):
        if tin == "whip":
            add(whoosh(0.32, 500, 5000, 0.7, -0.7, 0.45, 1.0), st - 0.16, 0.32)
        elif tin == "zoom":
            add(whoosh(0.34, 300, 6000, 0, 0, 0.5, 1.0), st - 0.17, 0.32)
        elif tin == "glitch":
            add(zap(0.12, i), st - 0.03, 0.45)
        elif tin == "logo":
            add(whoosh(0.70, 400, 6000, 0.8, -0.8, 0.5, 1.0), st - 0.35, 0.42)
        elif tin == "flash":
            add(stereo(hp(noise(0.25), 3000) * np.exp(-tt(0.25) / 0.05) * 0.25, 0, 0.5), st, 0.5)
        elif tin == "strobe":
            add(boom(1.6, 70, 36, 0.7), st, 0.55)
            for k in range(3):
                add(zap(0.06, 40 + k), st + k * 0.066, 0.35)
    # quiebre: risas del set, lejanas y filtradas (misterio)
    try:
        ja = load_clip_audio(CLIP_J, 6.2, T.T_M2 - T.T_BREAK + 0.2)
        ja = np.stack([bp(ja[:, c], 350, 2600) for c in (0, 1)], 1)
        ja = reverb(ja, 2.2, 3000, 0.55)[: len(ja)]
        env = np.minimum(1, np.arange(len(ja)) / (0.5 * SR)) * np.minimum(1, (len(ja) - np.arange(len(ja))) / (0.6 * SR))
        add(ja * env[:, None], T.T_BREAK + 0.1, 0.35)
    except Exception as e:  # noqa: BLE001
        print("sin audio del clip J:", e)
    add(boom(2.6, 46, 28, 0.6), T.T_BREAK, 0.45)
    add(reverse_swell(0.55), T.T_M2 - 0.55, 0.8)

    # --- cierre: línea de luz → apertura a blanco → SOMOS → TV vieja que se apaga
    d_line = T.T_CLAP2 - T.T_END
    tl = tt(d_line)
    whine = np.sin(2 * np.pi * (3900 + 500 * tl / d_line) * tl) * 0.018 * (tl / d_line) ** 1.5
    add(stereo(whine, 0, 0.4), T.T_END, 1.0)  # zumbido eléctrico de la línea de luz
    add(riser(d_line), T.T_END, 0.55)
    add(reverse_swell(0.45), T.T_CLAP2 - 0.45, 0.7)
    add(boom(3.0, 62, 28, 1.0), T.T_CLAP2, 0.85)  # golpe: MUY PRONTO
    add(whoosh(0.35, 800, 8000, 0, 0, 0.15, 1.0), T.T_CLAP2 - 0.02, 0.35)
    # suspenso bajo el texto: grave en Fa y aire filtrado
    ds = T.T_LOGO - T.T_CLAP2
    ts = tt(ds)
    drone = (np.sin(2 * np.pi * 43.65 * ts) * 0.35 + np.sin(2 * np.pi * 87.31 * ts) * 0.12 +
             lp(noise(ds), 500) * 0.05) * np.minimum(1, ts / 0.2) * np.minimum(1, (ds - ts) / 0.15)
    add(stereo(drone, 0, 0.5), T.T_CLAP2 + 0.05, 0.8)
    add(reverse_swell(0.40), T.T_LOGO - 0.40, 0.8)
    # SOMOS en solitario
    add(boom(2.6, 70, 30, 0.8), T.T_LOGO, 0.6)
    add(whoosh(0.40, 600, 9000, 0, 0, 0.12, 1.0), T.T_LOGO - 0.02, 0.45)  # se abre el obturador de luz
    add(sting(), T.T_LOGO, 0.55)  # acorde brillante en Fa (tonalidad de la música)
    for k in range(5):  # cada letra aterriza
        add(tick(1.0 + 0.12 * k), T.T_LOGO + 0.07 + 0.055 * k + 0.24, 0.5)
    add(sparkle(), T.T_LOGO + 1.0, 0.35)  # destello sobre el logo
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
