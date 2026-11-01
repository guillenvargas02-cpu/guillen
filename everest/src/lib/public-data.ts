import 'server-only';
import { q, q1 } from './db';
import type {
  GuestbookPublic, Notice, ProgramItem, ProgramSnapshot, PublicSettings, WallMessage, WordCount, WordsSnapshot,
} from './types';

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : (v as string | null));

export async function getSettings(): Promise<PublicSettings> {
  const r = await q1<Record<string, unknown>>(
    `select starts_at, concluded_at, wall_open, words_somos_open, words_night_open, guestbook_open, postal_open, show_demo
       from event_settings where id = 1`,
  );
  if (!r) throw new Error('event_settings vacío: ejecuta las migraciones.');
  return { ...(r as PublicSettings), starts_at: iso(r.starts_at)!, concluded_at: iso(r.concluded_at) };
}

export async function getProgram(): Promise<ProgramSnapshot> {
  const [settings, items, notices] = await Promise.all([
    getSettings(),
    q<Record<string, unknown>>(
      `select p.id, p.position, p.title, p.description, p.participants, p.participants_note, p.planned_start, p.planned_end,
              p.schedule_note, p.schedule_changed_at, p.status, p.actual_start_at, p.actual_end_at, p.paused_at, p.is_demo
         from program_items p, event_settings s
        where not p.is_demo or s.show_demo
        order by p.position, p.created_at`,
    ),
    q<Record<string, unknown>>(
      `select id, body, tone, published_at from notices where published order by published_at desc nulls last limit 5`,
    ),
  ]);
  return {
    settings,
    items: items.map((r) => ({
      ...(r as unknown as ProgramItem),
      planned_start: iso(r.planned_start),
      planned_end: iso(r.planned_end),
      schedule_changed_at: iso(r.schedule_changed_at),
      actual_start_at: iso(r.actual_start_at),
      actual_end_at: iso(r.actual_end_at),
      paused_at: iso(r.paused_at),
    })),
    notices: notices.map((n) => ({ ...(n as unknown as Notice), published_at: iso(n.published_at) })),
    serverTime: new Date().toISOString(),
  };
}

export async function getWall(limit = 40): Promise<WallMessage[]> {
  const rows = await q<Record<string, unknown>>(
    `select id, prompt, display_name, body, featured, created_at, is_demo from v_public_wall
      order by featured desc, created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => ({ ...(r as unknown as WallMessage), created_at: iso(r.created_at)! }));
}

export async function getWords(): Promise<WordsSnapshot> {
  const rows = await q<{ question: 'somos' | 'noche' } & WordCount>(
    `select question, key, display, n, is_demo from v_public_words order by n desc, key asc`,
  );
  const somos = rows.filter((r) => r.question === 'somos').map(({ key, display, n, is_demo }) => ({ key, display, n, is_demo }));
  const noche = rows.filter((r) => r.question === 'noche').map(({ key, display, n, is_demo }) => ({ key, display, n, is_demo }));
  return {
    somos,
    noche,
    totals: { somos: somos.reduce((a, w) => a + w.n, 0), noche: noche.reduce((a, w) => a + w.n, 0) },
  };
}

export async function getGuestbook(limit = 60): Promise<GuestbookPublic[]> {
  const rows = await q<Record<string, unknown>>(
    `select id, display_name, dedication, featured, created_at, is_demo, has_signature from v_public_guestbook
      order by featured desc, created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => ({ ...(r as unknown as GuestbookPublic), created_at: iso(r.created_at)! }));
}

export async function getVersions(): Promise<Record<string, number>> {
  const rows = await q<{ topic: string; version: string }>(`select topic, version from live_versions`);
  return Object.fromEntries(rows.map((r) => [r.topic, Number(r.version)]));
}
