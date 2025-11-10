-- Check the current exercise_type constraint
-- Run this in Supabase SQL Editor

-- Check what constraint exists
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'exercises'
  AND con.conname LIKE '%exercise_type%';

-- Check what values currently exist in the database
SELECT DISTINCT exercise_type, COUNT(*) as count
FROM exercises
GROUP BY exercise_type
ORDER BY count DESC;

-- If the constraint is too restrictive, you can drop and recreate it
-- Uncomment these lines if needed:

-- DROP CONSTRAINT IF EXISTS exercises_exercise_type_check ON exercises;

-- CREATE CONSTRAINT exercises_exercise_type_check 
-- CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance', 'olympic', 'powerlifting', 'strongman', 'plyometric', 'stretching'));
