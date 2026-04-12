-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table order_requests enable row level security;

-- Helper function: check if current user is admin or staff
create or replace function is_admin_or_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('admin', 'staff', 'superadmin')
  );
$$ language sql security definer stable;

-- ----------------------------------------
-- profiles
-- ----------------------------------------
-- Users can view their own profile
create policy "profiles: own read"
  on profiles for select
  using (auth.uid() = id);

-- Admin/staff can read all profiles
create policy "profiles: admin read all"
  on profiles for select
  using (is_admin_or_staff());

-- Users can update their own profile
create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id);

-- Admin can update any profile
create policy "profiles: admin update all"
  on profiles for update
  using (is_admin_or_staff());

-- ----------------------------------------
-- categories
-- ----------------------------------------
-- Anyone can read categories
create policy "categories: public read"
  on categories for select
  using (true);

-- Only admin/staff can manage categories
create policy "categories: admin write"
  on categories for insert
  with check (is_admin_or_staff());

create policy "categories: admin update"
  on categories for update
  using (is_admin_or_staff());

create policy "categories: admin delete"
  on categories for delete
  using (is_admin_or_staff());

-- ----------------------------------------
-- listings
-- ----------------------------------------
-- Anyone can read active listings
create policy "listings: public read active"
  on listings for select
  using (is_active = true);

-- Admin/staff can read all listings (including inactive)
create policy "listings: admin read all"
  on listings for select
  using (is_admin_or_staff());

-- Admin/staff can manage listings
create policy "listings: admin insert"
  on listings for insert
  with check (is_admin_or_staff());

create policy "listings: admin update"
  on listings for update
  using (is_admin_or_staff());

create policy "listings: admin delete"
  on listings for delete
  using (is_admin_or_staff());

-- ----------------------------------------
-- listing_photos
-- ----------------------------------------
-- Anyone can read photos (for active listings — filtered at app level)
create policy "listing_photos: public read"
  on listing_photos for select
  using (true);

-- Admin/staff can manage photos
create policy "listing_photos: admin insert"
  on listing_photos for insert
  with check (is_admin_or_staff());

create policy "listing_photos: admin update"
  on listing_photos for update
  using (is_admin_or_staff());

create policy "listing_photos: admin delete"
  on listing_photos for delete
  using (is_admin_or_staff());

-- ----------------------------------------
-- order_requests
-- ----------------------------------------
-- Anyone (including anon) can create an order request
create policy "order_requests: public insert"
  on order_requests for insert
  with check (true);

-- Only admin/staff can read order requests
create policy "order_requests: admin read"
  on order_requests for select
  using (is_admin_or_staff());

-- Only admin/staff can update order requests
create policy "order_requests: admin update"
  on order_requests for update
  using (is_admin_or_staff());

-- Only admin can delete order requests
create policy "order_requests: admin delete"
  on order_requests for delete
  using (is_admin_or_staff());
