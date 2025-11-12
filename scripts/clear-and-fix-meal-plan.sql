-- Step 1: Clear all meal plan entries (you'll re-enter meals)
DELETE FROM weekly_meal_plan_entries;

-- Step 2: Fix the unique constraint to include plan_id
ALTER TABLE weekly_meal_plan_entries 
DROP CONSTRAINT IF EXISTS unique_plan_date_meal_type;

ALTER TABLE weekly_meal_plan_entries 
ADD CONSTRAINT unique_plan_date_meal_type 
UNIQUE (plan_id, plan_date, meal_type);

-- Step 3: Deactivate all old plans except the most recent one
WITH latest_plan AS (
  SELECT id, user_id
  FROM weekly_meal_plans
  WHERE user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d'
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE weekly_meal_plans
SET is_active = CASE 
  WHEN id = (SELECT id FROM latest_plan) THEN true
  ELSE false
END
WHERE user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d';

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'weekly_meal_plan_entries'::regclass
  AND conname = 'unique_plan_date_meal_type';

-- Verify plans
SELECT id, name, start_date, end_date, is_active, created_at
FROM weekly_meal_plans
WHERE user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d'
ORDER BY created_at DESC;
