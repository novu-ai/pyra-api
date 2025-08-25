// api/ping.ts
export const runtime = 'edge';

export default async function handler() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

