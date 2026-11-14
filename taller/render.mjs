// Render determinista: abre index.html, llama window.__seek(t) por cuadro y entrega PNG a ffmpeg.
// Uso:
//   node render.mjs --snap 1,7.6,12 [--scale 1]        -> renders/snap-<t>.png
//   node render.mjs --video renders/visual.mp4 [--scale 2] [--from 0 --to 29.5]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? a.concat([[v.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]]) : a), []));
const FPS = 30, scale = +(args.scale || 1), JPEG = !!args.jpeg;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".webp": "image/webp", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/${args.page || "index.html"}`;

const browser = await chromium.launch({ args: ["--disable-web-security", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
page.on("console", m => { if (m.type() === "error") console.error("[page]", m.text()); });
page.on("pageerror", e => console.error("[pageerror]", e.message));
await page.goto(url);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const stage = await page.$("#stage");
fs.mkdirSync(path.join(ROOT, "renders"), { recursive: true });

if (args.snap) {
  for (const t of String(args.snap).split(",").map(Number)) {
    await page.evaluate(t => window.__seek(t), t);
    const f = path.join(ROOT, "renders", `${args.prefix || "snap"}-${t.toFixed(2)}.png`);
    await stage.screenshot({ path: f }); console.log(f);
  }
} else {
  const from = +(args.from || 0), to = +(args.to || await page.evaluate(() => window.__duration));
  const out = path.resolve(args.video || path.join(ROOT, "renders", "visual.mp4"));
  const n = Math.round((to - from) * FPS);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", JPEG ? "mjpeg" : "png", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", "-r", String(FPS), out], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = from + i / FPS;
    await page.evaluate(t => window.__seek(t), t);
    const buf = await stage.screenshot(JPEG ? { type: "jpeg", quality: 94 } : { type: "png" });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 30 === 0) process.stdout.write(`\r${i}/${n} cuadros · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  console.log(`\n${out}`);
}
await browser.close(); server.close();
