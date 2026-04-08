-- Payment tracking table for Real Property Tax (RPT)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tdn TEXT NOT NULL,
    taxpayer_name TEXT NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    or_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Posted',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster OR number lookups during generation
CREATE INDEX IF NOT EXISTS idx_payments_or_number ON public.payments(or_number);

-- Table for storing discount and penalty rules for RPT
CREATE TABLE IF NOT EXISTS public.tax_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('Discount', 'Penalty')),
    name TEXT NOT NULL,
    basis TEXT NOT NULL,
    rate TEXT NOT NULL, -- Flexible string to support formats like "10%" or "2% / month"
    period TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster filtering by type and status
CREATE INDEX IF NOT EXISTS idx_tax_rules_type_status ON public.tax_rules(type, status);

