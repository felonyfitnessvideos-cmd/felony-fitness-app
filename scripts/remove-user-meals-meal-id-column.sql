/**
 * @file remove-user-meals-meal-id-column.sql
 * @description Remove meal_id column from user_meals table - it's not needed
 * @date 2025-11-17
 * 
 * PROBLEM: The meal_id column in user_meals is causing confusion and errors.
 * User meals should be completely independent and not reference the meals table.
 * 
 * SOLUTION: Drop the meal_id column entirely from user_meals table.
 * 
 * IMPACT: This simplifies the data model:
 * - user_meals: User's own created meals (standalone)
 * - meals: Premade/public meals (standalone)
 * - weekly_meal_plan_entries: Can reference EITHER via meal_id OR user_meal_id
 */

-- Drop the meal_id column from user_meals table
ALTER TABLE user_meals 
DROP COLUMN IF EXISTS meal_id CASCADE;

-- Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_meals'
ORDER BY ordinal_position;

SELECT 'Successfully removed meal_id column from user_meals table!' as status;
