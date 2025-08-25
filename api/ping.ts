// Node runtime (más simple para probar)
export const runtime = 'nodejs';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('content-type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true }));
}

