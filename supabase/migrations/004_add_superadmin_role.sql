-- ============================================================
-- Migration: Add Superadmin Role
-- ============================================================

-- Update the check constraint on profiles.role
-- Note: We have to drop and recreate the constraint because it's check constraint.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('superadmin', 'admin', 'staff'));

-- Update the is_admin_or_staff() function
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update handle_new_user to include role from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'staff')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
