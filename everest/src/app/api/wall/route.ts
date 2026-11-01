import { z } from 'zod';
import { q1 } from '@/lib/db';
import { ensureGuestId } from '@/lib/guest';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate';
import { ipHash } from '@/lib/secret';
import { charCount, cleanText } from '@/lib/text';
import { getSettings } from '@/lib/public-data';

export const runtime = 'nodejs';

const Body = z.object({
  client_id: z.string().uuid('Identificador de envío inválido.'),
  prompt: z.enum(['llevas', 'expectativa']),
  display_name: z.string(),
  body: z.string(),
  consent_public: z.boolean().default(false),
});

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const b = Body.parse(await readJson(req));
  const name = cleanText(b.display_name);
  const body = cleanText(b.body, { multiline: true });
  if (charCount(name) < 1 || charCount(name) > 60) throw new HttpError(422, 'NOMBRE', 'Escribe el nombre que quieres mostrar (hasta 60 caracteres).');
  if (charCount(body) < 2) throw new HttpError(422, 'MENSAJE', 'Escribe tu mensaje.');
  if (charCount(body) > 280) throw new HttpError(422, 'MENSAJE', 'Tu mensaje puede tener hasta 280 caracteres.');

  const guest = await ensureGuestId();
  // Reintento del mismo envío: devolver el registro existente (sin duplicar).
  const prev = await q1<{ id: string; status: string; consent_public: boolean }>(
    `select id, status, consent_public from wall_messages where client_id = $1 and guest_id = $2`, [b.client_id, guest],
  );
  if (prev) return json({ ok: true, id: prev.id, status: prev.status, consent_public: prev.consent_public, duplicate: true });

  const settings = await getSettings();
  if (!settings.wall_open) throw new HttpError(423, 'CERRADO', 'El muro está cerrado en este momento.');
  const ip = ipHash(req);
  await rateLimit(`wall:g:${guest}`, 6, 600, 'Ya enviaste varios mensajes. Espera unos minutos para enviar otro.');
  await rateLimit(`wall:ip:${ip}`, 40, 600);

  const row = await q1<{ id: string; status: string }>(
    `insert into wall_messages (client_id, guest_id, prompt, display_name, body, consent_public, ip_hash)
     values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (client_id) do nothing
     returning id, status`,
    [b.client_id, guest, b.prompt, name, body, b.consent_public, ip],
  );
  if (!row) throw new HttpError(409, 'DUPLICADO', 'Este envío ya fue registrado.');
  return json({ ok: true, id: row.id, status: row.status, consent_public: b.consent_public });
});
