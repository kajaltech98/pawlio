-- ==============================================================================
-- PAWLIO — PHASE 5: HEALTH RECORDS, VACCINATIONS & REMINDERS
-- Database Schema & Row Level Security (RLS) Setup
-- ==============================================================================

-- 1. HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    veterinarian TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure optional columns exist if health_records table was previously created
ALTER TABLE public.health_records ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE public.health_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. VACCINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE NOT NULL,
    notes TEXT,
    veterinarian TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- 4. ROW LEVEL SECURITY POLICIES: HEALTH RECORDS
DROP POLICY IF EXISTS "Users can view their own pet health records" ON public.health_records;
CREATE POLICY "Users can view their own pet health records"
ON public.health_records FOR SELECT
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own pet health records" ON public.health_records;
CREATE POLICY "Users can insert their own pet health records"
ON public.health_records FOR INSERT
WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.pets WHERE id = health_records.pet_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own pet health records" ON public.health_records;
CREATE POLICY "Users can update their own pet health records"
ON public.health_records FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own pet health records" ON public.health_records;
CREATE POLICY "Users can delete their own pet health records"
ON public.health_records FOR DELETE
USING (auth.uid() = owner_id);

-- 5. ROW LEVEL SECURITY POLICIES: VACCINATIONS
DROP POLICY IF EXISTS "Users can view their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Users can view their own pet vaccinations"
ON public.vaccinations FOR SELECT
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Users can insert their own pet vaccinations"
ON public.vaccinations FOR INSERT
WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.pets WHERE id = vaccinations.pet_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Users can update their own pet vaccinations"
ON public.vaccinations FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own pet vaccinations" ON public.vaccinations;
CREATE POLICY "Users can delete their own pet vaccinations"
ON public.vaccinations FOR DELETE
USING (auth.uid() = owner_id);

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_health_records_owner_pet ON public.health_records(owner_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON public.health_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_vaccinations_owner_pet ON public.vaccinations(owner_id, pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due ON public.vaccinations(next_due_date ASC);
