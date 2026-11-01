import type { Metadata } from 'next';
import { ProgramView } from './ProgramView';
export const metadata: Metadata = { title: 'Programa' };
export default function Page() { return <ProgramView />; }
