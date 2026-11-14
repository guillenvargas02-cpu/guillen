"""Recorta los clips del taller al tramo que usa el video (clips.json) -> assets/clips/<id>.mp4.

Las fuentes viven en .cache/fuente/<nombre>.mp4 (no se versionan): los originales 8K del celular se
transcodificaron a 2160x3840, 30 fps y sin audio con
  ffmpeg -i original.mp4 -an -vf "fps=30,scale=2160:3840:flags=lanczos" -c:v libx264 -crf 18 fuente.mp4
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
clips = {k: v for k, v in json.loads((ROOT / "clips.json").read_text()).items() if not k.startswith("_")}
for k, v in clips.items():
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(v["src"]), "-i", ROOT / ".cache" / "fuente" / f"{v['fuente']}.mp4",
                    "-t", str(v["dur"]), "-an", "-vf", "fps=30", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
                    "-pix_fmt", "yuv420p", ROOT / "assets" / "clips" / f"{k}.mp4"], check=True)
    print(k)
