import { z } from 'zod';
import { q1 } from '@/lib/db';
import { ensureGuestId } from '@/lib/guest';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate';
import { ipHash } from '@/lib/secret';
import { charCount, cleanText } from '@/lib/text';
import { strokesToSvg, validateStrokes } from '@/lib/signature';
import { getSettings } from '@/lib/public-data';

export const runtime = 'nodejs';

const Body = z.object({
  client_id: z.string().uuid(),
  display_name: z.string(),
  dedication: z.string(),
  strokes: z.unknown().optional(),
  consent_show: z.boolean().default(false),
  consent_signature: z.boolean().default(false),
  consent_social: z.boolean().default(false),
});

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const b = Body.parse(await readJson(req, 400_000));
  const name = cleanText(b.display_name);
  const dedication = cleanText(b.dedication, { multiline: true });
  if (charCount(name) < 1 || charCount(name) > 60) throw new HttpError(422, 'NOMBRE', 'Escribe tu nombre (hasta 60 caracteres).');
  if (charCount(dedication) < 2) throw new HttpError(422, 'DEDICATORIA', 'Escribe tu dedicatoria.');
  if (charCount(dedication) > 500) throw new HttpError(422, 'DEDICATORIA', 'La dedicatoria puede tener hasta 500 caracteres.');
  let strokes;
  try { strokes = validateStrokes(b.strokes); } catch {
    throw new HttpError(422, 'FIRMA', 'No pudimos leer la firma. Límpiala y vuelve a firmar.');
  }
  const guest = await ensureGuestId();
  const prev = await q1<{ id: string; status: string }>(
    `select id, status from guestbook_entries where client_id = $1 and guest_id = $2`, [b.client_id, guest],
  );
  if (prev) return json({ ok: true, id: prev.id, status: prev.status, duplicate: true });
  const settings = await getSettings();
  if (!settings.guestbook_open) throw new HttpError(423, 'CERRADO', 'El libro de visitas está cerrado en este momento.');
  const ip = ipHash(req);
  await rateLimit(`gb:g:${guest}`, 4, 600, 'Ya firmaste varias veces. Espera unos minutos.');
  await rateLimit(`gb:ip:${ip}`, 40, 600);
  const svg = strokes ? strokesToSvg(strokes) : null;
  const row = await q1<{ id: string; status: string }>(
    `insert into guestbook_entries (client_id, guest_id, display_name, dedication, signature_svg, signature_strokes,
       consent_show, consent_signature, consent_social, ip_hash)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (client_id) do nothing returning id, status`,
    [b.client_id, guest, name, dedication, svg, strokes ? JSON.stringify(strokes) : null,
      b.consent_show, b.consent_signature && !!svg, b.consent_social, ip],
  );
  if (!row) throw new HttpError(409, 'DUPLICADO', 'Este envío ya fue registrado.');
  return json({ ok: true, id: row.id, status: row.status, has_signature: !!svg });
});
