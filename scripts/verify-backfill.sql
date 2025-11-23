-- =====================================================================================
-- VERIFY BACKFILL RESULTS
-- =====================================================================================
-- Run this AFTER running backfill-failed-foods.sql to verify the changes
-- =====================================================================================

-- Check how many foods got updated
SELECT 
    'Foods with nutrition data (after backfill)' as metric,
    COUNT(*) as count
FROM food_servings
WHERE calories IS NOT NULL 
    AND protein_g IS NOT NULL 
    AND carbs_g IS NOT NULL 
    AND fat_g IS NOT NULL;

-- Check enrichment status distribution after backfill
SELECT 
    enrichment_status,
    COUNT(*) as count
FROM food_servings
GROUP BY enrichment_status
ORDER BY count DESC;

-- Show sample of foods that got backfilled (should have status = NULL now)
SELECT 
    id,
    food_name,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    enrichment_status
FROM food_servings
WHERE id IN (
    'cd21e1dd-9a5d-47f2-aeae-383e8e2924d5', -- Chicken leg
    'd52dd578-de16-4937-9912-4598cd1234c6', -- American cheese
    'cd3e2bbf-3abb-413e-84de-14959a5a29e3', -- Garlic bread
    'c3f1fa16-50aa-4d4c-b39b-2b0e2ea82cc9', -- Broccoli
    'd5af9733-67ad-4de3-b38d-3770476e4511'  -- Peanut butter
)
ORDER BY food_name;

-- Count foods ready for enrichment (status = NULL with nutrition data)
SELECT 
    'Foods ready for AI enrichment' as metric,
    COUNT(*) as count
FROM food_servings
WHERE enrichment_status IS NULL
    AND calories IS NOT NULL
    AND protein_g IS NOT NULL;
