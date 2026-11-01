import type { Metadata } from 'next';
import { VoiceView } from './VoiceView';
export const metadata: Metadata = { title: 'Tu voz' };
export default function Page() { return <VoiceView />; }
