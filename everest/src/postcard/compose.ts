// Composición de la postal EVEREST — módulo ÚNICO compartido por la previsualización
// (navegador, <canvas> + <video>) y el render del servidor (@napi-rs/canvas + FFmpeg).
//
// La postal se construye en dos capas con la misma geometría:
//   1. Video: el paisaje, escalado sin deformar ("cover") dentro de la caja de la palabra.
//   2. Capa gráfica (PNG con alfa): papel, marco, textos, logo, contorno y profundidad
//      de las letras. El interior de las letras es TRANSPARENTE: por ahí se ve el video.
//      Los huecos interiores de los caracteres (la R) siguen siendo papel.
// Todos los números (tipografía, máscara, encuadre, posiciones, tiempos) salen de aquí.

import { LETTERING, type LetteringVariant } from './lettering';
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

export const COLORS = { paper: '#F7F3EB', ink: '#141414', white: '#FFFFFF', rosa: ROSA, muted: '#5B5751' } as const;
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
  arc(x: number, y: number, r: number, a0: number, a1: number): void; closePath(): void;
  fill(...args: any[]): void; stroke(...args: any[]): void; clip(...args: any[]): void;
  fillText(t: string, x: number, y: number): void;
  measureText(t: string): { width: number };
  clearRect(x: number, y: number, w: number, h: number): void;
};
export type PathCtor = new (d?: string) => any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────── Utilidades de texto ───────────────────────────
const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

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
  // Último recurso: tamaño mínimo y cortes dentro de palabras muy largas.
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

// ─────────────────────────── Geometría de las letras ───────────────────────────
function transformPath(d: string, s: number, tx: number, ty: number): string {
  let i = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (n) => {
    const v = parseFloat(n);
    const out = i % 2 === 0 ? v * s + tx : v * s + ty;
    i++;
    return (Math.round(out * 100) / 100).toString();
  });
}

export type Rect = { x: number; y: number; w: number; h: number };

export type Layout = {
  format: Format; W: number; H: number;
  lettering: { d: string; scale: number; box: Rect; depth: number; outline: number; keyline: number };
  /** Caja visible del video (= caja de la palabra) y rectángulo "cover" del video completo. */
  videoBox: Rect;
  videoRect: Rect;
  focus: { x: number; y: number };
  blocks: Record<string, unknown>;
};

const LETTER_SPEC: Record<Format, { variant: keyof typeof LETTERING; width: number; top: number; depth: number; outline: number; keyline: number; focus: { x: number; y: number } }> = {
  vertical: { variant: 'anton', width: 944, top: 262, depth: 16, outline: 6, keyline: 4, focus: { x: 0.5, y: 0.22 } },
  horizontal: { variant: 'anton', width: 1300, top: 168, depth: 16, outline: 7, keyline: 5, focus: { x: 0.5, y: 0.25 } },
};

function letterGeometry(format: Format) {
  const spec = LETTER_SPEC[format];
  const v: LetteringVariant = LETTERING[spec.variant];
  const { W } = { W: FORMATS[format].w };
  const unitsW = v.bbox.maxX - v.bbox.minX;
  const s = spec.width / unitsW;
  const tx = (W - spec.width) / 2 - v.bbox.minX * s;
  const ty = spec.top - v.bbox.minY * s;
  const d = v.glyphs.map((g) => transformPath(g.d, s, tx, ty)).join(' ');
  const box: Rect = {
    x: Math.floor(v.bbox.minX * s + tx) - 2,
    y: Math.floor(v.bbox.minY * s + ty) - 2,
    w: 0, h: 0,
  };
  box.w = Math.ceil(v.bbox.maxX * s + tx) + 2 - box.x;
  box.h = Math.ceil(v.bbox.maxY * s + ty) + 2 - box.y;
  // Dimensiones pares (requisito de yuv420p al recortar en FFmpeg).
  box.x -= box.x % 2; box.y -= box.y % 2; box.w += box.w % 2; box.h += box.h % 2;
  return { d, scale: s, box, spec };
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

// ─────────────────────────── Layout completo ───────────────────────────
export function computeLayout(ctx: Ctx, raw: PostcardInput): Layout {
  const input = sanitizeInput(raw);
  const { w: W, h: H } = FORMATS[input.format];
  const g = letterGeometry(input.format);
  const lettering = { d: g.d, scale: g.scale, box: g.box, depth: g.spec.depth, outline: g.spec.outline, keyline: g.spec.keyline };
  const videoBox = g.box;
  const videoRect = coverRect(videoBox, g.spec.focus);
  const name = input.name || 'Tu nombre';
  const blocks: Record<string, unknown> = {};

  if (input.format === 'vertical') {
    const textW = W - 2 * 128;
    const nameFit = fitText(ctx, name, { weight: 700, max: 104, min: 54, width: textW, maxLines: 2 });
    const phraseFit = input.phrase
      ? fitText(ctx, `“${input.phrase}”`, { weight: 400, max: 50, min: 34, width: textW, maxLines: 3 })
      : null;
    // Bloque personal centrado en el espacio libre entre el subtítulo y el pie.
    const subY = videoBox.y + videoBox.h + g.spec.depth + 84;
    const nameLH = nameFit.size * 1.04;
    const phraseLH = phraseFit ? phraseFit.size * 1.32 : 0;
    const blockH = 30 + 36 + nameFit.lines.length * nameLH + (phraseFit ? 34 + phraseFit.lines.length * phraseLH : 0);
    const top = subY + 40, bottom = 1360;
    const start = Math.round(top + (bottom - top - blockH) / 2);
    blocks.label = { y: 196 };
    blocks.subtitle = { y: subY };
    blocks.postmark = { x: W - 206, y: 1414, r: 88, lines: 1.9 };
    blocks.personal = { start, nameFit, phraseFit, nameLH, phraseLH, textW };
    blocks.footer = { y: 1560 };
    blocks.logoPanel = { x: 56, y: 1690, w: W - 112, h: H - 56 - 1690 };
  } else {
    const textW = 840;
    const nameFit = fitText(ctx, name, { weight: 700, max: 92, min: 50, width: textW, maxLines: 2 });
    const phraseFit = input.phrase
      ? fitText(ctx, `“${input.phrase}”`, { weight: 400, max: 40, min: 28, width: textW, maxLines: 2 })
      : null;
    const subY = videoBox.y + videoBox.h + g.spec.depth + 62;
    const nameLH = nameFit.size * 1.04;
    const phraseLH = phraseFit ? phraseFit.size * 1.3 : 0;
    const blockH = 28 + 26 + nameFit.lines.length * nameLH + (phraseFit ? 24 + phraseFit.lines.length * phraseLH : 0);
    const top = subY + 40, bottom = H - 96;
    const start = Math.round(top + (bottom - top - blockH) / 2);
    blocks.label = { y: 124 };
    blocks.subtitle = { y: subY };
    blocks.postmark = { x: 1168, y: subY + 168, r: 74, lines: 1.5 };
    blocks.personal = { start, nameFit, phraseFit, nameLH, phraseLH, textW, x: 150 };
    blocks.logoPanel = { x: 1250, y: top + 10, w: 560, h: bottom - top - 10 };
  }
  return { format: input.format, W, H, lettering, videoBox, videoRect, focus: g.spec.focus, blocks };
}

// ─────────────────────────── Dibujo de la capa gráfica ───────────────────────────
type NameFit = { size: number; lines: string[] };

/**
 * Dibuja la capa gráfica completa. Deja transparente SOLO el interior de las letras.
 * `Path2D` se inyecta para usar la implementación de cada motor.
 */
export function drawOverlay(ctx: Ctx, Path2D: PathCtor, raw: PostcardInput, layout?: Layout): Layout {
  const input = sanitizeInput(raw);
  const L = layout ?? computeLayout(ctx, input);
  const { W, H } = L;
  const c = COLORS;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // Papel
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, W, H);

  // Marco: filete negro exterior + filete rosa interior + esquinas.
  ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
  ctx.strokeRect(38.5, 38.5, W - 77, H - 77);
  ctx.strokeStyle = c.rosa; ctx.lineWidth = 1.5;
  ctx.strokeRect(52.75, 52.75, W - 105.5, H - 105.5);
  for (const [x, y] of [[52.75, 52.75], [W - 52.75, 52.75], [52.75, H - 52.75], [W - 52.75, H - 52.75]]) {
    ctx.fillStyle = c.rosa;
    ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.fill();
  }

  const B = L.blocks as Record<string, Record<string, number> & Record<string, unknown>>;

  // Encabezado
  ctx.fillStyle = c.ink;
  ctx.font = font(600, 28);
  drawTracked(ctx, 'SALUDOS DESDE LA CIMA', W / 2, B.label.y, 9);
  ctx.fillStyle = c.rosa;
  ctx.fillRect(W / 2 - 28, B.label.y + 26, 56, 3);

  // Letras: profundidad → contorno → interior transparente → filete interior rosa.
  const glyphs = new Path2D(L.lettering.d);
  const { depth, outline, keyline } = L.lettering;
  ctx.fillStyle = c.ink;
  for (let i = depth; i >= 1; i--) {
    ctx.save(); ctx.translate(i * 0.75, i); ctx.fill(glyphs); ctx.restore();
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

  // Subtítulo del evento (separado del logo)
  ctx.fillStyle = c.ink;
  ctx.font = font(500, L.format === 'vertical' ? 31 : 30);
  drawTracked(ctx, 'NUESTRA CIMA, NUESTRO FUTURO', W / 2, B.subtitle.y, L.format === 'vertical' ? 7.5 : 9);

  // Bloque personal
  const P = B.personal as unknown as { start: number; nameFit: NameFit; phraseFit: NameFit | null; nameLH: number; phraseLH: number; textW: number; x?: number };
  const align: 'center' | 'left' = L.format === 'vertical' ? 'center' : 'left';
  const px = align === 'center' ? W / 2 : (P.x as number);
  let y = P.start;
  ctx.fillStyle = c.rosa;
  ctx.font = font(600, L.format === 'vertical' ? 26 : 24);
  y += 26;
  drawTracked(ctx, 'POSTAL DE', px, y, 7, align);
  y += L.format === 'vertical' ? 40 : 30;
  ctx.fillStyle = c.ink;
  ctx.font = font(700, P.nameFit.size);
  ctx.textAlign = align;
  for (const line of P.nameFit.lines) {
    y += P.nameLH;
    ctx.fillText(line, px, y - P.nameFit.size * 0.18);
  }
  if (P.phraseFit) {
    y += L.format === 'vertical' ? 34 : 24;
    ctx.fillStyle = c.muted;
    ctx.font = font(400, P.phraseFit.size);
    for (const line of P.phraseFit.lines) {
      y += P.phraseLH;
      ctx.fillText(line, px, y - P.phraseFit.size * 0.3);
    }
  }

  // Pie: fecha y sede
  if (L.format === 'vertical') {
    const fy = B.footer.y as number;
    ctx.fillStyle = c.ink;
    ctx.fillRect(W / 2 - 200, fy - 58, 400, 1.5);
    ctx.font = font(600, 28);
    drawTracked(ctx, 'MARTES 3 DE NOVIEMBRE DE 2026', W / 2, fy, 4.5);
    ctx.font = font(400, 24);
    ctx.fillStyle = c.muted;
    drawTracked(ctx, 'SALÓN REPÚBLICA · HOTEL DEL EJÉRCITO Y FUERZA AÉREA', W / 2, fy + 40, 2);
    drawTracked(ctx, 'ORGANIZA SOMOS MIGUEL HIDALGO', W / 2, fy + 76, 2);
  }

  const PM = B.postmark as unknown as { x: number; y: number; r: number; lines: number };
  drawPostmark(ctx, PM.x, PM.y, PM.r, PM.lines);

  // Panel blanco con el logotipo oficial (positivo, rosa sobre blanco, con área de seguridad)
  const LP = B.logoPanel as unknown as Rect;
  ctx.fillStyle = c.white;
  ctx.fillRect(LP.x, LP.y, LP.w, LP.h);
  ctx.fillStyle = c.ink;
  ctx.fillRect(LP.x, LP.y, LP.w, 1.5);
  if (L.format === 'vertical') {
    drawLogo(ctx, Path2D, W / 2, LP.y + LP.h / 2, 300);
  } else {
    ctx.fillRect(LP.x, LP.y, 1.5, LP.h);
    const cx = LP.x + LP.w / 2;
    ctx.font = font(600, 24);
    ctx.fillStyle = c.ink;
    drawTracked(ctx, 'MARTES 3 DE NOVIEMBRE DE 2026', cx, LP.y + 74, 3.5);
    ctx.font = font(400, 21);
    ctx.fillStyle = c.muted;
    drawTracked(ctx, 'SALÓN REPÚBLICA · CIUDAD DE MÉXICO', cx, LP.y + 110, 2);
    ctx.fillStyle = c.rosa;
    ctx.fillRect(cx - 22, LP.y + 136, 44, 2.5);
    drawLogo(ctx, Path2D, cx, LP.y + LP.h - 118, 290);
    ctx.font = font(400, 20);
    ctx.fillStyle = c.muted;
    drawTracked(ctx, 'ORGANIZA SOMOS MIGUEL HIDALGO', cx, LP.y + LP.h - 32, 2);
  }

  ctx.restore();
  return L;
}

/** Matasellos rosa: detalle discreto de colección. */
function drawPostmark(ctx: Ctx, cx: number, cy: number, r: number, lines: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.strokeStyle = COLORS.rosa; ctx.fillStyle = COLORS.rosa; ctx.globalAlpha = 0.92;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r - 30, 0, Math.PI * 2); ctx.stroke();
  // Texto circular
  const ring = 'CIUDAD DE MÉXICO • MIGUEL HIDALGO • ';
  ctx.font = font(600, Math.round(r * 0.17));
  const chars = [...ring];
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    ctx.save();
    ctx.rotate(i * step);
    ctx.translate(0, -(r - 22));
    ctx.textAlign = 'center';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.font = font(700, Math.round(r * 0.36));
  ctx.fillText('3·XI', 0, r * 0.08);
  ctx.font = font(600, Math.round(r * 0.19));
  ctx.fillText('2026', 0, r * 0.34);
  // Líneas de cancelación
  ctx.lineWidth = 2.5;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let x = -r * (1 + lines); x <= -r - 10; x += 4) {
      const y = k * 18 + Math.sin(x / 11) * 5;
      if (x === -r * (1 + lines)) ctx.moveTo(x, y); else ctx.lineTo(x, y);
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
