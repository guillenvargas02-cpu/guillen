'use client';
import { useEffect, useRef, useState } from 'react';
import { EVENT } from '@/lib/event';
import { IconCalendar, IconClock, IconPause, IconPin, IconPlay } from './icons';

/** Portada compacta con el video de montaña (pausable; respeta movimiento reducido). */
export function HeroVideo() {
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) v.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);
  const toggle = () => {
    if (!v.current) return;
    if (v.current.paused) { v.current.play(); setPlaying(true); } else { v.current.pause(); setPlaying(false); }
  };
  return (
    <section className="hero" aria-labelledby="hero-title">
      <video ref={v} className="hero__img" src="/media/everest-preview-720.mp4" poster="/media/everest-poster.jpg" muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="hero__body">
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.9)' }}>{EVENT.organizer} presenta</span>
        <h1 id="hero-title" className="display hero__title">{EVENT.title}</h1>
        <p className="hero__sub">{EVENT.subtitle}</p>
        <div className="hero__meta">
          <span><IconCalendar /> Martes 3 de noviembre</span>
          <span><IconClock /> 17:00 h</span>
          <span><IconPin /> {EVENT.room} · {EVENT.venue}</span>
        </div>
      </div>
      <button type="button" className="media-toggle media-toggle--hero" onClick={toggle} aria-label={playing ? 'Pausar video de fondo' : 'Reproducir video de fondo'}>
        {playing ? <IconPause /> : <IconPlay />}
      </button>
    </section>
  );
}
