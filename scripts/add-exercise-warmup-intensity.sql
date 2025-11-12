-- Add warmup flag and target intensity percentage to routine_exercises
-- This allows trainers and clients to mark exercises as warmup sets and specify expected intensity
--
-- IMPORTANT TABLE CLARIFICATION:
-- 
-- 1. `routine_exercises` - CLIENT-SIDE TABLE
--    - Stores exercises for custom workout routines created by clients
--    - Used when clients build their own workouts
--    - Directly stores exercise details (exercise_id, sets, reps, etc.)
--
-- 2. `programs` - TRAINER-SIDE TABLE  
--    - Stores trainer-built program templates
--    - Exercises stored in JSON `exercise_pool` column (not as rows)
--    - Exercise pool is rearranged into routines based on client's training frequency
--    - Generated routines are then saved to client's `workout_routines` table
--    - Which then populates `routine_exercises` when client starts the program
--
-- This migration adds columns to `routine_exercises` (the final destination for all exercises)

-- Add is_warmup column (defaults to false) - ALREADY EXISTS, just adding for completeness
-- The `is_warmup` column already exists in routine_exercises, so this is a no-op
-- Keeping the command with IF NOT EXISTS for safety
ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS is_warmup BOOLEAN DEFAULT false;

-- Add target_intensity_pct column (percentage of 1RM, defaults to 75%)
ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS target_intensity_pct INTEGER DEFAULT 75
CHECK (target_intensity_pct >= 0 AND target_intensity_pct <= 100);

-- Add comments for documentation
COMMENT ON COLUMN routine_exercises.is_warmup IS 
'Indicates if this exercise is a warmup set (true) or working set (false)';

COMMENT ON COLUMN routine_exercises.target_intensity_pct IS 
'Target intensity as percentage of 1RM (0-100). Typical ranges: Warmup 40-60%, Working 70-85%, Peak 90-100%';

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'routine_exercises'
  AND column_name IN ('is_warmup', 'target_intensity_pct')
ORDER BY column_name;
