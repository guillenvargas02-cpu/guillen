/* Cerebro holográfico en vista lateral (lóbulo frontal a la izquierda).
   Coordenadas normalizadas: x -1..1, y -0.9..0.8. Se escalan en el motor. */

export const OUTLINE = [
  [-0.95, -0.05], [-0.98, 0.14], [-0.92, 0.34], [-0.80, 0.50], [-0.64, 0.63], [-0.45, 0.72], [-0.22, 0.78],
  [0.02, 0.80], [0.24, 0.77], [0.44, 0.69], [0.62, 0.56], [0.77, 0.40], [0.88, 0.22], [0.94, 0.03],
  [0.93, -0.12], [0.86, -0.24], [0.74, -0.31], [0.58, -0.30], [0.44, -0.29], [0.30, -0.35], [0.12, -0.41],
  [-0.08, -0.45], [-0.27, -0.46], [-0.42, -0.42], [-0.50, -0.33], [-0.55, -0.24], [-0.66, -0.21],
  [-0.80, -0.19], [-0.90, -0.13]
];

export const SULCI = [
  [[0.08, 0.79], [0.02, 0.60], [0.07, 0.44], [-0.01, 0.27], [0.03, 0.10], [-0.02, 0.0]],           // central
  [[-0.14, 0.77], [-0.19, 0.58], [-0.14, 0.42], [-0.21, 0.25], [-0.17, 0.07]],                      // precentral
  [[0.27, 0.74], [0.21, 0.56], [0.27, 0.40], [0.20, 0.24], [0.25, 0.10]],                           // poscentral
  [[-0.57, -0.21], [-0.36, -0.12], [-0.12, -0.06], [0.12, 0.01], [0.33, 0.09], [0.46, 0.20]],       // cisura lateral
  [[-0.44, -0.33], [-0.18, -0.25], [0.08, -0.20], [0.32, -0.13], [0.55, -0.05], [0.66, 0.04]],      // temporal superior
  [[-0.30, -0.42], [-0.06, -0.36], [0.18, -0.31], [0.40, -0.25]],                                    // temporal inferior
  [[-0.88, 0.40], [-0.70, 0.52], [-0.50, 0.55], [-0.34, 0.62]],                                      // frontal superior
  [[-0.92, 0.18], [-0.74, 0.26], [-0.56, 0.22], [-0.42, 0.32], [-0.30, 0.18]],                       // frontal inferior
  [[-0.82, 0.31], [-0.64, 0.39], [-0.50, 0.36], [-0.40, 0.46]],                                      // frontal medio
  [[-0.70, 0.06], [-0.55, 0.09], [-0.42, 0.04], [-0.33, 0.10]],                                      // opérculo
  [[0.36, 0.58], [0.50, 0.48], [0.62, 0.42], [0.72, 0.26]],                                          // parietal
  [[0.31, 0.38], [0.46, 0.31], [0.57, 0.20], [0.74, 0.10]],                                          // intraparietal
  [[0.70, -0.02], [0.80, -0.08], [0.88, -0.17]],                                                     // occipital
  [[0.55, 0.62], [0.66, 0.50], [0.80, 0.36]]                                                          // parieto-occipital
];

export const CEREBELLUM = { cx: 0.62, cy: -0.47, rx: 0.33, ry: 0.17 };
export const STEM = [[0.30, -0.38], [0.33, -0.60], [0.37, -0.88]];

export function inside(x, y) {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export function inCerebellum(x, y) {
  const { cx, cy, rx, ry } = CEREBELLUM; const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy < 1;
}
/* profundidad (z) aproximada de la superficie frontal en (x, y) */
export function depth(x, y) {
  const r = Math.min(1, Math.hypot(x / 0.98, (y - 0.17) / 0.66));
  return Math.sqrt(Math.max(0, 1 - r * r)) * 0.42;
}
