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


T_INTRO = 2 * BAR            # 4.445  drop 1: entra la voz
T_BREAK = 11 * BAR           # 24.446 pausa de la canción: "…muy próximamente, puedan acompañarnos"
T_DROP2 = 12 * BAR           # 26.668 drop 2: "Somos amigos…" (cierre, video 2)

# ------------------------------------------------------------------ voz
SPK = {"a": "video/speaker-1150.mp4", "b": "video/speaker-1151.mp4"}
T_CLOSE = T_DROP2 - 0.10         # el "Somos" del video 2 (0.72 s) cae en el drop
T_NOTA = 15.495 + (16.38 - 14.72)    # 17.155 "un par de notas" → sale la nota
T_FOTOS = 8 * BAR                    # 17.779 "un par de fotos" (en el downbeat) → salen las fotos

# (clip, src_in, src_out, salida_inicio) — la voz va corrida, sin pausas agregadas
VOICE = [
    ("a", 1.50, 4.72, T_INTRO),             # 0 Oigan, les quiero platicar … recientemente,
    ("a", 5.05, 6.65, 7.685),               # 1 fue de una albercada que tuvimos con jóvenes,
    ("a", 7.08, 9.70, 9.305),               # 2 justo para conocernos … el proyecto de SOMOS,
    ("a", 10.00, 13.53, 11.945),            # 3 entonces estuvimos muy contentos … y de terraza,
    ("a", 14.72, 17.36, 15.495),            # 4 les queremos compartir un par de notas, un par de fotos,
    ("a", 17.60, 20.98, T_CLOSE - 0.14 - 3.38),  # 5 para que la próxima edición … puedan acompañarnos.
    ("b", 0.62, 3.62, T_CLOSE),             # 6 Somos amigos, somos el futuro, y somos México.
]
T_WIPE = T_CLOSE + (3.52 - 0.62)     # termina de decir "…somos México": entra la cortinilla blanca
TOTAL = round(T_WIPE + 4.4, 2)

# (salida inicio, salida fin, canción inicio) — empalmes siempre en downbeat
MUSIC = [
    (0.0, T_INTRO, mbar(10)),        # breakdown sin bajo: cortinilla de entrada
    (T_INTRO, T_BREAK, mbar(12)),    # DROP 1
    (T_BREAK, T_DROP2, mbar(47)),    # el compás de silencio antes del drop
    (T_DROP2, TOTAL, mbar(48)),      # DROP 2 → cierre y logo
]

# ------------------------------------------------------------------ video base
EV = "clips/ev-{}.mp4"
# (inicio, fin, fuente, zoom0, zoom1, ancla_y)
#   fuente: ("ev", id, src en el inicio) toma del evento · ("v", i) persona amarrada a VOICE[i]
#           (misma correspondencia que su audio: la boca siempre va con la voz) · "pink" / "white"
P = BEAT
SHOTS = [
    # Cortinilla: tres tomas del evento
    (0.0, 3 * P, ("ev", "161532", 0.6), 1.00, 1.08, 0.5),
    (3 * P, 6 * P, ("ev", "162027", 5.0), 1.06, 1.00, 0.5),
    (6 * P, T_INTRO, ("ev", "162506", 3.6), 1.00, 1.06, 0.5),
    # La persona (protagonista) + dos tomas de apoyo
    (T_INTRO, 7.685, ("v", 0), 1.00, 1.06, 0.30),
    (7.685, 8.40, ("v", 1), 1.22, 1.26, 0.27),
    (8.40, 9.85, ("ev", "162145", 6.4), 1.00, 1.08, 0.5),
    (9.85, 11.945, ("v", 2), 1.02, 1.08, 0.30),
    (11.945, 13.35, ("v", 3), 1.22, 1.26, 0.27),
    (13.35, 15.495, ("ev", "150428", 0.2), 1.00, 1.06, 0.5),
    (15.495, T_NOTA + 0.25, ("v", 4), 1.04, 1.09, 0.30),
    # La nota y las fotos (la capa gráfica tapa todo; la voz sigue)
    (T_NOTA + 0.25, T_BREAK, "pink", 1, 1, 0.5),
    (T_BREAK, T_DROP2 - 0.03, ("v", 5), 1.06, 1.14, 0.29),
    # Cierre: video 2 corrido, el corte cae en el drop; punch-ins en las frases
    (T_DROP2 - 0.03, T_CLOSE + 1.71 - 0.62, ("v", 6), 1.24, 1.28, 0.27),
    (T_CLOSE + 1.71 - 0.62, T_CLOSE + 2.71 - 0.62, ("v", 6), 1.03, 1.07, 0.30),
    (T_CLOSE + 2.71 - 0.62, T_WIPE + 0.45, ("v", 6), 1.26, 1.32, 0.27),
    (T_WIPE + 0.45, TOTAL, "white", 1, 1, 0.5),
]


def fr(t):
    """Tiempo → número de cuadro (todos los cortes caen en cuadros exactos)."""
    return int(round(t * FPS))


def shot_src(spec, t0):
    """Segundo de la fuente que corresponde al cuadro de salida t0."""
    if spec[0] == "ev":
        return spec[2]
    clip, a, b, v0 = VOICE[spec[1]]
    return a + (t0 - v0)


def ev_ranges():
    r = {}
    for t0, t1, spec, *_ in SHOTS:
        if isinstance(spec, tuple) and spec[0] == "ev":
            i, s0 = spec[1], spec[2]
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
    k = 0
    for n, (t0, t1, spec, z0, z1, ay) in enumerate(SHOTS):
        f0, f1 = fr(t0), fr(min(t1, TOTAL))
        nf = f1 - f0
        dur = nf / FPS
        t0q = f0 / FPS  # inicio exacto en cuadros
        if spec in ("pink", "white"):
            c = "0xE4007C" if spec == "pink" else "white"
            parts.append(f"color=c={c}:s={w}x{h}:r={FPS},trim=end_frame={nf},format=yuv420p,setsar=1[s{n}]")
            labels.append(f"[s{n}]")
            continue
        if spec[0] == "ev":
            off = json.loads((A / "clips" / f"ev-{spec[1]}.json").read_text())["offset"]
            path, ss, pre = A / EV.format(spec[1]), spec[2] - off, EV_GRADE
        else:
            path, ss, pre = A / SPK[VOICE[spec[1]][0]], shot_src(spec, t0q), HDR
        inputs += ["-ss", f"{max(0, ss):.4f}", "-t", f"{dur + 0.5:.4f}", "-i", str(path)]
        z = f"({z0}+({z1 - z0})*t/{dur:.4f})"
        sharp = ",unsharp=5:5:0.6:5:5:0.0" if spec[0] == "v" else ""
        parts.append(
            f"[{k}:v]setpts=PTS-STARTPTS,fps={FPS},trim=end_frame={nf},setpts=PTS-STARTPTS,{pre},"
            f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},"
            f"scale=w='2*trunc({w}*{z}/2)':h='2*trunc({h}*{z}/2)':eval=frame:flags=bicubic,"
            f"crop={w}:{h}:x='(iw-{w})/2':y='(ih-{h})*{ay}'{sharp},setsar=1,format=yuv420p[s{n}]")
        labels.append(f"[s{n}]")
        k += 1
    graph = parts + [f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0[v]"]
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


# Efectos: (segundo, nombre, ganancia dB). Afinados con la capa gráfica; discretos, sin exagerar.
B = BEAT
SFX = [
    # Cortinilla de entrada
    (0.02, "pop", -11), (0.50, "whoosh", -11), (0.62, "boom", -15),
    (0.95, "pop", -18), (1.11, "pop", -18), (1.27, "pop", -18), (1.43, "pop", -18), (1.60, "pop", -17),
    (3 * B + 0.05, "pop", -13),
    (2.30, "riser", -15), (3.90, "whoosh", -9), (T_INTRO, "boom", -9), (T_INTRO + 0.02, "whip", -16),
    # Parte hablada
    (8.00, "splash", -16), (8.02, "pop", -13), (9.35, "whoosh", -15),   # invitación
    (8.40, "whip", -20), (13.35, "whip", -20),
    # Sale la nota (en "notas") y salen las fotos (en "fotos"), sin pausar la voz
    (T_NOTA - 0.04, "whoosh", -12), (T_NOTA + 0.12, "paper", -15),
]
for k in range(6):                        # 6 fotos, una cada 2 beats, cada una con su efecto de entrada
    SFX += [(T_FOTOS + 2 * k * B - 0.08, "whip", -15), (T_FOTOS + 2 * k * B, "shutter", -8)]
SFX += [
    (T_BREAK - 0.27, "whoosh", -13),
    # Pausa → drop 2 (cierre)
    (T_BREAK + 0.6, "riser", -16), (T_DROP2, "boom", -12),
    # termina "somos México": cortinilla blanca y el logo se arma letra por letra
    (T_WIPE - 0.02, "whoosh", -9),
]
for k in range(5):
    SFX += [(T_WIPE + 0.45 + k * 0.075, "pop", -15)]
SFX += [(T_WIPE + 0.83, "boom", -10), (T_WIPE + 0.85, "ding", -19)]


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
    # Final: con el logo en blanco la canción se desvanece suave hasta el último cuadro
    t = np.arange(n_total) / SR
    fo = np.clip(1 - (t - (T_WIPE + 1.4)) / (TOTAL - T_WIPE - 1.5), 0, 1) ** 1.6
    music *= fo[:, None]

    # Ducking bajo la voz (envolvente suave; dentro de cada tramo hablado se queda abajo)
    env = np.abs(voice).mean(1)
    k = int(0.25 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    speaking = np.clip(env / 0.02, 0, 1)
    sm = int(0.2 * SR)
    speaking = np.convolve(speaking, np.ones(sm) / sm, mode="same")
    gain = np.ones(n_total, np.float32)
    v4, v5 = VOICE[4], VOICE[5]
    talk = [(T_INTRO + 0.05, v4[3] + v4[2] - v4[1] + 0.05, -13),   # las fotos sin voz: la música sube
            (v5[3] - 0.12, v5[3] + v5[2] - v5[1] + 0.05, -13),
            (T_CLOSE, T_WIPE + 0.1, -9)]  # en el cierre la música baja menos: es el clímax
    for a, b, db in talk:
        gain[(t > a) & (t < b)] = 10 ** (db / 20)
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
    ("Somos *amigos*,", 6), ("somos el *futuro*,", 6), ("y somos *México*.", 6),
]


def build_captions():
    tr = json.loads((ROOT / "transcript.json").read_text())
    words = tr["a1150"] + tr["a1151"]
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
    # video 2: tiempos por energía (whisper llega tarde en este clip): Somos 0.72 · somos 1.74 · y 2.74
    for g, src in zip(out[-3:], (0.72, 1.74, 2.74)):
        g[1] = round(T_CLOSE + src - 0.62 - 0.04, 3)
    out[-3][2], out[-2][2] = out[-2][1] - 0.02, out[-1][1] - 0.02
    out[-1][2] = round(T_WIPE + 0.25, 3)  # se queda hasta que la cortinilla lo cubre
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
    for t0, t1, spec, z0, z1, ay in SHOTS:
        src = "" if isinstance(spec, str) else f"src {shot_src(spec, fr(t0) / FPS):.3f}"
        print(f"{fr(t0) / FPS:7.3f}-{fr(t1) / FPS:7.3f}  {str(spec):<26} {src}  z {z0}→{z1}")
    for clip, a, b, t0 in VOICE:
        print(f"voz {clip} {a:.2f}-{b:.2f} → {t0:.3f}-{t0 + b - a:.3f}")
    print(json.dumps(dict(T_INTRO=T_INTRO, T_FOTOS=T_FOTOS, T_BREAK=T_BREAK, T_DROP2=T_DROP2, T_CLOSE=T_CLOSE,
                          T_NOTA=T_NOTA, T_WIPE=T_WIPE, TOTAL=TOTAL, BEAT=BEAT), indent=1))


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"clips": build_clips, "base": build_base, "sfx": build_sfx, "audio": build_audio,
             "captions": build_captions, "final": build_final, "preview": lambda: build_final(True),
             "tl": print_timeline}
    for s in sys.argv[1:] or ["tl"]:
        steps[s]()
