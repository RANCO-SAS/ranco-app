-- Split platform fee: 5% client surcharge + 5% worker deduction on agreed price

alter table public.service_payments
  add column if not exists client_fee_cents integer,
  add column if not exists worker_fee_cents integer,
  add column if not exists client_total_cents integer;

alter table public.service_payments
  drop constraint if exists service_payments_amount_breakdown_check;

update public.service_payments
set
  client_fee_cents = round(amount_cents * 0.05)::integer,
  worker_fee_cents = round(amount_cents * 0.05)::integer,
  client_total_cents = amount_cents + round(amount_cents * 0.05)::integer,
  platform_fee_cents = round(amount_cents * 0.05)::integer + round(amount_cents * 0.05)::integer,
  payout_cents = amount_cents - round(amount_cents * 0.05)::integer;

alter table public.service_payments
  alter column client_fee_cents set not null,
  alter column worker_fee_cents set not null,
  alter column client_total_cents set not null;

alter table public.service_payments
  add constraint service_payments_amount_breakdown_check
  check (
    client_fee_cents >= 0
    and worker_fee_cents >= 0
    and platform_fee_cents = client_fee_cents + worker_fee_cents
    and payout_cents = amount_cents - worker_fee_cents
    and client_total_cents = amount_cents + client_fee_cents
    and payout_cents > 0
  );

create or replace function public.create_service_payment_on_complete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offer public.service_offers%rowtype;
  v_client_fee integer;
  v_worker_fee integer;
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

  v_client_fee := round(v_offer.amount_cents * 0.05)::integer;
  v_worker_fee := round(v_offer.amount_cents * 0.05)::integer;

  insert into public.service_payments (
    service_request_id,
    offer_id,
    client_id,
    professional_id,
    amount_cents,
    client_fee_cents,
    worker_fee_cents,
    platform_fee_cents,
    client_total_cents,
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
    v_client_fee,
    v_worker_fee,
    v_client_fee + v_worker_fee,
    v_offer.amount_cents + v_client_fee,
    v_offer.amount_cents - v_worker_fee,
    'COP',
    'awaiting_client_payment'
  );

  return new;
end;
$$;
