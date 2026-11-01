// Programa inicial (editable) según el Anexo de invitación de EVEREST.
//   npm run db:seed            → programa inicial, solo si la tabla está vacía
//   npm run db:seed -- --demo  → además, aportaciones de DEMOSTRACIÓN (is_demo = true),
//                                ocultas al público salvo que el equipo active "Mostrar demostración".
import { randomUUID } from 'node:crypto';
import { connect } from './_db';

const T = (hhmm: string) => `2026-11-03T${hhmm}:00-06:00`;
const SOURCE = 'Anexo de invitación · EVEREST';

const PROGRAM = [
  {
    title: 'Recepción y registro',
    description: 'Bienvenida a las y los asistentes. El registro permanece abierto durante la tarde: llega en el momento que te sea posible.',
    participants: [],
    planned_start: T('17:00'), planned_end: null,
    schedule_note: 'A partir de las 17:00 h',
  },
  {
    title: 'Panel de preguntas y respuestas con la dirigencia de SOMOS',
    description: 'Conversación abierta con dirigentes nacionales de SOMOS.',
    participants: [
      { name: 'Emilio Álvarez Icaza Longoria', role: 'Representante propietario de SOMOS ante el INE' },
      { name: 'Cecilia Guadalupe Soto González', role: 'Secretaria General de SOMOS' },
      { name: 'Adina Chelminsky', role: 'Miembro del Comité Ejecutivo Nacional de SOMOS' },
      { name: 'Guadalupe Acosta Naranjo', role: 'Presidente Nacional de SOMOS', pending: true },
    ],
    participants_note: 'Por confirmar: otros liderazgos.',
    planned_start: T('17:30'), planned_end: T('18:30'),
    schedule_note: '',
  },
  {
    title: 'Receso y networking',
    description: 'Espacio breve para conversar, conectar y convivir entre asistentes.',
    participants: [],
    planned_start: T('18:30'), planned_end: T('19:05'),
    schedule_note: '',
  },
  {
    title: 'Mensaje del Mtro. Eduardo Contró',
    description: 'Discurso del Mtro. Eduardo Contró.',
    participants: [{ name: 'Mtro. Eduardo Contró' }],
    planned_start: T('19:05'), planned_end: T('19:20'),
    schedule_note: '',
  },
  {
    title: 'Conferencia magistral de Omar Álvarez',
    description: 'La cima más importante no siempre está en una montaña. ¿Cuál es la tuya? — El verdadero significado de la cumbre.',
    participants: [{ name: 'Omar Álvarez', role: 'Speaker internacional · Consultor en liderazgo · Montañista' }],
    planned_start: T('19:20'), planned_end: T('20:00'),
    schedule_note: '',
  },
  {
    title: 'Cena y networking',
    description: 'Cena opcional de cuatro tiempos con reservación previa (servicio de la sede, disponible desde las 19:30 h). El acceso al encuentro es gratuito y no requiere consumo.',
    participants: [],
    planned_start: T('20:00'), planned_end: T('22:00'),
    schedule_note: '',
  },
];

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
