-- Service offers negotiation (COP)

create type public.service_offer_status as enum (
  'pending',
  'accepted',
  'withdrawn',
  'superseded'
);

create table public.service_offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  service_request_id uuid not null references public.service_requests (id) on delete cascade,
  proposer_id uuid not null references public.user_profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0 and amount_cents <= 100000000),
  currency text not null default 'COP' check (currency = 'COP'),
  status public.service_offer_status not null default 'pending',
  parent_offer_id uuid references public.service_offers (id) on delete set null,
  accepted_by uuid references public.user_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_offers_conversation_id_idx on public.service_offers (conversation_id);
create index service_offers_service_request_id_idx on public.service_offers (service_request_id);
create index service_offers_status_idx on public.service_offers (status);

create unique index service_offers_one_pending_per_conversation_idx
  on public.service_offers (conversation_id)
  where status = 'pending';

create trigger service_offers_set_updated_at
before update on public.service_offers
for each row
execute function public.set_updated_at();

alter table public.conversations
  add column if not exists closed_at timestamptz,
  add column if not exists closed_reason text;

alter table public.conversations
  drop constraint if exists conversations_closed_reason_check;

alter table public.conversations
  add constraint conversations_closed_reason_check
  check (
    closed_reason is null
    or closed_reason in ('assigned_elsewhere', 'request_cancelled')
  );

alter table public.messages
  drop constraint if exists messages_message_type_check;

alter table public.messages
  add constraint messages_message_type_check
  check (message_type in ('text', 'image', 'offer'));

alter table public.messages
  drop constraint if exists messages_content_valid;

alter table public.messages
  add constraint messages_content_valid
  check (
    (
      message_type = 'text'
      and char_length(trim(content)) > 0
    )
    or (
      message_type = 'image'
      and media_url is not null
    )
    or (
      message_type = 'offer'
      and char_length(trim(content)) > 0
    )
  );

alter table public.service_offers enable row level security;
alter table public.service_offers replica identity full;

create policy "Participants can read service offers"
on public.service_offers
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and (
        c.client_id = (select auth.uid())
        or c.professional_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants can send messages" on public.messages;

create policy "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations c
    inner join public.service_requests sr on sr.id = c.service_request_id
    where c.id = conversation_id
      and (
        c.client_id = (select auth.uid())
        or c.professional_id = (select auth.uid())
      )
      and c.closed_at is null
      and (
        sr.status = 'in_negotiation'
        or (
          sr.status in ('accepted', 'in_progress', 'completed')
          and sr.assigned_professional_id = c.professional_id
          and (
            sr.client_id = (select auth.uid())
            or sr.assigned_professional_id = (select auth.uid())
          )
        )
      )
  )
);

create or replace function public.close_losing_conversations(
  p_service_request_id uuid,
  p_assigned_professional_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set
    closed_at = now(),
    closed_reason = 'assigned_elsewhere'
  where service_request_id = p_service_request_id
    and professional_id <> p_assigned_professional_id
    and closed_at is null;
end;
$$;

create or replace function public.close_conversations_for_cancelled_request(
  p_service_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set
    closed_at = now(),
    closed_reason = 'request_cancelled'
  where service_request_id = p_service_request_id
    and closed_at is null;
end;
$$;

create or replace function public.insert_offer_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_offer_id uuid,
  p_amount_cents integer,
  p_status public.service_offer_status,
  p_proposer_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.messages (conversation_id, sender_id, message_type, content)
  values (
    p_conversation_id,
    p_sender_id,
    'offer',
    jsonb_build_object(
      'offerId', p_offer_id,
      'amountCents', p_amount_cents,
      'status', p_status,
      'proposerId', p_proposer_id,
      'currency', 'COP'
    )::text
  );
end;
$$;

create or replace function public.create_service_offer(
  p_conversation_id uuid,
  p_amount_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_conversation public.conversations%rowtype;
  v_offer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if p_amount_cents is null or p_amount_cents < 1000 or p_amount_cents > 100000000 then
    raise exception 'Monto inválido.';
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = p_conversation_id;

  if not found then
    raise exception 'Conversación no encontrada.';
  end if;

  if v_conversation.closed_at is not null then
    raise exception 'Esta conversación está cerrada.';
  end if;

  if v_user_id <> v_conversation.client_id and v_user_id <> v_conversation.professional_id then
    raise exception 'No tienes acceso a esta conversación.';
  end if;

  if not exists (
    select 1
    from public.service_requests sr
    where sr.id = v_conversation.service_request_id
      and sr.status = 'in_negotiation'
  ) then
    raise exception 'Esta solicitud ya no está en negociación.';
  end if;

  update public.service_offers
  set status = 'superseded'
  where conversation_id = p_conversation_id
    and status = 'pending';

  insert into public.service_offers (
    conversation_id,
    service_request_id,
    proposer_id,
    amount_cents,
    status
  )
  values (
    p_conversation_id,
    v_conversation.service_request_id,
    v_user_id,
    p_amount_cents,
    'pending'
  )
  returning id into v_offer_id;

  perform public.insert_offer_message(
    p_conversation_id,
    v_user_id,
    v_offer_id,
    p_amount_cents,
    'pending',
    v_user_id
  );

  return v_offer_id;
end;
$$;

create or replace function public.counter_service_offer(
  p_parent_offer_id uuid,
  p_amount_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_parent public.service_offers%rowtype;
  v_conversation public.conversations%rowtype;
  v_offer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if p_amount_cents is null or p_amount_cents < 1000 or p_amount_cents > 100000000 then
    raise exception 'Monto inválido.';
  end if;

  select *
  into v_parent
  from public.service_offers
  where id = p_parent_offer_id;

  if not found then
    raise exception 'Oferta no encontrada.';
  end if;

  if v_parent.status <> 'pending' then
    raise exception 'Esta oferta ya no está activa.';
  end if;

  if v_parent.proposer_id = v_user_id then
    raise exception 'No puedes contraofertar tu propia oferta.';
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = v_parent.conversation_id;

  if v_conversation.closed_at is not null then
    raise exception 'Esta conversación está cerrada.';
  end if;

  if v_user_id <> v_conversation.client_id and v_user_id <> v_conversation.professional_id then
    raise exception 'No tienes acceso a esta conversación.';
  end if;

  update public.service_offers
  set status = 'superseded'
  where id = p_parent_offer_id;

  insert into public.service_offers (
    conversation_id,
    service_request_id,
    proposer_id,
    amount_cents,
    status,
    parent_offer_id
  )
  values (
    v_parent.conversation_id,
    v_parent.service_request_id,
    v_user_id,
    p_amount_cents,
    'pending',
    p_parent_offer_id
  )
  returning id into v_offer_id;

  perform public.insert_offer_message(
    v_parent.conversation_id,
    v_user_id,
    v_offer_id,
    p_amount_cents,
    'pending',
    v_user_id
  );

  return v_offer_id;
end;
$$;

create or replace function public.accept_service_offer(p_offer_id uuid)
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
    raise exception 'No puedes aceptar tu propia oferta.';
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = v_offer.conversation_id;

  if v_conversation.closed_at is not null then
    raise exception 'Esta conversación está cerrada.';
  end if;

  if v_user_id <> v_conversation.client_id and v_user_id <> v_conversation.professional_id then
    raise exception 'No tienes acceso a esta conversación.';
  end if;

  update public.service_offers
  set
    status = 'accepted',
    accepted_by = v_user_id
  where id = p_offer_id;

  update public.service_requests
  set
    status = 'accepted',
    assigned_professional_id = v_conversation.professional_id
  where id = v_offer.service_request_id
    and status = 'in_negotiation';

  if not found then
    raise exception 'Esta solicitud ya no está en negociación.';
  end if;

  perform public.close_losing_conversations(
    v_offer.service_request_id,
    v_conversation.professional_id
  );

  perform public.insert_offer_message(
    v_offer.conversation_id,
    v_offer.proposer_id,
    v_offer.id,
    v_offer.amount_cents,
    'accepted',
    v_offer.proposer_id
  );
end;
$$;

create or replace function public.withdraw_service_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_offer public.service_offers%rowtype;
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

  if v_offer.proposer_id <> v_user_id then
    raise exception 'Solo quien propuso la oferta puede retirarla.';
  end if;

  update public.service_offers
  set status = 'withdrawn'
  where id = p_offer_id;

  perform public.insert_offer_message(
    v_offer.conversation_id,
    v_user_id,
    v_offer.id,
    v_offer.amount_cents,
    'withdrawn',
    v_user_id
  );
end;
$$;

grant execute on function public.create_service_offer(uuid, integer) to authenticated;
grant execute on function public.counter_service_offer(uuid, integer) to authenticated;
grant execute on function public.accept_service_offer(uuid) to authenticated;
grant execute on function public.withdraw_service_offer(uuid) to authenticated;

-- Notifications (enum values added in prior migration)
alter table public.notification_preferences
  add column if not exists new_offer boolean not null default true,
  add column if not exists offer_accepted boolean not null default true;

create or replace function public.create_notification(
  p_user_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid;
  v_allowed boolean := true;
begin
  if p_user_id is null or p_user_id = (select auth.uid()) then
    return null;
  end if;

  select case p_type
    when 'job_opportunity' then np.job_opportunity
    when 'new_message' then np.new_message
    when 'new_review' then np.new_review
    when 'job_status' then np.job_status
    when 'new_conversation' then np.new_conversation
    when 'new_offer' then np.new_offer
    when 'offer_accepted' then np.offer_accepted
    else true
  end
  into v_allowed
  from public.notification_preferences np
  where np.user_id = p_user_id;

  if coalesce(v_allowed, true) is false then
    return null;
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, coalesce(p_data, '{}'::jsonb))
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

create or replace function public.notify_new_offer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation public.conversations%rowtype;
  v_recipient_id uuid;
  v_proposer_name text;
  v_title text;
  v_amount_label text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = new.conversation_id;

  if not found then
    return new;
  end if;

  if new.proposer_id = v_conversation.client_id then
    v_recipient_id := v_conversation.professional_id;
  else
    v_recipient_id := v_conversation.client_id;
  end if;

  select coalesce(nullif(trim(up.full_name), ''), 'Alguien')
  into v_proposer_name
  from public.user_profiles up
  where up.id = new.proposer_id;

  select coalesce(nullif(trim(sr.title), ''), 'Tu solicitud')
  into v_title
  from public.service_requests sr
  where sr.id = new.service_request_id;

  v_amount_label := to_char(new.amount_cents, 'FM999G999G999') || ' COP';

  perform public.create_notification(
    v_recipient_id,
    'new_offer',
    'Nueva oferta',
    v_proposer_name || ' propuso $' || v_amount_label || ' para "' || v_title || '".',
    jsonb_build_object(
      'offerId', new.id,
      'conversationId', new.conversation_id,
      'jobId', new.service_request_id
    )
  );

  return new;
end;
$$;

drop trigger if exists service_offers_notify_new_offer on public.service_offers;

create trigger service_offers_notify_new_offer
after insert on public.service_offers
for each row
execute function public.notify_new_offer();

create or replace function public.notify_offer_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_amount_label text;
begin
  if new.status <> 'accepted' or old.status = 'accepted' then
    return new;
  end if;

  select coalesce(nullif(trim(sr.title), ''), 'Tu solicitud')
  into v_title
  from public.service_requests sr
  where sr.id = new.service_request_id;

  v_amount_label := to_char(new.amount_cents, 'FM999G999G999') || ' COP';

  perform public.create_notification(
    new.proposer_id,
    'offer_accepted',
    'Oferta aceptada',
    'Tu oferta de $' || v_amount_label || ' fue aceptada para "' || v_title || '".',
    jsonb_build_object(
      'offerId', new.id,
      'conversationId', new.conversation_id,
      'jobId', new.service_request_id
    )
  );

  return new;
end;
$$;

drop trigger if exists service_offers_notify_offer_accepted on public.service_offers;

create trigger service_offers_notify_offer_accepted
after update on public.service_offers
for each row
execute function public.notify_offer_accepted();

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation public.conversations%rowtype;
  v_recipient_id uuid;
  v_sender_name text;
  v_preview text;
begin
  if new.message_type = 'offer' then
    return new;
  end if;

  select *
  into v_conversation
  from public.conversations
  where id = new.conversation_id;

  if not found then
    return new;
  end if;

  if new.sender_id = v_conversation.client_id then
    v_recipient_id := v_conversation.professional_id;
  else
    v_recipient_id := v_conversation.client_id;
  end if;

  select coalesce(nullif(trim(up.full_name), ''), 'Alguien')
  into v_sender_name
  from public.user_profiles up
  where up.id = new.sender_id;

  v_preview := case
    when new.message_type = 'image' then 'Te envió una imagen'
    else left(trim(new.content), 120)
  end;

  perform public.create_notification(
    v_recipient_id,
    'new_message',
    v_sender_name,
    v_preview,
    jsonb_build_object(
      'conversationId', new.conversation_id,
      'messageId', new.id,
      'jobId', v_conversation.service_request_id
    )
  );

  return new;
end;
$$;

create or replace function public.close_conversations_on_request_cancelled()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    perform public.close_conversations_for_cancelled_request(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists service_requests_close_conversations_on_cancel on public.service_requests;

create trigger service_requests_close_conversations_on_cancel
after update on public.service_requests
for each row
execute function public.close_conversations_on_request_cancelled();

do $$
begin
  alter publication supabase_realtime add table public.service_offers;
exception
  when duplicate_object then null;
end $$;
