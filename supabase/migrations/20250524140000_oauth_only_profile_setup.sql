create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (
    id,
    full_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

update public.user_profiles p
set
  avatar_url = coalesce(
    p.avatar_url,
    u.raw_user_meta_data ->> 'avatar_url',
    u.raw_user_meta_data ->> 'picture'
  ),
  full_name = case
    when coalesce(p.full_name, '') = '' then coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name',
      ''
    )
    else p.full_name
  end
from auth.users u
where p.id = u.id
  and (
    p.avatar_url is null
    or coalesce(p.full_name, '') = ''
  );

alter table public.service_requests
  drop constraint if exists service_requests_urgency_check;

alter table public.service_requests
  add constraint service_requests_urgency_check
  check (urgency in ('low', 'normal', 'high', 'urgent'));

alter table public.service_requests
  drop constraint if exists service_requests_status_check;

alter table public.service_requests
  add constraint service_requests_status_check
  check (status in ('published', 'in_negotiation', 'accepted', 'in_progress', 'completed', 'cancelled'));
