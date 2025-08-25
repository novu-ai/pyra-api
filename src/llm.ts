// src/llm.ts
import type { MetricsResultMap } from './metrics';

type AIResult = { summary: string } | null;

export async function aiInterpretation(
  _metrics: MetricsResultMap,
  _company: string,
  _period: string,
  _currency: string
): Promise<AIResult> {
  // Si NO hay API key, salir silenciosamente
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  // Intentar cargar el SDK; si no está instalado, salimos silenciosamente
  let OpenAI: any;
  try {
    ({ OpenAI } = await import('openai'));
  } catch {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });

    // Puedes dejarlo como un stub por ahora
    const text =
      'Interpretación automática deshabilitada temporalmente. (OPENAI_API_KEY no configurada en producción).';

    // Si quisieras de verdad llamar al modelo luego, aquí iría la llamada:
    // const resp = await client.responses.create({ ... })

    return { summary: text };
  } catch {
    return null;
  }
}
