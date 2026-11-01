/**
 * Genera los contornos de la palabra EVEREST para la postal.
 * Fuente: Anton (SIL OFL 1.1) — grotesca compresa de alto contraste de masa, elegida
 * para que la palabra gane altura en el formato vertical sin deformar los caracteres.
 *
 * Los contornos quedan como datos (src/postcard/lettering.ts) para que la
 * previsualización (navegador) y el render del servidor usen exactamente la
 * misma máscara, sin depender de la medición de texto de cada motor.
 */
import * as fontkit from 'fontkit';
import fs from 'node:fs';
import path from 'node:path';

const WORD = 'EVEREST';
const variants = {
  anton: 'assets/source/Anton-Regular.ttf',
} as const;

const out: Record<string, unknown> = {};
for (const [key, file] of Object.entries(variants)) {
  const font = fontkit.openSync(path.resolve(file)) as fontkit.Font;
  const run = font.layout(WORD);
  // Normalizamos: altura de mayúscula = 1000 unidades, línea base en y = 0, y hacia abajo.
  const s = 1000 / font.capHeight;
  let x = 0;
  const glyphs: { d: string; x: number; advance: number }[] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  run.glyphs.forEach((g, i) => {
    const p = g.path.scale(s, -s).translate(x, 0);
    const bb = p.bbox;
    minX = Math.min(minX, bb.minX); maxX = Math.max(maxX, bb.maxX);
    minY = Math.min(minY, bb.minY); maxY = Math.max(maxY, bb.maxY);
    const d = p.toSVG().replace(/(\d+\.\d{2})\d+/g, '$1');
    const advance = run.positions[i].xAdvance * s;
    glyphs.push({ d, x: Math.round(x * 100) / 100, advance: Math.round(advance * 100) / 100 });
    x += advance;
  });
  out[key] = {
    glyphs,
    bbox: { minX: +minX.toFixed(2), maxX: +maxX.toFixed(2), minY: +minY.toFixed(2), maxY: +maxY.toFixed(2) },
    advance: +x.toFixed(2),
  };
}

const ts = `// Archivo generado por scripts/build-lettering.ts — no editar a mano.
// Contornos de "${WORD}" en Anton (SIL OFL 1.1). Unidades: altura de mayúscula = 1000, línea base y = 0.
export type LetteringVariant = {
  glyphs: { d: string; x: number; advance: number }[];
  bbox: { minX: number; maxX: number; minY: number; maxY: number };
  advance: number;
};
export const LETTERING: Record<'anton', LetteringVariant> = ${JSON.stringify(out, null, 2)};
`;
fs.writeFileSync('src/postcard/lettering.ts', ts);
console.log('ok', Object.keys(out));
