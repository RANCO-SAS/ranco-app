-- Allow professionals to read client profiles on published opportunities.

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
            and service_request.status = 'published'
        )
      )
    );
$$;
