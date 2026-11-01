'use client';
import Link from 'next/link';
import { HeroVideo } from '@/components/HeroVideo';
import { NowModule, NextModule } from '@/components/program';
import { PeopleRail, ParticipaRail } from '@/components/Rails';
import { useLive } from '@/components/LiveProvider';
import { WallList, WordCloud } from '@/components/voice';
import { SocialCards } from '@/components/Social';
import { Contacts } from '@/components/Contacts';
import { PostcardPreview } from '@/components/PostcardPreview';
import { IconArrow, IconMegaphone, IconPin } from '@/components/icons';
import { EVENT } from '@/lib/event';
import { fmtTime } from '@/lib/event';

function Head({ title, href, cta = 'Ver todo' }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {href ? <Link href={href}>{cta} <IconArrow width={16} height={16} /></Link> : null}
    </div>
  );
}

export function HomeView() {
  const { program, wall, words } = useLive();
  const notices = program?.notices ?? [];
  return (
    <div className="home page-enter">
      <HeroVideo />

      {notices.length > 0 && (
        <section aria-label="Avisos" style={{ display: 'grid', gap: 8 }}>
          {notices.map((n) => (
            <div key={n.id} className={`notice notice--${n.tone}`} role={n.tone === 'importante' ? 'alert' : undefined}>
              <IconMegaphone />
              <div><p>{n.body}</p>{n.published_at ? <time suppressHydrationWarning>{fmtTime(n.published_at)}</time> : null}</div>
            </div>
          ))}
        </section>
      )}

      <div className="home-grid home-grid--now">
        <NowModule />
        <NextModule />
      </div>

      <section aria-labelledby="h-people">
        <Head title="Protagonistas" href="/programa" cta="Programa" />
        <span id="h-people" className="sr-only">Protagonistas</span>
        <PeopleRail />
      </section>

      <section aria-label="Participa">
        <Head title="Participa" />
        <ParticipaRail />
      </section>

      <div className="home-grid home-grid--participa">
        <section className="panel" aria-labelledby="h-muro">
          <div className="panel__head"><h2 id="h-muro" className="panel__title">Muro</h2><Link className="linkbtn" href="/tu-voz">Escribir</Link></div>
          <WallList messages={wall ?? []} limit={3} compact />
        </section>
        <section className="panel" aria-labelledby="h-words">
          <div className="panel__head"><h2 id="h-words" className="panel__title">SOMOS en una palabra</h2><Link className="linkbtn" href="/tu-voz#palabras">Opinar</Link></div>
          <WordCloud words={words?.somos ?? []} label="SOMOS en una palabra" max={38} min={14} limit={14} />
        </section>
      </div>

      <div className="home-grid home-grid--bottom">
        <section className="panel panel--soft postal-teaser" aria-labelledby="h-postal">
          <div className="panel__head"><h2 id="h-postal" className="panel__title">Tu postal en video</h2></div>
          <div className="postal-teaser__stage">
            <PostcardPreview input={{ format: 'horizontal' }} />
          </div>
          <Link className="btn btn--rosa" href="/postal">Crear mi postal</Link>
        </section>
        <section aria-labelledby="h-social">
          <Head title="Síguenos" />
          <span id="h-social" className="sr-only">Síguenos en Instagram</span>
          <SocialCards />
        </section>
      </div>

      <div className="home-grid home-grid--bottom">
        <section className="panel" aria-labelledby="h-contacto">
          <div className="panel__head"><h2 id="h-contacto" className="panel__title">Contacto</h2></div>
          <Contacts />
        </section>
        <section className="panel venue" aria-labelledby="h-sede">
          <div className="panel__head"><h2 id="h-sede" className="panel__title">Sede</h2></div>
          <p><b>{EVENT.room}</b><br />{EVENT.venue}</p>
          <p className="small muted">{EVENT.address}</p>
          <a className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer"
            href="https://www.google.com/maps/search/?api=1&query=Hotel+del+Ej%C3%A9rcito+y+Fuerza+A%C3%A9rea+Gral.+Francisco+Murgu%C3%ADa+441+Miguel+Hidalgo+CDMX">
            <IconPin /> Abrir en Maps
          </a>
        </section>
      </div>
    </div>
  );
}
