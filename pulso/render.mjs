// Renderiza la animación a PNG (un archivo por fotograma) con Chromium headless.
// Uso: node render.mjs --scale 4 --fps 60 --out renders/frames8k [--workers 4] [--times 1,2.5] [--from 0 --to 599]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]);
  return a;
}, []));
const scale = Number(args.scale ?? 1);
const fps = Number(args.fps ?? 60);
const out = path.resolve(ROOT, args.out ?? 'renders/frames');
const workers = Number(args.workers ?? 4);
fs.mkdirSync(out, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const W = Math.round(1920 * scale), H = Math.round(1080 * scale);

let jobs;
if (args.times) {
  jobs = args.times.split(',').map((s) => ({ t: Number(s), name: `t${Number(s).toFixed(2)}.png` }));
} else {
  const total = Math.round(10 * fps);
  const from = Number(args.from ?? 0), to = Number(args.to ?? total - 1);
  jobs = [];
  for (let i = from; i <= to; i++) jobs.push({ t: i / fps, name: `f${String(i).padStart(5, '0')}.png` });
}
const pipe = args.pipe === '1';   // escribe PNG ordenados a stdout (para ffmpeg) en vez de archivos
if (!pipe) jobs = jobs.filter((j) => !fs.existsSync(path.join(out, j.name)));
const log = (...a) => (pipe ? console.error : console.log)(...a);
const pending = new Map();
let nextOut = 0;
async function emit(idx, buf) {
  pending.set(idx, buf);
  while (pending.has(nextOut)) {
    const b = pending.get(nextOut); pending.delete(nextOut); nextOut++;
    if (!process.stdout.write(b)) await new Promise((r) => process.stdout.once('drain', r));
  }
}
log(`${jobs.length} fotogramas a ${W}x${H}`);

let next = 0, done = 0;
const t0 = Date.now();
async function worker() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => console.error('[page]', m.text()));
  page.on('pageerror', (e) => console.error('[pageerror]', e));
  await page.goto(url);
  await page.evaluate((s) => window.PULSO.setup(s), scale);
  const cdp = await page.context().newCDPSession(page);
  while (next < jobs.length) {
    const idx = next++;
    const job = jobs[idx];
    while (pipe && idx - nextOut > workers * 3) await new Promise((r) => setTimeout(r, 50));
    await page.evaluate(([t, o]) => window.PULSO.renderFrame(t, o), [job.t, { noCam: args.nocam === '1' }]);
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png', optimizeForSpeed: true, captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
    });
    if (pipe) await emit(idx, Buffer.from(data, 'base64'));
    else fs.writeFileSync(path.join(out, job.name), Buffer.from(data, 'base64'));
    done++;
    if (done % 10 === 0 || done === jobs.length) {
      const el = (Date.now() - t0) / 1000;
      log(`${done}/${jobs.length}  ${(el / done).toFixed(2)} s/fotograma  ~${((jobs.length - done) * el / done / 60).toFixed(1)} min restantes`);
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, worker));
await browser.close();
server.close();
