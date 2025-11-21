-- Verify USDA Data Quality After Fix
-- Run this after re-enrichment to confirm corrections

-- 1. Check specific problem foods
SELECT 
    food_name,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    ROUND((protein_g * 4) + (carbs_g * 4) + (fat_g * 9), 2) as calculated_calories,
    ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) as calorie_diff,
    brand,
    enrichment_status,
    last_enrichment
FROM food_servings
WHERE food_name IN (
    'Brussels Sprouts',
    'Kale, Raw',
    'Green Beans',
    'Apple, Medium',
    'Banana, Medium'
)
ORDER BY food_name;

-- 2. Check vegetables and fruits - should be low fat
SELECT 
    'High Fat Produce (should be near 0)' as check_name,
    COUNT(*) as count,
    AVG(fat_g) as avg_fat
FROM food_servings
WHERE category IN ('vegetable', 'fruit')
    AND fat_g > 10
    AND enrichment_status = 'completed';

-- 3. Calorie accuracy check across all enriched foods
SELECT 
    'Foods with >30 cal discrepancy' as check_name,
    COUNT(*) as count,
    ROUND(AVG(ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9)))), 2) as avg_discrepancy
FROM food_servings
WHERE enrichment_status = 'completed'
    AND ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) > 30;

-- 4. Show top 10 most suspicious remaining entries
SELECT 
    food_name,
    calories,
    ROUND((protein_g * 4) + (carbs_g * 4) + (fat_g * 9), 2) as calculated_calories,
    ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) as calorie_diff,
    fat_g,
    carbs_g,
    protein_g,
    category,
    brand
FROM food_servings
WHERE enrichment_status = 'completed'
ORDER BY calorie_diff DESC
LIMIT 10;

-- 5. Data source breakdown
SELECT 
    data_sources,
    COUNT(*) as total_foods,
    COUNT(CASE WHEN enrichment_status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN enrichment_status = 'pending' THEN 1 END) as pending,
    ROUND(AVG(quality_score), 2) as avg_quality_score
FROM food_servings
GROUP BY data_sources
ORDER BY total_foods DESC;

-- 6. Expected values for common whole foods
-- Use this as a reference for manual spot-checks
SELECT 
    '=== EXPECTED RANGES (per 100g) ===' as info,
    NULL as food_name,
    NULL as calories,
    NULL as fat_g;

SELECT 
    'Reference' as info,
    'Brussels Sprouts, raw' as food_name,
    '40-50 cal' as expected_calories,
    '<1g fat' as expected_fat
UNION ALL
SELECT 'Reference', 'Kale, raw', '30-40 cal', '<1g fat'
UNION ALL
SELECT 'Reference', 'Green Beans, raw', '30-35 cal', '<0.5g fat'
UNION ALL
SELECT 'Reference', 'Apple, raw', '50-55 cal per 100g', '<0.5g fat'
UNION ALL
SELECT 'Reference', 'Banana, raw', '85-95 cal per 100g', '<0.5g fat'
UNION ALL
SELECT 'Reference', 'Broccoli, raw', '30-35 cal', '<0.5g fat'
UNION ALL
SELECT 'Reference', 'Spinach, raw', '20-25 cal', '<0.5g fat';

-- ✅ PASS CRITERIA:
-- • Brussels Sprouts: ~40-50 cal, <1g fat
-- • Kale: ~30-40 cal, <1g fat  
-- • Green Beans: ~30-35 cal, <0.5g fat
-- • Most vegetables: <1g fat per 100g
-- • Calorie discrepancy: <20 for most foods
-- • No fruits/vegetables with >15g fat (except avocado/olives)
