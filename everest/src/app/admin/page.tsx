import type { Metadata } from 'next';
import { AdminApp } from './AdminApp';
export const metadata: Metadata = { title: 'Panel del equipo', robots: { index: false, follow: false } };
export default function Page() { return <AdminApp />; }
