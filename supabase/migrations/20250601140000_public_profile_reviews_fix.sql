-- Public profile reviews: reviewer visibility + explicit reviewee_role.

create or replace function public.is_profile_visible_to_user(profile_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    (select auth.uid()) is not null
    and (
      profile_id = (select auth.uid())
      or exists (
        select 1
        from public.user_profiles profile
        where profile.id = profile_id
          and profile.is_professional = true
      )
      or exists (
        select 1
        from public.conversations conversation
        where (
          conversation.client_id = (select auth.uid())
          and conversation.professional_id = profile_id
        )
        or (
          conversation.professional_id = (select auth.uid())
          and conversation.client_id = profile_id
        )
      )
      or exists (
        select 1
        from public.service_requests service_request
        where service_request.status = 'completed'
          and (
            (
              service_request.client_id = (select auth.uid())
              and service_request.assigned_professional_id = profile_id
            )
            or (
              service_request.assigned_professional_id = (select auth.uid())
              and service_request.client_id = profile_id
            )
          )
      )
      or (
        public.auth_user_is_professional()
        and exists (
          select 1
          from public.service_requests service_request
          where service_request.client_id = profile_id
            and service_request.status in ('published', 'in_negotiation')
            and service_request.assigned_professional_id is null
        )
      )
      or exists (
        select 1
        from public.reviews review
        inner join public.user_profiles reviewee
          on reviewee.id = review.reviewee_id
        where review.reviewer_id = profile_id
          and reviewee.onboarding_completed_at is not null
      )
    );
$$;

alter table public.reviews
  add column if not exists reviewee_role text;

update public.reviews
set reviewee_role = case
  when coalesce(traits ? 'quality', false)
    or coalesce(traits ? 'punctuality', false)
    or coalesce(traits ? 'professionalism', false)
    then 'professional'
  else 'client'
end
where reviewee_role is null;

alter table public.reviews
  alter column reviewee_role set default 'client';

alter table public.reviews
  alter column reviewee_role set not null;

alter table public.reviews
  drop constraint if exists reviews_reviewee_role_check;

alter table public.reviews
  add constraint reviews_reviewee_role_check
  check (reviewee_role in ('client', 'professional'));

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
  review_count bigint
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
      coalesce(reviews.average_rating, 0)::numeric as average_rating
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
    ranked_areas.review_count
  from ranked_areas
  where ranked_areas.area_rank = 1
  order by random()
  limit greatest(coalesce(p_limit, 8), 1);
$$;
