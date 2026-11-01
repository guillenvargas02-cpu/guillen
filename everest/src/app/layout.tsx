import type { Metadata, Viewport } from 'next';
import './globals.css';
import './app.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_URL || 'http://localhost:3000'),
  title: { default: 'EVEREST — Nuestra cima, nuestro futuro · SOMOS', template: '%s · EVEREST · SOMOS' },
  description: 'Programa en vivo, muro, palabras, libro de visitas y postal en video del encuentro EVEREST de SOMOS Miguel Hidalgo. Martes 3 de noviembre de 2026, Salón República.',
  applicationName: 'EVEREST · SOMOS',
  openGraph: {
    title: 'EVEREST — Nuestra cima, nuestro futuro',
    description: 'Martes 3 de noviembre de 2026 · 17:00 h · Salón República, Hotel del Ejército y Fuerza Aérea.',
    images: ['/media/foto-cima-dorada.jpg'],
    locale: 'es_MX',
    type: 'website',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
