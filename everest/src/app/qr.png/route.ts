import QRCode from 'qrcode';
import { publicUrl } from '@/lib/public-url';
export const runtime = 'nodejs';
export async function GET(req: Request) {
  const png = await QRCode.toBuffer(publicUrl(req), { type: 'png', errorCorrectionLevel: 'M', margin: 2, width: 1200, color: { dark: '#0F0F0F', light: '#FFFFFF' } });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' } });
}
