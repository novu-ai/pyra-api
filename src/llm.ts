// =============================
import type { MetricResult } from './metrics';

export async function aiInterpretation(
  metrics: Record<string, MetricResult>,
  company: string,
  period: string,
  currency: string
): Promise<{ summary: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const top = Object.values(metrics)
    .sort((a, b) => (a.status === 'red' ? -1 : 1) - (b.status === 'red' ? -1 : 1))
    .slice(0, 6)
    .map((m) => `${m.label}: ${m.value}${m.unit ?? ''} [${m.status}] — ${m.explanation}`)
    .join('\n');

  const prompt = `Actúa como analista financiero senior para PyMEs LATAM. Empresa: ${company}. Periodo: ${period}. Moneda: ${currency}. 
Indicadores clave:\n${top}\n
Escribe un RESUMEN EJECUTIVO en español (180-220 palabras) con: 1) diagnóstico; 2) 3 acciones priorizadas de corto plazo; 3) 2 riesgos a monitorear; 4) tono claro y accionable.`;

  // Simple fetch to OpenAI Chat Completions (compatible with many proxies)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un analista financiero pragmático y directo.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!res.ok) return null;
  const json = (await res.json()) as any;
  const summary = json.choices?.[0]?.message?.content ?? null;
  return summary ? { summary } : null;
}
