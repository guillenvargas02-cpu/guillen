#!/usr/bin/env bash
# 1) Renderiza los 600 fotogramas 8K a PNG (renders/frames8k, ~30 GB temporales)
# 2) Codifica por separado (evita quedarse sin memoria):
#    renders/PULSO-360-Electoral_8K_60fps_HEVC.mp4  (7680x4320, HEVC 10 bits — master)
#    renders/PULSO-360-Electoral_4K_60fps_H264.mp4  (3840x2160, H.264 — máxima compatibilidad)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders/frames8k
node render.mjs --scale 4 --fps 60 --workers 3 --out renders/frames8k
IN=(-hide_banner -loglevel warning -y -framerate 60 -i renders/frames8k/f%05d.png)
ffmpeg "${IN[@]}" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p10le" \
  -c:v libx265 -preset medium -crf 18 \
  -x265-params "log-level=error:aq-mode=3:frame-threads=2:colorprim=bt709:transfer=bt709:colormatrix=bt709" \
  -tag:v hvc1 -movflags +faststart renders/PULSO-360-Electoral_8K_60fps_HEVC.mp4
ffmpeg "${IN[@]}" -vf "scale=3840:2160:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 -profile:v high -level 5.2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart renders/PULSO-360-Electoral_4K_60fps_H264.mp4
[ "${KEEP_FRAMES:-0}" = 1 ] || rm -rf renders/frames8k
