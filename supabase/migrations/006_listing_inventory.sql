-- Migration 006: Per-Size Inventory

-- Create listing_inventory table
create table if not exists listing_inventory (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  size text not null,
  quantity int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(listing_id, size)
);

-- Add size column to order_requests
alter table order_requests 
add column if not exists size text;

-- Auto-update updated_at via trigger function
create trigger set_updated_at_listing_inventory
  before update on listing_inventory
  for each row execute function handle_updated_at();

-- Migrate existing size from listings to listing_inventory
insert into listing_inventory (listing_id, size, quantity)
select id, size, 1
from listings
where size is not null and size != ''
on conflict (listing_id, size) do nothing;
