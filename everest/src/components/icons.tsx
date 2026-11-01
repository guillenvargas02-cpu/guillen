// Íconos lineales propios (24×24, trazo 1.8). Decorativos salvo que se indique.
import type { SVGProps } from 'react';

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
type P = SVGProps<SVGSVGElement>;

export const IconHome = (p: P) => <svg {...base} {...p}><path d="M3 10.5 12 4l9 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="m9.5 19.5 0-5h5v5" /></svg>;
export const IconProgram = (p: P) => <svg {...base} {...p}><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><path d="M6 8v8" /><path d="M11 6h9M11 18h9M11 12h6" /><circle cx="6" cy="12" r="1" fill="currentColor" /></svg>;
export const IconVoice = (p: P) => <svg {...base} {...p}><path d="M4 5.5h16v10H10l-4.5 3.5V15.5H4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>;
export const IconBook = (p: P) => <svg {...base} {...p}><path d="M4 5.5c2.8-1 5.6-1 8 .8 2.4-1.8 5.2-1.8 8-.8v13c-2.8-1-5.6-1-8 .8-2.4-1.8-5.2-1.8-8-.8z" /><path d="M12 6.3v13" /><path d="M6.5 15.5c1 0 1.2-1.5 2-1.5s.6 1.4 1.5 1.4" /></svg>;
export const IconPostal = (p: P) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m6 15 3.5-4.5 2.5 3 2-2 4 3.5" /><rect x="15" y="7.5" width="3.5" height="3.5" rx=".5" /></svg>;
export const IconMountain = (p: P) => <svg {...base} {...p}><path d="m2.5 19.5 7-12 4 6.5 2-3 6 8.5z" /><path d="m8 10 1.5 1.5L11 10" /></svg>;
export const IconClock = (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
export const IconPin = (p: P) => <svg {...base} {...p}><path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
export const IconCalendar = (p: P) => <svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>;
export const IconArrow = (p: P) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconExternal = (p: P) => <svg {...base} {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;
export const IconCheck = (p: P) => <svg {...base} {...p}><path d="m4.5 12.5 5 5 10-11" /></svg>;
export const IconAlert = (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>;
export const IconMegaphone = (p: P) => <svg {...base} {...p}><path d="M4 10v4h3l7 4V6L7 10z" /><path d="M17.5 9a4 4 0 0 1 0 6" /></svg>;
export const IconClose = (p: P) => <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconUndo = (p: P) => <svg {...base} {...p}><path d="M9 7 4.5 11.5 9 16" /><path d="M5 11.5h9a5 5 0 0 1 0 10h-2" /></svg>;
export const IconEraser = (p: P) => <svg {...base} {...p}><path d="M4 18.5h16" /><path d="m6.5 15.5 9-9 4 4-6 6h-5z" /></svg>;
export const IconDownload = (p: P) => <svg {...base} {...p}><path d="M12 4v11M7 10.5l5 5 5-5" /><path d="M4.5 19.5h15" /></svg>;
export const IconShare = (p: P) => <svg {...base} {...p}><path d="M12 15V4M8 7.5 12 4l4 3.5" /><path d="M6 11H5v9h14v-9h-1" /></svg>;
export const IconPlay = (p: P) => <svg {...base} {...p}><path d="M8 5.5v13l10-6.5z" fill="currentColor" /></svg>;
export const IconPause = (p: P) => <svg {...base} {...p}><path d="M8.5 5.5v13M15.5 5.5v13" strokeWidth={2.6} /></svg>;
export const IconChat = (p: P) => <svg {...base} {...p}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z" /></svg>;
export const IconSparkle = (p: P) => <svg {...base} {...p}><path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2z" /></svg>;
export const IconRefresh = (p: P) => <svg {...base} {...p}><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4v4.5H15" /></svg>;
