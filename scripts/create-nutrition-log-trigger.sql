-- =====================================================================================
-- AUTO-POPULATE NUTRITION LOG MACROS AND MICRONUTRIENTS
-- =====================================================================================
-- Purpose: Automatically calculate and store complete nutritional data when logging food
-- Trigger fires on INSERT or UPDATE of nutrition_logs table
-- 
-- What it does:
-- 1. Looks up food_servings data for the logged food
-- 2. Multiplies all nutritional values by quantity_consumed
-- 3. Stores calculated values in nutrition_logs columns
--
-- Benefits:
-- - Zero-cost aggregation at display time (just SUM the columns)
-- - Historical accuracy (nutrition data frozen at time of logging)
-- - Complete nutritional snapshot per meal/day
-- - No joins needed for dashboard queries
-- =====================================================================================

CREATE OR REPLACE FUNCTION calculate_nutrition_log_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Look up food_servings data and multiply by quantity consumed
  -- Handle NULL quantity_consumed (default to 1.0)
  SELECT 
    -- Macronutrients
    COALESCE(fs.calories * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.protein_g * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.carbs_g * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.fat_g * COALESCE(NEW.quantity_consumed, 1.0), 0),
    
    -- Fiber and Sugar
    COALESCE(fs.fiber_g * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.sugar_g * COALESCE(NEW.quantity_consumed, 1.0), 0),
    
    -- Major Minerals
    COALESCE(fs.sodium_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.calcium_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.iron_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.potassium_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.magnesium_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.phosphorus_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    
    -- Trace Minerals
    COALESCE(fs.zinc_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.copper_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.selenium_mcg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    
    -- Vitamins
    COALESCE(fs.vitamin_a_mcg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.vitamin_b6_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.vitamin_b12_mcg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.vitamin_c_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.vitamin_e_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.vitamin_k_mcg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    
    -- B-Vitamins
    COALESCE(fs.folate_mcg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.niacin_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.riboflavin_mg * COALESCE(NEW.quantity_consumed, 1.0), 0),
    COALESCE(fs.thiamin_mg * COALESCE(NEW.quantity_consumed, 1.0), 0)
    
  INTO 
    NEW.calories,
    NEW.protein_g,
    NEW.carbs_g,
    NEW.fat_g,
    NEW.fiber_g,
    NEW.sugar_g,
    NEW.sodium_mg,
    NEW.calcium_mg,
    NEW.iron_mg,
    NEW.potassium_mg,
    NEW.magnesium_mg,
    NEW.phosphorus_mg,
    NEW.zinc_mg,
    NEW.copper_mg,
    NEW.selenium_mcg,
    NEW.vitamin_a_mcg,
    NEW.vitamin_b6_mg,
    NEW.vitamin_b12_mcg,
    NEW.vitamin_c_mg,
    NEW.vitamin_e_mg,
    NEW.vitamin_k_mcg,
    NEW.folate_mcg,
    NEW.niacin_mg,
    NEW.riboflavin_mg,
    NEW.thiamin_mg
  FROM food_servings fs
  WHERE fs.id = NEW.food_serving_id;
  
  -- If food_serving_id is NULL or not found, keep existing values or set to NULL
  IF NOT FOUND THEN
    NEW.calories := NULL;
    NEW.protein_g := NULL;
    NEW.carbs_g := NULL;
    NEW.fat_g := NULL;
    NEW.fiber_g := NULL;
    NEW.sugar_g := NULL;
    NEW.sodium_mg := NULL;
    NEW.calcium_mg := NULL;
    NEW.iron_mg := NULL;
    NEW.potassium_mg := NULL;
    NEW.magnesium_mg := NULL;
    NEW.phosphorus_mg := NULL;
    NEW.zinc_mg := NULL;
    NEW.copper_mg := NULL;
    NEW.selenium_mcg := NULL;
    NEW.vitamin_a_mcg := NULL;
    NEW.vitamin_b6_mg := NULL;
    NEW.vitamin_b12_mcg := NULL;
    NEW.vitamin_c_mg := NULL;
    NEW.vitamin_e_mg := NULL;
    NEW.vitamin_k_mcg := NULL;
    NEW.folate_mcg := NULL;
    NEW.niacin_mg := NULL;
    NEW.riboflavin_mg := NULL;
    NEW.thiamin_mg := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS populate_nutrition_log_values ON nutrition_logs;

-- Create trigger that fires before INSERT or UPDATE
CREATE TRIGGER populate_nutrition_log_values
  BEFORE INSERT OR UPDATE ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_nutrition_log_values();

-- Add function comment for documentation
COMMENT ON FUNCTION calculate_nutrition_log_values() IS 
'Automatically populates nutrition_logs with complete nutritional data by multiplying food_servings values by quantity_consumed. Fires on INSERT/UPDATE.';

-- =====================================================================================
-- TESTING QUERIES
-- =====================================================================================
-- Test the trigger by inserting a sample nutrition log entry:
/*
-- 1. Find a food to test with
SELECT id, food_name, calories, protein_g, carbs_g, fat_g, fiber_g, vitamin_c_mg
FROM food_servings
WHERE calories IS NOT NULL
LIMIT 1;

-- 2. Insert a test log entry (replace food_serving_id and user_id with real values)
INSERT INTO nutrition_logs (
  user_id,
  food_serving_id,
  quantity_consumed,
  log_date,
  meal_type
) VALUES (
  'YOUR_USER_ID',
  'FOOD_SERVING_ID_FROM_ABOVE',
  2.0, -- eating 2 servings
  CURRENT_DATE,
  'Breakfast'
);

-- 3. Verify the trigger calculated values correctly
SELECT 
  food_serving_id,
  quantity_consumed,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  fiber_g,
  vitamin_c_mg,
  created_at
FROM nutrition_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Expected: All nutritional values should be 2x the food_servings values
*/

-- =====================================================================================
-- BACKFILL EXISTING LOGS (Optional)
-- =====================================================================================
-- If you have existing nutrition_logs without calculated values, run this to backfill:
/*
UPDATE nutrition_logs
SET quantity_consumed = COALESCE(quantity_consumed, 1.0)
WHERE food_serving_id IS NOT NULL
  AND calories IS NULL;

-- The trigger will automatically populate values during the UPDATE
*/
