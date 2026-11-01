// Alta o actualización de una persona del equipo.
//   npm run admin:create -- --email equipo@ejemplo.mx --name "Nombre" --role admin [--password "…"]
// Si no se indica contraseña, se genera una segura y se muestra una sola vez.
import { randomBytes } from 'node:crypto';
import { connect } from './_db';
import { hashPassword } from '../src/lib/password';

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

(async () => {
  const email = arg('email')?.toLowerCase().trim();
  const name = arg('name') ?? email;
  const role = arg('role') ?? 'admin';
  if (!email || !['admin', 'programa', 'moderacion'].includes(role)) {
    console.error('Uso: npm run admin:create -- --email correo --name "Nombre" --role admin|programa|moderacion [--password …]');
    process.exit(1);
  }
  const password = arg('password') ?? randomBytes(9).toString('base64url');
  if (password.length < 10) { console.error('La contraseña debe tener al menos 10 caracteres.'); process.exit(1); }
  const c = await connect();
  await c.query(
    `insert into staff_users (email, name, role, password_hash) values ($1,$2,$3,$4)
     on conflict (email) do update set name = excluded.name, role = excluded.role, password_hash = excluded.password_hash, active = true`,
    [email, name, role, await hashPassword(password)],
  );
  console.log(`Listo: ${email} (${role}).`);
  if (!arg('password')) console.log(`Contraseña generada (guárdala ahora): ${password}`);
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
