#!/bin/bash
U=/root/.claude/uploads/55edaf88-889f-5488-977a-7b311e9e3b41
O=/home/user/guillen/somos-teaser/work/mezz
HLG="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,"
conv() { # id file hdr
  local vf="${3}scale=2160:3840:force_original_aspect_ratio=increase:flags=lanczos,crop=2160:3840,fps=30,format=yuv420p"
  ffmpeg -v error -y -i "$U/$2" -vf "$vf" -c:v libx264 -crf 10 -preset fast -an "$O/$1.mp4" && echo "ok $1"
}
conv A 0c2846f4-IMG_8097_1.MOV "$HLG" &
conv B 5a40c967-IMG_8114_1.MOV "$HLG" &
wait
conv C 3a97987c-IMG_8115_1.MOV "$HLG" &
conv D 9cdca5cc-IMG_8120_1.MOV "$HLG" &
wait
conv E 68eac635-20261117_163428_1.mp4 "" &
conv F af013db2-20261117_163233_1.mp4 "" &
wait
conv G 1b4f54c7-20261117_163217_1.mp4 "" &
conv H 2a1f3ad7-20261117_170555_1.mp4 "" &
wait
conv I 98f81749-20261117_171755_1.mp4 "" &
conv J a1e80d0a-IMG_8111.MOV "" &
wait
echo ALLDONE
# material adicional (17:32–17:40)
conv K 370ffb39-20261117_173204_4K.mp4 "" &
conv L c25de236-20261117_173909_4K.mp4 "" &
conv M a6fb5c3a-20261117_174057_4K.mp4 "" &
wait
