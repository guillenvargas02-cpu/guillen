'use client';
import { useCallback, useEffect, useState } from 'react';
import { useLive } from '@/components/LiveProvider';

export type Mine = {
  wall: { id: string; client_id: string; body: string; display_name: string; status: string; consent_public: boolean; created_at: string }[];
  guestbook: { id: string; client_id: string; dedication: string; display_name: string; status: string; consent_show: boolean; has_signature: boolean; created_at: string }[];
  words: Record<string, { display: string; status: string }>;
};

/** Mis aportaciones según el servidor (confirmación real y estado de revisión). */
export function useMine() {
  const [mine, setMine] = useState<Mine | null>(null);
  const { wall, words, guestbook } = useLive();
  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/me', { cache: 'no-store' });
      if (r.ok) setMine(await r.json());
    } catch { /* sin red: se conserva lo último */ }
  }, []);
  useEffect(() => { load(); }, [load, wall, words, guestbook]);
  return { mine, reload: load };
}

export const STATUS_TEXT: Record<string, string> = {
  pending: 'En revisión',
  approved: 'Publicado',
  rejected: 'No publicado',
  withdrawn: 'Retirado',
};
