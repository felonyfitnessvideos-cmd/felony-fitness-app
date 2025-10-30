-- Temporarily disable nutrition enrichment triggers until they're updated for new schema
-- The triggers are trying to access nutrition columns that are now in food_servings table

-- Drop all triggers that might be using the functions
DROP TRIGGER IF EXISTS nutrition_enrichment_trigger ON foods;
DROP TRIGGER IF EXISTS foods_enrichment_trigger ON foods;
DROP TRIGGER IF EXISTS foods_nutrition_trigger ON foods;

-- Drop the problematic functions (CASCADE to remove dependencies)
DROP FUNCTION IF EXISTS trigger_nutrition_enrichment() CASCADE;
DROP FUNCTION IF EXISTS calculate_basic_quality_score(foods) CASCADE;
DROP FUNCTION IF EXISTS needs_enrichment(foods) CASCADE;

-- Comment: These triggers need to be rewritten to work with the foods + food_servings schema
-- For now, we'll insert foods without automatic quality scoring