import { z } from 'zod';
import { q, q1, tx } from '@/lib/db';
import { audit, CAN, requireStaff, type Role } from '@/lib/auth';
import { assertSameOrigin, handle, HttpError, json, readJson } from '@/lib/http';
import { cdmxLocalToIso } from '@/lib/event';
import { cleanText } from '@/lib/text';
import { hashPassword } from '@/lib/password';
import { checkWord } from '@/lib/words';

export const runtime = 'nodejs';

const uuid = z.string().uuid();
const local = z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/, 'Usa el formato de fecha y hora.').optional();
const Participant = z.object({ name: z.string().min(1).max(120), role: z.string().max(160).optional().default(''), pending: z.boolean().optional().default(false) });
const ItemFields = z.object({
  title: z.string().min(1, 'El título es obligatorio.').max(140),
  description: z.string().max(600).default(''),
  participants: z.array(Participant).max(20).default([]),
  participants_note: z.string().max(200).default(''),
  planned_start: local,
  planned_end: local,
  schedule_note: z.string().max(140).default(''),
});

type Op = { roles: Role[]; schema: z.ZodTypeAny; run: (a: any, me: Awaited<ReturnType<typeof requireStaff>>) => Promise<unknown> }; // eslint-disable-line @typescript-eslint/no-explicit-any

const times = (a: { planned_start?: string; planned_end?: string }) => {
  const s = a.planned_start ? cdmxLocalToIso(a.planned_start) : null;
  const e = a.planned_end ? cdmxLocalToIso(a.planned_end) : null;
  if (s && e && e < s) throw new HttpError(422, 'HORARIO', 'La hora de término no puede ser anterior al inicio.');
  return { s, e };
};

const MOD_ACTIONS = z.enum(['approve', 'reject', 'pending', 'feature', 'unfeature', 'withdraw']);
function modSql(table: 'wall_messages' | 'guestbook_entries', action: z.infer<typeof MOD_ACTIONS>) {
  const set = {
    approve: `status = 'approved'`,
    reject: `status = 'rejected', featured = false`,
    pending: `status = 'pending', featured = false`,
    withdraw: `status = 'withdrawn', featured = false`,
    feature: `featured = true, status = 'approved'`,
    unfeature: `featured = false`,
  }[action];
  return `update ${table} set ${set}, moderated_at = now(), moderated_by = $2 where id = $1 returning id`;
}

const OPS: Record<string, Op> = {
  // ─── Programa ───
  'program.create': {
    roles: CAN.program, schema: ItemFields,
    run: async (a) => {
      const { s, e } = times(a);
      const pos = (await q1<{ p: number }>(`select coalesce(max(position), 0) + 10 as p from program_items`))!.p;
      return q1(`insert into program_items (position, title, description, participants, participants_note, planned_start, planned_end, schedule_note)
                 values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
        [pos, cleanText(a.title), cleanText(a.description, { multiline: true }), JSON.stringify(a.participants), cleanText(a.participants_note), s, e, cleanText(a.schedule_note)]);
    },
  },
  'program.update': {
    roles: CAN.program, schema: ItemFields.extend({ id: uuid, mark_change: z.boolean().default(false) }),
    run: async (a) => {
      const { s, e } = times(a);
      const cur = await q1<{ planned_start: Date | null; planned_end: Date | null }>(`select planned_start, planned_end from program_items where id = $1`, [a.id]);
      if (!cur) throw new HttpError(404, 'NO_ENCONTRADA', 'La actividad ya no existe.');
      const changed = (cur.planned_start?.toISOString() ?? null) !== s || (cur.planned_end?.toISOString() ?? null) !== e;
      return q1(`update program_items set title=$2, description=$3, participants=$4, participants_note=$5, planned_start=$6, planned_end=$7, schedule_note=$8,
                   schedule_changed_at = case when $9 then now() else schedule_changed_at end
                 where id = $1 returning id`,
        [a.id, cleanText(a.title), cleanText(a.description, { multiline: true }), JSON.stringify(a.participants), cleanText(a.participants_note), s, e, cleanText(a.schedule_note), changed && a.mark_change]);
    },
  },
  'program.clearChange': {
    roles: CAN.program, schema: z.object({ id: uuid }),
    run: (a) => q1(`update program_items set schedule_changed_at = null where id = $1 returning id`, [a.id]),
  },
  'program.delete': {
    roles: CAN.program, schema: z.object({ id: uuid }),
    run: (a) => q1(`delete from program_items where id = $1 and status not in ('live','paused') returning id`, [a.id]).then((r) => {
      if (!r) throw new HttpError(409, 'EN_CURSO', 'No puedes borrar una actividad en curso. Termínala primero.');
      return r;
    }),
  },
  'program.move': {
    roles: CAN.program, schema: z.object({ id: uuid, dir: z.enum(['up', 'down']) }),
    run: (a) => tx(async (c) => {
      const rows = (await c.query(`select id, position from program_items order by position, created_at for update`)).rows as { id: string; position: number }[];
      const i = rows.findIndex((r) => r.id === a.id);
      const j = a.dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= rows.length) return { id: a.id };
      [rows[i], rows[j]] = [rows[j], rows[i]];
      for (let k = 0; k < rows.length; k++) await c.query(`update program_items set position = $2 where id = $1`, [rows[k].id, (k + 1) * 10]);
      return { id: a.id };
    }),
  },
  'program.transition': {
    roles: CAN.program,
    schema: z.object({ id: uuid, action: z.enum(['start', 'pause', 'resume', 'finish', 'cancel', 'reset']), finish_current: z.boolean().default(false) }),
    run: async (a) => {
      try {
        return await q1(`select id, status from program_transition($1, $2, $3)`, [a.id, a.action, a.finish_current]);
      } catch (e) {
        const m = (e as Error).message;
        if (m.startsWith('OTRA_EN_CURSO')) {
          throw new HttpError(409, 'OTRA_EN_CURSO', `“${m.split(':').slice(1).join(':')}” sigue en curso. ¿Quieres terminarla e iniciar esta?`, { needsFinish: true });
        }
        if (m.includes('TRANSICION_INVALIDA')) throw new HttpError(409, 'TRANSICION', 'Esa acción no aplica al estado actual de la actividad.');
        if (m.includes('program_one_current')) throw new HttpError(409, 'OTRA_EN_CURSO', 'Ya hay una actividad en curso.');
        throw e;
      }
    },
  },
  'event.conclude': {
    roles: CAN.event, schema: z.object({ concluded: z.boolean() }),
    run: async (a) => {
      if (a.concluded) {
        const cur = await q1(`select id from program_items where status in ('live','paused')`);
        if (cur) throw new HttpError(409, 'EN_CURSO', 'Termina la actividad en curso antes de concluir el evento.');
      }
      return q1(`update event_settings set concluded_at = case when $1 then now() else null end where id = 1 returning concluded_at`, [a.concluded]);
    },
  },
  // ─── Avisos ───
  'notice.create': {
    roles: CAN.notices, schema: z.object({ body: z.string().min(1).max(280), tone: z.enum(['info', 'importante']).default('info'), published: z.boolean().default(true) }),
    run: (a, me) => q1(`insert into notices (body, tone, published, published_at, created_by) values ($1,$2,$3, case when $3 then now() end, $4) returning id`,
      [cleanText(a.body), a.tone, a.published, me.id]),
  },
  'notice.update': {
    roles: CAN.notices, schema: z.object({ id: uuid, body: z.string().min(1).max(280).optional(), tone: z.enum(['info', 'importante']).optional(), published: z.boolean().optional() }),
    run: (a) => q1(`update notices set body = coalesce($2, body), tone = coalesce($3, tone), published = coalesce($4, published),
                      published_at = case when $4 is true and not published then now() else published_at end where id = $1 returning id`,
      [a.id, a.body ? cleanText(a.body) : null, a.tone ?? null, a.published ?? null]),
  },
  'notice.delete': { roles: CAN.notices, schema: z.object({ id: uuid }), run: (a) => q1(`delete from notices where id = $1 returning id`, [a.id]) },
  // ─── Moderación ───
  'mod.wall': {
    roles: CAN.moderate, schema: z.object({ id: uuid, action: MOD_ACTIONS }),
    run: async (a, me) => {
      if (a.action === 'approve' || a.action === 'feature') {
        const r = await q1<{ consent_public: boolean }>(`select consent_public from wall_messages where id = $1`, [a.id]);
        if (r && !r.consent_public) throw new HttpError(409, 'SIN_AUTORIZACION', 'Este mensaje se envió solo al equipo: no se puede publicar.');
      }
      return q1(modSql('wall_messages', a.action), [a.id, me.id]);
    },
  },
  'mod.wallBulk': {
    roles: CAN.moderate, schema: z.object({ ids: z.array(uuid).max(200), action: z.enum(['approve', 'reject']) }),
    run: (a, me) => q(`update wall_messages set status = $2, moderated_at = now(), moderated_by = $3
                       where id = any($1::uuid[]) and ($2 = 'rejected' or consent_public) returning id`,
      [a.ids, a.action === 'approve' ? 'approved' : 'rejected', me.id]),
  },
  'mod.guestbook': {
    roles: CAN.moderate, schema: z.object({ id: uuid, action: MOD_ACTIONS }),
    run: async (a, me) => {
      if (a.action === 'approve' || a.action === 'feature') {
        const r = await q1<{ consent_show: boolean }>(`select consent_show from guestbook_entries where id = $1`, [a.id]);
        if (r && !r.consent_show) throw new HttpError(409, 'SIN_AUTORIZACION', 'Esta dedicatoria es privada para el equipo: no se puede publicar.');
      }
      return q1(modSql('guestbook_entries', a.action), [a.id, me.id]);
    },
  },
  'mod.word': {
    roles: CAN.moderate,
    schema: z.object({ question: z.enum(['somos', 'noche']), key: z.string().min(1).max(40), action: z.enum(['approve', 'reject', 'pending']), display: z.string().max(40).optional() }),
    run: (a, me) => {
      let display: string | null = null;
      if (a.display) {
        const c = checkWord(a.display);
        if (!c.ok || c.key !== a.key) throw new HttpError(422, 'PRESENTACION', 'La forma de presentación debe ser la misma palabra (puedes cambiar mayúsculas).');
        display = cleanText(a.display);
      }
      return q1(`update word_keys set status = $3, display = coalesce($4, display), moderated_at = now(), moderated_by = $5
                  where question = $1 and key = $2 returning key`,
        [a.question, a.key, { approve: 'approved', reject: 'rejected', pending: 'pending' }[a.action as 'approve'], display, me.id]);
    },
  },
  // ─── Dinámicas y evento ───
  'settings.update': {
    roles: CAN.dynamics,
    schema: z.object({
      wall_open: z.boolean().optional(), words_somos_open: z.boolean().optional(), words_night_open: z.boolean().optional(),
      guestbook_open: z.boolean().optional(), postal_open: z.boolean().optional(),
    }),
    run: (a) => {
      const keys = Object.keys(a).filter((k) => a[k] !== undefined);
      if (!keys.length) return Promise.resolve(null);
      return q1(`update event_settings set ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')} where id = 1 returning id`, keys.map((k) => a[k]));
    },
  },
  'demo.toggle': { roles: CAN.demo, schema: z.object({ show: z.boolean() }), run: (a) => q1(`update event_settings set show_demo = $1 where id = 1 returning show_demo`, [a.show]) },
  'demo.purge': {
    roles: CAN.demo, schema: z.object({}),
    run: () => tx(async (c) => {
      for (const t of ['wall_messages', 'word_entries', 'guestbook_entries', 'program_items']) {
        await c.query(`delete from ${t} where is_demo${t === 'program_items' ? " and status not in ('live','paused')" : ''}`);
      }
      await c.query(`delete from word_keys k where not exists (select 1 from word_entries e where e.question = k.question and e.word_key = k.key)`);
      await c.query(`update event_settings set show_demo = false where id = 1`);
      return { ok: true };
    }),
  },
  // ─── Equipo ───
  'user.create': {
    roles: CAN.users,
    schema: z.object({ email: z.string().email('Correo inválido.').max(200), name: z.string().min(1).max(80), role: z.enum(['admin', 'programa', 'moderacion']), password: z.string().min(10, 'La contraseña debe tener al menos 10 caracteres.').max(200) }),
    run: async (a) => q1(`insert into staff_users (email, name, role, password_hash) values ($1,$2,$3,$4)
                          on conflict (email) do nothing returning id`, [a.email.toLowerCase(), cleanText(a.name), a.role, await hashPassword(a.password)])
      .then((r) => { if (!r) throw new HttpError(409, 'EXISTE', 'Ya existe una cuenta con ese correo.'); return r; }),
  },
  'user.update': {
    roles: CAN.users,
    schema: z.object({ id: uuid, role: z.enum(['admin', 'programa', 'moderacion']).optional(), active: z.boolean().optional(), password: z.string().min(10).max(200).optional() }),
    run: async (a, me) => {
      if (a.id === me.id && (a.active === false || (a.role && a.role !== 'admin'))) throw new HttpError(409, 'PROPIA', 'No puedes quitarte tu propio acceso de administración.');
      const r = await q1(`update staff_users set role = coalesce($2, role), active = coalesce($3, active),
                           password_hash = coalesce($4, password_hash) where id = $1 returning id`,
        [a.id, a.role ?? null, a.active ?? null, a.password ? await hashPassword(a.password) : null]);
      if (a.active === false || a.password) await q(`delete from staff_sessions where user_id = $1`, [a.id]);
      return r;
    },
  },
};

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const body = (await readJson(req)) as { op?: string; args?: unknown };
  const op = OPS[body.op ?? ''];
  if (!op) throw new HttpError(400, 'OPERACION', 'Operación desconocida.');
  const me = await requireStaff(op.roles);
  const args = op.schema.parse(body.args ?? {});
  const result = await op.run(args, me);
  await audit(me, body.op!, (args as { id?: string }).id, args && typeof args === 'object' && 'password' in args ? { redacted: true } : args);
  return json({ ok: true, result });
});
