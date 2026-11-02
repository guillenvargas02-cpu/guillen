'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useLive } from '@/components/LiveProvider';
import { SignaturePad } from '@/components/SignaturePad';
import { PageHeader } from '@/components/ui';
import { IconAlert, IconCheck } from '@/components/icons';
import { api, ApiError } from '@/lib/client/api';
import { countChars, newId, useLocal, useMemory, useProfile } from '@/lib/client/store';
import { useMine, STATUS_TEXT } from '@/lib/client/useMine';
import type { Strokes } from '@/lib/signature';

type Draft = { client_id: string; name: string; dedication: string; strokes: Strokes; locked: boolean; show: boolean; sig: boolean; social: boolean };
const EMPTY: Draft = { client_id: '', name: '', dedication: '', strokes: [], locked: false, show: false, sig: false, social: false };

function BookForm() {
  const [profile, setProfile] = useProfile();
  const [memory, setMemory] = useMemory();
  const [d, setD, ready] = useLocal<Draft>('borrador:libro', EMPTY);
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'ok' | 'error'; message?: string; show?: boolean }>({ kind: 'idle' });
  const { program } = useLive();
  const ids = useId();
  const open = program?.settings.guestbook_open ?? true;

  useEffect(() => {
    if (!ready) return;
    if (!d.client_id || (!d.name && profile.name)) setD((x) => ({ ...x, client_id: x.client_id || newId(), name: x.name || profile.name }));
  }, [ready, d.client_id, d.name, profile.name, setD]);

  const n = countChars(d.dedication);
  const send = async () => {
    if (!d.name.trim()) return setState({ kind: 'error', message: 'Escribe tu nombre.' });
    if (n < 2) return setState({ kind: 'error', message: 'Escribe tu dedicatoria.' });
    if (n > 500) return setState({ kind: 'error', message: 'La dedicatoria puede tener hasta 500 caracteres.' });
    if (d.strokes.length && !d.locked) return setState({ kind: 'error', message: 'Confirma tu firma (o límpiala) antes de enviar.' });
    setState({ kind: 'sending' });
    try {
      await api('/api/guestbook', {
        json: { client_id: d.client_id, display_name: d.name, dedication: d.dedication, strokes: d.locked ? d.strokes : undefined, consent_show: d.show, consent_signature: d.sig, consent_social: d.social },
      });
      setProfile({ name: d.name.trim() });
      setMemory((m) => ({ ...m, dedication: { body: d.dedication.trim(), at: new Date().toISOString() } }));
      setState({ kind: 'ok', show: d.show });
      setD({ ...EMPTY, client_id: newId(), name: d.name });
    } catch (e) { setState({ kind: 'error', message: (e as ApiError).message }); }
  };
  useEffect(() => {
    if (state.kind !== 'error') return;
    const on = () => send();
    window.addEventListener('online', on);
    return () => window.removeEventListener('online', on);
  });

  if (!open) return <div className="empty"><strong>El libro está cerrado por ahora.</strong></div>;
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
      <div className="field">
        <label className="field__label" htmlFor={`${ids}-n`}>Nombre</label>
        <input id={`${ids}-n`} className="input" autoComplete="name" maxLength={60} value={d.name} onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))} />
      </div>
      <div className="field">
        <div className="field__row">
          <label className="field__label" htmlFor={`${ids}-d`}>Dedicatoria</label>
          <span className={`counter${n > 500 ? ' counter--over' : ''}`}>{n}/500</span>
        </div>
        <textarea id={`${ids}-d`} className="textarea" rows={5} value={d.dedication} aria-invalid={n > 500}
          onChange={(e) => setD((x) => ({ ...x, dedication: e.target.value }))} />
        {memory.wall?.body && memory.wall.body !== d.dedication ? (
          <button type="button" className="linkbtn small" style={{ justifySelf: 'start' }} onClick={() => setD((x) => ({ ...x, dedication: memory.wall!.body }))}>
            Usar mi mensaje del muro
          </button>
        ) : null}
      </div>
      <div className="field">
        <span className="field__label" id={`${ids}-s`}>Firma <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></span>
        <SignaturePad strokes={d.strokes} locked={d.locked} labelledBy={`${ids}-s`}
          onChange={(s) => setD((x) => ({ ...x, strokes: s, sig: s.length ? x.sig : false }))} onLock={(v) => setD((x) => ({ ...x, locked: v }))} />
      </div>
      <fieldset className="consents">
        <legend className="field__label">Tú decides</legend>
        <label className="check">
          <input type="checkbox" checked={d.show} onChange={(e) => setD((x) => ({ ...x, show: e.target.checked }))} />
          <span><strong>Mostrar mi dedicatoria en la plataforma</strong><span>Si no, solo la verá el equipo.</span></span>
        </label>
        <label className="check">
          <input type="checkbox" checked={d.sig} disabled={!d.strokes.length} onChange={(e) => setD((x) => ({ ...x, sig: e.target.checked }))} />
          <span><strong>Publicar mi firma</strong><span>Junto a la dedicatoria, si la muestras.</span></span>
        </label>
        <label className="check">
          <input type="checkbox" checked={d.social} onChange={(e) => setD((x) => ({ ...x, social: e.target.checked }))} />
          <span><strong>Reutilizar en redes del evento</strong><span>SOMOS podrá compartir tu dedicatoria.</span></span>
        </label>
      </fieldset>
      <div className="form__actions">
        <button className="btn btn--block" type="submit" disabled={state.kind === 'sending'}>{state.kind === 'sending' ? 'Enviando…' : 'Firmar el libro'}</button>
      </div>
      <div aria-live="polite">
        {state.kind === 'ok' && (
          <div className="confirm">
            <strong><IconCheck /> Gracias por firmar</strong>
            <span className="small">{state.show ? 'Aparecerá en el libro tras la revisión del equipo.' : 'Tu dedicatoria quedó solo para el equipo.'}</span>
            <Link href="/postal" className="linkbtn small">Crea tu postal en video →</Link>
          </div>
        )}
        {state.kind === 'error' && (
          <div className="confirm confirm--error">
            <strong><IconAlert /> No se envió</strong><span className="small">{state.message}</span>
            <button type="button" className="linkbtn small" onClick={send}>Reintentar</button>
          </div>
        )}
      </div>
    </form>
  );
}

export function BookView() {
  const { guestbook } = useLive();
  const { mine } = useMine();
  const list = guestbook ?? [];
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Dedicatoria y firma" title="Libro" count={list.length} img="/media/foto-macizo-960.jpg" />
      <div className="voice-grid">
        <div className="sheetcard">
          <BookForm />
          {mine?.guestbook.length ? (
            <div className="mine-list">
              <span className="eyebrow">Tus firmas</span>
              <ul>{mine.guestbook.slice(0, 3).map((g) => (
                <li key={g.id}><span className="mine-list__body">{g.dedication}</span>
                  <span className={`chip ${g.status === 'approved' ? 'chip--ok' : 'chip--warn'}`}>{g.consent_show ? STATUS_TEXT[g.status] : 'Privada'}</span></li>
              ))}</ul>
            </div>
          ) : null}
        </div>
        <section aria-label="Dedicatorias">
          {list.length ? (
            <ul className="book">
              {list.map((g) => (
                <li key={g.id} className="entry">
                  <p>{g.dedication}</p>
                  <footer>
                    <b>{g.display_name}{g.is_demo ? <span className="chip demo-flag" style={{ marginLeft: 8 }}>Demostración</span> : null}</b>
                    {g.has_signature ? <img src={`/api/guestbook/${g.id}/signature`} alt={`Firma de ${g.display_name}`} loading="lazy" /> : null}
                  </footer>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty"><strong>Sé la primera firma del libro.</strong><span>Las dedicatorias aparecen tras la revisión del equipo.</span></div>
          )}
        </section>
      </div>
    </div>
  );
}
