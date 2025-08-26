import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function persistAnalysis(sb: SupabaseClient, payload: any) {
  const { data, error } = await sb.from('analyses').insert(payload).select('id').single();
  if (error) return null;
  return data as { id: string } | null;
}
