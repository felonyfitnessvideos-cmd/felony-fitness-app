-- Fix Corrupted USDA Food Data
-- Generated: 2025-11-20
-- Issue: Enrichment was pulling from Branded Foods instead of FNDDS/Foundation/SR Legacy
-- Result: Brussels Sprout Chips instead of Raw Brussels Sprouts, etc.

-- This script marks corrupted foods for re-enrichment based on calorie discrepancy analysis

-- IMPORTANT: Run each section separately to avoid trigger function errors
-- DO NOT wrap in BEGIN/COMMIT transaction

-- =====================================================
-- SECTION 1: Mark foods with calorie discrepancies
-- =====================================================

-- Mark foods with suspicious calorie counts for re-enrichment
-- Formula: Expected calories = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)
-- Flag items where actual calories differ by more than 30 from calculated

UPDATE food_servings
SET 
    enrichment_status = 'pending',
    last_enrichment = NULL,
    quality_score = 50
WHERE 
    enrichment_status = 'completed'
    AND data_sources = 'USDA'
    AND ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) > 30;

-- Check results
SELECT COUNT(*) as foods_marked_by_calorie_discrepancy FROM food_servings 
WHERE enrichment_status = 'pending' AND data_sources = 'USDA';

-- =====================================================
-- SECTION 2: Mark known problematic food patterns
-- =====================================================
UPDATE food_servings
SET 
    enrichment_status = 'pending',
    last_enrichment = NULL,
    quality_score = 50  -- Downgrade quality score
WHERE 
    enrichment_status = 'completed'
    AND data_sources = 'USDA'
    AND (
        -- Vegetables that should be low calorie but aren't
        (food_name ILIKE '%brussels sprout%' AND calories > 100) OR
        (food_name ILIKE '%kale%' AND calories > 100) OR
        (food_name ILIKE '%spinach%' AND calories > 50) OR
        (food_name ILIKE '%lettuce%' AND calories > 50) OR
        (food_name ILIKE '%broccoli%' AND calories > 100) OR
        (food_name ILIKE '%cauliflower%' AND calories > 100) OR
        (food_name ILIKE '%green bean%' AND calories > 100) OR
        (food_name ILIKE '%cabbage%' AND calories > 50) OR
        
        -- Fruits that should be moderate calorie but are too high
        (food_name ILIKE '%apple%' AND calories > 150) OR
        (food_name ILIKE '%banana%' AND calories > 200) OR
        (food_name ILIKE '%orange%' AND calories > 150) OR
        (food_name ILIKE '%strawberr%' AND calories > 100) OR
        (food_name ILIKE '%blueberr%' AND calories > 150) OR
        
        -- Any vegetable/fruit with abnormally high fat content (likely fried/processed)
        (category IN ('vegetable', 'fruit') AND fat_g > 15)
    );

-- Check results
SELECT COUNT(*) as total_foods_marked_for_reenrichment FROM food_servings 
WHERE enrichment_status = 'pending' AND data_sources = 'USDA';

-- =====================================================
-- SECTION 3: Review what will be re-enriched
-- =====================================================
SELECT 
    food_name,
    calories,
    ROUND((protein_g * 4) + (carbs_g * 4) + (fat_g * 9), 2) as calculated_calories,
    ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) as calorie_diff,
    fat_g,
    brand,
    category,
    enrichment_status
FROM food_servings
WHERE enrichment_status = 'pending'
    AND data_sources = 'USDA'
ORDER BY calorie_diff DESC
LIMIT 50;

-- Summary of changes
SELECT 
    'Total foods marked for re-enrichment' as metric,
    COUNT(*) as count
FROM food_servings
WHERE enrichment_status = 'pending'
    AND data_sources = 'USDA'
UNION ALL
SELECT 
    'Vegetables/Fruits flagged' as metric,
    COUNT(*)
FROM food_servings
WHERE enrichment_status = 'pending'
    AND data_sources = 'USDA'
    AND category IN ('vegetable', 'fruit')
UNION ALL
SELECT 
    'High fat produce (likely processed)' as metric,
    COUNT(*)
FROM food_servings
WHERE enrichment_status = 'pending'
    AND data_sources = 'USDA'
    AND category IN ('vegetable', 'fruit')
    AND fat_g > 15;

-- =====================================================
-- IMPORTANT: DO NOT USE BEGIN/COMMIT
-- =====================================================
-- The trigger function error occurs when running in a transaction block.
-- Run each UPDATE statement separately, or run the entire script without BEGIN/COMMIT.

-- INSTRUCTIONS:
-- 1. Copy this entire script (without BEGIN/COMMIT wrapper)
-- 2. Paste into Supabase SQL Editor: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new
-- 3. Click 'Run' - it will execute all statements sequentially
-- 4. Review the output to verify correct foods are marked
-- 5. After running, the enrichment worker will re-process these foods with the fixed search strategy
--    (New priority: Survey/FNDDS → Foundation → SR Legacy → Branded)
-- 6. Expected outcome: Brussels Sprouts will be ~43 cal instead of 500 cal, etc.
-- 7. Wait 5-10 minutes for enrichment worker to run
-- 8. Verify fixes with verify-usda-data-quality.sql
