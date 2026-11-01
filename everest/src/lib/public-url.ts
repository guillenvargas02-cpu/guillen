import 'server-only';
/** URL pública única de la plataforma (la que codifica el QR). */
export function publicUrl(req?: Request): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '') + '/';
  if (req) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}/`;
  }
  return 'http://localhost:3000/';
}
