-- Create goals table for pilgrimage plans
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    
    -- Main timeline
    start_date DATE,
    end_date DATE,
    total_duration INTERVAL,
    total_distance NUMERIC(10,2), -- in km
    
    -- Items data (stored as JSONB for flexibility)
    cities JSONB, -- Array of {id, name, dates: [date1, date2]}
    places JSONB, -- Array of {id, name, city_id, dates: [date1, date2]}
    routes JSONB, -- Array of {id, name, city_id, dates: [date1, date2]}
    events JSONB, -- Array of {id, name, city_id, dates: [date1, date2]}
    
    -- Analytics
    completion_percentage NUMERIC(5,2) DEFAULT 0,
    visited_items INTEGER DEFAULT 0,
    total_items INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_dates ON public.goals(start_date, end_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_updated_at_trigger
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION update_goals_updated_at();

-- Enable RLS for security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own goals" 
ON public.goals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
