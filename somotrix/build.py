#!/usr/bin/env python3
"""Arma el video SOMOTRIX (30 s, 2160x3840, 30 fps).

0. prep       — convierte la toma HQ de la playera rosa (iPhone HDR HLG, 60 fps) a SDR BT.709 (caché).
1. base.mp4   — cortes del footage en la rejilla de beats de la música (~106.7 BPM, 0.5625 s),
                reescalado a 4K con lanczos + nitidez, gradación unificada para las tres locaciones,
                punch-ins, cámara lenta (la playera rosa está a 60 fps) y glitches RGB en los golpes.
2. sfx.wav    — efectos sintetizados (arranque digital, whooshes, impactos, risers, glitch de cierre).
3. audio.wav  — diálogo de la playera rosa limpio y al frente, música con ducking y los efectos.
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
BEAT = 0.5625  # 106.67 BPM; la sección de la canción que usamos entra en 0.0 y el golpe grande en 18.0

SRC = {
    "alfombra": A / "robot-alfombra.mp4",  # alfombra roja (evento), 30 fps
    "sala": A / "robot-sala.mp4",  # sala gris con micrófonos, 30 fps
    "rosa": OUT / "cache" / "rosa-sdr.mp4",  # playera rosa SOMOS MX con diálogo (HQ 1080p, 59.94 fps)
}
ROSA_HQ = A / "robot-playera-rosa-hq.mov"
SFX_DIR = A / "sfx"

# (fuente, entrada, inicio, fin, velocidad, zoom inicial, zoom final, centro vertical, golpe)
# golpe=True: el plano entra con un punch de escala que se asienta (impacto en el beat).
EDL = [
    ("black", 0, 0.0000, 0.5625, 1, 1, 1, 0.5, False),  # arranque del sistema (HUD encima)
    ("sala", 3.00, 0.5625, 1.6875, 1, 1.30, 1.38, 0.30, True),  # detalle: cabeza
    ("sala", 0.45, 1.6875, 2.8125, 1, 1.12, 1.20, 0.45, True),  # detalle: torso y brazo
    ("sala", 4.40, 2.8125, 3.3750, 1, 1.22, 1.26, 0.25, True),  # gira la cabeza
    ("rosa", 0.00, 3.3750, 6.7500, 0.75, 1.00, 1.12, 0.48, True),  # de espaldas (SOMOS MX), gira en cámara lenta
    # Diálogo (sin cortar palabras: los saltos caen en las pausas y los tapan los cambios de plano)
    ("rosa", 4.35, 6.7500, 11.0800, 1, 1.04, 1.12, 0.46, True),  # abierto, push-in lento
    ("rosa", 8.83, 11.0800, 15.0000, 1, 1.32, 1.38, 0.40, False),  # medio
    ("rosa", 12.90, 15.0000, 18.0000, 1, 1.14, 1.24, 0.44, False),  # abierto-medio, push-in
    # Montaje de baile al beat (el golpe grande de la canción cae en 18.0)
    ("alfombra", 21.40, 18.0000, 19.1250, 1, 1.06, 1.10, 0.50, True),
    ("sala", 22.00, 19.1250, 20.2500, 1, 1.10, 1.14, 0.52, True),
    ("alfombra", 29.00, 20.2500, 21.3750, 1, 1.06, 1.12, 0.50, True),
    ("sala", 27.40, 21.3750, 22.5000, 1, 1.10, 1.14, 0.50, True),
    ("alfombra", 39.00, 22.5000, 23.6250, 1, 1.08, 1.12, 0.50, True),
    ("sala", 17.00, 23.6250, 24.1875, 1, 1.12, 1.14, 0.50, True),
    ("alfombra", 32.30, 24.1875, 24.7500, 1, 1.10, 1.12, 0.50, True),
    ("sala", 30.00, 24.7500, 25.3125, 1, 1.12, 1.14, 0.50, True),
    ("alfombra", 36.20, 25.3125, 25.8750, 1, 1.10, 1.12, 0.50, True),
    # Cierre: la protagonista en cámara lenta (fuente a 60 fps) y la cortinilla robótica al logo
    ("rosa", 9.50, 25.8750, 27.6000, 0.6, 1.18, 1.30, 0.40, True),
    ("white", 0, 27.6000, TOTAL, 1, 1, 1, 0.5, False),
]

# Gradación: base cinematográfica común + corrección por locación para que las tomas casen
GRADE_COMMON = (
    # curva en S suave + sombras hacia el azul petróleo (sin tocar altas: el rosa de marca no se mueve)
    "curves=master='0/0.02 0.25/0.21 0.5/0.5 0.75/0.79 1/0.97',"
    "colorbalance=rs=-0.03:gs=0.0:bs=0.05,"
    "eq=contrast=1.05:saturation=1.03"
)
GRADE = {
    # la alfombra roja satura todo: bajamos rojos y calentamos menos
    "alfombra": "huesaturation=saturation=-0.38:colors=r:strength=1.2,eq=brightness=-0.02:saturation=0.92,"
    "colortemperature=temperature=6800:mix=0.35",
    # sala gris plana: más contraste y un poco de frío hacia el cian del pecho del robot
    "sala": "eq=contrast=1.10:brightness=-0.03:saturation=1.0,colortemperature=temperature=7600:mix=0.30",
    # playera rosa: respetar el rosa de marca y bajar el amarillo del muro
    "rosa": "eq=contrast=1.04:brightness=-0.01",
}

# Glitches RGB del footage en los golpes (inicio, fin, desplazamiento en px a 4K)
GLITCH = [
    (0.5625, 0.66, 18),
    (3.375, 3.47, 14),
    (6.75, 6.98, 26),
    (18.0, 18.16, 30),
    (22.5, 22.6, 22),
    (25.875, 25.95, 18),
    (26.95, 27.6, 34),
]


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def clip_chain(i, src, s_in, dur, speed, z0, z1, cy, hit):
    if src in ("black", "white"):
        return [], f"color=c={src}:s={W}x{H}:r={FPS}:d={dur:.4f},format=yuv420p,setsar=1[s{i}]"
    # zoom: lineal z0→z1 durante el plano; con golpe, +8 % que se asienta en ~0.25 s
    bump = "+0.08*exp(-t*14)" if hit else ""
    z = f"({z0}+({z1}-{z0})*t/{dur:.4f}{bump})"
    chain = (
        f"[{i}:v]trim=start={s_in:.4f}:duration={dur * speed + 0.05:.4f},setpts=(PTS-STARTPTS)/{speed},"
        f"fps={FPS},"
        f"scale=w='trunc({W}*{z}/2)*2':h=-2:eval=frame:flags=lanczos,"
        f"crop={W}:{H}:x=(iw-{W})/2:y=(ih-{H})*{cy},"
        f"cas=strength=0.55,{GRADE[src]},{GRADE_COMMON},"
        f"trim=duration={dur:.4f},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[s{i}]"
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
    for i, (src, s_in, t0, t1, speed, z0, z1, cy, hit) in enumerate(EDL):
        inp, chain = clip_chain(i, src, s_in, t1 - t0, speed, z0, z1, cy, hit)
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
        f"[cat]{glitch},"
        # viñeta y grano de película (el grano también disimula el reescalado)
        "vignette=angle=0.55:mode=forward,"
        "noise=c0s=7:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u,"
        f"trim=duration={TOTAL},setpts=PTS-STARTPTS,format=yuv420p[v]"
    )
    run(
        ["ffmpeg", "-v", "error", "-y", *flat, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p",
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

    # Hook de entrada
    for off, b in sfx_beeps():
        put(0.05 + off, b, 0.35)
    put(0.30, sfx_glitch(0.26, 11), 0.30)
    put(0.40, sfx_whoosh(0.3, 400, 7000, 12), 0.5)
    put(0.5625, sfx_boom(1.6, 80, 30, 13), 0.55)
    put(1.60, sfx_whoosh(0.3, 600, 5000, 14), 0.35, 0.4)
    put(2.72, sfx_whoosh(0.25, 800, 8000, 15), 0.35, -0.4)
    put(3.30, sfx_whoosh(0.45, 250, 3000, 16), 0.45)
    # Título SOMOTRIX
    put(5.05, sfx_riser(1.7, 17), 0.40)
    put(6.75, sfx_boom(2.4, 110, 30, 18), 0.85)
    put(6.75, sfx_glitch(0.42, 19), 0.32)
    # Entrada al baile
    put(16.30, sfx_riser(1.7, 20), 0.34)
    put(18.0, sfx_boom(2.0, 100, 32, 21), 0.75)
    put(18.0, sfx_glitch(0.18, 22), 0.25)
    for k, tt in enumerate([19.125, 20.25, 21.375, 23.625, 24.75]):
        put(tt - 0.12, sfx_whoosh(0.22, 700, 9000, 30 + k), 0.22, (-1) ** k * 0.5)
    put(22.5, sfx_boom(1.4, 90, 34, 23), 0.55)
    put(25.875, sfx_whoosh(0.5, 3000, 300, 24), 0.4)
    # Hook de salida: cortinilla robótica → logo
    put(26.95, sfx_glitch(0.65, 25), 0.42)
    put(27.15, sfx_powerdown(0.5), 0.35)
    put(27.60, sfx_boom(2.4, 120, 34, 26), 0.8)
    put(27.80, sfx_chime(2.2), 0.45)
    for k in range(5):
        put(27.85 + k * 0.07, sfx_glitch(0.05, 40 + k), 0.18, (-1) ** k * 0.6)

    track = track[: int(TOTAL * SR)]
    track = np.clip(track, -1, 1)
    with wave.open(str(OUT / "sfx.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((track * 32767).astype("<i2").tobytes())


# ---------------------------------------------------------------- mezcla
# Diálogo: tramos de la playera rosa (fuente HQ, inicio, fin en el video) — los mismos del EDL
VOICE = [(4.35, 6.75, 11.08), (8.83, 11.08, 15.00), (12.90, 15.00, 18.00)]
# Audios complementarios del robot: (archivo, entrada, duración, inicio en el video, ganancia)
SFX_FILES = [
    ("scifi-data", 0.0, 1.43, 0.00, 0.55),  # arranque: datos
    ("robot-mecanico", 0.0, 3.30, 0.55, 0.30),  # servos bajo los detalles del hook
    ("robot-bleeps", 0.0, 0.94, 4.20, 0.40),  # fijación del objetivo al voltearse
    ("scifi-data", 0.12, 1.30, 6.80, 0.32),  # el título se decodifica
    ("robot-mecanico", 6.40, 1.10, 25.87, 0.32),  # cámara lenta final
    ("robot-mecanico", 9.70, 1.00, 26.95, 0.40),  # cortinilla robótica
    ("robot-bleeps", 0.0, 0.94, 27.80, 0.42),  # ensamblado del logo
]
MUSIC_OFFSET = 77.12  # sección de la canción cuyo golpe (95.12) cae en 18.0; su cola cierra el video
DUCK = (6.55, 17.95)


def build_audio():
    f = []
    for i, (s_in, t0, t1) in enumerate(VOICE):
        d = t1 - t0
        f.append(
            f"[0:a]atrim=start={s_in:.3f}:duration={d:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.03,afade=t=out:st={d - 0.04:.3f}:d=0.04,adelay={int(t0 * 1000)}|{int(t0 * 1000)}[v{i}]"
        )
    f.append(
        "[v0][v1][v2]amix=inputs=3:normalize=0,"
        "afftdn=nr=12:nf=-44:tn=1,highpass=f=100,lowpass=f=12000,"
        "equalizer=f=3000:t=q:w=1.2:g=3,equalizer=f=250:t=q:w=1.0:g=-2,"
        "acompressor=threshold=-28dB:ratio=4:attack=4:release=120:makeup=10dB,"
        f"volume=1.5,apad=whole_dur={TOTAL}[voice]"
    )
    a, b = DUCK
    r, rel = 0.35, 0.05
    duck = (
        f"if(lt(t,{a - r}),1,if(lt(t,{a}),1-0.84*(t-{a - r})/{r},"
        f"if(lt(t,{b}),0.16,if(lt(t,{b + rel}),0.16+0.84*(t-{b})/{rel},1))))"
    )
    f.append(
        f"[1:a]atrim=start={MUSIC_OFFSET}:duration={TOTAL},asetpts=PTS-STARTPTS,"
        # el hook abre con la música filtrada (como detrás de una puerta) y se abre al girar la playera
        "lowpass=f=900:enable='lt(t,3.375)',"
        f"volume='{duck}':eval=frame,volume=0.6,"
        f"afade=t=in:d=0.4,afade=t=out:st={TOTAL - 1.6:.2f}:d=1.6[music]"
    )
    f.append("[2:a]volume=1.0[synth]")
    inputs = ["-i", SRC["rosa"], "-i", A / "musica.m4a", "-i", OUT / "sfx.wav"]
    labels = []
    for k, (name, s_in, d, t0, g) in enumerate(SFX_FILES):
        inputs += ["-i", SFX_DIR / f"{name}.m4a"]
        f.append(
            f"[{3 + k}:a]atrim=start={s_in}:duration={d},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
            f"afade=t=out:st={max(0.0, d - 0.08):.3f}:d=0.08,volume={g},adelay={int(t0 * 1000)}|{int(t0 * 1000)}[x{k}]"
        )
        labels.append(f"[x{k}]")
    n = 3 + len(labels)
    f.append(f"[voice][music][synth]{''.join(labels)}amix=inputs={n}:normalize=0:duration=first,alimiter=limit=0.9[mix]")
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
         f"[1:v]scale={W}:{H}[o];[0:v][o]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
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
