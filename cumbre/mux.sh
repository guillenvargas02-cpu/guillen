#!/usr/bin/env bash
# Une los tramos renderizados (FFV1 sin pérdida) + audio y entrega el MP4 final en 4K.
set -euo pipefail
W=${CUMBRE_WORK:-/tmp/claude-0/-home-user-guillen/e79892bd-5db3-5f50-b81b-f961e67b318d/scratchpad/work}
OUT=${1:-$W/cumbre_mexico_highlights_4k.mp4}
ls "$W"/video_*.mkv | sort | sed "s|^|file '|; s|$|'|" > "$W/parts.txt"
cat "$W/parts.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$W/parts.txt" -i "$W/audio.wav" \
  -map 0:v -map 1:a \
  -vf "scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 -maxrate 50M -bufsize 100M -profile:v high -level:v 5.2 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:deblock=-1,-1" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 320k -ar 48000 -t 34.5 -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
# vista previa ligera 1080x1920 para revisar desde el celular
ffmpeg -v error -y -i "$OUT" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -movflags +faststart "${OUT%.mp4}_preview_1080p.mp4"
