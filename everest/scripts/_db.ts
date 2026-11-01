import { Client } from 'pg';
import fs from 'node:fs';
import path from 'node:path';

export function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

export async function connect(): Promise<Client> {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  const local = /localhost|127\.0\.0\.1/.test(url) || process.env.DATABASE_SSL === 'disable';
  const c = new Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
  await c.connect();
  return c;
}
