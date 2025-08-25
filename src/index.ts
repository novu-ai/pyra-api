// ❌ elimina esta línea (si aún está):
// import 'dotenv/config';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { computeMetrics, thresholds, makeExecutiveSummary } from './metrics';
import { getSupabase, persistAnalysis } from './supabase';
import { aiInterpretation } from './llm';

const app = new Hono();
app.use('*', cors());

// ... (tus rutas tal cual)

// Sólo para local (no Vercel)
if (!process.env.VERCEL) {
  const { serve } = await import('@hono/node-server');
  await import('dotenv/config');            // ← si quieres, cargar dotenv SOLO en local
  const port = parseInt(process.env.PORT ?? '3000', 10);
  console.log(`pyra-api listening on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;