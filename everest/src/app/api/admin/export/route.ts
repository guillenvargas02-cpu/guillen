import { q } from '@/lib/db';
import { audit, CAN, requireStaff } from '@/lib/auth';
import { handle, HttpError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Descargas para el equipo. Por defecto solo incluyen aportaciones AUTORIZADAS:
 *  - muro: aprobadas y con autorización de publicación
 *  - libro: aprobadas y con autorización para mostrarse; la firma solo si se autorizó publicarla
 *  - redes: solo libro/muro con autorización explícita de reutilización en redes (libro)
 *  - palabras: conteos aprobados por pregunta
 * Nunca incluye datos de demostración.
 */
function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return '﻿sin_datos\n';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

export const GET = handle(async (req: Request) => {
  const me = await requireStaff(CAN.exports);
  const u = new URL(req.url);
  const kind = u.searchParams.get('kind');
  const format = u.searchParams.get('format') === 'json' ? 'json' : 'csv';
  let rows: Record<string, unknown>[];
  if (kind === 'muro') {
    rows = await q(`select created_at, prompt as pregunta, display_name as nombre, body as mensaje, featured as destacado
                      from wall_messages where status = 'approved' and consent_public and not is_demo order by created_at`);
  } else if (kind === 'libro') {
    rows = await q(`select id, created_at, display_name as nombre, dedication as dedicatoria, consent_social as autoriza_redes,
                           case when consent_signature then signature_svg end as firma_svg
                      from guestbook_entries where status = 'approved' and consent_show and not is_demo order by created_at`);
    if (format === 'csv') rows = rows.map(({ firma_svg, ...r }) => ({ ...r, firma: firma_svg ? `/api/guestbook/${r.id}/signature` : '' }));
  } else if (kind === 'redes') {
    rows = await q(`select created_at, display_name as nombre, dedication as texto, 'libro' as origen,
                           case when consent_signature then signature_svg end as firma_svg
                      from guestbook_entries where consent_social and status = 'approved' and not is_demo order by created_at`);
    if (format === 'csv') rows = rows.map(({ firma_svg, ...r }) => ({ ...r, con_firma: !!firma_svg }));
  } else if (kind === 'palabras') {
    rows = await q(`select e.question as pregunta, coalesce(k.display, mode() within group (order by e.word_display)) as palabra, count(*)::int as aportaciones
                      from word_entries e join word_keys k on k.question = e.question and k.key = e.word_key and k.status = 'approved'
                     where not e.is_demo group by e.question, e.word_key, k.display order by e.question, aportaciones desc`);
  } else {
    throw new HttpError(400, 'TIPO', 'Tipo de descarga desconocido.');
  }
  await audit(me, 'export', kind, { format, n: rows.length });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const body = format === 'json' ? JSON.stringify(rows, null, 2) : csv(rows);
  return new Response(body, {
    headers: {
      'Content-Type': format === 'json' ? 'application/json; charset=utf-8' : 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="everest-${kind}-${stamp}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
});
