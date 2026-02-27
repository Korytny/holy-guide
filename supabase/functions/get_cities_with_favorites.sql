-- RPC function to get cities with favorites count
create or replace function get_cities_with_favorites()
returns table (
  id uuid,
  name jsonb,
  image_url text,
  country text,
  events_count bigint,
  routes_count bigint,
  spots_count bigint,
  favorites_count bigint,
  info jsonb,
  images jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
stable
as $$
  select
    c.*,
    (
      select count(*)
      from profiles p
      where c.id = any(p.cities_like)
    ) as favorites_count
  from cities c
  order by c.spots_count desc;
$$;

-- RPC function to get a single city with favorites count
create or replace function get_city_with_favorites(city_id uuid)
returns table (
  id uuid,
  name jsonb,
  image_url text,
  country text,
  events_count bigint,
  routes_count bigint,
  spots_count bigint,
  favorites_count bigint,
  info jsonb,
  images jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
stable
as $$
  select
    c.*,
    (
      select count(*)
      from profiles p
      where c.id = any(p.cities_like)
    ) as favorites_count
  from cities c
  where c.id = city_id;
$$;
