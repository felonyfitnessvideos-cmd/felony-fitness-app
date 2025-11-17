/**
 * @file delete-test-meals.sql
 * @description Remove empty test meal data from meals table
 * @date 2025-11-17
 * 
 * Removes user-created test meals with generic names like "Breakfast 1", "Lunch 1"
 * that have no descriptions, instructions, or cooking times.
 * Keeps all detailed premade meals.
 */

-- Delete empty test meals (no description, instructions, or cooking times)
DELETE FROM meals
WHERE (name LIKE '%Breakfast 1%' OR name LIKE '%Lunch 1%' OR name LIKE '%Dinner 1%')
  AND description IS NULL
  AND instructions IS NULL
  AND prep_time_minutes IS NULL
  AND cook_time_minutes IS NULL;

-- Verify deletion
SELECT 
  'Deleted test meals' as status,
  COUNT(*) as remaining_meals
FROM meals;

-- Show remaining meals
SELECT id, name, category, is_premade, created_at
FROM meals
ORDER BY category, name
LIMIT 50;
