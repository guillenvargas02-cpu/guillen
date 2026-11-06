#!/usr/bin/env python3
"""Arma el video SOMOTRIX (30 s, 2160x3840, 30 fps).

Estructura: cortinilla con el logo SOMOS → el robot de playera rosa da su mensaje completo
→ bailes al beat de "audio_baile" (124 BPM) → corte seco, cortinilla robótica y logo SOMOS en blanco.

0. prep       — convierte la toma HQ de la playera rosa (iPhone HDR HLG, 60 fps) a SDR BT.709 (caché).
1. base.mp4   — cortes en la rejilla de beats, reescalado a 4K con lanczos + nitidez, gradación
                unificada, punch-ins, cámara lenta (60 fps reales o interpolada), stutter y glitches RGB.
2. sfx.wav    — efectos sintetizados (whooshes, impactos, risers, glitch).
3. audio.wav  — diálogo limpio al frente, música con ducking, efectos sintetizados y los audios tech.
4. Compone la capa gráfica de HyperFrames (png-sequence RGBA, 4K) encima y entrega el MP4.

Uso:
  python3 build.py prep base sfx audio
  npx hyperframes render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
  python3 build.py final
"""
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
TOTAL = 30.0

SRC = {
    "alfombra": A / "robot-alfombra.mp4",  # alfombra roja (evento), 30 fps
    "sala": A / "robot-sala.mp4",  # sala gris con micrófonos, 30 fps
    "rosa": OUT / "cache" / "rosa-sdr.mp4",  # playera rosa con el mensaje (HQ 1080p, 59.94 fps)
}
ROSA_HQ = A / "robot-playera-rosa-hq.mov"
SFX_DIR = A / "sfx"

# Música: "audio_baile" (124.1 BPM). Su fuente 0 suena en N1_AT; el corte seco de la canción
# (fuente 23.55 s) cae en STOP y el golpe de entrada al baile (fuente 11.95, inicio de frase) en DROP.
BEAT = 0.4835
N1_AT = 2.31
DROP = 14.26
STOP = 25.864


def bt(k):
    """Tiempo del beat k del baile (k=0 es el DROP)."""
    return round(DROP + k * BEAT, 4)


# (fuente, entrada, inicio, fin, velocidad, zoom inicial, zoom final, centro vertical, golpe, interpolar)
# golpe=True: el plano entra con un punch de escala que se asienta (impacto en el corte).
# interpolar=True: cámara lenta con fotogramas intermedios (minterpolate) para fuentes a 30 fps.
EDL = [
    ("white", 0, 0.00, 1.80, 1, 1, 1, 0.5, False, False),  # cortinilla de apertura con el logo SOMOS
    ("rosa", 0.10, 1.80, 3.75, 1, 1.02, 1.10, 0.48, True, False),  # se voltea: aparece SOMOTRIX
    # El mensaje (los cortes caen en las pausas; los cambios de encuadre tapan los saltos)
    ("rosa", 4.38, 3.75, 5.82, 1, 1.15, 1.24, 0.42, True, False),  # "Atención humanos de Miguel Hidalgo"
    ("rosa", 6.60, 5.82, 7.84, 1, 1.55, 1.62, 0.30, True, False),  # "el futuro ya llegó a su alcaldía"
    ("rosa", 8.82, 7.84, 9.57, 1, 1.00, 1.04, 0.50, True, False),  # "síganos en las redes sociales" (+ Instagram)
    ("rosa", 10.85, 9.57, 10.80, 1, 1.12, 1.15, 0.47, True, False),  # "de SOMOS Miguel Hidalgo"
    ("rosa", 12.08, 10.80, 13.30, 1, 1.30, 1.45, 0.36, True, False),  # "y descubra lo que estamos construyendo"
    ("rosa", 14.84, 13.30, DROP, 1, 1.85, 1.95, 0.29, True, False),  # "cambio y fuera"
    # Bailes al beat
    ("alfombra", 21.40, bt(0), bt(2), 1, 1.00, 1.04, 0.50, True, False),
    ("sala", 22.00, bt(2), bt(4), 1, 1.00, 1.04, 0.50, True, False),
    ("alfombra", 29.00, bt(4), bt(6), 1, 1.00, 1.04, 0.50, True, False),
    ("sala", 27.40, bt(6), bt(8), 1, 1.00, 1.04, 0.50, True, False),
    ("alfombra", 39.00, bt(8), bt(12), 0.5, 1.00, 1.06, 0.50, True, True),  # cámara lenta
    ("sala", 17.00, bt(12), bt(13), 1, 1.02, 1.04, 0.50, True, False),
    ("alfombra", 32.30, bt(13), bt(14), 1, 1.02, 1.04, 0.50, True, False),
    ("sala", 30.00, bt(14), bt(15), 1, 1.02, 1.04, 0.50, True, False),
    ("alfombra", 36.20, bt(15), bt(16), 1, 1.02, 1.04, 0.50, True, False),
    ("rosa", 9.60, bt(16), bt(18), 0.6, 1.08, 1.14, 0.45, True, False),  # la protagonista, cámara lenta real
    # stutter robótico: el mismo tercio de beat tres veces
    ("sala", 25.00, bt(18), bt(18) + BEAT / 3, 1, 1.02, 1.02, 0.50, True, False),
    ("sala", 25.00, bt(18) + BEAT / 3, bt(18) + 2 * BEAT / 3, 1, 1.08, 1.08, 0.50, True, False),
    ("sala", 25.00, bt(18) + 2 * BEAT / 3, bt(19), 1, 1.15, 1.15, 0.50, True, False),
    ("alfombra", 41.00, bt(19), bt(20), 1, 1.02, 1.04, 0.50, True, False),
    ("sala", 31.00, bt(20), bt(22), 1, 1.00, 1.04, 0.50, True, False),
    ("alfombra", 22.60, bt(22), STOP, 1, 1.00, 1.04, 0.50, True, False),
    # la música se corta: cuadro congelado (con glitch) y cortinilla al logo
    ("alfombra", 23.56, STOP, 26.70, 0.001, 1.06, 1.10, 0.50, True, False),
    ("white", 0, 26.70, TOTAL, 1, 1, 1, 0.5, False, False),
]

# Gradación (todo en RGB; la conversión YUV↔RGB siempre con matriz BT.709 explícita: con la
# matriz por defecto de ffmpeg (BT.601) el rosa de la playera se iba a carmesí).
# Base cinematográfica común (sombras hacia el ciruela, en familia con el rosa de marca) + corrección por locación para que las tomas casen.
GRADE_COMMON = (
    # curva en S suave + sombras hacia el azul petróleo
    "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.75/0.79 1/0.97',"
    "colorbalance=rs=0.02:gs=-0.01:bs=0.03,"
    "huesaturation=saturation=0.04"
)
GRADE = {
    # la alfombra roja satura todo: bajamos rojos y el exceso de calidez
    "alfombra": "huesaturation=saturation=-0.38:colors=r:strength=1.2,huesaturation=saturation=-0.06,"
    "curves=all='0/0 0.5/0.48 1/0.98',colortemperature=temperature=6800:mix=0.35",
    # sala gris plana: más contraste, neutra
    "sala": "curves=all='0/0 0.25/0.21 0.5/0.48 0.75/0.78 1/1',colortemperature=temperature=6800:mix=0.15",
    # playera rosa: el tonemapping HDR la oscurece; levantamos medios y llevamos el rojo hacia el magenta SOMOS
    "rosa": "curves=all='0/0 0.5/0.56 1/1',huesaturation=hue=-6:colors=r+m:intensity=0.06:saturation=0.05",
}
TO_RGB = "in_color_matrix=bt709:in_range=tv"
TO_YUV = f"scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"

# Glitches RGB del footage en los golpes (inicio, fin, desplazamiento en px a 4K)
GLITCH = [
    (1.80, 1.92, 26),
    (3.75, 3.82, 16),
    (5.82, 5.88, 14),
    (7.84, 7.92, 18),
    (10.80, 10.86, 14),
    (13.30, 13.40, 22),
    (DROP, DROP + 0.14, 34),
    (bt(8), bt(8) + 0.1, 24),
    (bt(16), bt(16) + 0.1, 24),
    (bt(18), bt(19), 18),
    (STOP, 26.70, 40),
]


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def clip_chain(i, src, s_in, dur, speed, z0, z1, cy, hit, interp=False):
    if src in ("black", "white"):
        return [], f"color=c={src}:s={W}x{H}:r={FPS}:d={dur:.4f},format=gbrp,setsar=1[s{i}]"
    # zoom: lineal z0→z1 durante el plano; con golpe, +8 % que se asienta en ~0.25 s
    bump = "+0.08*exp(-t*14)" if hit else ""
    z = f"({z0}+({z1}-{z0})*t/{dur:.4f}{bump})"
    chain = (
        f"[{i}:v]trim=start={s_in:.4f}:duration={dur * speed + 0.1:.4f},setpts=PTS-STARTPTS,"
        + ("minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1," if interp else "")
        + f"setpts=PTS/{speed},fps={FPS},"
        f"scale=w='trunc({W}*{z}/2)*2':h=-2:eval=frame:flags=lanczos:{TO_RGB},format=gbrp,"
        f"crop={W}:{H}:x=(iw-{W})/2:y=(ih-{H})*{cy},"
        f"cas=strength=0.55,{GRADE[src]},{GRADE_COMMON},"
        f"trim=duration={dur:.4f},setpts=PTS-STARTPTS,format=gbrp,setsar=1[s{i}]"
    )
    return ["-i", SRC[src]], chain


def build_prep():
    """iPhone HDR (HLG/BT.2020, 10 bits) → SDR BT.709 con tonemapping Hable; se queda en caché."""
    (OUT / "cache").mkdir(exist_ok=True)
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", ROSA_HQ, "-map", "0:v:0", "-map", "0:a:0",
         "-vf", "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,"
         "zscale=t=bt709:m=bt709:r=tv,format=yuv420p",
         "-c:v", "libx264", "-crf", "10", "-preset", "medium",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-c:a", "copy",
         SRC["rosa"]]
    )


def build_base():
    # Los fondos negro/blanco son fuentes dentro del grafo y no ocupan índice de entrada (-i)
    flat, graph, labels, idx = [], [], [], 0
    for i, (src, s_in, t0, t1, speed, z0, z1, cy, hit, interp) in enumerate(EDL):
        inp, chain = clip_chain(i, src, s_in, t1 - t0, speed, z0, z1, cy, hit, interp)
        if inp:
            flat += inp
            chain = chain.replace(f"[{i}:v]", f"[{idx}:v]", 1)
            idx += 1
        labels.append(f"[s{i}]")
        graph.append(chain)
    graph.append("".join(labels) + f"concat=n={len(EDL)}:v=1:a=0[cat]")
    glitch = ",".join(
        f"rgbashift=rh={-px}:bh={px}:gv={px // 3}:enable='between(t,{a},{b})'" for a, b, px in GLITCH
    )
    graph.append(
        f"[cat]{glitch},{TO_YUV},"
        # viñeta y grano de película en luma (el grano también disimula el reescalado)
        "vignette=angle=0.55:mode=forward,"
        "noise=c0s=7:c0f=t+u,"
        f"trim=duration={TOTAL},setpts=PTS-STARTPTS[v]"
    )
    run(
        ["ffmpeg", "-v", "error", "-y", *flat, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
         OUT / "base.mp4"]
    )


# ---------------------------------------------------------------- efectos de sonido (sintetizados)
SR = 48000


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(n, a, r):
    e = np.ones(n)
    ai, ri = max(1, int(a * SR)), max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e


def _noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def _bandsweep(x, f0, f1):
    """Filtro pasa-bandas barrido (resonante simple) para whooshes y risers."""
    y = np.zeros_like(x)
    lp = bp = 0.0
    q = 0.35
    for i in range(len(x)):
        f = f0 * (f1 / f0) ** (i / len(x))
        g = 2 * np.sin(np.pi * min(f, 18000) / SR)
        hp = x[i] - lp - q * bp
        bp += g * hp
        lp += g * bp
        y[i] = bp
    return y


def sfx_boom(d=2.2, f0=95, f1=32, seed=1):
    t = _t(d)
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 7)) / SR
    sub = np.sin(ph) * np.exp(-t * 2.2)
    click = _noise(len(t), seed) * np.exp(-t * 60) * 0.5
    return np.tanh(1.6 * (sub + click))


def sfx_whoosh(d=0.55, f0=300, f1=6000, seed=2):
    n = int(d * SR)
    x = _bandsweep(_noise(n, seed), f0, f1)
    t = np.arange(n) / n
    return x / (np.abs(x).max() + 1e-9) * np.sin(np.pi * t) ** 1.5


def sfx_riser(d=1.7, seed=3):
    n = int(d * SR)
    x = _bandsweep(_noise(n, seed), 200, 9000)
    t = np.arange(n) / n
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t)) / SR) * 0.25
    y = (x / (np.abs(x).max() + 1e-9) + tone) * t**2.2
    y[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return y


def sfx_glitch(d=0.35, seed=4):
    """Ráfaga digital: tonos cuadrados que saltan + ruido cortado en compases muy cortos."""
    rng = np.random.default_rng(seed)
    out = []
    while sum(len(o) for o in out) < d * SR:
        seg = int(rng.uniform(0.012, 0.04) * SR)
        f = rng.choice([180, 360, 720, 1440, 2880, 95])
        t = np.arange(seg) / SR
        s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 if rng.random() < 0.6 else rng.standard_normal(seg) * 0.4
        if rng.random() < 0.25:
            s *= 0
        out.append(s * _env(seg, 0.001, 0.003))
    return np.concatenate(out)[: int(d * SR)]


def sfx_beeps(seed=5):
    """Arranque del sistema: tres pitidos ascendentes + barrido de datos."""
    parts = []
    for k, f in enumerate([880, 1320, 1760]):
        t = _t(0.06)
        parts.append((k * 0.11, np.sin(2 * np.pi * f * t) * _env(len(t), 0.002, 0.03) * 0.5))
    return parts


def sfx_powerdown(d=0.6):
    t = _t(d)
    f = 1200 * np.exp(-t * 6) + 40
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 * _env(len(t), 0.005, 0.2)


def sfx_chime(d=2.6):
    """Firma del logo: acorde brillante con un 'ping' metálico."""
    t = _t(d)
    y = np.zeros_like(t)
    for f, a in [(1318.5, 0.35), (1975.5, 0.25), (2637.0, 0.18), (659.25, 0.3)]:
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t * (2.0 + f / 1500))
    return y * _env(len(t), 0.004, 0.6)


def build_sfx():
    track = np.zeros((int(TOTAL * SR) + SR, 2))

    def put(t0, x, gain, pan=0.0):
        i = int(t0 * SR)
        x = x[: len(track) - i]
        track[i:i + len(x), 0] += x * gain * (1 - max(0, pan))
        track[i:i + len(x), 1] += x * gain * (1 + min(0, pan))

    # Cortinilla de apertura: el logo se ensambla y las barras rosas abren al robot
    put(0.00, sfx_boom(1.4, 90, 34, 11), 0.45)
    for k in range(4):
        put(0.04 + k * 0.06, sfx_glitch(0.05, 50 + k), 0.16, (-1) ** k * 0.6)
    put(1.10, sfx_riser(0.7, 12), 0.30)
    put(1.62, sfx_whoosh(0.4, 300, 8000, 13), 0.55)
    put(1.80, sfx_boom(1.8, 110, 30, 14), 0.75)
    # Cambios de encuadre durante el mensaje (sutiles, bajo la voz)
    for k, tt in enumerate([3.75, 5.82, 7.84, 10.80]):
        put(tt - 0.1, sfx_whoosh(0.2, 900, 7000, 30 + k), 0.12, (-1) ** k * 0.5)
    put(13.30, sfx_glitch(0.2, 15), 0.2)
    # Entrada al baile: "cambio y fuera" → golpe
    put(DROP - 1.30, sfx_riser(1.30, 20), 0.30)
    put(DROP, sfx_boom(2.0, 110, 32, 21), 0.8)
    put(DROP, sfx_glitch(0.16, 22), 0.22)
    for k, kk in enumerate([2, 4, 6, 12, 13, 14, 15, 19, 20, 22]):
        put(bt(kk) - 0.1, sfx_whoosh(0.18, 700, 9000, 60 + k), 0.16, (-1) ** k * 0.5)
    put(bt(8), sfx_boom(1.4, 90, 34, 23), 0.5)
    put(bt(16), sfx_boom(1.2, 90, 34, 24), 0.45)
    for k in range(3):
        put(bt(18) + k * BEAT / 3, sfx_glitch(0.08, 70 + k), 0.25, (-1) ** k * 0.4)
    # Corte seco de la música → congelado → cortinilla → logo
    put(STOP, sfx_glitch(0.55, 25), 0.40)
    put(STOP + 0.15, sfx_powerdown(0.5), 0.30)
    put(26.70, sfx_boom(2.4, 120, 34, 26), 0.8)
    put(26.85, sfx_chime(2.6), 0.45)
    for k in range(5):
        put(26.85 + k * 0.07, sfx_glitch(0.05, 40 + k), 0.16, (-1) ** k * 0.6)

    track = track[: int(TOTAL * SR)]
    track = np.clip(track, -1, 1)
    with wave.open(str(OUT / "sfx.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((track * 32767).astype("<i2").tobytes())


# ---------------------------------------------------------------- mezcla
# Diálogo: tramos de la toma HQ (entrada, inicio, fin en el video). Los cortes caen en las pausas.
VOICE = [
    (4.38, 3.75, 5.82),  # Atención humanos de Miguel Hidalgo,
    (6.60, 5.82, 7.84),  # el futuro ya llegó a su alcaldía,
    (8.82, 7.84, 9.57),  # síganos en las redes sociales
    (10.85, 9.57, 13.30),  # de SOMOS Miguel Hidalgo y descubra lo que estamos construyendo.
    (14.84, 13.30, DROP),  # Cambio y fuera.
]
# Audios complementarios: (archivo, entrada, duración, inicio en el video, ganancia)
SFX_FILES = [
    ("tech-glitch", 0.0, 1.37, 1.45, 0.55),  # las barras abren la cortinilla
    ("robot-mecanico", 0.0, 1.90, 1.85, 0.28),  # servos mientras se voltea
    ("scifi-data", 0.0, 1.43, 7.80, 0.32),  # entra el ícono de Instagram
    ("robot-bleeps", 0.0, 0.94, 9.60, 0.26),  # @somos_mh
    ("tech-glitch", 0.0, 1.37, STOP - 0.05, 0.55),  # corte seco de la música
    ("robot-bleeps", 0.0, 0.94, 26.85, 0.40),  # ensamblado del logo
]
TEASER_IN = 0.60  # "audio_video_robot_teaser": golpe fuerte en la fuente 0.64 → abre la cortinilla
DUCK = (3.55, DROP - 0.06)


def build_audio():
    f = []
    for i, (s_in, t0, t1) in enumerate(VOICE):
        d = t1 - t0
        f.append(
            f"[0:a]atrim=start={s_in:.3f}:duration={d:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.03,afade=t=out:st={d - 0.04:.3f}:d=0.04,adelay={int(t0 * 1000)}|{int(t0 * 1000)}[v{i}]"
        )
    nv = len(VOICE)
    f.append(
        "".join(f"[v{i}]" for i in range(nv)) + f"amix=inputs={nv}:normalize=0,"
        "afftdn=nr=12:nf=-44:tn=1,highpass=f=100,lowpass=f=12000,"
        "equalizer=f=3000:t=q:w=1.2:g=3,equalizer=f=250:t=q:w=1.0:g=-2,"
        "acompressor=threshold=-28dB:ratio=4:attack=4:release=120:makeup=10dB,"
        f"volume=1.5,apad=whole_dur={TOTAL}[voice]"
    )
    a, b = DUCK
    r, rel = 0.3, 0.04
    duck = (
        f"if(lt(t,{a - r}),1,if(lt(t,{a}),1-0.84*(t-{a - r})/{r},"
        f"if(lt(t,{b}),0.16,if(lt(t,{b + rel}),0.16+0.84*(t-{b})/{rel},1))))"
    )
    # baile: entra con la apertura de la cortinilla y queda debajo del mensaje
    d1 = TOTAL - N1_AT
    f.append(
        f"[1:a]atrim=start=0:duration={d1:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.25,"
        f"adelay={int(N1_AT * 1000)}|{int(N1_AT * 1000)},apad=whole_dur={TOTAL},"
        f"volume='{duck}':eval=frame,volume=0.62[music]"
    )
    # teaser: el golpe de la cortinilla de apertura, se funde con el baile
    f.append(
        f"[2:a]atrim=start={TEASER_IN}:duration=2.7,asetpts=PTS-STARTPTS,"
        "afade=t=in:d=0.02,afade=t=out:st=2.05:d=0.6,volume=0.6,apad=whole_dur=30[teaser]"
    )
    f.append("[3:a]volume=1.0[synth]")
    inputs = ["-i", SRC["rosa"], "-i", A / "musica-baile.m4a", "-i", A / "musica-teaser.m4a", "-i", OUT / "sfx.wav"]
    labels = []
    for k, (name, s_in, d, t0, g) in enumerate(SFX_FILES):
        inputs += ["-i", SFX_DIR / f"{name}.m4a"]
        f.append(
            f"[{4 + k}:a]atrim=start={s_in}:duration={d},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
            f"afade=t=out:st={max(0.0, d - 0.08):.3f}:d=0.08,volume={g},adelay={int(t0 * 1000)}|{int(t0 * 1000)}[x{k}]"
        )
        labels.append(f"[x{k}]")
    n = 4 + len(labels)
    f.append(f"[voice][music][teaser][synth]{''.join(labels)}amix=inputs={n}:normalize=0:duration=first,alimiter=limit=0.9[mix]")
    run(
        ["ffmpeg", "-v", "error", "-y", *inputs,
         "-filter_complex", ";".join(f), "-map", "[mix]", "-ar", "48000", "-ac", "2", "-t", TOTAL,
         OUT / "mix_raw.wav"]
    )
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav",
         "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", OUT / "audio.wav"]
    )


def build_final():
    frames = sorted((OUT / "overlay").glob("*.png"))
    if not frames:
        sys.exit("Falta renders/overlay: renderiza primero la capa con hyperframes (png-sequence).")
    stem, num = frames[0].stem.rsplit("_", 1)
    pattern = OUT / "overlay" / f"{stem}_%0{len(num)}d.png"
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", OUT / "base.mp4",
         "-framerate", FPS, "-start_number", int(num), "-i", pattern, "-i", OUT / "audio.wav",
         "-filter_complex",
         # la capa RGBA pasa a YUV con BT.709 explícito (el rosa del logo no debe desplazarse)
         f"[1:v]scale={W}:{H}:out_color_matrix=bt709:out_range=tv,format=yuva444p[o];"
         "[0:v]format=yuv444p[b];[b][o]overlay=0:0:format=yuv444:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "somotrix-4k.mp4"]
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = sys.argv[1:] or ["prep", "base", "sfx", "audio", "final"]
    for s in steps:
        {"prep": build_prep, "base": build_base, "sfx": build_sfx, "audio": build_audio, "final": build_final}[s]()
