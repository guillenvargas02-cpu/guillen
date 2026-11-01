// Tipos compartidos entre servidor y cliente (solo datos públicos).

export type ActivityStatus = 'pending' | 'live' | 'paused' | 'done' | 'cancelled';

export type Participant = { name: string; role?: string; pending?: boolean };

export type ProgramItem = {
  id: string;
  position: number;
  title: string;
  description: string;
  participants: Participant[];
  participants_note: string;
  planned_start: string | null;
  planned_end: string | null;
  schedule_note: string;
  schedule_changed_at: string | null;
  status: ActivityStatus;
  actual_start_at: string | null;
  actual_end_at: string | null;
  paused_at: string | null;
  is_demo: boolean;
};

export type Notice = { id: string; body: string; tone: 'info' | 'importante'; published_at: string | null };

export type PublicSettings = {
  starts_at: string;
  concluded_at: string | null;
  wall_open: boolean;
  words_somos_open: boolean;
  words_night_open: boolean;
  guestbook_open: boolean;
  postal_open: boolean;
  show_demo: boolean;
};

export type ProgramSnapshot = {
  settings: PublicSettings;
  items: ProgramItem[];
  notices: Notice[];
  serverTime: string;
};

export type WallMessage = {
  id: string;
  prompt: 'llevas' | 'expectativa';
  display_name: string;
  body: string;
  featured: boolean;
  created_at: string;
  is_demo: boolean;
};

export type WordCount = { key: string; display: string; n: number; is_demo: boolean };
export type WordsSnapshot = { somos: WordCount[]; noche: WordCount[]; totals: { somos: number; noche: number } };

export type GuestbookPublic = {
  id: string;
  display_name: string;
  dedication: string;
  featured: boolean;
  created_at: string;
  is_demo: boolean;
  has_signature: boolean;
};

export type Topic = 'program' | 'wall' | 'words' | 'guestbook';

export type EventPhase = 'before' | 'live' | 'paused' | 'between' | 'concluded';

export function derivePhase(s: ProgramSnapshot) {
  const items = [...s.items].sort((a, b) => a.position - b.position);
  const current = items.find((i) => i.status === 'live' || i.status === 'paused') ?? null;
  const started = items.some((i) => i.status === 'done' || i.status === 'live' || i.status === 'paused');
  const upcoming = items.filter((i) => i.status === 'pending');
  const next = current
    ? upcoming.find((i) => i.position > current.position) ?? upcoming[0] ?? null
    : (() => {
        const lastDone = [...items].reverse().find((i) => i.status === 'done');
        return (lastDone ? upcoming.find((i) => i.position > lastDone.position) : null) ?? upcoming[0] ?? null;
      })();
  let phase: EventPhase;
  if (s.settings.concluded_at) phase = 'concluded';
  else if (current?.status === 'live') phase = 'live';
  else if (current?.status === 'paused') phase = 'paused';
  else if (!started) phase = 'before';
  else if (upcoming.length === 0) phase = 'concluded';
  else phase = 'between';
  const done = items.filter((i) => i.status === 'done');
  return { phase, current, next, done, items };
}
