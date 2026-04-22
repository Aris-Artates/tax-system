    CREATE TABLE IF NOT EXISTS public.activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INT, -- Nullable to allow logging events not tied to a specific user (e.g., unknown login attempts)
        action_type TEXT NOT NULL,
        module TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Success' CHECK (status IN ('Success', 'Failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Foreign key linking to the users table
        CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
    );

    -- Index for faster querying by user and date
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, created_at DESC);
