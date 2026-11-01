import { q } from '@/lib/db';
import { readGuestId } from '@/lib/guest';
import { handle, json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Las propias aportaciones de esta sesión: confirma lo recibido y su estado de revisión. */
export const GET = handle(async () => {
  const guest = await readGuestId();
  if (!guest) return json({ ok: true, wall: [], guestbook: [], words: {} });
  const [wall, guestbook, words] = await Promise.all([
    q(`select id, client_id, prompt, display_name, body, consent_public, status, created_at from wall_messages
        where guest_id = $1 order by created_at desc limit 20`, [guest]),
    q(`select id, client_id, display_name, dedication, consent_show, consent_signature, consent_social, status,
              signature_svg is not null as has_signature, created_at
         from guestbook_entries where guest_id = $1 order by created_at desc limit 10`, [guest]),
    q<{ question: string; word_display: string; status: string }>(
      `select e.question, e.word_display, k.status from word_entries e
         join word_keys k on k.question = e.question and k.key = e.word_key where e.guest_id = $1`, [guest]),
  ]);
  return json({
    ok: true, wall, guestbook,
    words: Object.fromEntries(words.map((w) => [w.question, { display: w.word_display, status: w.status }])),
  });
});
