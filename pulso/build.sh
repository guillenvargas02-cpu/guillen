#!/usr/bin/env bash
# Renderiza la animación y la codifica en dos versiones a la vez:
#   renders/PULSO-360-Electoral_8K_60fps_HEVC.mp4  (7680x4320, HEVC 10 bits — master)
#   renders/PULSO-360-Electoral_4K_60fps_H264.mp4  (3840x2160, H.264 — máxima compatibilidad)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders
node render.mjs --scale 4 --fps 60 --pipe 1 --workers 4 2> renders/render.log | \
ffmpeg -hide_banner -loglevel warning -y -f image2pipe -framerate 60 -c:v png -i - \
  -filter_complex "[0:v]split=2[a][b];[a]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p10le[v8];[b]scale=3840:2160:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p[v4]" \
  -map "[v8]" -c:v libx265 -preset medium -crf 18 \
    -x265-params "log-level=error:aq-mode=3:colorprim=bt709:transfer=bt709:colormatrix=bt709" \
    -tag:v hvc1 -movflags +faststart renders/PULSO-360-Electoral_8K_60fps_HEVC.mp4 \
  -map "[v4]" -c:v libx264 -preset slow -crf 15 -profile:v high -level 5.2 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -movflags +faststart renders/PULSO-360-Electoral_4K_60fps_H264.mp4
