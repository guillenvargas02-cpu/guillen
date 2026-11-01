import { z } from 'zod';
import { q1 } from '@/lib/db';
import { audit, createSession } from '@/lib/auth';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { checkPassword } from '@/lib/password';
import { rateLimit } from '@/lib/rate';
import { ipHash } from '@/lib/secret';

export const runtime = 'nodejs';
const Body = z.object({ email: z.string().max(200), password: z.string().max(200) });

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const b = Body.parse(await readJson(req));
  const email = b.email.trim().toLowerCase();
  await rateLimit(`login:ip:${ipHash(req)}`, 10, 600, 'Demasiados intentos. Espera unos minutos.');
  await rateLimit(`login:e:${email}`, 8, 600, 'Demasiados intentos para esta cuenta. Espera unos minutos.');
  const u = await q1<{ id: string; email: string; name: string; role: 'admin'; password_hash: string; active: boolean }>(
    `select id, email, name, role, password_hash, active from staff_users where email = $1`, [email],
  );
  const ok = u && u.active && (await checkPassword(b.password, u.password_hash));
  if (!ok) throw new HttpError(401, 'CREDENCIALES', 'Correo o contraseña incorrectos.');
  await createSession(u.id);
  await audit({ id: u.id, email: u.email, name: u.name, role: u.role }, 'login');
  return json({ ok: true, name: u.name, role: u.role });
});
