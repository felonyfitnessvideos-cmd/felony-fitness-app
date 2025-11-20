-- Reset Enrichment for USDA Re-Processing
-- Clears all completed enrichment statuses and zeros out enrichment values
-- This forces ALL foods to be re-enriched with authoritative USDA data

-- ============================================================
-- STEP 1: Clear enrichment status (completed → null)
-- ============================================================
UPDATE food_servings
SET enrichment_status = NULL,
    last_enrichment = NULL
WHERE enrichment_status = 'completed';

-- ============================================================
-- STEP 2: Zero out ALL enrichment values (force re-enrichment)
-- ============================================================
UPDATE food_servings
SET calories = 0,
    protein_g = 0,
    carbs_g = 0,
    fat_g = 0,
    fiber_g = 0,
    sugar_g = 0,
    sodium_mg = 0,
    calcium_mg = 0,
    iron_mg = 0,
    vitamin_c_mg = 0,
    vitamin_a_mcg = 0,
    vitamin_b12_mcg = 0,
    vitamin_b6_mg = 0,
    vitamin_e_mg = 0,
    vitamin_k_mcg = 0,
    potassium_mg = 0,
    magnesium_mg = 0,
    zinc_mg = 0,
    copper_mg = 0,
    selenium_mcg = 0,
    phosphorus_mg = 0,
    folate_mcg = 0,
    thiamin_mg = 0,
    riboflavin_mg = 0,
    niacin_mg = 0,
    quality_score = NULL,
    data_sources = NULL;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check reset status
SELECT 
  COUNT(*) as total_foods,
  COUNT(*) FILTER (WHERE enrichment_status IS NULL) as reset_foods,
  COUNT(*) FILTER (WHERE enrichment_status = 'pending') as pending_foods,
  COUNT(*) FILTER (WHERE enrichment_status = 'completed') as completed_foods
FROM food_servings;

-- Verify all values zeroed
SELECT 
  COUNT(*) as total_foods,
  COUNT(*) FILTER (WHERE calories = 0) as zero_calories,
  COUNT(*) FILTER (WHERE protein_g = 0) as zero_protein,
  COUNT(*) FILTER (WHERE quality_score IS NULL) as no_quality_score
FROM food_servings;

-- Sample foods ready for re-enrichment
SELECT id, food_name, brand, category, enrichment_status
FROM food_servings
WHERE enrichment_status IS NULL
ORDER BY created_at
LIMIT 10;
