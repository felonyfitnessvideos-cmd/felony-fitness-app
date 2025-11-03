-- Drop existing tables to allow fresh schema
-- This is safe since we confirmed all tables are empty

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS workout_log_sets CASCADE;
DROP TABLE IF EXISTS nutrition_logs CASCADE;
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS trainer_clients CASCADE;
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS nutrition_goals CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Also drop any existing functions that might conflict
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'Existing tables dropped - ready for fresh schema' as status;
