#!/usr/bin/env python3
"""Arma el teaser del nuevo episodio de SOMOS Naturaleza.

1. base.mp4   — tomas de video del Izta con ffmpeg a 29.97 fps exactos (sin fotogramas repetidos);
                donde van fotos, negro (las fotos se animan en la capa de Hyperframes).
2. audio.wav  — la canción desde 1:11.05, con el corte de 1:38 y el golpe de 1:40.15 = "HOY 7:00 PM".
3. Compone la capa gráfica (png-sequence RGBA) encima y entrega el MP4 en 4K.

Uso:
  python3 build.py base audio
  npx hyperframes render --format png-sequence --fps 30000/1001 --resolution portrait-4k -o renders/overlay
  python3 build.py final
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT.parent / "reel" / "assets"  # mismo footage del reel
OUT = ROOT / "renders"
FPS = "30000/1001"
TOTAL = 34.50
SCALE = 2  # 4K

# (fuente, entrada, inicio en el teaser, fin, velocidad) — cortes en los beats (103 BPM, 0.58 s)
EDL = [
    ("black", 0.0, 0.00, 2.35, 1.0),  # foto del equipo (capa)
    ("IMG_1032", 0.40, 2.35, 4.69, 1.0),  # valle: UNA EXPEDICIÓN
    ("black", 0.0, 4.69, 7.06, 1.0),  # campamento y ladera (capa)
    ("IMG_1033", 3.00, 7.06, 8.22, 1.3),  # picos
    ("IMG_1046", 0.30, 8.22, 9.41, 1.0),  # nubes: +4,000 m
    ("black", 0.0, 9.41, 12.94, 1.0),  # escalada, rapel, cima (capa)
    ("IMG_1018", 1.00, 12.94, 15.28, 1.0),  # niebla: el glaciar
    ("black", 0.0, 15.28, 17.63, 1.0),  # estudio (capa)
    ("IMG_1015", 6.70, 17.63, 19.99, 1.0),  # Eduardo en la montaña
    ("IMG_1049", 0.20, 19.99, 22.36, 1.0),  # cuerda
    ("black", 0.0, 22.36, 24.71, 1.0),  # estudio (capa)
    ("IMG_1032", 4.50, 24.71, 25.29, 1.0),  # ráfaga de un beat cada una
    ("IMG_1046", 6.00, 25.29, 25.89, 1.0),
    ("IMG_1033", 0.30, 25.89, 26.47, 1.0),
    ("IMG_1018", 3.60, 26.47, 27.05, 1.0),
    ("black", 0.0, 27.05, TOTAL, 1.0),  # ESTA NOCHE + cierre (capa)
]
MUSIC_OFFSET = 71.05


def run(cmd):
    print(" ".join(str(c) for c in cmd[:6]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def build_base():
    inputs, parts = [], []
    for i, (src, s_in, t0, t1, speed) in enumerate(EDL):
        dur = t1 - t0
        if src == "black":
            inputs += ["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r={FPS}:d={dur:.3f}"]
            parts.append(f"[{i}:v]format=yuv420p,setsar=1,settb=1001/30000[s{i}]")
        else:
            inputs += ["-i", A / f"{src}.mp4"]
            parts.append(
                f"[{i}:v]trim=start={s_in:.3f}:duration={dur * speed:.3f},setpts=(PTS-STARTPTS)/{speed},"
                f"fps={FPS},format=yuv420p,setsar=1,settb=1001/30000[s{i}]"
            )
    labels = "".join(f"[s{i}]" for i in range(len(EDL)))
    graph = parts + [f"{labels}concat=n={len(EDL)}:v=1:a=0,trim=duration={TOTAL},setpts=PTS-STARTPTS[v]"]
    run(
        ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph), "-map", "[v]",
         "-r", FPS, "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p",
         OUT / "base.mp4"]
    )


def build_audio():
    run(
        ["ffmpeg", "-v", "error", "-y", "-i", ROOT / "assets" / "cancion.m4a",
         "-af", f"atrim=start={MUSIC_OFFSET}:duration={TOTAL},asetpts=PTS-STARTPTS,"
                f"afade=t=in:d=0.05,afade=t=out:st={TOTAL - 1.4:.2f}:d=1.4",
         "-ar", "48000", "-ac", "2", OUT / "mix_raw.wav"]
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
         f"[0:v]scale={1080 * SCALE}:{1920 * SCALE}:flags=lanczos[b];"
         "[b][1:v]overlay=0:0:format=auto:shortest=0,format=yuv420p,"
         "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v]",
         "-map", "[v]", "-map", "2:a", "-r", FPS, "-t", str(TOTAL),
         # Formato Reels: H.264 High 5.1, yuv420p, 29.97 fps, AAC 48 kHz estéreo, moov al inicio
         "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "60M", "-bufsize", "120M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "somos-naturaleza-teaser-4k.mp4"]
    )


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for s in sys.argv[1:] or ["base", "audio", "final"]:
        {"base": build_base, "audio": build_audio, "final": build_final}[s]()
