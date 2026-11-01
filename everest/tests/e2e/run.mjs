// Pruebas de punta a punta (Chromium real vía Playwright + emulación de iPhone / Android).
//   BASE_URL=http://localhost:3000 DATABASE_URL=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run test:e2e
// ¡Reinicia los datos de participación de la base indicada! Úsalo solo en desarrollo/pruebas.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright')); }
const { chromium, devices } = pw;
const pg = require('pg');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@everest.local', password: process.env.ADMIN_PASSWORD || 'cima-2026-admin' };
const OUT = process.env.E2E_OUT || path.join(os.tmpdir(), 'everest-e2e');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? '✔' : '✘'} ${name}${extra ? ' — ' + extra : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tap(loc) { await loc.evaluate((e) => e.scrollIntoView({ block: 'center' })); await loc.click(); }
async function until(fn, ms = 8000, step = 150) { const t = Date.now(); while (Date.now() - t < ms) { try { if (await fn()) return true; } catch {} await sleep(step); } return false; }

const db = new pg.Client({ connectionString: process.env.DATABASE_URL || 'postgres://everest:everest@localhost:5432/everest' });
await db.connect();
await db.query(`truncate wall_messages, word_entries, word_keys, guestbook_entries, render_jobs, notices, rate_hits`);
await db.query(`update program_items set status='pending', actual_start_at=null, actual_end_at=null, paused_at=null, schedule_changed_at=null`);
await db.query(`update event_settings set concluded_at=null, show_demo=false, wall_open=true, words_somos_open=true, words_night_open=true, guestbook_open=true, postal_open=true`);

const browser = await chromium.launch();
const admin = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const iphone = await browser.newContext({ ...devices['iPhone 13'] });
const android = await browser.newContext({ ...devices['Pixel 7'] });
const A = await admin.newPage(), P1 = await iphone.newPage(), P2 = await android.newPage();
for (const p of [A, P1, P2]) p.on('pageerror', (e) => console.log('  [pageerror]', e.message));

const rpc = (op, args) => A.evaluate(async ([op, args]) => (await fetch('/api/admin/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op, args }) })).json(), [op, args]);

// ── 1. Programa en vivo: admin + dos dispositivos públicos ──
await A.goto(`${BASE}/admin`);
await A.fill('#em', ADMIN.email); await A.fill('#pw', ADMIN.password); await A.click('button:has-text("Entrar")');
ok('Admin: inicio de sesión', await until(() => A.isVisible('text=EVEREST · Panel')));
await P1.goto(`${BASE}/`); await P2.goto(`${BASE}/programa`);
ok('Público: "El evento aún no inicia" antes de iniciar', await until(() => P1.isVisible('text=El evento aún no inicia')));
const items = (await db.query(`select id, title from program_items order by position`)).rows;
await A.click('.admin-item >> nth=0 >> button:has-text("Iniciar")');
ok('iPhone ve "Está pasando ahora" sin recargar', await until(() => P1.isVisible(`text=Está pasando ahora`)));
ok('Android ve la actividad en curso en Programa', await until(async () => (await P2.locator('.tl-item--live .tl-title').innerText()) === items[0].title));
// Regla de una sola actividad (servidor)
const r2 = await rpc('program.transition', { id: items[1].id, action: 'start' });
ok('Servidor rechaza segunda actividad en curso', r2.ok === false && r2.code === 'OTRA_EN_CURSO');
const r3 = await rpc('program.transition', { id: items[1].id, action: 'start', finish_current: true });
ok('Iniciar terminando la actual', r3.ok === true);
const live = (await db.query(`select count(*)::int n from program_items where status in ('live','paused')`)).rows[0].n;
ok('Exactamente una actividad en curso en la base', live === 1);
ok('Ambos dispositivos muestran la nueva actividad', await until(async () => (await P1.locator('#now-title').innerText()) === items[1].title && (await P2.locator('.tl-item--live .tl-title').innerText()) === items[1].title));
await rpc('program.transition', { id: items[1].id, action: 'pause' });
ok('Pausa visible en público', await until(() => P1.isVisible('text=En pausa')));
await rpc('program.transition', { id: items[1].id, action: 'resume' });
// Cambio de horario
const cur2 = (await db.query(`select to_char(planned_start at time zone 'America/Mexico_City', 'HH24:MI') s from program_items where id = $1`, [items[2].id])).rows[0].s;
const newStart = cur2 === '18:40' ? '18:45' : '18:40';
await rpc('program.update', { id: items[2].id, title: items[2].title, description: '', participants: [], participants_note: '', planned_start: `2026-11-03T${newStart}`, planned_end: '2026-11-03T19:10', schedule_note: '', mark_change: true });
ok('Cambio de horario visible sin recargar', await until(() => P2.isVisible('text=Cambio de horario')));
// Aviso
await rpc('notice.create', { body: 'El panel inicia en 5 minutos en el Salón República.', tone: 'importante', published: true });
ok('Aviso publicado aparece en Inicio', await until(() => P1.isVisible('text=El panel inicia en 5 minutos')));

// ── 2. Reconexión: sin red → aviso de datos desactualizados → recupera estado ──
await iphone.setOffline(true);
await P1.evaluate(() => window.dispatchEvent(new Event('offline')));
ok('Sin conexión: se avisa que los datos pueden estar desactualizados', await until(() => P1.isVisible('text=pueden estar')));
await rpc('program.transition', { id: items[1].id, action: 'finish' });
await rpc('program.transition', { id: items[2].id, action: 'start' });
await iphone.setOffline(false);
await P1.evaluate(() => window.dispatchEvent(new Event('online')));
ok('Al reconectar recupera el estado vigente', await until(async () => (await P1.locator('#now-title').innerText()) === items[2].title, 15000));

// ── 3. Muro: envío, confirmación real, sin duplicados tras fallo, moderación y privacidad ──
await P1.goto(`${BASE}/tu-voz`);
const longName = 'María Fernanda de los Ángeles Ñúñez-Güemes';
await P1.fill('#muro input.input', longName);
await P1.fill('#muro textarea', 'Me llevo la certeza de que la cima se construye en equipo. ¡Gracias, SOMOS! ñ á é í ó ú ü');
await P1.check('#muro input[type=checkbox]');
// Simula pérdida de red al enviar: el texto se conserva
await iphone.setOffline(true);
await P1.click('#muro button:has-text("Enviar")');
ok('Fallo de red: se informa y el texto se conserva', await until(() => P1.isVisible('text=No se envió')) && (await P1.inputValue('#muro textarea')).includes('cima'));
await iphone.setOffline(false);
// Al volver la señal se reintenta solo (mismo client_id); si no, se usa "Reintentar".
await P1.evaluate(() => window.dispatchEvent(new Event('online')));
if (!(await until(() => P1.isVisible('text=Recibido'), 3000))) await P1.click('#muro button:has-text("Reintentar")').catch(() => {});
ok('Reintento: confirmación real del servidor', await until(() => P1.isVisible('text=Recibido')));
await P1.evaluate(() => window.dispatchEvent(new Event('online')));
await sleep(800);
const wallCount = (await db.query(`select count(*)::int n from wall_messages`)).rows[0].n;
ok('Sin envíos duplicados', wallCount === 1, `filas=${wallCount}`);
// Mensaje privado desde Android
await P2.goto(`${BASE}/tu-voz`);
await P2.fill('#muro input.input', 'Privado');
await P2.fill('#muro textarea', 'Mensaje solo para el equipo XYZPRIV');
await P2.click('#muro button:has-text("Enviar")');
await until(() => P2.isVisible('text=Solo lo verá el equipo'));
let snap = await (await fetch(`${BASE}/api/snapshot`)).text();
ok('Pendientes no salen por la API pública', !snap.includes('cima se construye en equipo'));
ok('Privados no salen por la API pública', !snap.includes('XYZPRIV'));
const ids = (await db.query(`select id, consent_public from wall_messages`)).rows;
const priv = ids.find((x) => !x.consent_public), pub = ids.find((x) => x.consent_public);
const rp = await rpc('mod.wall', { id: priv.id, action: 'approve' });
ok('Servidor impide publicar mensaje no autorizado', rp.ok === false);
await rpc('mod.wall', { id: pub.id, action: 'feature' });
ok('Aprobado y destacado aparece en el muro sin recargar', await until(() => P2.isVisible('.msg--featured >> text=cima se construye')));
const S = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await S.goto(`${BASE}/pantalla`);
ok('Pantalla del salón muestra el mensaje aprobado', await until(() => S.isVisible('text=cima se construye')));
ok('Pantalla no muestra el privado', !(await S.content()).includes('XYZPRIV'));
await S.screenshot({ path: path.join(OUT, 'pantalla.png') });

// ── 4. Palabras: dos preguntas, conteos separados, actualizar sin duplicar, validación ──
await P1.goto(`${BASE}/tu-voz?palabras`);
const somosBox = P1.locator('.word-box').nth(0), nocheBox = P1.locator('.word-box').nth(1);
await somosBox.locator('input').fill('esta es una frase');
ok('Explica amablemente si es una frase', await until(() => somosBox.locator('text=Parece una frase').isVisible()));
await somosBox.locator('input').fill('  UNIÓN ');
await somosBox.locator('input').press('Enter');
await until(() => somosBox.locator('text=Tu palabra').isVisible());
await tap(somosBox.locator('button:has-text("Cambiar")'));
await somosBox.locator('input').fill('Comunidad');
await somosBox.locator('input').press('Enter');
await until(() => somosBox.locator('b:has-text("Comunidad")').isVisible());
await nocheBox.locator('input').fill('Año');
await nocheBox.locator('input').press('Enter');
await P2.goto(`${BASE}/tu-voz?palabras`);
const s2 = P2.locator('.word-box').nth(0), n2 = P2.locator('.word-box').nth(1);
await s2.locator('input').fill('comunidad'); await s2.locator('input').press('Enter');
await until(() => s2.locator('text=Tu palabra').isVisible());
await n2.locator('input').fill('ano'); await n2.locator('input').press('Enter');
await sleep(600);
for (const [q, k] of [['somos', 'comunidad'], ['somos', 'unión'], ['noche', 'año'], ['noche', 'ano']]) await rpc('mod.word', { question: q, key: k, action: 'approve' });
const w = await until(async () => {
  const j = await (await fetch(`${BASE}/api/snapshot?t=words`)).json();
  const s = Object.fromEntries(j.words.somos.map((x) => [x.key, x.n])), n = Object.fromEntries(j.words.noche.map((x) => [x.key, x.n]));
  return s.comunidad === 2 && !s['unión'] && n['año'] === 1 && n.ano === 1 && !n.comunidad;
});
ok('Conteos separados por pregunta, mayúsculas agrupadas, "año" ≠ "ano", actualizar no suma', w);
ok('Nube visible en ambos dispositivos', await until(() => P2.locator('.cloud li:has-text("Comunidad")').isVisible()));

// ── 5. Libro: firma con mouse (escritorio) y táctil (Android), consentimientos y privacidad ──
const D = await admin.newPage();
await D.goto(`${BASE}/libro`);
await D.fill('form input.input', 'Ana López');
await D.fill('form textarea', 'Gracias por una noche que nos acerca a la cima.');
const c = await D.locator('.sigpad canvas').boundingBox();
await D.mouse.move(c.x + 30, c.y + c.height * 0.6); await D.mouse.down();
for (let i = 0; i <= 30; i++) await D.mouse.move(c.x + 30 + i * 12, c.y + c.height * (0.6 - Math.sin(i / 4) * 0.25));
await D.mouse.up();
await D.click('button:has-text("Deshacer")');
ok('Deshacer elimina el trazo', await until(() => D.isVisible('text=Firma aquí')));
await D.mouse.move(c.x + 30, c.y + c.height * 0.6); await D.mouse.down();
for (let i = 0; i <= 30; i++) await D.mouse.move(c.x + 30 + i * 12, c.y + c.height * (0.6 - Math.sin(i / 4) * 0.25));
await D.mouse.up();
await D.click('button:has-text("Confirmar firma")');
const boxes = D.locator('.consents input[type=checkbox]');
ok('Consentimientos inician desmarcados', !(await boxes.nth(0).isChecked()) && !(await boxes.nth(1).isChecked()) && !(await boxes.nth(2).isChecked()));
await boxes.nth(0).check(); // mostrar, pero firma privada
await D.click('button:has-text("Firmar el libro")');
ok('Libro: confirmación', await until(() => D.isVisible('text=Gracias por firmar')));
// Táctil en Android: el trazo no desplaza la página
await P2.goto(`${BASE}/libro`);
await P2.fill('form input.input', 'Luis Ángel');
await P2.fill('form textarea', 'Desde la cima, con cariño.');
const cv = P2.locator('.sigpad canvas');
await cv.scrollIntoViewIfNeeded();
const yBefore = await P2.evaluate(() => window.scrollY);
const bb = await cv.boundingBox();
const cdp = await android.newCDPSession(P2);
const pts = Array.from({ length: 20 }, (_, i) => ({ x: bb.x + 20 + i * 14, y: bb.y + bb.height * 0.3 + i * 4 }));
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
for (const p of pts.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await sleep(200);
const yAfter = await P2.evaluate(() => window.scrollY);
const strokes = await P2.evaluate(() => JSON.parse(localStorage.getItem('everest:borrador:libro') || '{}').strokes?.length ?? 0);
ok('Firma táctil registrada sin desplazar la página', strokes === 1 && Math.abs(yAfter - yBefore) < 2, `trazos=${strokes} scroll Δ=${yAfter - yBefore}`);
await P2.setViewportSize({ width: 915, height: 412 }); await sleep(300);
const strokesRot = await P2.evaluate(() => JSON.parse(localStorage.getItem('everest:borrador:libro') || '{}').strokes?.length ?? 0);
ok('La firma se conserva al girar el dispositivo', strokesRot === 1);
await P2.setViewportSize({ width: 412, height: 915 });
await P2.click('button:has-text("Confirmar firma")');
const b2 = P2.locator('.consents input[type=checkbox]');
await b2.nth(0).check(); await b2.nth(1).check();
await P2.click('button:has-text("Firmar el libro")');
await until(() => P2.isVisible('text=Gracias por firmar'));
const gb = (await db.query(`select id, display_name, consent_signature from guestbook_entries`)).rows;
for (const g of gb) await rpc('mod.guestbook', { id: g.id, action: 'approve' });
const ana = gb.find((g) => g.display_name === 'Ana López'), luis = gb.find((g) => g.display_name === 'Luis Ángel');
const anon = await fetch(`${BASE}/api/guestbook/${ana.id}/signature`);
ok('Firma no autorizada no es pública', anon.status === 404);
const pubSig = await fetch(`${BASE}/api/guestbook/${luis.id}/signature`);
const svg = await pubSig.text();
ok('Firma autorizada se sirve como SVG seguro y recortado', pubSig.status === 200 && svg.startsWith('<svg') && !/script|on\w+=/i.test(svg) && pubSig.headers.get('content-security-policy')?.includes("default-src 'none'"));
const staffSig = await A.evaluate(async (id) => (await fetch(`/api/guestbook/${id}/signature`)).status, ana.id);
ok('El equipo sí ve la firma privada', staffSig === 200);

// ── 6. Postal: generar en servidor desde el celular, descargar y verificar fuera de la plataforma ──
await P1.goto(`${BASE}/postal`);
await P1.fill('#' + (await P1.locator('.step input.input').getAttribute('id')).replace(/:/g, '\\:'), longName);
await P1.locator('.step textarea').fill('La cima se construye en equipo.');
ok('Previsualización lista (fuentes + video)', await until(() => P1.isVisible('text=Así se verá tu video'), 15000));
await P1.screenshot({ path: path.join(OUT, 'postal-preview.png') });
await P1.click('button:has-text("Generar mi postal")');
ok('Progreso visible', await until(() => P1.isVisible('[role=progressbar]'), 5000));
ok('Postal generada', await until(() => P1.isVisible('a:has-text("Video MP4")'), 120000));
const [dl] = await Promise.all([P1.waitForEvent('download'), P1.click('a:has-text("Video MP4")')]);
const mp4 = path.join(OUT, 'postal.mp4'); await dl.saveAs(mp4);
const [dl2] = await Promise.all([P1.waitForEvent('download'), P1.click('a:has-text("Imagen PNG")')]);
const png = path.join(OUT, 'postal.png'); await dl2.saveAs(png);
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', mp4]).toString());
const v = probe.streams.find((s) => s.codec_type === 'video');
ok('MP4 real: H.264, yuv420p, 1080×1920, 30 fps, 8 s, sin audio',
  v.codec_name === 'h264' && v.pix_fmt === 'yuv420p' && v.width === 1080 && v.height === 1920 && v.r_frame_rate === '30/1' && Math.abs(Number(probe.format.duration) - 8) < 0.05 && !probe.streams.some((s) => s.codec_type === 'audio') && probe.format.format_name.includes('mp4'),
  `${v.codec_name} ${v.pix_fmt} ${v.width}x${v.height} ${v.r_frame_rate} ${probe.format.duration}s`);
ok('PNG real', fs.readFileSync(png).subarray(1, 4).toString() === 'PNG');
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ mp4, png }, null, 2));

await browser.close();
await db.end();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} pruebas superadas. Evidencias en ${OUT}`);
process.exit(failed.length ? 1 : 0);
