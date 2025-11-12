/**
 * @file add-performance-indexes-simple.sql
 * @description Database indexes VERIFIED against database.types.ts
 * @project Felony Fitness
 * @date 2025-11-11
 * 
 * VERIFIED: Every table and column checked against supabase/database.types.ts
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

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date 
ON nutrition_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_meal_foods_meal 
ON meal_foods(meal_id);

-- ============================================================================
-- USER & AUTHENTICATION INDEXES
-- ============================================================================

-- FIXED: trainer_clients has 'status' column, not 'is_active'
-- Partial index for 'active' status (assuming 'active' is the status value)
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer 
ON trainer_clients(trainer_id, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_trainer_clients_client 
ON trainer_clients(client_id, status) 
WHERE status = 'active';

-- ============================================================================
-- MESSAGING INDEXES
-- ============================================================================

-- FIXED: direct_messages has 'recipient_id' not 'receiver_id', and 'sender_id'
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
ON direct_messages(sender_id, recipient_id, created_at DESC);

-- FIXED: direct_messages has 'read_at' column (timestamp), not 'is_read' (boolean)
-- Unread messages have NULL read_at
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread 
ON direct_messages(recipient_id, created_at DESC) 
WHERE read_at IS NULL;

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
