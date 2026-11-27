#!/usr/bin/env python3
"""Divide el video final en 3 partes de menos de 10 MB cada una.

Cortes en cambios de plano que caen en beat (frames 361 y 722 del render) y sin cortar ningún texto.
Se codifica desde el máster sin pérdida (FFV1) + audio.wav, a 1080x1920 en dos pasadas con el bitrate
justo para quedar en ~9.4 MB: a ese peso, 1080p se ve mucho mejor que 4K.
"""
import os
import subprocess
from pathlib import Path

W = Path(os.environ.get("CUMBRE_WORK", "/tmp/claude-0/-home-user-guillen/e79892bd-5db3-5f50-b81b-f961e67b318d/scratchpad/work"))
FPS = 30
CUTS = [(0, 361), (361, 722), (722, 1111)]  # frames [inicio, fin)
TARGET_BYTES = 9.4e6
A_KBPS = 160

parts = sorted(W.glob("video_*.mkv"))
(W / "parts.txt").write_text("".join(f"file '{p}'\n" for p in parts))
for i, (a, b) in enumerate(CUTS, 1):
    dur = (b - a) / FPS
    v_kbps = int((TARGET_BYTES * 8 / dur) / 1000 * 0.985 - A_KBPS)
    out = W / f"cumbre_parte_{i}_de_3.mp4"
    vf = (f"trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,"
          "scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,format=yuv420p")
    af = (f"atrim=start={a / FPS:.6f}:end={b / FPS:.6f},asetpts=PTS-STARTPTS,"
          f"afade=t=in:d=0.012,afade=t=out:st={dur - 0.012:.6f}:d=0.012")
    common = ["-f", "concat", "-safe", "0", "-i", str(W / "parts.txt"), "-i", str(W / "audio.wav"),
              "-vf", vf, "-c:v", "libx264", "-preset", "slower", "-b:v", f"{v_kbps}k",
              "-maxrate", f"{int(v_kbps * 1.8)}k", "-bufsize", f"{int(v_kbps * 2)}k",
              "-profile:v", "high", "-level:v", "4.2", "-x264-params", "aq-mode=3",
              "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
    log = str(W / f"x264_p{i}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *common, "-pass", "1", "-passlogfile", log, "-an", "-f", "null", "-"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", *common, "-pass", "2", "-passlogfile", log, "-af", af,
                    "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", f"{A_KBPS}k", "-ar", "48000",
                    "-movflags", "+faststart", str(out)], check=True)
    print(out.name, f"{dur:.2f}s", f"video {v_kbps} kbps", f"{out.stat().st_size / 1e6:.2f} MB")
