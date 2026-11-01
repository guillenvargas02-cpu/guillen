import 'server-only';
import { getGuestbook, getProgram, getWall, getWords } from './public-data';

/** Instantánea inicial para el primer render. Si la base no responde, la interfaz carga igual y reintenta. */
export async function loadInitial() {
  try {
    const [program, wall, words, guestbook] = await Promise.all([getProgram(), getWall(), getWords(), getGuestbook()]);
    return { program, wall, words, guestbook, at: new Date().toISOString() };
  } catch (e) {
    console.error('[initial] sin datos:', (e as Error).message);
    return {};
  }
}
