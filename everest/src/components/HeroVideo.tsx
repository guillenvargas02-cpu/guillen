'use client';
import { useEffect, useRef, useState } from 'react';
import { useLive } from './LiveProvider';
import { derivePhase } from '@/lib/types';
import { fmtTime } from '@/lib/event';
import { IconPause, IconPlay } from './icons';

/**
 * Objeto protagonista de Inicio: el video de la cima en un escenario redondeado,
 * con etiquetas de datos y líneas guía (a la manera de una ficha técnica).
 */
export function HeroVideo() {
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { program } = useLive();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) v.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);
  const toggle = () => {
    if (!v.current) return;
    if (v.current.paused) { v.current.play(); setPlaying(true); } else { v.current.pause(); setPlaying(false); }
  };
  const ph = program ? derivePhase(program) : null;
  const now = ph?.current;
  return (
    <figure className="stage" aria-label="Video de la cima con los datos del evento">
      <video ref={v} src="/media/everest-preview-720.mp4" poster="/media/everest-poster.jpg" muted loop playsInline preload="metadata" aria-hidden="true" />
      <span className="stage__tag stage__tag--a"><small>Inicio</small><b>17:00 h</b></span>
      <span className="stage__tag stage__tag--b"><small>Sede</small><b>Salón República</b></span>
      <span className="stage__tag stage__tag--c">
        <small>{now ? (now.status === 'paused' ? 'En pausa' : 'Ahora') : ph?.phase === 'concluded' ? 'Estado' : 'Fecha'}</small>
        <b>{now ? now.title : ph?.phase === 'concluded' ? 'Evento concluido' : 'Mar 3 nov'}</b>
        {now?.actual_start_at ? <i>desde {fmtTime(now.actual_start_at)}</i> : null}
      </span>
      <button type="button" className="stage__toggle" onClick={toggle} aria-label={playing ? 'Pausar video' : 'Reproducir video'}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>
    </figure>
  );
}
