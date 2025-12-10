-- Simply remove the problematic constraint
-- Run this in Supabase SQL Editor

-- Drop the constraint that's blocking food logging
ALTER TABLE nutrition_logs 
DROP CONSTRAINT IF EXISTS chk_water_entries_no_macros;

-- Verify it's gone
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'nutrition_logs'::regclass
  AND conname = 'chk_water_entries_no_macros';

-- Should return empty (no rows)
