// Validación y normalización de "una palabra" (compartido cliente/servidor).

export const WORD_MIN = 2;
export const WORD_MAX = 24;

export type WordCheck =
  | { ok: true; display: string; key: string }
  | { ok: false; reason: 'vacia' | 'frase' | 'corta' | 'larga' | 'caracteres'; message: string };

/**
 * - Acepta letras con acentos, ñ y ü (cualquier letra Unicode), y guion o apóstrofo internos.
 * - Agrupa diferencias de mayúsculas y espacios: "  Unidad " y "UNIDAD" cuentan juntas.
 * - Conserva distinciones relevantes del español: "año" ≠ "ano", "papá" ≠ "papa".
 */
export function checkWord(input: string): WordCheck {
  const s = (input ?? '').normalize('NFC').replace(/[​-‏]/g, '').trim().replace(/[.!¡?¿,;:]+$/u, '').replace(/^[¡¿"“'«]+|["”'»]+$/gu, '');
  if (!s) return { ok: false, reason: 'vacia', message: 'Escribe una palabra.' };
  if (/\s/.test(s)) {
    return {
      ok: false,
      reason: 'frase',
      message: 'Parece una frase. Aquí buscamos una sola palabra: ¿cuál la resume mejor? Puedes contarnos más en el muro.',
    };
  }
  if (!/^[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*$/u.test(s)) {
    return { ok: false, reason: 'caracteres', message: 'Usa solo letras (se valen acentos y ñ), sin números ni símbolos.' };
  }
  const len = [...s].length;
  if (len < WORD_MIN) return { ok: false, reason: 'corta', message: 'Esa palabra es muy corta. Prueba con otra.' };
  if (len > WORD_MAX) return { ok: false, reason: 'larga', message: `Usa una palabra de hasta ${WORD_MAX} letras.` };
  const key = s.toLocaleLowerCase('es-MX').replace(/’/g, "'");
  const display = key.charAt(0).toLocaleUpperCase('es-MX') + key.slice(1);
  return { ok: true, display, key };
}

export const WORD_QUESTIONS = {
  somos: { id: 'somos', label: 'Para ti, ¿qué es SOMOS en una palabra?', short: 'SOMOS en una palabra' },
  noche: { id: 'noche', label: 'Define esta noche en una palabra', short: 'Esta noche en una palabra' },
} as const;
export type WordQuestion = keyof typeof WORD_QUESTIONS;
