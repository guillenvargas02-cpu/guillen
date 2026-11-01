'use client';
import { useState } from 'react';
import type { WallMessage, WordCount } from '@/lib/types';
import { fmtTime } from '@/lib/event';

/**
 * Nube de palabras estable y sin superposiciones: flujo centrado (flex-wrap) con la
 * palabra más mencionada al centro. El tamaño responde al número real de aportaciones
 * aprobadas (escala por raíz cuadrada). El orden es determinista: no "salta".
 */
export function WordCloud({ words, max = 56, min = 16, label, limit = 40 }: { words: WordCount[]; max?: number; min?: number; label: string; limit?: number }) {
  const [asList, setAsList] = useState(false);
  const list = words.slice(0, limit);
  const total = words.reduce((a, w) => a + w.n, 0);
  if (!list.length) {
    return (
      <div className="empty">
        <strong>Aún no hay palabras publicadas.</strong>
        <span>Las aportaciones aparecen aquí cuando el equipo las revisa.</span>
      </div>
    );
  }
  const hi = list[0].n, lo = list[list.length - 1].n;
  const size = (n: number) => (hi === lo ? (min + max) / 2 : min + (max - min) * Math.sqrt((n - lo) / (hi - lo)));
  // Mayor al centro: alternar izquierda/derecha.
  const arranged: (WordCount & { rank: number })[] = [];
  list.forEach((w, i) => (i % 2 === 0 ? arranged.push({ ...w, rank: i }) : arranged.unshift({ ...w, rank: i })));
  return (
    <div className="cloud-wrap">
      {asList ? (
        <ol className="wordlist" aria-label={`${label}: lista`}>
          {list.map((w) => <li key={w.key}><span>{w.display}</span><span>{w.n}</span></li>)}
        </ol>
      ) : (
        <ul className="cloud" aria-label={`${label}: ${list.length} palabras`}>
          {arranged.map((w) => (
            <li key={w.key} data-rank={w.rank} data-tier={w.rank < 3 ? 1 : w.rank < 10 ? 2 : 3}
              style={{ fontSize: `${size(w.n).toFixed(1)}px` }} aria-label={`${w.display}: ${w.n} ${w.n === 1 ? 'aportación' : 'aportaciones'}`}>
              {w.display}
            </li>
          ))}
        </ul>
      )}
      <div className="cloud-foot">
        <span className="tiny muted">{total} {total === 1 ? 'aportación aprobada' : 'aportaciones aprobadas'}{list.some((w) => w.is_demo) ? ' · incluye demostración' : ''}</span>
        <button type="button" className="linkbtn tiny" onClick={() => setAsList((v) => !v)} aria-pressed={asList}>
          {asList ? 'Ver nube' : 'Ver como lista'}
        </button>
      </div>
    </div>
  );
}

export function WallList({ messages, limit, compact = false }: { messages: WallMessage[]; limit?: number; compact?: boolean }) {
  const list = limit ? messages.slice(0, limit) : messages;
  if (!list.length) {
    return (
      <div className="empty">
        <strong>El muro está por estrenarse.</strong>
        <span>Los mensajes aparecen después de la revisión del equipo.</span>
      </div>
    );
  }
  return (
    <ul className={compact ? 'wall wall--compact' : 'wall'} aria-label="Mensajes del muro">
      {list.map((m) => (
        <li key={m.id} className={`msg${m.featured ? ' msg--featured' : ''}`}>
          {m.featured ? <span className="msg__q" aria-hidden="true">“</span> : null}
          <p>{m.body}</p>
          <footer>
            <b>{m.display_name}</b>
            <span suppressHydrationWarning>{m.is_demo ? 'Demostración · ' : ''}{fmtTime(m.created_at)}</span>
          </footer>
        </li>
      ))}
    </ul>
  );
}
