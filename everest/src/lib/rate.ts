import 'server-only';
import { q, q1 } from './db';
import { HttpError } from './http';

/** Límite deslizante compartido entre instancias (tabla rate_hits). */
export async function rateLimit(key: string, max: number, windowSec: number, message?: string) {
  const row = await q1<{ n: number }>(
    `select count(*)::int as n from rate_hits where key = $1 and at > now() - make_interval(secs => $2)`,
    [key, windowSec],
  );
  if ((row?.n ?? 0) >= max) {
    throw new HttpError(429, 'LIMITE', message ?? 'Vas muy rápido. Espera un momento y vuelve a intentarlo.');
  }
  await q(`insert into rate_hits (key) values ($1)`, [key]);
  if (Math.random() < 0.02) q(`delete from rate_hits where at < now() - interval '1 day'`).catch(() => {});
}
