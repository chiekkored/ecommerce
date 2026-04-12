-- ============================================================
-- Migration 003: Storage Buckets
-- ============================================================

-- Create listing-images bucket (public)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Public can read files in listing-images
create policy "listing-images: public read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Admin/staff can upload files
create policy "listing-images: admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and is_admin_or_staff()
  );

-- Admin/staff can update files
create policy "listing-images: admin update"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and is_admin_or_staff()
  );

-- Admin/staff can delete files
create policy "listing-images: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and is_admin_or_staff()
  );
