'use client';
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SomosLogo } from '@/components/Logo';
import { api, ApiError } from '@/lib/client/api';
import { fmtTime, isoToCdmxLocal } from '@/lib/event';
import type { ProgramItem, Participant } from '@/lib/types';

type Me = { id: string; name: string; role: 'admin' | 'programa' | 'moderacion'; email: string };
type State = {
  me: Me;
  program: { items: ProgramItem[] };
  settings: Record<string, unknown> & { show_demo: boolean; concluded_at: string | null };
  notices: { id: string; body: string; tone: string; published: boolean; created_at: string }[];
  wall: { id: string; prompt: string; display_name: string; body: string; consent_public: boolean; status: string; featured: boolean; is_demo: boolean; created_at: string }[];
  guestbook: { id: string; display_name: string; dedication: string; consent_show: boolean; consent_signature: boolean; consent_social: boolean; status: string; featured: boolean; is_demo: boolean; has_signature: boolean; created_at: string }[];
  words: { question: string; key: string; display: string | null; status: string; n: number; sample: string; is_demo: boolean }[];
  renders: { queued: number; rendering: number; done: number; failed: number };
  users: { id: string; email: string; name: string; role: string; active: boolean; last_login_at: string | null }[];
};

const CAN = {
  program: ['admin', 'programa'], moderate: ['admin', 'moderacion'], dynamics: ['admin', 'moderacion'], users: ['admin'], exports: ['admin', 'moderacion'],
} as const;
const STATUS: Record<string, string> = { pending: 'Pendiente', live: 'En curso', paused: 'En pausa', done: 'Terminada', cancelled: 'Cancelada', approved: 'Aprobado', rejected: 'Rechazado', withdrawn: 'Retirado' };

async function rpc(op: string, args: unknown) {
  return api('/api/admin/rpc', { json: { op, args } });
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main className="admin-login">
      <form className="panel form" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr('');
        try { await api('/api/admin/login', { json: { email, password } }); onDone(); } catch (x) { setErr((x as ApiError).message); } finally { setBusy(false); }
      }}>
        <SomosLogo width={120} />
        <h1 style={{ fontSize: 26 }}>Panel del equipo</h1>
        <div className="field"><label className="field__label" htmlFor="em">Correo</label><input id="em" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label className="field__label" htmlFor="pw">Contraseña</label><input id="pw" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn btn--rosa" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  );
}

const emptyItem = { title: '', description: '', participants: [] as Participant[], participants_note: '', planned_start: '', planned_end: '', schedule_note: '' };

function ItemEditor({ item, onClose, onSaved }: { item: ProgramItem | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(() => item ? {
    title: item.title, description: item.description, participants: item.participants ?? [], participants_note: item.participants_note,
    planned_start: isoToCdmxLocal(item.planned_start), planned_end: isoToCdmxLocal(item.planned_end), schedule_note: item.schedule_note,
  } : { ...emptyItem, planned_start: '2026-11-03T17:00' });
  const [markChange, setMarkChange] = useState(true);
  const [err, setErr] = useState('');
  const timesChanged = item && (f.planned_start !== isoToCdmxLocal(item.planned_start) || f.planned_end !== isoToCdmxLocal(item.planned_end));
  const save = async () => {
    setErr('');
    try {
      await rpc(item ? 'program.update' : 'program.create', { ...(item ? { id: item.id, mark_change: !!timesChanged && markChange } : {}), ...f, participants: f.participants.filter((p) => p.name.trim()) });
      onSaved(); onClose();
    } catch (e) { setErr((e as ApiError).message); }
  };
  const setP = (i: number, patch: Partial<Participant>) => setF((x) => ({ ...x, participants: x.participants.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="ed-t">
      <div className="panel form admin-modal__card">
        <h2 id="ed-t" style={{ fontSize: 22 }}>{item ? 'Editar actividad' : 'Nueva actividad'}</h2>
        <div className="field"><label className="field__label" htmlFor="t">Título</label><input id="t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div className="field"><label className="field__label" htmlFor="d">Descripción</label><textarea id="d" className="textarea" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="admin-two">
          <div className="field"><label className="field__label" htmlFor="ps">Inicio previsto (CDMX)</label><input id="ps" className="input" type="datetime-local" value={f.planned_start} onChange={(e) => setF({ ...f, planned_start: e.target.value })} /></div>
          <div className="field"><label className="field__label" htmlFor="pe">Término previsto</label><input id="pe" className="input" type="datetime-local" value={f.planned_end} onChange={(e) => setF({ ...f, planned_end: e.target.value })} /></div>
        </div>
        <div className="field"><label className="field__label" htmlFor="sn">Nota de horario</label><input id="sn" className="input" placeholder="Ej. Horario por confirmar" value={f.schedule_note} onChange={(e) => setF({ ...f, schedule_note: e.target.value })} /></div>
        {timesChanged ? (
          <label className="check"><input type="checkbox" checked={markChange} onChange={(e) => setMarkChange(e.target.checked)} /><span><strong>Mostrar “Cambio de horario”</strong><span>Avisa al público que el horario se modificó.</span></span></label>
        ) : null}
        <fieldset className="consents">
          <legend className="field__label">Participantes</legend>
          {f.participants.map((p, i) => (
            <div key={i} className="admin-participant">
              <input className="input" aria-label="Nombre" placeholder="Nombre" value={p.name} onChange={(e) => setP(i, { name: e.target.value })} />
              <input className="input" aria-label="Cargo" placeholder="Cargo o descripción" value={p.role ?? ''} onChange={(e) => setP(i, { role: e.target.value })} />
              <label className="tiny"><input type="checkbox" checked={!!p.pending} onChange={(e) => setP(i, { pending: e.target.checked })} /> Por confirmar</label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF((x) => ({ ...x, participants: x.participants.filter((_, j) => j !== i) }))}>Quitar</button>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF((x) => ({ ...x, participants: [...x.participants, { name: '', role: '', pending: true }] }))}>+ Participante</button>
        </fieldset>
        <div className="field"><label className="field__label" htmlFor="pn">Nota de participantes</label><input id="pn" className="input" value={f.participants_note} onChange={(e) => setF({ ...f, participants_note: e.target.value })} /></div>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="form__actions"><button className="btn btn--rosa" onClick={save}>Guardar</button><button className="btn btn--ghost" onClick={onClose}>Cancelar</button></div>
      </div>
    </div>
  );
}

function ProgramTab({ s, reload, can }: { s: State; reload: () => void; can: boolean }) {
  const [edit, setEdit] = useState<ProgramItem | null | 'new'>(null);
  const [msg, setMsg] = useState('');
  const items = [...s.program.items].sort((a, b) => a.position - b.position);
  const act = async (id: string, action: string, finish_current = false) => {
    setMsg('');
    try { await rpc('program.transition', { id, action, finish_current }); reload(); }
    catch (e) {
      const err = e as ApiError;
      if (err.data?.needsFinish && confirm(err.message)) return act(id, action, true);
      setMsg(err.message);
    }
  };
  const doRpc = async (op: string, args: unknown) => { setMsg(''); try { await rpc(op, args); reload(); } catch (e) { setMsg((e as ApiError).message); } };
  return (
    <section>
      <div className="admin-bar">
        <h2>Programa</h2>
        {can && <button className="btn btn--rosa btn--sm" onClick={() => setEdit('new')}>+ Actividad</button>}
        {can && (s.settings.concluded_at
          ? <button className="btn btn--ghost btn--sm" onClick={() => doRpc('event.conclude', { concluded: false })}>Reabrir evento</button>
          : <button className="btn btn--ghost btn--sm" onClick={() => confirm('¿Marcar el evento como concluido?') && doRpc('event.conclude', { concluded: true })}>Concluir evento</button>)}
      </div>
      <p className="small muted">La llegada de una hora prevista no inicia nada: el equipo confirma cada cambio. Solo puede haber una actividad en curso.</p>
      {msg && <p className="error" role="alert">{msg}</p>}
      <ol className="admin-list">
        {items.map((it, i) => (
          <li key={it.id} className={`admin-item admin-item--${it.status}`}>
            <div className="admin-item__main">
              <div className="admin-item__time"><span className="num">{it.planned_start ? fmtTime(it.planned_start) : '··:··'}</span><small>{it.planned_end ? `a ${fmtTime(it.planned_end)}` : it.schedule_note}</small></div>
              <div>
                <strong>{it.title}</strong>
                <div className="admin-meta">
                  <span className={`chip ${it.status === 'live' ? 'chip--rosa' : it.status === 'done' ? 'chip--ok' : ''}`}>{STATUS[it.status]}</span>
                  {it.actual_start_at && <span className="tiny muted">Inicio real {fmtTime(it.actual_start_at)}</span>}
                  {it.actual_end_at && <span className="tiny muted">· Cierre {fmtTime(it.actual_end_at)}</span>}
                  {it.schedule_changed_at && <span className="chip chip--warn">Cambio de horario</span>}
                  {it.is_demo && <span className="chip demo-flag">Demo</span>}
                </div>
              </div>
            </div>
            {can && (
              <div className="admin-actions">
                {(it.status === 'pending' || it.status === 'cancelled' || it.status === 'done') && <button className="btn btn--sm btn--rosa" onClick={() => act(it.id, 'start')}>Iniciar</button>}
                {it.status === 'live' && <button className="btn btn--sm" onClick={() => act(it.id, 'pause')}>Pausar</button>}
                {it.status === 'paused' && <button className="btn btn--sm btn--rosa" onClick={() => act(it.id, 'resume')}>Reanudar</button>}
                {(it.status === 'live' || it.status === 'paused') && <button className="btn btn--sm" onClick={() => act(it.id, 'finish')}>Terminar</button>}
                {it.status !== 'done' && it.status !== 'cancelled' && <button className="btn btn--sm btn--ghost" onClick={() => confirm('¿Cancelar esta actividad?') && act(it.id, 'cancel')}>Cancelar</button>}
                {it.status !== 'pending' && <button className="btn btn--sm btn--ghost" onClick={() => confirm('¿Regresar a pendiente y borrar tiempos reales?') && act(it.id, 'reset')}>Restablecer</button>}
                <button className="btn btn--sm btn--ghost" onClick={() => setEdit(it)}>Editar</button>
                {it.schedule_changed_at && <button className="btn btn--sm btn--ghost" onClick={() => doRpc('program.clearChange', { id: it.id })}>Quitar aviso de cambio</button>}
                <button className="btn btn--sm btn--ghost" aria-label="Subir" disabled={i === 0} onClick={() => doRpc('program.move', { id: it.id, dir: 'up' })}>↑</button>
                <button className="btn btn--sm btn--ghost" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => doRpc('program.move', { id: it.id, dir: 'down' })}>↓</button>
                <button className="btn btn--sm btn--ghost" onClick={() => confirm(`¿Eliminar “${it.title}”?`) && doRpc('program.delete', { id: it.id })}>Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {edit && <ItemEditor item={edit === 'new' ? null : edit} onClose={() => setEdit(null)} onSaved={reload} />}
    </section>
  );
}

function NoticesTab({ s, reload }: { s: State; reload: () => void }) {
  const [body, setBody] = useState('');
  const [tone, setTone] = useState<'info' | 'importante'>('info');
  const [err, setErr] = useState('');
  const run = async (op: string, args: unknown) => { setErr(''); try { await rpc(op, args); reload(); } catch (e) { setErr((e as ApiError).message); } };
  return (
    <section>
      <div className="admin-bar"><h2>Avisos</h2></div>
      <form className="panel form" onSubmit={async (e) => { e.preventDefault(); await run('notice.create', { body, tone, published: true }); setBody(''); }}>
        <div className="field"><label className="field__label" htmlFor="nb">Nuevo aviso ({body.length}/280)</label><textarea id="nb" className="textarea" rows={2} maxLength={280} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="form__actions">
          <div className="segmented" role="radiogroup" aria-label="Tono">
            <button type="button" role="radio" aria-checked={tone === 'info'} onClick={() => setTone('info')}>Informativo</button>
            <button type="button" role="radio" aria-checked={tone === 'importante'} onClick={() => setTone('importante')}>Importante</button>
          </div>
          <button className="btn btn--rosa" disabled={!body.trim()}>Publicar</button>
        </div>
        {err && <p className="error">{err}</p>}
      </form>
      <ul className="admin-list">
        {s.notices.map((n) => (
          <li key={n.id} className="admin-item">
            <div><strong>{n.body}</strong><div className="admin-meta"><span className={`chip ${n.published ? 'chip--ok' : ''}`}>{n.published ? 'Publicado' : 'Oculto'}</span><span className="chip">{n.tone}</span></div></div>
            <div className="admin-actions">
              <button className="btn btn--sm btn--ghost" onClick={() => run('notice.update', { id: n.id, published: !n.published })}>{n.published ? 'Ocultar' : 'Publicar'}</button>
              <button className="btn btn--sm btn--ghost" onClick={() => confirm('¿Eliminar aviso?') && run('notice.delete', { id: n.id })}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModerationTab({ s, reload }: { s: State; reload: () => void }) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [err, setErr] = useState('');
  const run = async (op: string, args: unknown) => { setErr(''); try { await rpc(op, args); reload(); } catch (e) { setErr((e as ApiError).message); } };
  const f = <T extends { status: string }>(xs: T[]) => xs.filter((x) => filter === 'all' || x.status === filter);
  const pendingWall = s.wall.filter((m) => m.status === 'pending' && m.consent_public);
  return (
    <section>
      <div className="admin-bar">
        <h2>Moderación</h2>
        <div className="segmented" role="radiogroup" aria-label="Filtro">
          {(['pending', 'approved', 'all'] as const).map((k) => <button key={k} type="button" role="radio" aria-checked={filter === k} onClick={() => setFilter(k)}>{k === 'pending' ? 'Pendientes' : k === 'approved' ? 'Aprobados' : 'Todos'}</button>)}
        </div>
      </div>
      {err && <p className="error" role="alert">{err}</p>}

      <h3 className="admin-h3">Muro <span className="muted">({s.wall.filter((m) => m.status === 'pending').length} pendientes)</span>
        {pendingWall.length > 1 && filter === 'pending' && <button className="btn btn--sm btn--ghost" onClick={() => confirm(`¿Aprobar ${pendingWall.length} mensajes autorizados?`) && run('mod.wallBulk', { ids: pendingWall.map((m) => m.id), action: 'approve' })}>Aprobar todos los autorizados</button>}
      </h3>
      <ul className="admin-list">
        {f(s.wall).map((m) => (
          <li key={m.id} className="admin-item">
            <div>
              <p className="admin-text">{m.body}</p>
              <div className="admin-meta">
                <b className="small">{m.display_name}</b><span className="tiny muted">{fmtTime(m.created_at)} · {m.prompt === 'llevas' ? 'Me llevo' : 'Espero'}</span>
                <span className={`chip ${m.status === 'approved' ? 'chip--ok' : m.status === 'pending' ? 'chip--warn' : ''}`}>{STATUS[m.status]}</span>
                {!m.consent_public && <span className="chip chip--line">Solo equipo</span>}
                {m.featured && <span className="chip chip--rosa">Destacado</span>}
                {m.is_demo && <span className="chip demo-flag">Demo</span>}
              </div>
            </div>
            <div className="admin-actions">
              {m.consent_public && m.status !== 'approved' && <button className="btn btn--sm btn--rosa" onClick={() => run('mod.wall', { id: m.id, action: 'approve' })}>Aprobar</button>}
              {m.consent_public && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.wall', { id: m.id, action: m.featured ? 'unfeature' : 'feature' })}>{m.featured ? 'Quitar destacado' : 'Destacar'}</button>}
              {m.status === 'approved' && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.wall', { id: m.id, action: 'withdraw' })}>Retirar</button>}
              {m.status === 'pending' && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.wall', { id: m.id, action: 'reject' })}>Rechazar</button>}
            </div>
          </li>
        ))}
        {!f(s.wall).length && <li className="muted small">Nada por aquí.</li>}
      </ul>

      <h3 className="admin-h3">Palabras <span className="muted">({s.words.filter((w) => w.status === 'pending').length} pendientes)</span></h3>
      <p className="small muted">Se modera la palabra: aprobar “unidad” aprueba todas sus aportaciones, también las futuras.</p>
      <ul className="admin-list admin-words">
        {f(s.words).map((w) => (
          <li key={w.question + w.key} className="admin-item">
            <div>
              <strong>{w.display || w.sample}</strong> <span className="small muted">× {w.n} · {w.question === 'somos' ? 'SOMOS' : 'Esta noche'}</span>
              <div className="admin-meta"><span className={`chip ${w.status === 'approved' ? 'chip--ok' : w.status === 'pending' ? 'chip--warn' : ''}`}>{STATUS[w.status]}</span>{w.is_demo && <span className="chip demo-flag">Demo</span>}</div>
            </div>
            <div className="admin-actions">
              {w.status !== 'approved' && <button className="btn btn--sm btn--rosa" onClick={() => run('mod.word', { question: w.question, key: w.key, action: 'approve' })}>Aprobar</button>}
              {w.status !== 'rejected' && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.word', { question: w.question, key: w.key, action: 'reject' })}>Rechazar</button>}
            </div>
          </li>
        ))}
        {!f(s.words).length && <li className="muted small">Nada por aquí.</li>}
      </ul>

      <h3 className="admin-h3">Libro de visitas <span className="muted">({s.guestbook.filter((g) => g.status === 'pending').length} pendientes)</span></h3>
      <ul className="admin-list">
        {f(s.guestbook).map((g) => (
          <li key={g.id} className="admin-item">
            <div>
              <p className="admin-text">{g.dedication}</p>
              <div className="admin-meta">
                <b className="small">{g.display_name}</b>
                <span className={`chip ${g.status === 'approved' ? 'chip--ok' : g.status === 'pending' ? 'chip--warn' : ''}`}>{STATUS[g.status]}</span>
                {!g.consent_show && <span className="chip chip--line">Privada</span>}
                {g.has_signature && <span className="chip">{g.consent_signature ? 'Firma pública' : 'Firma privada'}</span>}
                {g.consent_social && <span className="chip chip--rosa">Redes ✓</span>}
              </div>
              {g.has_signature && <img className="admin-sig" src={`/api/guestbook/${g.id}/signature`} alt={`Firma de ${g.display_name}`} />}
            </div>
            <div className="admin-actions">
              {g.consent_show && g.status !== 'approved' && <button className="btn btn--sm btn--rosa" onClick={() => run('mod.guestbook', { id: g.id, action: 'approve' })}>Aprobar</button>}
              {g.status === 'approved' && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.guestbook', { id: g.id, action: 'withdraw' })}>Retirar</button>}
              {g.status === 'pending' && <button className="btn btn--sm btn--ghost" onClick={() => run('mod.guestbook', { id: g.id, action: 'reject' })}>Rechazar</button>}
            </div>
          </li>
        ))}
        {!f(s.guestbook).length && <li className="muted small">Nada por aquí.</li>}
      </ul>
    </section>
  );
}

function DynamicsTab({ s, reload, isAdmin }: { s: State; reload: () => void; isAdmin: boolean }) {
  const [err, setErr] = useState('');
  const toggles: [string, string][] = [['wall_open', 'Muro'], ['words_somos_open', 'SOMOS en una palabra'], ['words_night_open', 'Esta noche en una palabra'], ['guestbook_open', 'Libro de visitas'], ['postal_open', 'Postal en video']];
  const run = async (op: string, args: unknown) => { setErr(''); try { await rpc(op, args); reload(); } catch (e) { setErr((e as ApiError).message); } };
  return (
    <section>
      <div className="admin-bar"><h2>Dinámicas</h2></div>
      {err && <p className="error">{err}</p>}
      <ul className="admin-list">
        {toggles.map(([k, label]) => (
          <li key={k} className="admin-item">
            <strong>{label}</strong>
            <button className={`btn btn--sm ${s.settings[k] ? '' : 'btn--rosa'}`} onClick={() => run('settings.update', { [k]: !s.settings[k] })}>{s.settings[k] ? 'Abierta · cerrar' : 'Cerrada · abrir'}</button>
          </li>
        ))}
      </ul>
      <p className="small muted" style={{ marginTop: 12 }}>Postales: {s.renders.queued} en fila · {s.renders.rendering} generando · {s.renders.done} listas · {s.renders.failed} con error</p>
      {isAdmin && (
        <>
          <h3 className="admin-h3">Datos de demostración</h3>
          <p className="small muted">Ocultos al público salvo que los actives. Siempre se identifican como “Demostración” y nunca se exportan.</p>
          <div className="form__actions">
            <button className="btn btn--sm btn--ghost" onClick={() => run('demo.toggle', { show: !s.settings.show_demo })}>{s.settings.show_demo ? 'Ocultar demostración' : 'Mostrar demostración'}</button>
            <button className="btn btn--sm btn--ghost" onClick={() => confirm('¿Borrar todos los datos de demostración?') && run('demo.purge', {})}>Borrar demostración</button>
          </div>
        </>
      )}
    </section>
  );
}

function ResourcesTab() {
  const kinds: [string, string][] = [['muro', 'Muro (aprobados y autorizados)'], ['libro', 'Libro (autorizados, firmas autorizadas)'], ['redes', 'Autorizados para redes'], ['palabras', 'Palabras (conteos aprobados)']];
  return (
    <section>
      <div className="admin-bar"><h2>Descargas y recursos</h2></div>
      <ul className="admin-list">
        {kinds.map(([k, l]) => (
          <li key={k} className="admin-item"><strong>{l}</strong>
            <div className="admin-actions"><a className="btn btn--sm btn--ghost" href={`/api/admin/export?kind=${k}&format=csv`}>CSV</a><a className="btn btn--sm btn--ghost" href={`/api/admin/export?kind=${k}&format=json`}>JSON</a></div></li>
        ))}
      </ul>
      <h3 className="admin-h3">Código QR de la plataforma</h3>
      <div className="admin-qr">
        <img src="/qr.svg" alt="Código QR de la plataforma" width={180} height={180} />
        <div className="form__actions"><a className="btn btn--sm btn--ghost" href="/qr.svg" download="everest-qr.svg">Descargar SVG</a><a className="btn btn--sm btn--ghost" href="/qr.png" download="everest-qr.png">Descargar PNG</a><a className="btn btn--sm btn--ghost" href="/pantalla" target="_blank">Abrir pantalla del salón</a></div>
      </div>
    </section>
  );
}

function UsersTab({ s, reload }: { s: State; reload: () => void }) {
  const [f, setF] = useState({ email: '', name: '', role: 'moderacion', password: '' });
  const [err, setErr] = useState('');
  const run = async (op: string, args: unknown) => { setErr(''); try { await rpc(op, args); reload(); return true; } catch (e) { setErr((e as ApiError).message); return false; } };
  return (
    <section>
      <div className="admin-bar"><h2>Equipo y permisos</h2></div>
      <p className="small muted">Administración: todo · Programa y avisos: programa, avisos y cierre · Moderación: muro, palabras, libro, dinámicas y descargas.</p>
      {err && <p className="error">{err}</p>}
      <ul className="admin-list">
        {s.users.map((u) => (
          <li key={u.id} className="admin-item">
            <div><strong>{u.name}</strong> <span className="small muted">{u.email}</span><div className="admin-meta"><span className="chip">{u.role}</span>{!u.active && <span className="chip chip--line">Inactivo</span>}</div></div>
            <div className="admin-actions">
              <select className="input" style={{ minHeight: 38, width: 'auto' }} value={u.role} aria-label={`Rol de ${u.name}`} onChange={(e) => run('user.update', { id: u.id, role: e.target.value })}>
                <option value="admin">admin</option><option value="programa">programa</option><option value="moderacion">moderacion</option>
              </select>
              <button className="btn btn--sm btn--ghost" onClick={() => run('user.update', { id: u.id, active: !u.active })}>{u.active ? 'Desactivar' : 'Activar'}</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="panel form" style={{ marginTop: 16 }} onSubmit={async (e) => { e.preventDefault(); if (await run('user.create', f)) setF({ email: '', name: '', role: 'moderacion', password: '' }); }}>
        <h3 style={{ fontSize: 18 }}>Agregar persona</h3>
        <div className="admin-two">
          <input className="input" aria-label="Nombre" placeholder="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="input" aria-label="Correo" type="email" placeholder="Correo" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <select className="input" aria-label="Rol" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="moderacion">Moderación</option><option value="programa">Programa y avisos</option><option value="admin">Administración</option></select>
          <input className="input" aria-label="Contraseña temporal" type="text" placeholder="Contraseña (mín. 10)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </div>
        <button className="btn btn--rosa btn--sm" style={{ justifySelf: 'start' }}>Agregar</button>
      </form>
    </section>
  );
}

export function AdminApp() {
  const [state, setState] = useState<State | null>(null);
  const [auth, setAuth] = useState<'loading' | 'out' | 'in'>('loading');
  const [tab, setTab] = useState('programa');
  const load = useCallback(async () => {
    try { setState(await api<State>('/api/admin/state')); setAuth('in'); }
    catch (e) { if ((e as ApiError).status === 401) setAuth('out'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  // Actualización en vivo del panel (señales SSE) + respaldo cada 15 s.
  useEffect(() => {
    if (auth !== 'in') return;
    const es = new EventSource('/api/live');
    let t: ReturnType<typeof setTimeout> | null = null;
    es.addEventListener('signal', () => { if (!t) t = setTimeout(() => { t = null; load(); }, 300); });
    const i = setInterval(load, 15_000);
    return () => { es.close(); clearInterval(i); };
  }, [auth, load]);

  const role = state?.me.role;
  const tabs = useMemo(() => {
    if (!role) return [];
    const t: [string, string][] = [];
    if ((CAN.program as readonly string[]).includes(role)) t.push(['programa', 'Programa'], ['avisos', 'Avisos']);
    if ((CAN.moderate as readonly string[]).includes(role)) t.push(['moderacion', 'Moderación'], ['dinamicas', 'Dinámicas']);
    if ((CAN.exports as readonly string[]).includes(role)) t.push(['recursos', 'Descargas y QR']);
    if (role === 'admin') t.push(['equipo', 'Equipo']);
    return t;
  }, [role]);
  useEffect(() => { if (tabs.length && !tabs.find(([k]) => k === tab)) setTab(tabs[0][0]); }, [tabs, tab]);

  if (auth === 'loading') return <main className="admin-login"><p className="muted">Cargando…</p></main>;
  if (auth === 'out' || !state) return <Login onDone={load} />;
  const pending = state.wall.filter((w) => w.status === 'pending' && w.consent_public).length + state.words.filter((w) => w.status === 'pending').length + state.guestbook.filter((g) => g.status === 'pending' && g.consent_show).length;
  return (
    <div className="admin">
      <header className="admin-head">
        <SomosLogo width={96} />
        <strong>EVEREST · Panel</strong>
        <span className="topbar__spacer" />
        <a className="btn btn--ghost btn--sm" href="/" target="_blank">Ver plataforma</a>
        <span className="small muted">{state.me.name}</span>
        <button className="btn btn--ghost btn--sm" onClick={async () => { await api('/api/admin/logout', { json: {} }); setAuth('out'); setState(null); }}>Salir</button>
      </header>
      <nav className="admin-tabs" role="tablist" aria-label="Áreas">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}{k === 'moderacion' && pending ? <span className="admin-badge">{pending}</span> : null}</button>
        ))}
      </nav>
      <div className="admin-body">
        {tab === 'programa' && <ProgramTab s={state} reload={load} can={(CAN.program as readonly string[]).includes(state.me.role)} />}
        {tab === 'avisos' && <NoticesTab s={state} reload={load} />}
        {tab === 'moderacion' && <ModerationTab s={state} reload={load} />}
        {tab === 'dinamicas' && <DynamicsTab s={state} reload={load} isAdmin={state.me.role === 'admin'} />}
        {tab === 'recursos' && <ResourcesTab />}
        {tab === 'equipo' && <UsersTab s={state} reload={load} />}
      </div>
    </div>
  );
}
