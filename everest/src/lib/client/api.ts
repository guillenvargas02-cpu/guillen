'use client';

export class ApiError extends Error {
  constructor(public kind: 'network' | 'server' | 'validation' | 'closed' | 'limit', message: string, public status = 0, public data?: Record<string, unknown>) {
    super(message);
  }
}

export async function api<T = Record<string, unknown>>(url: string, init?: RequestInit & { json?: unknown; timeoutMs?: number }): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init?.timeoutMs ?? 15_000);
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      method: init?.method ?? (init?.json !== undefined ? 'POST' : 'GET'),
      headers: { ...(init?.json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers ?? {}) },
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
      signal: ctrl.signal,
      cache: 'no-store',
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('network', 'No hay conexión en este momento. Tu texto está guardado en este dispositivo; puedes reintentar cuando vuelva la señal.');
  } finally {
    clearTimeout(timer);
  }
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* respuesta vacía */ }
  if (!res.ok || data.ok === false) {
    const msg = (data.message as string) || 'Algo salió mal. Inténtalo de nuevo.';
    const kind = res.status === 422 ? 'validation' : res.status === 423 ? 'closed' : res.status === 429 ? 'limit' : 'server';
    throw new ApiError(kind, msg, res.status, data);
  }
  return data as T;
}
