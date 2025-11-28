-- Reset needs_review flag for the 119 bad_enrichment_data foods
-- This allows verification workers to reprocess them with the fixed calorie estimates
-- Run this AFTER fix_bad_enrichment_data_v2.sql has been executed

UPDATE food_servings 
SET 
  needs_review = FALSE,
  -- Keep the review_flags so we can track these were fixed
  review_flags = ARRAY['bad_enrichment_data_fixed']
WHERE review_flags @> ARRAY['bad_enrichment_data']
  AND needs_review = TRUE;

-- Expected result: UPDATE 119

-- Verify the reset
SELECT 
  COUNT(*) as foods_ready_for_reverification,
  AVG(calories) as avg_estimated_calories
FROM food_servings
WHERE review_flags @> ARRAY['bad_enrichment_data_fixed']
  AND needs_review = FALSE
  AND enrichment_status IS NULL;

-- Should show: 119 foods with average ~350 calories (our estimates)
