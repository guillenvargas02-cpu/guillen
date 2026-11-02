// Composición de la postal EVEREST — módulo ÚNICO compartido por la previsualización
// (navegador, <video> + <canvas>) y el render del servidor (@napi-rs/canvas + FFmpeg).
//
// Estilo: postal blanca premium con guiños retro. Fondo blanco, la palabra EVEREST
// monumental con el paisaje en movimiento DENTRO de las letras (contorno fino negro y un
// segundo contorno rosa desplazado, como un registro de imprenta), "Saludos desde"
// manuscrito, timbre de línea con matasellos rosa, fecha monumental y ficha técnica
// (día, hora, sede, ciudad) con líneas finas, y el logotipo oficial positivo sobre blanco.
//
// Dos capas con la misma geometría:
//   1. Video: el original escalado sin deformar ("cover") dentro de la caja de la palabra.
//   2. Capa gráfica (PNG con alfa): todo lo demás, opaca; el interior de las letras es
//      transparente y los huecos interiores (la R) siguen siendo blancos.
// Todos los números (tipografía, máscara, encuadre, posiciones, tiempos) salen de aquí.

import { LETTERING, SCRIPT } from './lettering';
import { LOGO, ROSA } from './brand-paths';

export type Format = 'vertical' | 'horizontal';

export const FORMATS: Record<Format, { w: number; h: number; label: string; hint: string }> = {
  vertical: { w: 1080, h: 1920, label: 'Vertical 9:16', hint: 'Historias y estados · 1080 × 1920' },
  horizontal: { w: 1920, h: 1080, label: 'Horizontal 16:9', hint: 'Publicaciones y pantallas · 1920 × 1080' },
};

/** Tiempos compartidos: el MP4 dura 8 s a 30 fps a partir de `sourceStart` del video original. */
export const TIMING = { fps: 30, seconds: 8, frames: 240, sourceStart: 1.5, pngAt: 4 } as const;

/** Proporción del video fuente (original 3840×2160; la versión ligera conserva 16:9). */
export const SOURCE = { w: 3840, h: 2160 } as const;

export const COLORS = {
  paper: '#F6E6C8', cream: '#FFF8EC', skyTop: '#FDEBD3', skyBottom: '#F7BFB9',
  sun: '#F5AE36', sunHalo: '#F8CB72',
  rosa: ROSA, magenta: '#A3005B', magentaDeep: '#5E0033',
  navy: '#1B2340', navy2: '#2C3A63', dusk: '#7183AE', haze: '#B9C3DC', snow: '#F6F3EE',
  white: '#FFFFFF', ink: '#1B2340', muted: '#4D5677',
} as const;
export const FONT = '"Hind Siliguri"';
export const LIMITS = { name: 40 } as const;

/** `name` es opcional: vacío = postal sin nombre (solo evento, lugar y fecha). */
export type PostcardInput = { name?: string; format: Format };

// ─────────────────────────── Interfaces mínimas de Canvas 2D ───────────────────────────
// Compatibles con CanvasRenderingContext2D (navegador) y SKRSContext2D (@napi-rs/canvas).
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Ctx = {
  save(): void; restore(): void;
  translate(x: number, y: number): void; rotate(a: number): void; scale(x: number, y: number): void;
  fillStyle: any; strokeStyle: any; lineWidth: number; lineJoin: any; lineCap: any;
  globalCompositeOperation: any; font: string; textBaseline: any; textAlign: any; globalAlpha: number;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void; moveTo(x: number, y: number): void; lineTo(x: number, y: number): void;
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): void; closePath(): void;
  rect(x: number, y: number, w: number, h: number): void;
  fill(...args: any[]): void; stroke(...args: any[]): void; clip(...args: any[]): void;
  fillText(t: string, x: number, y: number): void;
  measureText(t: string): { width: number };
  clearRect(x: number, y: number, w: number, h: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): { addColorStop(o: number, c: string): void };
};
export type PathCtor = new (d?: string) => any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────── Utilidades ───────────────────────────
const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

/** PRNG determinista: la textura de papel es idéntica en previsualización y render. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function trackedWidth(ctx: Ctx, text: string, tracking: number) {
  const chars = [...text];
  return chars.reduce((a, c) => a + ctx.measureText(c).width, 0) + tracking * Math.max(0, chars.length - 1);
}

/** Texto con interletrado manual (idéntico en ambos motores, sin depender de ctx.letterSpacing). */
function drawTracked(ctx: Ctx, text: string, x: number, y: number, tracking: number, align: 'left' | 'center' | 'right' = 'center') {
  const w = trackedWidth(ctx, text, tracking);
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  for (const c of [...text]) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + tracking;
  }
  return w;
}

/** Ajuste automático: reduce el tamaño y parte en líneas hasta que el texto quepa. */
export function fitText(
  ctx: Ctx, text: string, opts: { weight: number; max: number; min: number; width: number; maxLines: number },
): { size: number; lines: string[] } {
  const words = text.split(/\s+/).filter(Boolean);
  for (let size = opts.max; size >= opts.min; size -= 2) {
    ctx.font = font(opts.weight, size);
    const lines = wrap(ctx, words, opts.width);
    if (lines && lines.length <= opts.maxLines) return { size, lines };
  }
  ctx.font = font(opts.weight, opts.min);
  const lines: string[] = [];
  let cur = '';
  for (const ch of [...words.join(' ')]) {
    if (ctx.measureText(cur + ch + '-').width > opts.width && cur) {
      lines.push(cur.endsWith(' ') ? cur.trimEnd() : cur + '-');
      cur = ch === ' ' ? '' : ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  if (lines.length > opts.maxLines) {
    const kept = lines.slice(0, opts.maxLines);
    kept[kept.length - 1] = kept[kept.length - 1].replace(/-?$/, '…');
    return { size: opts.min, lines: kept };
  }
  return { size: opts.min, lines };
}

function wrap(ctx: Ctx, words: string[], width: number): string[] | null {
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (ctx.measureText(w).width > width) return null;
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= width) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

export type Rect = { x: number; y: number; w: number; h: number };

// ─────────────────────────── Rotulación: la palabra como montaña ───────────────────────────
// Las letras conservan su ancho; su altura sigue una envolvente que sube de los extremos
// (hEnds) a la cima (hPeak) en el centro de la palabra. La línea base es recta.
type LetterSpec = { left: number; width: number; baseline: number; hEnds: number; hPeak: number; depth: number; outline: number; keyline: number; focus: { x: number; y: number } };

const LETTER_SPEC: Record<Format, LetterSpec> = {
  vertical: { left: 70, width: 940, baseline: 900, hEnds: 400, hPeak: 470, depth: 9, outline: 1.6, keyline: 0, focus: { x: 0.5, y: 0.3 } },
  horizontal: { left: 250, width: 1420, baseline: 640, hEnds: 340, hPeak: 400, depth: 9, outline: 1.6, keyline: 0, focus: { x: 0.5, y: 0.3 } },
};

// Arco suave (clásico de las postales de letras grandes): sube hacia el centro.
const envelope = (u: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, u)));

function warpPath(d: string, map: (x: number, y: number) => [number, number]) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g) ?? [];
  const out: string[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    const [x, y] = map(parseFloat(nums[i]), parseFloat(nums[i + 1]));
    out.push(`${Math.round(x * 100) / 100}`, `${Math.round(y * 100) / 100}`);
  }
  let k = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, () => out[k++]);
}

function letterGeometry(format: Format) {
  const spec = LETTER_SPEC[format];
  const v = LETTERING.anton;
  const unitsW = v.bbox.maxX - v.bbox.minX;
  const sx = spec.width / unitsW;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const map = (x: number, y: number): [number, number] => {
    const u = (x - v.bbox.minX) / unitsW;
    const h = spec.hEnds + (spec.hPeak - spec.hEnds) * envelope(u);
    const X = spec.left + (x - v.bbox.minX) * sx;
    const Y = spec.baseline + y * (h / 1000);
    minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
    return [X, Y];
  };
  const d = v.glyphs.map((g) => warpPath(g.d, map)).join(' ');
  const box: Rect = { x: Math.floor(minX) - 2, y: Math.floor(minY) - 2, w: 0, h: 0 };
  box.w = Math.ceil(maxX) + 2 - box.x;
  box.h = Math.ceil(maxY) + 2 - box.y;
  // Dimensiones pares (requisito de yuv420p al recortar en FFmpeg).
  box.x -= box.x % 2; box.y -= box.y % 2; box.w += box.w % 2; box.h += box.h % 2;
  return { d, box, spec, peak: { x: spec.left + spec.width / 2, y: minY } };
}

/** Rectángulo "cover" del video: llena la caja sin deformar, con punto focal. Enteros pares. */
export function coverRect(box: Rect, focus: { x: number; y: number }): Rect {
  const sc = Math.max(box.w / SOURCE.w, box.h / SOURCE.h);
  let w = Math.ceil(SOURCE.w * sc), h = Math.ceil(SOURCE.h * sc);
  w += w % 2; h += h % 2;
  let x = Math.round(box.x - (w - box.w) * focus.x);
  let y = Math.round(box.y - (h - box.h) * focus.y);
  x -= x % 2; y -= y % 2;
  if (x > box.x) x = box.x; if (y > box.y) y = box.y;
  if (x + w < box.x + box.w) x = box.x + box.w - w;
  if (y + h < box.y + box.h) y = box.y + box.h - h;
  return { x, y, w, h };
}

export function sanitizeInput(input: PostcardInput): PostcardInput {
  const clean = (s: string, max: number) => [...(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()].slice(0, max).join('');
  return { format: input.format === 'horizontal' ? 'horizontal' : 'vertical', name: clean(input.name ?? '', LIMITS.name) };
}


// ─────────────────────────── Layout ───────────────────────────
type Blocks = {
  frame: number;
  script: { x: number; y: number; w: number; rot: number };
  stamp: { x: number; y: number; w: number; h: number };
  subtitle: { x: number; y: number; size: number; tracking: number };
  date: { x: number; y: number; size: number; align: 'center' | 'left' };
  name: { x: number; y: number; size: number; text: string; align: 'center' | 'left' } | null;
  spec: { x: number; y: number; w: number; row: number; label: number; value: number };
  logo: { cx: number; cy: number; w: number; rule: number | null };
};

export type Layout = {
  format: Format; W: number; H: number;
  lettering: { d: string; box: Rect; depth: number; outline: number; keyline: number };
  /** Caja de la palabra (donde vive el video) y rectángulo "cover" del video. */
  videoBox: Rect;
  videoRect: Rect;
  focus: { x: number; y: number };
  blocks: Blocks;
};

export const SPEC_ROWS: [string, string][] = [
  ['DÍA', 'Martes 3 de noviembre de 2026'],
  ['HORA', '17:00 h'],
  ['SEDE', 'Salón República · Hotel del Ejército y Fuerza Aérea'],
  ['CIUDAD', 'Ciudad de México'],
];

export function computeLayout(ctx: Ctx, raw: PostcardInput): Layout {
  const input = sanitizeInput(raw);
  const { w: W, h: H } = FORMATS[input.format];
  const g = letterGeometry(input.format);
  const lettering = { d: g.d, box: g.box, depth: g.spec.depth, outline: g.spec.outline, keyline: g.spec.keyline };
  const videoRect = coverRect(g.box, g.spec.focus);
  const nameText = input.name ? `Con cariño, ${input.name}` : '';
  let blocks: Blocks;
  if (input.format === 'vertical') {
    const nf = nameText ? fitText(ctx, nameText, { weight: 500, max: 34, min: 24, width: W - 240, maxLines: 1 }) : null;
    blocks = {
      frame: 40,
      script: { x: 92, y: 228, w: 470, rot: -0.07 },
      stamp: { x: 858, y: 98, w: 126, h: 152 },
      subtitle: { x: W / 2, y: 996, size: 27, tracking: 10 },
      date: { x: W / 2, y: 1268, size: 196, align: 'center' },
      name: nf ? { x: W / 2, y: 1348, size: nf.size, text: nf.lines[0], align: 'center' } : null,
      spec: { x: 100, y: nf ? 1400 : 1370, w: W - 200, row: 66, label: 19, value: 25 },
      logo: { cx: W / 2, cy: 1786, w: 250, rule: 1694 },
    };
  } else {
    const nf = nameText ? fitText(ctx, nameText, { weight: 500, max: 28, min: 20, width: 560, maxLines: 1 }) : null;
    blocks = {
      frame: 36,
      script: { x: 104, y: 170, w: 380, rot: -0.07 },
      stamp: { x: 1726, y: 80, w: 108, h: 130 },
      subtitle: { x: W / 2, y: 728, size: 24, tracking: 9 },
      date: { x: 104, y: 978, size: 150, align: 'left' },
      name: nf ? { x: 110, y: 820, size: nf.size, text: nf.lines[0], align: 'left' } : null,
      spec: { x: 760, y: 806, w: 640, row: 48, label: 15, value: 20 },
      logo: { cx: 1640, cy: 920, w: 220, rule: null },
    };
  }
  return { format: input.format, W, H, lettering, videoBox: g.box, videoRect, focus: g.spec.focus, blocks };
}

// ─────────────────────────── Dibujo ───────────────────────────
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const P = { white: '#FFFFFF', ink: '#0B0B0C', muted: '#6E6E73', line: '#E6E6E8', rosa: ROSA };

/** Dibuja la capa gráfica completa. Deja transparente SOLO el interior de las letras. */
export function drawOverlay(ctx: Ctx, Path2D: PathCtor, raw: PostcardInput, layout?: Layout): Layout {
  const input = sanitizeInput(raw);
  const L = layout ?? computeLayout(ctx, input);
  const { W, H } = L;
  const B = L.blocks;
  const v = L.format === 'vertical';
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // 1 · Papel blanco y marco de línea fina
  ctx.fillStyle = P.white;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = P.line; ctx.lineWidth = 2;
  ctx.beginPath(); roundRect(ctx, B.frame, B.frame, W - 2 * B.frame, H - 2 * B.frame, 30); ctx.stroke();

  // 2 · Letras: contorno rosa desplazado (registro de imprenta) → contorno negro fino → ventana al video
  const glyphs = new Path2D(L.lettering.d);
  const off = L.lettering.depth;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save(); ctx.translate(off, off);
  ctx.strokeStyle = P.rosa; ctx.lineWidth = 2.2; ctx.stroke(glyphs);
  ctx.restore();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.fill(glyphs);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = P.ink; ctx.lineWidth = L.lettering.outline * 2;
  ctx.stroke(glyphs);

  // 3 · “Saludos desde” manuscrito y timbre
  drawScript(ctx, Path2D, B.script);
  drawStamp(ctx, B.stamp);

  // 4 · Subtítulo del evento (separado del logo)
  ctx.fillStyle = P.ink;
  ctx.font = font(600, B.subtitle.size);
  const sw = drawTracked(ctx, 'NUESTRA CIMA, NUESTRO FUTURO', B.subtitle.x, B.subtitle.y, B.subtitle.tracking);
  ctx.fillStyle = P.rosa;
  ctx.beginPath(); ctx.arc(B.subtitle.x - sw / 2 - 28, B.subtitle.y - B.subtitle.size * 0.34, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(B.subtitle.x + sw / 2 + 28, B.subtitle.y - B.subtitle.size * 0.34, 4.5, 0, Math.PI * 2); ctx.fill();

  // 5 · Fecha monumental
  ctx.fillStyle = P.ink;
  ctx.font = font(700, B.date.size);
  drawTracked(ctx, '03.11.26', B.date.x, B.date.y, -B.date.size * 0.055, B.date.align);

  // 6 · Nombre opcional
  if (B.name) {
    ctx.fillStyle = P.muted;
    ctx.font = font(500, B.name.size);
    ctx.textAlign = B.name.align;
    ctx.fillText(B.name.text, B.name.x, B.name.y);
  }

  // 7 · Ficha técnica con líneas finas
  const S = B.spec;
  ctx.fillStyle = P.line;
  ctx.fillRect(S.x, S.y, S.w, 1.5);
  SPEC_ROWS.forEach(([label, value], i) => {
    const y0 = S.y + i * S.row;
    const base = y0 + S.row / 2 + S.value * 0.36;
    ctx.fillStyle = P.muted;
    ctx.font = font(600, S.label);
    drawTracked(ctx, label, S.x, base - (S.value - S.label) * 0.1, S.label * 0.16, 'left');
    ctx.fillStyle = P.ink;
    let vs = S.value;
    ctx.font = font(500, vs);
    const maxW = S.w * (v ? 0.76 : 0.74);
    while (ctx.measureText(value).width > maxW && vs > 12) { vs -= 1; ctx.font = font(500, vs); }
    ctx.textAlign = 'right';
    ctx.fillText(value, S.x + S.w, base);
    ctx.fillStyle = P.line;
    ctx.fillRect(S.x, y0 + S.row, S.w, 1.5);
  });

  // 8 · Logotipo oficial positivo, directamente sobre blanco, con área de seguridad
  if (B.logo.rule) { ctx.fillStyle = P.line; ctx.fillRect(B.frame + 40, B.logo.rule, W - 2 * (B.frame + 40), 1.5); }
  drawLogo(ctx, Path2D, B.logo.cx, B.logo.cy, B.logo.w);

  ctx.restore();
  return L;
}

function drawScript(ctx: Ctx, Path2D: PathCtor, s: { x: number; y: number; w: number; rot: number }) {
  const k = s.w / (SCRIPT.bbox.maxX - SCRIPT.bbox.minX);
  const p = new Path2D(SCRIPT.d);
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  ctx.scale(k, k);
  ctx.translate(-SCRIPT.bbox.minX, 0);
  ctx.fillStyle = P.rosa; ctx.fill(p);
  ctx.restore();
}

/** Timbre de línea (perforado dibujado con trazo) y matasellos rosa. */
function drawStamp(ctx: Ctx, s: { x: number; y: number; w: number; h: number }) {
  const r = 4.5, step = 13;
  ctx.save();
  ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
  ctx.rotate(0.05);
  const x = -s.w / 2, y = -s.h / 2;
  // Borde perforado: arcos hacia dentro a lo largo de los cuatro lados
  ctx.beginPath();
  const nx = Math.floor(s.w / step), ny = Math.floor(s.h / step);
  const sx = s.w / nx, sy = s.h / ny;
  ctx.moveTo(x, y);
  for (let i = 0; i < nx; i++) { const cx = x + sx * (i + 0.5); ctx.lineTo(cx - r, y); ctx.arc(cx, y, r, Math.PI, 0, true); }
  ctx.lineTo(x + s.w, y);
  for (let i = 0; i < ny; i++) { const cy = y + sy * (i + 0.5); ctx.lineTo(x + s.w, cy - r); ctx.arc(x + s.w, cy, r, -Math.PI / 2, Math.PI / 2, true); }
  ctx.lineTo(x + s.w, y + s.h);
  for (let i = nx - 1; i >= 0; i--) { const cx = x + sx * (i + 0.5); ctx.lineTo(cx + r, y + s.h); ctx.arc(cx, y + s.h, r, 0, Math.PI, true); }
  ctx.lineTo(x, y + s.h);
  for (let i = ny - 1; i >= 0; i--) { const cy = y + sy * (i + 0.5); ctx.lineTo(x, cy + r); ctx.arc(x, cy, r, Math.PI / 2, -Math.PI / 2, true); }
  ctx.closePath();
  ctx.fillStyle = P.white; ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6; ctx.stroke();
  // Ilustración de línea: cima y sol
  const ix = x + 14, iy = y + 14, iw = s.w - 28, ih = s.h - 50;
  ctx.strokeStyle = P.ink; ctx.lineWidth = 1.4;
  ctx.strokeRect(ix, iy, iw, ih);
  ctx.fillStyle = P.rosa;
  ctx.beginPath(); ctx.arc(ix + iw * 0.72, iy + ih * 0.3, iw * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ix + 3, iy + ih - 3); ctx.lineTo(ix + iw * 0.3, iy + ih * 0.55); ctx.lineTo(ix + iw * 0.42, iy + ih * 0.68);
  ctx.lineTo(ix + iw * 0.6, iy + ih * 0.36); ctx.lineTo(ix + iw - 3, iy + ih - 3);
  ctx.stroke();
  ctx.fillStyle = P.ink;
  ctx.font = font(700, Math.round(s.w * 0.12));
  ctx.textAlign = 'left';
  ctx.fillText('CDMX', ix, y + s.h - 15);
  ctx.textAlign = 'right';
  ctx.font = font(600, Math.round(s.w * 0.1));
  ctx.fillText('2026', ix + iw, y + s.h - 15);
  ctx.restore();
  // Matasellos rosa
  const mr = s.w * 0.42, mx = s.x - mr * 0.7, my = s.y + s.h * 0.97;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(-0.24);
  ctx.strokeStyle = P.rosa; ctx.fillStyle = P.rosa; ctx.globalAlpha = 0.95;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, mr, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, mr * 0.66, 0, Math.PI * 2); ctx.stroke();
  const ring = 'SALÓN REPÚBLICA • CIUDAD DE MÉXICO • ';
  ctx.font = font(600, Math.round(mr * 0.18));
  const chars = [...ring], stp = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => { ctx.save(); ctx.rotate(i * stp); ctx.translate(0, -(mr * 0.78)); ctx.textAlign = 'center'; ctx.fillText(ch, 0, 0); ctx.restore(); });
  ctx.textAlign = 'center';
  ctx.font = font(700, Math.round(mr * 0.32));
  ctx.fillText('NOV', 0, mr * 0.04);
  ctx.font = font(600, Math.round(mr * 0.21));
  ctx.fillText('2026', 0, mr * 0.3);
  ctx.lineWidth = 1.8;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let xx = -mr - 8; xx >= -mr * 2.8; xx -= 4) {
      const yy = k * 12 + Math.sin(xx / 9) * 3.5;
      if (xx === -mr - 8) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Logo oficial centrado en (cx, cy) con ancho w. Proporción original; sin efectos. */
export function drawLogo(ctx: Ctx, Path2D: PathCtor, cx: number, cy: number, w: number) {
  const s = w / LOGO.w;
  const h = LOGO.h * s;
  ctx.save();
  ctx.translate(cx - w / 2, cy - h / 2);
  ctx.scale(s, s);
  ctx.fillStyle = ROSA;
  for (const d of LOGO.d) ctx.fill(new Path2D(d));
  ctx.restore();
}

/** Parámetros de FFmpeg derivados del layout: el video vive en la caja de la palabra. */
export function ffmpegGeometry(L: Layout) {
  const { videoBox: b, videoRect: r } = L;
  return {
    scale: { w: r.w, h: r.h },
    crop: { w: b.w, h: b.h, x: b.x - r.x, y: b.y - r.y },
    place: { x: b.x, y: b.y },
    size: { w: L.W, h: L.H },
  };
}
