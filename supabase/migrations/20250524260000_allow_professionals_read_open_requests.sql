-- Professionals must keep read access to open opportunities (published or in negotiation)
-- even after a client edits the request or another professional starts chatting.

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
      or (
        public.auth_user_is_professional()
        and exists (
          select 1
          from public.service_requests service_request
          where service_request.client_id = profile_id
            and service_request.status in ('published', 'in_negotiation')
            and service_request.assigned_professional_id is null
        )
      )
    );
$$;

drop policy if exists "Professionals can read published service requests"
  on public.service_requests;

create policy "Professionals can read open service requests"
on public.service_requests
for select
to authenticated
using (
  status in ('published', 'in_negotiation')
  and assigned_professional_id is null
  and public.auth_user_is_professional()
);
