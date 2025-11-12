/**
 * @file add-performance-indexes-simple.sql
 * @description Database indexes for Supabase Dashboard (SAFE VERSION)
 * @project Felony Fitness
 * @date 2025-11-11
 * 
 * FIXED: Only includes indexes for columns that definitely exist in production
 * SKIPPED: Indexes for columns from pending migrations (program_id, etc.)
 * SAFE: Your database is small, so locks will be instant (<1 second)
 * USAGE: Copy/paste entire file into Supabase SQL Editor and click Run
 */

-- ============================================================================
-- WORKOUT LOGGING INDEXES (Most Important!)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_routine_date 
ON workout_logs(user_id, routine_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_sessions 
ON workout_logs(user_id, routine_id, created_at DESC) 
WHERE is_complete = true;

CREATE INDEX IF NOT EXISTS idx_workout_log_entries_log_exercise 
ON workout_log_entries(log_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_workout_log_entries_exercise_date 
ON workout_log_entries(exercise_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_log_entries_log_id 
ON workout_log_entries(log_id);

-- ============================================================================
-- ROUTINE & PROGRAM INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_order 
ON routine_exercises(routine_id, exercise_order);

-- NOTE: Skipping workout_routines(program_id) - column doesn't exist yet
-- Will add after running add-programs-missing-columns.sql migration

-- ============================================================================
-- MESOCYCLE TRACKING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cycle_sessions_user_routine_date 
ON cycle_sessions(user_id, routine_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_cycle_sessions_mesocycle_date 
ON cycle_sessions(mesocycle_id, scheduled_date);

-- ============================================================================
-- NUTRITION TRACKING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_meals_user_date 
ON user_meals(user_id, consumed_at DESC);

-- NOTE: Table is called 'meal_foods' not 'meal_food_items', and FK is 'meal_id'
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal 
ON meal_foods(meal_id);

-- ============================================================================
-- USER & AUTHENTICATION INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer 
ON trainer_clients(trainer_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_trainer_clients_client 
ON trainer_clients(client_id, is_active) 
WHERE is_active = true;

-- ============================================================================
-- MESSAGING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
ON direct_messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_unread 
ON direct_messages(receiver_id, is_read, created_at DESC) 
WHERE is_read = false;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify indexes were created:
SELECT 
    schemaname,
    tablename, 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
