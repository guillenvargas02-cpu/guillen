import { getGuestbook, getProgram, getVersions, getWall, getWords } from '@/lib/public-data';
import { handle, json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Instantánea pública: solo contenido aprobado y autorizado. */
export const GET = handle(async (req: Request) => {
  const t = new URL(req.url).searchParams.get('t') ?? 'program,wall,words,guestbook';
  const topics = new Set(t.split(','));
  const [program, wall, words, guestbook, versions] = await Promise.all([
    topics.has('program') ? getProgram() : undefined,
    topics.has('wall') ? getWall() : undefined,
    topics.has('words') ? getWords() : undefined,
    topics.has('guestbook') ? getGuestbook() : undefined,
    getVersions(),
  ]);
  return json({ ok: true, program, wall, words, guestbook, versions, at: new Date().toISOString() });
});
