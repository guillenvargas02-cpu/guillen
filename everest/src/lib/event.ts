// Datos del evento y utilidades de fecha (zona horaria America/Mexico_City).
export const EVENT = {
  title: 'EVEREST',
  subtitle: 'Nuestra cima, nuestro futuro',
  organizer: 'SOMOS Miguel Hidalgo',
  startsAt: '2026-11-03T17:00:00-06:00',
  timezone: 'America/Mexico_City',
  dateLabel: 'Martes 3 de noviembre de 2026',
  dateShort: '3 · XI · 2026',
  venue: 'Hotel del Ejército y Fuerza Aérea',
  room: 'Salón República',
  address: 'Gral. Francisco Murguía 441, Militar, Miguel Hidalgo, 11600, CDMX',
} as const;

export const CONTACT = {
  email: 'somosmx.mh@gmail.com',
  emailHref: 'mailto:somosmx.mh@gmail.com?subject=EVEREST%20%E2%80%94%20Nuestra%20cima%2C%20nuestro%20futuro',
  whatsappLabel: '56 7013 8673',
  whatsappHref: 'https://wa.me/525670138673',
} as const;

export const TZ = EVENT.timezone;

export function fmtTime(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

export function fmtTimeSeconds(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
}

export function fmtDateLong(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('es-MX', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Convierte "2026-11-03T17:30" (hora local CDMX) a ISO UTC. CDMX no tiene horario de verano desde 2022 (UTC−6). */
export function cdmxLocalToIso(local: string): string | null {
  if (!local) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00-06:00`).toISOString();
}

/** ISO → "2026-11-03T17:30" en hora CDMX (para inputs datetime-local). */
export function isoToCdmxLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() - 6 * 3600_000);
  return d.toISOString().slice(0, 16);
}

/** Perfiles de Instagram destacados. La vista previa se compone con datos verificados del evento;
 *  el contenido en vivo del perfil se abre en Instagram (no se incrustan datos de terceros). */
export const SOCIAL = [
  {
    handle: 'somos__mh',
    href: 'https://www.instagram.com/somos__mh/',
    name: 'SOMOS Miguel Hidalgo',
    bio: 'Organización de SOMOS en Miguel Hidalgo. Anfitriones de EVEREST: avisos, fotos y lo que viene.',
    avatar: 'logo' as const,
    cover: '/media/foto-cumbre-960.jpg',
  },
  {
    handle: 'eduardocontro',
    href: 'https://www.instagram.com/eduardocontro/',
    name: 'Mtro. Eduardo Contró',
    bio: 'Mensaje central de la noche en EVEREST. Sigue su trabajo y sus próximas actividades.',
    avatar: 'EC' as const,
    cover: '/media/foto-atardecer-960.jpg',
  },
] as const;
