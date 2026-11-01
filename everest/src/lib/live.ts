import 'server-only';
import { Client } from 'pg';
import { EventEmitter } from 'node:events';
import { connectionString, sslFor } from './db';

/**
 * Señales en vivo: un único cliente LISTEN por instancia del servidor recibe los
 * NOTIFY emitidos por los triggers (bump_live) y los reparte a las conexiones SSE.
 * Las señales solo llevan el tema ("program", "wall", "words", "guestbook");
 * cada navegador vuelve a pedir su instantánea pública al servidor.
 */
type G = typeof globalThis & { __everestLive?: LiveHub };

class LiveHub extends EventEmitter {
  private client: Client | null = null;
  private connecting = false;
  private retry = 0;
  connected = false;

  constructor() {
    super();
    this.setMaxListeners(0);
    this.connect();
  }

  private async connect() {
    if (this.connecting) return;
    this.connecting = true;
    const url = process.env.DATABASE_LISTEN_URL || connectionString();
    const c = new Client({ connectionString: url, ssl: sslFor(url) });
    c.on('notification', (msg) => {
      if (msg.channel === 'everest_live' && msg.payload) this.emit('signal', msg.payload);
    });
    const onFail = (e?: Error) => {
      if (this.client !== c && this.client !== null) return;
      if (e) console.error('[live] conexión LISTEN perdida:', e.message);
      this.connected = false;
      this.client = null;
      this.emit('status', false);
      c.end().catch(() => {});
      const delay = Math.min(30_000, 1000 * 2 ** this.retry++);
      setTimeout(() => this.connect(), delay);
    };
    c.on('error', onFail);
    c.on('end', () => onFail());
    try {
      await c.connect();
      await c.query('listen everest_live');
      this.client = c;
      this.connected = true;
      this.retry = 0;
      this.emit('status', true);
      // Tras reconectar, todos los clientes deben recuperar el estado vigente.
      this.emit('signal', '*');
    } catch (e) {
      onFail(e as Error);
    } finally {
      this.connecting = false;
    }
  }
}

export function liveHub(): LiveHub {
  const g = globalThis as G;
  if (!g.__everestLive) g.__everestLive = new LiveHub();
  return g.__everestLive;
}
