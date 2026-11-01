// Render de la postal en el servidor: capa gráfica con @napi-rs/canvas (mismo módulo
// compose.ts que la previsualización) + composición y codificación con FFmpeg.
// Salida: MP4 H.264 (High), yuv420p, 30 fps, 8 s exactos (240 cuadros), sin audio; y PNG.
import { createCanvas, GlobalFonts, Path2D } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { computeLayout, drawOverlay, ffmpegGeometry, TIMING, type Ctx, type PathCtor, type PostcardInput } from './compose';

const ROOT = process.cwd();
export const SOURCE_VIDEO = process.env.POSTAL_SOURCE_VIDEO || path.join(ROOT, 'assets/video/everest-original.mp4');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

let fontsReady = false;
export function ensureFonts() {
  if (fontsReady) return;
  for (const w of [400, 500, 600, 700]) {
    const file = path.join(ROOT, `assets/fonts/HindSiliguri-${w}.ttf`);
    if (!fs.existsSync(file)) throw new Error(`Falta la fuente ${file}`);
    GlobalFonts.registerFromPath(file, 'Hind Siliguri');
  }
  fontsReady = true;
}

export function renderOverlayPng(input: PostcardInput) {
  ensureFonts();
  const probe = createCanvas(10, 10).getContext('2d') as unknown as Ctx;
  const layout = computeLayout(probe, input);
  const canvas = createCanvas(layout.W, layout.H);
  const ctx = canvas.getContext('2d') as unknown as Ctx;
  drawOverlay(ctx, Path2D as unknown as PathCtor, input, layout);
  return { png: canvas.toBuffer('image/png'), layout };
}

type Progress = (p: number) => void;

function run(args: string[], totalFrames: number, onProgress?: Progress, timeoutMs = 240_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    const timer = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('FFmpeg excedió el tiempo límite')); }, timeoutMs);
    p.stdout.on('data', (b: Buffer) => {
      const m = /frame=(\d+)/g;
      let last: RegExpExecArray | null = null, x: RegExpExecArray | null;
      const s = b.toString();
      while ((x = m.exec(s))) last = x;
      if (last && onProgress) onProgress(Math.min(1, Number(last[1]) / totalFrames));
    });
    p.stderr.on('data', (b: Buffer) => { err = (err + b.toString()).slice(-4000); });
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg terminó con código ${code}: ${err.split('\n').slice(-6).join(' ')}`));
    });
  });
}

function filter(geo: ReturnType<typeof ffmpegGeometry>, single = false) {
  const { scale, crop, place, size } = geo;
  return [
    `[0:v]${single ? '' : `fps=${TIMING.fps},`}scale=${scale.w}:${scale.h}:flags=lanczos,crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},setsar=1,`
      + `pad=${size.w}:${size.h}:${place.x}:${place.y}:color=white[v]`,
    `[v][1:v]overlay=0:0:format=auto${single ? '' : ',format=yuv420p'}[out]`,
  ].join(';');
}

/** Genera MP4 + PNG en `outDir`. Devuelve rutas absolutas. */
export async function renderPostcard(input: PostcardInput, outDir: string, onProgress?: Progress) {
  if (!fs.existsSync(SOURCE_VIDEO)) throw new Error(`No se encontró el video fuente: ${SOURCE_VIDEO}`);
  fs.mkdirSync(outDir, { recursive: true });
  const { png, layout } = renderOverlayPng(input);
  const overlayPath = path.join(outDir, 'overlay.png');
  fs.writeFileSync(overlayPath, png);
  const geo = ffmpegGeometry(layout);
  const mp4 = path.join(outDir, 'postal.mp4');
  const still = path.join(outDir, 'postal.png');

  await run([
    '-hide_banner', '-nostdin', '-y', '-loglevel', 'error', '-progress', 'pipe:1',
    '-ss', String(TIMING.sourceStart), '-t', String(TIMING.seconds + 0.5), '-i', SOURCE_VIDEO,
    '-loop', '1', '-framerate', String(TIMING.fps), '-i', overlayPath,
    '-filter_complex', filter(geo), '-map', '[out]',
    '-frames:v', String(TIMING.frames), '-r', String(TIMING.fps), '-an',
    '-c:v', 'libx264', '-preset', process.env.POSTAL_X264_PRESET || 'medium', '-crf', '19',
    '-profile:v', 'high', '-level:v', '4.2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-metadata', 'title=EVEREST — Nuestra cima, nuestro futuro',
    mp4,
  ], TIMING.frames, (p) => onProgress?.(p * 0.92));

  await run([
    '-hide_banner', '-nostdin', '-y', '-loglevel', 'error',
    '-ss', String(TIMING.sourceStart + TIMING.pngAt), '-i', SOURCE_VIDEO,
    '-i', overlayPath,
    '-filter_complex', filter(geo, true), '-map', '[out]', '-frames:v', '1',
    still,
  ], 1);
  onProgress?.(1);
  fs.rmSync(overlayPath, { force: true });
  return { mp4, png: still, layout };
}
