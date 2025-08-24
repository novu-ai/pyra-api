// api/index.ts (raíz del repo, UNA sola carpeta api)
export const runtime = 'nodejs'; // fuerza Node, evita Edge

import app from '../src/index';
export default app.fetch; // usa el handler fetch de Hono