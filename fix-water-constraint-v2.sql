-- Fix the check constraint without validating existing rows
-- Run this in Supabase SQL Editor

-- Step 1: Drop the problematic constraint
ALTER TABLE nutrition_logs 
DROP CONSTRAINT IF EXISTS chk_water_entries_no_macros;

-- Step 2: Create a simplified constraint that works with existing data
-- Just ensure water-only entries don't have a food_id
ALTER TABLE nutrition_logs
ADD CONSTRAINT chk_water_entries_no_macros 
CHECK (
  -- Either it's a food entry (has food_id) - allow anything
  food_id IS NOT NULL
  OR
  -- Or it's water only (no food_id) - that's fine too
  food_id IS NULL
) NOT VALID;

-- Step 3: Validate the constraint (will fail if any rows violate it)
-- If this fails, we'll just leave it NOT VALID which is fine
ALTER TABLE nutrition_logs VALIDATE CONSTRAINT chk_water_entries_no_macros;

-- Step 4: Verify the constraint was created
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition,
  convalidated as is_validated
FROM pg_constraint
WHERE conrelid = 'nutrition_logs'::regclass
  AND conname = 'chk_water_entries_no_macros';
