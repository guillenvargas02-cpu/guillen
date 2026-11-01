import QRCode from 'qrcode';
import { publicUrl } from '@/lib/public-url';
export const runtime = 'nodejs';
export async function GET(req: Request) {
  const svg = await QRCode.toString(publicUrl(req), { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#0F0F0F', light: '#FFFFFF' } });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=300' } });
}
