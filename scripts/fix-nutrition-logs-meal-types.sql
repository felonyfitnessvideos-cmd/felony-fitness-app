-- Fix nutrition_logs meal_type values to use lowercase
-- This fixes old data that used Title Case (Breakfast, Lunch, etc.)
-- New code now enforces lowercase for consistency with check constraint

-- Preview what will be changed
SELECT meal_type, COUNT(*) as count
FROM nutrition_logs
WHERE meal_type != LOWER(meal_type)
GROUP BY meal_type
ORDER BY meal_type;

-- Update all meal_type values to lowercase
UPDATE nutrition_logs
SET meal_type = LOWER(meal_type)
WHERE meal_type != LOWER(meal_type);

-- Verify the fix
SELECT DISTINCT meal_type
FROM nutrition_logs
ORDER BY meal_type;

-- Expected results after fix:
-- breakfast
-- dinner
-- lunch
-- snack1
-- snack2
-- water
