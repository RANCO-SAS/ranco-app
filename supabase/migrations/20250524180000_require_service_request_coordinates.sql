-- Legacy rows from before map-based location picking cannot appear on the discover map.
delete from public.service_requests
where location_lat is null
   or location_lng is null
   or location_lat < -90
   or location_lat > 90
   or location_lng < -180
   or location_lng > 180;

alter table public.service_requests
  alter column location_lat set not null,
  alter column location_lng set not null;

alter table public.service_requests
  drop constraint if exists service_requests_location_lat_check;

alter table public.service_requests
  add constraint service_requests_location_lat_check
  check (location_lat >= -90 and location_lat <= 90);

alter table public.service_requests
  drop constraint if exists service_requests_location_lng_check;

alter table public.service_requests
  add constraint service_requests_location_lng_check
  check (location_lng >= -180 and location_lng <= 180);

create index if not exists service_requests_published_location_idx
  on public.service_requests (status, location_lat, location_lng)
  where status = 'published';
