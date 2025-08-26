import app from '../src/index';
import { handle } from 'hono/vercel';

export const runtime = 'nodejs';

// Expone tu app de Hono como handler para Vercel Node
export default handle(app);
