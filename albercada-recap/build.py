#!/usr/bin/env python3
"""Recap de la Albercada SOMOS (vertical 4K, 44 s).

Capas:
1. base.mp4   — el video: tomas del evento en la terraza, la persona que habla (cortada sin silencios,
                con punch-ins) y las frases de SOMOS al final. HDR del iPhone → SDR luminoso.
2. audio.wav  — voz limpia y nivelada + canción (propuesta 3) empalmada en compás, con ducking bajo la
                voz + efectos de sonido sintetizados (whoosh, pop, obturador, boom, riser…).
3. overlay    — capa gráfica de Hyperframes (png-sequence RGBA, 4K): cortinillas, subtítulos, la nota de
                InfoPoder, las fotos, las frases SOMOS y el logo final. Se compone encima.

Uso:
  python3 build.py clips base sfx audio captions
  npx --yes hyperframes@0.8.209 render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
  python3 build.py final
  python3 build.py preview      # versión rápida 1080x1920 para revisar (usa renders/overlay si existe)

Fuentes de las tomas del evento (solo para `clips`): EVENT_SRC apunta a la carpeta con los
20261115_*.mp4 originales; el paso recorta solo los tramos usados a assets/clips/.
"""
import json
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
FPS = 30
W, H = 2160, 3840
SR = 48000

# ------------------------------------------------------------------ rejilla musical
# Canción: propuesta 3 (108 BPM). Downbeat de referencia: drop en 35.631 s; un compás = 2.22233 s.
BAR = 2.22233
BEAT = BAR / 4


def mbar(n):
    """Downbeat n de la canción (n=12 → drop 35.631, n=48 → drop 115.634)."""
    return 35.631 + (n - 12) * BAR


# (salida inicio, salida fin, canción inicio) — empalmes siempre en downbeat
MUSIC = [
    (0.0, 2 * BAR, mbar(10)),            # breakdown sin bajo: cortinilla de entrada
    (2 * BAR, 12 * BAR, mbar(12)),       # DROP 1: entra la voz (4.445)
    (12 * BAR, 14 * BAR, mbar(46)),      # pausa antes del drop: "próxima edición…"
    (14 * BAR, 18 * BAR + 2.6, mbar(48)),  # DROP 2 (31.113): frases SOMOS, logo; golpe final en 40.0
]
T_INTRO = 2 * BAR            # 4.445
T_BREAK = 12 * BAR           # 26.668
T_DROP2 = 14 * BAR           # 31.113
T_LOGO = 16.5 * BAR          # 36.668 juego con el logo
T_WHITE = 18 * BAR           # 40.002 logo sobre blanco
TOTAL = 44.0

# ------------------------------------------------------------------ voz
SPK = {"a": "video/speaker-1150.mp4", "b": "video/speaker-1151.mp4"}

# (clip, src_in, src_out, salida_inicio)
VOICE = [
    ("a", 1.50, 4.72, T_INTRO),   # Oigan, les quiero platicar … recientemente,
    ("a", 5.05, 6.65, 7.685),     # fue de una albercada que tuvimos con jóvenes,
    ("a", 7.08, 9.70, 9.305),     # justo para conocernos … el proyecto de SOMOS,
    ("a", 10.00, 13.53, 11.945),  # entonces estuvimos muy contentos … y de terraza,
    ("a", 14.72, 17.32, 15.495),  # les queremos compartir un par de notas, un par de fotos,
    ("a", 17.60, 20.98, 26.80),   # para que la próxima edición … puedan acompañarnos.
    # Frases SOMOS sobre el drop 2: el inicio de cada "Somos" cae en el beat (cada 2 beats)
    ("a", 21.57, 22.47, T_DROP2 - 0.03),             # Somos diversión,
    ("a", 22.49, 23.30, T_DROP2 + 2 * BEAT - 0.03),  # somos albercada,
    ("b", 0.69, 1.58, T_DROP2 + 4 * BEAT - 0.03),    # Somos amigos,
    ("b", 1.71, 2.58, T_DROP2 + 6 * BEAT - 0.03),    # somos el futuro,
    ("b", 2.71, 3.62, T_DROP2 + 8 * BEAT - 0.03),    # y somos México.
]

# ------------------------------------------------------------------ video base
EV = "clips/ev-{}.mp4"
# (inicio salida, fin salida, fuente, src en el inicio, zoom0, zoom1, ancla_y)
#  fuente: "a"/"b" = persona (src en segundos del clip), "ev:<id>" = toma del evento, "pink" = fondo
P = BEAT
SHOTS = [
    # Cortinilla: tomas del evento, cada vez más rápidas hacia el drop
    (0.0, 2 * P, "ev:150439", 3.0, 1.10, 1.02, 0.5),
    (2 * P, 4 * P, "ev:161532", 0.6, 1.00, 1.08, 0.5),
    (4 * P, 5 * P, "ev:152227", 2.4, 1.12, 1.06, 0.5),
    (5 * P, 6 * P, "ev:154211", 2.0, 1.00, 1.06, 0.5),
    (6 * P, 6.5 * P, "ev:162506", 4.0, 1.10, 1.14, 0.5),
    (6.5 * P, 7 * P, "ev:150428", 2.6, 1.04, 1.08, 0.5),
    (7 * P, 8 * P, "ev:162027", 5.6, 1.00, 1.10, 0.5),
    # Persona hablando + tomas de apoyo (la voz sigue corrida, ver VOICE)
    (T_INTRO, 7.685, "a", 1.50, 1.00, 1.06, 0.30),
    (7.685, 8.40, "a", 5.05, 1.30, 1.34, 0.26),
    (8.40, 9.85, "ev:162145", 6.4, 1.00, 1.08, 0.5),
    (9.85, 11.945, "a", 7.08 + (9.85 - 9.305), 1.02, 1.08, 0.30),
    (11.945, 13.15, "ev:154211", 3.4, 1.06, 1.00, 0.5),
    (13.15, 14.30, "ev:162427", 3.6, 1.00, 1.07, 0.5),
    (14.30, 15.495, "ev:150428", 0.2, 1.00, 1.05, 0.5),
    (15.495, 18.10, "a", 14.72, 1.20, 1.25, 0.28),
    # Nota + fotos (la capa gráfica tapa todo; debajo, una toma por si se asoma)
    (18.10, T_BREAK, "pink", 0, 1, 1, 0.5),
    # Pausa antes del drop: la persona invita a la próxima edición (empuje lento = tensión)
    (T_BREAK, T_DROP2, "a", 17.60 - (26.80 - T_BREAK), 1.00, 1.14, 0.30),
    # Frases SOMOS: punch-ins alternados, en el beat
    (T_DROP2, T_DROP2 + 2 * P, "a", 21.60, 1.28, 1.34, 0.26),
    (T_DROP2 + 2 * P, T_DROP2 + 4 * P, "a", 22.52, 1.02, 1.07, 0.30),
    (T_DROP2 + 4 * P, T_DROP2 + 6 * P, "b", 0.72, 1.30, 1.36, 0.26),
    (T_DROP2 + 6 * P, T_DROP2 + 8 * P, "b", 1.74, 1.02, 1.08, 0.30),
    (T_DROP2 + 8 * P, T_LOGO + 0.4, "b", 2.74, 1.14, 1.30, 0.27),
    (T_LOGO + 0.4, TOTAL, "pink", 0, 1, 1, 0.5),
]

# Origen de cada toma del evento usada (para el paso `clips`): id → (desde, hasta) en el original
def ev_ranges():
    r = {}
    for t0, t1, src, s0, *_ in SHOTS:
        if src.startswith("ev:"):
            i = src[3:]
            a, b = r.get(i, (1e9, -1e9))
            r[i] = (min(a, s0), max(b, s0 + (t1 - t0)))
    return r


HDR = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
       "zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
       "eq=gamma=1.13:contrast=1.02:saturation=0.97,colorbalance=rm=0.012:bm=-0.012")
EV_GRADE = "eq=contrast=1.02:saturation=1.03:gamma=1.02"


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd[:10]), "…")
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def build_clips():
    src = Path(os.environ.get("EVENT_SRC", ""))
    (A / "clips").mkdir(exist_ok=True)
    for i, (a, b) in ev_ranges().items():
        a0 = max(0.0, a - 0.3)
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a0:.3f}", "-i", src / f"20261115_{i}.mp4",
             "-t", f"{b - a0 + 0.6:.3f}", "-an", "-vf", f"fps={FPS},scale={W}:{H}:flags=lanczos,setsar=1",
             "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p",
             "-metadata", f"comment=src_offset={a0:.3f}", A / EV.format(i)])
        (A / "clips" / f"ev-{i}.json").write_text(json.dumps({"offset": a0}))


def build_base(w=W, h=H, out=None):
    parts, inputs, labels = [], [], []
    for n, (t0, t1, src, s0, z0, z1, ay) in enumerate(SHOTS):
        dur = t1 - t0
        if src == "pink":
            parts.append(f"color=c=0xE4007C:s={w}x{h}:r={FPS}:d={dur:.4f},format=yuv420p,setsar=1[s{n}]")
            labels.append(f"[s{n}]")
            continue
        if src.startswith("ev:"):
            i = src[3:]
            off = json.loads((A / "clips" / f"ev-{i}.json").read_text())["offset"]
            path, ss, pre = A / EV.format(i), s0 - off, EV_GRADE
        else:
            path, ss, pre = A / SPK[src], s0, HDR
        inputs += ["-ss", f"{max(0, ss):.4f}", "-t", f"{dur + 0.5:.4f}", "-i", str(path)]
        k = len(inputs) // 6 - 1
        z = f"({z0}+({z1 - z0})*t/{dur:.4f})"
        sharp = ",unsharp=5:5:0.6:5:5:0.0" if not src.startswith("ev:") else ""
        parts.append(
            f"[{k}:v]trim=duration={dur:.4f},setpts=PTS-STARTPTS,fps={FPS},{pre},"
            f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},"
            f"scale=w='2*trunc({w}*{z}/2)':h='2*trunc({h}*{z}/2)':eval=frame:flags=bicubic,"
            f"crop={w}:{h}:x='(iw-{w})/2':y='(ih-{h})*{ay}'{sharp},setsar=1,format=yuv420p[s{n}]")
        labels.append(f"[s{n}]")
    graph = parts + [f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0,trim=duration={TOTAL},setpts=PTS-STARTPTS[v]"]
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "12" if w == W else "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", out or (OUT / "base.mp4")])


# ------------------------------------------------------------------ efectos de sonido (sintetizados)
def _env(n, a, d):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-np.linspace(0, d, n - na))
    return e


def _band(n, lo, hi, rng):
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, n)


def _sweep_noise(n, f0, f1, rng, q=0.6):
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for s in range(0, n, blk):
        seg = x[s:s + blk]
        u = s / n
        fc = f0 * (f1 / f0) ** u
        X = np.fft.rfft(seg, blk)
        f = np.fft.rfftfreq(blk, 1 / SR)
        X *= np.exp(-((f - fc) / (fc * q)) ** 2)
        out[s:s + blk] = np.fft.irfft(X, blk)[: len(seg)]
    return out


def build_sfx():
    rng = np.random.default_rng(11)
    sfx = {}
    # whoosh (barrido sube-baja, paneo de izquierda a derecha)
    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    x = _sweep_noise(n, 350, 5200, rng) * np.sin(np.pi * t) ** 1.5
    sfx["whoosh"] = np.stack([x * (1 - 0.6 * t), x * (0.4 + 0.6 * t)], 1)
    # whip (latigazo corto y agudo para transiciones)
    n = int(0.28 * SR)
    t = np.linspace(0, 1, n)
    x = _sweep_noise(n, 900, 9000, rng, 0.45) * np.sin(np.pi * t ** 0.7) ** 2
    sfx["whip"] = np.stack([x * (1 - t), x * t + 0.2 * x], 1)
    # riser (sube 2 s hacia el drop)
    n = int(2.2 * SR)
    t = np.linspace(0, 1, n)
    x = _sweep_noise(n, 200, 7000, rng, 0.5) * t ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (t * 2)) / SR) * t ** 3 * 0.25
    sfx["riser"] = np.stack([x + tone, np.roll(x, 200) + tone], 1)
    # pop (burbuja)
    n = int(0.14 * SR)
    tt = np.arange(n) / SR
    f = 380 + 1500 * (tt / tt[-1]) ** 0.6
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.004, 9) + 0.15 * rng.standard_normal(n) * _env(n, 0.001, 40)
    sfx["pop"] = np.stack([pop, pop], 1)
    # obturador de cámara: dos chasquidos mecánicos + resorte
    n = int(0.32 * SR)
    sh = np.zeros(n)
    for st, g in ((0.0, 1.0), (0.085, 0.75)):
        i0 = int(st * SR)
        ln = int(0.05 * SR)
        sh[i0:i0 + ln] += (_band(ln, 1200, 9000, rng) * g + _band(ln, 150, 900, rng) * 0.6 * g) * _env(ln, 0.0006, 55)
    i0 = int(0.02 * SR)
    ln = int(0.06 * SR)
    sh[i0:i0 + ln] += np.sin(2 * np.pi * 3100 * np.arange(ln) / SR) * _env(ln, 0.001, 70) * 0.25
    sfx["shutter"] = np.stack([sh, np.roll(sh, 90)], 1)
    # boom (impacto grave para golpes)
    n = int(1.0 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(32 + 120 * np.exp(-tt * 16)) / SR) * _env(n, 0.002, 5.5)
    boom += _band(n, 60, 2500, rng) * _env(n, 0.001, 30) * 0.5
    sfx["boom"] = np.stack([boom, boom], 1)
    # ding / brillo
    n = int(1.0 * SR)
    tt = np.arange(n) / SR
    d = sum(np.sin(2 * np.pi * fr * tt) * g for fr, g in ((1568, 1), (2349, 0.5), (3136, 0.35), (4699, 0.2)))
    d *= _env(n, 0.003, 7)
    sfx["ding"] = np.stack([d, np.roll(d, 400)], 1)
    # swish corto (subtítulos/stickers)
    n = int(0.22 * SR)
    t = np.linspace(0, 1, n)
    sw = _band(n, 2500, 11000, rng) * np.sin(np.pi * t) ** 2
    sfx["swish"] = np.stack([sw, sw], 1)
    # papel (la nota entra): ruido medio con textura
    n = int(0.45 * SR)
    t = np.linspace(0, 1, n)
    pa = _band(n, 800, 6000, rng) * (0.5 + 0.5 * np.abs(np.sin(t * 60))) * np.sin(np.pi * t) ** 1.2
    sfx["paper"] = np.stack([pa, np.roll(pa, 150)], 1)
    # splash (agua) para la invitación de la albercada
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    sp = _band(n, 300, 9000, rng) * _env(n, 0.01, 7) + _band(n, 2500, 14000, rng) * _env(n, 0.03, 4) * 0.6
    sp += np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tt * 6) + 45) / SR) * _env(n, 0.002, 14) * 1.0
    sfx["splash"] = np.stack([sp, np.roll(sp, 220)], 1)
    # sparkle (cascada de brillos para el logo)
    n = int(1.4 * SR)
    spk = np.zeros(n)
    for k in range(18):
        st = int(rng.uniform(0, 0.9) * SR)
        ln = int(0.25 * SR)
        tt = np.arange(ln) / SR
        fr = rng.uniform(2500, 6500)
        spk[st:st + ln] += np.sin(2 * np.pi * fr * tt) * _env(ln, 0.002, 18) * rng.uniform(0.2, 0.6)
    sfx["sparkle"] = np.stack([spk, np.roll(spk, 500)], 1)

    sd = OUT / "sfx"
    sd.mkdir(parents=True, exist_ok=True)
    for name, y in sfx.items():
        y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
        _write_wav(sd / f"{name}.wav", y)


def _write_wav(path, y):
    y16 = (np.clip(y, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(y16.tobytes())


def _read(path, start=0.0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.4f}", "-i", str(path)]
    if dur is not None:
        cmd += ["-t", f"{dur:.4f}"]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
    return x.reshape(-1, 2).copy()


# Efectos: (segundo, nombre, ganancia dB). Afinados con la capa gráfica.
B = BEAT
SFX = [
    # Cortinilla de entrada
    (0.02, "pop", -10), (0.05, "ding", -20), (0.50, "whoosh", -10), (0.62, "boom", -14),
    (0.95, "pop", -16), (1.03, "pop", -17), (1.11, "pop", -16), (1.19, "pop", -17), (1.27, "pop", -16),
    (1.35, "pop", -17), (1.43, "pop", -16), (1.51, "pop", -17), (1.60, "pop", -15),
    (2 * B, "swish", -15), (3 * B + 0.05, "pop", -12), (4 * B, "swish", -16),
    (2.30, "riser", -13), (3.90, "whoosh", -8), (T_INTRO, "boom", -7), (T_INTRO + 0.02, "whip", -14),
    # Parte hablada
    (8.00, "splash", -15), (8.02, "pop", -12), (9.35, "whoosh", -13),          # invitación
    (8.40, "whip", -18), (11.945, "whip", -19), (13.15, "whip", -19), (14.30, "whip", -19),
    (11.62, "pop", -11), (11.66, "ding", -18),                                  # SOMOS
    (13.22, "pop", -11), (13.26, "sparkle", -20),                               # 1ª edición
    (14.40, "swish", -15),                                                      # ubicación
    # La nota y las fotos
    (16.95, "whoosh", -10), (17.15, "paper", -13), (17.75, "whip", -14), (18.10, "pop", -12),
    (19.05, "swish", -14), (19.40, "swish", -14), (20.25, "whoosh", -14), (20.55, "shutter", -9),
    (21.75, "whip", -12), (22.05, "whoosh", -10),
]
for k in range(6):
    SFX += [(22.57 + k * B, "shutter", -8), (22.57 + k * B + 0.01, "pop", -20)]
SFX += [
    (22.57 + 6 * B, "shutter", -8), (22.57 + 6 * B, "whoosh", -14), (26.40, "whip", -9), (26.55, "whoosh", -11),
    # Pausa → drop 2
    (27.30, "pop", -12), (28.60, "pop", -12), (28.62, "ding", -20),
    (29.10, "riser", -10), (T_DROP2, "boom", -5), (T_DROP2, "whip", -12),
]
for k in range(5):
    SFX += [(T_DROP2 + 2 * k * B, "pop", -10), (T_DROP2 + 2 * k * B + 0.02, "swish", -16)]
SFX += [
    (T_DROP2 + 8 * B, "sparkle", -15), (T_LOGO - 0.12, "whoosh", -9), (T_LOGO, "boom", -11),
]
for k in range(6):
    SFX += [(T_LOGO + k * B, "swish", -17), (T_LOGO + k * B + 0.01, "pop", -16)]
SFX += [
    (T_WHITE - 0.25, "whoosh", -8), (T_WHITE, "boom", -5), (T_WHITE + 0.05, "ding", -12),
    (T_WHITE + 0.35, "sparkle", -14), (T_WHITE + 1.3, "swish", -16), (41.25, "sparkle", -18),
]


def build_audio():
    n_total = int(TOTAL * SR)
    # Voz
    voice = np.zeros((n_total, 2), np.float32)
    fade = int(0.015 * SR)
    for clip, a, b, t0 in VOICE:
        x = _read(A / SPK[clip], a, b - a)
        x[:fade] *= np.linspace(0, 1, fade)[:, None]
        x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        i0 = int(round(t0 * SR))
        voice[i0:i0 + len(x)] += x[: n_total - i0]
    _write_wav(OUT / "voice_raw.wav", voice)
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "voice_raw.wav", "-af",
         "highpass=f=90,afftdn=nf=-32:nr=12,equalizer=f=250:t=q:w=1.2:g=-2,"
         "equalizer=f=3000:t=q:w=1.0:g=3,equalizer=f=7200:t=q:w=2:g=-2.5,"
         "acompressor=threshold=-22dB:ratio=3.5:attack=6:release=120:makeup=4,"
         "alimiter=limit=0.89", "-ar", str(SR), OUT / "voice.wav"])
    voice = _read(OUT / "voice.wav")[:n_total]
    voice = np.pad(voice, ((0, n_total - len(voice)), (0, 0)))

    # Música: tramos empalmados en downbeat con micro cruce
    song = A / "audio" / "musica.m4a"
    music = np.zeros((n_total, 2), np.float32)
    xf = int(0.012 * SR)
    for k, (o0, o1, m0) in enumerate(MUSIC):
        o1 = min(o1, TOTAL)
        seg = _read(song, m0 - xf / SR, (o1 - o0) + 2 * xf / SR)
        if k > 0:
            seg[:2 * xf] *= np.linspace(0, 1, 2 * xf)[:, None]
        if k < len(MUSIC) - 1:
            seg[-2 * xf:] *= np.linspace(1, 0, 2 * xf)[:, None]
        i0 = max(0, int(round(o0 * SR)) - xf)
        seg = seg[: n_total - i0]
        music[i0:i0 + len(seg)] += seg
    # Final: después del golpe del logo (40.0) la canción se desvanece con una cola corta
    t = np.arange(n_total) / SR
    fo = np.clip(1 - (t - (T_WHITE + 0.35)) / 2.4, 0, 1) ** 2
    music *= fo[:, None]

    # Ducking bajo la voz (envolvente suave; dentro de cada tramo hablado se queda abajo)
    env = np.abs(voice).mean(1)
    k = int(0.25 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    speaking = np.clip(env / 0.02, 0, 1)
    sm = int(0.2 * SR)
    speaking = np.convolve(speaking, np.ones(sm) / sm, mode="same")
    gain = np.ones(n_total, np.float32)
    talk = [(T_INTRO + 0.05, 18.10), (26.75, 30.30)]
    for a, b in talk:
        gain[(t > a) & (t < b)] = 10 ** (-13 / 20)
    # frases SOMOS: la música baja menos (es el clímax), se mantiene la energía del drop
    gain = np.minimum(gain, 1 - (1 - 10 ** (-9 / 20)) * speaking)
    sm = int(0.12 * SR)
    gain = np.convolve(gain, np.ones(sm) / sm, mode="same")
    music *= gain[:, None]

    fx = np.zeros((n_total, 2), np.float32)
    for t0, name, db in SFX:
        y = _read(OUT / "sfx" / f"{name}.wav")
        i0 = int(t0 * SR)
        y = y[: n_total - i0]
        fx[i0:i0 + len(y)] += y * 10 ** (db / 20)

    mix = voice * 1.0 + music * 0.92 + fx
    _write_wav(OUT / "mix_raw.wav", np.clip(mix, -1, 1))
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav",
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), OUT / "audio.wav"])


# ------------------------------------------------------------------ subtítulos
# Grupos: [texto (palabras clave entre *asteriscos*), índice de segmento de VOICE]
CAPS = [
    ("Oigan, les quiero platicar", 0), ("de una *actividad*", 0), ("que acabamos de tener", 0), ("*recientemente*,", 0),
    ("fue de una *albercada*", 1), ("que tuvimos con *jóvenes*,", 1),
    ("justo para *conocernos*,", 2), ("para dar a conocer", 2), ("el proyecto de *SOMOS*,", 2),
    ("entonces estuvimos", 3), ("muy *contentos*,", 3), ("fue nuestra *primera* *edición*", 3), ("de *albercada*", 3), ("y de *terraza*,", 3),
    ("les queremos compartir", 4), ("un par de *notas*,", 4), ("un par de *fotos*,", 4),
    ("para que la *próxima* *edición*,", 5), ("que se viene", 5), ("muy *próximamente*,", 5), ("puedan *acompañarnos*.", 5),
]


def build_captions():
    words = json.loads((ROOT / "transcript.json").read_text())["a1150"]
    out = []
    used = 0
    for text, si in CAPS:
        clip, a, b, t0 = VOICE[si]
        n = len(text.split())
        ws = words[used:used + n]
        used += n
        s = t0 + (ws[0][1] - a)
        e = t0 + (ws[-1][2] - a)
        out.append([text, round(max(s, t0) - 0.04, 3), round(min(e, t0 + b - a) + 0.02, 3)])
    # cada grupo dura hasta que empieza el siguiente del mismo segmento
    out[0][1] = max(out[0][1], T_INTRO + 0.1)  # "Oigan" entra justo después de la cortinilla
    for i in range(len(out) - 1):
        if CAPS[i][1] == CAPS[i + 1][1]:
            out[i][2] = round(out[i + 1][1] - 0.02, 3)
    js = "const G = " + json.dumps(out, ensure_ascii=False) + ";"
    p = ROOT / "compositions" / "captions.html"
    html = p.read_text()
    html = re.sub(r"const G = \[.*?\];", lambda m: js, html, flags=re.S)
    p.write_text(html)
    for g in out:
        print(g)


# ------------------------------------------------------------------ final
def build_final(preview=False):
    frames = sorted((OUT / "overlay").glob("*.png"))
    if not frames:
        sys.exit("Falta renders/overlay: renderiza primero la capa con hyperframes (png-sequence).")
    stem, num = frames[0].stem.rsplit("_", 1)
    pattern = OUT / "overlay" / f"{stem}_%0{len(num)}d.png"
    size = "1080:1920" if preview else f"{W}:{H}"
    name = "albercada-recap-preview.mp4" if preview else "albercada-somos-recap-4k.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-start_number", int(num), "-i", pattern, "-i", OUT / "audio.wav",
         "-filter_complex",
         f"[1:v]scale={size}:flags=lanczos[ov];[0:v]scale={size}:flags=lanczos[bg];"
         "[bg][ov]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         "-c:v", "libx264", "-crf", "23" if preview else "16", "-preset", "fast" if preview else "slow",
         "-profile:v", "high", "-level", "5.1", "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart",
         OUT / name])


def print_timeline():
    for s in SHOTS:
        print(f"{s[0]:7.3f}-{s[1]:7.3f}  {s[2]:<10} src {s[3]:.2f}  z {s[4]}→{s[5]}")
    print(json.dumps(dict(T_INTRO=T_INTRO, T_BREAK=T_BREAK, T_DROP2=T_DROP2, T_LOGO=T_LOGO, T_WHITE=T_WHITE,
                          TOTAL=TOTAL, BEAT=BEAT), indent=1))


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"clips": build_clips, "base": build_base, "sfx": build_sfx, "audio": build_audio,
             "captions": build_captions, "final": build_final, "preview": lambda: build_final(True),
             "tl": print_timeline}
    for s in sys.argv[1:] or ["tl"]:
        steps[s]()
