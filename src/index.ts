import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { computeMetrics, thresholds, makeExecutiveSummary, type MetricResult, type RawValues } from './metrics';
import { getSupabase, persistAnalysis } from './supabase';
import { aiInterpretation } from './llm';

const app = new Hono();
app.use('*', cors());

app.get('/', (c) => c.json({ service: 'pyra-api', status: 'ok' }));
app.get('/health', (c) => c.json({ ok: true }));

const ExtractionSchema = z.object({
  company: z.string().min(1),
  period: z.string().min(1),
  currency: z.string().default('COP'),
  values: z.object({
    ventas: z.number(),
    costoVentas: z.number(),
    utilidadNeta: z.number(),
    utilidadOperativa: z.number().optional(),
    gastosFinancieros: z.number().optional(),
    activosCorrientes: z.number(),
    pasivosCorrientes: z.number(),
    inventario: z.number().default(0),
    cuentasPorCobrar: z.number().optional(),
    cuentasPorPagar: z.number().optional(),
    activoTotal: z.number(),
    pasivoTotal: z.number()
  })
});

export type ExtractionPayload = z.infer<typeof ExtractionSchema>;

app.post('/v1/analyze', zValidator('json', ExtractionSchema), async (c) => {
  const body = c.req.valid('json');
  // 👈 Cast explícito para satisfacer a TS
  const metrics = computeMetrics(body.values as RawValues);
  const executive = makeExecutiveSummary(metrics);

  // Optional AI enhancement
  const ai = await aiInterpretation(metrics, body.company, body.period, body.currency).catch(() => null);

  let id: string | undefined;
  const sb = getSupabase();
  if (sb) {
    const saved = await persistAnalysis(sb, {
      company: body.company,
      period: body.period,
      currency: body.currency,
      raw_values: body.values,
      metrics,
      executive,
      ai_summary: ai?.summary ?? null
    });
    id = saved?.id;
  }

  return c.json({ id, thresholds, executive, ai, metrics });
});

// Calculate metrics without persistence/AI — handy for local testing
app.post('/v1/metrics', zValidator('json', ExtractionSchema.pick({ values: true })), (c) => {
  const { values } = c.req.valid('json');
  // 👈 Cast explícito aquí también
  const metrics = computeMetrics(values as RawValues);
  return c.json({ metrics, thresholds });
});

// Local dev server (skipped on Vercel)
if (!process.env.VERCEL) {
  const start = async () => {
    const { serve } = await import('@hono/node-server');
    const port = parseInt(process.env.PORT ?? '3000', 10);
    console.log(`pyra-api listening on http://localhost:${port}`);
    serve({ fetch: app.fetch, port });
  };
  start();
}

// 404 fallback
app.all('*', (c) => c.json({ error: 'Not Found' }, 404));

export default app;
