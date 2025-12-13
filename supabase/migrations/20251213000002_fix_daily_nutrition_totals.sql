-- ============================================================================
-- FIX: Remove double multiplication in daily_nutrition_totals view
-- ============================================================================
-- Date: 2025-12-13
-- Issue: nutrition_logs already stores pre-calculated values (calories * quantity)
--        The view was multiplying by quantity_consumed again, causing 100x inflation
-- Fix: Remove the multiplication - just SUM the already-calculated values
-- ============================================================================

DROP VIEW IF EXISTS weekly_nutrition_summary CASCADE;
DROP VIEW IF EXISTS daily_nutrition_totals CASCADE;

-- Recreate daily nutrition totals view WITHOUT the multiplication
-- nutrition_logs.calories is ALREADY (food.calories * quantity_consumed) via trigger
CREATE OR REPLACE VIEW daily_nutrition_totals AS
SELECT 
  nl.user_id,
  nl.log_date,
  
  -- Macronutrients (7)
  -- NOTE: Values in nutrition_logs are ALREADY multiplied by quantity_consumed via trigger
  COALESCE(SUM(nl.calories), 0)::DECIMAL(10,2) as total_calories,
  COALESCE(SUM(nl.protein_g), 0)::DECIMAL(10,2) as total_protein_g,
  COALESCE(SUM(nl.carbs_g), 0)::DECIMAL(10,2) as total_carbs_g,
  COALESCE(SUM(nl.fat_g), 0)::DECIMAL(10,2) as total_fat_g,
  COALESCE(SUM(nl.fiber_g), 0)::DECIMAL(10,2) as total_fiber_g,
  COALESCE(SUM(nl.sugar_g), 0)::DECIMAL(10,2) as total_sugar_g,
  
  -- Minerals (9)
  COALESCE(SUM(nl.sodium_mg), 0)::DECIMAL(10,2) as total_sodium_mg,
  COALESCE(SUM(nl.potassium_mg), 0)::DECIMAL(10,2) as total_potassium_mg,
  COALESCE(SUM(nl.calcium_mg), 0)::DECIMAL(10,2) as total_calcium_mg,
  COALESCE(SUM(nl.iron_mg), 0)::DECIMAL(10,2) as total_iron_mg,
  COALESCE(SUM(nl.magnesium_mg), 0)::DECIMAL(10,2) as total_magnesium_mg,
  COALESCE(SUM(nl.phosphorus_mg), 0)::DECIMAL(10,2) as total_phosphorus_mg,
  COALESCE(SUM(nl.zinc_mg), 0)::DECIMAL(10,2) as total_zinc_mg,
  COALESCE(SUM(nl.copper_mg), 0)::DECIMAL(10,2) as total_copper_mg,
  COALESCE(SUM(nl.selenium_mcg), 0)::DECIMAL(10,2) as total_selenium_mcg,
  
  -- Cholesterol (separate category)
  COALESCE(SUM(nl.cholesterol_mg), 0)::DECIMAL(10,2) as total_cholesterol_mg,
  
  -- Vitamins (11)
  COALESCE(SUM(nl.vitamin_a_mcg), 0)::DECIMAL(10,2) as total_vitamin_a_mcg,
  COALESCE(SUM(nl.vitamin_c_mg), 0)::DECIMAL(10,2) as total_vitamin_c_mg,
  COALESCE(SUM(nl.vitamin_e_mg), 0)::DECIMAL(10,2) as total_vitamin_e_mg,
  COALESCE(SUM(nl.vitamin_d_mcg), 0)::DECIMAL(10,2) as total_vitamin_d_mcg,
  COALESCE(SUM(nl.vitamin_k_mcg), 0)::DECIMAL(10,2) as total_vitamin_k_mcg,
  COALESCE(SUM(nl.thiamin_mg), 0)::DECIMAL(10,2) as total_thiamin_mg,
  COALESCE(SUM(nl.riboflavin_mg), 0)::DECIMAL(10,2) as total_riboflavin_mg,
  COALESCE(SUM(nl.niacin_mg), 0)::DECIMAL(10,2) as total_niacin_mg,
  COALESCE(SUM(nl.vitamin_b6_mg), 0)::DECIMAL(10,2) as total_vitamin_b6_mg,
  COALESCE(SUM(nl.folate_mcg), 0)::DECIMAL(10,2) as total_folate_mcg,
  COALESCE(SUM(nl.vitamin_b12_mcg), 0)::DECIMAL(10,2) as total_vitamin_b12_mcg,
  
  -- Water tracking (not pre-calculated, needs no multiplication)
  COALESCE(SUM(nl.water_oz_consumed), 0)::DECIMAL(10,2) as total_water_oz,
  
  -- Metadata
  COUNT(*) as entry_count,
  COUNT(DISTINCT nl.food_id) as unique_foods_count,
  MAX(nl.created_at) as last_entry_time,
  MIN(nl.created_at) as first_entry_time
  
FROM nutrition_logs nl
GROUP BY nl.user_id, nl.log_date;

ALTER VIEW daily_nutrition_totals SET (security_invoker = true);

-- Recreate weekly nutrition summary view
CREATE OR REPLACE VIEW weekly_nutrition_summary AS
SELECT 
  user_id,
  log_date,
  
  -- 7-day totals (for current week)
  SUM(total_calories) OVER w7 as week_calories,
  SUM(total_protein_g) OVER w7 as week_protein_g,
  SUM(total_carbs_g) OVER w7 as week_carbs_g,
  SUM(total_fat_g) OVER w7 as week_fat_g,
  SUM(total_fiber_g) OVER w7 as week_fiber_g,
  SUM(total_sugar_g) OVER w7 as week_sugar_g,
  
  -- Daily averages (for the past 7 days)
  AVG(total_calories) OVER w7 as avg_daily_calories,
  AVG(total_protein_g) OVER w7 as avg_daily_protein_g,
  AVG(total_carbs_g) OVER w7 as avg_daily_carbs_g,
  AVG(total_fat_g) OVER w7 as avg_daily_fat_g,
  
  -- Day count (to know if we have a full week)
  COUNT(*) OVER w7 as days_logged_in_week,
  
  -- Current day totals (for quick access)
  total_calories as today_calories,
  total_protein_g as today_protein_g,
  total_carbs_g as today_carbs_g,
  total_fat_g as today_fat_g,
  entry_count as today_entry_count
  
FROM daily_nutrition_totals
WINDOW w7 AS (
  PARTITION BY user_id 
  ORDER BY log_date 
  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
);

ALTER VIEW weekly_nutrition_summary SET (security_invoker = true);

-- ============================================================================
-- EXPLANATION
-- ============================================================================
-- The nutrition_logs table has a trigger that auto-populates nutrition columns
-- when a food is logged. The trigger already multiplies by quantity_consumed:
--
-- BEFORE INSERT/UPDATE trigger does:
--   NEW.calories = (food.calories * NEW.quantity_consumed)
--   NEW.protein_g = (food.protein_g * NEW.quantity_consumed)
--   etc.
--
-- So the values in nutrition_logs are ALREADY the total for that log entry.
-- We just need to SUM them, not multiply again.
-- ============================================================================
