-- Fix weekly_meal_plan_entries unique constraint to include plan_id
-- This allows the same date+meal_type across different plans

-- Drop the old constraint
ALTER TABLE weekly_meal_plan_entries 
DROP CONSTRAINT IF EXISTS unique_plan_date_meal_type;

-- Add the correct constraint that includes plan_id
ALTER TABLE weekly_meal_plan_entries 
ADD CONSTRAINT unique_plan_date_meal_type 
UNIQUE (plan_id, plan_date, meal_type);

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'weekly_meal_plan_entries'::regclass
  AND conname = 'unique_plan_date_meal_type';
