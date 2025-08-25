// api/index.ts (prueba mínima en Vercel)
export const runtime = 'nodejs'; // fuerza runtime Node (no Edge)

export default async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    // Salud
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    // Ping
    if (url.pathname === '/api/ping') {
      return new Response(JSON.stringify({ ok: true, pong: Date.now() }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    // Fallback
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    // Log interno y respuesta 500
    console.error('api/index error:', err?.stack || err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
