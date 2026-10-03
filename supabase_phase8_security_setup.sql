-- ==============================================================================
-- PAWLIO — PHASE 8: SECURITY, SUPABASE RLS AND DATA PROTECTION
-- Pure Security Migration: Row Level Security (RLS), Role Protection & Isolation
-- Compatible with Existing PAWLIO Database (No Table Recreation)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER: IS_ADMIN()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. PROFILES SECURITY & ROLE TAMPERING PROTECTION
-- Existing columns: id (UUID), full_name, phone, avatar_url, role, created_at, updated_at
-- ------------------------------------------------------------------------------
-- Ensure role column exists with default 'user' if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Trigger Function: Prevent regular users from elevating their role to 'admin'
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can modify user account roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Profiles select policy"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Profiles insert policy"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. PETS SECURITY & OWNER ISOLATION
-- Existing columns: id (UUID), owner_id (UUID), name, species, breed, gender,
-- date_of_birth, weight, color, allergies, medical_conditions, emergency_information, photo_url, created_at
-- ------------------------------------------------------------------------------
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pets select policy" ON public.pets;
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Admins can view all pets" ON public.pets;
CREATE POLICY "Pets select policy"
ON public.pets FOR SELECT
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Pets insert policy" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
CREATE POLICY "Pets insert policy"
ON public.pets FOR INSERT
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Pets update policy" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
CREATE POLICY "Pets update policy"
ON public.pets FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Pets delete policy" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;
CREATE POLICY "Pets delete policy"
ON public.pets FOR DELETE
USING (auth.uid() = owner_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. APPOINTMENTS SECURITY & OWNER-PET INTEGRITY
-- Existing columns: id (UUID), owner_id (UUID), pet_id (UUID), service_type,
-- appointment_date, appointment_time, status, notes, created_at
-- ------------------------------------------------------------------------------
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Appointments select policy" ON public.appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Appointments select policy"
ON public.appointments FOR SELECT
USING (auth.uid() = owner_id OR public.is_admin());

-- Enforce that an appointment can ONLY be inserted for a pet owned by the authenticated user
DROP POLICY IF EXISTS "Appointments insert policy" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
CREATE POLICY "Appointments insert policy"
ON public.appointments FOR INSERT
WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.pets WHERE id = appointments.pet_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Appointments update policy" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update all appointments" ON public.appointments;
CREATE POLICY "Appointments update policy"
ON public.appointments FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Appointments delete policy" ON public.appointments;
CREATE POLICY "Appointments delete policy"
ON public.appointments FOR DELETE
USING (auth.uid() = owner_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. HEALTH RECORDS SECURITY & OWNER-PET ISOLATION
-- Existing columns: id (UUID), owner_id (UUID), pet_id (UUID), record_type,
-- title, description, record_date, veterinarian, follow_up_date, notes, created_at
-- ------------------------------------------------------------------------------
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Health records select policy" ON public.health_records;
DROP POLICY IF EXISTS "Users can view their own pet health records" ON public.health_records;
CREATE POLICY "Health records select policy"
ON public.health_records FOR SELECT
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Health records insert policy" ON public.health_records;
DROP POLICY IF EXISTS "Users can insert their own pet health records" ON public.health_records;
CREATE POLICY "Health records insert policy"
ON public.health_records FOR INSERT
WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Health records update policy" ON public.health_records;
DROP POLICY IF EXISTS "Users can update their own pet health records" ON public.health_records;
CREATE POLICY "Health records update policy"
ON public.health_records FOR UPDATE
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
)
WITH CHECK (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Health records delete policy" ON public.health_records;
DROP POLICY IF EXISTS "Users can delete their own pet health records" ON public.health_records;
CREATE POLICY "Health records delete policy"
ON public.health_records FOR DELETE
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 6. VACCINATIONS SECURITY & OWNER-PET ISOLATION
-- Existing columns: id (UUID), owner_id (UUID), pet_id (UUID), vaccine_name,
-- date_given, next_due_date, notes, veterinarian, created_at
-- ------------------------------------------------------------------------------
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vaccinations select policy" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can view their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Vaccinations select policy"
ON public.vaccinations FOR SELECT
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Vaccinations insert policy" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can insert their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Vaccinations insert policy"
ON public.vaccinations FOR INSERT
WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Vaccinations update policy" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can update their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Vaccinations update policy"
ON public.vaccinations FOR UPDATE
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
)
WITH CHECK (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Vaccinations delete policy" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can delete their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Vaccinations delete policy"
ON public.vaccinations FOR DELETE
USING (
    (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid()))
    OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS SECURITY & USER ISOLATION
-- Existing columns: id (UUID), user_id (UUID), title, message, type, is_read, created_at
-- Real read-state column: is_read (BOOLEAN)
-- ------------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Notifications select policy"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications insert policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Notifications insert policy"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Notifications update policy"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications delete policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Notifications delete policy"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. REMINDERS SECURITY & USER ISOLATION
-- Existing columns: id (UUID), user_id (UUID), pet_id (UUID), title,
-- reminder_type, due_date, is_completed, created_at
-- ------------------------------------------------------------------------------
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reminders select policy" ON public.reminders;
CREATE POLICY "Reminders select policy"
ON public.reminders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Reminders insert policy" ON public.reminders;
CREATE POLICY "Reminders insert policy"
ON public.reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reminders update policy" ON public.reminders;
CREATE POLICY "Reminders update policy"
ON public.reminders FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Reminders delete policy" ON public.reminders;
CREATE POLICY "Reminders delete policy"
ON public.reminders FOR DELETE
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. SERVICES SECURITY
-- Existing columns:
--   id (UUID), name (TEXT), description (TEXT), category (TEXT),
--   price (NUMERIC), duration_minutes (INTEGER), image_url (TEXT),
--   active (BOOLEAN), created_at (TIMESTAMPTZ)
--
-- DO NOT recreate public.services.
-- Compatible with existing PAWLIO services schema (duration_minutes, active).
-- DO NOT delete or overwrite existing service UUIDs.
-- ------------------------------------------------------------------------------
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can view active services; Admins can view all services
DROP POLICY IF EXISTS "Services select policy" ON public.services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Services select policy"
ON public.services FOR SELECT
USING (active = true OR public.is_admin());

-- INSERT: Only administrators can create new services
DROP POLICY IF EXISTS "Services insert policy" ON public.services;
DROP POLICY IF EXISTS "Admins can create services" ON public.services;
CREATE POLICY "Services insert policy"
ON public.services FOR INSERT
WITH CHECK (public.is_admin());

-- UPDATE: Only administrators can update services
DROP POLICY IF EXISTS "Services update policy" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Services update policy"
ON public.services FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- DELETE: Only administrators can delete services
DROP POLICY IF EXISTS "Services delete policy" ON public.services;
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;
CREATE POLICY "Services delete policy"
ON public.services FOR DELETE
USING (public.is_admin());

-- Clean up any legacy catch-all policy if it existed
DROP POLICY IF EXISTS "Services admin all policy" ON public.services;

-- ------------------------------------------------------------------------------
-- 10. HIGH-PERFORMANCE RLS INDEXES
-- Optimizes query performance under Row Level Security filters
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_pet ON public.appointments(owner_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_health_records_owner_pet ON public.health_records(owner_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_owner_pet ON public.vaccinations(owner_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);

-- ==============================================================================
-- INSTRUCTIONS TO PROMOTE AN ACCOUNT TO ADMIN IN SUPABASE SQL EDITOR:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID_HERE';
-- ==============================================================================
