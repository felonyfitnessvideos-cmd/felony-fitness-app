-- Diagnose what meal_type values actually exist in the database
-- This will show us ALL values, including any that don't match expected patterns

-- Show all distinct meal_type values with counts
SELECT 
    meal_type,
    COUNT(*) as count,
    LOWER(meal_type) as lowercase_version
FROM nutrition_logs
GROUP BY meal_type
ORDER BY count DESC;

-- Show any rows that would violate the new constraint
SELECT 
    id,
    meal_type,
    food_serving_id,
    log_date,
    created_at
FROM nutrition_logs
WHERE meal_type NOT IN ('breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'water')
  AND LOWER(meal_type) NOT IN ('breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'water')
ORDER BY created_at DESC
LIMIT 20;

-- Check for NULL values
SELECT COUNT(*) as null_meal_types
FROM nutrition_logs
WHERE meal_type IS NULL;
