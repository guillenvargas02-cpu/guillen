// Genera supabase/setup.sql: todo en un solo archivo para pegar en el SQL Editor de Supabase.
//   npm run supabase:sql
// Incluye: migraciones (esquema, políticas), programa inicial y el registro en schema_migrations
// para que `npm run db:migrate` no vuelva a aplicarlas después.
import fs from 'node:fs';
import path from 'node:path';
import { PROGRAM, SOURCE } from './_program';

const lit = (v: unknown) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const dir = path.resolve('db/migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
let sql = `-- EVEREST · SOMOS — instalación completa para Supabase (SQL Editor → New query → Run).
-- Generado por scripts/build-supabase-sql.ts. Es idempotente solo en el registro de migraciones:
-- ejecútalo UNA vez en un proyecto nuevo. Para actualizaciones posteriores usa \`npm run db:migrate\`.

create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());
`;
for (const f of files) {
  sql += `\n-- ═════════════ ${f} ═════════════\n${fs.readFileSync(path.join(dir, f), 'utf8')}\ninsert into schema_migrations (name) values (${lit(f)}) on conflict do nothing;\n`;
}
sql += `\n-- ═════════════ Programa inicial (editable en /admin) ═════════════\ninsert into program_items (position, title, description, participants, participants_note, planned_start, planned_end, schedule_note, source)\nselect * from (values\n`;
sql += PROGRAM.map((p, i) => `  (${(i + 1) * 10}, ${lit(p.title)}, ${lit(p.description)}, ${lit(JSON.stringify(p.participants))}::jsonb, ${lit(p.participants_note ?? '')}, ${lit(p.planned_start)}::timestamptz, ${lit(p.planned_end)}::timestamptz, ${lit(p.schedule_note)}, ${lit(SOURCE)})`).join(',\n');
sql += `\n) as v(position, title, description, participants, participants_note, planned_start, planned_end, schedule_note, source)\nwhere not exists (select 1 from program_items where not is_demo);\n`;
sql += `\n-- Listo. Siguiente paso: crea la primera cuenta del equipo con\n--   npm run admin:create -- --email tu@correo.mx --name "Tu nombre" --role admin\n`;
fs.mkdirSync('supabase', { recursive: true });
fs.writeFileSync('supabase/setup.sql', sql);
console.log(`supabase/setup.sql (${files.length} migraciones + programa inicial)`);
