#!/usr/bin/env python3
"""Arma el video de COBERTURA de SOMOS (vertical 4K, 30 fps, 29.9 s).

1. base.mp4   — tomas de la entrevista con ffmpeg a 2160x3840 nativo: cortes en los beats,
                punch-ins con zoom suave por fotograma, sacudida en los compases de tensión
                y gradación de color. Donde va el photo dump, negro (las fotos son de Hyperframes).
2. stills     — fotos y fotogramas congelados con la misma gradación para el photo dump.
3. audio.wav  — la canción completa (124 BPM, sin recortes) más efectos de sonido sintetizados
                (sfx.py): impactos, whooshes, obturador, latidos, platillo en reversa.
4. final      — compone la capa gráfica de Hyperframes (png-sequence RGBA) encima y entrega el MP4.

Uso:
  python3 build.py base stills audio
  npx hyperframes render --format png-sequence --fps 30 --resolution portrait-4k -o renders/overlay
  python3 build.py final
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
FPS = 30
W, H = 2160, 3840
TOTAL = 29.90

# Rejilla musical en tiempo de video (la canción entra completa, sin recortes): 124 BPM,
# drop en 2.68 s, quiebre de bajo en g(36), regreso en g(44), final en g(50).
BEAT = 60 / 124
D1 = 2.68


def g(k):
    return round(D1 + k * BEAT, 3)


B_IN, R_IN, LOGO = g(36), g(44), g(50)  # 20.099, 23.970, 26.874

# (fuente, entrada en la fuente, inicio, fin, zoom inicial, zoom final, foco x, foco y, golpe, sacudida, curva)
#   golpe: punch-in que decae al entrar (impacto del corte); sacudida: amplitud en px a 4K;
#   curva: "lin" | "in" (acelera: tensión)
EDL = [
    ("A", 0.70, 0.000, g(4), 1.00, 1.07, 0.50, 0.42, 0.00, 0, "lin"),  # bajo la cortinilla: entra por la O
    ("B", 0.30, g(4), g(8), 1.05, 1.12, 0.32, 0.36, 0.08, 0, "lin"),  # perfil con el micrófono
    ("A", 11.60, g(8), g(10), 1.22, 1.28, 0.62, 0.62, 0.10, 0, "lin"),  # mano del reportero y micro
    ("C", 0.30, g(10), g(12), 1.10, 1.16, 0.45, 0.40, 0.10, 0, "lin"),  # cámara de TV en primer plano
    ("B", 2.80, g(12), g(16), 1.02, 1.30, 0.30, 0.33, 0.06, 8, "in"),  # empuje hacia el photo dump
    ("black", 0, g(16), g(32), 1, 1, 0.5, 0.5, 0, 0, "lin"),  # photo dump (capa gráfica)
    ("C", 5.30, g(32), g(34), 1.00, 1.05, 0.45, 0.40, 0.00, 0, "lin"),  # sale de la foto: el gesto
    ("A", 3.90, g(34), B_IN, 1.25, 1.30, 0.52, 0.36, 0.10, 0, "lin"),
    # Quiebre de bajo: se apaga el color, entran barras y todo se cierra a negro
    ("A", 6.00, B_IN, g(40), 1.12, 1.22, 0.52, 0.34, 0.06, 0, "lin"),
    ("C", 12.70, g(40), R_IN, 1.00, 1.30, 0.47, 0.36, 0.00, 6, "in"),
    # Regreso: ráfaga a todo color, un corte por beat
    ("A", 5.00, g(44), g(45), 1.28, 1.32, 0.52, 0.34, 0.14, 6, "lin"),
    ("C", 6.00, g(45), g(46), 1.15, 1.20, 0.45, 0.38, 0.14, 6, "lin"),
    ("B", 1.50, g(46), g(47), 1.22, 1.26, 0.28, 0.34, 0.14, 6, "lin"),
    ("A", 12.30, g(47), g(48), 1.20, 1.25, 0.58, 0.60, 0.14, 6, "lin"),
    ("C", 9.50, g(48), g(49), 1.32, 1.36, 0.46, 0.34, 0.14, 6, "lin"),
    ("B", 4.20, g(49), LOGO, 1.15, 1.20, 0.27, 0.34, 0.14, 6, "lin"),
    ("C", 14.70, LOGO, 28.00, 1.10, 1.50, 0.46, 0.36, 0.00, 0, "in"),  # se ve por la O mientras se aleja
    ("white", 0, 28.00, TOTAL, 1, 1, 0.5, 0.5, 0, 0, "lin"),  # bajo el logo final
]

# Gradación: contraste de estudio, un poco más de color en el cempasúchil, sombras frías y altas cálidas
GRADE = (
    "eq=contrast=1.10:saturation=1.14:gamma=0.96:brightness=-0.015,"
    "colorbalance=rs=-0.03:bs=0.04:rh=0.04:bh=-0.03,"
    "curves=master='0/0 0.25/0.22 0.75/0.78 1/0.98'"
)


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…", flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def zoom_expr(z0, z1, dur, bump, curve):
    p = f"min(t/{dur:.4f},1)"
    ease = p if curve == "lin" else f"({p})*({p})*({p})"
    z = f"({z0}+({z1 - z0:.4f})*{ease})"
    if bump:
        z = f"({z}*(1+{bump}*exp(-t/0.09)))"
    return z


def build_base():
    inputs, parts = [], []
    for i, (src, s_in, t0, t1, z0, z1, fx, fy, bump, shake, curve) in enumerate(EDL):
        n0, n1 = round(t0 * FPS), round(t1 * FPS)
        dur = (n1 - n0) / FPS
        if src in ("black", "white"):
            inputs += ["-f", "lavfi", "-i", f"color=c={src}:s={W}x{H}:r={FPS}:d={dur:.4f}"]
            parts.append(f"[{i}:v]format=yuv420p,setsar=1,settb=1/{FPS}[s{i}]")
            continue
        inputs += ["-i", A / "footage" / f"{src}.mp4"]
        z = zoom_expr(z0, z1, dur, bump, curve)
        sx = sy = "0"
        if shake:
            amp = f"{shake}*(0.4+0.6*min(t/{dur:.3f},1))"
            sx = f"{amp}*sin(t*47)*cos(t*13)"
            sy = f"{amp}*sin(t*39+1.3)"
        parts.append(
            f"[{i}:v]trim=start={s_in:.3f}:duration={dur + 0.2:.3f},setpts=PTS-STARTPTS,fps={FPS},"
            f"scale=w='2*trunc({W}*{z}/2)':h='2*trunc({H}*{z}/2)':eval=frame:flags=lanczos,"
            f"crop={W}:{H}:x='clip((in_w-{W})*{fx}+{sx},0,in_w-{W})':y='clip((in_h-{H})*{fy}+{sy},0,in_h-{H})',"
            f"trim=end_frame={n1 - n0},setpts=PTS-STARTPTS,format=yuv420p,setsar=1,settb=1/{FPS}[s{i}]"
        )
    labels = "".join(f"[s{i}]" for i in range(len(EDL)))
    graph = parts + [
        f"{labels}concat=n={len(EDL)}:v=1:a=0,{GRADE},"
        # Quiebre: el color se va apagando y vuelve de golpe con la canción
        f"hue=s='1-0.72*clip((t-{B_IN})/{R_IN - B_IN:.3f},0,1)*lt(t,{R_IN})',"
        "vignette=angle=PI/5.5,format=yuv420p[v]"
    ]
    run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-t", TOTAL, "-c:v", "libx264", "-crf", "12", "-preset", "medium",
         "-pix_fmt", "yuv420p", OUT / "base.mp4"]
    )


def build_stills():
    """Fotos y congelados con la gradación del footage (el último sale exacto de base.mp4)."""
    gd = A / "photos" / "graded"
    gd.mkdir(exist_ok=True)
    for f in sorted((A / "photos").glob("*.jpg")):
        run(["ffmpeg", "-v", "error", "-y", "-i", f, "-vf",
             f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{GRADE}",
             "-q:v", "2", gd / f.name])
    # Fotograma exacto de la toma que sigue al photo dump: la foto se convierte en video sin salto
    t = (round(g(32) * FPS) + 0.5) / FPS
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.4f}", "-i", OUT / "base.mp4", "-frames:v", "1",
         "-q:v", "2", gd / "handoff_C.jpg"])


def build_audio():
    run(["python3", ROOT / "sfx.py", OUT])


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
         "[0:v][1:v]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         # Formato Reels/TikTok: H.264 High 5.1, yuv420p, 30 fps, AAC 48 kHz estéreo, moov al inicio
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M", "-g", "30",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "somos-cobertura-4k.mp4"]
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = {"base": build_base, "stills": build_stills, "audio": build_audio, "final": build_final}
    for s in sys.argv[1:] or ["base", "stills", "audio", "final"]:
        steps[s]()
