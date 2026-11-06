#!/usr/bin/env python3
"""Prepara el material del teaser "Panteón Dolores de noche" (México Retro).

  python3 build.py footage   # clips 480p de WhatsApp -> 1080x1920, limpieza y cámara lenta interpolada
  python3 build.py audio     # música y efectos de sonido diseñados a partir de la librería de Hyperframes
  npx hyperframes render --fps 30 --quality delivery -o renders/render.mp4
  python3 build.py master    # loudness para Reels -> renders/panteon-dolores-teaser.mp4

El color (look nocturno de terror) NO se hace aquí: vive en data-color-grading de cada <video>
(npx hyperframes media-treatment), editable en el preview.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "assets" / "source"
FOOT = ROOT / "assets" / "footage"
SFX = ROOT / "assets" / "sfx"
LIB = Path.home() / ".claude" / "skills" / "media-use" / "audio" / "assets" / "sfx"

# clip -> velocidad (1.0 = normal). Los lentos se interpolan a 60 fps antes de alargarse,
# así quedan fluidos a 30 fps en el render.
SPEED = {1: 0.6, 2: 0.75, 3: 1.0, 4: 0.75, 5: 0.75, 6: 0.6}


def run(cmd):
    print(" ".join(str(c) for c in cmd[:8]), "…")
    subprocess.run([str(c) for c in cmd], check=True)


def footage():
    FOOT.mkdir(parents=True, exist_ok=True)
    for i, speed in SPEED.items():
        chain = ["hqdn3d=2:1.5:3:3"]  # quita bloques de compresión de WhatsApp
        if speed != 1.0:
            chain += ["minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
                      f"setpts=PTS/{speed}"]
        chain += ["fps=30", "scale=1080:1920:flags=lanczos", "unsharp=5:5:0.6:5:5:0",
                  "format=yuv420p", "setsar=1"]
        run(["ffmpeg", "-v", "error", "-y", "-i", SRC / f"clip{i}.mp4", "-an", "-vf", ",".join(chain),
             "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-g", "15", "-movflags", "+faststart",
             FOOT / f"clip{i}.mp4"])


def sfx(name, src, af, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", LIB / src, "-af", af, "-ar", "48000", "-ac", "2"]
    if dur:
        cmd += ["-t", str(dur)]
    run(cmd + [SFX / f"{name}.wav"])


def audio():
    SFX.mkdir(parents=True, exist_ok=True)
    verb = "aecho=0.8:0.85:60|140|290|470:0.5|0.38|0.27|0.18"
    # Golpe grave de tráiler: el impacto bajado de tono, con cola de reverberación de nave.
    sfx("golpe-1", "impact-bass-1.mp3", f"asetrate=48000*0.72,aresample=48000,{verb},lowpass=f=5200,apad=pad_dur=1.5,afade=t=out:st=2.6:d=1.2")
    sfx("golpe-2", "impact-bass-2.mp3", f"asetrate=48000*0.8,aresample=48000,{verb},lowpass=f=6000,apad=pad_dur=1.5,afade=t=out:st=3.0:d=1.2")
    # Succión inversa (reverse reverb) que termina justo en el golpe del título.
    sfx("succion", "impact-bass-1.mp3", f"asetrate=48000*0.8,aresample=48000,apad=pad_dur=1.2,{verb},areverse,afade=t=in:d=1.2,atrim=end_sample=999999999")
    # Barrido lento y oscuro para cortes largos.
    sfx("barrido", "whoosh-cinematic.mp3", "asetrate=48000*0.7,aresample=48000,lowpass=f=3500,afade=t=out:st=6.5:d=1.4")
    # Corte seco del destello subliminal.
    sfx("destello", "whoosh.mp3", f"asetrate=48000*0.8,aresample=48000,{verb},highpass=f=120")
    # Eco del corte: el último compás antes del silencio, sonando en una nave vacía.
    run(["ffmpeg", "-v", "error", "-y", "-i", SRC / "musica.m4a", "-af",
         "atrim=start=20.54:end=20.94,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,apad=pad_dur=2.6,"
         "aecho=0.8:0.9:120|260|430|690|980:0.55|0.42|0.32|0.24|0.16,lowpass=f=4200,afade=t=out:st=1.2:d=1.6",
         "-ar", "48000", "-ac", "2", "-t", "3.0", SFX / "eco-corte.wav"])


def master():
    """Audio del render a -14 LUFS / -1 dBTP (Reels); el video se copia sin recomprimir."""
    src, out = ROOT / "renders" / "render.mp4", ROOT / "renders" / "panteon-dolores-teaser.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-c:v", "copy", "-af",
         "loudnorm=I=-14:TP=-1.0:LRA=11:linear=true", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
         "-movflags", "+faststart", out])


if __name__ == "__main__":
    for step in sys.argv[1:] or ["footage", "audio"]:
        {"footage": footage, "audio": audio, "master": master}[step]()
