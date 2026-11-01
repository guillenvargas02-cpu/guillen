import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init?.headers ?? {}) },
  });
}

export function fail(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return json({ ok: false, code, message, ...extra }, { status });
}

/** Protección CSRF básica: las escrituras deben venir del mismo origen. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return; // navegadores antiguos / herramientas del mismo servidor
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'ORIGEN', 'Solicitud no permitida.');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, 'ORIGEN', 'Solicitud no permitida.');
  }
}

export async function readJson(req: Request, maxBytes = 200_000): Promise<unknown> {
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > maxBytes) throw new HttpError(413, 'DEMASIADO_GRANDE', 'El contenido es demasiado grande.');
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'DEMASIADO_GRANDE', 'El contenido es demasiado grande.');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'JSON', 'No pudimos leer la solicitud.');
  }
}

export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.status, e.code, e.message, e.extra);
      if (e instanceof ZodError) {
        const first = e.issues[0];
        return fail(422, 'VALIDACION', first?.message || 'Revisa los datos.', { field: first?.path.join('.') });
      }
      console.error('[api]', e);
      return fail(500, 'ERROR', 'Ocurrió un problema en el servidor. Tu texto sigue guardado; inténtalo de nuevo.');
    }
  };
}
