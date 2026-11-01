import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkWord } from '../../src/lib/words';
import { strokesToSvg, validateStrokes } from '../../src/lib/signature';
import { cleanText, charCount } from '../../src/lib/text';
import { coverRect, sanitizeInput } from '../../src/postcard/compose';
import { cdmxLocalToIso, isoToCdmxLocal } from '../../src/lib/event';

test('palabras: agrupa mayúsculas y espacios, conserva distinciones del español', () => {
  const a = checkWord('  UNIDAD '), b = checkWord('unidad');
  assert.ok(a.ok && b.ok && a.key === b.key && a.display === 'Unidad');
  const y = checkWord('Año'), n = checkWord('ano');
  assert.ok(y.ok && n.ok && y.key !== n.key);
  assert.ok(checkWord('Ñandú').ok);
  assert.ok(checkWord('bien-estar').ok);
});

test('palabras: frases, símbolos y longitudes', () => {
  const f = checkWord('una gran noche');
  assert.ok(!f.ok && f.reason === 'frase');
  assert.ok(!checkWord('h0la').ok);
  assert.ok(!checkWord('a').ok);
  assert.ok(!checkWord('x'.repeat(30)).ok);
  assert.ok(checkWord('¡Inspiración!').ok);
});

test('firma: valida, limita y genera SVG seguro recortado', () => {
  const s = validateStrokes([[[100, 100, 0.5], [200, 150, 0.5], [300, 120]]])!;
  const svg = strokesToSvg(s);
  assert.match(svg, /^<svg[^>]+viewBox="0 0 224 74"/);
  assert.doesNotMatch(svg, /script|on\w+=/i);
  assert.throws(() => validateStrokes([[['<script>', 1]]]));
  assert.throws(() => validateStrokes(Array.from({ length: 200 }, () => [[1, 1]])));
  assert.equal(validateStrokes([]), null);
});

test('texto: limpia controles y cuenta grafemas', () => {
  assert.equal(cleanText('  hola\u0000  mundo ​ '), 'hola mundo');
  assert.equal(charCount('ñandú'), 5);
});

test('postal: encuadre "cover" sin deformar y con números pares', () => {
  const r = coverRect({ x: 66, y: 260, w: 948, h: 282 }, { x: 0.5, y: 0.22 });
  assert.equal(r.w % 2, 0); assert.equal(r.h % 2, 0);
  assert.ok(Math.abs(r.w / r.h - 16 / 9) < 0.01);
  assert.ok(r.x <= 66 && r.y <= 260 && r.x + r.w >= 66 + 948 && r.y + r.h >= 260 + 282);
  assert.equal(sanitizeInput({ name: 'x'.repeat(80), format: 'vertical' }).name!.length, 40);
  assert.equal(sanitizeInput({ format: 'horizontal' }).name, '');
});

test('fechas: hora de Ciudad de México', () => {
  assert.equal(cdmxLocalToIso('2026-11-03T17:00'), '2026-11-03T23:00:00.000Z');
  assert.equal(isoToCdmxLocal('2026-11-03T23:00:00.000Z'), '2026-11-03T17:00');
});
