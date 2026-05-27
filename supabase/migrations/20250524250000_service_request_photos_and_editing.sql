alter table public.service_requests
  add column if not exists photo_urls text[] not null default '{}'::text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-photos',
  'request-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read for request photos"
on storage.objects
for select
to public
using (bucket_id = 'request-photos');

create policy "Clients can upload request photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'request-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.service_requests service_request
    where service_request.id::text = (storage.foldername(name))[2]
      and service_request.client_id = (select auth.uid())
      and service_request.status in ('published', 'in_negotiation')
  )
);

create policy "Clients can update request photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'request-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'request-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.service_requests service_request
    where service_request.id::text = (storage.foldername(name))[2]
      and service_request.client_id = (select auth.uid())
      and service_request.status in ('published', 'in_negotiation')
  )
);

create policy "Clients can delete request photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'request-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.service_requests service_request
    where service_request.id::text = (storage.foldername(name))[2]
      and service_request.client_id = (select auth.uid())
      and service_request.status in ('published', 'in_negotiation')
  )
);
