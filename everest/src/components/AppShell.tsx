'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { SomosLogo } from './Logo';
import { Contacts } from './Contacts';
import { ConnStatus, StaleBanner } from './ConnStatus';
import { IconBook, IconChat, IconClose, IconHome, IconPostal, IconProgram, IconVoice } from './icons';
import { EVENT, SOCIAL } from '@/lib/event';

export const NAV = [
  { href: '/', label: 'Inicio', Icon: IconHome },
  { href: '/programa', label: 'Programa', Icon: IconProgram },
  { href: '/tu-voz', label: 'Tu voz', Icon: IconVoice },
  { href: '/libro', label: 'Libro', Icon: IconBook },
  { href: '/postal', label: 'Postal', Icon: IconPostal },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [sheet, setSheet] = useState(false);
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);
  useEffect(() => setSheet(false), [path]);

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <aside className="sidebar" aria-label="Navegación principal">
        <div className="sidebar__brand">
          <Link href="/" aria-label="SOMOS — Inicio"><SomosLogo width={136} className="sidebar__logo" /></Link>
          <div className="sidebar__event">
            <span className="display">{EVENT.title}</span>
            <p>{EVENT.subtitle}</p>
          </div>
        </div>
        <nav className="sidenav">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}><Icon />{label}</Link>
          ))}
        </nav>
        <ConnStatus withTime />
        <div className="sidebar__foot">
          <span className="eyebrow">Contacto del equipo</span>
          <Contacts compact />
          <a className="ig-mini" href={SOCIAL[0].href} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/contact/instagram.png" alt="" width={20} height={20} /> @{SOCIAL[0].handle}
          </a>
          <p className="tiny muted">Organiza {EVENT.organizer}</p>
        </div>
      </aside>

      <header className="topbar">
        <Link href="/" aria-label="SOMOS — Inicio" className="topbar__logo"><SomosLogo width={92} /></Link>
        <span className="topbar__spacer" />
        <ConnStatus />
        <button className="btn btn--ghost btn--sm" onClick={() => setSheet(true)} aria-haspopup="dialog">
          <IconChat /> Contacto
        </button>
      </header>

      <main id="contenido" className="main" tabIndex={-1}>
        <StaleBanner />
        {children}
      </main>

      <nav className="bottomnav" aria-label="Secciones">
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}><Icon />{label}</Link>
        ))}
      </nav>

      {sheet && (
        <>
          <div className="sheet-backdrop" onClick={() => setSheet(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
            <div className="sheet__grab" aria-hidden="true" />
            <div className="sheet__head">
              <h2 id="sheet-title" style={{ fontSize: 20 }}>Contacta al equipo</h2>
              <button className="iconbtn" onClick={() => setSheet(false)} aria-label="Cerrar" autoFocus><IconClose /></button>
            </div>
            <Contacts />
            <p className="small muted">Escríbenos si necesitas ayuda con el acceso, el programa o tu participación.</p>
          </div>
        </>
      )}
    </div>
  );
}
