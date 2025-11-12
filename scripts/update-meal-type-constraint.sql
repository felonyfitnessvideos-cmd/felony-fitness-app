-- Update nutrition_logs meal_type check constraint to allow lowercase values
-- The constraint currently requires Title Case (Breakfast, Lunch, Dinner, etc.)
-- This changes it to accept lowercase (breakfast, lunch, dinner, snack1, snack2, water)
-- 
-- ISSUE FOUND: Database has 'Snack' but constraint needs 'snack1' or 'snack2'
-- We'll convert all 'Snack' -> 'snack1' as the default

-- Step 1: Drop the old constraint FIRST
ALTER TABLE nutrition_logs
DROP CONSTRAINT IF EXISTS nutrition_logs_meal_type_check;

-- Step 2: Update all existing data (BEFORE adding new constraint)
-- Convert Title Case to lowercase
UPDATE nutrition_logs
SET meal_type = LOWER(meal_type)
WHERE meal_type != LOWER(meal_type);

-- Convert 'snack' to 'snack1' (the generic snack becomes snack1)
UPDATE nutrition_logs
SET meal_type = 'snack1'
WHERE meal_type = 'snack';

-- Step 3: NOW add new constraint with lowercase values
ALTER TABLE nutrition_logs
ADD CONSTRAINT nutrition_logs_meal_type_check
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'water'));

-- Step 4: Verify the new constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'nutrition_logs_meal_type_check';

-- Step 5: Verify distinct meal_type values
SELECT DISTINCT meal_type, COUNT(*) as count
FROM nutrition_logs
GROUP BY meal_type
ORDER BY meal_type;
