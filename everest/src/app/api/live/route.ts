import { liveHub } from '@/lib/live';
import { getVersions } from '@/lib/public-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Canal en vivo (Server-Sent Events). Solo transmite señales {tema, versión}:
 * nunca contenido. Cada cliente pide después su instantánea pública.
 */
export async function GET(req: Request) {
  const hub = liveHub();
  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try { controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); } catch { cleanup(); }
      };
      controller.enqueue(enc.encode('retry: 3000\n\n'));
      try {
        send('hello', { versions: await getVersions(), db: hub.connected, at: new Date().toISOString() });
      } catch {
        send('hello', { versions: {}, db: false, at: new Date().toISOString() });
      }
      const onSignal = (topic: string) => send('signal', { topic, at: new Date().toISOString() });
      const onStatus = (ok: boolean) => send('status', { db: ok });
      hub.on('signal', onSignal);
      hub.on('status', onStatus);
      const ping = setInterval(() => send('ping', { at: new Date().toISOString() }), 15_000);
      cleanup = () => {
        clearInterval(ping);
        hub.off('signal', onSignal);
        hub.off('status', onStatus);
        try { controller.close(); } catch {}
      };
      req.signal.addEventListener('abort', () => cleanup());
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
