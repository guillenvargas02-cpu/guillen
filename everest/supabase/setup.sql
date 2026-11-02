-- EVEREST · SOMOS — instalación completa para Supabase (SQL Editor → New query → Run).
-- Generado por scripts/build-supabase-sql.ts. Es idempotente solo en el registro de migraciones:
-- ejecútalo UNA vez en un proyecto nuevo. Para actualizaciones posteriores usa `npm run db:migrate`.

create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());

-- ═════════════ 001_init.sql ═════════════
-- EVEREST — Nuestra cima, nuestro futuro · Esquema inicial
-- La base de datos es la fuente de verdad. Todo acceso pasa por el servidor de la
-- aplicación (validación, límites, permisos). Ver 002_policies.sql.

create extension if not exists pgcrypto;

-- ───────────────────────── Configuración del evento ─────────────────────────
create table event_settings (
  id              int primary key default 1 check (id = 1),
  title           text not null default 'EVEREST',
  subtitle        text not null default 'Nuestra cima, nuestro futuro',
  organizer       text not null default 'SOMOS Miguel Hidalgo',
  starts_at       timestamptz not null default '2026-11-03 17:00:00-06',
  timezone        text not null default 'America/Mexico_City',
  venue           text not null default 'Hotel del Ejército y Fuerza Aérea',
  venue_room      text not null default 'Salón República',
  venue_address   text not null default 'Gral. Francisco Murguía 441, Militar, Miguel Hidalgo, 11600, Ciudad de México',
  concluded_at    timestamptz,
  -- Apertura de dinámicas
  wall_open           boolean not null default true,
  words_somos_open    boolean not null default true,
  words_night_open    boolean not null default true,
  guestbook_open      boolean not null default true,
  postal_open         boolean not null default true,
  -- Datos de demostración: nunca se mezclan con producción salvo que el equipo lo active.
  show_demo       boolean not null default false,
  updated_at      timestamptz not null default now()
);
insert into event_settings (id) values (1);

-- ───────────────────────── Programa ─────────────────────────
create table program_items (
  id                  uuid primary key default gen_random_uuid(),
  position            int not null,
  title               text not null check (char_length(title) between 1 and 140),
  description         text not null default '' check (char_length(description) <= 600),
  -- [{ "name": "…", "role": "…", "pending": true|false }]
  participants        jsonb not null default '[]'::jsonb,
  participants_note   text not null default '' check (char_length(participants_note) <= 200),
  planned_start       timestamptz,
  planned_end         timestamptz,
  schedule_note       text not null default '' check (char_length(schedule_note) <= 140),
  schedule_changed_at timestamptz,
  status              text not null default 'pending'
                      check (status in ('pending','live','paused','done','cancelled')),
  actual_start_at     timestamptz,
  actual_end_at       timestamptz,
  paused_at           timestamptz,
  source              text not null default '',
  is_demo             boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (planned_end is null or planned_start is null or planned_end >= planned_start)
);
-- Regla de servidor: solo puede existir UNA actividad en curso (en vivo o en pausa).
create unique index program_one_current on program_items ((true)) where status in ('live','paused');
create index program_position on program_items (position);

create table notices (
  id           uuid primary key default gen_random_uuid(),
  body         text not null check (char_length(body) between 1 and 280),
  tone         text not null default 'info' check (tone in ('info','importante')),
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  created_by   uuid
);

-- ───────────────────────── Muro (Tu voz) ─────────────────────────
create table wall_messages (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null unique,            -- idempotencia: reintentos no duplican
  guest_id       uuid not null,
  prompt         text not null check (prompt in ('llevas','expectativa')),
  display_name   text not null check (char_length(display_name) between 1 and 60),
  body           text not null check (char_length(body) between 1 and 280),
  consent_public boolean not null default false,  -- autoriza aparecer en muro y pantalla
  status         text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn')),
  featured       boolean not null default false,
  ip_hash        text,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now(),
  moderated_at   timestamptz,
  moderated_by   uuid
);
create index wall_status on wall_messages (status, created_at desc);
create index wall_guest on wall_messages (guest_id, created_at desc);

-- ───────────────────────── Palabras ─────────────────────────
-- question: 'somos' = "Para ti, ¿qué es SOMOS en una palabra?"
--           'noche' = "Define esta noche en una palabra"
create table word_entries (
  id           uuid primary key default gen_random_uuid(),
  question     text not null check (question in ('somos','noche')),
  guest_id     uuid not null,
  word_display text not null check (char_length(word_display) between 1 and 40),
  word_key     text not null check (char_length(word_key) between 1 and 40),
  ip_hash      text,
  is_demo      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (question, guest_id)                     -- una respuesta por sesión: actualizar no suma
);
create index word_entries_key on word_entries (question, word_key);

-- La moderación se hace por palabra normalizada: aprobar "unidad" aprueba todas sus aportaciones.
create table word_keys (
  question     text not null check (question in ('somos','noche')),
  key          text not null,
  display      text,                              -- forma de presentación elegida por el equipo
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderated_at timestamptz,
  moderated_by uuid,
  primary key (question, key)
);

-- ───────────────────────── Libro de visitas ─────────────────────────
create table guestbook_entries (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null unique,
  guest_id          uuid not null,
  display_name      text not null check (char_length(display_name) between 1 and 60),
  dedication        text not null check (char_length(dedication) between 1 and 500),
  signature_svg     text,                         -- generado por el servidor a partir de trazos validados
  signature_strokes jsonb,
  consent_show      boolean not null default false, -- mostrar participación en la plataforma
  consent_signature boolean not null default false, -- publicar la firma
  consent_social    boolean not null default false, -- reutilizar en redes del evento
  status            text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn')),
  featured          boolean not null default false,
  ip_hash           text,
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  moderated_at      timestamptz,
  moderated_by      uuid
);
create index guestbook_status on guestbook_entries (status, created_at desc);

-- ───────────────────────── Postal: cola de render ─────────────────────────
create table render_jobs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null unique,
  guest_id    uuid not null,
  format      text not null check (format in ('vertical','horizontal')),
  params      jsonb not null,
  status      text not null default 'queued' check (status in ('queued','rendering','done','failed')),
  progress    real not null default 0,
  attempts    int not null default 0,
  error       text,
  output_mp4  text,
  output_png  text,
  locked_by   text,
  locked_at   timestamptz,
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  finished_at timestamptz
);
create index render_jobs_queue on render_jobs (status, created_at);

-- ───────────────────────── Equipo ─────────────────────────
create table staff_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null,
  role          text not null check (role in ('admin','programa','moderacion')),
  password_hash text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

create table staff_sessions (
  token_hash  text primary key,
  user_id     uuid not null references staff_users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

create table audit_log (
  id         bigserial primary key,
  user_id    uuid,
  action     text not null,
  target     text,
  details    jsonb,
  at         timestamptz not null default now()
);

-- Límites de envío (multi-instancia).
create table rate_hits (
  key text not null,
  at  timestamptz not null default now()
);
create index rate_hits_key on rate_hits (key, at desc);

-- ───────────────────────── Señales en vivo ─────────────────────────
-- Las señales solo contienen el nombre del tema y una versión: nunca datos.
create table live_versions (
  topic      text primary key,
  version    bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into live_versions (topic) values ('program'), ('wall'), ('words'), ('guestbook');

create or replace function bump_live() returns trigger language plpgsql as $$
declare t text := tg_argv[0];
begin
  update live_versions set version = version + 1, updated_at = now() where topic = t;
  perform pg_notify('everest_live', t);
  return null;
end $$;

create trigger live_program  after insert or update or delete on program_items     for each statement execute function bump_live('program');
create trigger live_notices  after insert or update or delete on notices           for each statement execute function bump_live('program');
create trigger live_settings after update                     on event_settings    for each statement execute function bump_live('program');
create trigger live_wall     after insert or update or delete on wall_messages     for each statement execute function bump_live('wall');
create trigger live_words_e  after insert or update or delete on word_entries      for each statement execute function bump_live('words');
create trigger live_words_k  after insert or update or delete on word_keys         for each statement execute function bump_live('words');
create trigger live_guestbk  after insert or update or delete on guestbook_entries for each statement execute function bump_live('guestbook');

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger program_touch  before update on program_items  for each row execute function touch_updated_at();
create trigger settings_touch before update on event_settings for each row execute function touch_updated_at();

-- ───────────────────────── Transiciones del programa ─────────────────────────
-- Única vía para cambiar el estado. Serializa con un candado consultivo y respeta el
-- índice único: si hay otra actividad en curso, falla salvo que se pida terminarla.
create or replace function program_transition(p_id uuid, p_action text, p_finish_current boolean default false)
returns program_items language plpgsql as $$
declare
  cur program_items;
  other program_items;
begin
  perform pg_advisory_xact_lock(hashtext('everest_program'));
  select * into cur from program_items where id = p_id for update;
  if not found then raise exception 'NO_ENCONTRADA' using errcode = 'P0002'; end if;

  if p_action = 'start' then
    if cur.status in ('live') then return cur; end if;
    select * into other from program_items where status in ('live','paused') and id <> p_id limit 1;
    if found then
      if not p_finish_current then
        raise exception 'OTRA_EN_CURSO:%', other.title using errcode = 'P0001';
      end if;
      update program_items set status = 'done', actual_end_at = now(), paused_at = null where id = other.id;
    end if;
    update program_items
       set status = 'live', actual_start_at = coalesce(actual_start_at, now()), actual_end_at = null, paused_at = null
     where id = p_id returning * into cur;
    update event_settings set concluded_at = null where concluded_at is not null;
  elsif p_action = 'pause' then
    if cur.status <> 'live' then raise exception 'TRANSICION_INVALIDA' using errcode = 'P0001'; end if;
    update program_items set status = 'paused', paused_at = now() where id = p_id returning * into cur;
  elsif p_action = 'resume' then
    if cur.status <> 'paused' then raise exception 'TRANSICION_INVALIDA' using errcode = 'P0001'; end if;
    update program_items set status = 'live', paused_at = null where id = p_id returning * into cur;
  elsif p_action = 'finish' then
    if cur.status not in ('live','paused') then raise exception 'TRANSICION_INVALIDA' using errcode = 'P0001'; end if;
    update program_items set status = 'done', actual_end_at = now(), paused_at = null where id = p_id returning * into cur;
  elsif p_action = 'cancel' then
    if cur.status = 'done' then raise exception 'TRANSICION_INVALIDA' using errcode = 'P0001'; end if;
    update program_items set status = 'cancelled', paused_at = null, actual_end_at = null where id = p_id returning * into cur;
  elsif p_action = 'reset' then
    update program_items set status = 'pending', actual_start_at = null, actual_end_at = null, paused_at = null
     where id = p_id returning * into cur;
  else
    raise exception 'ACCION_DESCONOCIDA' using errcode = 'P0001';
  end if;
  return cur;
end $$;

-- ───────────────────────── Proyecciones públicas ─────────────────────────
-- El servidor solo lee contenido público a través de estas vistas.
create view v_public_wall as
  select m.id, m.prompt, m.display_name, m.body, m.featured, m.created_at, m.is_demo
    from wall_messages m, event_settings s
   where m.status = 'approved' and m.consent_public
     and (not m.is_demo or s.show_demo);

create view v_public_words as
  select e.question, e.word_key as key,
         coalesce(k.display, mode() within group (order by e.word_display)) as display,
         count(*)::int as n,
         bool_or(e.is_demo) as is_demo
    from word_entries e
    join word_keys k on k.question = e.question and k.key = e.word_key and k.status = 'approved',
         event_settings s
   where (not e.is_demo or s.show_demo)
   group by e.question, e.word_key, k.display;

create view v_public_guestbook as
  select g.id, g.display_name, g.dedication, g.featured, g.created_at, g.is_demo,
         (g.consent_signature and g.signature_svg is not null) as has_signature
    from guestbook_entries g, event_settings s
   where g.status = 'approved' and g.consent_show
     and (not g.is_demo or s.show_demo);


insert into schema_migrations (name) values ('001_init.sql') on conflict do nothing;

-- ═════════════ 002_policies.sql ═════════════
-- Políticas de acceso
--
-- Modelo: la aplicación (Next.js, servidor) es el único cliente de la base de datos.
-- Se conecta con DATABASE_URL (rol propietario o rol dedicado) y aplica validación,
-- límites de envío y permisos por rol del equipo.
--
-- Si la base vive en Supabase, su API REST/Realtime expone el esquema "public" a los
-- roles anon y authenticated. Aquí se cierra por completo: RLS activado sin políticas
-- y privilegios revocados. Nada pendiente, privado o firma sin autorización puede
-- salir por esos canales; el contenido público se entrega solo a través del servidor
-- y de las vistas v_public_* (contenido aprobado y autorizado).

do $$
declare t text;
begin
  foreach t in array array[
    'event_settings','program_items','notices','wall_messages','word_entries','word_keys',
    'guestbook_entries','render_jobs','staff_users','staff_sessions','audit_log','rate_hits','live_versions'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- Política para el rol de la aplicación: acceso total (la autorización se hace en el servidor).
-- current_user es el rol que ejecuta la migración (el mismo que usa la aplicación).
do $$
declare t text;
begin
  foreach t in array array[
    'event_settings','program_items','notices','wall_messages','word_entries','word_keys',
    'guestbook_entries','render_jobs','staff_users','staff_sessions','audit_log','rate_hits','live_versions'
  ] loop
    execute format('create policy app_all on %I to %I using (true) with check (true)', t, current_user);
  end loop;
end $$;

-- Supabase: revocar todo a los roles de la API pública, si existen.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema public from anon';
    execute 'revoke all on function program_transition(uuid, text, boolean), bump_live(), touch_updated_at() from anon';
    execute 'alter default privileges in schema public revoke all on tables from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from authenticated';
    execute 'revoke all on function program_transition(uuid, text, boolean), bump_live(), touch_updated_at() from authenticated';
    execute 'alter default privileges in schema public revoke all on tables from authenticated';
  end if;
end $$;

-- Las funciones propias no se ejecutan desde la API pública.
revoke all on function program_transition(uuid, text, boolean) from public;

-- Las vistas públicas se evalúan con los privilegios del propietario; solo las usa el servidor.
revoke all on v_public_wall, v_public_words, v_public_guestbook from public;

insert into schema_migrations (name) values ('002_policies.sql') on conflict do nothing;

-- ═════════════ Programa inicial (editable en /admin) ═════════════
insert into program_items (position, title, description, participants, participants_note, planned_start, planned_end, schedule_note, source)
select * from (values
  (10, 'Recepción y registro', 'Bienvenida a las y los asistentes. El registro permanece abierto durante la tarde: llega en el momento que te sea posible.', '[]'::jsonb, '', '2026-11-03T17:00:00-06:00'::timestamptz, null::timestamptz, 'A partir de las 17:00 h', 'Anexo de invitación · EVEREST'),
  (20, 'Panel de preguntas y respuestas con la dirigencia de SOMOS', 'Conversación abierta con dirigentes nacionales de SOMOS.', '[{"name":"Emilio Álvarez Icaza Longoria","role":"Representante propietario de SOMOS ante el INE"},{"name":"Cecilia Guadalupe Soto González","role":"Secretaria General de SOMOS"},{"name":"Adina Chelminsky","role":"Miembro del Comité Ejecutivo Nacional de SOMOS"},{"name":"Guadalupe Acosta Naranjo","role":"Presidente Nacional de SOMOS","pending":true}]'::jsonb, 'Por confirmar: otros liderazgos.', '2026-11-03T17:30:00-06:00'::timestamptz, '2026-11-03T18:30:00-06:00'::timestamptz, '', 'Anexo de invitación · EVEREST'),
  (30, 'Receso y networking', 'Espacio breve para conversar, conectar y convivir entre asistentes.', '[]'::jsonb, '', '2026-11-03T18:30:00-06:00'::timestamptz, '2026-11-03T19:05:00-06:00'::timestamptz, '', 'Anexo de invitación · EVEREST'),
  (40, 'Mensaje del Mtro. Eduardo Contró', 'Discurso del Mtro. Eduardo Contró.', '[{"name":"Mtro. Eduardo Contró"}]'::jsonb, '', '2026-11-03T19:05:00-06:00'::timestamptz, '2026-11-03T19:20:00-06:00'::timestamptz, '', 'Anexo de invitación · EVEREST'),
  (50, 'Conferencia magistral de Omar Álvarez', 'La cima más importante no siempre está en una montaña. ¿Cuál es la tuya? — El verdadero significado de la cumbre.', '[{"name":"Omar Álvarez","role":"Speaker internacional · Consultor en liderazgo · Montañista"}]'::jsonb, '', '2026-11-03T19:20:00-06:00'::timestamptz, '2026-11-03T20:00:00-06:00'::timestamptz, '', 'Anexo de invitación · EVEREST'),
  (60, 'Cena y networking', 'Cena opcional de cuatro tiempos con reservación previa (servicio de la sede, disponible desde las 19:30 h). El acceso al encuentro es gratuito y no requiere consumo.', '[]'::jsonb, '', '2026-11-03T20:00:00-06:00'::timestamptz, '2026-11-03T22:00:00-06:00'::timestamptz, '', 'Anexo de invitación · EVEREST')
) as v(position, title, description, participants, participants_note, planned_start, planned_end, schedule_note, source)
where not exists (select 1 from program_items where not is_demo);

-- Listo. Siguiente paso: crea la primera cuenta del equipo con
--   npm run admin:create -- --email tu@correo.mx --name "Tu nombre" --role admin
