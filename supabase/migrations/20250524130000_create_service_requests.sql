create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.user_profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  urgency text not null default 'normal',
  status text not null default 'published',
  location_label text,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_requests_client_id_idx on public.service_requests (client_id);
create index service_requests_status_idx on public.service_requests (status);
create index service_requests_created_at_idx on public.service_requests (created_at desc);

create trigger service_requests_set_updated_at
before update on public.service_requests
for each row
execute function public.set_updated_at();

alter table public.service_requests enable row level security;

create policy "Clients can read own service requests"
on public.service_requests
for select
to authenticated
using (auth.uid() = client_id);

create policy "Clients can create own service requests"
on public.service_requests
for insert
to authenticated
with check (auth.uid() = client_id);

create policy "Clients can update own service requests"
on public.service_requests
for update
to authenticated
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

create policy "Professionals can read published service requests"
on public.service_requests
for select
to authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and is_professional = true
  )
);
