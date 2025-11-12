-- Quick fix: Update all existing Title Case meal_type values to lowercase
-- Run this if the previous migration didn't complete properly

-- Update all Title Case values to lowercase
UPDATE nutrition_logs 
SET meal_type = 'breakfast' 
WHERE meal_type = 'Breakfast';

UPDATE nutrition_logs 
SET meal_type = 'lunch' 
WHERE meal_type = 'Lunch';

UPDATE nutrition_logs 
SET meal_type = 'dinner' 
WHERE meal_type = 'Dinner';

UPDATE nutrition_logs 
SET meal_type = 'snack1' 
WHERE meal_type = 'Snack';

UPDATE nutrition_logs 
SET meal_type = 'water' 
WHERE meal_type = 'Water';

-- Verify the changes
SELECT DISTINCT meal_type, COUNT(*) as count
FROM nutrition_logs
GROUP BY meal_type
ORDER BY meal_type;
