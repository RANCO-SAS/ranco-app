-- Map integration removed from MVP; coordinates are optional again.
alter table public.service_requests
  alter column location_lat drop not null,
  alter column location_lng drop not null;

drop index if exists public.service_requests_published_location_idx;
