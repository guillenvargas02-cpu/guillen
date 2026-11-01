# EVEREST — Nuestra cima, nuestro futuro

Plataforma del encuentro de **SOMOS Miguel Hidalgo** (martes 3 de noviembre de 2026, 17:00 h, Salón República, Hotel del Ejército y Fuerza Aérea). Una sola URL y un solo QR para que cada invitado, desde su celular:

| Sección | Qué hace |
|---|---|
| **Inicio** | Video de montaña, *Está pasando ahora*, la siguiente actividad, avisos, protagonistas, accesos, vistas previas (muro, palabras, postal), Instagram y contacto. |
| **Programa** | Línea de tiempo en vivo: actividad actual, siguiente y terminadas, con cambios de horario. |
| **Tu voz** | Muro (“¿Qué te llevas de esta noche?” / expectativas) y dos dinámicas de una palabra con nubes y conteos independientes. |
| **Libro** | Dedicatoria (500), firma manuscrita opcional y tres autorizaciones separadas. |
| **Postal** | Postal retro con el paisaje en movimiento **dentro de las letras de EVEREST**: MP4 H.264 + PNG. |

Además: **/admin** (equipo, con sesión y roles) y **/pantalla** (proyección 16:9 con contenido aprobado y QR).

Sin cuentas para el público: no se pide correo ni teléfono. El nombre se recuerda en el dispositivo para no pedirlo dos veces.

---

## Arquitectura

```
Navegador ──HTTP──▶ Next.js 16 (App Router, TypeScript, Node) ──SQL──▶ PostgreSQL (fuente de verdad)
    ▲   │                 │  ├ API con validación (zod), límites, permisos         ▲
    │   └──SSE /api/live◀─┘  ├ LISTEN everest_live ◀── triggers NOTIFY ────────────┘
    │                         └ Cola de render (render_jobs) ─▶ FFmpeg + @napi-rs/canvas
    └── snapshot público (/api/snapshot): solo vistas v_public_* (aprobado y autorizado)
```

- **Fuente de verdad:** PostgreSQL (Supabase recomendado). `localStorage` guarda solo borradores, nombre y recuerdos propios.
- **Tiempo real:** triggers `NOTIFY` → un `LISTEN` por instancia → **Server‑Sent Events**. Las señales llevan solo el *tema* (`program`, `wall`, `words`, `guestbook`), nunca contenido; cada cliente vuelve a pedir su instantánea pública. Reconexión automática, recuperación del estado vigente al reconectar, sondeo de respaldo (30 s con canal abierto, 8 s sin él) y aviso de “datos posiblemente desactualizados” sin red.
- **Programa:** las transiciones pasan por `program_transition()` (candado consultivo) y un **índice único parcial** garantiza en el servidor que solo hay **una actividad en curso** (en vivo o en pausa). Nada inicia por la hora: el equipo confirma.
- **Privacidad:** la API pública lee solo de `v_public_wall`, `v_public_words`, `v_public_guestbook`. Pendientes, privados y firmas sin autorización nunca salen por API, archivos ni el canal en vivo. RLS activado y cerrado para `anon`/`authenticated` (Supabase), ver `db/migrations/002_policies.sql`.
- **Idempotencia:** cada envío lleva un `client_id`; reintentos tras fallos de red no duplican. Palabras: una por sesión y pregunta (`unique(question, guest_id)`): cambiar actualiza, no suma.
- **Límites:** ventana deslizante en BD (`rate_hits`) por invitado (cookie firmada anónima) y por huella de IP (HMAC, no se guarda la IP).
- **Equipo:** sesiones con cookie `httpOnly`/`SameSite=Strict`, contraseñas scrypt, roles `admin`, `programa`, `moderacion`, bitácora (`audit_log`), verificación de origen en escrituras.

### Postal: un solo módulo para previsualizar y exportar

**Diseño — postal retro de “letras grandes”.** El video de montaña es el **fondo de toda la postal**. Las letras de EVEREST son ventanas al paisaje a color pleno: arco suave, filete blanco, contorno azul noche y extrusión profunda rosa→magenta. Fuera de las letras, el video lleva una veladura de impresión antigua: degradado de atardecer a azul noche, puntos de semitono y grano. La postal tiene un borde crema con doble filete, “Saludos desde” manuscrito en Lobster Two (OFL, convertido en contorno vectorial), una cinta rosa con “Nuestra cima, nuestro futuro” y un timbre perforado con su matasellos. Lleva el día, la fecha, la hora y la sede, y el logotipo oficial sobre etiqueta blanca. **Sin frase personal**; el nombre es **opcional** (“Con cariño, …”) y está desactivado por defecto.

`src/postcard/compose.ts` define tipografía, máscara, encuadre, posiciones y tiempos. Lo usan:

- **Previsualización** (navegador): `<video>` ligero (720p, 600 KB) posicionado en el rectángulo *cover* + `<canvas>` con la capa gráfica.
- **Render** (servidor): `@napi-rs/canvas` dibuja **la misma capa** en PNG con alfa; FFmpeg escala el **original 4K** al mismo rectángulo, recorta, superpone y codifica.

La capa gráfica es semitransparente fuera de las letras (veladura) y totalmente transparente en el **interior de las letras** (`destination-out`), así que el paisaje se ve con color pleno dentro de EVEREST y tratado alrededor; los huecos interiores (la R) reciben la veladura del fondo. Las letras son contornos vectoriales precalculados (`src/postcard/lettering.ts`, generado por `npm run assets:lettering`), idénticos en ambos motores.

Salida verificada (render en servidor con el **original 4K** como fondo): **MP4 H.264 High, yuv420p, 30 fps, 240 cuadros = 8 s exactos, sin audio, `+faststart`**; vertical 1080×1920 (principal) y horizontal 1920×1080 con composición adaptada; PNG adicional. No se usa MediaRecorder: el MP4 se genera en servidor (funciona igual en cualquier celular).

La cola (`render_jobs`) es persistente, con progreso, límite de concurrencia por instancia (`RENDER_CONCURRENCY`), tope de fila (`RENDER_MAX_QUEUE`), hasta 3 intentos y recuperación de trabajos atascados. Varias instancias pueden compartirla (`FOR UPDATE SKIP LOCKED`), pero los archivos se guardan en disco local: con más de una instancia, monta un volumen compartido en `RENDER_DIR`.

---

## Identidad SOMOS aplicada

- **Logotipo oficial** extraído en vector del *Manual de Identidad 2026* (pág. 6, positivo; pág. 17, pleca; pág. 13, lema) → `public/brand/`. Nunca se recompone con una fuente; sin cambios de proporción, color, sombras ni efectos.
- **Positivo** (rosa sobre blanco) en barra lateral, encabezado, pantalla y en el panel blanco de la postal, con área de seguridad. La **pleca** queda disponible para fotografía/color; en esta versión el logo no se coloca sobre fotografía.
- **Rosa cívico #E4007C** para acciones, selección y acentos; blanco como superficie; negro para información.
- **Tipografía:** la primaria (Bernino Sans / *JAF Bernini Sans* en Adobe Fonts) **no se incluye** porque su licencia de Adobe Fonts no permite autoalojarla ni usarla en el render de video del servidor. **Sustitución documentada:** toda la interfaz y los textos de la postal usan **Hind Siliguri** (secundaria oficial, OFL). Para la rotulación experimental de la palabra **EVEREST** (postal y portada) se usa **Anton** (OFL), solo en EVEREST y cifras de horario; el logo SOMOS permanece intacto. Si el equipo obtiene una licencia web/desktop de Bernino Sans, basta con añadir los archivos y cambiar `--font` en `globals.css` y `FONT` en `compose.ts`.
- “**Nuestra cima, nuestro futuro**” aparece siempre como subtítulo, separado del logo. El lema “La fuerza que nos une” está extraído con su composición autorizada (`public/brand/somos-lema.svg`), no se usa por ahora.

## Datos del programa

El programa inicial (`npm run db:seed`) sigue el **Anexo de invitación** entregado (orden, horarios publicados y participantes), y todo es editable en /admin:

1. Recepción y registro — desde 17:00
2. Panel de preguntas y respuestas con la dirigencia de SOMOS — 17:30–18:30 (Emilio Álvarez Icaza Longoria, Cecilia Guadalupe Soto González, Adina Chelminsky; **por confirmar:** Guadalupe Acosta Naranjo y otros liderazgos)
3. Receso y networking — 18:30–19:05
4. Mensaje del Mtro. Eduardo Contró — 19:05–19:20
5. Conferencia magistral de Omar Álvarez — 19:20–20:00
6. Cena y networking — 20:00–22:00 (cena opcional con reservación, desde 19:30)

> El encargo original indicaba que solo estaba confirmado el inicio de las 17:00 h; los horarios intermedios provienen del anexo. Si alguno no está confirmado, edítalo o vacía su hora en /admin (aparecerá como “Horario por confirmar”).

---

## Instalación local

Requisitos: Node 20.9+ (probado con 22), PostgreSQL 14+ (probado con 16), FFmpeg con libx264.

```bash
cd everest
npm install
cp .env.example .env.local   # define DATABASE_URL y SESSION_SECRET
npm run db:migrate
npm run db:seed              # programa inicial (solo si está vacío)
npm run admin:create -- --email tu@correo.mx --name "Tu nombre" --role admin
npm run dev                  # http://localhost:3000
```

Datos de demostración (identificados y separados): `npm run db:seed -- --demo`. Quedan ocultos al público hasta que una persona *admin* active “Mostrar demostración”; se pueden borrar desde /admin y nunca se exportan.

## Despliegue

Necesita un **proceso Node de larga duración** (SSE + FFmpeg + cola), por lo que la opción recomendada es un contenedor (Railway, Render, Fly.io, un VPS…) y **no** funciones serverless.

1. **Base de datos (Supabase):** crea el proyecto y copia la cadena de conexión **directa** o *session pooler* (puerto 5432) en `DATABASE_URL`.
2. **App:** despliega este directorio con el `Dockerfile` (incluye FFmpeg). Variables: `DATABASE_URL`, `SESSION_SECRET`, `PUBLIC_URL`. Monta un volumen persistente en `/data` (postales). Recursos sugeridos: 2 vCPU / 2 GB (≈ 10–12 s por postal con `RENDER_CONCURRENCY=1`).
3. Al arrancar, el contenedor aplica migraciones y carga el programa inicial.
4. Crea las cuentas del equipo: `npm run admin:create -- …` (o desde /admin → Equipo).
5. Abre `PUBLIC_URL`, verifica en dos celulares y **después** descarga el QR desde /admin → *Descargas y QR* (`/qr.svg`, `/qr.png`). El QR codifica `PUBLIC_URL`.

Alternativa autocontenida: `docker compose up -d --build` (app + PostgreSQL).

## Pruebas

```bash
npm run typecheck
npm run test:unit                    # palabras, firma, texto, encuadre, fechas
npm run test:e2e                     # ⚠ reinicia los datos de participación de DATABASE_URL
npx tsx tests/tools/render-sample.ts /tmp/postal vertical ["Nombre"]   # MP4 + PNG completos
npx tsx tests/tools/still.ts /tmp/still.png horizontal ["Nombre"]      # fotograma rápido para revisar diseño
```

`test:e2e` usa Chromium real (Playwright) con tres contextos simultáneos —admin de escritorio, **emulación** de iPhone 13 y de Pixel 7— y cubre: cambios del programa en vivo en dos dispositivos, regla de una sola actividad, pausa, cambio de horario, avisos, pérdida y recuperación de red, reintento sin duplicados, moderación y privacidad (API pública, pantalla), conteos separados y normalización de palabras, firma con mouse y táctil sin desplazar la página, conservación al girar, firma privada vs. pública, generación de la postal desde el celular y verificación con `ffprobe` del MP4 descargado.

### Resultados en este entorno (1 nov 2026)

- `test:unit`: 6/6. `test:e2e`: **39/39**.
- MP4 descargado verificado fuera de la plataforma: `h264 High, yuv420p, 1080×1920, 30/1, 8.000 s, sin audio`. Fotogramas a 0,2 s / 4 s / 7,8 s: el paisaje se mueve dentro de las letras (diferencia media ≈ 18) y en el fondo tratado; el borde y los elementos gráficos quedan fijos (≈ 0,00).
- Previsualización vs. PNG del servidor en el mismo instante: la capa gráfica coincide (diferencia media ≈ 5/255 por reescalado); el video interior coincide en tiempo (mejor ajuste t ≈ 5,4–5,5 s) y difiere solo en resolución (proxy 720p vs. original 4K).
- **Distinción real vs. emulación:** todas las pruebas de celular de esta entrega son **emulación** (viewport, táctil y user agent de iPhone 13 y Pixel 7 sobre Chromium). **No** se probó en Safari de iPhone ni Chrome de Android físicos; está en la lista de pendientes.

## Pendiente (requiere configuración externa)

1. **Infraestructura:** en este entorno no hay credenciales de hosting ni de Supabase, así que **no hay URL pública desplegada ni QR definitivo**. Falta: proyecto Supabase (o Postgres), servicio de contenedores, `PUBLIC_URL`/dominio y `SESSION_SECRET`.
2. **Imagen Docker:** el `Dockerfile` no se pudo construir aquí (no hay daemon de Docker); la app sí se compiló y probó en modo producción (`next build && next start`).
3. **Pruebas en dispositivos reales:** Safari en iPhone y Chrome en Android sobre la URL pública (firma con dedo, descarga/compartir de MP4, enlaces `mailto:` y `wa.me`).
4. **Contenido por confirmar:** horarios intermedios y panelistas marcados “por confirmar”.
5. **Instagram:** las tarjetas de @somos__mh y @eduardocontro muestran identidad y enlace al perfil real; Instagram no permite incrustar perfiles sin un token de su API (Meta). Para mostrar publicaciones reales se necesitaría una app de Meta y un token.
6. **Fuente primaria:** licencia de Bernino Sans si se quiere usar en lugar de Hind Siliguri.

Guía para el equipo durante el evento: [`docs/OPERACION.md`](docs/OPERACION.md).

## Estructura

```
everest/
├─ db/migrations/        001_init.sql (esquema, triggers, transiciones, vistas públicas) · 002_policies.sql (RLS)
├─ scripts/              migrate · seed · create-admin · prepare-video.sh · build-lettering.ts
├─ assets/               fuentes TTF (servidor) · video original 4K · fuente Anton para contornos
├─ public/               brand/ (logos oficiales) · contact/ (Gmail, WhatsApp, Instagram) · media/ (fotos, video ligero) · fonts/
├─ src/postcard/         compose.ts (módulo compartido) · render.ts (FFmpeg) · lettering.ts · brand-paths.ts
├─ src/lib/              db, live (LISTEN/SSE), auth, guest, rate, words, signature, render-worker…
├─ src/app/(public)/     Inicio · programa · tu-voz · libro · postal
├─ src/app/admin · src/app/pantalla · src/app/api/…
└─ tests/                unit · e2e · tools/render-sample.ts
```
