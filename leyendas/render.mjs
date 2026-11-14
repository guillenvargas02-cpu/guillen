// Renderiza la capa gráfica (index.html) a PNG RGBA, fotograma por fotograma.
// Uso: node render.mjs [--scale 2] [--at 3,7.5] [--out renders/overlay] [--workers 4]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const scale = +arg('scale', 2), out = resolve(here, arg('out', 'renders/overlay')), workers = +arg('workers', 4);
const at = arg('at', null);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(resolve(here, 'index.html')).href);
  await page.evaluate(() => window.ready);
  await page.waitForTimeout(200);
  return page;
}
const first = await openPage();
const meta = await first.evaluate(() => ({ SFX: window.SFX, SHAKES: window.SHAKES, TOTAL: window.TOTAL, FPS: window.FPS }));
writeFileSync(resolve(here, 'renders/events.json'), JSON.stringify(meta, null, 1));

let frames;
if (at) frames = at.split(',').map(s => ({ name: `at_${(+s).toFixed(2)}`, t: +s }));
else { const n = Math.round(meta.TOTAL * meta.FPS); frames = [...Array(n).keys()].map(i => ({ name: `f_${String(i).padStart(5, '0')}`, t: i / meta.FPS })); }

const pages = [first]; for (let w = 1; w < Math.min(workers, frames.length); w++) pages.push(await openPage());
let done = 0; const t0 = Date.now();
await Promise.all(pages.map(async (page, w) => {
  for (let i = w; i < frames.length; i += pages.length) {
    const fr = frames[i];
    await page.evaluate(t => window.seek(t), fr.t);
    await page.screenshot({ path: `${out}/${fr.name}.png`, omitBackground: true });
    if (++done % 50 === 0) console.log(`${done}/${frames.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/f`);
  }
}));
await browser.close();
console.log('ok', frames.length, 'frames →', out);
