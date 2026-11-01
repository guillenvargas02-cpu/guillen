import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { q, q1 } from './db';
import type { PostcardInput } from '@/postcard/compose';

/**
 * Cola de render de postales.
 * - Persistente en PostgreSQL (render_jobs); varias instancias pueden compartirla
 *   (FOR UPDATE SKIP LOCKED), cada una con su propio límite de concurrencia.
 * - Reintentos: hasta MAX_ATTEMPTS; trabajos atascados se recuperan tras 5 min.
 * - Archivos en RENDER_DIR; se eliminan pasado RENDER_TTL_HOURS.
 */
export const RENDER_DIR = path.resolve(process.env.RENDER_DIR || '.data/renders');
const CONCURRENCY = Math.max(1, Number(process.env.RENDER_CONCURRENCY ?? 1));
const MAX_ATTEMPTS = 3;
const TTL_HOURS = Number(process.env.RENDER_TTL_HOURS ?? 72);
const WORKER_ID = `${os.hostname()}:${process.pid}`;
let lastErr = 0;

type G = typeof globalThis & { __everestWorker?: { running: number; timer?: NodeJS.Timeout } };

export function startRenderWorker() {
  const g = globalThis as G;
  if (g.__everestWorker) return;
  g.__everestWorker = { running: 0 };
  fs.mkdirSync(RENDER_DIR, { recursive: true });
  const tick = async () => {
    const st = g.__everestWorker!;
    try {
      while (st.running < CONCURRENCY) {
        const job = await claim();
        if (!job) break;
        st.running++;
        process1(job).finally(() => { st.running--; setImmediate(tick); });
      }
      if (Math.random() < 0.01) cleanup().catch(() => {});
    } catch (e) {
      const now = Date.now();
      if (now - lastErr > 60_000) { lastErr = now; console.error('[render] error en la cola:', (e as Error).message); }
    }
  };
  g.__everestWorker.timer = setInterval(tick, 1000);
  console.log(`[render] trabajador activo (${WORKER_ID}, concurrencia ${CONCURRENCY})`);
}

type Job = { id: string; params: PostcardInput; attempts: number };

async function claim(): Promise<Job | null> {
  return q1<Job>(
    `update render_jobs set status = 'rendering', locked_by = $1, locked_at = now(),
            started_at = coalesce(started_at, now()), attempts = attempts + 1, progress = 0
      where id = (
        select id from render_jobs
         where (status = 'queued') or (status = 'rendering' and locked_at < now() - interval '5 minutes')
         order by created_at
         for update skip locked
         limit 1)
      returning id, params, attempts`,
    [WORKER_ID],
  );
}

async function process1(job: Job) {
  const outDir = path.join(RENDER_DIR, job.id);
  let last = 0;
  try {
    const { renderPostcard } = await import('@/postcard/render');
    const r = await renderPostcard(job.params, outDir, (p) => {
      if (p - last >= 0.08 || p === 1) {
        last = p;
        q(`update render_jobs set progress = $2, locked_at = now() where id = $1`, [job.id, p]).catch(() => {});
      }
    });
    await q(
      `update render_jobs set status = 'done', progress = 1, output_mp4 = $2, output_png = $3, finished_at = now(), error = null where id = $1`,
      [job.id, path.relative(RENDER_DIR, r.mp4), path.relative(RENDER_DIR, r.png)],
    );
  } catch (e) {
    const msg = (e as Error).message.slice(0, 500);
    console.error(`[render] ${job.id} intento ${job.attempts}:`, msg);
    await q(
      `update render_jobs set status = $2, error = $3, locked_by = null, finished_at = case when $2 = 'failed' then now() end where id = $1`,
      [job.id, job.attempts >= MAX_ATTEMPTS ? 'failed' : 'queued', msg],
    );
  }
}

async function cleanup() {
  const old = await q<{ id: string }>(
    `delete from render_jobs where created_at < now() - make_interval(hours => $1) returning id`, [TTL_HOURS],
  );
  for (const { id } of old) fs.rmSync(path.join(RENDER_DIR, id), { recursive: true, force: true });
}

export function renderFilePath(rel: string) {
  const p = path.resolve(RENDER_DIR, rel);
  if (!p.startsWith(RENDER_DIR + path.sep)) throw new Error('Ruta inválida');
  return p;
}
