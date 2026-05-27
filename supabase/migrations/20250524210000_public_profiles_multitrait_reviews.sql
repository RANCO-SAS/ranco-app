alter table public.reviews
  add column if not exists traits jsonb not null default '{}'::jsonb;

create policy "Authenticated users can read related public profiles"
on public.user_profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.conversations conversation
    where (
      conversation.client_id = (select auth.uid())
      and conversation.professional_id = user_profiles.id
    )
    or (
      conversation.professional_id = (select auth.uid())
      and conversation.client_id = user_profiles.id
    )
  )
  or exists (
    select 1
    from public.service_requests service_request
    where service_request.status = 'completed'
      and (
        (
          service_request.client_id = (select auth.uid())
          and service_request.assigned_professional_id = user_profiles.id
        )
        or (
          service_request.assigned_professional_id = (select auth.uid())
          and service_request.client_id = user_profiles.id
        )
      )
  )
);

create policy "Authenticated users can read completed job history"
on public.service_requests
for select
to authenticated
using (status = 'completed');

create or replace function public.validate_service_request_acceptance()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'accepted' and new.assigned_professional_id is not null then
    if old.assigned_professional_id is not null
      and old.assigned_professional_id <> new.assigned_professional_id then
      raise exception 'Ya hay un profesional asignado a esta solicitud.';
    end if;
  end if;

  if new.status in ('accepted', 'in_progress', 'completed')
    and old.status = 'in_negotiation'
    and new.assigned_professional_id is null then
    raise exception 'Debes asignar un profesional antes de aceptar la solicitud.';
  end if;

  return new;
end;
$$;

drop trigger if exists service_requests_validate_acceptance on public.service_requests;

create trigger service_requests_validate_acceptance
before update on public.service_requests
for each row
execute function public.validate_service_request_acceptance();
