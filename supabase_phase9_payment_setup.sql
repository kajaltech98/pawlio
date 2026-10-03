-- ==============================================================================
-- PAWLIO — PHASE 9: APPOINTMENTS PAYMENT INTEGRATION (RAZORPAY)
-- Safe, minimal, non-destructive migration script
-- ==============================================================================

-- 1. ADD MINIMAL PAYMENT & SERVICE TRACKING COLUMNS (ALL NULLABLE)
-- Note: 'currency' omitted per requirements; 'payment_status' added without DEFAULT
-- to ensure historical appointments remain cleanly NULL and are never misrepresented.
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS service_id UUID,
    ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS payment_status TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- 2. ADD CONSTRAINTS (100% COMPATIBLE WITH EXISTING NULL VALUES)
DO $$
BEGIN
    -- Foreign key linking to authoritative public.services catalog
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointments_service'
    ) THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT fk_appointments_service 
            FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
    END IF;

    -- Valid payment status domain constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_appointments_payment_status'
    ) THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT chk_appointments_payment_status 
            CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'failed', 'cancelled'));
    END IF;

    -- Non-negative monetary amount check
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_appointments_amount_non_negative'
    ) THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT chk_appointments_amount_non_negative 
            CHECK (amount IS NULL OR amount >= 0);
    END IF;
END $$;

-- 3. CREATE PERFORMANCE & INTEGRITY INDEXES
CREATE INDEX IF NOT EXISTS idx_appointments_service_id 
    ON public.appointments(service_id);

CREATE INDEX IF NOT EXISTS idx_appointments_payment_status 
    ON public.appointments(payment_status);

-- Partial unique indexes: enforce transaction uniqueness while safely allowing NULLs on legacy rows
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_razorpay_order_id 
    ON public.appointments(razorpay_order_id) 
    WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_razorpay_payment_id 
    ON public.appointments(razorpay_payment_id) 
    WHERE razorpay_payment_id IS NOT NULL;
