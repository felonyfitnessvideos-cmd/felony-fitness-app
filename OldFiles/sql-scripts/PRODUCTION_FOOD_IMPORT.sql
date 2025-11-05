-- =============================================================================
-- IMPORT 400-FOOD DATABASE TO PRODUCTION
-- =============================================================================
-- Run this script to import the comprehensive food database
-- Execute in Supabase SQL Editor or via psql

-- First, verify food_servings table is empty and ready
SELECT COUNT(*) as current_food_count FROM food_servings;

-- Import food servings data (this would be run with \copy command or CSV import)
-- The CSV files food_servings_build1.csv and food_servings_build2.csv contain:
-- food_name, serving_description, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, calcium_mg, iron_mg, vitamin_c_mg

-- After import, verify the data
-- SELECT COUNT(*) as total_foods FROM food_servings;
-- SELECT food_name, serving_description, calories FROM food_servings WHERE LOWER(food_name) LIKE '%turkey leg%';

-- Test critical functions
-- SELECT * FROM get_random_tip();
-- SELECT * FROM get_enrichment_status();

SELECT 'Ready to import 400-food database to production!' as status;