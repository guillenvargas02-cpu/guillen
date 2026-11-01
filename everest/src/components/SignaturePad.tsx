'use client';
// Firma con dedo, mouse o lápiz (Pointer Events). Los trazos se guardan en coordenadas
// normalizadas (1000 × 400), así sobreviven a cambios de orientación y tamaño.
// touch-action: none + preventDefault evitan que la página se desplace mientras se firma.
import { useCallback, useEffect, useRef } from 'react';
import { SIG_H, SIG_W, strokeWidth, type Point, type Strokes } from '@/lib/signature';
import { IconCheck, IconEraser, IconUndo } from './icons';

export function SignaturePad({ strokes, onChange, locked, onLock, labelledBy }: {
  strokes: Strokes; onChange: (s: Strokes) => void; locked: boolean; onLock: (v: boolean) => void; labelledBy?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<Point[] | null>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    const k = (w * dpr) / SIG_W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.strokeStyle = '#111'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const all = live.current ? [...strokesRef.current, live.current] : strokesRef.current;
    for (const s of all) {
      ctx.lineWidth = strokeWidth(s);
      ctx.beginPath();
      ctx.moveTo(s[0][0], s[0][1]);
      if (s.length === 1) ctx.lineTo(s[0][0] + 0.1, s[0][1]);
      for (let i = 1; i < s.length - 1; i++) {
        const [x, y] = s[i], [nx, ny] = s[i + 1];
        ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
      }
      if (s.length > 1) ctx.lineTo(s[s.length - 1][0], s[s.length - 1][1]);
      ctx.stroke();
    }
  }, []);

  useEffect(() => { draw(); }, [strokes, draw]);
  useEffect(() => {
    const c = canvas.current!;
    const ro = new ResizeObserver(() => { c.width = 0; draw(); });
    ro.observe(c);
    const stop = (e: TouchEvent) => { if (!locked) e.preventDefault(); };
    c.addEventListener('touchstart', stop, { passive: false });
    c.addEventListener('touchmove', stop, { passive: false });
    return () => { ro.disconnect(); c.removeEventListener('touchstart', stop); c.removeEventListener('touchmove', stop); };
  }, [draw, locked]);

  const pt = (e: PointerEvent | React.PointerEvent): Point => {
    const r = canvas.current!.getBoundingClientRect();
    const pressure = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;
    return [((e.clientX - r.left) / r.width) * SIG_W, ((e.clientY - r.top) / r.height) * SIG_H, pressure];
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (locked || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    canvas.current!.setPointerCapture(e.pointerId);
    live.current = [pt(e)];
    draw();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!live.current) return;
    e.preventDefault();
    const evs = (e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]) as PointerEvent[];
    for (const ev of evs) {
      const p = pt(ev);
      const last = live.current[live.current.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 1.2) live.current.push(p);
    }
    draw();
  };
  const up = () => {
    if (!live.current) return;
    const s = live.current;
    live.current = null;
    onChange([...strokesRef.current, s]);
  };

  return (
    <div className="sigpad">
      <div className={`sigpad__frame${locked ? ' sigpad__frame--locked' : ''}`}>
        <span className="sigpad__baseline" aria-hidden="true" />
        {!strokes.length && <span className="sigpad__hint" aria-hidden="true">Firma aquí</span>}
        <canvas ref={canvas} role="img" aria-labelledby={labelledBy}
          aria-label={strokes.length ? `Firma con ${strokes.length} trazos${locked ? ', confirmada' : ''}` : 'Área de firma vacía'}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} />
      </div>
      <div className="sigpad__tools">
        {locked ? (
          <>
            <span className="chip chip--ok"><IconCheck width={14} height={14} /> Firma confirmada</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onLock(false)}>Editar</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(strokes.slice(0, -1))} disabled={!strokes.length}><IconUndo /> Deshacer</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange([])} disabled={!strokes.length}><IconEraser /> Limpiar</button>
            <button type="button" className="btn btn--sm" onClick={() => onLock(true)} disabled={!strokes.length}><IconCheck /> Confirmar firma</button>
          </>
        )}
      </div>
    </div>
  );
}
