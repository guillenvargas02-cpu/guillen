'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { HeroVideo } from '@/components/HeroVideo';
import { NowModule, plannedLabel } from '@/components/program';
import { useLive } from '@/components/LiveProvider';
import { PostcardPreview } from '@/components/PostcardPreview';
import { Row, SectionTitle } from '@/components/ui';
import { IconBook, IconMegaphone, IconPin, IconPostal, IconProgram, IconVoice } from '@/components/icons';
import { CONTACT, EVENT, SOCIAL, fmtTime } from '@/lib/event';
import { derivePhase } from '@/lib/types';

function initials(name: string) {
  return name.replace(/^(Mtro\.|Mtra\.|Dr\.|Dra\.|Lic\.)\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function HomeView() {
  const { program, wall, words, guestbook } = useLive();
  const notices = program?.notices ?? [];
  const ph = program ? derivePhase(program) : null;
  const next = ph?.next;
  const people = (program?.items ?? []).filter((i) => i.status !== 'cancelled')
    .flatMap((i) => (i.participants ?? []).map((p) => ({ ...p, when: i.planned_start ? fmtTime(i.planned_start) : '', id: i.id })));
  const topWords = (words?.somos ?? []).slice(0, 6);
  const latest = (wall ?? []).slice(0, 2);

  return (
    <div className="home page-enter">
      <header className="hhead">
        <span className="eyebrow">{EVENT.organizer} presenta</span>
        <h1 className="hhead__title">EVEREST</h1>
        <p className="hhead__sub">{EVENT.subtitle}</p>
      </header>

      <HeroVideo />

      {notices.length > 0 && (
        <section aria-label="Avisos" className="notices">
          {notices.map((n) => (
            <div key={n.id} className={`notice notice--${n.tone}`} role={n.tone === 'importante' ? 'alert' : undefined}>
              <IconMegaphone />
              <p>{n.body}</p>
              {n.published_at ? <time suppressHydrationWarning>{fmtTime(n.published_at)}</time> : null}
            </div>
          ))}
        </section>
      )}

      <div className="home-split">
        <NowModule />
        <nav className="rows" aria-label="Secciones">
          <Row href="/programa" icon={<IconProgram />} title="Programa"
            sub={next ? <>Sigue {next.planned_start ? fmtTime(next.planned_start) : ''} · {next.title}</> : `${program?.items.length ?? 0} actividades`} />
          <Row href="/tu-voz" icon={<IconVoice />} title="Tu voz"
            sub={`${wall?.length ?? 0} mensajes · ${(words?.totals.somos ?? 0) + (words?.totals.noche ?? 0)} palabras`} />
          <Row href="/libro" icon={<IconBook />} title="Libro de visitas" sub={`${guestbook?.length ?? 0} dedicatorias`} />
          <Row href="/postal" icon={<IconPostal />} title="Postal en video" sub="MP4 vertical u horizontal" />
        </nav>
      </div>

      <section className="accent" aria-labelledby="h-postal">
        <div className="accent__text">
          <span className="eyebrow">Recuerdo de la noche</span>
          <h2 id="h-postal">Tu postal<br />en video</h2>
          <Link className="btn" href="/postal">Crear mi postal</Link>
        </div>
        <div className="accent__stage"><PostcardPreview input={{ format: 'vertical' }} controls={false} /></div>
      </section>

      {people.length > 0 && (
        <section aria-labelledby="h-people">
          <SectionTitle title="Protagonistas" href="/programa" cta="Programa" />
          <span id="h-people" className="sr-only">Protagonistas</span>
          <ul className="people">
            {people.map((p) => (
              <li key={p.name + p.id}>
                <Link href={`/programa#act-${p.id}`}>
                  <span className="people__av" aria-hidden="true">{initials(p.name)}</span>
                  <strong>{p.name}</strong>
                  <span>{p.pending ? 'Por confirmar' : p.when ? `${p.when} h` : p.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="home-split home-split--even">
        <section aria-labelledby="h-muro">
          <SectionTitle title="Muro" href="/tu-voz" cta="Escribir" />
          <span id="h-muro" className="sr-only">Muro</span>
          {latest.length ? (
            <ul className="quotes">
              {latest.map((m) => (
                <li key={m.id}><p>“{m.body}”</p><span>{m.display_name}</span></li>
              ))}
            </ul>
          ) : <p className="quiet">El muro se estrena con tu mensaje.</p>}
        </section>
        <section aria-labelledby="h-words">
          <SectionTitle title="SOMOS en una palabra" href="/tu-voz?tab=somos" cta="Opinar" />
          <span id="h-words" className="sr-only">SOMOS en una palabra</span>
          {topWords.length ? (
            <ul className="pills">
              {topWords.map((w, i) => <li key={w.key} className={i === 0 ? 'is-top' : ''}>{w.display}<span>{w.n}</span></li>)}
            </ul>
          ) : <p className="quiet">Aún no hay palabras publicadas.</p>}
        </section>
      </div>

      <div className="home-split home-split--even">
        <section aria-labelledby="h-social">
          <SectionTitle title="Síguenos" />
          <span id="h-social" className="sr-only">Instagram</span>
          <div className="rows">
            {SOCIAL.map((s) => (
              <Row key={s.handle} href={s.href} external title={`@${s.handle}`} sub={s.name}
                icon={<img src="/contact/instagram.png" alt="" width={28} height={28} className="row__logo" />} />
            ))}
          </div>
        </section>
        <section aria-labelledby="h-contacto">
          <SectionTitle title="Contacto" />
          <span id="h-contacto" className="sr-only">Contacto</span>
          <div className="rows">
            <Row href={CONTACT.emailHref} external title="Gmail" sub={CONTACT.email} icon={<img src="/contact/gmail.png" alt="" width={30} height={24} className="row__logo" />} />
            <Row href={CONTACT.whatsappHref} external title="WhatsApp" sub={CONTACT.whatsappLabel} icon={<img src="/contact/whatsapp.png" alt="" width={28} height={28} className="row__logo" />} />
            <Row href="https://www.google.com/maps/search/?api=1&query=Hotel+del+Ej%C3%A9rcito+y+Fuerza+A%C3%A9rea+Gral.+Francisco+Murgu%C3%ADa+441+Miguel+Hidalgo+CDMX"
              external title={EVENT.room} sub={EVENT.venue} icon={<IconPin />} />
          </div>
        </section>
      </div>
      {next ? <span className="sr-only">Siguiente actividad: {next.title}, {plannedLabel(next)}</span> : null}
    </div>
  );
}
