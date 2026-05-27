alter table public.reviews
  add column if not exists evidence_urls text[] not null default '{}'::text[];

create policy "Reviewers can update own reviews"
on public.reviews
for update
to authenticated
using (reviewer_id = (select auth.uid()))
with check (reviewer_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-evidence',
  'work-evidence',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read for work evidence"
on storage.objects
for select
to public
using (bucket_id = 'work-evidence');

create policy "Review owners can upload work evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'work-evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Review owners can update work evidence"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'work-evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'work-evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Review owners can delete work evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'work-evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
