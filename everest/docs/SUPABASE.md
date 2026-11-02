# Conectar EVEREST con Supabase

Supabase aporta la **base de datos PostgreSQL** (fuente de verdad) y, opcionalmente, el **Storage** para las postales en video. La app (Next.js + FFmpeg) corre en un servicio de contenedores, como Render, Railway o Fly. Supabase no ejecuta servidores Node de larga duración.

```
Celulares ──▶ App (contenedor: Next.js + FFmpeg) ──SQL──▶ Supabase Postgres
                     │   ▲ LISTEN/NOTIFY → SSE (en vivo)
                     └──────── postales MP4/PNG ──▶ Supabase Storage (bucket privado)
```

> El tiempo real usa `LISTEN/NOTIFY` de Postgres y Server-Sent Events, no Supabase Realtime. Así ningún dato pendiente o privado pasa por canales públicos: la API REST y Realtime de Supabase quedan **cerradas** con RLS y sin privilegios para `anon` y `authenticated`.

## 1 · Crear el proyecto (5 min)

1. En <https://supabase.com/dashboard>, pulsa **New project**.
2. **Region:** *East US (North Virginia)*, la de menor latencia hacia CDMX entre las disponibles.
3. Define una **Database password** segura y guárdala.
4. Espera a que el proyecto termine de aprovisionarse.

## 2 · Obtener las credenciales

| Variable | Dónde está en Supabase |
|---|---|
| `DATABASE_URL` | Botón **Connect** (arriba) → **Session pooler** → copia el URI y reemplaza `[YOUR-PASSWORD]`. Puerto **5432**. |
| `SUPABASE_URL` | **Project Settings → API → Project URL** (`https://xxxx.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project Settings → API Keys** → llave secreta (*service_role* o *sb_secret_…*). |

- Usa el **Session pooler (5432)**, no el *Transaction pooler (6543)*: el canal en vivo necesita una conexión de sesión para `LISTEN`.
- La conexión directa (`db.xxxx.supabase.co`) solo funciona por IPv6, salvo que contrates el complemento IPv4; el session pooler funciona por IPv4.
- La llave secreta **solo va en el servidor**. Nunca la pongas en una variable `NEXT_PUBLIC_…` ni en el navegador. La app no usa la llave `anon`.

## 3 · Instalar el esquema

Elige **una** de las dos vías.

**A · Desde tu computadora (recomendado).** Además de instalar, verifica todo:

```bash
cd everest
npm install
cp .env.example .env.local      # pega DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
openssl rand -base64 48         # pega el resultado en SESSION_SECRET
npm run supabase:setup          # migra, carga el programa, crea el bucket "postales" y verifica
npm run admin:create -- --email tu@correo.mx --name "Tu nombre" --role admin
npm run supabase:check          # debe terminar en “Todo listo para operar con Supabase.”
```

**B · Sin terminal.** En Supabase abre **SQL Editor → New query**, pega el contenido de [`supabase/setup.sql`](../supabase/setup.sql) y pulsa **Run**. Crea las tablas, las políticas, el programa inicial y el registro de migraciones. El bucket se crea solo la primera vez que la app arranca con `SUPABASE_URL` y la llave definidas, o con `npm run supabase:setup`. La cuenta del equipo sí necesita `npm run admin:create`, una vez, desde cualquier computadora con el `.env.local`.

`supabase:check` revisa, sin modificar nada:
- conexión;
- migraciones aplicadas;
- programa cargado;
- que exista una cuenta del equipo;
- RLS en todas las tablas;
- que `anon` no tenga acceso;
- `LISTEN/NOTIFY` de ida y vuelta;
- el Storage completo (subir, firmar, descargar, borrar) y que el bucket no sea público;
- FFmpeg, el video original, `SESSION_SECRET` y `PUBLIC_URL`.

## 4 · Desplegar la app

**Render (con el Blueprint incluido):**
1. En Render, **New → Blueprint** y elige este repositorio; Render lee [`render.yaml`](../../render.yaml) de la raíz.
2. Captura `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `PUBLIC_URL`. `SESSION_SECRET` se genera solo.
3. Al arrancar, el contenedor aplica las migraciones y carga el programa, solo si está vacío.
4. Cuando tengas la URL definitiva, actualiza `PUBLIC_URL` (con ella se genera el QR) y vuelve a desplegar.

**Otra plataforma (Railway, Fly, VPS):** usa el `Dockerfile` de `everest/` con las mismas variables. Con Supabase Storage no hace falta disco persistente. Sin Storage, monta un volumen en `/data`.

Recursos sugeridos: 2 GB de RAM, 1 o 2 vCPU y `RENDER_CONCURRENCY=1` (≈ 10–15 s por postal).

## 5 · Antes de abrir puertas

- Abre `PUBLIC_URL` en dos celulares, inicia una actividad desde `/admin` y comprueba que ambos la ven sin recargar.
- Genera una postal desde un celular y descárgala.
- Descarga el QR en `/admin → Descargas y QR` (`/qr.svg`, `/qr.png`).
- `npm run supabase:check` con las variables de producción.

## Seguridad aplicada

| Capa | Medida |
|---|---|
| API REST / Realtime de Supabase | RLS activado y forzado en todas las tablas. `anon` y `authenticated` sin privilegios sobre tablas, vistas ni funciones. |
| App | Toda escritura pasa por el servidor: validación, límites de envío, verificación de origen, roles del equipo y bitácora. |
| Contenido público | Solo desde las vistas `v_public_*` (aprobado y autorizado). Las firmas privadas nunca se sirven. |
| Postales | Bucket privado; enlaces firmados de 10 minutos; borrado automático a las 72 h (`RENDER_TTL_HOURS`). |
| Secretos | `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SESSION_SECRET` solo en variables del servidor. |

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `password authentication failed` | Revisa que reemplazaste `[YOUR-PASSWORD]` y el usuario `postgres.TU_PROJECT_REF`. |
| `ENOTFOUND db.xxxx.supabase.co` | Es la conexión directa (solo IPv6). Usa el **Session pooler**. |
| “Canal en vivo ✘” en `supabase:check` | Estás en el puerto 6543. Usa 5432 (session pooler) o define `DATABASE_LISTEN_URL`. La app seguirá actualizándose por sondeo cada 8–30 s. |
| `remaining connection slots are reserved` | Baja `DATABASE_POOL_MAX` (8 por instancia en el plan gratuito). |
| Storage `401/403` | La llave no es la secreta (*service_role*/*sb_secret_*), o `SUPABASE_URL` no corresponde al proyecto. |

## Verificación realizada en desarrollo

No hay credenciales de un proyecto Supabase real en este entorno. Para comprobarlo se simuló Supabase:

- **Base de datos:** PostgreSQL 16 con los roles `anon` y `authenticated` creados como en Supabase, y privilegios por defecto que les daban `select`. Tras `supabase/setup.sql`, `anon` quedó sin acceso a tablas, vistas y funciones.
- **Storage:** un simulador de la API de Supabase Storage (subir, firmar, descargar, borrar, bucket privado).

Resultados:
- `supabase:setup` pasó todos los puntos, salvo la cuenta del equipo antes de crearla.
- La app generó una postal, la subió al bucket, borró la copia local y entregó la descarga con un enlace firmado (302 → 200, `video/mp4`, nombre de archivo correcto).
- Las 39 pruebas de punta a punta pasaron en este modo.

En tu proyecto real, `npm run supabase:check` confirma lo mismo contra Supabase.
