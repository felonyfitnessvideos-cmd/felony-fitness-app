-- Fix nutrition_logs trigger to use foods table instead of food_servings
-- Run this in Supabase SQL Editor

-- Step 1: Drop old triggers and functions
DROP TRIGGER IF EXISTS calculate_nutrition_on_insert ON nutrition_logs;
DROP TRIGGER IF EXISTS calculate_nutrition_on_update ON nutrition_logs;
DROP FUNCTION IF EXISTS calculate_nutrition_from_food_serving() CASCADE;
DROP FUNCTION IF EXISTS calculate_nutrition_from_food() CASCADE;

-- Step 2: Create new trigger function using foods table
CREATE OR REPLACE FUNCTION calculate_nutrition_from_food()
RETURNS TRIGGER AS $$
DECLARE
  food_data RECORD;
BEGIN
  -- Only calculate if food_id is provided and nutrition fields are NULL
  IF NEW.food_id IS NOT NULL THEN
    -- Get food nutrition data
    SELECT calories, protein_g, carbs_g, fat_g
    INTO food_data
    FROM foods
    WHERE id = NEW.food_id;

    IF FOUND THEN
      -- Calculate nutrition based on quantity consumed
      -- Foods table stores per 100g, so multiply by quantity_consumed
      NEW.calories := ROUND((food_data.calories::numeric * NEW.quantity_consumed / 100)::numeric, 1);
      NEW.protein_g := ROUND((food_data.protein_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);
      NEW.carbs_g := ROUND((food_data.carbs_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);
      NEW.fat_g := ROUND((food_data.fat_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create triggers
CREATE TRIGGER calculate_nutrition_on_insert
  BEFORE INSERT ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_nutrition_from_food();

CREATE TRIGGER calculate_nutrition_on_update
  BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW
  WHEN (OLD.food_id IS DISTINCT FROM NEW.food_id OR OLD.quantity_consumed IS DISTINCT FROM NEW.quantity_consumed)
  EXECUTE FUNCTION calculate_nutrition_from_food();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'nutrition_logs'
ORDER BY trigger_name;
