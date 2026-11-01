// Render de prueba fuera de la plataforma: npx tsx tests/tools/render-sample.ts <dir> <formato> ["<nombre opcional>"]
import { renderPostcard } from '../../src/postcard/render';
const [dir = '/tmp/postal', format = 'vertical', name = ''] = process.argv.slice(2);
const t = Date.now();
renderPostcard({ name, format: format as 'vertical' }, dir, (p) => process.stdout.write(`\r${Math.round(p * 100)}%`))
  .then((r) => console.log(`\nok ${((Date.now() - t) / 1000).toFixed(1)}s`, r.mp4, r.png))
  .catch((e) => { console.error(e); process.exit(1); });
