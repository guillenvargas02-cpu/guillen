'use client';
/* eslint-disable @next/next/no-img-element */
import { NowModule, Timeline } from '@/components/program';
import { ConnStatus } from '@/components/ConnStatus';
import { PageHeader } from '@/components/ui';
import { useLive } from '@/components/LiveProvider';

export function ProgramView() {
  const { program } = useLive();
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Martes 3 de noviembre · hora de CDMX" title="Programa" count={program?.items.length ?? null} img="/media/foto-cordillera-960.jpg" />
      <div className="program-summary">
        <NowModule compact />
      </div>
      <div className="statusline" style={{ marginBottom: 12 }}>
        <ConnStatus withTime />
        <span>Se actualiza solo · sin recargar</span>
      </div>
      <Timeline />
    </div>
  );
}
