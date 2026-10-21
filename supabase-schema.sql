create table if not exists public.catalog (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.catalog enable row level security;

revoke all on public.catalog from anon, authenticated;
grant select on public.catalog to anon, authenticated;
grant update on public.catalog to authenticated;

drop policy if exists "Public can read the catalog" on public.catalog;
create policy "Public can read the catalog"
  on public.catalog
  for select
  to anon, authenticated
  using (id = 'main');

drop policy if exists "Catalog administrators can update the catalog" on public.catalog;
create policy "Catalog administrators can update the catalog"
  on public.catalog
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'catalog_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'catalog_admin');

insert into public.catalog (id, data)
values ('main', '{"_setupRequired": true}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-media',
  'catalog-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view catalog media" on storage.objects;
create policy "Public can view catalog media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'catalog-media');

drop policy if exists "Catalog administrators can upload media" on storage.objects;
create policy "Catalog administrators can upload media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catalog-media'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'catalog_admin'
  );
