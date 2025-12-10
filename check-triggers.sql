-- Check what happens when we try to insert into nutrition_logs
-- This will show any trigger errors

-- First, let's see what triggers exist on nutrition_logs
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'nutrition_logs'
ORDER BY trigger_name;
