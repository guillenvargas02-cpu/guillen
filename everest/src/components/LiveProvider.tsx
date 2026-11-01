'use client';
// Datos en vivo: SSE (señales) + instantánea pública + respaldo periódico.
// - Al conectar o reconectar se recupera el estado vigente completo.
// - Si el canal cae, se sigue actualizando por sondeo; si tampoco hay red, se avisa
//   que los datos pueden estar desactualizados y se conserva lo último recibido.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { GuestbookPublic, ProgramSnapshot, Topic, WallMessage, WordsSnapshot } from '@/lib/types';

export type LiveStatus = 'connecting' | 'live' | 'polling' | 'offline';
export type LiveData = { program?: ProgramSnapshot; wall?: WallMessage[]; words?: WordsSnapshot; guestbook?: GuestbookPublic[] };
type Ctx = LiveData & { status: LiveStatus; lastUpdate: number | null; offset: number; refresh: (t?: Topic[]) => Promise<void>; now: () => number };

const LiveCtx = createContext<Ctx | null>(null);
const ALL: Topic[] = ['program', 'wall', 'words', 'guestbook'];

export function LiveProvider({ initial, children }: { initial: LiveData & { at?: string }; children: ReactNode }) {
  const [data, setData] = useState<LiveData>(initial);
  const [status, setStatus] = useState<LiveStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<number | null>(initial.at ? Date.parse(initial.at) : null);
  const [offset, setOffset] = useState(0);
  const sseOpen = useRef(false);
  const pending = useRef(new Set<Topic>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failures = useRef(0);

  const refresh = useCallback(async (topics: Topic[] = ALL) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(`/api/snapshot?t=${topics.join(',')}`, { cache: 'no-store', signal: ctrl.signal });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      setData((d) => ({
        program: j.program ?? d.program, wall: j.wall ?? d.wall, words: j.words ?? d.words, guestbook: j.guestbook ?? d.guestbook,
      }));
      if (j.at) setOffset(Date.parse(j.at) - Date.now());
      setLastUpdate(Date.now());
      failures.current = 0;
      setStatus(sseOpen.current ? 'live' : 'polling');
    } catch {
      failures.current++;
      if (failures.current >= 1 && !navigator.onLine) setStatus('offline');
      else if (failures.current >= 2) setStatus('offline');
    } finally {
      clearTimeout(t);
    }
  }, []);

  const schedule = useCallback((topic: string) => {
    if (topic === '*') ALL.forEach((t) => pending.current.add(t));
    else if ((ALL as string[]).includes(topic)) pending.current.add(topic as Topic);
    if (timer.current) return;
    timer.current = setTimeout(() => {
      const list = [...pending.current];
      pending.current.clear();
      timer.current = null;
      if (list.length) refresh(list);
    }, 250);
  }, [refresh]);

  useEffect(() => {
    let es: EventSource | null = null;
    let downSince = 0;
    const open = () => {
      es?.close();
      es = new EventSource('/api/live');
      es.addEventListener('hello', () => { sseOpen.current = true; downSince = 0; schedule('*'); });
      es.addEventListener('signal', (e) => {
        try { schedule(JSON.parse((e as MessageEvent).data).topic); } catch { schedule('*'); }
      });
      es.addEventListener('status', (e) => {
        try { if (JSON.parse((e as MessageEvent).data).db) schedule('*'); } catch {}
      });
      es.onerror = () => {
        sseOpen.current = false;
        if (!downSince) downSince = Date.now();
        setStatus((s) => (s === 'offline' ? s : 'connecting'));
        if (es?.readyState === EventSource.CLOSED) setTimeout(open, 4000);
      };
    };
    open();
    // Respaldo periódico: cada 30 s con canal abierto, cada 8 s si está caído.
    const poll = setInterval(() => {
      if (!sseOpen.current || Date.now() % 30_000 < 8_000) refresh();
    }, 8_000);
    const onOnline = () => { open(); refresh(); };
    const onOffline = () => { sseOpen.current = false; setStatus('offline'); };
    const onVisible = () => { if (document.visibilityState === 'visible') { refresh(); if (!sseOpen.current) open(); } };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      es?.close();
      clearInterval(poll);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, schedule]);

  const value = useMemo<Ctx>(() => ({ ...data, status, lastUpdate, offset, refresh, now: () => Date.now() + offset }), [data, status, lastUpdate, offset, refresh]);
  return <LiveCtx.Provider value={value}>{children}</LiveCtx.Provider>;
}

export function useLive() {
  const c = useContext(LiveCtx);
  if (!c) throw new Error('useLive fuera de LiveProvider');
  return c;
}

/** Reloj que avanza cada `ms` (con la hora del servidor). */
export function useNow(ms = 1000) {
  const { offset } = useLive();
  const [t, setT] = useState(() => Date.now() + offset);
  useEffect(() => {
    setT(Date.now() + offset);
    const i = setInterval(() => setT(Date.now() + offset), ms);
    return () => clearInterval(i);
  }, [ms, offset]);
  return t;
}
