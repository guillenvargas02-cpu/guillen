export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.DATABASE_URL) {
    console.warn('[everest] DATABASE_URL no está configurado: la plataforma no podrá guardar datos.');
    return;
  }
  const { supabaseStorage } = await import('./lib/storage');
  const storage = supabaseStorage();
  if (storage) {
    storage.ensureBucket()
      .then((r) => console.log(`[storage] Supabase Storage listo (bucket "${storage.bucket}" ${r})`))
      .catch((e) => console.error('[storage] no se pudo preparar el bucket:', e.message));
  }
  if (process.env.RENDER_WORKER !== 'off') {
    const { startRenderWorker } = await import('./lib/render-worker');
    startRenderWorker();
  }
}
