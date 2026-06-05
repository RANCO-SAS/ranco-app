alter type public.notification_type add value if not exists 'payment_pending_claim';
alter type public.notification_type add value if not exists 'payment_completed';

alter table public.notification_preferences
  add column if not exists payment_pending_claim boolean not null default true,
  add column if not exists payment_completed boolean not null default true;

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
    when 'payment_pending_claim' then np.payment_pending_claim
    when 'payment_completed' then np.payment_completed
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
