-- Remove duplicate triggers that reference old food_servings table
-- Run this in Supabase SQL Editor

-- Drop the old duplicate triggers
DROP TRIGGER IF EXISTS populate_nutrition_log_values ON nutrition_logs;

-- Drop the old function
DROP FUNCTION IF EXISTS calculate_nutrition_log_values() CASCADE;

-- Verify only our new triggers remain
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'nutrition_logs'
ORDER BY trigger_name;

-- Should show only these two:
-- calculate_nutrition_on_insert
-- calculate_nutrition_on_update
