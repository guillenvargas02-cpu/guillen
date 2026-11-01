import { q, q1 } from '@/lib/db';
import { CAN, requireStaff } from '@/lib/auth';
import { handle, json } from '@/lib/http';
import { getProgram } from '@/lib/public-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireStaff();
  const canMod = CAN.moderate.includes(me.role);
  const [program, settings, notices, wall, guestbook, words, renders, users] = await Promise.all([
    getProgram(),
    q1(`select * from event_settings where id = 1`),
    q(`select id, body, tone, published, published_at, created_at from notices order by created_at desc`),
    canMod ? q(`select id, prompt, display_name, body, consent_public, status, featured, is_demo, created_at, moderated_at
                  from wall_messages order by created_at desc limit 400`) : [],
    canMod ? q(`select id, display_name, dedication, consent_show, consent_signature, consent_social, status, featured, is_demo,
                       signature_svg is not null as has_signature, created_at
                  from guestbook_entries order by created_at desc limit 400`) : [],
    canMod ? q(`select k.question, k.key, k.display, k.status, count(e.id)::int as n, bool_or(e.is_demo) as is_demo,
                       mode() within group (order by e.word_display) as sample, max(e.updated_at) as last_at
                  from word_keys k left join word_entries e on e.question = k.question and e.word_key = k.key
                 group by k.question, k.key, k.display, k.status
                 having count(e.id) > 0
                 order by k.status = 'pending' desc, count(e.id) desc, k.key`) : [],
    q1(`select count(*) filter (where status = 'queued')::int as queued, count(*) filter (where status = 'rendering')::int as rendering,
               count(*) filter (where status = 'done')::int as done, count(*) filter (where status = 'failed')::int as failed from render_jobs`),
    CAN.users.includes(me.role) ? q(`select id, email, name, role, active, last_login_at from staff_users order by created_at`) : [],
  ]);
  // El panel ve también los elementos de demostración del programa.
  const items = await q(`select * from program_items order by position, created_at`);
  return json({ ok: true, me, program: { ...program, items }, settings, notices, wall, guestbook, words, renders, users });
});
