// src/llm.ts
import type { MetricResult } from './metrics.js';

export async function aiInterpretation(
  _metrics: Record<string, MetricResult>,
  _company: string,
  _period: string,
  _currency: string
): Promise<{ summary: string } | null> {
  // IA deshabilitada por ahora (sin dependencias ni claves)
  return null;
}
