import { q1 } from '@/lib/db';
import { currentStaff, CAN } from '@/lib/auth';
import { readGuestId } from '@/lib/guest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Firma como SVG. Pública SOLO si la entrada está aprobada, autorizada para mostrarse
 * y con permiso explícito para publicar la firma. El equipo (moderación) y la propia
 * persona que firmó pueden verla siempre.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('No encontrado', { status: 404 });
  const row = await q1<{ signature_svg: string | null; public: boolean; guest_id: string }>(
    `select g.signature_svg, g.guest_id,
            (g.status = 'approved' and g.consent_show and g.consent_signature and (not g.is_demo or s.show_demo)) as public
       from guestbook_entries g, event_settings s where g.id = $1`, [id],
  );
  if (!row?.signature_svg) return new Response('No encontrado', { status: 404 });
  let allowed = row.public;
  if (!allowed) {
    const staff = await currentStaff();
    allowed = !!staff && CAN.moderate.includes(staff.role);
  }
  if (!allowed) allowed = (await readGuestId()) === row.guest_id;
  if (!allowed) return new Response('No encontrado', { status: 404 });
  return new Response(row.signature_svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': row.public ? 'public, max-age=60' : 'private, no-store',
    },
  });
}
