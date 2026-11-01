import 'server-only';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { sign, verify } from './secret';

/**
 * Identidad anónima del invitado: un UUID firmado en una cookie httpOnly.
 * No se piden correo ni teléfono. Sirve para: una respuesta por pregunta,
 * límites de envío y recuperar las propias aportaciones.
 */
const COOKIE = 'everest_guest';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function readGuestId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split('.');
  if (!id || !sig || !UUID_RE.test(id) || !verify(id, sig)) return null;
  return id;
}

export async function ensureGuestId(): Promise<string> {
  const existing = await readGuestId();
  if (existing) return existing;
  const id = randomUUID();
  const jar = await cookies();
  jar.set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return id;
}
