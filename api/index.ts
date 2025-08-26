import app from '../src/index';
import { handle } from 'hono/vercel';

export const config = {
  runtime: 'nodejs', // fuerza Node en Vercel
};

export default handle(app);