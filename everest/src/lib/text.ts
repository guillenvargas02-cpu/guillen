// Limpieza de texto compartida (servidor y cliente).

/** Normaliza a NFC, elimina caracteres de control y espacios sobrantes. */
export function cleanText(input: string, { multiline = false } = {}): string {
  let s = (input ?? '').normalize('NFC');
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '');
  if (multiline) {
    s = s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
    s = s.split('\n').map((l) => l.trim()).join('\n');
  } else {
    s = s.replace(/\s+/g, ' ');
  }
  return s.trim();
}

/** Longitud en caracteres visibles (grafemas), para contadores consistentes. */
export function charCount(s: string): number {
  return [...(s ?? '').normalize('NFC')].length;
}
