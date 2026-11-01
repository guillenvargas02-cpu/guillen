export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.DATABASE_URL) {
    console.warn('[everest] DATABASE_URL no está configurado: la plataforma no podrá guardar datos.');
    return;
  }
  if (process.env.RENDER_WORKER !== 'off') {
    const { startRenderWorker } = await import('./lib/render-worker');
    startRenderWorker();
  }
}
