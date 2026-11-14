"""Teaser: junta en un solo archivo los tramos de video que usa teaser.json (en orden), a 1620x2880.

Fuente: .cache/fuente/<nombre>.mp4 (originales del taller transcodificados, sin audio). Salida versionada:
assets/clips/teaser-footage.mp4. El render toma los cuadros de ese archivo (build_teaser.py frames).
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30


def windows():
    """Lista ordenada de (fuente, segundo_inicio, n_cuadros), igual que la calcula teaser.html."""
    out = []
    for s in json.loads((ROOT / "teaser.json").read_text())["shots"]:
        parts = s["split"] if "split" in s else ([s] if "v" in s else [])
        for p in parts:
            n = round(s["d"] * s.get("sp", 1.0) * FPS) + 1
            out.append((p["v"], p["at"], n))
    return out


if __name__ == "__main__":
    tmp = ROOT / ".cache" / "teaser-tramos"
    tmp.mkdir(parents=True, exist_ok=True)
    lst = []
    for i, (src, at, n) in enumerate(windows()):
        f = tmp / f"{i:03d}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{at:.3f}", "-i", ROOT / ".cache" / "fuente" / f"{src}.mp4",
                        "-frames:v", str(n), "-an", "-vf", "fps=30,scale=1620:2880:flags=lanczos,setsar=1",
                        "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p", f], check=True)
        lst.append(f"file '{f}'\n")
    (tmp / "lista.txt").write_text("".join(lst))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", tmp / "lista.txt",
                    "-c", "copy", ROOT / "assets" / "clips" / "teaser-footage.mp4"], check=True)
    print(len(lst), "tramos")
