'use client';
import Link from 'next/link';
import { useLive, useNow } from './LiveProvider';
import { derivePhase, type ProgramItem } from '@/lib/types';
import { fmtTime, EVENT } from '@/lib/event';
import { IconArrow, IconClock } from './icons';

export const STATUS_LABEL: Record<ProgramItem['status'], string> = {
  pending: 'Próximamente', live: 'En curso', paused: 'En pausa', done: 'Terminada', cancelled: 'Cancelada',
};

export function plannedLabel(i: ProgramItem) {
  if (!i.planned_start) return i.schedule_note || 'Horario por confirmar';
  return i.planned_end ? `${fmtTime(i.planned_start)} – ${fmtTime(i.planned_end)}` : `Desde ${fmtTime(i.planned_start)}`;
}

function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
}

function ago(min: number) {
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h ${min % 60} min`;
}

export function Participants({ item, dark = false }: { item: ProgramItem; dark?: boolean }) {
  if (!item.participants?.length && !item.participants_note) return null;
  return (
    <>
      {item.participants?.length ? (
        <ul className={dark ? 'now__people' : 'tl-people'} aria-label="Participan">
          {item.participants.map((p) => (
            <li key={p.name}>
              {dark ? <>{p.name}{p.pending ? <em> · por confirmar</em> : null}</> : (
                <>
                  <b>{p.name}</b>
                  {p.role ? <span>{p.role}</span> : null}
                  {p.pending ? <span className="chip chip--warn">Por confirmar</span> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {item.participants_note ? <p className={dark ? 'now__desc small' : 'tl-note'}>{item.participants_note}</p> : null}
    </>
  );
}

/** Módulo destacado: “Está pasando ahora”. */
export function NowModule({ compact = false }: { compact?: boolean }) {
  const { program } = useLive();
  const now = useNow(compact ? 30_000 : 1000);
  if (!program) {
    return (
      <section className="now" aria-live="polite">
        <span className="now__label">Conectando…</span>
        <p className="now__desc">Estamos recuperando el programa. Si no aparece en unos segundos, revisa tu conexión.</p>
      </section>
    );
  }
  const { phase, current, next } = derivePhase(program);
  const startsAt = Date.parse(program.settings.starts_at);

  if (phase === 'before') {
    const diff = Math.max(0, startsAt - now);
    const d = Math.floor(diff / 86_400_000), h = Math.floor((diff / 3_600_000) % 24), m = Math.floor((diff / 60_000) % 60), s = Math.floor((diff / 1000) % 60);
    return (
      <section className="now" aria-labelledby="now-title">
        <div className="now__top"><span className="now__label"><IconClock width={16} height={16} /> El evento aún no inicia</span></div>
        <h2 id="now-title" className="now__title balance">{diff > 0 ? 'Nos vemos el martes 3 de noviembre a las 17:00 h' : 'Estamos por comenzar'}</h2>
        {diff > 0 && (
          <div className="now__count" role="timer" aria-label={`Faltan ${d} días, ${h} horas y ${m} minutos`} suppressHydrationWarning>
            {d > 0 && <div><span className="num">{d}</span><small>{d === 1 ? 'día' : 'días'}</small></div>}
            <div><span className="num">{String(h).padStart(2, '0')}</span><small>horas</small></div>
            <div><span className="num">{String(m).padStart(2, '0')}</span><small>min</small></div>
            {!compact && d === 0 && <div><span className="num">{String(s).padStart(2, '0')}</span><small>seg</small></div>}
          </div>
        )}
        <div className="now__foot">
          <span><b>{EVENT.room}</b> · {EVENT.venue}</span>
          {next ? <span>Abre: <b>{next.title}</b></span> : null}
        </div>
      </section>
    );
  }

  if (phase === 'concluded') {
    return (
      <section className="now" aria-labelledby="now-title">
        <div className="now__top"><span className="now__label">Evento concluido</span></div>
        <h2 id="now-title" className="now__title balance">Gracias por subir con nosotros a la cima.</h2>
        <p className="now__desc">Llévate tu postal en video y deja tu firma en el libro de visitas.</p>
        <div className="form__actions">
          <Link className="btn" href="/postal">Crear mi postal</Link>
          <Link className="btn btn--ghost" href="/libro">Firmar el libro</Link>
        </div>
      </section>
    );
  }

  if (phase === 'between' || !current) {
    return (
      <section className="now" aria-labelledby="now-title">
        <div className="now__top"><span className="now__label">Entre actividades</span></div>
        <h2 id="now-title" className="now__title balance">En un momento continuamos.</h2>
        {next ? <p className="now__desc">Sigue: <b>{next.title}</b> · {plannedLabel(next)}</p> : null}
      </section>
    );
  }

  const paused = current.status === 'paused';
  const started = current.actual_start_at ? minutesSince(current.actual_start_at, now) : 0;
  const plannedMin = current.planned_start && current.planned_end ? (Date.parse(current.planned_end) - Date.parse(current.planned_start)) / 60000 : 0;
  const pct = plannedMin > 0 && !paused ? Math.min(100, (started / plannedMin) * 100) : 0;
  return (
    <section className={`now${paused ? ' now--paused' : ''}`} aria-labelledby="now-title" aria-live="polite">
      <div className="now__top">
        <span className="now__label">
          {paused ? <>❚❚ En pausa</> : <><span className="live-dot" aria-hidden="true" /> Está pasando ahora</>}
        </span>
        {current.is_demo ? <span className="chip demo-flag">Demostración</span> : null}
      </div>
      <h2 id="now-title" className="now__title balance">{current.title}</h2>
      {!compact && current.description ? <p className="now__desc">{current.description}</p> : null}
      <Participants item={current} dark />
      <div className="now__foot" suppressHydrationWarning>
        {current.actual_start_at ? <span>Inició <b>{fmtTime(current.actual_start_at)}</b> · {ago(started)}</span> : null}
        {paused && current.paused_at ? <span>En pausa desde <b>{fmtTime(current.paused_at)}</b></span> : null}
        {current.planned_end ? <span>Cierre previsto <b>{fmtTime(current.planned_end)}</b></span> : null}
      </div>
      {pct > 0 ? <span className="now__bar" style={{ width: `${pct}%` }} aria-hidden="true" /> : null}
    </section>
  );
}

export function NextModule() {
  const { program } = useLive();
  if (!program) return null;
  const { next, phase } = derivePhase(program);
  return (
    <section className="panel next" aria-labelledby="next-title">
      <span className="eyebrow eyebrow--rosa">{phase === 'before' ? 'Primera actividad' : 'Después'}</span>
      {next ? (
        <>
          <span className="num next__time">{next.planned_start ? fmtTime(next.planned_start) : '—'}</span>
          <h3 id="next-title" className="next__title">{next.title}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="chip">{plannedLabel(next)}</span>
            {next.schedule_changed_at ? <span className="chip chip--rosa">Cambio de horario</span> : null}
          </div>
        </>
      ) : (
        <h3 id="next-title" className="next__title">{phase === 'concluded' ? 'El programa terminó.' : 'No hay más actividades programadas.'}</h3>
      )}
      <Link href="/programa" className="linkbtn" style={{ textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        Ver programa completo <IconArrow width={16} height={16} />
      </Link>
    </section>
  );
}

/** Programa agrupado por bloques horarios, con la actividad actual destacada. */
export function Timeline() {
  const { program } = useLive();
  if (!program) return <div className="empty"><strong>Cargando el programa…</strong></div>;
  const items = [...program.items].sort((a, b) => a.position - b.position);
  if (!items.length) return <div className="empty"><strong>El programa se publicará muy pronto.</strong></div>;

  const blocks: { key: string; label: string; items: ProgramItem[] }[] = [];
  for (const it of items) {
    let key = 'tbd', label = 'Por confirmar';
    if (it.planned_start) {
      const h = Number(fmtTime(it.planned_start).slice(0, 2));
      key = String(h);
      label = `${String(h).padStart(2, '0')}:00`;
    }
    const last = blocks[blocks.length - 1];
    if (last && last.key === key) last.items.push(it);
    else blocks.push({ key, label, items: [it] });
  }

  return (
    <div className="blocks">
      {blocks.map((b, bi) => (
        <section key={b.key + bi} className="block" aria-label={b.label}>
          <h2 className="block__head">{b.label}</h2>
          <ol className="timeline">
            {b.items.map((it) => (
              <li key={it.id} className={`tl-item tl-item--${it.status}`} id={`act-${it.id}`} aria-current={it.status === 'live' ? 'true' : undefined}>
                <div className="tl-time">
                  <span className="num">{it.planned_start ? fmtTime(it.planned_start) : '··:··'}</span>
                  {it.planned_end ? <small>a {fmtTime(it.planned_end)}</small> : it.schedule_note ? <small>{it.schedule_note}</small> : null}
                </div>
                <div className="tl-rail" aria-hidden="true"><span className="tl-marker" /></div>
                <div className="tl-body">
                  <div className="tl-card">
                    <div className="tl-head">
                      {it.status === 'live' ? <span className="chip chip--rosa"><span className="live-dot" aria-hidden="true" /> En curso</span>
                        : it.status === 'paused' ? <span className="chip chip--rosa">En pausa</span>
                        : it.status === 'done' ? <span className="chip">Terminada{it.actual_end_at ? ` · ${fmtTime(it.actual_end_at)}` : ''}</span>
                        : it.status === 'cancelled' ? <span className="chip chip--line">Cancelada</span>
                        : null}
                      {it.schedule_changed_at && it.status === 'pending' ? <span className="chip chip--warn">Cambio de horario</span> : null}
                      {it.is_demo ? <span className="chip demo-flag">Demostración</span> : null}
                    </div>
                    <h3 className="tl-title">{it.title}</h3>
                    {it.description ? <p className="tl-desc">{it.description}</p> : null}
                    <Participants item={it} />
                    {it.actual_start_at && (it.status === 'live' || it.status === 'paused' || it.status === 'done') ? (
                      <p className="tl-note">Inicio real {fmtTime(it.actual_start_at)}{it.actual_end_at ? ` · cierre real ${fmtTime(it.actual_end_at)}` : ''}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
