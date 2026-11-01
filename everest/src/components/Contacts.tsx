/* eslint-disable @next/next/no-img-element */
import { CONTACT } from '@/lib/event';
import { IconExternal } from './icons';

/** Contacto del equipo: logos oficiales en proporción original + servicio + dato visible. */
export function Contacts({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`contacts${compact ? ' contacts--compact' : ''}`} aria-label="Contacto del equipo">
      <li>
        <a className="contact" href={CONTACT.emailHref}>
          <span className="contact__logo"><img src="/contact/gmail.png" alt="" width={45} height={36} /></span>
          <span><strong>Correo · Gmail</strong><span>{CONTACT.email}</span></span>
          <IconExternal className="arrow" />
        </a>
      </li>
      <li>
        <a className="contact" href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
          <span className="contact__logo contact__logo--wa"><img src="/contact/whatsapp.png" alt="" width={40} height={40} /></span>
          <span><strong>WhatsApp</strong><span>{CONTACT.whatsappLabel}</span></span>
          <IconExternal className="arrow" />
        </a>
      </li>
    </ul>
  );
}
