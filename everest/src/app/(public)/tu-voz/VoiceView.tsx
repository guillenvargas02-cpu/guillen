'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useState } from 'react';
import { useLive } from '@/components/LiveProvider';
import { WallList, WordCloud } from '@/components/voice';
import { IconAlert, IconCheck } from '@/components/icons';
import { api, ApiError } from '@/lib/client/api';
import { countChars, newId, useLocal, useMemory, useProfile } from '@/lib/client/store';
import { useMine, STATUS_TEXT } from '@/lib/client/useMine';
import { PageHeader } from '@/components/ui';
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
      <h2 className="form__q">{PROMPTS[draft.prompt]}</h2>
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
        <button className="btn btn--block" type="submit" disabled={state.kind === 'sending'}>{state.kind === 'sending' ? 'Enviando…' : 'Enviar al muro'}</button>
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
    <section className="word-box" aria-labelledby={`${ids}-t`}>
      <span className="eyebrow">{q === 'somos' ? 'Pregunta 1 de 2' : 'Pregunta 2 de 2'} · una palabra</span>
      <h2 id={`${ids}-t`} className="word-box__q">{WORD_QUESTIONS[q].label}</h2>
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
            <button className="btn" disabled={state.kind === 'sending' || !value.trim()}>{my ? 'Actualizar' : 'Enviar'}</button>
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

const TABS = [
  { id: 'muro', label: 'Muro' },
  { id: 'somos', label: 'SOMOS' },
  { id: 'noche', label: 'Esta noche' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function VoiceView() {
  const { wall } = useLive();
  const [tab, setTab] = useState<Tab>('muro');
  useEffect(() => {
    const read = () => {
      const q = new URLSearchParams(window.location.search).get('tab') || window.location.hash.replace('#', '');
      if (q === 'palabras') setTab('somos');
      else if (TABS.some((t) => t.id === q)) setTab(q as Tab);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const choose = (t: Tab) => {
    setTab(t);
    const u = new URL(window.location.href);
    u.searchParams.set('tab', t); u.hash = '';
    window.history.replaceState(null, '', u.toString());
  };
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Participa" title="Tu voz" img="/media/foto-cumbre-960.jpg" />
      <div className="tabs" role="tablist" aria-label="Dinámicas">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => choose(t.id)}>{t.label}</button>
        ))}
      </div>
      <section id="panel-muro" role="tabpanel" aria-labelledby="tab-muro" hidden={tab !== 'muro'} className="voice-section">
        <div className="voice-grid">
          <div className="sheetcard"><WallForm /><MyMessages /></div>
          <div><WallList messages={wall ?? []} /></div>
        </div>
      </section>
      <section id="panel-somos" role="tabpanel" aria-labelledby="tab-somos" hidden={tab !== 'somos'} className="voice-section">
        <WordBox q="somos" />
      </section>
      <section id="panel-noche" role="tabpanel" aria-labelledby="tab-noche" hidden={tab !== 'noche'} className="voice-section">
        <WordBox q="noche" />
      </section>
    </div>
  );
}
