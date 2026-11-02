/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevron } from './icons';

/** Encabezado tipográfico de sección: titular grande, conteo opcional y miniatura circular. */
export function PageHeader({ eyebrow, title, count, img, children }: { eyebrow?: string; title: string; count?: number | null; img?: string; children?: ReactNode }) {
  return (
    <header className="phead">
      <div className="phead__text">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}{count != null ? <span className="phead__count"> ({count})</span> : null}</h1>
        {children}
      </div>
      {img ? <img className="phead__thumb" src={img} alt="" width={64} height={64} /> : null}
    </header>
  );
}

/** Fila de lista con ícono, título, dato y chevrón (navegación o enlace externo). */
export function Row({ href, icon, title, sub, external, trailing }: { href: string; icon?: ReactNode; title: ReactNode; sub?: ReactNode; external?: boolean; trailing?: ReactNode }) {
  const inner = (
    <>
      {icon ? <span className="row__icon">{icon}</span> : null}
      <span className="row__text"><strong>{title}</strong>{sub ? <span>{sub}</span> : null}</span>
      {trailing ?? <IconChevron className="row__chev" />}
    </>
  );
  return external
    ? <a className="row" href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
    : <Link className="row" href={href}>{inner}</Link>;
}

export function SectionTitle({ title, href, cta = 'Ver todo' }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="stitle">
      <h2>{title}</h2>
      {href ? <Link href={href}>{cta}</Link> : null}
    </div>
  );
}
