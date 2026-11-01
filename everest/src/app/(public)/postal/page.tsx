import type { Metadata } from 'next';
import { PostalView } from './PostalView';
export const metadata: Metadata = { title: 'Postal en video' };
export default function Page() { return <PostalView />; }
