alter table public.reviews replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.reviews;
exception
  when duplicate_object then null;
end $$;
