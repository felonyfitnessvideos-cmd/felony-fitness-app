-- Check what the populate_nutrition_log_values function does
-- Run this in Supabase SQL Editor

-- Step 1: View the function definition
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'calculate_nutrition_log_values';

-- Step 2: If it references food_servings, we need to drop these duplicate triggers
-- Uncomment and run these lines if the function above references food_servings:

-- DROP TRIGGER IF EXISTS populate_nutrition_log_values ON nutrition_logs;
-- DROP FUNCTION IF EXISTS calculate_nutrition_log_values() CASCADE;

-- Step 3: Verify only our new triggers remain
-- SELECT 
--   trigger_name, 
--   event_manipulation, 
--   event_object_table, 
--   action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'nutrition_logs'
-- ORDER BY trigger_name;
