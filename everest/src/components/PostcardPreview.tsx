'use client';
// Previsualización fiel en movimiento: mismo módulo compose.ts que el render del servidor.
// Capa 1: <video> ligero posicionado en el rectángulo "cover" calculado.
// Capa 2: <canvas> con la capa gráfica; el interior de las letras es transparente.
import { useEffect, useRef, useState } from 'react';
import { computeLayout, drawOverlay, FORMATS, TIMING, type Ctx, type Layout, type PathCtor, type PostcardInput } from '@/postcard/compose';
import { IconPause, IconPlay } from './icons';

let fontsPromise: Promise<unknown> | null = null;
export function loadPostcardFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px "Hind Siliguri"`, 'AÁÉÍÓÚÑÜáéíóúñü“”¿¡'))).catch(() => null);
  }
  return fontsPromise;
}

export function PostcardPreview({ input, label, onReady, controls = true }: { input: PostcardInput; label?: string; onReady?: (ok: boolean) => void; controls?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [fonts, setFonts] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [playing, setPlaying] = useState(true);
  const { w: W, h: H } = FORMATS[input.format];

  useEffect(() => { loadPostcardFonts().then(() => setFonts(true)); }, []);

  // Dibujo de la capa gráfica (con escala según el tamaño en pantalla).
  useEffect(() => {
    if (!fonts || !canvas.current || !wrap.current) return;
    const draw = () => {
      const c = canvas.current!;
      const k = Math.min(1, ((wrap.current!.clientWidth || 360) * (window.devicePixelRatio || 1)) / W);
      c.width = Math.round(W * k); c.height = Math.round(H * k);
      const ctx = c.getContext('2d')!;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      const L = computeLayout(ctx as unknown as Ctx, input);
      drawOverlay(ctx as unknown as Ctx, Path2D as unknown as PathCtor, input, L);
      setLayout(L);
    };
    const raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => requestAnimationFrame(draw));
    ro.observe(wrap.current);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [fonts, input, W, H]);

  // Ventana de reproducción idéntica a la exportación.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onMeta = () => { v.currentTime = TIMING.sourceStart + (reduce ? TIMING.pngAt : 0); };
    const onTime = () => {
      if (v.currentTime >= TIMING.sourceStart + TIMING.seconds || v.currentTime < TIMING.sourceStart - 0.05) v.currentTime = TIMING.sourceStart;
    };
    const onCan = () => setVideoOk(true);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('canplay', onCan);
    if (reduce) { v.pause(); setPlaying(false); } else v.play().catch(() => setPlaying(false));
    return () => { v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('timeupdate', onTime); v.removeEventListener('canplay', onCan); };
  }, []);

  useEffect(() => { onReady?.(fonts && videoOk && !!layout); }, [fonts, videoOk, layout, onReady]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const r = layout?.videoRect;
  return (
    <div className="preview-stage" ref={wrap} style={{ aspectRatio: `${W} / ${H}` }} role="img"
      aria-label={label ?? `Previsualización de la postal ${FORMATS[input.format].label}: “Saludos desde EVEREST” con el paisaje de montaña en movimiento de fondo y dentro de las letras${input.name ? `, firmada por ${input.name}` : ''}.`}>
      <video
        ref={video}
        src="/media/everest-preview-720.mp4"
        poster="/media/everest-poster.jpg"
        muted playsInline loop autoPlay preload="auto" aria-hidden="true"
        style={r ? { left: `${(r.x / W) * 100}%`, top: `${(r.y / H) * 100}%`, width: `${(r.w / W) * 100}%`, height: `${(r.h / H) * 100}%`, objectFit: 'fill' } : { opacity: 0 }}
      />
      <canvas ref={canvas} aria-hidden="true" />
      {!(fonts && layout) && <div className="preview-stage__loading">Preparando tipografía y video…</div>}
      {controls && (
        <button type="button" className="media-toggle" onClick={toggle} aria-label={playing ? 'Pausar el video de la postal' : 'Reproducir el video de la postal'}>
          {playing ? <IconPause /> : <IconPlay />}
        </button>
      )}
    </div>
  );
}
