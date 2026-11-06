#!/usr/bin/env python3
"""Arma el video de COBERTURA de SOMOS (vertical 4K, 30 fps, 29.9 s).

1. base.mp4   — tomas de la entrevista con ffmpeg a 2160x3840 nativo: cortes en los beats,
                punch-ins con zoom suave por fotograma, sacudida en los compases de tensión
                y gradación de color. Donde va el photo dump, negro (las fotos son de Hyperframes).
2. stills     — fotos y fotogramas congelados con la misma gradación para el photo dump.
3. audio.wav  — la pista 2 recortada 4 compases (empalme en la rejilla de 123 BPM), filtro
                pasabajos y silencio de suspenso antes del golpe final, más efectos de sonido
                sintetizados (sfx.py): impactos, whooshes, obturador, platillo en reversa.
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

# Rejilla musical en tiempo de video: golpe 1 (H1) en 3.40 s, 123 BPM.
BEAT = 0.487875
H1 = 3.40


def b(k):
    return round(H1 + k * BEAT, 3)


H2, H3 = b(16), b(48)  # 11.206 (photo dump) y 26.818 (logo final)

# (fuente, entrada en la fuente, inicio, fin, zoom inicial, zoom final, foco x, foco y, golpe, sacudida, curva)
#   golpe: punch-in que decae al entrar (impacto del corte); sacudida: amplitud en px a 4K;
#   curva: "lin" | "in" (acelera: tensión)
EDL = [
    ("A", 0.00, 0.000, b(4), 1.00, 1.07, 0.50, 0.42, 0.00, 0, "lin"),  # bajo la cortinilla: entra por la O
    ("B", 0.30, b(4), b(8), 1.05, 1.12, 0.32, 0.36, 0.08, 0, "lin"),  # perfil con el micrófono
    ("A", 11.60, b(8), b(10), 1.22, 1.28, 0.62, 0.62, 0.10, 0, "lin"),  # mano del reportero y micro
    ("C", 0.30, b(10), b(12), 1.10, 1.16, 0.45, 0.40, 0.10, 0, "lin"),  # cámara de TV en primer plano
    ("B", 2.80, b(12), H2, 1.02, 1.34, 0.30, 0.33, 0.06, 10, "in"),  # tensión hacia el golpe 2
    ("black", 0, H2, b(32), 1, 1, 0.5, 0.5, 0, 0, "lin"),  # photo dump (capa gráfica)
    ("C", 5.30, b(32), b(36), 1.00, 1.09, 0.45, 0.40, 0.00, 0, "lin"),  # sale de la foto: el gesto
    ("A", 3.90, b(36), b(38), 1.25, 1.30, 0.52, 0.36, 0.10, 0, "lin"),
    ("B", 3.60, b(38), b(40), 1.18, 1.24, 0.30, 0.33, 0.10, 0, "lin"),
    ("A", 12.60, b(40), b(41), 1.12, 1.16, 0.55, 0.55, 0.12, 4, "lin"),  # ráfaga en cada beat
    ("C", 9.00, b(41), b(42), 1.28, 1.32, 0.45, 0.36, 0.12, 4, "lin"),
    ("B", 5.00, b(42), b(43), 1.12, 1.16, 0.25, 0.35, 0.12, 4, "lin"),
    ("C", 1.50, b(43), b(44), 1.35, 1.40, 0.47, 0.34, 0.12, 4, "lin"),
    ("C", 12.70, b(44), 27.90, 1.00, 1.90, 0.47, 0.36, 0.00, 7, "in"),  # suspenso; tras el golpe se ve por la O
    ("white", 0, 27.90, TOTAL, 1, 1, 0.5, 0.5, 0, 0, "lin"),  # bajo el logo final
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
    t_desat = b(44)
    graph = parts + [
        f"{labels}concat=n={len(EDL)}:v=1:a=0,{GRADE},"
        # Compás de suspenso: el color se va apagando hacia el golpe final
        f"hue=s='1-0.75*clip((t-{t_desat})/{H3 - t_desat:.3f},0,1)',"
        "vignette=angle=PI/5.5,format=yuv420p[v]"
    ]
    run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-t", TOTAL, "-c:v", "libx264", "-crf", "12", "-preset", "medium",
         "-pix_fmt", "yuv420p", OUT / "base.mp4"]
    )


def build_stills():
    """Fotos y congelados con la gradación del footage (el último sale exacto de base.mp4)."""
    g = A / "photos" / "graded"
    g.mkdir(exist_ok=True)
    for f in sorted((A / "photos").glob("*.jpg")):
        run(["ffmpeg", "-v", "error", "-y", "-i", f, "-vf",
             f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{GRADE}",
             "-q:v", "2", g / f.name])
    # Fotograma exacto de la toma que sigue al photo dump: la foto se convierte en video sin salto
    t = (round(b(32) * FPS) + 0.5) / FPS
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.4f}", "-i", OUT / "base.mp4", "-frames:v", "1",
         "-q:v", "2", g / "handoff_C.jpg"])


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
