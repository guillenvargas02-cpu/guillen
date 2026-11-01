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
    execute 'revoke all on all functions in schema public from anon';
    execute 'alter default privileges in schema public revoke all on tables from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from authenticated';
    execute 'revoke all on all functions in schema public from authenticated';
    execute 'alter default privileges in schema public revoke all on tables from authenticated';
  end if;
end $$;

-- Las vistas públicas se evalúan con los privilegios del propietario; solo las usa el servidor.
revoke all on v_public_wall, v_public_words, v_public_guestbook from public;
