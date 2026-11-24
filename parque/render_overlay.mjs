// Renderiza overlay/index.html cuadro a cuadro (PNG con transparencia) a renders/overlay/
// Uso: node render_overlay.mjs [desde_s] [hasta_s]      (por defecto, todo el video)
//      node render_overlay.mjs --snap 1.0 12.3 ...       (cuadros sueltos a renders/snap_*.png)
import { createRequire } from "module";
import { mkdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const WORKERS = 4;
const url = pathToFileURL(path.join(ROOT, "overlay/index.html")).href;
const outDir = path.join(ROOT, "renders/overlay");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(url);
  await page.evaluate(async () => {
    await window.READY;
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = r)))));
  });
  return page;
}

const args = process.argv.slice(2);
if (args[0] === "--snap") {
  const page = await openPage();
  for (const t of args.slice(1)) {
    await page.evaluate((t) => window.seek(t), parseFloat(t));
    await page.screenshot({ path: path.join(ROOT, `renders/snap_${t}.png`), omitBackground: true });
  }
  await browser.close();
  process.exit(0);
}

const page0 = await openPage();
const dur = await page0.evaluate(() => window.DURATION);
await page0.close();
const from = Math.round(parseFloat(args[0] ?? 0) * FPS);
const to = Math.round(parseFloat(args[1] ?? dur) * FPS);
const frames = [];
for (let f = from; f < to; f++) frames.push(f);
const chunk = Math.ceil(frames.length / WORKERS);
const t0 = Date.now();
await Promise.all(
  Array.from({ length: WORKERS }, async (_, w) => {
    const mine = frames.slice(w * chunk, (w + 1) * chunk);
    if (!mine.length) return;
    const page = await openPage();
    for (const f of mine) {
      await page.evaluate((t) => window.seek(t), f / FPS);
      await page.screenshot({ path: path.join(outDir, String(f + 1).padStart(5, "0") + ".png"), omitBackground: true });
      if (f % 60 === 0) console.log(`cuadro ${f} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  })
);
console.log(`listo: ${frames.length} cuadros en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
await browser.close();
