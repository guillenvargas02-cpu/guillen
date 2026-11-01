import fs from 'node:fs';
import { Readable } from 'node:stream';
import { q1 } from '@/lib/db';
import { readGuestId } from '@/lib/guest';
import { renderFilePath } from '@/lib/render-worker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = new URL(req.url).searchParams.get('type') === 'png' ? 'png' : 'mp4';
  const inline = new URL(req.url).searchParams.has('inline');
  const guest = await readGuestId();
  const job = await q1<{ output_mp4: string | null; output_png: string | null; guest_id: string; params: { name: string; format: string } }>(
    `select output_mp4, output_png, guest_id, params from render_jobs where id = $1 and status = 'done'`, [id],
  ).catch(() => null);
  if (!job || job.guest_id !== guest) return new Response('No encontrado', { status: 404 });
  const rel = type === 'png' ? job.output_png : job.output_mp4;
  if (!rel) return new Response('No encontrado', { status: 404 });
  const file = renderFilePath(rel);
  if (!fs.existsSync(file)) return new Response('El archivo expiró. Genera la postal de nuevo.', { status: 410 });
  const stat = fs.statSync(file);
  const slug = job.params.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 40) || 'invitado';
  const filename = `postal-everest-${slug}-${job.params.format}.${type}`;
  const headers: Record<string, string> = {
    'Content-Type': type === 'png' ? 'image/png' : 'video/mp4',
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${filename}"`,
    'Cache-Control': 'private, max-age=3600',
    'Accept-Ranges': 'bytes',
  };
  // Soporte de rangos (Safari en iPhone los exige para reproducir video).
  const range = req.headers.get('range');
  const m = range && /bytes=(\d*)-(\d*)/.exec(range);
  if (m) {
    const start = m[1] ? Number(m[1]) : 0;
    const end = m[2] ? Math.min(Number(m[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(end - start + 1) } });
  }
  const stream = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, 'Content-Length': String(stat.size) } });
}
