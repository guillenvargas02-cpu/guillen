'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useState } from 'react';
import { useLive } from '@/components/LiveProvider';
import { WallList, WordCloud } from '@/components/voice';
import { IconAlert, IconCheck } from '@/components/icons';
import { api, ApiError } from '@/lib/client/api';
import { countChars, newId, useLocal, useMemory, useProfile } from '@/lib/client/store';
import { useMine, STATUS_TEXT } from '@/lib/client/useMine';
import { checkWord, WORD_MAX, WORD_QUESTIONS, type WordQuestion } from '@/lib/words';

type WallDraft = { client_id: string; prompt: 'llevas' | 'expectativa'; name: string; body: string; consent: boolean };
const PROMPTS = { llevas: '¿Qué te llevas de esta noche?', expectativa: '¿Qué esperas de este encuentro?' } as const;

function WallForm() {
  const [profile, setProfile] = useProfile();
  const [, setMemory] = useMemory();
  const [draft, setDraft, ready] = useLocal<WallDraft>('borrador:muro', { client_id: '', prompt: 'llevas', name: '', body: '', consent: false });
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'ok' | 'error'; message?: string; consent?: boolean }>({ kind: 'idle' });
  const { program } = useLive();
  const open = program?.settings.wall_open ?? true;
  const ids = useId();

  useEffect(() => {
    if (!ready) return;
    if (!draft.client_id || (!draft.name && profile.name)) setDraft((d) => ({ ...d, client_id: d.client_id || newId(), name: d.name || profile.name }));
  }, [ready, draft.client_id, draft.name, profile.name, setDraft]);

  const n = countChars(draft.body);
  const send = async () => {
    if (!draft.name.trim()) return setState({ kind: 'error', message: 'Escribe el nombre que quieres mostrar.' });
    if (n < 2) return setState({ kind: 'error', message: 'Escribe tu mensaje.' });
    if (n > 280) return setState({ kind: 'error', message: 'Tu mensaje puede tener hasta 280 caracteres.' });
    setState({ kind: 'sending' });
    try {
      const r = await api<{ status: string; consent_public: boolean }>('/api/wall', {
        json: { client_id: draft.client_id, prompt: draft.prompt, display_name: draft.name, body: draft.body, consent_public: draft.consent },
      });
      setProfile({ name: draft.name.trim() });
      setMemory((m) => ({ ...m, wall: { body: draft.body.trim(), at: new Date().toISOString() } }));
      setDraft({ client_id: newId(), prompt: draft.prompt, name: draft.name, body: '', consent: false });
      setState({ kind: 'ok', consent: r.consent_public });
    } catch (e) {
      setState({ kind: 'error', message: (e as ApiError).message });
    }
  };
  // Reintento automático al recuperar la señal (mismo identificador: no duplica).
  useEffect(() => {
    if (state.kind !== 'error') return;
    const on = () => send();
    window.addEventListener('online', on);
    return () => window.removeEventListener('online', on);
  });

  if (!open) return <div className="empty"><strong>El muro está cerrado por ahora.</strong></div>;
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
      <div className="segmented" role="radiogroup" aria-label="Pregunta">
        {(Object.keys(PROMPTS) as (keyof typeof PROMPTS)[]).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={draft.prompt === k} onClick={() => setDraft((d) => ({ ...d, prompt: k }))}>
            {k === 'llevas' ? 'Me llevo' : 'Espero'}
          </button>
        ))}
      </div>
      <h3 style={{ fontSize: 22 }}>{PROMPTS[draft.prompt]}</h3>
      <div className="field">
        <label className="field__label" htmlFor={`${ids}-n`}>Nombre visible</label>
        <input id={`${ids}-n`} className="input" autoComplete="nickname" maxLength={60} value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
      </div>
      <div className="field">
        <div className="field__row">
          <label className="field__label" htmlFor={`${ids}-m`}>Mensaje</label>
          <span className={`counter${n > 280 ? ' counter--over' : ''}`} aria-live="polite">{n}/280</span>
        </div>
        <textarea id={`${ids}-m`} className="textarea" rows={4} value={draft.body} aria-invalid={n > 280}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
      </div>
      <label className="check">
        <input type="checkbox" checked={draft.consent} onChange={(e) => setDraft((d) => ({ ...d, consent: e.target.checked }))} />
        <span><strong>Mostrar en el muro y en la pantalla</strong><span>Si no lo marcas, solo lo leerá el equipo.</span></span>
      </label>
      <div className="form__actions">
        <button className="btn btn--rosa" type="submit" disabled={state.kind === 'sending'}>{state.kind === 'sending' ? 'Enviando…' : 'Enviar'}</button>
      </div>
      <div aria-live="polite">
        {state.kind === 'ok' && (
          <div className="confirm">
            <strong><IconCheck /> Recibido</strong>
            <span className="small">{state.consent ? 'Aparecerá en el muro cuando el equipo lo revise.' : 'Solo lo verá el equipo.'}</span>
          </div>
        )}
        {state.kind === 'error' && (
          <div className="confirm confirm--error">
            <strong><IconAlert /> No se envió</strong>
            <span className="small">{state.message}</span>
            <button type="button" className="linkbtn small" onClick={send}>Reintentar</button>
          </div>
        )}
      </div>
    </form>
  );
}

function MyMessages() {
  const { mine } = useMine();
  if (!mine?.wall.length) return null;
  return (
    <div className="mine-list">
      <span className="eyebrow">Tus mensajes</span>
      <ul>
        {mine.wall.slice(0, 3).map((m) => (
          <li key={m.id}>
            <span className="mine-list__body">{m.body}</span>
            <span className={`chip ${m.status === 'approved' ? 'chip--ok' : m.status === 'pending' ? 'chip--warn' : ''}`}>
              {m.consent_public ? STATUS_TEXT[m.status] : 'Solo para el equipo'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WordBox({ q }: { q: WordQuestion }) {
  const { words, program } = useLive();
  const { mine, reload } = useMine();
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'error'; message?: string }>({ kind: 'idle' });
  const ids = useId();
  const my = mine?.words[q];
  const open = q === 'somos' ? program?.settings.words_somos_open ?? true : program?.settings.words_night_open ?? true;
  const check = value ? checkWord(value) : null;

  const send = async () => {
    const c = checkWord(value);
    if (!c.ok) return setState({ kind: 'error', message: c.message });
    setState({ kind: 'sending' });
    try {
      await api('/api/words', { json: { question: q, word: value } });
      setValue(''); setEditing(false); setState({ kind: 'idle' });
      reload();
    } catch (e) { setState({ kind: 'error', message: (e as ApiError).message }); }
  };

  return (
    <section className="panel word-box" aria-labelledby={`${ids}-t`}>
      <span className="eyebrow eyebrow--rosa">{q === 'somos' ? 'Pregunta 1' : 'Pregunta 2'}</span>
      <h3 id={`${ids}-t`} style={{ fontSize: 22, margin: '6px 0 14px' }}>{WORD_QUESTIONS[q].label}</h3>
      {my && !editing ? (
        <div className="mine">
          <span>Tu palabra</span><b>{my.display}</b>
          <span className={`chip ${my.status === 'approved' ? 'chip--ok' : my.status === 'pending' ? 'chip--warn' : ''}`}>{STATUS_TEXT[my.status]}</span>
          {open && <button className="linkbtn small" onClick={() => { setEditing(true); setValue(my.display); }}>Cambiar</button>}
        </div>
      ) : open ? (
        <form className="form" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
          <label className="sr-only" htmlFor={`${ids}-w`}>{WORD_QUESTIONS[q].label}</label>
          <div className="inline-form">
            <input id={`${ids}-w`} className="input" value={value} maxLength={WORD_MAX + 20} autoCapitalize="sentences" autoComplete="off" spellCheck
              placeholder="Una palabra" aria-invalid={!!check && !check.ok} aria-describedby={`${ids}-e`}
              onChange={(e) => { setValue(e.target.value); setState({ kind: 'idle' }); }} />
            <button className="btn btn--rosa" disabled={state.kind === 'sending' || !value.trim()}>{my ? 'Actualizar' : 'Enviar'}</button>
          </div>
          <p id={`${ids}-e`} className={check && !check.ok && check.reason === 'frase' ? 'field__hint' : 'error'} aria-live="polite">
            {state.kind === 'error' ? state.message : check && !check.ok && value.trim().length > 1 ? check.message : ''}
          </p>
        </form>
      ) : (
        <p className="muted small">Esta dinámica está cerrada.</p>
      )}
      <div style={{ marginTop: 14 }}>
        <WordCloud words={words?.[q] ?? []} label={WORD_QUESTIONS[q].short} />
      </div>
    </section>
  );
}

export function VoiceView() {
  const { wall } = useLive();
  return (
    <div className="page-enter">
      <header className="pagehead">
        <img className="pagehead__img" src="/media/foto-cumbre.jpg" alt="" style={{ objectPosition: '50% 30%' }} />
        <div className="pagehead__body">
          <span className="eyebrow">Muro · Palabras</span>
          <h1>Tu voz</h1>
        </div>
      </header>
      <nav className="subnav" aria-label="En esta sección">
        <a href="#muro">Muro</a><a href="#palabras">SOMOS en una palabra</a><a href="#noche">Esta noche</a>
      </nav>
      <section id="muro" className="voice-section" aria-label="Muro">
        <div className="voice-grid">
          <div className="panel"><WallForm /><MyMessages /></div>
          <div><WallList messages={wall ?? []} /></div>
        </div>
      </section>
      <section id="palabras" className="voice-section" aria-label="Palabras">
        <div className="words-grid">
          <WordBox q="somos" />
          <div id="noche" style={{ scrollMarginTop: 130 }}><WordBox q="noche" /></div>
        </div>
      </section>
    </div>
  );
}
