'use client';
import { useLive } from './LiveProvider';
import { fmtTimeSeconds } from '@/lib/event';

const LABEL = { live: 'En vivo', polling: 'Actualizando', connecting: 'Conectando…', offline: 'Sin conexión' } as const;

export function ConnStatus({ withTime = false }: { withTime?: boolean }) {
  const { status, lastUpdate } = useLive();
  return (
    <span className={`conn conn--${status}`} role="status" aria-live="polite">
      <span className="conn__dot" aria-hidden="true" />
      {LABEL[status]}
      {withTime && lastUpdate ? <small suppressHydrationWarning>· {fmtTimeSeconds(new Date(lastUpdate))}</small> : null}
    </span>
  );
}

export function StaleBanner() {
  const { status, lastUpdate } = useLive();
  if (status !== 'offline') return null;
  return (
    <div className="stale-banner" role="alert">
      <span aria-hidden="true">⚠︎</span>
      <span>
        Sin conexión. Mostramos lo último que recibimos{lastUpdate ? ` (${fmtTimeSeconds(new Date(lastUpdate))})` : ''}: los datos pueden estar
        desactualizados. Seguiremos intentando reconectar.
      </span>
    </div>
  );
}
