-- Simulated payments after job completion (COP, 10% platform fee)

create type public.service_payment_status as enum (
  'awaiting_client_payment',
  'paid_pending_payout',
  'payout_completed'
);

create type public.bank_account_type as enum (
  'ahorros',
  'corriente'
);

create table public.service_payments (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique references public.service_requests (id) on delete cascade,
  offer_id uuid not null references public.service_offers (id) on delete restrict,
  client_id uuid not null references public.user_profiles (id) on delete cascade,
  professional_id uuid not null references public.user_profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  payout_cents integer not null check (payout_cents > 0),
  currency text not null default 'COP' check (currency = 'COP'),
  status public.service_payment_status not null default 'awaiting_client_payment',
  payment_method_label text,
  paid_at timestamptz,
  bank_name text,
  account_type public.bank_account_type,
  account_number text,
  account_holder_name text,
  payout_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_payments_amount_breakdown_check
    check (amount_cents = platform_fee_cents + payout_cents)
);

create index service_payments_client_id_idx on public.service_payments (client_id);
create index service_payments_professional_id_idx on public.service_payments (professional_id);
create index service_payments_status_idx on public.service_payments (status);

create trigger service_payments_set_updated_at
before update on public.service_payments
for each row
execute function public.set_updated_at();

alter table public.service_payments enable row level security;

create policy service_payments_select_participant
on public.service_payments
for select
to authenticated
using (
  (select auth.uid()) = client_id
  or (select auth.uid()) = professional_id
);

create policy service_payments_update_client
on public.service_payments
for update
to authenticated
using ((select auth.uid()) = client_id)
with check ((select auth.uid()) = client_id);

create policy service_payments_update_professional
on public.service_payments
for update
to authenticated
using ((select auth.uid()) = professional_id)
with check ((select auth.uid()) = professional_id);

create or replace function public.create_service_payment_on_complete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offer public.service_offers%rowtype;
  v_fee integer;
begin
  if new.status <> 'completed' or old.status = 'completed' then
    return new;
  end if;

  if new.assigned_professional_id is null then
    return new;
  end if;

  if exists (
    select 1
    from public.service_payments sp
    where sp.service_request_id = new.id
  ) then
    return new;
  end if;

  select *
  into v_offer
  from public.service_offers so
  where so.service_request_id = new.id
    and so.status = 'accepted'
  order by so.created_at desc
  limit 1;

  if not found then
    return new;
  end if;

  v_fee := round(v_offer.amount_cents * 0.10)::integer;

  insert into public.service_payments (
    service_request_id,
    offer_id,
    client_id,
    professional_id,
    amount_cents,
    platform_fee_cents,
    payout_cents,
    currency,
    status
  )
  values (
    new.id,
    v_offer.id,
    new.client_id,
    new.assigned_professional_id,
    v_offer.amount_cents,
    v_fee,
    v_offer.amount_cents - v_fee,
    'COP',
    'awaiting_client_payment'
  );

  return new;
end;
$$;

drop trigger if exists service_requests_create_payment_on_complete on public.service_requests;

create trigger service_requests_create_payment_on_complete
after update of status on public.service_requests
for each row
execute function public.create_service_payment_on_complete();

create or replace function public.simulate_client_payment(
  p_service_request_id uuid,
  p_payment_method_label text default 'Tarjeta •••• 4242'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_payment public.service_payments%rowtype;
  v_title text;
  v_amount_label text;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select *
  into v_payment
  from public.service_payments
  where service_request_id = p_service_request_id
  for update;

  if not found then
    raise exception 'Pago no encontrado para esta solicitud.';
  end if;

  if v_payment.client_id <> v_user_id then
    raise exception 'Solo el cliente puede realizar el pago.';
  end if;

  if v_payment.status <> 'awaiting_client_payment' then
    raise exception 'Este pago ya fue procesado.';
  end if;

  update public.service_payments
  set
    status = 'paid_pending_payout',
    payment_method_label = coalesce(nullif(trim(p_payment_method_label), ''), 'Tarjeta •••• 4242'),
    paid_at = now()
  where id = v_payment.id;

  select coalesce(nullif(trim(sr.title), ''), 'Tu solicitud')
  into v_title
  from public.service_requests sr
  where sr.id = p_service_request_id;

  v_amount_label := to_char(v_payment.payout_cents, 'FM999G999G999') || ' COP';

  perform public.create_notification(
    v_payment.professional_id,
    'payment_pending_claim',
    'Pago por reclamar',
    'Tienes $' || v_amount_label || ' disponibles para retirar por "' || v_title || '".',
    jsonb_build_object(
      'jobId', p_service_request_id,
      'offerId', v_payment.offer_id
    )
  );

  return v_payment.id;
end;
$$;

create or replace function public.simulate_worker_payout(
  p_service_request_id uuid,
  p_bank_name text,
  p_account_type public.bank_account_type,
  p_account_number text,
  p_account_holder_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_payment public.service_payments%rowtype;
  v_title text;
  v_amount_label text;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if p_bank_name is null or trim(p_bank_name) = '' then
    raise exception 'Debes seleccionar un banco.';
  end if;

  if p_account_number is null or length(trim(p_account_number)) < 6 then
    raise exception 'Número de cuenta inválido.';
  end if;

  if p_account_holder_name is null or trim(p_account_holder_name) = '' then
    raise exception 'Debes indicar el titular de la cuenta.';
  end if;

  select *
  into v_payment
  from public.service_payments
  where service_request_id = p_service_request_id
  for update;

  if not found then
    raise exception 'Pago no encontrado para esta solicitud.';
  end if;

  if v_payment.professional_id <> v_user_id then
    raise exception 'Solo el trabajador asignado puede reclamar este pago.';
  end if;

  if v_payment.status <> 'paid_pending_payout' then
    raise exception 'Este pago no está disponible para retiro.';
  end if;

  update public.service_payments
  set
    status = 'payout_completed',
    bank_name = trim(p_bank_name),
    account_type = p_account_type,
    account_number = trim(p_account_number),
    account_holder_name = trim(p_account_holder_name),
    payout_completed_at = now()
  where id = v_payment.id;

  select coalesce(nullif(trim(sr.title), ''), 'Tu solicitud')
  into v_title
  from public.service_requests sr
  where sr.id = p_service_request_id;

  v_amount_label := to_char(v_payment.payout_cents, 'FM999G999G999') || ' COP';

  perform public.create_notification(
    v_payment.client_id,
    'payment_completed',
    'Pago completado',
    'El trabajador recibió $' || v_amount_label || ' por "' || v_title || '".',
    jsonb_build_object(
      'jobId', p_service_request_id,
      'offerId', v_payment.offer_id
    )
  );

  return v_payment.id;
end;
$$;

grant execute on function public.simulate_client_payment(uuid, text) to authenticated;
grant execute on function public.simulate_worker_payout(uuid, text, public.bank_account_type, text, text) to authenticated;
