-- Basic table for storing analyses
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  period text not null,
  currency text not null,
  raw_values jsonb not null,
  metrics jsonb not null,
  executive jsonb not null,
  ai_summary text,
  created_at timestamptz not null default now()
);
create index if not exists analyses_company_idx on analyses(company);

-- RLS for public read/write by authenticated users only (optional)
-- alter table analyses enable row level security;
-- create policy "insert-own" on analyses for insert to authenticated using (true);
-- create policy "read-all" on analyses for select to authenticated using (true);
