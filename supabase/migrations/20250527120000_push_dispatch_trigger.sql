create extension if not exists pg_net with schema extensions;

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
  v_project_url := current_setting('app.settings.supabase_url', true);
  v_dispatch_secret := current_setting('app.settings.push_dispatch_secret', true);

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

drop trigger if exists notifications_dispatch_push on public.notifications;

create trigger notifications_dispatch_push
after insert on public.notifications
for each row
execute function public.dispatch_push_for_notification();
