// Almacenamiento de postales generadas.
// - Por defecto: disco local (RENDER_DIR).
// - Con SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY: Supabase Storage, bucket privado
//   (SUPABASE_BUCKET, "postales" por defecto). Las descargas usan enlaces firmados de
//   corta duración; la llave de servicio nunca sale del servidor.
// Sin 'server-only' para poder usarlo también desde los scripts de verificación.

export const STORAGE_PREFIX = 'supabase:';

export function supabaseStorage() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const bucket = process.env.SUPABASE_BUCKET || 'postales';
  const headers = (extra: Record<string, string> = {}) => ({
    apikey: key,
    // Llaves JWT (service_role) van también en Authorization; las nuevas sb_secret_ solo en apikey.
    ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }),
    ...extra,
  });
  const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');

  async function check(res: Response, what: string) {
    if (!res.ok) throw new Error(`Supabase Storage (${what}) respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res;
  }

  return {
    url, bucket,
    async ensureBucket() {
      const r = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers: headers() });
      if (r.ok) return 'existente';
      const c = await fetch(`${url}/storage/v1/bucket`, {
        method: 'POST', headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id: bucket, name: bucket, public: false, file_size_limit: 52428800, allowed_mime_types: ['video/mp4', 'image/png'] }),
      });
      await check(c, 'crear bucket');
      return 'creado';
    },
    async upload(path: string, body: Uint8Array, contentType: string) {
      const r = await fetch(`${url}/storage/v1/object/${bucket}/${enc(path)}`, {
        method: 'POST', headers: headers({ 'Content-Type': contentType, 'x-upsert': 'true', 'cache-control': '3600' }),
        body: body as unknown as BodyInit,
      });
      await check(r, 'subir');
      return STORAGE_PREFIX + path;
    },
    async signedUrl(path: string, expiresIn = 600, download?: string) {
      const r = await fetch(`${url}/storage/v1/object/sign/${bucket}/${enc(path)}`, {
        method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ expiresIn }),
      });
      await check(r, 'firmar');
      const j = (await r.json()) as { signedURL?: string; signedUrl?: string };
      const rel = j.signedURL ?? j.signedUrl;
      if (!rel) throw new Error('Supabase Storage no devolvió un enlace firmado');
      const full = rel.startsWith('http') ? rel : `${url}/storage/v1${rel.startsWith('/') ? '' : '/'}${rel}`;
      return download ? `${full}${full.includes('?') ? '&' : '?'}download=${encodeURIComponent(download)}` : full;
    },
    async remove(paths: string[]) {
      if (!paths.length) return;
      const r = await fetch(`${url}/storage/v1/object/${bucket}`, {
        method: 'DELETE', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: paths }),
      });
      await check(r, 'borrar');
    },
  };
}
