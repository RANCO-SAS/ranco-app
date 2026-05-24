create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.service_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories (id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

create index service_subcategories_category_id_idx on public.service_subcategories (category_id);

alter table public.service_requests
  add column category_id uuid references public.service_categories (id),
  add column subcategory_id uuid references public.service_subcategories (id);

alter table public.service_requests
  drop column category;

alter table public.service_requests
  alter column category_id set not null,
  alter column subcategory_id set not null;

create index service_requests_category_id_idx on public.service_requests (category_id);
create index service_requests_subcategory_id_idx on public.service_requests (subcategory_id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests (id) on delete cascade,
  client_id uuid not null references public.user_profiles (id) on delete cascade,
  professional_id uuid not null references public.user_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_request_id, professional_id)
);

create index conversations_client_id_idx on public.conversations (client_id);
create index conversations_professional_id_idx on public.conversations (professional_id);
create index conversations_service_request_id_idx on public.conversations (service_request_id);
create index conversations_updated_at_idx on public.conversations (updated_at desc);

create trigger conversations_set_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.user_profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint messages_content_not_empty check (char_length(trim(content)) > 0)
);

create index messages_conversation_id_idx on public.messages (conversation_id);
create index messages_created_at_idx on public.messages (created_at);

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row
execute function public.touch_conversation_on_message();

alter table public.service_categories enable row level security;
alter table public.service_subcategories enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Authenticated users can read categories"
on public.service_categories
for select
to authenticated
using (true);

create policy "Authenticated users can read subcategories"
on public.service_subcategories
for select
to authenticated
using (true);

create policy "Participants can read conversations"
on public.conversations
for select
to authenticated
using (
  auth.uid() = client_id
  or auth.uid() = professional_id
);

create policy "Professionals can start conversations on published requests"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = professional_id
  and exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and is_professional = true
  )
  and exists (
    select 1
    from public.service_requests
    where id = service_request_id
      and status = 'published'
      and client_id = (
        select sr.client_id
        from public.service_requests sr
        where sr.id = service_request_id
      )
  )
);

create policy "Clients can start conversations on own requests"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = client_id
  and exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and is_client = true
  )
  and exists (
    select 1
    from public.service_requests
    where id = service_request_id
      and client_id = auth.uid()
  )
);

create policy "Participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where id = conversation_id
      and (client_id = auth.uid() or professional_id = auth.uid())
  )
);

create policy "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations
    where id = conversation_id
      and (client_id = auth.uid() or professional_id = auth.uid())
  )
);

insert into public.service_categories (slug, name, sort_order) values
  ('home', 'Hogar', 1),
  ('repairs', 'Reparaciones', 2),
  ('services', 'Servicios', 3),
  ('care', 'Cuidado', 4),
  ('other', 'Otros', 5);

insert into public.service_subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.sort_order
from public.service_categories c
join (
  values
    ('home', 'plumbing', 'Plomería', 1),
    ('home', 'electrical', 'Electricidad', 2),
    ('home', 'painting', 'Pintura', 3),
    ('home', 'cleaning', 'Limpieza', 4),
    ('repairs', 'general', 'Reparaciones generales', 1),
    ('repairs', 'mechanical', 'Mecánica', 2),
    ('services', 'delivery', 'Delivery / mandados', 1),
    ('services', 'cooking', 'Cocina', 2),
    ('care', 'pets', 'Mascotas', 1),
    ('care', 'babysitting', 'Niños', 2),
    ('other', 'tutoring', 'Tutoría', 1),
    ('other', 'other', 'Otros', 2)
) as v(category_slug, slug, name, sort_order)
  on c.slug = v.category_slug;
