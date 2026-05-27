create type public.notification_type as enum (
  'job_opportunity',
  'new_message',
  'new_review',
  'job_status',
  'new_conversation'
);

create table public.notification_preferences (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  job_opportunity boolean not null default true,
  new_message boolean not null default true,
  new_review boolean not null default true,
  job_status boolean not null default true,
  new_conversation boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row
execute function public.set_updated_at();

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  device_name text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

create index notifications_user_id_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notification_preferences enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notifications enable row level security;

alter table public.notifications replica identity full;

create policy "Users manage own notification preferences"
on public.notification_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own push tokens"
on public.push_tokens
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users read own notifications"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users update own notifications"
on public.notifications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.ensure_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists user_profiles_create_notification_preferences on public.user_profiles;

create trigger user_profiles_create_notification_preferences
after insert on public.user_profiles
for each row
execute function public.ensure_notification_preferences();

insert into public.notification_preferences (user_id)
select id
from public.user_profiles
on conflict (user_id) do nothing;

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

create or replace function public.notify_job_opportunity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_professional_id uuid;
  v_title text;
begin
  if new.status <> 'published' then
    return new;
  end if;

  v_title := coalesce(nullif(trim(new.title), ''), 'Nueva solicitud');

  for v_professional_id in
    select distinct psa.user_id
    from public.professional_service_areas psa
    inner join public.user_profiles up on up.id = psa.user_id
    where psa.subcategory_id = new.subcategory_id
      and up.is_professional = true
      and psa.user_id <> new.client_id
  loop
    perform public.create_notification(
      v_professional_id,
      'job_opportunity',
      'Nueva oportunidad',
      v_title,
      jsonb_build_object(
        'jobId', new.id,
        'subcategoryId', new.subcategory_id
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists service_requests_notify_job_opportunity on public.service_requests;

create trigger service_requests_notify_job_opportunity
after insert on public.service_requests
for each row
execute function public.notify_job_opportunity();

create or replace function public.notify_new_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
begin
  select coalesce(nullif(trim(sr.title), ''), 'Tu solicitud')
  into v_title
  from public.service_requests sr
  where sr.id = new.service_request_id;

  perform public.create_notification(
    new.client_id,
    'new_conversation',
    'Nuevo contacto',
    'Un profesional quiere hablar contigo sobre "' || v_title || '".',
    jsonb_build_object(
      'conversationId', new.id,
      'jobId', new.service_request_id
    )
  );

  return new;
end;
$$;

drop trigger if exists conversations_notify_new_conversation on public.conversations;

create trigger conversations_notify_new_conversation
after insert on public.conversations
for each row
execute function public.notify_new_conversation();

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

drop trigger if exists messages_notify_new_message on public.messages;

create trigger messages_notify_new_message
after insert on public.messages
for each row
execute function public.notify_new_message();

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer_name text;
begin
  select coalesce(nullif(trim(up.full_name), ''), 'Alguien')
  into v_reviewer_name
  from public.user_profiles up
  where up.id = new.reviewer_id;

  perform public.create_notification(
    new.reviewee_id,
    'new_review',
    'Nueva reseña',
    v_reviewer_name || ' te dejó una reseña.',
    jsonb_build_object(
      'reviewId', new.id,
      'jobId', new.service_request_id
    )
  );

  return new;
end;
$$;

drop trigger if exists reviews_notify_new_review on public.reviews;

create trigger reviews_notify_new_review
after insert on public.reviews
for each row
execute function public.notify_new_review();

create or replace function public.notify_job_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body text;
  v_recipient_id uuid;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_title := coalesce(nullif(trim(new.title), ''), 'Tu solicitud');

  if new.status = 'accepted' and new.assigned_professional_id is not null then
    perform public.create_notification(
      new.assigned_professional_id,
      'job_status',
      'Trabajo aceptado',
      'Te eligieron para "' || v_title || '".',
      jsonb_build_object('jobId', new.id, 'status', new.status)
    );
    return new;
  end if;

  if new.status in ('in_progress', 'completed', 'cancelled') then
    v_body := case new.status
      when 'in_progress' then 'El trabajo "' || v_title || '" está en progreso.'
      when 'completed' then 'El trabajo "' || v_title || '" fue completado.'
      when 'cancelled' then 'El trabajo "' || v_title || '" fue cancelado.'
      else 'El estado de "' || v_title || '" cambió.'
    end;

    if new.assigned_professional_id is not null then
      perform public.create_notification(
        new.client_id,
        'job_status',
        'Actualización de solicitud',
        v_body,
        jsonb_build_object('jobId', new.id, 'status', new.status)
      );

      if new.assigned_professional_id <> new.client_id then
        perform public.create_notification(
          new.assigned_professional_id,
          'job_status',
          'Actualización de trabajo',
          v_body,
          jsonb_build_object('jobId', new.id, 'status', new.status)
        );
      end if;
    else
      perform public.create_notification(
        new.client_id,
        'job_status',
        'Actualización de solicitud',
        v_body,
        jsonb_build_object('jobId', new.id, 'status', new.status)
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists service_requests_notify_job_status on public.service_requests;

create trigger service_requests_notify_job_status
after update on public.service_requests
for each row
execute function public.notify_job_status_change();

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
