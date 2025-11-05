-- Add cycle_session_id column to workout_logs table
-- This links workout logs to specific mesocycle training sessions

ALTER TABLE workout_logs 
ADD COLUMN IF NOT EXISTS cycle_session_id UUID REFERENCES cycle_sessions(id) ON DELETE SET NULL;

-- Add index for performance when querying logs by session
CREATE INDEX IF NOT EXISTS idx_workout_logs_cycle_session 
ON workout_logs(cycle_session_id) 
WHERE cycle_session_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN workout_logs.cycle_session_id IS 'Links this workout log to a specific mesocycle training session for periodization tracking';
