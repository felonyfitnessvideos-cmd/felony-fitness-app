-- Add is_complete column to mesocycle_weeks table for tracking individual routine completions
-- This allows each week's instance of a routine to be tracked independently

-- Add the day_type column (if not already added)
ALTER TABLE mesocycle_weeks 
ADD COLUMN IF NOT EXISTS day_type TEXT;

COMMENT ON COLUMN mesocycle_weeks.day_type IS 
'Type of day: routine, rest, deload, etc.';

-- Add the is_complete column (if not already added)
ALTER TABLE mesocycle_weeks 
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Add an index for faster queries filtering by completion status
CREATE INDEX IF NOT EXISTS idx_mesocycle_weeks_is_complete 
ON mesocycle_weeks(mesocycle_id, is_complete);

-- Add a comment to document the column
COMMENT ON COLUMN mesocycle_weeks.is_complete IS 
'Tracks whether this specific routine instance in the mesocycle has been completed. Set to true when workout is saved or when user clicks Skip button.';

-- Add completed_at column to track when completion status changed
ALTER TABLE mesocycle_weeks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN mesocycle_weeks.completed_at IS 
'Timestamp when this routine was marked as complete (either by completing the workout or skipping it).';
