-- Fix: Allow increment_food_log_count trigger to update times_logged
-- Problem: RLS blocks the trigger from updating foods.times_logged when users log nutrition
-- Solution: Make the trigger function SECURITY DEFINER so it bypasses RLS

-- Drop existing function
DROP FUNCTION IF EXISTS public.increment_food_log_count() CASCADE;

-- Recreate with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.increment_food_log_count() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- THIS IS THE KEY FIX: Run as function owner, not invoker
AS $$
BEGIN
  -- Increment times_logged for the food that was just logged
  -- nutrition_logs now has food_id directly (no food_servings table)
  UPDATE foods
  SET 
    times_logged = times_logged + 1,
    last_logged_at = NEW.created_at
  WHERE id = NEW.food_id;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger (it was CASCADE dropped)
DROP TRIGGER IF EXISTS trigger_increment_food_log_count ON nutrition_logs;

CREATE TRIGGER trigger_increment_food_log_count
AFTER INSERT ON nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION increment_food_log_count();

-- Verify the fix
SELECT 
  routine_name,
  routine_type,
  routine_schema,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'increment_food_log_count'
  AND routine_schema = 'public';

-- Check trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_increment_food_log_count';
