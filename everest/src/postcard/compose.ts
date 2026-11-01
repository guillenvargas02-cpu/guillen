// Composición de la postal EVEREST — módulo ÚNICO compartido por la previsualización
// (navegador, <canvas> + <video>) y el render del servidor (@napi-rs/canvas + FFmpeg).
//
// Concepto: "la palabra como montaña". Las letras de EVEREST se rotulan como una
// cordillera que asciende hasta la cima en la R; el paisaje en movimiento vive DENTRO
// de las letras. Alrededor: papel blanco cálido, sol de rayos en rosa pálido, cinta
// retro con el subtítulo, timbre perforado con matasellos y curvas de nivel.
//
// Dos capas con la misma geometría:
//   1. Video: el original escalado sin deformar ("cover") dentro de la caja de la palabra.
//   2. Capa gráfica (PNG con alfa): todo lo demás. El interior de las letras es
//      TRANSPARENTE; los huecos interiores (la R) siguen siendo papel.
// Todos los números (tipografía, máscara, encuadre, posiciones, tiempos) salen de aquí.

import { LETTERING } from './lettering';
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
  paper: '#F5EEE2', paperDeep: '#EDE3D2', ink: '#161412', white: '#FFFFFF', rosa: ROSA,
  rosaDeep: '#A8005C', rosaPale: 'rgba(228, 0, 124, 0.06)', muted: '#5E574F',
} as const;
export const FONT = '"Hind Siliguri"';
export const LIMITS = { name: 48, phrase: 90 } as const;

export type PostcardInput = { name: string; phrase?: string; format: Format };

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
  vertical: { left: 64, width: 952, baseline: 872, hEnds: 250, hPeak: 560, depth: 18, outline: 6, keyline: 4, focus: { x: 0.5, y: 0.12 } },
  horizontal: { left: 290, width: 1340, baseline: 628, hEnds: 250, hPeak: 470, depth: 16, outline: 6.5, keyline: 4.5, focus: { x: 0.5, y: 0.14 } },
};

const envelope = (u: number) => Math.pow(Math.max(0, 1 - Math.abs(2 * u - 1)), 1.18);

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
  return { format: input.format === 'horizontal' ? 'horizontal' : 'vertical', name: clean(input.name, LIMITS.name), phrase: clean(input.phrase ?? '', LIMITS.phrase) };
}

// ─────────────────────────── Layout ───────────────────────────
type Fit = { size: number; lines: string[] };
type Blocks = {
  header: { x: number; y: number; align: 'center' | 'left' };
  ribbon: { cx: number; cy: number; w: number; h: number; size: number };
  stamp: { x: number; y: number; w: number; h: number; rot: number; lines: number };
  personal: { x: number; top: number; align: 'center' | 'left'; label: number; nameFit: Fit; nameLH: number; phraseFit: Fit | null; phraseLH: number; gap: number };
  details: { x: number; y: number; align: 'center' | 'left' | 'right' };
  label: Rect;
  rays: { cx: number; cy: number; r: number; bottom: number };
  topo: { cx: number; cy: number; top: number };
};

export type Layout = {
  format: Format; W: number; H: number;
  lettering: { d: string; box: Rect; depth: number; outline: number; keyline: number };
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
  const videoBox = g.box;
  const videoRect = coverRect(videoBox, g.spec.focus);
  const name = input.name || 'Tu nombre';
  const base = g.spec.baseline + g.spec.depth;
  let blocks: Blocks;

  if (input.format === 'vertical') {
    const textW = W - 2 * 120;
    const zoneTop = base + 150, zoneBottom = 1560;
    const P = fitPersonal(ctx, name, input.phrase ?? '', { textW, avail: zoneBottom - zoneTop, name: [112, 56, 2], phrase: [46, 30, 3], label: 40, gap: 26, nameLH: 1.02, phraseLH: 1.34 });
    blocks = {
      header: { x: W / 2, y: 214, align: 'center' },
      ribbon: { cx: W / 2, cy: base + 52, w: 800, h: 78, size: 27 },
      stamp: { x: 826, y: 76, w: 178, h: 216, rot: 0.05, lines: 3.2 },
      personal: { x: W / 2, top: Math.round(zoneTop + Math.max(0, (zoneBottom - zoneTop - P.blockH) / 2)), align: 'center', ...P.fit },
      details: { x: W / 2, y: 1630, align: 'center' },
      label: { x: W / 2 - 230, y: 1712, w: 460, h: 136 },
      rays: { cx: g.peak.x, cy: g.peak.y + 70, r: 1100, bottom: base + 10 },
      topo: { cx: W * 0.9, cy: H * 0.98, top: base + 96 },
    };
  } else {
    const textW = 900;
    const zoneTop = base + 112, zoneBottom = H - 72;
    const P = fitPersonal(ctx, name, input.phrase ?? '', { textW, avail: zoneBottom - zoneTop, name: [84, 40, 2], phrase: [36, 24, 2], label: 34, gap: 12, nameLH: 1.02, phraseLH: 1.28 });
    blocks = {
      header: { x: W / 2, y: 132, align: 'center' },
      ribbon: { cx: W / 2, cy: base + 46, w: 760, h: 66, size: 24 },
      stamp: { x: 1686, y: 66, w: 152, h: 184, rot: 0.05, lines: 2.3 },
      personal: { x: 140, top: Math.round(zoneTop + Math.max(0, (zoneBottom - zoneTop - P.blockH) / 2)), align: 'left', ...P.fit },
      details: { x: 1780, y: zoneTop + 22, align: 'right' },
      label: { x: 1780 - 380, y: zoneTop + 102, w: 380, h: 112 },
      rays: { cx: g.peak.x, cy: g.peak.y + 60, r: 1300, bottom: base + 6 },
      topo: { cx: W * 0.04, cy: H * 1.05, top: base + 80 },
    };
  }
  return { format: input.format, W, H, lettering, videoBox, videoRect, focus: g.spec.focus, blocks };
}

/** Ajusta nombre y frase para que el bloque completo quepa en su zona (reduce tamaños en conjunto). */
function fitPersonal(ctx: Ctx, name: string, phrase: string, o: {
  textW: number; avail: number; name: [number, number, number]; phrase: [number, number, number]; label: number; gap: number; nameLH: number; phraseLH: number;
}) {
  let last: { fit: { label: number; nameFit: Fit; nameLH: number; phraseFit: Fit | null; phraseLH: number; gap: number }; blockH: number } | null = null;
  for (let k = 1; k >= 0.5; k -= 0.05) {
    const nameFit = fitText(ctx, name, { weight: 700, max: Math.max(o.name[1], Math.round(o.name[0] * k)), min: o.name[1], width: o.textW, maxLines: o.name[2] });
    const phraseFit = phrase ? fitText(ctx, `“${phrase}”`, { weight: 400, max: Math.max(o.phrase[1], Math.round(o.phrase[0] * k)), min: o.phrase[1], width: o.textW, maxLines: o.phrase[2] }) : null;
    const nameLH = nameFit.size * o.nameLH, phraseLH = phraseFit ? phraseFit.size * o.phraseLH : 0;
    const gap = phraseFit ? o.gap : 0;
    const blockH = o.label + nameFit.lines.length * nameLH + gap + (phraseFit ? phraseFit.lines.length * phraseLH : 0);
    last = { fit: { label: o.label, nameFit, nameLH, phraseFit, phraseLH, gap }, blockH };
    if (blockH <= o.avail) break;
  }
  return last!;
}

// ─────────────────────────── Dibujo de la capa gráfica ───────────────────────────
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function star(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r * 0.16, cy - r * 0.16, cx + r, cy);
  ctx.quadraticCurveTo(cx + r * 0.16, cy + r * 0.16, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.16, cy + r * 0.16, cx - r, cy);
  ctx.quadraticCurveTo(cx - r * 0.16, cy - r * 0.16, cx, cy - r);
  ctx.closePath();
  ctx.fill();
}

/** Dibuja la capa gráfica completa. Deja transparente SOLO el interior de las letras. */
export function drawOverlay(ctx: Ctx, Path2D: PathCtor, raw: PostcardInput, layout?: Layout): Layout {
  const input = sanitizeInput(raw);
  const L = layout ?? computeLayout(ctx, input);
  const { W, H } = L;
  const B = L.blocks;
  const c = COLORS;
  const v = L.format === 'vertical';
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // 1 · Papel y textura (determinista)
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, W, H);
  const rnd = prng(L.format === 'vertical' ? 1920 : 1080);
  const grains = Math.round((W * H) / 70);
  for (let i = 0; i < grains; i++) {
    const x = rnd() * W, y = rnd() * H, s = 0.8 + rnd() * 1.6;
    ctx.fillStyle = rnd() < 0.55 ? 'rgba(92, 70, 40, 0.06)' : 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x, y, s, s);
  }

  // 2 · Sol de rayos detrás de la cima (rosa muy pálido)
  ctx.save();
  ctx.beginPath(); ctx.rect(40, 40, W - 80, B.rays.bottom - 40); ctx.clip();
  ctx.fillStyle = c.rosaPale;
  const rays = 44;
  for (let i = 0; i < rays; i += 2) {
    const a0 = (i / rays) * Math.PI * 2, a1 = ((i + 1) / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(B.rays.cx, B.rays.cy);
    ctx.lineTo(B.rays.cx + Math.cos(a0) * B.rays.r, B.rays.cy + Math.sin(a0) * B.rays.r);
    ctx.lineTo(B.rays.cx + Math.cos(a1) * B.rays.r, B.rays.cy + Math.sin(a1) * B.rays.r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 3 · Curvas de nivel (cartografía de la cima)
  ctx.save();
  ctx.beginPath(); ctx.rect(40, B.topo.top, W - 80, H - 40 - B.topo.top); ctx.clip();
  ctx.strokeStyle = 'rgba(22, 20, 18, 0.085)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 30; i++) {
    const r0 = 60 + i * 38;
    ctx.beginPath();
    for (let s = 0; s <= 180; s++) {
      const a = (s / 180) * Math.PI * 2;
      const r = r0 * (1 + 0.07 * Math.sin(3 * a + i * 0.37) + 0.045 * Math.sin(5 * a + 1.3 + i * 0.21) + 0.03 * Math.sin(9 * a + i * 0.6));
      const x = B.topo.cx + Math.cos(a) * r, y = B.topo.cy + Math.sin(a) * r * 0.82;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // 4 · Marco de postal: filete negro con esquinas redondeadas + filete rosa interior
  ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
  roundRect(ctx, 34.5, 34.5, W - 69, H - 69, 26); ctx.stroke();
  ctx.strokeStyle = c.rosa; ctx.lineWidth = 1.5;
  roundRect(ctx, 48.75, 48.75, W - 97.5, H - 97.5, 15); ctx.stroke();

  // 5 · Encabezado “SALUDOS DESDE” con estrellas
  ctx.fillStyle = c.ink;
  ctx.font = font(600, v ? 33 : 30);
  const hw = drawTracked(ctx, 'SALUDOS DESDE', B.header.x, B.header.y, v ? 11 : 11);
  ctx.fillStyle = c.rosa;
  star(ctx, B.header.x - hw / 2 - 36, B.header.y - 12, 13);
  star(ctx, B.header.x + hw / 2 + 36, B.header.y - 12, 13);

  // 6 · Letras: profundidad → contorno → interior transparente → filete interior rosa
  const glyphs = new Path2D(L.lettering.d);
  const { depth, outline, keyline } = L.lettering;
  ctx.fillStyle = c.ink;
  for (let i = depth; i >= 1; i--) {
    ctx.save(); ctx.translate(i * 0.7, i); ctx.fill(glyphs); ctx.restore();
  }
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = c.ink; ctx.lineWidth = outline * 2;
  ctx.stroke(glyphs);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.fill(glyphs);
  ctx.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.clip(glyphs);
  ctx.strokeStyle = c.rosa; ctx.lineWidth = keyline * 2;
  ctx.stroke(glyphs);
  ctx.restore();

  // 7 · Cinta con el subtítulo del evento (separado del logo)
  drawRibbon(ctx, B.ribbon.cx, B.ribbon.cy, B.ribbon.w, B.ribbon.h);
  ctx.fillStyle = c.white;
  ctx.font = font(600, B.ribbon.size);
  drawTracked(ctx, 'NUESTRA CIMA, NUESTRO FUTURO', B.ribbon.cx, B.ribbon.cy + B.ribbon.size * 0.36, v ? 6 : 6);

  // 8 · Timbre perforado + matasellos
  drawStamp(ctx, B.stamp);

  // 9 · Bloque personal
  const P = B.personal;
  let y = P.top;
  ctx.fillStyle = c.rosa;
  ctx.font = font(600, v ? 25 : 22);
  y += v ? 22 : 18;
  const lw = drawTracked(ctx, 'POSTAL DE', P.x, y, 8, P.align);
  ctx.fillRect(P.align === 'center' ? P.x - lw / 2 - 56 : P.x + lw + 16, y - 8, 40, 2.5);
  if (P.align === 'center') ctx.fillRect(P.x + lw / 2 + 16, y - 8, 40, 2.5);
  y = P.top + P.label;
  ctx.fillStyle = c.ink;
  ctx.font = font(700, P.nameFit.size);
  ctx.textAlign = P.align;
  for (const line of P.nameFit.lines) {
    y += P.nameLH;
    ctx.fillText(line, P.x, y - P.nameFit.size * 0.16);
  }
  if (P.phraseFit) {
    y += P.gap;
    ctx.fillStyle = c.muted;
    ctx.font = font(400, P.phraseFit.size);
    for (const line of P.phraseFit.lines) {
      y += P.phraseLH;
      ctx.fillText(line, P.x, y - P.phraseFit.size * 0.3);
    }
  }

  // 10 · Fecha y sede
  const D = B.details;
  ctx.fillStyle = c.ink;
  ctx.font = font(600, v ? 26 : 23);
  drawTracked(ctx, 'MARTES 3 DE NOVIEMBRE DE 2026 · 17:00 H', D.x, D.y, v ? 3.5 : 3, D.align);
  ctx.fillStyle = c.muted;
  ctx.font = font(400, v ? 21 : 19);
  drawTracked(ctx, v ? 'SALÓN REPÚBLICA · HOTEL DEL EJÉRCITO Y FUERZA AÉREA' : 'SALÓN REPÚBLICA · HOTEL DEL EJÉRCITO Y FUERZA AÉREA', D.x, D.y + (v ? 36 : 32), 1.6, D.align);
  drawTracked(ctx, 'ORGANIZA SOMOS MIGUEL HIDALGO · CDMX', D.x, D.y + (v ? 68 : 60), 1.6, D.align);

  // 11 · Etiqueta blanca con el logotipo oficial (positivo, con área de seguridad)
  const LB = B.label;
  ctx.fillStyle = c.white;
  roundRect(ctx, LB.x, LB.y, LB.w, LB.h, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(22, 20, 18, 0.55)'; ctx.lineWidth = 1.5;
  roundRect(ctx, LB.x + 0.75, LB.y + 0.75, LB.w - 1.5, LB.h - 1.5, 6); ctx.stroke();
  drawLogo(ctx, Path2D, LB.x + LB.w / 2, LB.y + LB.h / 2, Math.min(LB.w * 0.64, 300));

  ctx.restore();
  return L;
}

/** Cinta retro: banda negra con colas rosas plegadas. */
function drawRibbon(ctx: Ctx, cx: number, cy: number, w: number, h: number) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const tail = h * 1.25, drop = h * 0.32, notch = h * 0.42;
  // Colas
  ctx.fillStyle = COLORS.rosa;
  for (const side of [-1, 1]) {
    const ex = side < 0 ? x0 : x1;
    const inner = ex + side * -h * 0.1;
    const outer = ex + side * tail;
    ctx.beginPath();
    ctx.moveTo(inner, y0 + drop);
    ctx.lineTo(outer, y0 + drop);
    ctx.lineTo(outer - side * notch, cy + drop);
    ctx.lineTo(outer, y1 + drop);
    ctx.lineTo(inner, y1 + drop);
    ctx.closePath();
    ctx.fill();
  }
  // Pliegues
  ctx.fillStyle = COLORS.rosaDeep;
  for (const side of [-1, 1]) {
    const ex = side < 0 ? x0 : x1;
    ctx.beginPath();
    ctx.moveTo(ex, y1);
    ctx.lineTo(ex + side * h * 0.55, y1 + drop);
    ctx.lineTo(ex, y1 + drop);
    ctx.closePath();
    ctx.fill();
  }
  // Banda
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.2;
  ctx.strokeRect(x0 + 7.5, y0 + 7.5, w - 15, h - 15);
}

/** Timbre postal perforado con ilustración de cima y matasellos rosa. */
function drawStamp(ctx: Ctx, s: { x: number; y: number; w: number; h: number; rot: number; lines: number }) {
  ctx.save();
  ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
  ctx.rotate(s.rot);
  const x = -s.w / 2, y = -s.h / 2, r = 6, step = 15;
  // Papel del timbre con borde perforado
  ctx.fillStyle = '#FFFDF8';
  ctx.fillRect(x, y, s.w, s.h);
  ctx.fillStyle = COLORS.paper;
  for (let px = x + step / 2; px < x + s.w; px += step) {
    ctx.beginPath(); ctx.arc(px, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px, y + s.h, r, 0, Math.PI * 2); ctx.fill();
  }
  for (let py = y + step / 2; py < y + s.h; py += step) {
    ctx.beginPath(); ctx.arc(x, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + s.w, py, r, 0, Math.PI * 2); ctx.fill();
  }
  // Ilustración
  const ix = x + 14, iy = y + 14, iw = s.w - 28, ih = s.h - 62;
  ctx.fillStyle = COLORS.rosa;
  ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(ix + iw * 0.72, iy + ih * 0.3, iw * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.moveTo(ix, iy + ih); ctx.lineTo(ix + iw * 0.22, iy + ih * 0.62); ctx.lineTo(ix + iw * 0.34, iy + ih * 0.74);
  ctx.lineTo(ix + iw * 0.55, iy + ih * 0.34); ctx.lineTo(ix + iw * 0.8, iy + ih * 0.7); ctx.lineTo(ix + iw, iy + ih * 0.56);
  ctx.lineTo(ix + iw, iy + ih); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(ix + iw * 0.55, iy + ih * 0.34); ctx.lineTo(ix + iw * 0.63, iy + ih * 0.46); ctx.lineTo(ix + iw * 0.57, iy + ih * 0.44);
  ctx.lineTo(ix + iw * 0.52, iy + ih * 0.5); ctx.lineTo(ix + iw * 0.47, iy + ih * 0.45); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(700, Math.round(s.w * 0.14));
  ctx.textAlign = 'left';
  ctx.fillText('CDMX', ix, y + s.h - 20);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.rosa;
  ctx.font = font(700, Math.round(s.w * 0.11));
  ctx.fillText('2026', ix + iw, y + s.h - 21);
  ctx.restore();

  // Matasellos sobre la esquina inferior izquierda del timbre
  const mr = s.w * 0.4, mx = s.x + s.w * 0.36, my = s.y + s.h + mr * 0.8;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(-0.24);
  ctx.strokeStyle = COLORS.rosa; ctx.fillStyle = COLORS.rosa; ctx.globalAlpha = 0.9;
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(0, 0, mr, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, 0, mr - mr * 0.32, 0, Math.PI * 2); ctx.stroke();
  const ring = 'SALÓN REPÚBLICA • CIUDAD DE MÉXICO • ';
  ctx.font = font(600, Math.round(mr * 0.18));
  const chars = [...ring], stp = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    ctx.save(); ctx.rotate(i * stp); ctx.translate(0, -(mr - mr * 0.21)); ctx.textAlign = 'center'; ctx.fillText(ch, 0, 0); ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.font = font(700, Math.round(mr * 0.34));
  ctx.fillText('NOV', 0, mr * 0.04);
  ctx.font = font(600, Math.round(mr * 0.22));
  ctx.fillText('2026', 0, mr * 0.3);
  ctx.lineWidth = 2.2;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let x = -mr - 8; x >= -mr * s.lines; x -= 4) {
      const yy = k * 14 - (s.lines < 3 ? 22 : 0) + Math.sin(x / 10) * 4;
      if (x === -mr - 8) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
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

/** Parámetros de FFmpeg derivados del layout (render del servidor). */
export function ffmpegGeometry(L: Layout) {
  const { videoBox: b, videoRect: r } = L;
  return {
    scale: { w: r.w, h: r.h },
    crop: { w: b.w, h: b.h, x: b.x - r.x, y: b.y - r.y },
    place: { x: b.x, y: b.y },
    size: { w: L.W, h: L.H },
  };
}
