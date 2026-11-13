#!/usr/bin/env python3
"""Arma el video invitación a la Albercada de SOMOS (vertical 4K, ~48 s).

1. base.mp4   — agua de la alberca (inicio y cierre) + la persona que habla, cortada sin silencios,
                con punch-ins alternados para que los cortes se sientan dinámicos. Directo a 2160x3840.
2. audio.wav  — voz limpia y nivelada + la canción (build-up → drop 1 al entrar la voz, empalme al
                drop 2 para el "¡TE ESPERAMOS!") con ducking bajo la voz + efectos de sonido.
3. Compone la capa gráfica de Hyperframes (png-sequence RGBA) encima y entrega el MP4.

Uso:
  python3 build.py water sfx base audio
  npx hyperframes render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
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
W, H = 2160, 3840
SR = 48000

# ---------------------------------------------------------------- tiempos maestros (segundos)
INTRO = 3.40          # el drop 1 de la canción cae aquí: entra la persona hablando
OUTRO_CUT = 35.70     # corte (bajo la ola) de la persona al agua del cierre
SPLICE = 36.225       # empalme de la canción (en compás) hacia el tramo del drop 2
DROP2 = 38.75         # "¡TE ESPERAMOS!"
WATER2 = 41.275       # cambio de agua en el cierre (1 compás después del drop 2)
SONG_END = 47.60      # la canción termina en seco aquí (golpe final)
TOTAL = 48.40         # cola con el logo y el splash final

M_DROP1 = 20.30       # en la canción
M_DROP2 = 60.70
M_START = M_DROP1 - INTRO            # 16.90 (el build-up y el riser antes del drop)
M_SPLICE_FROM = M_START + SPLICE     # 53.125 (en compás: drop1 + 13 compases)
M_SPLICE_TO = M_DROP2 - (DROP2 - SPLICE)  # 58.175 (1 compás antes del drop 2)

CLIPS = {
    "a312": "clips/01-invitacion.mp4",
    "93b3": "clips/02-para-que.mp4",
    "a205": "clips/03-jovenes.mp4",
    "8f52": "clips/04-pizzas.mp4",
    "b459": "clips/05-te-esperamos.mp4",
}

# (clip, entrada, salida de la voz, zoom inicial, zoom final[, salida de la imagen si se alarga])
# La voz va pegada (sin silencios); los cambios de zoom disimulan los cortes.
SEGS = [
    ("a312", 0.56, 2.22, 1.00, 1.05),   # ¿Qué tal? ¿Cómo están?
    ("a312", 2.55, 5.28, 1.24, 1.28),   # Oigan, a todos los jóvenes … Miguel Hidalgo,
    ("a312", 5.62, 9.58, 1.02, 1.09),   # los queremos invitar … a una albercada.
    ("93b3", 0.58, 1.25, 1.38, 1.42),   # ¿Para qué?
    ("93b3", 1.25, 5.68, 1.04, 1.10),   # Para conocernos … nuestras causas.
    ("a205", 0.86, 1.85, 1.00, 1.03),   # hablar de lo que
    ("a205", 2.15, 5.65, 1.20, 1.25),   # les preocupa … cómo les podemos ayudar
    ("a205", 5.95, 7.70, 1.03, 1.08),   # y sobre todo … el futuro de México.
    ("8f52", 0.58, 2.30, 1.14, 1.18),   # Pondremos pizzas,
    ("8f52", 2.78, 5.566, 1.00, 1.06),  # pondremos el ambiente … la terraza.
    ("b459", 4.86, 9.18, 1.20, 1.25),   # Y como todo en esta vida … que estimamos.
    ("b459", 0.55, 3.72, 1.00, 1.07),   # Así que los esperamos este domingo, más informes aquí
]
ANCHOR_Y = 0.30  # los punch-ins se centran en la cara


def timeline():
    t, out = INTRO, []
    for i, (clip, a, b, z0, z1) in enumerate(SEGS):
        out.append(dict(clip=clip, src_in=a, src_out=b, t0=t, t1=t + (b - a), z0=z0, z1=z1))
        t += b - a
    return out


def run(cmd, **kw):
    print(" ".join(str(c) for c in cmd[:8]), "…")
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


# ---------------------------------------------------------------- agua
def water_src(which):
    """Video del agua: si están los de la alberca (assets/water/inicio.mp4, cierre.mp4) se usan;
    si no, un agua de prueba generada (renders/water-<which>.mp4)."""
    real = A / "water" / f"{which}.mp4"
    return real if real.exists() else OUT / f"water-{which}.mp4"


def build_water_placeholder():
    """Cáusticas de alberca procedurales (solo para previsualizar mientras llegan los videos reales)."""
    w, h = 540, 960
    for which, dur in (("inicio", INTRO + 0.5), ("cierre", TOTAL - OUTRO_CUT + 0.5)):
        p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
             "-r", str(FPS), "-i", "-", "-vf", f"scale={W}:{H}:flags=bicubic", "-c:v", "libx264",
             "-crf", "16", "-pix_fmt", "yuv420p", str(OUT / f"water-{which}.mp4")],
            stdin=subprocess.PIPE)
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        # "Tileable water caustic" (iteración de senos), en coordenadas de alberca
        px = xs / w * 2 * np.pi * 1.6 - 250.0
        py = ys / h * 2 * np.pi * 2.85 - 250.0
        for f in range(int(dur * FPS)):
            t = f / FPS * 0.5 + 23.0 + (0 if which == "inicio" else 40)
            ix, iy = px.copy(), py.copy()
            c = np.ones_like(px)
            inten = 0.005
            for n in range(5):
                tt = t * (1.0 - 3.5 / (n + 1))
                ix, iy = px + np.cos(tt - ix) + np.sin(tt + iy), py + np.sin(tt - iy) + np.cos(tt + ix)
                dx = px / (np.sin(ix + tt) / inten + 1e-6)
                dy = py / (np.cos(iy + tt) / inten + 1e-6)
                c += 1.0 / (np.sqrt(dx * dx + dy * dy) + 1e-6)
            c = c / 5.0
            c = 1.17 - np.power(np.clip(c, 0, 10), 1.4)
            c = np.clip(np.power(np.abs(c), 8.0), 0, 1)
            base = np.array([0.0, 0.62, 0.80], np.float32)
            deep = np.array([0.0, 0.40, 0.66], np.float32)
            g = (ys / h)[..., None]
            col = base * (1 - g) + deep * g
            col = np.clip(col + c[..., None] * np.array([0.75, 0.95, 1.0], np.float32), 0, 1)
            p.stdin.write((col * 255).astype(np.uint8).tobytes())
        p.stdin.close()
        p.wait()


# ---------------------------------------------------------------- video base
def build_base():
    tl = timeline()
    parts, inputs = [], []
    k = 0

    def add_input(path):
        nonlocal k
        inputs.extend(["-i", path])
        k += 1
        return k - 1

    grade = "eq=contrast=1.06:saturation=1.08:brightness=0.012:gamma=1.02"

    # Agua del inicio
    i = add_input(water_src("inicio"))
    parts.append(
        f"[{i}:v]trim=duration={INTRO:.4f},setpts=PTS-STARTPTS,fps={FPS},"
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},eq=saturation=1.08:contrast=1.03,setsar=1,format=yuv420p[s0]")
    labels = ["[s0]"]

    # La persona: cada segmento con su punch-in y un empuje lento
    for n, s in enumerate(tl):
        i = add_input(A / CLIPS[s["clip"]])
        t1 = s["t1"]
        if n == len(tl) - 1:
            t1 = OUTRO_CUT  # la imagen se alarga mientras sale la tarjeta de informes
        dur = t1 - s["t0"]
        z0, z1 = s["z0"], s["z1"]
        z = f"({z0}+({z1 - z0})*t/{dur:.4f})"
        parts.append(
            f"[{i}:v]trim=start={s['src_in']:.4f}:duration={dur:.4f},setpts=PTS-STARTPTS,fps={FPS},"
            f"scale=w='2*trunc({W}*{z}/2)':h='2*trunc({H}*{z}/2)':eval=frame:flags=lanczos,"
            f"crop={W}:{H}:x='(iw-{W})/2':y='(ih-{H})*{ANCHOR_Y}',{grade},"
            f"unsharp=5:5:0.55:5:5:0.0,setsar=1,format=yuv420p[s{n + 1}]")
        labels.append(f"[s{n + 1}]")

    # Agua del cierre: la dona flotando hasta el compás 41.275 (¡TE ESPERAMOS!), luego el agua con
    # destellos de sol en cámara lenta para el CTA de Instagram y los logos.
    for which, t0, t1 in (("cierre", OUTRO_CUT, WATER2), ("cierre2", WATER2, TOTAL)):
        i = add_input(water_src(which))
        m = len(labels)
        dur = t1 - t0
        src_len = float(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(water_src(which))],
            capture_output=True, text=True).stdout)
        speed = min(1.0, (src_len - 0.1) / dur)  # si el clip es corto, cámara lenta suave
        parts.append(
            f"[{i}:v]setpts=(PTS-STARTPTS)/{speed:.4f},fps={FPS},trim=duration={dur:.4f},setpts=PTS-STARTPTS,"
            f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},"
            f"eq=saturation=1.08:contrast=1.03,setsar=1,format=yuv420p[s{m}]")
        labels.append(f"[s{m}]")

    graph = parts + [f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0,trim=duration={TOTAL},setpts=PTS-STARTPTS[v]"]
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p",
         OUT / "base.mp4"])


# ---------------------------------------------------------------- efectos de sonido (sintetizados)
def _env(n, a, d):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-np.linspace(0, d, n - na))
    return e


def _bandnoise(n, lo, hi, rng):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, n)


def build_sfx():
    rng = np.random.default_rng(7)
    sfx = {}

    # whoosh: ruido con filtro que barre (sube y baja) y paneo
    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    # filtro pasa-banda variable por bloques
    blk = 512
    for s in range(0, n, blk):
        seg = x[s:s + blk]
        fc = 300 + 4200 * np.sin(np.pi * t[s]) ** 2
        X = np.fft.rfft(seg, blk)
        f = np.fft.rfftfreq(blk, 1 / SR)
        X *= np.exp(-((f - fc) / (fc * 0.6)) ** 2)
        out[s:s + blk] = np.fft.irfft(X, blk)[: len(seg)]
    out *= np.sin(np.pi * t) ** 1.6
    pan = np.clip(t, 0, 1)
    sfx["whoosh"] = np.stack([out * (1 - 0.6 * pan), out * (0.4 + 0.6 * pan)], 1)

    # pop: burbuja que sube de tono
    n = int(0.14 * SR)
    t = np.arange(n) / SR
    f = 380 + 1500 * (t / t[-1]) ** 0.6
    ph = 2 * np.pi * np.cumsum(f) / SR
    pop = np.sin(ph) * _env(n, 0.004, 9) + 0.15 * rng.standard_normal(n) * _env(n, 0.001, 40)
    sfx["pop"] = np.stack([pop, pop], 1)

    # bubbles: ráfaga de burbujitas
    n = int(0.7 * SR)
    b = np.zeros(n)
    for k in range(14):
        st = int(rng.uniform(0, 0.55) * SR)
        ln = int(rng.uniform(0.03, 0.07) * SR)
        tt = np.arange(ln) / SR
        f0 = rng.uniform(500, 1400)
        ph = 2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tt / tt[-1])) / SR
        b[st:st + ln] += np.sin(ph) * np.sin(np.pi * tt / tt[-1]) * rng.uniform(0.3, 0.8)
    sfx["bubbles"] = np.stack([b, np.roll(b, 300)], 1)

    # splash: golpe grave + ruido con caída larga + burbujas
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    body = _bandnoise(n, 300, 9000, rng) * _env(n, 0.01, 7)
    hiss = _bandnoise(n, 2500, 14000, rng) * _env(n, 0.03, 4) * 0.6
    thump = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 6) + 45) / SR) * _env(n, 0.002, 14) * 1.2
    sp = body + hiss + thump
    sp[: len(b)] += 0.5 * b[: n]
    sfx["splash"] = np.stack([sp, np.roll(sp, 220)], 1)

    # impacto (boom) para golpes de título
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 110 * np.exp(-t * 18)) / SR) * _env(n, 0.002, 6)
    boom += _bandnoise(n, 60, 2500, rng) * _env(n, 0.001, 30) * 0.5
    sfx["boom"] = np.stack([boom, boom], 1)

    # click / tap (botón de seguir)
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    cl = (np.sin(2 * np.pi * 2400 * t) * 0.6 + _bandnoise(n, 1500, 8000, rng)) * _env(n, 0.0005, 60)
    sfx["click"] = np.stack([cl, cl], 1)

    # ding / sparkle: campanita brillante
    n = int(1.0 * SR)
    t = np.arange(n) / SR
    d = sum(np.sin(2 * np.pi * fr * t) * g for fr, g in ((1568, 1), (2349, 0.5), (3136, 0.35), (4699, 0.2)))
    d *= _env(n, 0.003, 7)
    sfx["ding"] = np.stack([d, np.roll(d, 400)], 1)

    # swish corto (subtítulo/sticker)
    n = int(0.22 * SR)
    t = np.linspace(0, 1, n)
    sw = _bandnoise(n, 2500, 11000, rng) * np.sin(np.pi * t) ** 2
    sfx["swish"] = np.stack([sw, sw], 1)

    sd = OUT / "sfx"
    sd.mkdir(exist_ok=True)
    for name, y in sfx.items():
        y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
        _write_wav(sd / f"{name}.wav", y)


def _write_wav(path, y):
    import wave
    y16 = (np.clip(y, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(y16.tobytes())


def _read(path, start=0.0, dur=None, mono=False):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.4f}", "-i", str(path)]
    if dur is not None:
        cmd += ["-t", f"{dur:.4f}"]
    cmd += ["-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
    return x if mono else x.reshape(-1, 2)


# Efectos: (segundo, nombre, ganancia dB). Afinados con los rótulos de la capa gráfica.
SFX = [
    # Intro en el agua
    (0.00, "splash", -6), (0.18, "pop", -14), (0.48, "whoosh", -12), (0.55, "boom", -9),
    (1.12, "swish", -15), (1.28, "pop", -13), (1.40, "pop", -14), (1.55, "swish", -16), (1.75, "pop", -12), (2.36, "pop", -15), (2.10, "bubbles", -12),
    (2.95, "whoosh", -6), (3.40, "splash", -10),                # ola → entra la voz (drop 1)
    # Parte hablada
    (13.80, "whoosh", -11), (13.86, "boom", -9), (13.92, "pop", -12), (14.24, "ding", -15), (15.03, "swish", -14),  # SOMOS en grande
    (8.88, "pop", -12), (9.42, "pop", -12),                     # domingo / 2 PM
    (10.97, "splash", -11), (10.99, "boom", -12), (11.10, "ding", -18),   # ¡ALBERCADA!
    (11.72, "whoosh", -13), (11.80, "boom", -14),               # ¿PARA QUÉ?
                      # SOMOS
    (33.42, "whoosh", -12), (33.62, "pop", -16),                # más informes aquí
    # Cierre en el agua
    (35.25, "whoosh", -6), (35.70, "splash", -9),               # ola → agua del cierre
    (36.00, "pop", -13), (37.55, "bubbles", -13),
    (38.75, "boom", -5), (38.75, "splash", -9), (38.90, "boom", -12),   # ¡TE ESPERAMOS!
    (39.38, "pop", -11),
    (41.05, "whoosh", -11), (41.35, "pop", -11),                # ¡Síguenos!
    (41.85, "swish", -15), (42.17, "swish", -15), (42.49, "swish", -15), (42.81, "swish", -15),
    (43.50, "click", -9), (43.80, "click", -9), (44.10, "click", -9), (44.40, "click", -9), (44.42, "ding", -19),
    (45.15, "whoosh", -12), (45.60, "swish", -14), (45.85, "pop", -11), (46.15, "pop", -11),
    (47.60, "splash", -7), (47.60, "boom", -9),                 # golpe final
]


def build_audio():
    tl = timeline()
    n_total = int(TOTAL * SR)

    # Voz: segmentos pegados con micro-fundidos para que no truenen los cortes
    voice = np.zeros((n_total, 2), np.float32)
    fade = int(0.012 * SR)
    for s in tl:
        x = _read(A / CLIPS[s["clip"]], s["src_in"], s["src_out"] - s["src_in"])
        x = x.copy()
        x[:fade] *= np.linspace(0, 1, fade)[:, None]
        x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        i0 = int(round(s["t0"] * SR))
        voice[i0:i0 + len(x)] += x[: n_total - i0]
    _write_wav(OUT / "voice_raw.wav", voice)
    # Limpieza y nivel: pasa-altos, reducción de ruido, de-esser suave, compresión, presencia
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "voice_raw.wav", "-af",
         "highpass=f=85,afftdn=nf=-30:nr=10,equalizer=f=220:t=q:w=1.2:g=-2,"
         "equalizer=f=3200:t=q:w=1.0:g=3,equalizer=f=7000:t=q:w=2:g=-2,"
         "acompressor=threshold=-22dB:ratio=3.5:attack=8:release=120:makeup=4,"
         "alimiter=limit=0.89", "-ar", str(SR), OUT / "voice.wav"])
    voice = _read(OUT / "voice.wav")[:n_total]
    voice = np.pad(voice, ((0, n_total - len(voice)), (0, 0)))

    # Música: build-up + drop 1 … empalme en compás … drop 2 hasta el final seco
    song = A / "musica.m4a"
    m1 = _read(song, M_START, M_SPLICE_FROM - M_START + 0.05)
    m2 = _read(song, M_SPLICE_TO - 0.05, 69.55 - M_SPLICE_TO + 0.05)
    music = np.zeros((n_total, 2), np.float32)
    i_s = int(SPLICE * SR)
    xf = int(0.05 * SR)
    a = m1[: i_s + xf]
    music[: len(a)] += a * np.concatenate([np.ones(len(a) - xf), np.linspace(1, 0, xf)])[:, None]
    b = m2[: n_total - (i_s - xf)]
    ramp = np.concatenate([np.linspace(0, 1, xf), np.ones(len(b) - xf)])[:, None]
    music[i_s - xf: i_s - xf + len(b)] += b * ramp
    # el final seco de la canción a SONG_END; una cola mínima para no tronar
    i_end = int(SONG_END * SR)
    tail = int(0.03 * SR)
    music[i_end: i_end + tail] *= np.linspace(1, 0, tail)[:, None]
    music[i_end + tail:] = 0

    # Ducking: la música baja bajo la voz (envolvente suave de la voz)
    env = np.abs(voice).mean(1)
    k = int(0.25 * SR)
    env = np.convolve(env, np.ones(k) / k, mode="same")
    speaking = np.clip(env / 0.02, 0, 1)
    sm = int(0.18 * SR)
    speaking = np.convolve(speaking, np.ones(sm) / sm, mode="same")
    gain = np.ones(n_total, np.float32)
    # dentro del tramo hablado la música se queda abajo todo el tiempo (no "bombea" entre palabras)
    t = np.arange(n_total) / SR
    in_talk = (t > INTRO + 0.35) & (t < tl[-1]["t1"] + 0.25)
    gain[in_talk] = 10 ** (-14 / 20)
    gain = np.minimum(gain, 1 - (1 - 10 ** (-16 / 20)) * speaking)
    sm = int(0.3 * SR)
    gain = np.convolve(gain, np.ones(sm) / sm, mode="same")
    music *= gain[:, None]

    # Efectos
    fx = np.zeros((n_total, 2), np.float32)
    for t0, name, db in SFX:
        y = _read(OUT / "sfx" / f"{name}.wav")
        i0 = int(t0 * SR)
        y = y[: n_total - i0]
        fx[i0:i0 + len(y)] += y * 10 ** (db / 20)

    mix = voice * 1.0 + music * 0.9 + fx
    _write_wav(OUT / "mix_raw.wav", np.clip(mix, -1, 1))
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav",
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), OUT / "audio.wav"])


# ---------------------------------------------------------------- final
def build_final():
    frames = sorted((OUT / "overlay").glob("*.png"))
    if not frames:
        sys.exit("Falta renders/overlay: renderiza primero la capa con hyperframes (png-sequence).")
    stem, num = frames[0].stem.rsplit("_", 1)
    pattern = OUT / "overlay" / f"{stem}_%0{len(num)}d.png"
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-start_number", int(num), "-i", pattern, "-i", OUT / "audio.wav",
         "-filter_complex",
         "[0:v][1:v]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         # Formato Reels/Stories: H.264 High 5.1, yuv420p, 30 fps, AAC 48 kHz estéreo, moov al inicio
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart",
         OUT / "albercada-somos-4k.mp4"])


def print_timeline():
    for s in timeline():
        print(f"{s['clip']} {s['src_in']:.2f}-{s['src_out']:.2f}  →  {s['t0']:.2f}-{s['t1']:.2f}")
    print(json.dumps(dict(INTRO=INTRO, OUTRO_CUT=OUTRO_CUT, SPLICE=SPLICE, DROP2=DROP2, TOTAL=TOTAL)))


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"water": build_water_placeholder, "sfx": build_sfx, "base": build_base, "audio": build_audio,
             "final": build_final, "tl": print_timeline}
    for s in sys.argv[1:] or ["tl"]:
        steps[s]()
