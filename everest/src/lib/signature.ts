// Firma manuscrita: validación de trazos y generación de SVG seguro.
// El SVG lo genera el servidor a partir de números validados: nunca se guarda
// marcado proporcionado por el navegador.

export const SIG_W = 1000;
export const SIG_H = 400;
export const SIG_MAX_STROKES = 80;
export const SIG_MAX_POINTS = 6000;

export type Point = [number, number, number]; // x, y, presión (0–1)
export type Strokes = Point[][];

export function validateStrokes(input: unknown): Strokes | null {
  if (input == null) return null;
  if (!Array.isArray(input)) throw new Error('FIRMA_INVALIDA');
  if (input.length === 0) return null;
  if (input.length > SIG_MAX_STROKES) throw new Error('FIRMA_DEMASIADO_COMPLEJA');
  let total = 0;
  const out: Strokes = [];
  for (const stroke of input) {
    if (!Array.isArray(stroke) || stroke.length === 0) throw new Error('FIRMA_INVALIDA');
    const s: Point[] = [];
    for (const p of stroke) {
      if (!Array.isArray(p) || p.length < 2) throw new Error('FIRMA_INVALIDA');
      const x = Number(p[0]), y = Number(p[1]), pr = p.length > 2 ? Number(p[2]) : 0.5;
      if (![x, y, pr].every(Number.isFinite)) throw new Error('FIRMA_INVALIDA');
      s.push([clamp(x, 0, SIG_W), clamp(y, 0, SIG_H), clamp(pr, 0, 1)]);
    }
    total += s.length;
    if (total > SIG_MAX_POINTS) throw new Error('FIRMA_DEMASIADO_COMPLEJA');
    out.push(s);
  }
  return out;
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(v * 10) / 10));
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Trazo suavizado con curvas cuadráticas entre puntos medios. */
export function strokePath(points: Point[], ox = 0, oy = 0): string {
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M${r1(x - ox)} ${r1(y - oy)}l0.1 0`;
  }
  let d = `M${r1(points[0][0] - ox)} ${r1(points[0][1] - oy)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += `Q${r1(x - ox)} ${r1(y - oy)} ${r1((x + nx) / 2 - ox)} ${r1((y + ny) / 2 - oy)}`;
  }
  const last = points[points.length - 1];
  d += `L${r1(last[0] - ox)} ${r1(last[1] - oy)}`;
  return d;
}

export function strokeWidth(points: Point[]): number {
  const avg = points.reduce((a, p) => a + p[2], 0) / points.length;
  return r1(4 + avg * 4); // 4–8 unidades
}

/** SVG recortado al contenido, con margen, tinta negra y sin fondo. */
export function strokesToSvg(strokes: Strokes): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) for (const [x, y] of s) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const pad = 12;
  const ox = minX - pad, oy = minY - pad;
  const w = r1(maxX - minX + pad * 2), h = r1(maxY - minY + pad * 2);
  const paths = strokes
    .map((s) => `<path d="${strokePath(s, ox, oy)}" stroke-width="${strokeWidth(s)}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g fill="none" stroke="#111111" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
}
