create or replace function public.validate_service_request_acceptance()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'accepted' and old.status not in ('in_negotiation', 'accepted') then
    raise exception 'Esta solicitud ya no acepta profesionales.';
  end if;

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
