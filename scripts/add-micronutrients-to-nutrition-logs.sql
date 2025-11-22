-- =====================================================================================
-- ADD MICRONUTRIENT COLUMNS TO NUTRITION_LOGS
-- =====================================================================================
-- Purpose: Add all micronutrient tracking columns to nutrition_logs table
-- This enables complete nutritional snapshot storage when users log food
-- 
-- These columns will be auto-populated by a trigger function that:
-- 1. Looks up the food_servings data
-- 2. Multiplies by quantity_consumed
-- 3. Stores the calculated values
--
-- Benefits:
-- - Zero-cost aggregation (pre-calculated)
-- - Historical accuracy (values frozen at time of logging)
-- - Complete micronutrient tracking per meal/day
-- - Fast dashboard queries (no joins needed)
-- =====================================================================================

-- Add fiber and sugar (grams)
ALTER TABLE nutrition_logs 
ADD COLUMN IF NOT EXISTS fiber_g NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sugar_g NUMERIC(10,2);

-- Add major minerals (milligrams)
ALTER TABLE nutrition_logs 
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS calcium_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS iron_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS potassium_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS magnesium_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS phosphorus_mg NUMERIC(10,2);

-- Add trace minerals (milligrams and micrograms)
ALTER TABLE nutrition_logs 
ADD COLUMN IF NOT EXISTS zinc_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS copper_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS selenium_mcg NUMERIC(10,2);

-- Add vitamins (various units)
ALTER TABLE nutrition_logs 
ADD COLUMN IF NOT EXISTS vitamin_a_mcg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS vitamin_b6_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS vitamin_b12_mcg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS vitamin_c_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS vitamin_e_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS vitamin_k_mcg NUMERIC(10,2);

-- Add B-vitamins (milligrams and micrograms)
ALTER TABLE nutrition_logs 
ADD COLUMN IF NOT EXISTS folate_mcg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS niacin_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS riboflavin_mg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS thiamin_mg NUMERIC(10,2);

-- Add comments for documentation
COMMENT ON COLUMN nutrition_logs.fiber_g IS 'Dietary fiber in grams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.sugar_g IS 'Total sugars in grams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.sodium_mg IS 'Sodium in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.calcium_mg IS 'Calcium in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.iron_mg IS 'Iron in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.potassium_mg IS 'Potassium in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.magnesium_mg IS 'Magnesium in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.phosphorus_mg IS 'Phosphorus in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.zinc_mg IS 'Zinc in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.copper_mg IS 'Copper in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.selenium_mcg IS 'Selenium in micrograms (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_a_mcg IS 'Vitamin A in micrograms RAE (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_b6_mg IS 'Vitamin B6 in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_b12_mcg IS 'Vitamin B12 in micrograms (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_c_mg IS 'Vitamin C in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_e_mg IS 'Vitamin E in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.vitamin_k_mcg IS 'Vitamin K in micrograms (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.folate_mcg IS 'Folate in micrograms DFE (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.niacin_mg IS 'Niacin (B3) in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.riboflavin_mg IS 'Riboflavin (B2) in milligrams (from food_servings * quantity_consumed)';
COMMENT ON COLUMN nutrition_logs.thiamin_mg IS 'Thiamin (B1) in milligrams (from food_servings * quantity_consumed)';

-- =====================================================================================
-- VERIFICATION QUERY
-- =====================================================================================
-- Run this to verify columns were added successfully:
/*
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nutrition_logs'
  AND column_name IN (
    'fiber_g', 'sugar_g', 'sodium_mg', 'calcium_mg', 'iron_mg', 'potassium_mg',
    'magnesium_mg', 'phosphorus_mg', 'zinc_mg', 'copper_mg', 'selenium_mcg',
    'vitamin_a_mcg', 'vitamin_b6_mg', 'vitamin_b12_mcg', 'vitamin_c_mg',
    'vitamin_e_mg', 'vitamin_k_mcg', 'folate_mcg', 'niacin_mg', 'riboflavin_mg', 'thiamin_mg'
  )
ORDER BY column_name;
*/
