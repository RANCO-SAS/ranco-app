-- Subscription plans (free / pro per role) and user subscriptions

create type public.subscription_target_role as enum (
  'client',
  'professional'
);

create type public.subscription_plan_tier as enum (
  'free',
  'pro'
);

create type public.subscription_status as enum (
  'active',
  'cancelled'
);

create type public.subscription_billing_cycle as enum (
  'none',
  'monthly',
  'annual'
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  target_role public.subscription_target_role not null,
  tier public.subscription_plan_tier not null,
  price_monthly_cents integer not null default 0 check (price_monthly_cents >= 0),
  price_annual_cents integer not null default 0 check (price_annual_cents >= 0),
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint subscription_plans_role_tier_unique unique (target_role, tier)
);

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id) on delete restrict,
  target_role public.subscription_target_role not null,
  status public.subscription_status not null default 'active',
  billing_cycle public.subscription_billing_cycle not null default 'none',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_user_role_unique unique (user_id, target_role)
);

create index user_subscriptions_user_id_idx on public.user_subscriptions (user_id);
create index user_subscriptions_plan_id_idx on public.user_subscriptions (plan_id);
create index user_subscriptions_target_role_idx on public.user_subscriptions (target_role);

create trigger user_subscriptions_set_updated_at
before update on public.user_subscriptions
for each row
execute function public.set_updated_at();

alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

create policy subscription_plans_select_authenticated
on public.subscription_plans
for select
to authenticated
using (is_active = true);

create policy user_subscriptions_select_own
on public.user_subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

insert into public.subscription_plans (
  slug,
  name,
  description,
  target_role,
  tier,
  price_monthly_cents,
  price_annual_cents,
  features,
  sort_order
)
values
  (
    'free_client',
    'Plan Gratuito',
    'Funciones esenciales para publicar servicios.',
    'client',
    'free',
    0,
    0,
    '["Publicar solicitudes de servicio","Perfil de cliente básico","Tarifa estándar de plataforma (5% + 5%)"]'::jsonb,
    0
  ),
  (
    'pro_client',
    'Ranco Pro Cliente',
    'Consigue mejores profesionales más rápido.',
    'client',
    'pro',
    2990000,
    28704000,
    '["Ofertas destacadas y priorizadas","Mayor visibilidad ante profesionales compatibles","Etiqueta de solicitud prioritaria","Filtros avanzados de reputación y experiencia","Soporte prioritario","Métricas e historial avanzado de contrataciones"]'::jsonb,
    1
  ),
  (
    'free_professional',
    'Plan Gratuito',
    'Funciones esenciales para empezar a trabajar.',
    'professional',
    'free',
    0,
    0,
    '["Acceso al feed de oportunidades","Perfil profesional básico","Tarifa estándar de plataforma (5% + 5%)"]'::jsonb,
    0
  ),
  (
    'pro_professional',
    'Ranco Pro Profesional',
    'Consigue más trabajos con mayor visibilidad.',
    'professional',
    'pro',
    2990000,
    28704000,
    '["Insignia Pro en el perfil","Mayor visibilidad en postulaciones","Prioridad en resultados de búsqueda","Estadísticas avanzadas de desempeño","Mayor radio de alcance para encontrar trabajos","Herramientas de gestión (agenda e historial)"]'::jsonb,
    1
  );

create or replace function public.is_user_pro(
  p_user_id uuid,
  p_role public.subscription_target_role
)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.user_subscriptions us
    inner join public.subscription_plans sp on sp.id = us.plan_id
    where us.user_id = p_user_id
      and us.target_role = p_role
      and us.status = 'active'
      and sp.tier = 'pro'
  );
$$;

create or replace function public.ensure_user_default_subscriptions(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.user_profiles%rowtype;
  v_plan_id uuid;
begin
  select *
  into v_profile
  from public.user_profiles
  where id = p_user_id;

  if not found then
    return;
  end if;

  if v_profile.is_client then
    if not exists (
      select 1
      from public.user_subscriptions
      where user_id = p_user_id
        and target_role = 'client'
    ) then
      select id into v_plan_id
      from public.subscription_plans
      where target_role = 'client'
        and tier = 'free';

      insert into public.user_subscriptions (
        user_id,
        plan_id,
        target_role,
        status,
        billing_cycle
      )
      values (
        p_user_id,
        v_plan_id,
        'client',
        'active',
        'none'
      );
    end if;
  end if;

  if v_profile.is_professional then
    if not exists (
      select 1
      from public.user_subscriptions
      where user_id = p_user_id
        and target_role = 'professional'
    ) then
      select id into v_plan_id
      from public.subscription_plans
      where target_role = 'professional'
        and tier = 'free';

      insert into public.user_subscriptions (
        user_id,
        plan_id,
        target_role,
        status,
        billing_cycle
      )
      values (
        p_user_id,
        v_plan_id,
        'professional',
        'active',
        'none'
      );
    end if;
  end if;
end;
$$;

create or replace function public.sync_user_subscriptions_on_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.onboarding_completed_at is not null then
    perform public.ensure_user_default_subscriptions(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists user_profiles_sync_subscriptions on public.user_profiles;

create trigger user_profiles_sync_subscriptions
after insert or update of is_client, is_professional, onboarding_completed_at
on public.user_profiles
for each row
execute function public.sync_user_subscriptions_on_profile_change();

do $$
declare
  v_user record;
begin
  for v_user in
    select id
    from public.user_profiles
    where onboarding_completed_at is not null
  loop
    perform public.ensure_user_default_subscriptions(v_user.id);
  end loop;
end;
$$;

create or replace function public.get_user_active_subscription(
  p_user_id uuid,
  p_role public.subscription_target_role
)
returns table (
  subscription_id uuid,
  plan_id uuid,
  plan_slug text,
  plan_name text,
  plan_description text,
  target_role public.subscription_target_role,
  tier public.subscription_plan_tier,
  price_monthly_cents integer,
  price_annual_cents integer,
  features jsonb,
  status public.subscription_status,
  billing_cycle public.subscription_billing_cycle,
  current_period_start timestamptz,
  current_period_end timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    us.id as subscription_id,
    sp.id as plan_id,
    sp.slug as plan_slug,
    sp.name as plan_name,
    sp.description as plan_description,
    sp.target_role,
    sp.tier,
    sp.price_monthly_cents,
    sp.price_annual_cents,
    sp.features,
    us.status,
    us.billing_cycle,
    us.current_period_start,
    us.current_period_end
  from public.user_subscriptions us
  inner join public.subscription_plans sp on sp.id = us.plan_id
  where us.user_id = p_user_id
    and us.target_role = p_role
    and us.status = 'active'
  limit 1;
$$;

create or replace function public.simulate_change_subscription(
  p_target_role public.subscription_target_role,
  p_tier public.subscription_plan_tier,
  p_billing_cycle public.subscription_billing_cycle default 'none'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.user_profiles%rowtype;
  v_plan public.subscription_plans%rowtype;
  v_period_end timestamptz;
  v_subscription_id uuid;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select *
  into v_profile
  from public.user_profiles
  where id = v_user_id;

  if not found then
    raise exception 'Perfil no encontrado.';
  end if;

  if p_target_role = 'client' and not v_profile.is_client then
    raise exception 'Tu cuenta no tiene rol de cliente.';
  end if;

  if p_target_role = 'professional' and not v_profile.is_professional then
    raise exception 'Tu cuenta no tiene rol de profesional.';
  end if;

  select *
  into v_plan
  from public.subscription_plans
  where target_role = p_target_role
    and tier = p_tier
    and is_active = true;

  if not found then
    raise exception 'Plan no encontrado.';
  end if;

  if p_tier = 'free' then
    v_period_end := null;
  elsif p_billing_cycle = 'monthly' then
    v_period_end := now() + interval '1 month';
  elsif p_billing_cycle = 'annual' then
    v_period_end := now() + interval '1 year';
  else
    raise exception 'Debes seleccionar un ciclo de facturación para el plan Pro.';
  end if;

  insert into public.user_subscriptions (
    user_id,
    plan_id,
    target_role,
    status,
    billing_cycle,
    current_period_start,
    current_period_end
  )
  values (
    v_user_id,
    v_plan.id,
    p_target_role,
    'active',
    case when p_tier = 'free' then 'none'::public.subscription_billing_cycle else p_billing_cycle end,
    now(),
    v_period_end
  )
  on conflict (user_id, target_role)
  do update set
    plan_id = excluded.plan_id,
    status = 'active',
    billing_cycle = excluded.billing_cycle,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    updated_at = now()
  returning id into v_subscription_id;

  return v_subscription_id;
end;
$$;

create or replace function public.get_pro_status_for_users(
  p_user_ids uuid[],
  p_role public.subscription_target_role
)
returns table (
  user_id uuid,
  is_pro boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    uid as user_id,
    public.is_user_pro(uid, p_role) as is_pro
  from unnest(p_user_ids) as uid;
$$;

drop function if exists public.get_featured_professionals(integer, uuid[]);

create or replace function public.get_featured_professionals(
  p_limit integer default 8,
  p_subcategory_ids uuid[] default null
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  subcategory_id uuid,
  subcategory_name text,
  category_slug text,
  average_rating numeric,
  review_count bigint,
  is_pro boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  with professional_reviews as (
    select
      review.reviewee_id as professional_id,
      count(*)::bigint as review_count,
      round(avg(review.rating)::numeric, 2) as average_rating
    from public.reviews review
    where review.reviewee_role = 'professional'
    group by review.reviewee_id
    having count(*) >= 1
      and avg(review.rating) >= 4.0
  ),
  professional_areas as (
    select
      profile.id as professional_id,
      profile.full_name,
      profile.avatar_url,
      area.subcategory_id,
      subcategory.name as subcategory_name,
      category.slug as category_slug,
      coalesce(reviews.review_count, 0)::bigint as review_count,
      coalesce(reviews.average_rating, 0)::numeric as average_rating,
      public.is_user_pro(profile.id, 'professional') as is_pro
    from public.user_profiles profile
    inner join public.professional_service_areas area
      on area.user_id = profile.id
    inner join public.service_subcategories subcategory
      on subcategory.id = area.subcategory_id
    inner join public.service_categories category
      on category.id = subcategory.category_id
    inner join professional_reviews reviews
      on reviews.professional_id = profile.id
    where profile.is_professional = true
      and profile.onboarding_completed_at is not null
      and profile.id <> (select auth.uid())
      and (
        p_subcategory_ids is null
        or area.subcategory_id = any (p_subcategory_ids)
      )
  ),
  ranked_areas as (
    select
      professional_areas.*,
      row_number() over (
        partition by professional_areas.professional_id
        order by professional_areas.review_count desc, professional_areas.subcategory_name asc
      ) as area_rank
    from professional_areas
  )
  select
    ranked_areas.professional_id as id,
    ranked_areas.full_name,
    ranked_areas.avatar_url,
    ranked_areas.subcategory_id,
    ranked_areas.subcategory_name,
    ranked_areas.category_slug,
    ranked_areas.average_rating,
    ranked_areas.review_count,
    ranked_areas.is_pro
  from ranked_areas
  where ranked_areas.area_rank = 1
  order by ranked_areas.is_pro desc, random()
  limit greatest(coalesce(p_limit, 8), 1);
$$;

revoke all on function public.is_user_pro(uuid, public.subscription_target_role) from public;
grant execute on function public.is_user_pro(uuid, public.subscription_target_role) to authenticated;

revoke all on function public.ensure_user_default_subscriptions(uuid) from public;
grant execute on function public.ensure_user_default_subscriptions(uuid) to authenticated;

revoke all on function public.get_user_active_subscription(uuid, public.subscription_target_role) from public;
grant execute on function public.get_user_active_subscription(uuid, public.subscription_target_role) to authenticated;

revoke all on function public.simulate_change_subscription(public.subscription_target_role, public.subscription_plan_tier, public.subscription_billing_cycle) from public;
grant execute on function public.simulate_change_subscription(public.subscription_target_role, public.subscription_plan_tier, public.subscription_billing_cycle) to authenticated;

revoke all on function public.get_pro_status_for_users(uuid[], public.subscription_target_role) from public;
grant execute on function public.get_pro_status_for_users(uuid[], public.subscription_target_role) to authenticated;

revoke all on function public.get_featured_professionals(integer, uuid[]) from public;
grant execute on function public.get_featured_professionals(integer, uuid[]) to authenticated;
