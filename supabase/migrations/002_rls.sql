-- Enable RLS on core tables
alter table if exists public.asset enable row level security;
alter table if exists public.asset_share enable row level security;
alter table if exists public.upload_ticket enable row level security;
alter table if exists public.download_audit enable row level security;

-- Assets: owner can manage all
create policy if not exists "owner can crud own assets"
on public.asset
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Assets: shared users can read
create policy if not exists "shared users can read assets"
on public.asset
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.asset_share s
    where s.asset_id = asset.id and s.to_user = auth.uid()
  )
);

-- Shares: only owner can manage
create policy if not exists "owner manages shares"
on public.asset_share
for all
to authenticated
using (exists(
  select 1 from public.asset a
  where a.id = asset_share.asset_id and a.owner_id = auth.uid()
))
with check (exists(
  select 1 from public.asset a
  where a.id = asset_share.asset_id and a.owner_id = auth.uid()
));

-- Upload tickets: only owner manages their ticket
create policy if not exists "owner manages tickets"
on public.upload_ticket
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Download audit: any authenticated insert (by API server)
create policy if not exists "audit inserts only by owner or server"
on public.download_audit
for insert
to authenticated
with check (user_id = auth.uid());


