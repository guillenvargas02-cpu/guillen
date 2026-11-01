import { AppShell } from '@/components/AppShell';
import { LiveProvider } from '@/components/LiveProvider';
import { loadInitial } from '@/lib/initial';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const initial = await loadInitial();
  return (
    <LiveProvider initial={initial}>
      <AppShell>{children}</AppShell>
    </LiveProvider>
  );
}
