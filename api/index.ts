// api/index.ts
import app from '../src/index';
import { handle } from 'hono/vercel';

export const config = {
  runtime: 'nodejs', // fuerza Node (evita Edge)
};

export default handle(app);
