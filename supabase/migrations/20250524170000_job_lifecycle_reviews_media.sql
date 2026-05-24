alter table public.service_requests
  add column if not exists assigned_professional_id uuid references public.user_profiles (id);

create index if not exists service_requests_assigned_professional_id_idx
  on public.service_requests (assigned_professional_id);

alter table public.service_requests
  drop constraint if exists service_requests_status_check;

alter table public.service_requests
  add constraint service_requests_status_check
  check (
    status in (
      'published',
      'in_negotiation',
      'accepted',
      'in_progress',
      'completed',
      'cancelled'
    )
  );

alter table public.messages
  add column if not exists message_type text not null default 'text',
  add column if not exists media_url text;

alter table public.messages
  drop constraint if exists messages_content_not_empty;

alter table public.messages
  drop constraint if exists messages_content_valid;

alter table public.messages
  add constraint messages_message_type_check
  check (message_type in ('text', 'image'));

alter table public.messages
  add constraint messages_content_valid
  check (
    (
      message_type = 'text'
      and char_length(trim(content)) > 0
    )
    or (
      message_type = 'image'
      and media_url is not null
    )
  );

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests (id) on delete cascade,
  reviewer_id uuid not null references public.user_profiles (id) on delete cascade,
  reviewee_id uuid not null references public.user_profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (service_request_id, reviewer_id),
  constraint reviews_participants_different check (reviewer_id <> reviewee_id)
);

create index if not exists reviews_reviewee_id_idx on public.reviews (reviewee_id);
create index if not exists reviews_service_request_id_idx on public.reviews (service_request_id);

alter table public.reviews enable row level security;

create policy "Authenticated users can read reviews"
on public.reviews
for select
to authenticated
using (true);

create policy "Participants can create reviews for completed jobs"
on public.reviews
for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.service_requests sr
    where sr.id = service_request_id
      and sr.status = 'completed'
      and (
        (sr.client_id = auth.uid() and sr.assigned_professional_id = reviewee_id)
        or (sr.assigned_professional_id = auth.uid() and sr.client_id = reviewee_id)
      )
  )
  and not exists (
    select 1
    from public.reviews existing
    where existing.service_request_id = reviews.service_request_id
      and existing.reviewer_id = auth.uid()
  )
);

create policy "Professionals can read engaged service requests"
on public.service_requests
for select
to authenticated
using (
  assigned_professional_id = auth.uid()
  or exists (
    select 1
    from public.conversations conversation
    where conversation.service_request_id = service_requests.id
      and conversation.professional_id = auth.uid()
  )
);

create policy "Assigned professionals can update engaged service requests"
on public.service_requests
for update
to authenticated
using (assigned_professional_id = auth.uid())
with check (assigned_professional_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'chat-media',
    'chat-media',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read for avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Conversation participants can read chat media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-media'
  and exists (
    select 1
    from public.conversations conversation
    where conversation.id::text = (storage.foldername(name))[1]
      and (
        conversation.client_id = auth.uid()
        or conversation.professional_id = auth.uid()
      )
  )
);

create policy "Conversation participants can upload chat media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-media'
  and exists (
    select 1
    from public.conversations conversation
    where conversation.id::text = (storage.foldername(name))[1]
      and (
        conversation.client_id = auth.uid()
        or conversation.professional_id = auth.uid()
      )
  )
);

create or replace function public.mark_service_request_in_negotiation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.service_requests
  set status = 'in_negotiation'
  where id = new.service_request_id
    and status = 'published';

  return new;
end;
$$;

drop trigger if exists conversations_mark_request_in_negotiation on public.conversations;

create trigger conversations_mark_request_in_negotiation
after insert on public.conversations
for each row
execute function public.mark_service_request_in_negotiation();
