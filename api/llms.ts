import type { MetricResult } from './metrics';

export async function aiInterpretation(
  _metrics: Record<string, MetricResult>,
  _company: string,
  _period: string,
  _currency: string
): Promise<{ summary: string } | null> {
  return null; // sin OpenAI por ahora
}
