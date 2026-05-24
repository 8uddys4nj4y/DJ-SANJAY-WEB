-- Enable UUID generation if needed
create extension if not exists pgcrypto;

-- BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  ref_number text,
  package_type text,
  event_date date,
  district text,
  area text,
  event_type text,
  location text,
  status text not null default 'new',
  total_amount numeric(12,2) default 0,
  package_revenue numeric(12,2) default 0,
  dj_revenue numeric(12,2) default 2000,
  transport_fee numeric(12,2) default 0,
  bill_url text,
  admin_notes text,
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings add column if not exists package_revenue numeric(12,2) default 0;
alter table public.bookings add column if not exists dj_revenue numeric(12,2) default 2000;

update public.bookings
set package_revenue = total_amount - 2000
where package_revenue = 0;

-- REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  comment text not null,
  rating numeric(2,1) not null default 5,
  approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ADMIN METRICS TABLE
create table if not exists public.admin_metrics (
  id serial primary key,
  total_booked int default 0,
  total_completed int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_metrics add column if not exists total_booked int default 0;
alter table public.admin_metrics add column if not exists total_completed int default 0;

-- Auto-update timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

drop trigger if exists admin_metrics_set_updated_at on public.admin_metrics;
create trigger admin_metrics_set_updated_at
before update on public.admin_metrics
for each row
execute function public.set_updated_at();