import type { Metadata } from 'next';
import { LiveProvider } from '@/components/LiveProvider';
import { loadInitial } from '@/lib/initial';
import { ScreenView } from './ScreenView';
import { publicUrl } from '@/lib/public-url';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pantalla del salón', robots: { index: false, follow: false } };

export default async function Page() {
  const initial = await loadInitial();
  return (
    <LiveProvider initial={initial}>
      <ScreenView url={publicUrl().replace(/^https?:\/\//, '').replace(/\/$/, '')} />
    </LiveProvider>
  );
}
