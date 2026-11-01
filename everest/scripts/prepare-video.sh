#!/usr/bin/env bash
# Prepara las versiones ligeras del video para previsualización.
# El original 4K (assets/video/everest-original.mp4) se conserva intacto para las exportaciones.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=assets/video/everest-original.mp4
OUT=public/media
mkdir -p "$OUT"
# Previsualización: 1280×720, H.264, sin audio, faststart (~1 MB).
ffmpeg -v error -y -i "$SRC" -an -vf "scale=1280:-2:flags=lanczos,fps=30" \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  "$OUT/everest-preview-720.mp4"
# Póster para estados de carga y movimiento reducido.
ffmpeg -v error -y -ss 4 -i "$SRC" -frames:v 1 -vf "scale=1280:-2:flags=lanczos" -q:v 4 "$OUT/everest-poster.jpg"
# Fotografía editorial (encuadre panorámico de la cima).
ffmpeg -v error -y -ss 9 -i "$SRC" -frames:v 1 -vf "scale=2000:-2:flags=lanczos" -q:v 3 "$OUT/everest-cima.jpg"
ls -la "$OUT"
