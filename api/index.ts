// expone tu app de Hono en Node runtime bajo /api/*
export const runtime = 'nodejs';

import app from '../src/index';
import { handle } from 'hono/vercel';

// El adaptador convierte tu app.fetch en un handler para Vercel Node
export default handle(app);
