// Programa inicial (editable) según el Anexo de invitación de EVEREST. Compartido por seed y setup.sql.
const T = (hhmm: string) => `2026-11-03T${hhmm}:00-06:00`;
export const SOURCE = 'Anexo de invitación · EVEREST';

export const PROGRAM = [
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

