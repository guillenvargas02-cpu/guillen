'use client';
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { PostcardPreview } from '@/components/PostcardPreview';
import { useLive } from '@/components/LiveProvider';
import { IconAlert, IconDownload, IconRefresh, IconShare } from '@/components/icons';
import { api, ApiError } from '@/lib/client/api';
import { countChars, newId, useLocal, useMemory, useProfile } from '@/lib/client/store';
import { FORMATS, LIMITS, type Format } from '@/postcard/compose';

type Draft = { name: string; phrase: string; format: Format };
type Job = { id: string; status: 'queued' | 'rendering' | 'done' | 'failed'; progress: number; ahead: number; retrying?: boolean; error?: string | null; key: string };

function fit(text: string, max: number) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (countChars(t) <= max) return { text: t, cut: false };
  const cut = [...t].slice(0, max - 1).join('');
  return { text: cut.replace(/\s+\S*$/, '') + '…', cut: true };
}

export function PostalView() {
  const [profile, setProfile] = useProfile();
  const [memory] = useMemory();
  const [d, setD, ready] = useLocal<Draft>('borrador:postal', { name: '', phrase: '', format: 'vertical' });
  const [job, setJob] = useLocal<Job | null>('postal:trabajo', null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const { program } = useLive();
  const ids = useId();
  const open = program?.settings.postal_open ?? true;

  useEffect(() => { if (ready && !d.name && profile.name) setD((x) => ({ ...x, name: profile.name })); }, [ready, d.name, profile.name, setD]);

  const input = useMemo(() => ({ name: d.name.trim(), phrase: d.phrase.trim(), format: d.format }), [d.name, d.phrase, d.format]);
  const key = JSON.stringify(input);
  const current = job && job.key === key ? job : null;

  const poll = useCallback(async (id: string, k: string) => {
    try {
      const r = await api<Omit<Job, 'key'>>(`/api/postal/${id}`, { timeoutMs: 8000 });
      setJob({ ...r, key: k });
      return r.status;
    } catch (e) {
      if ((e as ApiError).status === 404) { setJob(null); return 'failed'; }
      return 'network';
    }
  }, [setJob]);

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'failed') return;
    const t = setInterval(() => poll(job.id, job.key), 1200);
    return () => clearInterval(t);
  }, [job, poll]);

  const generate = async () => {
    setErr(null);
    if (!input.name) { setErr('Escribe tu nombre para la postal.'); return; }
    try {
      const r = await api<{ id: string }>('/api/postal', { json: { client_id: newId(), ...input } });
      setProfile({ name: input.name });
      setJob({ id: r.id, status: 'queued', progress: 0, ahead: 0, key });
      poll(r.id, key);
    } catch (e) { setErr((e as ApiError).message); }
  };

  const share = async () => {
    if (!current) return;
    try {
      const blob = await (await fetch(`/api/postal/${current.id}/file?type=mp4`)).blob();
      const file = new File([blob], `postal-everest-${d.format}.mp4`, { type: 'video/mp4' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Mi postal EVEREST', text: 'Nuestra cima, nuestro futuro · SOMOS' });
      else window.location.href = `/api/postal/${current.id}/file?type=mp4`;
    } catch { /* la persona canceló */ }
  };

  const applyText = (t: string) => {
    const f = fit(t, LIMITS.phrase);
    setD((x) => ({ ...x, phrase: f.text }));
    setNote(f.cut ? `Recortamos el texto a ${LIMITS.phrase} caracteres; puedes editarlo.` : null);
  };

  const nName = countChars(d.name), nPhrase = countChars(d.phrase);
  const step = !input.name ? 1 : current?.status === 'done' ? 6 : current ? 5 : 4;
  const busy = current && (current.status === 'queued' || current.status === 'rendering');
  const pct = current ? Math.round((current.status === 'done' ? 1 : current.progress) * 100) : 0;

  return (
    <div className="page-enter">
      <header className="pagehead">
        <img className="pagehead__img" src="/media/foto-atardecer.jpg" alt="" />
        <div className="pagehead__body"><span className="eyebrow">MP4 · 8 s · sin audio</span><h1>Tu postal en video</h1></div>
      </header>
      {!open ? <div className="empty"><strong>La postal no está disponible por ahora.</strong></div> : (
        <div className="postal-layout">
          <ol className="steps">
            <li className={`step ${step > 1 ? 'step--done' : 'step--active'}`}>
              <span className="step__n">1</span>
              <div className="step__body">
                <label className="step__title" htmlFor={`${ids}-n`}>Tu nombre</label>
                <input id={`${ids}-n`} className="input" autoComplete="name" maxLength={LIMITS.name} value={d.name} onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))} />
                <span className="counter">{nName}/{LIMITS.name}</span>
              </div>
            </li>
            <li className={`step ${d.phrase ? 'step--done' : step >= 2 ? 'step--active' : ''}`}>
              <span className="step__n">2</span>
              <div className="step__body">
                <label className="step__title" htmlFor={`${ids}-p`}>Frase <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label>
                <textarea id={`${ids}-p`} className="textarea" style={{ minHeight: 84 }} rows={2} value={d.phrase} maxLength={LIMITS.phrase + 10}
                  aria-invalid={nPhrase > LIMITS.phrase} onChange={(e) => { setD((x) => ({ ...x, phrase: e.target.value })); setNote(null); }} />
                <div className="field__row">
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {memory.wall?.body ? <button type="button" className="linkbtn small" onClick={() => applyText(memory.wall!.body)}>Usar mi mensaje del muro</button> : null}
                    {memory.dedication?.body ? <button type="button" className="linkbtn small" onClick={() => applyText(memory.dedication!.body)}>Usar mi dedicatoria</button> : null}
                  </div>
                  <span className={`counter${nPhrase > LIMITS.phrase ? ' counter--over' : ''}`}>{nPhrase}/{LIMITS.phrase}</span>
                </div>
                {note ? <p className="field__hint">{note}</p> : null}
              </div>
            </li>
            <li className={`step ${step >= 2 ? 'step--done' : ''}`}>
              <span className="step__n">3</span>
              <div className="step__body">
                <span className="step__title" id={`${ids}-f`}>Formato</span>
                <div className="formats" role="radiogroup" aria-labelledby={`${ids}-f`}>
                  {(Object.keys(FORMATS) as Format[]).map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={d.format === f} className="format" onClick={() => setD((x) => ({ ...x, format: f }))}>
                      <span className="format__shape" style={f === 'vertical' ? { width: 18, height: 32 } : { width: 32, height: 18 }} />
                      <strong>{FORMATS[f].label}{f === 'vertical' ? ' · principal' : ''}</strong>
                      <span>{FORMATS[f].w} × {FORMATS[f].h}</span>
                    </button>
                  ))}
                </div>
              </div>
            </li>
            <li className={`step ${step >= 5 ? 'step--done' : step === 4 ? 'step--active' : ''}`}>
              <span className="step__n">4</span>
              <div className="step__body">
                <span className="step__title">Previsualización</span>
                <span className="small muted">{previewReady ? 'Así se verá tu video: el paisaje se mueve dentro de las letras.' : 'Preparando tipografía y video…'}</span>
              </div>
            </li>
            <li className={`step ${step === 6 ? 'step--done' : step === 5 ? 'step--active' : ''}`}>
              <span className="step__n">5</span>
              <div className="step__body">
                <span className="step__title">Generar</span>
                {!busy && current?.status !== 'done' && (
                  <button className="btn btn--rosa" onClick={generate} disabled={!input.name || nPhrase > LIMITS.phrase}>
                    {current?.status === 'failed' ? <><IconRefresh /> Intentar de nuevo</> : 'Generar mi postal'}
                  </button>
                )}
                {busy && (
                  <div style={{ display: 'grid', gap: 8 }} aria-live="polite">
                    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progreso de la postal">
                      <div className="progress__bar" style={{ width: `${Math.max(4, pct)}%` }} />
                    </div>
                    <span className="small muted">
                      {current!.status === 'queued' ? (current!.ahead > 0 ? `En fila · ${current!.ahead} antes que la tuya` : current!.retrying ? 'Reintentando…' : 'Preparando…') : `Generando · ${pct}%`}
                    </span>
                  </div>
                )}
                {current?.status === 'failed' && <p className="error"><IconAlert width={16} height={16} style={{ display: 'inline', verticalAlign: '-3px' }} /> {current.error}</p>}
                {err && <p className="error" role="alert">{err}</p>}
              </div>
            </li>
            <li className={`step ${step === 6 ? 'step--active' : ''}`}>
              <span className="step__n">6</span>
              <div className="step__body">
                <span className="step__title">Descarga o comparte</span>
                {current?.status === 'done' ? (
                  <div className="result">
                    <div className="form__actions">
                      <a className="btn btn--rosa" href={`/api/postal/${current.id}/file?type=mp4`} download><IconDownload /> Video MP4</a>
                      <a className="btn btn--ghost" href={`/api/postal/${current.id}/file?type=png`} download><IconDownload /> Imagen PNG</a>
                      <button className="btn btn--ghost" onClick={share}><IconShare /> Compartir</button>
                    </div>
                    <span className="small muted">¿Cambiaste algo? Edita y vuelve a generar.</span>
                  </div>
                ) : <span className="small muted">Disponible al terminar.</span>}
              </div>
            </li>
          </ol>
          <div className="postal-preview-col">
            <div className={`preview-wrap preview-wrap--${d.format}`}>
              {current?.status === 'done' ? (
                <video key={current.id} src={`/api/postal/${current.id}/file?type=mp4&inline`} controls playsInline autoPlay muted loop
                  style={{ width: '100%', maxWidth: d.format === 'vertical' ? 380 : 760, borderRadius: 10 }} aria-label="Tu postal generada" />
              ) : (
                <PostcardPreview input={{ ...input, name: input.name || 'Tu nombre' }} onReady={setPreviewReady} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
