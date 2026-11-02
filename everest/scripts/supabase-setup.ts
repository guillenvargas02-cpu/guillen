// Conecta y verifica la plataforma contra Supabase (o cualquier PostgreSQL).
//   npm run supabase:setup            → migra, carga programa inicial, crea bucket y verifica todo
//   npm run supabase:setup -- --check → solo verifica (no modifica nada)
// Lee .env.local / .env (DATABASE_URL, DATABASE_LISTEN_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY…).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { Client } from 'pg';
import { loadEnv } from './_db';
import { supabaseStorage } from '../src/lib/storage';

loadEnv();
const checkOnly = process.argv.includes('--check');
const results: { ok: boolean | null; name: string; detail?: string }[] = [];
const ok = (name: string, cond: boolean | null, detail?: string) => {
  results.push({ ok: cond, name, detail });
  console.log(`${cond === null ? '–' : cond ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const ssl = (url: string) => (/localhost|127\.0\.0\.1/.test(url) || process.env.DATABASE_SSL === 'disable' ? undefined : { rejectUnauthorized: false });
const mask = (url: string) => url.replace(/:\/\/([^:]+):[^@]+@/, '://$1:•••@');

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('Falta DATABASE_URL en .env.local'); process.exit(1); }
  console.log(`\nBase de datos: ${mask(url)}`);
  if (/:6543\//.test(url)) console.log('  ⚠ Es el "transaction pooler" (6543). Funciona para consultas, pero el canal en vivo necesita DATABASE_LISTEN_URL con el "session pooler" (5432) o la conexión directa.');

  // 1 · Conexión
  const c = new Client({ connectionString: url, ssl: ssl(url) });
  try {
    await c.connect();
    const v = (await c.query('select version() v, current_user u')).rows[0];
    ok('Conexión a PostgreSQL', true, `${String(v.v).split(' on ')[0]} · usuario ${v.u}`);
  } catch (e) {
    ok('Conexión a PostgreSQL', false, (e as Error).message);
    process.exit(1);
  }

  // 2 · Migraciones y programa inicial
  if (!checkOnly) {
    for (const s of ['scripts/migrate.ts', 'scripts/seed.ts']) {
      const r = spawnSync('npx', ['tsx', s], { stdio: 'inherit', env: process.env });
      if (r.status !== 0) { ok(`Ejecutar ${s}`, false); process.exit(1); }
    }
  }
  const mig = await c.query(`select name from schema_migrations order by name`).catch(() => ({ rows: [] as { name: string }[] }));
  const expected = fs.readdirSync('db/migrations').filter((f) => f.endsWith('.sql')).sort();
  const missing = expected.filter((f) => !mig.rows.some((r) => r.name === f));
  ok('Migraciones aplicadas', missing.length === 0, missing.length ? `faltan: ${missing.join(', ')} (ejecuta npm run supabase:setup)` : expected.join(', '));
  const items = await c.query(`select count(*)::int n from program_items`).catch(() => null);
  ok('Programa cargado', !!items && items.rows[0].n > 0, items ? `${items.rows[0].n} actividades` : 'tabla no encontrada');
  const staff = await c.query(`select count(*)::int n from staff_users where active`).catch(() => null);
  ok('Cuenta del equipo', !!staff && staff.rows[0].n > 0, staff && staff.rows[0].n > 0 ? `${staff.rows[0].n} activa(s)` : 'crea una: npm run admin:create -- --email … --role admin');

  // 3 · Seguridad: RLS cerrado para la API pública de Supabase
  const rls = await c.query(`select count(*) filter (where relrowsecurity)::int on_, count(*)::int total from pg_class
     where relnamespace = 'public'::regnamespace and relkind = 'r' and relname <> 'schema_migrations'`).catch(() => null);
  ok('RLS activado en todas las tablas', !!rls && rls.rows[0].on_ === rls.rows[0].total, rls ? `${rls.rows[0].on_}/${rls.rows[0].total}` : undefined);
  const anon = await c.query(`select exists(select 1 from pg_roles where rolname = 'anon') e`);
  if (anon.rows[0].e) {
    const p = await c.query(`select bool_or(has_table_privilege('anon', c.oid, 'select')) s from pg_class c where relnamespace = 'public'::regnamespace and relkind in ('r','v')`);
    ok('Rol anon sin acceso a tablas (API REST de Supabase cerrada)', !p.rows[0].s);
  } else ok('Rol anon de Supabase', null, 'no existe (no es Supabase): no aplica');

  // 4 · Canal en vivo (LISTEN/NOTIFY)
  const lurl = process.env.DATABASE_LISTEN_URL || url;
  const l = new Client({ connectionString: lurl, ssl: ssl(lurl) });
  try {
    await l.connect();
    await l.query('listen everest_live_check');
    const got = new Promise<boolean>((res) => { l.on('notification', (m) => m.channel === 'everest_live_check' && res(true)); setTimeout(() => res(false), 6000); });
    await c.query(`select pg_notify('everest_live_check', 'ping')`);
    const r = await got;
    ok('Canal en vivo (LISTEN/NOTIFY)', r, r ? `vía ${lurl === url ? 'DATABASE_URL' : 'DATABASE_LISTEN_URL'}` : 'no llegó la notificación: usa DATABASE_LISTEN_URL con la conexión directa o el session pooler (5432). La app seguirá actualizando por sondeo cada 8–30 s.');
  } catch (e) {
    ok('Canal en vivo (LISTEN/NOTIFY)', false, (e as Error).message);
  } finally { await l.end().catch(() => {}); }

  // 5 · Supabase Storage (opcional)
  const st = supabaseStorage();
  if (!st) {
    ok('Supabase Storage', null, 'no configurado: las postales se guardan en disco (RENDER_DIR; usa un volumen persistente)');
  } else {
    try {
      if (!checkOnly) ok(`Bucket privado "${st.bucket}"`, true, await st.ensureBucket());
      const probe = `_verificacion/${Date.now()}.png`;
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      await st.upload(probe, png, 'image/png');
      const signed = await st.signedUrl(probe, 60);
      const r = await fetch(signed);
      await st.remove([probe]);
      ok('Storage: subir, firmar, descargar y borrar', r.ok, `HTTP ${r.status}`);
      const pub = await fetch(`${st.url}/storage/v1/object/public/${st.bucket}/${probe}`);
      ok('Bucket privado (sin acceso público)', !pub.ok, `acceso público → HTTP ${pub.status}`);
    } catch (e) {
      ok('Supabase Storage', false, (e as Error).message);
    }
  }

  // 6 · Render de postales en este equipo
  try {
    const v = execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', ['-hide_banner', '-encoders']).toString();
    ok('FFmpeg con libx264', v.includes('libx264'));
  } catch { ok('FFmpeg con libx264', false, 'instálalo o despliega con el Dockerfile (ya lo incluye)'); }
  ok('Video original 4K', fs.existsSync(process.env.POSTAL_SOURCE_VIDEO || 'assets/video/everest-original.mp4'));
  ok('SESSION_SECRET (≥ 32 caracteres)', (process.env.SESSION_SECRET?.length ?? 0) >= 32);
  ok('PUBLIC_URL (para el QR)', !!process.env.PUBLIC_URL, process.env.PUBLIC_URL || 'defínela con la URL pública final');

  await c.end();
  const failed = results.filter((r) => r.ok === false);
  console.log(failed.length ? `\n${failed.length} punto(s) por resolver.` : '\nTodo listo para operar con Supabase.');
  process.exit(failed.length ? 1 : 0);
})();
