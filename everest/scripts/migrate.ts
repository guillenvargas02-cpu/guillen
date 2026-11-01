// Aplica db/migrations/*.sql en orden, una sola vez cada una.
import fs from 'node:fs';
import path from 'node:path';
import { connect } from './_db';

(async () => {
  const c = await connect();
  await c.query(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await c.query(`select name from schema_migrations`)).rows.map((r) => r.name));
  const dir = path.resolve('db/migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    process.stdout.write(`→ ${f} … `);
    await c.query('begin');
    try {
      await c.query(sql);
      await c.query(`insert into schema_migrations (name) values ($1)`, [f]);
      await c.query('commit');
      console.log('ok');
    } catch (e) {
      await c.query('rollback');
      console.log('error');
      throw e;
    }
  }
  console.log('Migraciones al día.');
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
