-- Payment tracking table for Real Property Tax (RPT)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tdn TEXT NOT NULL,
    taxpayer_name TEXT NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    or_number TEXT UNIQUE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster OR number lookups during generation
CREATE INDEX IF NOT EXISTS idx_payments_or_number ON public.payments(or_number);
