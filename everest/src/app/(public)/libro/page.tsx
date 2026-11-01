import type { Metadata } from 'next';
import { BookView } from './BookView';
export const metadata: Metadata = { title: 'Libro de visitas' };
export default function Page() { return <BookView />; }
