import 'server-only';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.');
    return 'dev-only-secret-change-me-dev-only-secret';
  }
  return s;
}

export function sign(value: string): string {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url').slice(0, 32);
}

export function verify(value: string, sig: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function sha256(v: string): string {
  return createHash('sha256').update(v).digest('hex');
}

/** Huella no reversible de la IP para límites de envío (no se guarda la IP). */
export function ipHash(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = fwd || req.headers.get('x-real-ip') || 'local';
  return createHmac('sha256', sessionSecret()).update('ip:' + ip).digest('hex').slice(0, 24);
}
