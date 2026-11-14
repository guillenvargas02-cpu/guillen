#!/usr/bin/env python3
"""Arma el video del taller (SOMOS · Comunicación Política en Acción).

Pasos:
  frames  — cuadros de los clips (celular, likes) en .cache/ para el seek exacto del render
  sfx     — diseño sonoro sintetizado (tools/sfx.py) -> renders/sfx.wav
  audio   — música editada al ritmo (120 BPM) + efectos, normalizada a -14 LUFS -> renders/audio.wav
  visual  — render de index.html cuadro a cuadro a 2160x3840 -> renders/visual.mp4
  final   — mezcla final -> renders/somos-taller-comunicacion-politica.mp4

Uso: python3 build.py [frames sfx audio visual final]   (sin argumentos: todo)
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
A = ROOT / "assets"
OUT = ROOT / "renders"
CACHE = ROOT / ".cache"
DUR = 29.5

# Música (audio_video_taller): 120.8 BPM, tiempos en x.06/x.56; el drop entra en 15.56 s y el outro en 79.56 s.
# (inicio en la canción, fin en la canción) en orden; quedan pegados en el video.
MUSIC = [
    (8.06, 15.56),   # 0.00–7.50  build del intro
    (15.56, 31.51),  # 7.50–23.45 drop: los cinco temas
    (79.51, 85.56),  # 23.45–29.50 outro: cierre con logotipos
]
MUSIC_FADE_OUT = (27.6, DUR)


def run(cmd):
    print("›", " ".join(str(c) for c in cmd[:8]), "…")
    subprocess.run([str(c) for c in cmd], check=True, cwd=ROOT)


def frames():
    """Cuadros de cada clip (clips.json) en .cache/<id>/ para el seek exacto del render."""
    import json
    clips = {k: v for k, v in json.loads((ROOT / "clips.json").read_text()).items() if not k.startswith("_")}
    for name in clips:
        d = CACHE / name
        if d.exists():
            for f in d.glob("*.jpg"):
                f.unlink()
        d.mkdir(parents=True, exist_ok=True)
        vf = "scale=1240:-2" if name == "likes" else "null"
        run(["ffmpeg", "-v", "error", "-y", "-i", A / "clips" / f"{name}.mp4", "-vf", vf, "-q:v", "3", d / "%04d.jpg"])


def sfx():
    run([sys.executable, ROOT / "tools" / "sfx.py"])


def audio():
    f, labels = [], []
    for i, (a, b) in enumerate(MUSIC):
        d = b - a
        f.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.3f}:d=0.012[m{i}]")
        labels.append(f"[m{i}]")
    fo0, fo1 = MUSIC_FADE_OUT
    f.append(f"{''.join(labels)}concat=n={len(MUSIC)}:v=0:a=1,aresample=48000,volume=0.72,"
             f"afade=t=out:st={fo0}:d={fo1 - fo0}[mus]")
    f.append("[1:a]aresample=48000,volume=0.95[fx]")
    f.append(f"[mus][fx]amix=inputs=2:normalize=0:duration=first,atrim=duration={DUR},alimiter=limit=0.9[mix]")
    run(["ffmpeg", "-v", "error", "-y", "-i", A / "musica.m4a", "-i", OUT / "sfx.wav",
         "-filter_complex", ";".join(f), "-map", "[mix]", "-ac", "2", "-ar", "48000", OUT / "mix_raw.wav"])
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11",
         "-ar", "48000", OUT / "audio.wav"])


def visual(scale=2, jobs=4):
    """Render en paralelo por tramos (cada tramo es determinista) y concatenación sin recomprimir."""
    n = round(DUR * 30)
    cuts = [round(n * k / jobs) / 30 for k in range(jobs + 1)]
    procs = []
    for k in range(jobs):
        cmd = ["node", ROOT / "render.mjs", "--video", OUT / f"part-{k}.mp4", "--scale", str(scale),
               "--from", f"{cuts[k]:.4f}", "--to", f"{cuts[k + 1]:.4f}"] + (["--jpeg"] if scale > 1 else [])
        procs.append(subprocess.Popen([str(c) for c in cmd], cwd=ROOT, stdout=subprocess.DEVNULL))
    if any(p.wait() for p in procs):
        sys.exit("falló un tramo del render")
    lst = OUT / "parts.txt"
    lst.write_text("".join(f"file 'part-{k}.mp4'\n" for k in range(jobs)))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", OUT / "visual.mp4"])
    for k in range(jobs):
        (OUT / f"part-{k}.mp4").unlink()
    lst.unlink()


def final():
    run(["ffmpeg", "-v", "error", "-y", "-i", OUT / "visual.mp4", "-i", OUT / "audio.wav",
         "-map", "0:v", "-map", "1:a", "-t", str(DUR),
         # Formato Reels/TikTok: H.264 High, yuv420p, 30 fps, AAC 48 kHz estéreo, moov al inicio
         "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-profile:v", "high", "-level", "5.1",
         "-pix_fmt", "yuv420p", "-maxrate", "50M", "-bufsize", "100M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
         OUT / "somos-taller-comunicacion-politica.mp4"])


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    steps = sys.argv[1:] or ["frames", "sfx", "audio", "visual", "final"]
    for s in steps:
        if s.startswith("visual"):
            visual(int(s.split(":")[1]) if ":" in s else 2)
        else:
            {"frames": frames, "sfx": sfx, "audio": audio, "final": final}[s]()
