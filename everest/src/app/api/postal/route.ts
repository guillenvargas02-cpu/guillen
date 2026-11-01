import { z } from 'zod';
import { q1 } from '@/lib/db';
import { ensureGuestId } from '@/lib/guest';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate';
import { ipHash } from '@/lib/secret';
import { cleanText, charCount } from '@/lib/text';
import { LIMITS } from '@/postcard/compose';
import { getSettings } from '@/lib/public-data';

export const runtime = 'nodejs';

const Body = z.object({
  client_id: z.string().uuid(),
  name: z.string().optional().default(''),
  format: z.enum(['vertical', 'horizontal']),
});
const MAX_QUEUE = Number(process.env.RENDER_MAX_QUEUE ?? 60);

/** Crea un trabajo de render. No exige haber participado en otras dinámicas ni autorizar publicación. */
export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const b = Body.parse(await readJson(req));
  // El nombre es opcional: sin nombre, la postal lleva solo el evento, el lugar y la fecha.
  const name = cleanText(b.name);
  if (charCount(name) > LIMITS.name) throw new HttpError(422, 'NOMBRE', `El nombre puede tener hasta ${LIMITS.name} caracteres.`);
  const settings = await getSettings();
  if (!settings.postal_open) throw new HttpError(423, 'CERRADO', 'La postal no está disponible en este momento.');
  const guest = await ensureGuestId();

  const prev = await q1<{ id: string }>(`select id from render_jobs where client_id = $1 and guest_id = $2`, [b.client_id, guest]);
  if (prev) return json({ ok: true, id: prev.id, duplicate: true });
  // Misma postal ya generada: reutilizarla.
  const params = { name, format: b.format };
  const same = await q1<{ id: string }>(
    `select id from render_jobs where guest_id = $1 and params = $2::jsonb and status in ('queued','rendering','done')
      order by created_at desc limit 1`, [guest, JSON.stringify(params)],
  );
  if (same) return json({ ok: true, id: same.id, reused: true });

  await rateLimit(`postal:g:${guest}`, 8, 900, 'Ya generaste varias postales. Espera unos minutos para crear otra.');
  await rateLimit(`postal:ip:${ipHash(req)}`, 60, 900);
  const queued = await q1<{ n: number }>(`select count(*)::int as n from render_jobs where status in ('queued','rendering')`);
  if ((queued?.n ?? 0) >= MAX_QUEUE) {
    throw new HttpError(503, 'COLA_LLENA', 'Hay muchas postales en preparación. Inténtalo de nuevo en un minuto; tus datos se conservan.');
  }
  const row = await q1<{ id: string }>(
    `insert into render_jobs (client_id, guest_id, format, params) values ($1,$2,$3,$4) returning id`,
    [b.client_id, guest, b.format, JSON.stringify(params)],
  );
  return json({ ok: true, id: row!.id });
});
