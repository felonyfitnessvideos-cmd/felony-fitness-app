-- Fix Data Quality Issues in food_servings table
-- Run Date: 2025-11-19
-- Issues: 27 items with 0 calories but macros, categorization problems

-- =====================================================
-- PART 1: Fix Zero-Calorie Items with Macros
-- =====================================================

-- Calculate calories using standard formula: (P*4) + (C*4) + (F*9)
-- Only update items where calories = 0 but they have macronutrients

UPDATE food_servings
SET 
    calories = ROUND(
        (COALESCE(protein_g, 0) * 4) + 
        (COALESCE(carbs_g, 0) * 4) + 
        (COALESCE(fat_g, 0) * 9)
    , 1),
    quality_score = LEAST(quality_score, 60), -- Lower quality score due to calculated data
    data_sources = COALESCE(data_sources, 'user_input') || ' (calories calculated)'
WHERE 
    calories = 0 
    AND (protein_g > 0 OR carbs_g > 0 OR fat_g > 0);

-- Log the fix
SELECT 
    id,
    food_name,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    serving_description
FROM food_servings
WHERE data_sources LIKE '%(calories calculated)%'
ORDER BY food_name;

-- =====================================================
-- PART 2: Flag Items Needing Manual Review
-- =====================================================

-- Identify items with suspicious data that need manual review
-- Create a temporary view for review

CREATE OR REPLACE VIEW food_servings_quality_issues AS
SELECT 
    id,
    food_name,
    category,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    serving_description,
    quality_score,
    CASE
        WHEN category IN ('Proteins', 'Meat & Poultry') AND carbs_g > 2 
             AND food_name NOT ILIKE '%sandwich%' 
             AND food_name NOT ILIKE '%burger%'
             AND food_name NOT ILIKE '%pizza%'
             AND food_name NOT ILIKE '%quesadilla%'
             AND food_name NOT ILIKE '%wrap%'
             AND food_name NOT ILIKE '%soup%'
        THEN 'High carbs in pure meat'
        
        WHEN fiber_g > carbs_g AND carbs_g > 0
        THEN 'Fiber exceeds carbs'
        
        WHEN sugar_g > carbs_g AND carbs_g > 0
        THEN 'Sugar exceeds carbs'
        
        WHEN calories > 0 AND ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) > (calories * 0.25)
        THEN 'Calorie mismatch >25%'
        
        ELSE 'Unknown issue'
    END AS issue_type
FROM food_servings
WHERE 
    -- High carbs in pure meat
    (category IN ('Proteins', 'Meat & Poultry') AND carbs_g > 2 
     AND food_name NOT ILIKE '%sandwich%' 
     AND food_name NOT ILIKE '%burger%'
     AND food_name NOT ILIKE '%pizza%'
     AND food_name NOT ILIKE '%quesadilla%'
     AND food_name NOT ILIKE '%wrap%'
     AND food_name NOT ILIKE '%soup%')
    
    -- Fiber exceeds carbs
    OR (fiber_g > carbs_g AND carbs_g > 0)
    
    -- Sugar exceeds carbs
    OR (sugar_g > carbs_g AND carbs_g > 0)
    
    -- Calorie mismatch (>25% variance)
    OR (calories > 0 AND ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) > (calories * 0.25))
ORDER BY 
    CASE issue_type
        WHEN 'High carbs in pure meat' THEN 1
        WHEN 'Calorie mismatch >25%' THEN 2
        WHEN 'Fiber exceeds carbs' THEN 3
        WHEN 'Sugar exceeds carbs' THEN 4
        ELSE 5
    END,
    food_name;

-- Display quality issues
SELECT 
    issue_type,
    COUNT(*) as count,
    ARRAY_AGG(food_name ORDER BY food_name) as affected_foods
FROM food_servings_quality_issues
GROUP BY issue_type
ORDER BY count DESC;

-- =====================================================
-- PART 3: Reset Enrichment Status for Re-Processing
-- =====================================================

-- Mark all items with quality_score < 70 for re-enrichment with USDA API
-- This will cause them to be picked up by the new USDA enrichment worker

UPDATE food_servings
SET 
    enrichment_status = 'pending',
    last_enrichment = NOW()
WHERE 
    quality_score < 70
    OR quality_score IS NULL
    OR calories = 0;

-- =====================================================
-- PART 4: Summary Report
-- =====================================================

SELECT 
    '=== DATA QUALITY FIX SUMMARY ===' as report_section,
    '' as detail
UNION ALL
SELECT 
    'Zero-calorie items fixed',
    COUNT(*)::text
FROM food_servings
WHERE data_sources LIKE '%(calories calculated)%'
UNION ALL
SELECT 
    'Items flagged for manual review',
    COUNT(*)::text
FROM food_servings_quality_issues
UNION ALL
SELECT 
    'Items queued for re-enrichment',
    COUNT(*)::text
FROM food_servings
WHERE enrichment_status = 'pending'
UNION ALL
SELECT 
    'Average quality score (all items)',
    ROUND(AVG(quality_score), 1)::text
FROM food_servings
WHERE quality_score IS NOT NULL
UNION ALL
SELECT 
    'Items with quality score >= 80',
    COUNT(*)::text || ' (' || ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM food_servings), 0), 1)::text || '%)'
FROM food_servings
WHERE quality_score >= 80;

-- =====================================================
-- PART 5: Category Cleanup (Optional)
-- =====================================================

-- This section ensures categories follow the "primary ingredient" rule
-- Run this if you want to auto-categorize composite foods by their primary ingredient

-- Example: Turkey sandwich → Meat & Poultry (because turkey is primary)
-- This is a starting point - adjust as needed

UPDATE food_servings
SET category = 'Meat & Poultry'
WHERE 
    (food_name ILIKE '%beef%' 
     OR food_name ILIKE '%chicken%' 
     OR food_name ILIKE '%turkey%'
     OR food_name ILIKE '%pork%'
     OR food_name ILIKE '%bacon%'
     OR food_name ILIKE '%sausage%'
     OR food_name ILIKE '%ham%')
    AND category IS DISTINCT FROM 'Meat & Poultry'
    AND category IS DISTINCT FROM 'Proteins';

-- Display recategorized items
SELECT 
    food_name,
    category,
    'Recategorized to Meat & Poultry' as action
FROM food_servings
WHERE 
    category = 'Meat & Poultry'
    AND updated_at > NOW() - INTERVAL '1 minute'
ORDER BY food_name;
