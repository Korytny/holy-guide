-- Add planned_items column and other missing fields to goals table
-- This migration adds support for the new pilgrimage planner data structure

-- Add the main planned_items column that stores all items in a unified format
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS planned_items JSONB;

-- Add columns for filter preferences
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS selected_place_subtypes TEXT[];
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS selected_event_subtypes TEXT[];

-- Update the updated_at trigger function to handle these changes
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;