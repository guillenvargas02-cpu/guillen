'use client';
// Preferencias y borradores locales. La base de datos es la fuente de verdad;
// aquí solo se conservan datos del propio dispositivo para no pedir dos veces el nombre
// y para no perder un texto si falla la conexión.
import { useCallback, useEffect, useRef, useState } from 'react';

const NS = 'everest:';

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export function writeLocal(key: string, value: unknown) {
  try {
    if (value === undefined || value === null) window.localStorage.removeItem(NS + key);
    else window.localStorage.setItem(NS + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('everest:local', { detail: key }));
  } catch { /* almacenamiento lleno o bloqueado: seguimos sin persistir */ }
}

/** Estado persistido en localStorage (se hidrata tras montar para evitar desajustes de SSR). */
export function useLocal<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const ref = useRef(value);
  useEffect(() => {
    const v = readLocal(key, initial);
    ref.current = v;
    setValue(v);
    setReady(true);
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === key) { const n = readLocal(key, initial); ref.current = n; setValue(n); }
    };
    window.addEventListener('everest:local', onChange);
    return () => window.removeEventListener('everest:local', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((v: T | ((p: T) => T)) => {
    const next = typeof v === 'function' ? (v as (p: T) => T)(ref.current) : v;
    ref.current = next;
    setValue(next);
    writeLocal(key, next);
  }, [key]);
  return [value, set, ready];
}

export type Profile = { name: string };
export const useProfile = () => useLocal<Profile>('perfil', { name: '' });

/** Recuerdos del propio invitado para reutilizar voluntariamente en otras dinámicas. */
export type Memory = { wall?: { body: string; at: string }; dedication?: { body: string; at: string } };
export const useMemory = () => useLocal<Memory>('recuerdos', {});

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function countChars(s: string) { return [...(s ?? '').normalize('NFC')].length; }
