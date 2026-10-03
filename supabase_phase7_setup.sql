-- ==============================================================================
-- PAWLIO — PHASE 7: PROFESSIONAL ADMIN DASHBOARD
-- Database Schema, Roles & Row Level Security (RLS) Setup
-- ==============================================================================

-- 1. ADD ROLE COLUMN TO PROFILES TABLE
-- Roles: 'user' (default) and 'admin'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. SERVICES RLS CONFIGURATION
-- The existing public.services table is preserved as-is (schema uses duration_minutes and active).
-- No tables are created or dropped.

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER FUNCTION TO VERIFY ADMIN STATUS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6. RLS POLICIES FOR PETS
DROP POLICY IF EXISTS "Admins can view all pets" ON public.pets;
CREATE POLICY "Admins can view all pets"
ON public.pets FOR SELECT
USING (auth.uid() = owner_id OR public.is_admin());

-- 7. RLS POLICIES FOR APPOINTMENTS
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can view all appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update all appointments" ON public.appointments;
CREATE POLICY "Admins can update all appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

-- 8. RLS POLICIES FOR SERVICES
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- HOW TO PROMOTE A USER TO ADMIN MANUALLY:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID_HERE';
-- ==============================================================================
