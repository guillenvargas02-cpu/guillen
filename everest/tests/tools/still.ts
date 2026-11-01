// Fotograma rápido de la postal (capa gráfica + un cuadro del video), para revisión de diseño:
//   npx tsx tests/tools/still.ts <salida.png> <formato> "<nombre>" "<frase>"
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { renderOverlayPng, SOURCE_VIDEO } from '../../src/postcard/render';
import { ffmpegGeometry, TIMING } from '../../src/postcard/compose';
const [out = '/tmp/still.png', format = 'vertical', name = 'María José Hernández', phrase = 'La cima se construye en equipo.'] = process.argv.slice(2);
const { png, layout } = renderOverlayPng({ name, phrase, format: format as 'vertical' });
fs.writeFileSync('/tmp/_overlay.png', png);
const g = ffmpegGeometry(layout);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(TIMING.sourceStart + TIMING.pngAt), '-i', SOURCE_VIDEO, '-i', '/tmp/_overlay.png', '-filter_complex',
  `[0:v]scale=${g.scale.w}:${g.scale.h},crop=${g.crop.w}:${g.crop.h}:${g.crop.x}:${g.crop.y},pad=${g.size.w}:${g.size.h}:${g.place.x}:${g.place.y}:color=white[v];[v][1:v]overlay=0:0[o]`,
  '-map', '[o]', '-frames:v', '1', out]);
console.log(out, JSON.stringify(layout.videoBox));
