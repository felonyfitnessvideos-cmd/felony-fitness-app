-- Rollback migration for adding cycle_session_id to workout_logs
-- This reverses the changes made in 20251105200200_add_cycle_session_id_to_workout_logs.sql

-- Drop the index first (must be done before dropping the column)
DROP INDEX IF EXISTS idx_workout_logs_cycle_session;

-- Drop the column (this also removes the foreign key constraint and comment)
ALTER TABLE workout_logs
DROP COLUMN IF EXISTS cycle_session_id;
