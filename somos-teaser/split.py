#!/usr/bin/env python3
"""Divide el teaser en 3 fragmentos (cortes en cambios de toma, sobre golpes de la música) de < 10 MB cada uno.

4K vertical en HEVC (etiqueta hvc1 para iPhone/Instagram), dos pasadas con tamaño objetivo; AAC 160 kb/s.
Uso: python3 split.py renders/SOMOS_teaser_v10_4K.mp4
"""
import subprocess
import sys
from pathlib import Path

FPS = 30
CUTS = [0, 280, 554, 828]  # cuadros: 0–9.33 s | 9.33–18.47 s | 18.47–27.6 s
TARGET_BYTES = 9.3e6  # margen bajo 10 MB
AUDIO_BPS = 160_000
OUT = Path(__file__).resolve().parent / "renders"


def run(cmd):
    subprocess.run([str(c) for c in cmd], check=True)


def main(src):
    for k in range(3):
        f0, f1 = CUTS[k], CUTS[k + 1]
        t0, dur = f0 / FPS, (f1 - f0) / FPS
        vbps = int(TARGET_BYTES * 8 / dur - AUDIO_BPS - 120_000)  # 120k de margen para el contenedor
        fade_in = 0.0 if k == 0 else 0.010
        fade_out = 0.20 if k < 2 else 0.0
        af = f"atrim=start={t0}:duration={dur},asetpts=PTS-STARTPTS"
        if fade_in:
            af += f",afade=t=in:d={fade_in}"
        if fade_out:
            af += f",afade=t=out:st={dur - fade_out:.3f}:d={fade_out}"
        vf = f"trim=start_frame={f0}:end_frame={f1},setpts=PTS-STARTPTS"
        out = OUT / f"SOMOS_teaser_parte{k + 1}_4K.mp4"
        log = OUT / f".x265_parte{k + 1}"
        common = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-c:v", "libx265", "-preset", "slow",
                  "-b:v", str(vbps), "-pix_fmt", "yuv420p", "-tag:v", "hvc1",
                  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
        run(common + ["-x265-params", f"pass=1:stats={log}.log:log-level=error", "-an", "-f", "mp4", "/dev/null"])
        run(common + ["-x265-params", f"pass=2:stats={log}.log:log-level=error", "-af", af,
                      "-c:a", "aac", "-b:a", str(AUDIO_BPS), "-ar", "48000", "-ac", "2",
                      "-movflags", "+faststart", out])
        print(f"parte {k + 1}: {t0:.2f}–{t0 + dur:.2f} s  {out.stat().st_size / 1e6:.2f} MB  ({vbps / 1e6:.1f} Mb/s)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(OUT / "SOMOS_teaser_v10_4K.mp4"))
