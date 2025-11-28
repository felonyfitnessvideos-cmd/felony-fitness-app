-- Verify the enrichment data fix was applied
-- Run this query to check if the updates worked

-- Check how many records still have 9999.99 values
SELECT 
  'Still have 9999.99 calories' as status,
  COUNT(*) as count
FROM food_servings
WHERE calories = 9999.99

UNION ALL

SELECT 
  'Reset to NULL enrichment_status' as status,
  COUNT(*) as count
FROM food_servings
WHERE enrichment_status IS NULL AND needs_review = true

UNION ALL

SELECT 
  'Total records' as status,
  COUNT(*) as count
FROM food_servings;

-- Show sample of fixed records
SELECT 
  food_name,
  calories,
  enrichment_status,
  needs_review,
  review_flags
FROM food_servings
WHERE needs_review = true
  AND review_flags = 'bad_enrichment_data'
LIMIT 20;
