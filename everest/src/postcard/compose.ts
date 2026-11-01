// Composición de la postal EVEREST — módulo ÚNICO compartido por la previsualización
// (navegador, <video> + <canvas>) y el render del servidor (@napi-rs/canvas + FFmpeg).
//
// Estilo: postal retro de "letras grandes". El video de montaña es el FONDO de toda la
// postal; las letras de EVEREST son ventanas al paisaje a color pleno (filete blanco,
// contorno azul noche y extrusión rosa→magenta), mientras el resto del video lleva una
// veladura de impresión antigua (degradado, puntos de semitono y grano). Borde crema,
// rótulo manuscrito "Saludos desde", cinta con el subtítulo, timbre con matasellos,
// fecha y sede, y el logotipo oficial sobre etiqueta blanca.
//
// Dos capas con la misma geometría:
//   1. Video: el original escalado sin deformar ("cover") a todo el cuadro.
//   2. Capa gráfica (PNG con alfa): veladura semitransparente fuera de las letras,
//      interior de las letras totalmente transparente y elementos opacos encima.
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
  vertical: { left: 74, width: 916, baseline: 1050, hEnds: 400, hPeak: 530, depth: 32, outline: 5, keyline: 7, focus: { x: 0.5, y: 0.35 } },
  horizontal: { left: 270, width: 1360, baseline: 660, hEnds: 320, hPeak: 410, depth: 28, outline: 5, keyline: 7, focus: { x: 0.5, y: 0.3 } },
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
  border: number;
  script: { x: number; y: number; w: number; rot: number };
  stamp: { x: number; y: number; w: number; h: number; rot: number; lines: number };
  ribbon: { cx: number; cy: number; w: number; h: number; size: number };
  info: { x: number; y: number; align: 'center' | 'left'; date: number; place: number; name: { size: number; text: string } | null };
  label: Rect;
  wash: { letterTop: number; bottomStart: number };
};

export type Layout = {
  format: Format; W: number; H: number;
  lettering: { d: string; box: Rect; depth: number; outline: number; keyline: number };
  /** Caja de la palabra (máscara) y rectángulo "cover" del video a todo el cuadro. */
  videoBox: Rect;
  videoRect: Rect;
  focus: { x: number; y: number };
  blocks: Blocks;
};

export function computeLayout(ctx: Ctx, raw: PostcardInput): Layout {
  const input = sanitizeInput(raw);
  const { w: W, h: H } = FORMATS[input.format];
  const g = letterGeometry(input.format);
  const lettering = { d: g.d, box: g.box, depth: g.spec.depth, outline: g.spec.outline, keyline: g.spec.keyline };
  const frame: Rect = { x: 0, y: 0, w: W, h: H };
  const videoRect = coverRect(frame, g.spec.focus);
  const base = g.spec.baseline + g.spec.depth;
  const nameText = input.name ? `Con cariño, ${input.name}` : '';
  let blocks: Blocks;
  if (input.format === 'vertical') {
    const nameFit = nameText ? fitText(ctx, nameText, { weight: 600, max: 40, min: 26, width: W - 240, maxLines: 1 }) : null;
    blocks = {
      border: 38,
      script: { x: 92, y: 330, w: 700, rot: -0.1 },
      stamp: { x: 836, y: 82, w: 160, h: 194, rot: 0.06, lines: 2.6 },
      ribbon: { cx: W / 2, cy: base + 58, w: 820, h: 80, size: 28 },
      info: { x: W / 2, y: 1530, align: 'center', date: 46, place: 25, name: nameFit ? { size: nameFit.size, text: nameFit.lines[0] } : null },
      label: { x: W / 2 - 220, y: 1716, w: 440, h: 128 },
      wash: { letterTop: g.box.y, bottomStart: 1260 },
    };
  } else {
    const nameFit = nameText ? fitText(ctx, nameText, { weight: 600, max: 32, min: 22, width: 900, maxLines: 1 }) : null;
    blocks = {
      border: 34,
      script: { x: 104, y: 178, w: 470, rot: -0.1 },
      stamp: { x: 1702, y: 70, w: 136, h: 164, rot: 0.06, lines: 2.2 },
      ribbon: { cx: W / 2, cy: base + 50, w: 780, h: 68, size: 24 },
      info: { x: 120, y: 878, align: 'left', date: 38, place: 21, name: nameFit ? { size: nameFit.size, text: nameFit.lines[0] } : null },
      label: { x: W - 120 - 380, y: 856, w: 380, h: 118 },
      wash: { letterTop: g.box.y, bottomStart: 720 },
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

function lerpColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}

/** Dibuja la capa gráfica completa. Deja transparente SOLO el interior de las letras. */
export function drawOverlay(ctx: Ctx, Path2D: PathCtor, raw: PostcardInput, layout?: Layout): Layout {
  const input = sanitizeInput(raw);
  const L = layout ?? computeLayout(ctx, input);
  const { W, H } = L;
  const B = L.blocks;
  const c = COLORS;
  const v = L.format === 'vertical';
  const bw = B.border;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // 1 · Veladura de impresión antigua sobre el video (fuera de las letras):
  //    atardecer cálido arriba → rosa → azul noche abajo para leer fecha y sede.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  const k = B.wash.bottomStart / H;
  wash.addColorStop(0, 'rgba(248, 190, 120, 0.46)');
  wash.addColorStop(k * 0.55, 'rgba(240, 140, 160, 0.40)');
  wash.addColorStop(k, 'rgba(150, 70, 120, 0.42)');
  wash.addColorStop(Math.min(1, k + (1 - k) * 0.55), 'rgba(27, 35, 64, 0.80)');
  wash.addColorStop(1, 'rgba(20, 26, 50, 0.90)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  // Semitono: puntos regulares (impresión offset de los años cuarenta)
  ctx.fillStyle = 'rgba(120, 30, 60, 0.10)';
  const step = 9;
  for (let y = 0, row = 0; y < H; y += step, row++) {
    for (let x = (row % 2) * (step / 2); x < W; x += step) {
      ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Grano determinista
  const rnd = prng(v ? 1920 : 1080);
  const grains = Math.round((W * H) / 60);
  for (let i = 0; i < grains; i++) {
    const x = rnd() * W, y = rnd() * H, s = 0.8 + rnd() * 1.4;
    ctx.fillStyle = rnd() < 0.5 ? 'rgba(60, 30, 20, 0.08)' : 'rgba(255, 245, 230, 0.10)';
    ctx.fillRect(x, y, s, s);
  }

  // 2 · Letras: extrusión (contorno azul noche + rosa→magenta), cara, interior transparente, filete blanco
  const glyphs = new Path2D(L.lettering.d);
  const { depth, outline, keyline } = L.lettering;
  const dx = 0.62, dy = 1;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = c.navy; ctx.strokeStyle = c.navy; ctx.lineWidth = outline * 2;
  for (let i = depth; i >= 0; i -= 2) {
    ctx.save(); ctx.translate(i * dx, i * dy); ctx.fill(glyphs); ctx.stroke(glyphs); ctx.restore();
  }
  for (let i = depth; i >= 1; i--) {
    ctx.save(); ctx.translate(i * dx, i * dy);
    ctx.fillStyle = lerpColor(c.rosa, c.magentaDeep, i / depth);
    ctx.fill(glyphs); ctx.restore();
  }
  ctx.strokeStyle = c.navy; ctx.lineWidth = outline * 2;
  ctx.stroke(glyphs);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.fill(glyphs);
  ctx.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.clip(glyphs);
  ctx.strokeStyle = c.white; ctx.lineWidth = keyline * 2;
  ctx.stroke(glyphs);
  ctx.strokeStyle = c.navy; ctx.lineWidth = 2;
  ctx.globalAlpha = 0.0; // reservado: línea interior opcional
  ctx.restore();

  // 3 · "Saludos desde" manuscrito: sombra azul noche + contorno crema + relleno rosa
  drawScript(ctx, Path2D, B.script);

  // 4 · Cinta con el subtítulo (separada del logo)
  drawRibbon(ctx, B.ribbon.cx, B.ribbon.cy, B.ribbon.w, B.ribbon.h);
  ctx.fillStyle = c.white;
  ctx.font = font(700, B.ribbon.size);
  drawTracked(ctx, 'NUESTRA CIMA, NUESTRO FUTURO', B.ribbon.cx, B.ribbon.cy + B.ribbon.size * 0.36, 6);

  // 5 · Timbre y matasellos
  drawStamp(ctx, B.stamp);

  // 6 · Día, fecha y sede (y nombre opcional)
  const I = B.info;
  let y = I.y;
  ctx.fillStyle = c.cream;
  if (I.name) {
    ctx.font = font(600, I.name.size);
    ctx.textAlign = I.align;
    ctx.fillStyle = '#FFD7E8';
    ctx.fillText(I.name.text, I.x, y - (v ? 70 : 54));
    ctx.fillStyle = c.cream;
  }
  ctx.font = font(700, I.date);
  drawTracked(ctx, 'MARTES 3 · NOVIEMBRE · 2026', I.x, y, v ? 4 : 3.5, I.align);
  ctx.fillStyle = '#FF9FCB';
  ctx.font = font(700, Math.round(I.date * 0.62));
  y += v ? 54 : 44;
  drawTracked(ctx, '17:00 H · CIUDAD DE MÉXICO', I.x, y, v ? 6 : 5, I.align);
  ctx.fillStyle = c.cream;
  ctx.font = font(500, I.place);
  y += v ? 50 : 40;
  drawTracked(ctx, 'SALÓN REPÚBLICA', I.x, y, v ? 5 : 4, I.align);
  y += v ? 36 : 30;
  drawTracked(ctx, 'HOTEL DEL EJÉRCITO Y FUERZA AÉREA', I.x, y, v ? 2.5 : 2, I.align);

  // 7 · Etiqueta blanca con el logotipo oficial (positivo, con área de seguridad)
  const LB = B.label;
  ctx.fillStyle = 'rgba(10, 14, 30, 0.35)';
  ctx.beginPath(); roundRect(ctx, LB.x + 6, LB.y + 8, LB.w, LB.h, 8); ctx.fill();
  ctx.fillStyle = c.white;
  ctx.beginPath(); roundRect(ctx, LB.x, LB.y, LB.w, LB.h, 8); ctx.fill();
  drawLogo(ctx, Path2D, LB.x + LB.w / 2, LB.y + LB.h / 2, Math.min(LB.w * 0.66, 300));

  // 8 · Borde crema de postal con doble filete
  ctx.fillStyle = c.paper;
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  roundRect(ctx, bw, bw, W - 2 * bw, H - 2 * bw, 22);
  ctx.fill('evenodd');
  const rnd2 = prng(7);
  for (let i = 0; i < 9000; i++) {
    const side = rnd2();
    const x = side < 0.5 ? rnd2() * W : (rnd2() < 0.5 ? rnd2() * bw : W - rnd2() * bw);
    const yy = side < 0.5 ? (rnd2() < 0.5 ? rnd2() * bw : H - rnd2() * bw) : rnd2() * H;
    ctx.fillStyle = 'rgba(110, 80, 40, 0.10)';
    ctx.fillRect(x, yy, 1.4, 1.4);
  }
  ctx.strokeStyle = c.navy; ctx.lineWidth = 3;
  ctx.beginPath(); roundRect(ctx, bw - 1.5, bw - 1.5, W - 2 * bw + 3, H - 2 * bw + 3, 23); ctx.stroke();
  ctx.strokeStyle = c.rosa; ctx.lineWidth = 1.5;
  ctx.beginPath(); roundRect(ctx, bw - 11, bw - 11, W - 2 * bw + 22, H - 2 * bw + 22, 28); ctx.stroke();

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
  ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(46, 52); ctx.fillStyle = COLORS.navy; ctx.strokeStyle = COLORS.navy; ctx.lineWidth = 64; ctx.stroke(p); ctx.fill(p); ctx.restore();
  ctx.strokeStyle = COLORS.cream; ctx.lineWidth = 64; ctx.stroke(p);
  ctx.fillStyle = COLORS.rosa; ctx.fill(p);
  ctx.restore();
}

/** Cinta retro: banda rosa con colas magenta plegadas y filete crema. */
function drawRibbon(ctx: Ctx, cx: number, cy: number, w: number, h: number) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const tail = h * 1.3, drop = h * 0.34, notch = h * 0.42;
  for (const side of [-1, 1]) {
    const ex = side < 0 ? x0 : x1;
    const inner = ex - side * h * 0.1, outer = ex + side * tail;
    ctx.fillStyle = COLORS.magenta;
    ctx.strokeStyle = COLORS.navy; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(inner, y0 + drop); ctx.lineTo(outer, y0 + drop); ctx.lineTo(outer - side * notch, cy + drop);
    ctx.lineTo(outer, y1 + drop); ctx.lineTo(inner, y1 + drop); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.magentaDeep;
    ctx.beginPath(); ctx.moveTo(ex, y1); ctx.lineTo(ex + side * h * 0.5, y1 + drop); ctx.lineTo(ex, y1 + drop); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = COLORS.rosa;
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = COLORS.navy; ctx.lineWidth = 3;
  ctx.strokeRect(x0, y0, w, h);
  ctx.strokeStyle = 'rgba(255, 248, 236, 0.75)'; ctx.lineWidth = 1.5;
  ctx.strokeRect(x0 + 8, y0 + 8, w - 16, h - 16);
}

/** Timbre postal perforado con ilustración de cima y matasellos. */
function drawStamp(ctx: Ctx, s: { x: number; y: number; w: number; h: number; rot: number; lines: number }) {
  ctx.save();
  ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
  ctx.rotate(s.rot);
  const x = -s.w / 2, y = -s.h / 2, r = 6, step = 15;
  ctx.fillStyle = 'rgba(10, 14, 30, 0.35)';
  ctx.fillRect(x + 5, y + 7, s.w, s.h);
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(x, y, s.w, s.h);
  ctx.globalCompositeOperation = 'destination-out';
  for (let px = x + step / 2; px < x + s.w; px += step) {
    ctx.beginPath(); ctx.arc(px, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px, y + s.h, r, 0, Math.PI * 2); ctx.fill();
  }
  for (let py = y + step / 2; py < y + s.h; py += step) {
    ctx.beginPath(); ctx.arc(x, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s.w, py, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  const ix = x + 13, iy = y + 13, iw = s.w - 26, ih = s.h - 58;
  ctx.fillStyle = COLORS.rosa; ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = COLORS.sun;
  ctx.beginPath(); ctx.arc(ix + iw * 0.7, iy + ih * 0.3, iw * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.navy;
  ctx.beginPath();
  ctx.moveTo(ix, iy + ih); ctx.lineTo(ix + iw * 0.22, iy + ih * 0.62); ctx.lineTo(ix + iw * 0.34, iy + ih * 0.74);
  ctx.lineTo(ix + iw * 0.55, iy + ih * 0.34); ctx.lineTo(ix + iw * 0.8, iy + ih * 0.7); ctx.lineTo(ix + iw, iy + ih * 0.56);
  ctx.lineTo(ix + iw, iy + ih); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(ix + iw * 0.55, iy + ih * 0.34); ctx.lineTo(ix + iw * 0.63, iy + ih * 0.46); ctx.lineTo(ix + iw * 0.57, iy + ih * 0.44);
  ctx.lineTo(ix + iw * 0.52, iy + ih * 0.5); ctx.lineTo(ix + iw * 0.47, iy + ih * 0.45); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.navy;
  ctx.font = font(700, Math.round(s.w * 0.14));
  ctx.textAlign = 'left';
  ctx.fillText('CDMX', ix, y + s.h - 19);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.rosa;
  ctx.font = font(700, Math.round(s.w * 0.11));
  ctx.fillText('2026', ix + iw, y + s.h - 20);
  ctx.restore();

  const mr = s.w * 0.4, mx = s.x + s.w * 0.3, my = s.y + s.h + mr * 0.82;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(-0.24);
  ctx.strokeStyle = COLORS.cream; ctx.fillStyle = COLORS.cream; ctx.globalAlpha = 0.92;
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(0, 0, mr, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, 0, mr * 0.68, 0, Math.PI * 2); ctx.stroke();
  const ring = 'SALÓN REPÚBLICA • CIUDAD DE MÉXICO • ';
  ctx.font = font(700, Math.round(mr * 0.18));
  const chars = [...ring], stp = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    ctx.save(); ctx.rotate(i * stp); ctx.translate(0, -(mr * 0.79)); ctx.textAlign = 'center'; ctx.fillText(ch, 0, 0); ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.font = font(700, Math.round(mr * 0.34));
  ctx.fillText('NOV', 0, mr * 0.04);
  ctx.font = font(600, Math.round(mr * 0.22));
  ctx.fillText('2026', 0, mr * 0.3);
  ctx.lineWidth = 2.2;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let xx = -mr - 8; xx >= -mr * s.lines; xx -= 4) {
      const yy = k * 14 + Math.sin(xx / 10) * 4;
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

/** Parámetros de FFmpeg derivados del layout: el video cubre todo el cuadro. */
export function ffmpegGeometry(L: Layout) {
  const r = L.videoRect;
  return {
    scale: { w: r.w, h: r.h },
    crop: { w: L.W, h: L.H, x: -r.x, y: -r.y },
    place: { x: 0, y: 0 },
    size: { w: L.W, h: L.H },
  };
}
