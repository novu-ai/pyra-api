export const config = {
  runtime: 'nodejs',
};

export default function handler() {
  return new Response(
    JSON.stringify({ ok: true, now: new Date().toISOString() }),
    { headers: { 'content-type': 'application/json' } }
  );
}
