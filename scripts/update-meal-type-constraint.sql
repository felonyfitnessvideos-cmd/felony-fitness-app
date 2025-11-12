-- Update nutrition_logs meal_type check constraint to allow lowercase values
-- The constraint currently requires Title Case (Breakfast, Lunch, Dinner, etc.)
-- This changes it to accept lowercase (breakfast, lunch, dinner, snack1, snack2, water)

-- Step 1: Drop the old constraint
ALTER TABLE nutrition_logs
DROP CONSTRAINT IF EXISTS nutrition_logs_meal_type_check;

-- Step 2: Add new constraint with lowercase values
ALTER TABLE nutrition_logs
ADD CONSTRAINT nutrition_logs_meal_type_check
CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'water'));

-- Step 3: Verify the new constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'nutrition_logs_meal_type_check';

-- Step 4: Ensure all existing data conforms (update any Title Case to lowercase)
UPDATE nutrition_logs
SET meal_type = LOWER(meal_type)
WHERE meal_type != LOWER(meal_type);

-- Step 5: Verify distinct meal_type values
SELECT DISTINCT meal_type, COUNT(*) as count
FROM nutrition_logs
GROUP BY meal_type
ORDER BY meal_type;
