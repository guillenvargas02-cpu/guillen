'use client';
/* eslint-disable @next/next/no-img-element */
import { NowModule, NextModule, Timeline } from '@/components/program';
import { ConnStatus } from '@/components/ConnStatus';

export function ProgramView() {
  return (
    <div className="page-enter">
      <header className="pagehead">
        <img className="pagehead__img" src="/media/foto-cordillera.jpg" alt="" />
        <div className="pagehead__body">
          <span className="eyebrow">Martes 3 de noviembre · Hora de CDMX</span>
          <h1>Programa</h1>
        </div>
      </header>
      <div className="program-summary">
        <NowModule compact />
        <NextModule />
      </div>
      <div className="statusline" style={{ marginBottom: 12 }}>
        <ConnStatus withTime />
        <span>Se actualiza solo · sin recargar</span>
      </div>
      <Timeline />
    </div>
  );
}
