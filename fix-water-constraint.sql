-- Fix the check constraint that's blocking food logging
-- Run this in Supabase SQL Editor

-- Step 1: Check what the constraint does
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'nutrition_logs'::regclass
  AND conname = 'chk_water_entries_no_macros';

-- Step 2: Drop the problematic constraint
-- The constraint is too strict - it should allow macros when food_id exists
ALTER TABLE nutrition_logs 
DROP CONSTRAINT IF EXISTS chk_water_entries_no_macros;

-- Step 3: Create a better constraint that allows macros for food entries
ALTER TABLE nutrition_logs
ADD CONSTRAINT chk_water_entries_no_macros 
CHECK (
  -- If it's a water-only entry (no food_id), then no macros allowed
  (food_id IS NULL AND water_oz_consumed > 0 AND calories IS NULL AND protein_g IS NULL AND carbs_g IS NULL AND fat_g IS NULL)
  OR
  -- If it's a food entry (has food_id), macros are required
  (food_id IS NOT NULL)
  OR
  -- If it's a combined entry (food + water), both are allowed
  (food_id IS NOT NULL AND water_oz_consumed IS NOT NULL)
);

-- Step 4: Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'nutrition_logs'::regclass
  AND conname = 'chk_water_entries_no_macros';
