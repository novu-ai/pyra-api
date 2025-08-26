export const runtime = 'edge';

export default async function handler(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
