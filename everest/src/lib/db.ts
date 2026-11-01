import 'server-only';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

type G = typeof globalThis & { __everestPool?: Pool };
const g = globalThis as G;

export function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL. Copia .env.example a .env.local y configúralo.');
  return url;
}

export function sslFor(url: string) {
  if (process.env.DATABASE_SSL === 'disable') return undefined;
  if (/localhost|127\.0\.0\.1|@db:|@postgres:/.test(url)) return undefined;
  return { rejectUnauthorized: false };
}

export function pool(): Pool {
  if (!g.__everestPool) {
    const url = connectionString();
    g.__everestPool = new Pool({
      connectionString: url,
      ssl: sslFor(url),
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
    });
    g.__everestPool.on('error', (e) => console.error('[db] pool error', e.message));
  }
  return g.__everestPool;
}

export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool().query<T>(text, params as never[]);
  return r.rows;
}

export async function q1<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query('begin');
    const out = await fn(c);
    await c.query('commit');
    return out;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
