-- =====================================================
-- FOOD DATABASE NUTRIENT COMPLETENESS AUDIT
-- =====================================================
-- This script identifies foods with missing micronutrient data
-- and provides statistics for enrichment prioritization

-- 1. OVERALL STATISTICS
-- =====================================================
SELECT 
    '📊 OVERALL STATISTICS' as section,
    COUNT(*) as total_foods,
    COUNT(*) FILTER (WHERE data_source = 'USDA') as usda_foods,
    COUNT(*) FILTER (WHERE data_source = 'Manual') as manual_foods,
    COUNT(*) FILTER (WHERE data_source = 'AI-Estimated') as ai_estimated_foods
FROM foods;

-- 2. MACRO COMPLETENESS (Should be 100%)
-- =====================================================
SELECT 
    '🍎 MACRO COMPLETENESS' as section,
    COUNT(*) as total_foods,
    COUNT(*) FILTER (WHERE calories > 0) as has_calories,
    COUNT(*) FILTER (WHERE protein_g > 0) as has_protein,
    COUNT(*) FILTER (WHERE fat_g > 0) as has_fat,
    COUNT(*) FILTER (WHERE carbs_g > 0) as has_carbs,
    ROUND(100.0 * COUNT(*) FILTER (WHERE calories > 0) / NULLIF(COUNT(*), 0), 1) as pct_calories,
    ROUND(100.0 * COUNT(*) FILTER (WHERE protein_g > 0 OR fat_g > 0 OR carbs_g > 0) / NULLIF(COUNT(*), 0), 1) as pct_any_macro
FROM foods;

-- 3. MINERAL COMPLETENESS
-- =====================================================
SELECT 
    '⚡ MINERAL COMPLETENESS' as section,
    COUNT(*) as total_foods,
    COUNT(*) FILTER (WHERE sodium_mg > 0) as has_sodium,
    COUNT(*) FILTER (WHERE potassium_mg > 0) as has_potassium,
    COUNT(*) FILTER (WHERE calcium_mg > 0) as has_calcium,
    COUNT(*) FILTER (WHERE iron_mg > 0) as has_iron,
    COUNT(*) FILTER (WHERE magnesium_mg > 0) as has_magnesium,
    COUNT(*) FILTER (WHERE phosphorus_mg > 0) as has_phosphorus,
    COUNT(*) FILTER (WHERE zinc_mg > 0) as has_zinc,
    COUNT(*) FILTER (WHERE copper_mg > 0) as has_copper,
    COUNT(*) FILTER (WHERE selenium_mcg > 0) as has_selenium,
    ROUND(100.0 * COUNT(*) FILTER (WHERE sodium_mg > 0) / NULLIF(COUNT(*), 0), 1) as pct_sodium,
    ROUND(100.0 * COUNT(*) FILTER (WHERE calcium_mg > 0) / NULLIF(COUNT(*), 0), 1) as pct_calcium,
    ROUND(100.0 * COUNT(*) FILTER (WHERE iron_mg > 0) / NULLIF(COUNT(*), 0), 1) as pct_iron
FROM foods;

-- 4. VITAMIN COMPLETENESS
-- =====================================================
SELECT 
    '🌟 VITAMIN COMPLETENESS' as section,
    COUNT(*) as total_foods,
    COUNT(*) FILTER (WHERE vitamin_a_mcg > 0) as has_vitamin_a,
    COUNT(*) FILTER (WHERE vitamin_c_mg > 0) as has_vitamin_c,
    COUNT(*) FILTER (WHERE vitamin_d_mcg > 0) as has_vitamin_d,
    COUNT(*) FILTER (WHERE vitamin_e_mg > 0) as has_vitamin_e,
    COUNT(*) FILTER (WHERE vitamin_k_mcg > 0) as has_vitamin_k,
    COUNT(*) FILTER (WHERE thiamin_mg > 0) as has_thiamin,
    COUNT(*) FILTER (WHERE riboflavin_mg > 0) as has_riboflavin,
    COUNT(*) FILTER (WHERE niacin_mg > 0) as has_niacin,
    COUNT(*) FILTER (WHERE vitamin_b6_mg > 0) as has_b6,
    COUNT(*) FILTER (WHERE folate_mcg > 0) as has_folate,
    COUNT(*) FILTER (WHERE vitamin_b12_mcg > 0) as has_b12,
    ROUND(100.0 * COUNT(*) FILTER (WHERE vitamin_c_mg > 0) / NULLIF(COUNT(*), 0), 1) as pct_vitamin_c,
    ROUND(100.0 * COUNT(*) FILTER (WHERE vitamin_d_mcg > 0) / NULLIF(COUNT(*), 0), 1) as pct_vitamin_d
FROM foods;

-- 5. FOODS WITH COMPLETE MICRONUTRIENT DATA
-- =====================================================
SELECT 
    '✅ COMPLETE DATA' as section,
    COUNT(*) as total_foods,
    COUNT(*) FILTER (WHERE 
        sodium_mg > 0 AND potassium_mg > 0 AND calcium_mg > 0 AND 
        iron_mg > 0 AND magnesium_mg > 0 AND zinc_mg > 0 AND
        vitamin_a_mcg > 0 AND vitamin_c_mg > 0 AND vitamin_d_mcg > 0
    ) as foods_with_complete_data,
    ROUND(100.0 * COUNT(*) FILTER (WHERE 
        sodium_mg > 0 AND potassium_mg > 0 AND calcium_mg > 0 AND 
        iron_mg > 0 AND magnesium_mg > 0 AND zinc_mg > 0 AND
        vitamin_a_mcg > 0 AND vitamin_c_mg > 0 AND vitamin_d_mcg > 0
    ) / NULLIF(COUNT(*), 0), 1) as pct_complete
FROM foods;

-- 6. MOST LOGGED FOODS WITH MISSING DATA (HIGH PRIORITY)
-- =====================================================
SELECT 
    '🔥 HIGH PRIORITY - Most Logged Foods Missing Data' as section,
    id,
    name,
    brand_owner,
    times_logged,
    last_logged_at,
    CASE 
        WHEN sodium_mg = 0 THEN '❌ Sodium' 
        ELSE '✓' 
    END as sodium,
    CASE 
        WHEN calcium_mg = 0 THEN '❌ Calcium' 
        ELSE '✓' 
    END as calcium,
    CASE 
        WHEN iron_mg = 0 THEN '❌ Iron' 
        ELSE '✓' 
    END as iron,
    CASE 
        WHEN vitamin_c_mg = 0 THEN '❌ Vit C' 
        ELSE '✓' 
    END as vit_c,
    CASE 
        WHEN vitamin_d_mcg = 0 THEN '❌ Vit D' 
        ELSE '✓' 
    END as vit_d
FROM foods
WHERE times_logged > 0
  AND (sodium_mg = 0 OR calcium_mg = 0 OR iron_mg = 0 OR 
       vitamin_c_mg = 0 OR vitamin_d_mcg = 0)
ORDER BY times_logged DESC, last_logged_at DESC NULLS LAST
LIMIT 20;

-- 7. FOODS BY DATA SOURCE - COMPLETENESS COMPARISON
-- =====================================================
SELECT 
    '📋 DATA SOURCE COMPARISON' as section,
    data_source,
    COUNT(*) as total_foods,
    ROUND(AVG(CASE WHEN sodium_mg > 0 THEN 1 ELSE 0 END) * 100, 1) as pct_has_sodium,
    ROUND(AVG(CASE WHEN calcium_mg > 0 THEN 1 ELSE 0 END) * 100, 1) as pct_has_calcium,
    ROUND(AVG(CASE WHEN iron_mg > 0 THEN 1 ELSE 0 END) * 100, 1) as pct_has_iron,
    ROUND(AVG(CASE WHEN vitamin_c_mg > 0 THEN 1 ELSE 0 END) * 100, 1) as pct_has_vit_c,
    ROUND(AVG(CASE WHEN vitamin_d_mcg > 0 THEN 1 ELSE 0 END) * 100, 1) as pct_has_vit_d
FROM foods
GROUP BY data_source
ORDER BY total_foods DESC;

-- 8. SAMPLE OF FOODS NEEDING ENRICHMENT
-- =====================================================
SELECT 
    '🔍 SAMPLE - Foods Needing Enrichment' as section,
    id,
    name,
    category,
    brand_owner,
    data_source,
    times_logged,
    -- Count missing nutrients
    (CASE WHEN sodium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN potassium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN calcium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN iron_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN magnesium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_a_mcg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_c_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_d_mcg = 0 THEN 1 ELSE 0 END) as missing_nutrient_count
FROM foods
WHERE (sodium_mg = 0 OR calcium_mg = 0 OR iron_mg = 0 OR 
       vitamin_c_mg = 0 OR vitamin_d_mcg = 0)
ORDER BY times_logged DESC, missing_nutrient_count DESC
LIMIT 30;
