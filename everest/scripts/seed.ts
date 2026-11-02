// Programa inicial (editable) según el Anexo de invitación de EVEREST.
//   npm run db:seed            → programa inicial, solo si la tabla está vacía
//   npm run db:seed -- --demo  → además, aportaciones de DEMOSTRACIÓN (is_demo = true),
//                                ocultas al público salvo que el equipo active "Mostrar demostración".
import { randomUUID } from 'node:crypto';
import { connect } from './_db';

import { PROGRAM, SOURCE } from './_program';
import { hashPassword } from '../src/lib/password';

const DEMO_WALL = [
  ['Mariana', 'llevas', 'Me llevo la certeza de que la cima se construye en equipo.'],
  ['Luis Ángel', 'expectativa', 'Vengo a escuchar, a aprender y a conocer a quienes empujan desde Miguel Hidalgo.'],
  ['Begoña', 'llevas', 'Que la confianza se construye cumpliendo. Gracias por esta noche.'],
];
const DEMO_WORDS: [string, string][] = [
  ['somos', 'Unidad'], ['somos', 'unidad'], ['somos', 'Comunidad'], ['somos', 'Futuro'], ['somos', 'Ciudadanía'],
  ['noche', 'Inspiración'], ['noche', 'inspiración'], ['noche', 'Cumbre'], ['noche', 'Encuentro'],
];

(async () => {
  const c = await connect();
  const demo = process.argv.includes('--demo');
  const n = Number((await c.query(`select count(*) from program_items where not is_demo`)).rows[0].count);
  if (n === 0) {
    let pos = 10;
    for (const p of PROGRAM) {
      await c.query(
        `insert into program_items (position, title, description, participants, participants_note, planned_start, planned_end, schedule_note, source)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [pos, p.title, p.description, JSON.stringify(p.participants), p.participants_note ?? '', p.planned_start, p.planned_end, p.schedule_note, SOURCE],
      );
      pos += 10;
    }
    console.log(`Programa inicial cargado (${PROGRAM.length} actividades).`);
  } else {
    console.log('El programa ya tiene actividades; no se modificó.');
  }
  // Primera cuenta del equipo sin terminal: ADMIN_EMAIL + ADMIN_PASSWORD en las variables del servidor.
  // Solo se crea si ese correo aún no existe (no sobrescribe contraseñas cambiadas después).
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if (email && pass) {
    if (pass.length < 10) console.log('ADMIN_PASSWORD debe tener al menos 10 caracteres: no se creó la cuenta.');
    else {
      const r = await c.query(
        `insert into staff_users (email, name, role, password_hash) values ($1, $2, 'admin', $3) on conflict (email) do nothing returning id`,
        [email, process.env.ADMIN_NAME || 'Equipo SOMOS', await hashPassword(pass)],
      );
      console.log(r.rowCount ? `Cuenta de administración creada: ${email}` : `La cuenta ${email} ya existía; no se modificó.`);
    }
  }
  if (demo) {
    for (const [name, prompt, body] of DEMO_WALL) {
      await c.query(
        `insert into wall_messages (client_id, guest_id, prompt, display_name, body, consent_public, status, is_demo)
         values ($1,$2,$3,$4,$5,true,'approved',true)`,
        [randomUUID(), randomUUID(), prompt, name, body],
      );
    }
    for (const [question, word] of DEMO_WORDS) {
      const key = word.toLocaleLowerCase('es-MX');
      await c.query(`insert into word_entries (question, guest_id, word_display, word_key, is_demo) values ($1,$2,$3,$4,true)`, [question, randomUUID(), word, key]);
      await c.query(`insert into word_keys (question, key, status) values ($1,$2,'approved') on conflict do nothing`, [question, key]);
    }
    console.log('Datos de DEMOSTRACIÓN insertados (is_demo = true). Ocultos salvo que actives "Mostrar demostración".');
  }
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
