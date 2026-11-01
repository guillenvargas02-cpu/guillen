'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useLive, useNow } from '@/components/LiveProvider';
import { NowModule, plannedLabel } from '@/components/program';
import { WallList, WordCloud } from '@/components/voice';
import { ConnStatus } from '@/components/ConnStatus';
import { derivePhase } from '@/lib/types';
import { fmtTime } from '@/lib/event';

/** Vista de proyección (16:9). Solo recibe contenido aprobado y autorizado (mismas APIs públicas). */
const PANELS = ['muro', 'somos', 'noche'] as const;

export function ScreenView({ url }: { url: string }) {
  const { program, wall, words } = useLive();
  const now = useNow(1000);
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % PANELS.length), 14_000); return () => clearInterval(t); }, []);
  const panel = PANELS[i];
  const next = program ? derivePhase(program).next : null;
  return (
    <div className="screen">
      <header className="screen__top">
        <img src="/brand/somos-logo.svg" alt="SOMOS" />
        <span className="display">EVEREST</span>
        <span className="muted" style={{ fontSize: '1.4vw' }}>Nuestra cima, nuestro futuro</span>
        <span className="num screen__clock" suppressHydrationWarning>{fmtTime(new Date(now))}</span>
      </header>
      <main className="screen__main">
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: '1.2vw', minHeight: 0 }}>
          <NowModule />
          {next && (
            <div className="screen__next">
              <span className="num">{next.planned_start ? fmtTime(next.planned_start) : '—'}</span>
              <div><span className="eyebrow eyebrow--rosa" style={{ fontSize: '.9vw' }}>Después</span><br /><strong>{next.title}</strong> <span className="muted" style={{ fontSize: '1.1vw' }}>{plannedLabel(next)}</span></div>
            </div>
          )}
        </div>
        <section className="screen__panel fade-swap" key={panel} aria-live="polite">
          {panel === 'muro' && <><h2>¿Qué te llevas de esta noche?</h2><WallList messages={(wall ?? []).slice(0, 6)} /></>}
          {panel === 'somos' && <><h2>Para ti, ¿qué es SOMOS en una palabra?</h2><WordCloud words={words?.somos ?? []} label="SOMOS en una palabra" max={86} min={26} /></>}
          {panel === 'noche' && <><h2>Define esta noche en una palabra</h2><WordCloud words={words?.noche ?? []} label="Esta noche en una palabra" max={86} min={26} /></>}
        </section>
      </main>
      <footer className="screen__foot">
        <img className="qr" src="/qr.svg" alt="" />
        <div><strong style={{ fontSize: '1.6vw' }}>Participa desde tu celular</strong><br /><span className="muted">{url}</span></div>
        <span style={{ marginLeft: 'auto' }}><ConnStatus withTime /></span>
      </footer>
    </div>
  );
}
