import { q1 } from '@/lib/db';
import { readGuestId } from '@/lib/guest';
import { handle, HttpError, json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const guest = await readGuestId();
  const job = await q1<{ id: string; status: string; progress: number; attempts: number; error: string | null; format: string; created_at: Date; guest_id: string }>(
    `select id, status, progress, attempts, error, format, created_at, guest_id from render_jobs where id = $1`, [id],
  ).catch(() => null);
  if (!job || job.guest_id !== guest) throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos esta postal. Genérala de nuevo.');
  const ahead = job.status === 'queued'
    ? (await q1<{ n: number }>(`select count(*)::int as n from render_jobs where status in ('queued','rendering') and created_at < $1`, [job.created_at]))?.n ?? 0
    : 0;
  return json({
    ok: true, id: job.id, status: job.status, progress: job.progress, ahead, format: job.format,
    retrying: job.status === 'queued' && job.attempts > 0,
    error: job.status === 'failed' ? 'No pudimos generar la postal. Puedes intentarlo de nuevo.' : null,
  });
});
