-- Check what values are allowed by the meal_type check constraint

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'nutrition_logs_meal_type_check';

-- Also show sample meal_type values currently in the table
SELECT DISTINCT meal_type, COUNT(*) as count
FROM nutrition_logs
GROUP BY meal_type
ORDER BY meal_type;
