#!/usr/bin/env bash
# Mezcla del recap: música desde 6.157 s (beat 10 de la pista, 99.4 BPM) para que el drop de 10.99 s
# caiga en 4.830 s; el obturador entra en 4.603 s (su golpe está a 0.26 s → suena 1 fotograma
# después del flash de 4.830 s). Salida normalizada a -14 LUFS / -1 dBTP.
set -euo pipefail
cd "$(dirname "$0")/.."
TOTAL=36.223
ffmpeg -v error -y -i assets/audio/musica.m4a -i assets/audio/sfx-obturador.m4a -filter_complex "\
[0:a]atrim=start=6.157:duration=${TOTAL},asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.03,afade=t=out:st=34.95:d=1.27,volume=0.62[m];\
[1:a]aresample=48000,pan=stereo|c0=c0|c1=c1,volume=1.15,adelay=4603|4603,apad=whole_dur=${TOTAL}[s];\
[m][s]amix=inputs=2:normalize=0:duration=first[mx];\
[mx]loudnorm=I=-14:TP=-1.5:LRA=9:linear=true[o]" -map "[o]" -ar 48000 -ac 2 -c:a pcm_s16le assets/audio/mezcla.wav
