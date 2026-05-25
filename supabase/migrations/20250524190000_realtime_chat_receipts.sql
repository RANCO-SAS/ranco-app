alter table public.messages
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz;

alter table public.messages replica identity full;
alter table public.service_requests replica identity full;
alter table public.conversations replica identity full;

create or replace function public.mark_messages_delivered(p_message_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.messages m
  set delivered_at = now()
  from public.conversations c
  where m.id = any(p_message_ids)
    and m.conversation_id = c.id
    and m.sender_id <> (select auth.uid())
    and (
      c.client_id = (select auth.uid())
      or c.professional_id = (select auth.uid())
    )
    and m.delivered_at is null;
end;
$$;

create or replace function public.mark_messages_read(p_message_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.messages m
  set
    delivered_at = coalesce(m.delivered_at, now()),
    read_at = now()
  from public.conversations c
  where m.id = any(p_message_ids)
    and m.conversation_id = c.id
    and m.sender_id <> (select auth.uid())
    and (
      c.client_id = (select auth.uid())
      or c.professional_id = (select auth.uid())
    )
    and m.read_at is null;
end;
$$;

grant execute on function public.mark_messages_delivered(uuid[]) to authenticated;
grant execute on function public.mark_messages_read(uuid[]) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.service_requests;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception
  when duplicate_object then null;
end $$;
