create table public.professional_service_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  subcategory_id uuid not null references public.service_subcategories (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, subcategory_id)
);

create index professional_service_areas_user_id_idx
  on public.professional_service_areas (user_id);

create index professional_service_areas_subcategory_id_idx
  on public.professional_service_areas (subcategory_id);

alter table public.professional_service_areas enable row level security;

create policy "Users can read own professional service areas"
on public.professional_service_areas
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can read professional service areas for discovery"
on public.professional_service_areas
for select
to authenticated
using (true);

create policy "Users can insert own professional service areas"
on public.professional_service_areas
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and is_professional = true
  )
);

create policy "Users can delete own professional service areas"
on public.professional_service_areas
for delete
to authenticated
using (auth.uid() = user_id);
