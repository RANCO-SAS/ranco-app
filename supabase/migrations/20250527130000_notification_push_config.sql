create table if not exists public.notification_push_config (
  id integer primary key default 1 check (id = 1),
  supabase_url text not null,
  push_dispatch_secret text not null,
  updated_at timestamptz not null default now()
);

alter table public.notification_push_config enable row level security;

revoke all on table public.notification_push_config from anon, authenticated;

create or replace function public.dispatch_push_for_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_url text;
  v_dispatch_secret text;
begin
  select npc.supabase_url, npc.push_dispatch_secret
  into v_project_url, v_dispatch_secret
  from public.notification_push_config npc
  where npc.id = 1;

  if v_project_url is null or v_dispatch_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := v_project_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-dispatch-secret', v_dispatch_secret
    ),
    body := jsonb_build_object('notificationId', new.id)
  );

  return new;
exception
  when others then
    return new;
end;
$$;
