/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useLive } from './LiveProvider';
import { fmtTime } from '@/lib/event';
import { IconBook, IconPostal, IconSparkle, IconVoice } from './icons';

const PHOTOS = ['/media/foto-cumbre-960.jpg', '/media/foto-atardecer-960.jpg', '/media/foto-macizo-960.jpg', '/media/foto-cordillera-960.jpg', '/media/foto-cima-dorada-960.jpg'];

/** Protagonistas de la noche, tomados del programa (se actualiza con él). */
export function PeopleRail() {
  const { program } = useLive();
  const people = (program?.items ?? [])
    .filter((i) => i.status !== 'cancelled')
    .flatMap((i) => (i.participants ?? []).map((p) => ({ ...p, when: i.planned_start ? fmtTime(i.planned_start) : '', activity: i.title, id: i.id })))
    // La persona en la conferencia y el mensaje van primero.
    .sort((a, b) => Number(!!a.pending) - Number(!!b.pending));
  if (!people.length) return null;
  return (
    <ul className="rail" aria-label="Protagonistas">
      {people.map((p, i) => (
        <li key={p.name + p.id} className="person">
          <Link href={`/programa#act-${p.id}`} className="person__link">
            <img src={PHOTOS[i % PHOTOS.length]} alt="" loading="lazy" />
            <span className="person__mono" aria-hidden="true">{initials(p.name)}</span>
            <span className="person__body">
              {p.pending ? <span className="chip chip--warn">Por confirmar</span> : p.when ? <span className="person__when num">{p.when}</span> : null}
              <strong>{p.name}</strong>
              {p.role ? <small>{p.role}</small> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function initials(name: string) {
  return name.replace(/^(Mtro\.|Mtra\.|Dr\.|Dra\.|Lic\.)\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const TILES = [
  { href: '/tu-voz', title: 'Muro', Icon: IconVoice, img: '/media/foto-cumbre-960.jpg' },
  { href: '/tu-voz#palabras', title: 'Una palabra', Icon: IconSparkle, img: '/media/foto-cordillera-960.jpg' },
  { href: '/libro', title: 'Libro de visitas', Icon: IconBook, img: '/media/foto-macizo-960.jpg' },
  { href: '/postal', title: 'Tu postal', Icon: IconPostal, img: '/media/foto-atardecer-960.jpg' },
];

export function ParticipaRail() {
  return (
    <ul className="rail rail--tiles" aria-label="Participa">
      {TILES.map(({ href, title, Icon, img }) => (
        <li key={href} className="tile">
          <Link href={href}>
            <img src={img} alt="" loading="lazy" />
            <Icon className="tile__icon" />
            <strong>{title}</strong>
          </Link>
        </li>
      ))}
    </ul>
  );
}
