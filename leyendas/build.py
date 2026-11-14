#!/usr/bin/env python3
"""Teaser «Leyendas y Crímenes famosos del Centro Histórico» — 35 s, vertical 4K.

  base    — tomas con gradación de terror, escaladas a 2160x3840 (negro donde la capa gráfica cubre todo)
  audio   — mezcla: «crimen» (pulso) + drone de audio_2 + impactos/crescendo de audio_1 + efectos sintetizados
  final   — base + capa gráfica (PNG RGBA de render.mjs) + sacudidas + grano → MP4 H.264 4K
  sheet   — hoja de contacto de prueba: snapshots (renders/snap) sobre la base

Uso:
  python3 build.py base audio
  node render.mjs                      # capa gráfica 4K → renders/overlay
  python3 build.py final
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
FPS = 30
TOTAL = 35.0
W, H = 2160, 3840
SR = 48000

# (clip, entrada, inicio en el teaser, fin, look)
EDL = [
    ("v3", 0.30, 0.0, 3.0, "sangre"),    # estatua de noche → rojo
    ("v2", 0.00, 3.0, 7.0, "noche"),     # Plaza Tolsá / Minería
    ("v5", 0.40, 7.0, 9.5, "noche"),     # Donceles
    ("v4", 0.00, 9.5, 13.0, "placa"),    # placa de Joaquín Dongo
    ("black", 0, 13.0, 19.0, None),      # grabado + La mujer herrada (capa gráfica)
    ("v6", 0.30, 19.0, 21.0, "noche"),   # Teatro de la Ciudad
    ("v1", 0.00, 21.0, 25.0, "fru"),     # Teatro Fru Fru
    ("v2", 4.40, 25.0, 28.0, "noche"),   # El Caballito al anochecer
    ("v3", 2.55, 28.0, 31.0, "sangre"),  # estatua de noche
    ("black", 0, 31.0, 35.0, None),      # e-card
]

UP = f"scale={W}:{H}:flags=lanczos,unsharp=7:7:0.9:5:5:0.0"
LOOKS = {
    # «día por noche»: aplasta el cielo, desatura, sombras frías y altas luces sucias
    "noche": "eq=contrast=1.25:brightness=-0.10:saturation=0.45:gamma=0.85,"
             "colorbalance=rs=-0.06:bs=0.10:rm=0.02:bm=0.04:rh=0.05:gh=-0.02:bh=-0.08,"
             "curves=all='0/0 0.25/0.12 0.6/0.5 1/0.88'",
    # monocromo rojo sangre
    "sangre": "hue=s=0,eq=contrast=1.45:brightness=-0.06:gamma=0.8,"
              "colorchannelmixer=rr=1.15:gg=0.22:bb=0.22,curves=all='0/0 0.3/0.18 1/0.95'",
    # placa: sepia de archivo
    "placa": "hue=s=0,eq=contrast=1.35:brightness=-0.05,colorchannelmixer=rr=1.0:gg=0.82:bb=0.62,"
             "curves=all='0/0.03 0.5/0.42 1/0.92'",
    # Fru Fru: magenta/rojo enfermo
    "fru": "eq=contrast=1.3:brightness=-0.12:saturation=0.5:gamma=0.85,"
           "colorbalance=rs=0.12:bs=0.05:rm=0.12:gm=-0.06:bm=0.03:rh=0.05:bh=-0.05,"
           "curves=all='0/0 0.25/0.12 1/0.9'",
}


def run(cmd):
    print(" ".join(str(c) for c in cmd[:8]), "…", flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def build_base():
    inputs, parts = [], []
    for i, (src, s_in, t0, t1, look) in enumerate(EDL):
        dur = t1 - t0
        if src == "black":
            inputs += ["-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:r={FPS}:d={dur:.3f}"]
            parts.append(f"[{i}:v]format=yuv420p,setsar=1[s{i}]")
        else:
            inputs += ["-i", A / "footage" / f"{src}.mp4"]
            # empuje lento hacia adentro (zoom 1.0 → 1.06) para que ninguna toma esté quieta
            z = f"1+0.06*t/{dur:.3f}"
            parts.append(
                f"[{i}:v]trim=start={s_in:.3f}:duration={dur:.3f},setpts=PTS-STARTPTS,fps={FPS},"
                f"{UP},{LOOKS[look]},"
                f"scale=w='trunc({W}*({z})/2)*2':h='trunc({H}*({z})/2)*2':eval=frame:flags=bicubic,"
                f"crop={W}:{H},format=yuv420p,setsar=1[s{i}]"
            )
    labels = "".join(f"[s{i}]" for i in range(len(EDL)))
    graph = parts + [f"{labels}concat=n={len(EDL)}:v=1:a=0,trim=duration={TOTAL},setpts=PTS-STARTPTS[v]"]
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", OUT / "base.mp4"])


# ------------------------------------------------------------------ audio
def load(path, start=0.0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", str(path)]
    if dur:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def fade(x, fin=0.01, fout=0.01):
    n = len(x)
    a, b = int(fin * SR), int(fout * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x


def place(bus, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(bus) - i)
    if n > 0:
        bus[i:i + n] += x[:n] * g


rng = np.random.default_rng(41)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.002, decay=0.1):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / decay)


def lp(x, fc):
    """filtro paso bajo de 1 polo (mono)"""
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # corto, solo para muestras pequeñas
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def bandnoise(d, lo, hi):
    n = int(d * SR)
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.abs(y).max() + 1e-9)


def reverb(x, decay=1.2, mix=0.3, pre=0.012):
    n = int(decay * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / decay)
    ir = np.concatenate([np.zeros(int(pre * SR)), ir])
    ir /= np.sqrt((ir ** 2).sum())
    wet = np.stack([np.convolve(x[:, c], ir if c == 0 else np.roll(ir, 37))[:len(x) + n] for c in range(2)], 1)
    dry = np.vstack([x, np.zeros((len(wet) - len(x), 2))])
    return dry * (1 - mix) + wet * mix


def st(m, width=0.0):
    m = m.astype(np.float32)
    if width:
        d = int(width * SR)
        return np.stack([m, np.concatenate([np.zeros(d), m[:-d]])], 1)
    return np.stack([m, m], 1)


def synth(kind):
    if kind == "key":
        d = 0.09
        click = bandnoise(d, 1800, 7000) * env(d, 0.0005, 0.008)
        thunk = np.sin(2 * np.pi * 180 * tt(d)) * env(d, 0.001, 0.018) * 0.6
        bar = bandnoise(d, 300, 1200) * env(d, 0.004, 0.02) * 0.4
        return st(click + thunk + bar) * 0.55
    if kind == "space":
        d = 0.12
        return st(bandnoise(d, 200, 2500) * env(d, 0.001, 0.025) + np.sin(2 * np.pi * 120 * tt(d)) * env(d, 0.001, 0.03) * 0.6) * 0.5
    if kind == "return":
        d = 0.35
        ratchet = sum(bandnoise(d, 2000, 6000) * np.exp(-np.maximum(0, tt(d) - k * 0.025) * 300) * (tt(d) >= k * 0.025) for k in range(8))
        return st(ratchet * 0.25 + bandnoise(d, 150, 900) * env(d, 0.002, 0.04) * 0.6) * 0.6
    if kind == "ding":
        d = 1.4
        t = tt(d)
        b = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in [(2093, 1, .5), (5320, .35, .18), (8100, .15, .08)])
        return reverb(st(b * env(d, 0.001, 9)) * 0.35, 1.0, 0.25)
    if kind in ("boom", "boom2"):
        d = 3.0 if kind == "boom" else 2.0
        t = tt(d)
        f = 55 * np.exp(-t * 1.2) + 28
        sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.003, 0.9 if kind == "boom" else 0.6)
        crack = bandnoise(d, 60, 5000) * env(d, 0.0008, 0.06)
        body = bandnoise(d, 40, 400) * env(d, 0.002, 0.35)
        x = st(sub * 1.0 + crack * 0.6 + body * 0.5, 0.0)
        return reverb(np.tanh(x * 1.6) * 0.75, 2.2, 0.35)
    if kind == "hit":
        d = 1.2
        t = tt(d)
        sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t * 3) + 38) / SR) * env(d, 0.002, 0.3)
        x = st(sub + bandnoise(d, 100, 6000) * env(d, 0.0005, 0.03) * 0.5)
        return reverb(np.tanh(x * 1.4) * 0.6, 1.4, 0.3)
    if kind == "stamp":
        d = 0.5
        t = tt(d)
        x = bandnoise(d, 80, 3000) * env(d, 0.0005, 0.035) + np.sin(2 * np.pi * 95 * t) * env(d, 0.001, 0.07)
        return reverb(st(np.tanh(x * 2) * 0.7), 0.6, 0.18)
    if kind == "whoosh":
        d = 0.6
        t = tt(d)
        n = int(d * SR)
        # barrido de ruido con envolvente en campana
        out = np.zeros(n)
        seg = 8
        for k in range(seg):
            a, b = k * n // seg, (k + 1) * n // seg
            fc = 300 + 3500 * np.sin(np.pi * (k + 0.5) / seg)
            out[a:b] = bandnoise((b - a) / SR + 1e-4, fc * 0.5, fc * 1.5)[: b - a]
        e = np.sin(np.pi * t / d) ** 2
        return st(out * e * 0.5, 0.004)
    if kind == "reverse":
        d = 0.8
        t = tt(d)
        x = (bandnoise(d, 200, 8000) * 0.5 + np.sin(2 * np.pi * 110 * t) * 0.3) * (t / d) ** 3
        return st(x * 0.8, 0.006)
    if kind == "glitch":
        d = 0.36
        t = tt(d)
        sq = np.sign(np.sin(2 * np.pi * (180 + 900 * (np.floor(t * 40) % 3)) * t))
        gate = (np.floor(t * 55) % 2)
        crush = np.round(bandnoise(d, 500, 9000) * 4) / 4
        return st((sq * 0.25 + crush * 0.35) * gate * env(d, 0.001, 0.25), 0.002) * 0.7
    if kind == "buzz":
        d = 0.5
        t = tt(d)
        x = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + np.sin(2 * np.pi * 240 * t) * 0.2
        gate = (rng.random(int(d * 30)) > 0.3).repeat(int(SR / 30) + 1)[: len(t)]
        return st(x * gate * env(d, 0.002, 0.3)) * 0.5
    if kind == "marker":
        d = 0.5
        t = tt(d)
        x = bandnoise(d, 2500, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * t / d)
        return st(x * 0.22)
    if kind == "paper":
        d = 0.45
        t = tt(d)
        x = bandnoise(d, 800, 9000) * (rng.random(len(t)) ** 3) * np.sin(np.pi * t / d) ** 0.5
        return st(x * 0.6, 0.003)
    if kind == "snip":
        d = 0.08
        return st(bandnoise(d, 3000, 10000) * env(d, 0.0005, 0.01) + bandnoise(d, 300, 1500) * env(d, 0.001, 0.02) * 0.5) * 0.5
    if kind == "stinger":
        d = 1.6
        t = tt(d)
        # cluster disonante de cuerdas chillonas
        x = sum(np.sin(2 * np.pi * f * t + 3 * np.sin(2 * np.pi * 6.3 * t)) for f in (1480, 1568, 1661, 2217))
        x = x / 4 * env(d, 0.01, 0.45)
        x = x + bandnoise(d, 2000, 9000) * env(d, 0.001, 0.2) * 0.5
        return reverb(st(x * 0.45, 0.01), 1.8, 0.4)
    if kind == "clang":
        d = 2.5
        t = tt(d)
        parts = [(523, 1, 1.2), (1187, 0.7, 0.8), (1873, 0.5, 0.5), (2730, 0.4, 0.35), (3905, 0.25, 0.2), (311, 0.5, 0.9)]
        x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in parts) / 2.5
        x = x + bandnoise(d, 1000, 9000) * env(d, 0.0003, 0.01) * 0.8
        x = x + np.sin(2 * np.pi * 80 * t) * env(d, 0.001, 0.08) * 0.6
        return reverb(st(x * 0.8), 2.0, 0.3)
    if kind == "bell":
        d = 4.5
        t = tt(d)
        f0 = 196
        parts = [(0.5, .6, 3.5), (1, 1, 2.5), (1.19, .6, 2.0), (1.5, .4, 1.6), (2, .45, 1.2), (2.51, .25, .8), (3.01, .2, .6)]
        x = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / dd) for r, a, dd in parts) / 3
        x = x + bandnoise(d, 500, 4000) * env(d, 0.001, 0.02) * 0.4
        return reverb(st(x * env(d, 0.002, 99)), 3.0, 0.45)
    if kind == "tick":
        d = 0.1
        return st(bandnoise(d, 2500, 8000) * env(d, 0.0003, 0.006) + np.sin(2 * np.pi * 1900 * tt(d)) * env(d, 0.0003, 0.01) * 0.4) * 0.6
    if kind == "heart":
        d = 0.8
        t = tt(d)
        def thump(at, a):
            tt_ = np.maximum(0, t - at)
            return np.sin(2 * np.pi * 52 * tt_) * np.exp(-tt_ / 0.09) * (t >= at) * a
        return st(np.tanh((thump(0, 1) + thump(0.24, 0.7)) * 1.8) * 0.9)
    if kind == "camera":
        d = 0.9
        t = tt(d)
        shutter = bandnoise(d, 1500, 9000) * (env(d, 0.0003, 0.01) + np.exp(-np.maximum(0, t - 0.06) / 0.012) * (t > 0.06))
        whine = np.sin(2 * np.pi * np.cumsum(2000 + 5000 * t) / SR) * np.exp(-t / 0.3) * 0.12 * (t > 0.08)
        return reverb(st(shutter * 0.6 + whine), 0.8, 0.25)
    if kind == "whisper":
        d = 1.4
        t = tt(d)
        x = bandnoise(d, 2500, 7500) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.2 * t) ** 2) * np.sin(np.pi * t / d)
        return reverb(st(x * 0.25, 0.015), 1.5, 0.5)
    if kind == "drone":
        d = 3.2
        t = tt(d)
        x = sum(np.sin(2 * np.pi * f * t) for f in (41.2, 41.7, 61.8, 82.9)) / 4 * np.minimum(1, t / 0.6)
        return st(x * 0.5, 0.01)
    raise KeyError(kind)


def build_audio():
    n = int(TOTAL * SR)
    music, bed, hits, fx = (np.zeros((n, 2), np.float32) for _ in range(4))

    # 1) pulso «crimen»: 29→52 s y 56→68 s (fase de 1 s conservada). Golpes en T=3 y T=31.
    crimen = A / "audio" / "crimen.m4a"
    a = fade(load(crimen, 29.0, 23.06), 0.02, 0.06)
    b = fade(load(crimen, 55.94, 12.1), 0.06, 1.2)
    place(music, a, 0.0)
    place(music, b, 22.94)

    # 2) drone creciente (audio_2) de 62 s en adelante, entra suave
    drone = fade(load(A / "audio" / "atmosfera_2.m4a", 62.0, TOTAL), 2.5, 1.0)
    place(bed, drone, 0.0)

    # 3) audio_1: impactos y crescendo
    a1 = A / "audio" / "atmosfera_1.m4a"
    for src, dur, at, g in [
        (1.55, 3.0, 2.95, 0.9),    # golpe inicial → título
        (51.9, 3.0, 11.9, 0.8),    # golpe grave → 11 víctimas
        (16.9, 2.5, 14.9, 0.8),    # golpe → 1670
        (64.4, 3.5, 20.9, 0.7),    # gran golpe → Fru Fru
    ]:
        place(hits, fade(load(a1, src, dur), 0.004, 0.6), at, g)
    swell = fade(load(a1, 70.0, 6.75), 1.5, 0.05)  # crescendo 70→76.75 (pico 75.5)
    place(hits, swell, 31.0 - 6.75 + 0.25, 0.9)

    # 4) efectos sintetizados según la línea de tiempo de la capa gráfica
    ev = json.loads((OUT / "events.json").read_text())
    cache = {}
    for e in ev["SFX"]:
        k = e["k"]
        if k not in cache:
            cache[k] = synth(k).astype(np.float32)
        x = cache[k]
        if k in ("key", "space"):  # variación de tono por tecla
            x = x * (0.85 + 0.3 * rng.random())
        place(fx, x, e["t"], e["g"])

    # ducking: el pulso baja bajo el crescendo y antes del golpe final (silencio de tensión)
    t = np.arange(n) / SR
    duck = np.ones(n)
    duck *= 1 - 0.75 * np.clip((t - 30.55) / 0.15, 0, 1) * (t < 31.0)
    duck_bed = 1 - 0.8 * np.clip((t - 30.6) / 0.2, 0, 1) * (t < 31.0)

    mix = music * 0.85 * duck[:, None] + bed * 0.32 * duck_bed[:, None] + hits * 0.8 + fx * 0.9
    mix = np.tanh(mix * 1.1) / 1.1
    mix = fade(mix, 0.01, 0.6)
    raw = OUT / "mix_raw.wav"
    write_wav(raw, mix)
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), OUT / "audio.wav"])


def write_wav(path, x):
    import wave
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


# ------------------------------------------------------------------ final
def shake_expr(shakes, axis):
    terms = []
    for i, s in enumerate(shakes):
        t0, a, d = s["t"], s["a"] * 2, s["d"]  # amplitudes de la capa (px CSS) → 4K
        fr = 31 + 7 * i if axis == "x" else 23 + 5 * i
        terms.append(f"between(t,{t0:.3f},{t0 + d:.3f})*{a:.1f}*exp(-(t-{t0:.3f})*{5 / d:.2f})*sin((t-{t0:.3f})*{fr})")
    return "+".join(terms) or "0"


def build_final():
    frames = sorted((OUT / "overlay").glob("f_*.png"))
    if len(frames) < int(TOTAL * FPS):
        sys.exit("Falta renders/overlay completo: corre `node render.mjs` primero.")
    ev = json.loads((OUT / "events.json").read_text())
    pad = 120  # margen para la sacudida
    sx, sy = shake_expr(ev["SHAKES"], "x"), shake_expr(ev["SHAKES"], "y")
    graph = (
        f"[0:v][1:v]overlay=0:0:format=auto,"
        f"scale={W + pad}:{H + int(pad * H / W)}:flags=bicubic,"
        f"crop={W}:{H}:x='{pad // 2}+({sx})':y='{int(pad * H / W) // 2}+({sy})',"
        f"noise=c0s=14:c0f=t+u:c1s=4:c1f=t,"
        f"vignette=angle=PI/4.2,format=yuv420p,"
        f"setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]"
    )
    run(["ffmpeg", "-v", "error", "-stats", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-i", OUT / "overlay" / "f_%05d.png", "-i", OUT / "audio.wav",
         "-filter_complex", graph, "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart",
         OUT / "leyendas-crimenes-teaser-4k.mp4"])


def build_sheet():
    """snapshots de renders/snap (escala 0.5) compuestos sobre la base, en una hoja"""
    from PIL import Image
    snaps = sorted((OUT / "snap").glob("at_*.png"))
    tiles = []
    for s in snaps:
        t = float(s.stem[3:])
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(OUT / "base.mp4"), "-frames:v", "1",
                              "-vf", "scale=540:960", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
        bg = Image.frombytes("RGB", (540, 960), raw).convert("RGBA")
        ov = Image.open(s).convert("RGBA").resize((540, 960))
        tiles.append(Image.alpha_composite(bg, ov).convert("RGB"))
    cols = min(5, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 545, rows * 965), "gray")
    for i, im in enumerate(tiles):
        sheet.paste(im, ((i % cols) * 545, (i // cols) * 965))
    sheet.save(OUT / "sheet.jpg", quality=88)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"base": build_base, "audio": build_audio, "final": build_final, "sheet": build_sheet}
    for s in sys.argv[1:] or ["base", "audio", "final"]:
        steps[s]()
