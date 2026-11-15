#!/usr/bin/env python3
"""Propuesta 2 · teaser de la primera sesión (29.5 s).

Pasos:
  frames  — cuadros de assets/clips/teaser-footage.mp4 en .cache/teaser/ (tools/teaser_footage.py lo arma)
  sfx     — efectos sintetizados (tools/sfx_teaser.py) -> renders/teaser-sfx.wav
  audio   — música desde el build (el drop cae en 6.0 s) + efectos, -14 LUFS -> renders/teaser-audio.wav
  visual  — render de teaser.html a 2160x3840 (visual:1 para 1080x1920)
  final   — renders/somos-taller-teaser.mp4

Uso: python3 build_teaser.py [frames sfx audio visual final]
"""
import subprocess
import sys
from pathlib import Path

import build

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "renders"
DUR = 29.5
# (inicio, fin) en la canción: build de 6 s (celular + gancho), drop en 6.0 s; el corte a 26.0 s cae en el outro
MUSIC = [(9.56, 35.56), (79.56, 83.06)]
FADE = (28.2, DUR)


def frames():
    d = ROOT / ".cache" / "teaser"
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.jpg"):
        f.unlink()
    build.run(["ffmpeg", "-v", "error", "-y", "-i", ROOT / "assets" / "clips" / "teaser-footage.mp4", "-q:v", "3", d / "%05d.jpg"])


def sfx():
    build.run([sys.executable, ROOT / "tools" / "sfx_teaser.py"])


def audio():
    f, labels = [], []
    for i, (a, b) in enumerate(MUSIC):
        d = b - a
        f.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.3f}:d=0.012[m{i}]")
        labels.append(f"[m{i}]")
    f.append(f"{''.join(labels)}concat=n={len(MUSIC)}:v=0:a=1,aresample=48000,volume=0.75,afade=t=out:st={FADE[0]}:d={FADE[1] - FADE[0]}[mus]")
    f.append("[1:a]aresample=48000,volume=0.95[fx]")
    f.append(f"[mus][fx]amix=inputs=2:normalize=0:duration=first,atrim=duration={DUR},alimiter=limit=0.9[mix]")
    build.run(["ffmpeg", "-v", "error", "-y", "-i", ROOT / "assets" / "musica.m4a", "-i", OUT / "teaser-sfx.wav",
               "-filter_complex", ";".join(f), "-map", "[mix]", "-ac", "2", "-ar", "48000", OUT / "teaser-mix.wav"])
    build.run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "teaser-mix.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11",
               "-ar", "48000", OUT / "teaser-audio.wav"])


def visual(scale=2, jobs=4):
    n = round(DUR * 30)
    cuts = [round(n * k / jobs) / 30 for k in range(jobs + 1)]
    procs = [subprocess.Popen([str(c) for c in ["node", ROOT / "render.mjs", "--page", "teaser.html", "--video", OUT / f"tpart-{k}.mp4",
                               "--scale", scale, "--from", f"{cuts[k]:.4f}", "--to", f"{cuts[k + 1]:.4f}"] + (["--jpeg"] if scale > 1 else [])],
                              cwd=ROOT, stdout=subprocess.DEVNULL) for k in range(jobs)]
    if any(p.wait() for p in procs):
        sys.exit("falló un tramo del render")
    lst = OUT / "tparts.txt"
    lst.write_text("".join(f"file 'tpart-{k}.mp4'\n" for k in range(jobs)))
    build.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", OUT / "teaser-visual.mp4"])
    for k in range(jobs):
        (OUT / f"tpart-{k}.mp4").unlink()
    lst.unlink()


def final():
    build.run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "teaser-visual.mp4", "-i", OUT / "teaser-audio.wav",
               "-map", "0:v", "-map", "1:a", "-t", str(DUR),
               "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
               "-pix_fmt", "yuv420p", "-maxrate", "50M", "-bufsize", "100M",
               "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
               "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
               OUT / "somos-taller-teaser.mp4"])


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for s in sys.argv[1:] or ["frames", "sfx", "audio", "visual", "final"]:
        if s.startswith("visual"):
            visual(int(s.split(":")[1]) if ":" in s else 2)
        else:
            {"frames": frames, "sfx": sfx, "audio": audio, "final": final}[s]()
