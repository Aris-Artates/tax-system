-- Drop existing table and recreate with FK to users(id)
DROP TABLE IF EXISTS public.permission_requests;

CREATE TABLE IF NOT EXISTS public.permission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    requester_emp_id TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_role TEXT NOT NULL,
    modules JSONB NOT NULL,
    justification TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by TEXT,
    review_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perm_requests_status ON public.permission_requests(status);
CREATE INDEX IF NOT EXISTS idx_perm_requests_requester ON public.permission_requests(requester_emp_id);
