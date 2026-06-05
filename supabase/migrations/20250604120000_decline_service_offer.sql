-- Allow recipients to decline a pending offer without cancelling the service request

alter type public.service_offer_status add value if not exists 'declined';

create or replace function public.decline_service_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_offer public.service_offers%rowtype;
  v_conversation public.conversations%rowtype;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select *
  into v_offer
  from public.service_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Oferta no encontrada.';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'Esta oferta ya no está activa.';
  end if;

  if v_offer.proposer_id = v_user_id then
    raise exception 'Usa retirar oferta para cancelar tu propia oferta.';
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = v_offer.conversation_id;

  if not found then
    raise exception 'Conversación no encontrada.';
  end if;

  if v_conversation.closed_at is not null then
    raise exception 'Esta conversación está cerrada.';
  end if;

  if v_user_id <> v_conversation.client_id and v_user_id <> v_conversation.professional_id then
    raise exception 'No tienes acceso a esta conversación.';
  end if;

  update public.service_offers
  set status = 'declined'
  where id = p_offer_id;

  perform public.insert_offer_message(
    v_offer.conversation_id,
    v_user_id,
    v_offer.id,
    v_offer.amount_cents,
    'declined',
    v_offer.proposer_id
  );
end;
$$;

grant execute on function public.decline_service_offer(uuid) to authenticated;
