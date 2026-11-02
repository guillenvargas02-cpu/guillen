'use client';
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { PostcardPreview } from '@/components/PostcardPreview';
import { PageHeader } from '@/components/ui';
import { useLive } from '@/components/LiveProvider';
import { IconAlert, IconDownload, IconRefresh, IconShare } from '@/components/icons';
import { api, ApiError } from '@/lib/client/api';
import { countChars, newId, useLocal, useProfile } from '@/lib/client/store';
import { FORMATS, LIMITS, type Format } from '@/postcard/compose';

type Draft = { withName: boolean; name: string; format: Format };
type Job = { id: string; status: 'queued' | 'rendering' | 'done' | 'failed'; progress: number; ahead: number; retrying?: boolean; error?: string | null; key: string };

export function PostalView() {
  const [profile, setProfile] = useProfile();
  const [d, setD] = useLocal<Draft>('borrador:postal:v2', { withName: false, name: '', format: 'vertical' });
  const [job, setJob] = useLocal<Job | null>('postal:trabajo:v2', null);
  const [err, setErr] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const { program } = useLive();
  const ids = useId();
  const open = program?.settings.postal_open ?? true;

  const name = d.withName ? d.name.trim() : '';
  const input = useMemo(() => ({ name, format: d.format }), [name, d.format]);
  const key = JSON.stringify(input);
  const current = job && job.key === key ? job : null;

  const poll = useCallback(async (id: string, k: string) => {
    try {
      const r = await api<Omit<Job, 'key'>>(`/api/postal/${id}`, { timeoutMs: 8000 });
      setJob({ ...r, key: k });
    } catch (e) {
      if ((e as ApiError).status === 404) setJob(null);
    }
  }, [setJob]);

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'failed') return;
    const t = setInterval(() => poll(job.id, job.key), 1200);
    return () => clearInterval(t);
  }, [job, poll]);

  const generate = async () => {
    setErr(null);
    if (d.withName && !name) { setErr('Escribe tu nombre o desactiva la opción.'); return; }
    try {
      const r = await api<{ id: string }>('/api/postal', { json: { client_id: newId(), ...input } });
      if (name) setProfile({ name });
      setJob({ id: r.id, status: 'queued', progress: 0, ahead: 0, key });
      poll(r.id, key);
    } catch (e) { setErr((e as ApiError).message); }
  };

  const share = async () => {
    if (!current) return;
    try {
      const blob = await (await fetch(`/api/postal/${current.id}/file?type=mp4`)).blob();
      const file = new File([blob], `postal-everest-${d.format}.mp4`, { type: 'video/mp4' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Saludos desde EVEREST', text: 'Nuestra cima, nuestro futuro · SOMOS' });
      else window.location.href = `/api/postal/${current.id}/file?type=mp4`;
    } catch { /* la persona canceló */ }
  };

  const nName = countChars(d.name);
  const busy = current && (current.status === 'queued' || current.status === 'rendering');
  const pct = current ? Math.round((current.status === 'done' ? 1 : current.progress) * 100) : 0;
  const step = current?.status === 'done' ? 5 : current ? 4 : 3;

  return (
    <div className="page-enter">
      <PageHeader eyebrow="MP4 · 8 s · sin audio" title="Postal" img="/media/foto-atardecer-960.jpg" />
      {!open ? <div className="empty"><strong>La postal no está disponible por ahora.</strong></div> : (
        <div className="postal-layout">
          <ol className="steps">
            <li className="step step--done">
              <span className="step__n">1</span>
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
            <li className={`step ${d.withName && name ? 'step--done' : ''}`}>
              <span className="step__n">2</span>
              <div className="step__body">
                <label className="check" style={{ padding: 0 }}>
                  <input type="checkbox" checked={d.withName}
                    onChange={(e) => setD((x) => ({ ...x, withName: e.target.checked, name: e.target.checked && !x.name ? profile.name : x.name }))} />
                  <span><strong>Firmar con mi nombre</strong><span>Opcional. Aparece como “Con cariño, …”.</span></span>
                </label>
                {d.withName && (
                  <>
                    <label className="sr-only" htmlFor={`${ids}-n`}>Tu nombre</label>
                    <input id={`${ids}-n`} className="input" autoComplete="name" maxLength={LIMITS.name} value={d.name} placeholder="Tu nombre"
                      onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))} />
                    <span className="counter">{nName}/{LIMITS.name}</span>
                  </>
                )}
              </div>
            </li>
            <li className={`step ${step > 3 ? 'step--done' : 'step--active'}`}>
              <span className="step__n">3</span>
              <div className="step__body">
                <span className="step__title">Previsualización</span>
                <span className="small muted">{previewReady ? 'Así se verá: el paisaje en movimiento de fondo y dentro de las letras.' : 'Preparando tipografía y video…'}</span>
              </div>
            </li>
            <li className={`step ${step === 5 ? 'step--done' : step === 4 ? 'step--active' : ''}`}>
              <span className="step__n">4</span>
              <div className="step__body">
                <span className="step__title">Generar</span>
                {!busy && current?.status !== 'done' && (
                  <button className="btn btn--block" onClick={generate} disabled={d.withName && !name}>
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
            <li className={`step ${step === 5 ? 'step--active' : ''}`}>
              <span className="step__n">5</span>
              <div className="step__body">
                <span className="step__title">Descarga o comparte</span>
                {current?.status === 'done' ? (
                  <div className="result">
                    <div className="form__actions">
                      <a className="btn" href={`/api/postal/${current.id}/file?type=mp4`} download><IconDownload /> Video MP4</a>
                      <a className="btn btn--ghost" href={`/api/postal/${current.id}/file?type=png`} download><IconDownload /> Imagen PNG</a>
                      <button className="btn btn--ghost" onClick={share}><IconShare /> Compartir</button>
                    </div>
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
                <PostcardPreview input={input} onReady={setPreviewReady} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
