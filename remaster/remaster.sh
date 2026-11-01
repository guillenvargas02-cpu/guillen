#!/bin/bash
# remaster.sh SRC OUT  -> 2160x3840 (4K vertical), same fps/timestamps/colors/audio
set -e
ffmpeg -v error -stats -y -i "$1" -map 0:v:0 -map 0:a? -map_metadata 0 -fps_mode passthrough \
  -vf "scale=flags=lanczos+accurate_rnd+full_chroma_int+full_chroma_inp,format=yuv444p16le,hqdn3d=1.5:1.2:0:0,scale=2160:3840:flags=lanczos+accurate_rnd+full_chroma_int,cas=0.5,scale=flags=lanczos+accurate_rnd,format=yuv420p" \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level:v 5.2 -x264-params "aq-mode=3" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -video_track_timescale 600 -c:a copy -movflags +faststart "$2"
