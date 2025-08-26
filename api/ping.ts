// api/ping.ts
export const runtime = 'edge';

export default function handler(_req: Request): Response {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
