-- SIMPLE CLEANUP: Remove ALL food_servings references
-- Run this in Supabase SQL Editor

-- Step 1: Drop all triggers on nutrition_logs (one by one)
DROP TRIGGER IF EXISTS calculate_nutrition_on_insert ON nutrition_logs CASCADE;
DROP TRIGGER IF EXISTS calculate_nutrition_on_update ON nutrition_logs CASCADE;
DROP TRIGGER IF EXISTS set_nutrition_values ON nutrition_logs CASCADE;
DROP TRIGGER IF EXISTS calculate_nutrition_trigger ON nutrition_logs CASCADE;

-- Step 2: Drop all functions that might reference food_servings
DROP FUNCTION IF EXISTS calculate_nutrition_from_food_serving() CASCADE;
DROP FUNCTION IF EXISTS calculate_nutrition_from_food() CASCADE;
DROP FUNCTION IF EXISTS set_nutrition_values() CASCADE;
DROP FUNCTION IF EXISTS calculate_nutrition() CASCADE;

-- Step 3: Create the new clean trigger function
CREATE OR REPLACE FUNCTION calculate_nutrition_from_food()
RETURNS TRIGGER AS $$
DECLARE
  food_record RECORD;
BEGIN
  -- If food_id is provided, fetch nutrition from foods table
  IF NEW.food_id IS NOT NULL THEN
    SELECT * INTO food_record FROM foods WHERE id = NEW.food_id;
    
    IF FOUND THEN
      -- Calculate nutrition values (foods are per 100g)
      NEW.calories := COALESCE(food_record.calories * NEW.quantity_consumed, 0);
      NEW.protein_g := COALESCE(food_record.protein_g * NEW.quantity_consumed, 0);
      NEW.carbs_g := COALESCE(food_record.carbs_g * NEW.quantity_consumed, 0);
      NEW.fat_g := COALESCE(food_record.fat_g * NEW.quantity_consumed, 0);
      NEW.fiber_g := COALESCE(food_record.fiber_g * NEW.quantity_consumed, 0);
      NEW.sugar_g := COALESCE(food_record.sugar_g * NEW.quantity_consumed, 0);
      NEW.sodium_mg := COALESCE(food_record.sodium_mg * NEW.quantity_consumed, 0);
      NEW.calcium_mg := COALESCE(food_record.calcium_mg * NEW.quantity_consumed, 0);
      NEW.iron_mg := COALESCE(food_record.iron_mg * NEW.quantity_consumed, 0);
      NEW.potassium_mg := COALESCE(food_record.potassium_mg * NEW.quantity_consumed, 0);
      NEW.magnesium_mg := COALESCE(food_record.magnesium_mg * NEW.quantity_consumed, 0);
      NEW.phosphorus_mg := COALESCE(food_record.phosphorus_mg * NEW.quantity_consumed, 0);
      NEW.zinc_mg := COALESCE(food_record.zinc_mg * NEW.quantity_consumed, 0);
      NEW.copper_mg := COALESCE(food_record.copper_mg * NEW.quantity_consumed, 0);
      NEW.selenium_mcg := COALESCE(food_record.selenium_mcg * NEW.quantity_consumed, 0);
      NEW.vitamin_a_mcg := COALESCE(food_record.vitamin_a_mcg * NEW.quantity_consumed, 0);
      NEW.vitamin_c_mg := COALESCE(food_record.vitamin_c_mg * NEW.quantity_consumed, 0);
      NEW.vitamin_e_mg := COALESCE(food_record.vitamin_e_mg * NEW.quantity_consumed, 0);
      NEW.vitamin_k_mcg := COALESCE(food_record.vitamin_k_mcg * NEW.quantity_consumed, 0);
      NEW.thiamin_mg := COALESCE(food_record.thiamin_mg * NEW.quantity_consumed, 0);
      NEW.riboflavin_mg := COALESCE(food_record.riboflavin_mg * NEW.quantity_consumed, 0);
      NEW.niacin_mg := COALESCE(food_record.niacin_mg * NEW.quantity_consumed, 0);
      NEW.vitamin_b6_mg := COALESCE(food_record.vitamin_b6_mg * NEW.quantity_consumed, 0);
      NEW.folate_mcg := COALESCE(food_record.folate_mcg * NEW.quantity_consumed, 0);
      NEW.vitamin_b12_mcg := COALESCE(food_record.vitamin_b12_mcg * NEW.quantity_consumed, 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create new triggers
CREATE TRIGGER calculate_nutrition_on_insert
BEFORE INSERT ON nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION calculate_nutrition_from_food();

CREATE TRIGGER calculate_nutrition_on_update
BEFORE UPDATE ON nutrition_logs
FOR EACH ROW
WHEN (OLD.food_id IS DISTINCT FROM NEW.food_id OR OLD.quantity_consumed IS DISTINCT FROM NEW.quantity_consumed)
EXECUTE FUNCTION calculate_nutrition_from_food();
