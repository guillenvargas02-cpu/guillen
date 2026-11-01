import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { q, q1 } from './db';
import { sha256 } from './secret';
import { HttpError } from './http';

export type Role = 'admin' | 'programa' | 'moderacion';
export type Staff = { id: string; email: string; name: string; role: Role };

const COOKIE = 'everest_staff';
const TTL_HOURS = 14;

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administración',
  programa: 'Programa y avisos',
  moderacion: 'Moderación',
};

/** Permisos por área. */
export const CAN = {
  program: ['admin', 'programa'] as Role[],
  notices: ['admin', 'programa'] as Role[],
  moderate: ['admin', 'moderacion'] as Role[],
  dynamics: ['admin', 'moderacion'] as Role[],
  exports: ['admin', 'moderacion'] as Role[],
  event: ['admin', 'programa'] as Role[],
  users: ['admin'] as Role[],
  demo: ['admin'] as Role[],
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + TTL_HOURS * 3600_000);
  await q(`insert into staff_sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`, [sha256(token), userId, expires]);
  await q(`update staff_users set last_login_at = now() where id = $1`, [userId]);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q(`delete from staff_sessions where token_hash = $1`, [sha256(token)]);
  jar.delete(COOKIE);
}

export async function currentStaff(): Promise<Staff | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return q1<Staff>(
    `select u.id, u.email, u.name, u.role from staff_sessions s join staff_users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now() and u.active`,
    [sha256(token)],
  );
}

export async function requireStaff(roles?: Role[]): Promise<Staff> {
  const s = await currentStaff();
  if (!s) throw new HttpError(401, 'SESION', 'Inicia sesión para continuar.');
  if (roles && !roles.includes(s.role)) throw new HttpError(403, 'PERMISO', 'Tu rol no tiene permiso para esta acción.');
  return s;
}

export async function audit(user: Staff | null, action: string, target?: string, details?: unknown) {
  await q(`insert into audit_log (user_id, action, target, details) values ($1, $2, $3, $4)`, [
    user?.id ?? null, action, target ?? null, details ? JSON.stringify(details) : null,
  ]).catch(() => {});
}
