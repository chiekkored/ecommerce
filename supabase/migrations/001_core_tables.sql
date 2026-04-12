-- ============================================================
-- Migration 001: Core Tables
-- ============================================================

-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('admin', 'staff', 'superadmin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  price numeric not null,
  size text,
  description text,
  category_id uuid references categories(id) on delete set null,
  is_active boolean default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- listing_photos
create table if not exists listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  alt_text text,
  created_at timestamptz default now()
);

-- order_requests
create table if not exists order_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique,
  listing_id uuid references listings(id) on delete set null,
  buyer_name text not null,
  buyer_email text,
  buyer_phone text,
  quantity int default 1,
  message text,
  status text default 'new' check (
    status in ('new', 'contacted', 'pending_payment', 'closed', 'cancelled')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at via trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on profiles
  for each row execute function handle_updated_at();

create trigger set_updated_at_listings
  before update on listings
  for each row execute function handle_updated_at();

create trigger set_updated_at_order_requests
  before update on order_requests
  for each row execute function handle_updated_at();

-- Auto-create profile on new auth user
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
