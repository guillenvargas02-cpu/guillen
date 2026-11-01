import { z } from 'zod';
import { q, q1, tx } from '@/lib/db';
import { ensureGuestId } from '@/lib/guest';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { rateLimit } from '@/lib/rate';
import { ipHash } from '@/lib/secret';
import { checkWord } from '@/lib/words';
import { getSettings } from '@/lib/public-data';

export const runtime = 'nodejs';

const Body = z.object({ question: z.enum(['somos', 'noche']), word: z.string().max(200) });

/** Una respuesta por sesión y pregunta: enviar de nuevo ACTUALIZA, no suma. */
export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const b = Body.parse(await readJson(req));
  const check = checkWord(b.word);
  if (!check.ok) throw new HttpError(422, check.reason.toUpperCase(), check.message);
  const settings = await getSettings();
  const open = b.question === 'somos' ? settings.words_somos_open : settings.words_night_open;
  if (!open) throw new HttpError(423, 'CERRADO', 'Esta dinámica está cerrada en este momento.');
  const guest = await ensureGuestId();
  const ip = ipHash(req);
  await rateLimit(`words:g:${guest}`, 12, 600, 'Ya cambiaste tu palabra varias veces. Espera unos minutos.');
  await rateLimit(`words:ip:${ip}`, 80, 600);

  const status = await tx(async (c) => {
    await c.query(
      `insert into word_keys (question, key) values ($1, $2) on conflict do nothing`, [b.question, check.key],
    );
    await c.query(
      `insert into word_entries (question, guest_id, word_display, word_key, ip_hash) values ($1,$2,$3,$4,$5)
       on conflict (question, guest_id) do update set word_display = excluded.word_display, word_key = excluded.word_key, updated_at = now()`,
      [b.question, guest, check.display, check.key, ip],
    );
    const k = await c.query(`select status from word_keys where question = $1 and key = $2`, [b.question, check.key]);
    return k.rows[0]?.status as string;
  });
  return json({ ok: true, question: b.question, display: check.display, key: check.key, status });
});

export const DELETE = handle(async (req: Request) => {
  assertSameOrigin(req);
  const question = new URL(req.url).searchParams.get('question');
  if (question !== 'somos' && question !== 'noche') throw new HttpError(422, 'PREGUNTA', 'Pregunta inválida.');
  const guest = await ensureGuestId();
  await q(`delete from word_entries where question = $1 and guest_id = $2`, [question, guest]);
  return json({ ok: true });
});

export const GET = handle(async () => {
  const guest = await ensureGuestId();
  const rows = await q<{ question: string; word_display: string; status: string }>(
    `select e.question, e.word_display, k.status from word_entries e
       join word_keys k on k.question = e.question and k.key = e.word_key where e.guest_id = $1`, [guest],
  );
  return json({ ok: true, mine: Object.fromEntries(rows.map((r) => [r.question, { display: r.word_display, status: r.status }])) });
});
void q1;
