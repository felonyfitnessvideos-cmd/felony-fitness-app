-- ============================================================================
-- Add target_reps column to routine_exercises table
-- ============================================================================
-- Purpose: Store rep ranges (e.g., "5-10", "8-12", "AMRAP") for each exercise in a routine
-- Date: November 10, 2025
-- ============================================================================

-- Add target_reps column to routine_exercises
ALTER TABLE routine_exercises
ADD COLUMN IF NOT EXISTS target_reps TEXT;

-- Add a reasonable default for existing rows
UPDATE routine_exercises
SET target_reps = '8-12'
WHERE target_reps IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'routine_exercises'
  AND column_name = 'target_reps';

-- Show sample data
SELECT 
    id,
    routine_id,
    exercise_id,
    target_sets,
    target_reps,
    exercise_order
FROM routine_exercises
LIMIT 5;
