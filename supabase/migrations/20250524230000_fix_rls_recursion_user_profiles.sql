-- Break RLS cycles between user_profiles and service_requests by using
-- SECURITY DEFINER helpers that bypass RLS for internal relationship checks.

create or replace function public.auth_user_is_professional()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (
      select up.is_professional
      from public.user_profiles up
      where up.id = (select auth.uid())
    ),
    false
  );
$$;

revoke all on function public.auth_user_is_professional() from public;
grant execute on function public.auth_user_is_professional() to authenticated;

create or replace function public.is_profile_visible_to_user(profile_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    (select auth.uid()) is not null
    and (
      profile_id = (select auth.uid())
      or exists (
        select 1
        from public.conversations conversation
        where (
          conversation.client_id = (select auth.uid())
          and conversation.professional_id = profile_id
        )
        or (
          conversation.professional_id = (select auth.uid())
          and conversation.client_id = profile_id
        )
      )
      or exists (
        select 1
        from public.service_requests service_request
        where service_request.status = 'completed'
          and (
            (
              service_request.client_id = (select auth.uid())
              and service_request.assigned_professional_id = profile_id
            )
            or (
              service_request.assigned_professional_id = (select auth.uid())
              and service_request.client_id = profile_id
            )
          )
      )
    );
$$;

revoke all on function public.is_profile_visible_to_user(uuid) from public;
grant execute on function public.is_profile_visible_to_user(uuid) to authenticated;

drop policy if exists "Authenticated users can read related public profiles"
  on public.user_profiles;

create policy "Authenticated users can read related public profiles"
on public.user_profiles
for select
to authenticated
using (public.is_profile_visible_to_user(id));

drop policy if exists "Professionals can read published service requests"
  on public.service_requests;

create policy "Professionals can read published service requests"
on public.service_requests
for select
to authenticated
using (
  status = 'published'
  and public.auth_user_is_professional()
);
