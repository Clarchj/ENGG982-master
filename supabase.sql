-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- One table, one row per record. The hub creates and updates rows by itself.
create table if not exists public.hub (
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

alter table public.hub enable row level security;

-- Anyone holding the page URL and anon key can read and write. Fine for a student project
-- with no private data; see HUB-README.md for the trade-off.
drop policy if exists "hub open access" on public.hub;
create policy "hub open access" on public.hub for all to anon using (true) with check (true);
