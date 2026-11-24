#!/usr/bin/env python3
"""Divide el recap en 3 partes de < 10 MB cada una, con cortes donde no se interrumpe nada:

  parte 1  0.00–11.93 s  cortinilla + "…el proyecto de SOMOS," (termina la frase; corte en cambio de toma)
  parte 2 11.97–22.10 s  "Entonces estuvimos muy contentos…" + la nota + 4 fotos (empieza con cambio de toma,
                         ya sin el subtítulo anterior, 26 ms antes de que hable; termina en un tramo de solo música)
  parte 3 22.10–33.87 s  la 5ª foto entra completa (con su efecto) → "para que la próxima edición…" → cierre y logo

4K vertical en HEVC (etiqueta hvc1 para iPhone/Instagram), dos pasadas con tamaño objetivo; AAC 160 kb/s.
Uso: python3 split.py [renders/albercada-somos-recap-4k.mp4]
"""
import subprocess
import sys
from pathlib import Path

FPS = 30
PARTS = [(0, 358), (359, 663), (663, 1016)]  # cuadros [inicio, fin)
TARGET_BYTES = 9.3e6  # margen bajo 10 MB
AUDIO_BPS = 160_000
OUT = Path(__file__).resolve().parent / "renders"


def run(cmd):
    subprocess.run([str(c) for c in cmd], check=True)


def main(src, only=None):
    for k in range(3):
        if only and k + 1 not in only:
            continue
        f0, f1 = PARTS[k]
        t0, dur = f0 / FPS, (f1 - f0) / FPS
        vbps = int(TARGET_BYTES * 8 / dur - AUDIO_BPS - 120_000)  # 120k de margen para el contenedor
        fade_in = 0.0 if k == 0 else 0.010           # solo evita un chasquido; no se pierde nada
        fade_out = [0.04, 0.20, 0.0][k]              # parte 1 termina justo después de "SOMOS,"
        af = f"atrim=start={t0}:duration={dur},asetpts=PTS-STARTPTS"
        if fade_in:
            af += f",afade=t=in:d={fade_in}"
        if fade_out:
            af += f",afade=t=out:st={dur - fade_out:.3f}:d={fade_out}"
        vf = f"trim=start_frame={f0}:end_frame={f1},setpts=PTS-STARTPTS"
        out = OUT / f"albercada-somos-parte{k + 1}-4k.mp4"
        log = OUT / f".x265_parte{k + 1}"
        common = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-c:v", "libx265", "-preset", "slow",
                  "-b:v", str(vbps), "-pix_fmt", "yuv420p", "-tag:v", "hvc1",
                  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
        run(common + ["-x265-params", f"pass=1:stats={log}.log:log-level=error", "-an", "-f", "mp4", "/dev/null"])
        run(common + ["-x265-params", f"pass=2:stats={log}.log:log-level=error", "-af", af,
                      "-c:a", "aac", "-b:a", str(AUDIO_BPS), "-ar", "48000", "-ac", "2",
                      "-movflags", "+faststart", out])
        print(f"parte {k + 1}: {t0:.2f}–{t0 + dur:.2f} s  {out.stat().st_size / 1e6:.2f} MB  ({vbps / 1e6:.1f} Mb/s)", flush=True)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.isdigit()]
    only = [int(a) for a in sys.argv[1:] if a.isdigit()]  # p. ej. `python3 split.py 2` rehace solo la parte 2
    main(args[0] if args else str(OUT / "albercada-somos-recap-4k.mp4"), only)
