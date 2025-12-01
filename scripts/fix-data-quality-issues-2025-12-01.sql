/**
 * Data Quality Fix Script - December 1, 2025
 * 
 * Fixes identified by independent food data review:
 * 1. Alcohol miscategorized as "Grains, Bread & Pasta"
 * 2. Oils miscategorized as "Grains, Bread & Pasta"
 * 3. Vegetables miscategorized as "Grains, Bread & Pasta"
 * 4. Chips miscategorized as "Dairy & Eggs"
 * 5. Duplicate Doritos entries
 * 6. Impossible calorie/macro combinations
 */

-- ============================================================================
-- STEP 1: Identify miscategorized foods
-- ============================================================================

-- Find alcohol products miscategorized as Grains
SELECT id, food_name, category, calories, protein_g, carbs_g, fat_g
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%whiskey%' OR food_name ILIKE '%vodka%' OR
    food_name ILIKE '%rum%' OR food_name ILIKE '%gin%' OR
    food_name ILIKE '%tequila%' OR food_name ILIKE '%wine%' OR
    food_name ILIKE '%beer%' OR food_name ILIKE '%bourbon%' OR
    food_name ILIKE '%scotch%' OR food_name ILIKE '%brandy%' OR
    food_name ILIKE '%cocktail%' OR food_name ILIKE '%margarita%' OR
    food_name ILIKE '%mojito%' OR food_name ILIKE '%daiquiri%'
  )
ORDER BY food_name;

-- Find oils miscategorized as Grains
SELECT id, food_name, category, calories, protein_g, carbs_g, fat_g
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%oil%' OR food_name ILIKE '%lard%' OR
    food_name ILIKE '%shortening%' OR food_name ILIKE '%ghee%' OR
    food_name ILIKE '%whipped topping%'
  )
ORDER BY food_name;

-- Find vegetables miscategorized as Grains
SELECT id, food_name, category, calories, protein_g, carbs_g, fat_g
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%turnip%' OR food_name ILIKE '%collard%' OR
    food_name ILIKE '%mustard greens%' OR food_name ILIKE '%chard%' OR
    food_name ILIKE '%spinach%' OR food_name ILIKE '%kale%'
  )
ORDER BY food_name;

-- Find chips miscategorized as Dairy
SELECT id, food_name, category, calories, protein_g, carbs_g, fat_g
FROM food_servings
WHERE category = 'Dairy & Eggs'
  AND (
    food_name ILIKE '%chip%' OR food_name ILIKE '%dorito%' OR
    food_name ILIKE '%frito%' OR food_name ILIKE '%nacho%' OR
    food_name ILIKE '%tortilla chip%' OR food_name ILIKE '%potato chip%'
  )
ORDER BY food_name;

-- ============================================================================
-- STEP 2: Fix categorization errors
-- ============================================================================

-- Fix alcohol → Beverages
UPDATE food_servings
SET 
  category = 'Beverages',
  needs_review = false,
  review_flags = NULL,
  updated_at = NOW()
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%whiskey%' OR food_name ILIKE '%vodka%' OR
    food_name ILIKE '%rum%' OR food_name ILIKE '%gin%' OR
    food_name ILIKE '%tequila%' OR food_name ILIKE '%wine%' OR
    food_name ILIKE '%beer%' OR food_name ILIKE '%bourbon%' OR
    food_name ILIKE '%scotch%' OR food_name ILIKE '%brandy%' OR
    food_name ILIKE '%cocktail%' OR food_name ILIKE '%margarita%' OR
    food_name ILIKE '%mojito%' OR food_name ILIKE '%daiquiri%'
  );

-- Fix oils → Fats & Oils
UPDATE food_servings
SET 
  category = 'Fats & Oils',
  needs_review = false,
  review_flags = NULL,
  updated_at = NOW()
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%oil%' OR food_name ILIKE '%lard%' OR
    food_name ILIKE '%shortening%' OR food_name ILIKE '%ghee%' OR
    (food_name ILIKE '%whipped topping%' AND (food_name ILIKE '%fat free%' OR food_name ILIKE '%nonfat%'))
  );

-- Fix vegetables → Vegetables
UPDATE food_servings
SET 
  category = 'Vegetables',
  needs_review = false,
  review_flags = NULL,
  updated_at = NOW()
WHERE category = 'Grains, Bread & Pasta'
  AND (
    food_name ILIKE '%turnip%' OR food_name ILIKE '%collard%' OR
    food_name ILIKE '%mustard greens%' OR food_name ILIKE '%chard%'
  );

-- Fix chips → Snacks & Treats
UPDATE food_servings
SET 
  category = 'Snacks & Treats',
  needs_review = false,
  review_flags = NULL,
  updated_at = NOW()
WHERE category = 'Dairy & Eggs'
  AND (
    food_name ILIKE '%chip%' OR food_name ILIKE '%dorito%' OR
    food_name ILIKE '%frito%' OR food_name ILIKE '%nacho%' OR
    food_name ILIKE '%tortilla chip%' OR food_name ILIKE '%potato chip%'
  );

-- ============================================================================
-- STEP 3: Find and flag duplicate foods
-- ============================================================================

-- Find duplicate Doritos entries
SELECT 
  id,
  food_name,
  brand,
  category,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  COUNT(*) OVER (PARTITION BY LOWER(TRIM(food_name))) as duplicate_count
FROM food_servings
WHERE food_name ILIKE '%dorito%'
ORDER BY food_name, id;

-- Flag duplicate Doritos for review (keep the one with highest quality_score)
WITH ranked_doritos AS (
  SELECT 
    id,
    food_name,
    quality_score,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(REGEXP_REPLACE(food_name, '\s+', ' ', 'g'))
      ORDER BY quality_score DESC NULLS LAST, created_at ASC
    ) as rn
  FROM food_servings
  WHERE food_name ILIKE '%dorito%'
)
UPDATE food_servings fs
SET 
  needs_review = true,
  review_flags = ARRAY['DUPLICATE_ENTRY'],
  review_details = jsonb_build_object(
    'reason', 'Duplicate Doritos entry - manual merge needed',
    'action', 'Review and merge with higher quality version'
  ),
  updated_at = NOW()
FROM ranked_doritos rd
WHERE fs.id = rd.id 
  AND rd.rn > 1;

-- ============================================================================
-- STEP 4: Flag impossible macro combinations
-- ============================================================================

-- Find foods with MAX_CORRECTION_ATTEMPTS_EXCEEDED
SELECT 
  id,
  food_name,
  category,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  (protein_g * 4) + (carbs_g * 4) + (fat_g * 9) as calculated_calories,
  ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) as calorie_diff,
  review_flags
FROM food_servings
WHERE 'MAX_CORRECTION_ATTEMPTS_EXCEEDED' = ANY(review_flags)
ORDER BY calorie_diff DESC
LIMIT 20;

-- ============================================================================
-- STEP 5: Find alcohol with physics violations
-- ============================================================================

-- Alcohol with impossibly low calories
SELECT 
  id,
  food_name,
  category,
  serving_description,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  sugar_g
FROM food_servings
WHERE (
    food_name ILIKE '%whiskey%' OR food_name ILIKE '%vodka%' OR
    food_name ILIKE '%rum%' OR food_name ILIKE '%gin%' OR
    food_name ILIKE '%wine%' OR food_name ILIKE '%beer%'
  )
  AND calories < 50
  AND serving_amount >= 100
ORDER BY calories ASC;

-- Diet drinks with MORE calories than non-diet
WITH beverage_pairs AS (
  SELECT 
    REGEXP_REPLACE(food_name, '(diet|zero|light)', 'regular', 'gi') as base_name,
    food_name,
    calories,
    CASE 
      WHEN food_name ILIKE '%diet%' OR food_name ILIKE '%zero%' OR food_name ILIKE '%light%' 
      THEN true 
      ELSE false 
    END as is_diet
  FROM food_servings
  WHERE category = 'Beverages'
    AND (food_name ILIKE '%diet%' OR food_name ILIKE '%zero%' OR food_name ILIKE '%light%')
)
SELECT * FROM beverage_pairs
WHERE is_diet = true AND calories > 50
ORDER BY calories DESC;

-- ============================================================================
-- STEP 6: Flag foods with zero macros but calories from sugar
-- ============================================================================

-- Flag foods where sugar > 0 but calories/macros don't add up
UPDATE food_servings
SET 
  needs_review = true,
  review_flags = COALESCE(review_flags, ARRAY[]::text[]) || ARRAY['SUGAR_WITHOUT_CARBS'],
  review_details = jsonb_build_object(
    'issue', 'Has sugar but missing carbohydrate calories',
    'sugar_g', sugar_g,
    'carbs_g', carbs_g,
    'calories', calories
  ),
  updated_at = NOW()
WHERE sugar_g > 0
  AND carbs_g < sugar_g
  AND NOT ('SUGAR_WITHOUT_CARBS' = ANY(COALESCE(review_flags, ARRAY[]::text[])));

-- ============================================================================
-- STEP 7: Generate summary report
-- ============================================================================

SELECT 
  'Alcohol miscategorized as Grains' as issue,
  COUNT(*) as count
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (food_name ILIKE '%whiskey%' OR food_name ILIKE '%vodka%' OR food_name ILIKE '%wine%')

UNION ALL

SELECT 
  'Oils miscategorized as Grains',
  COUNT(*)
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND food_name ILIKE '%oil%'

UNION ALL

SELECT 
  'Vegetables miscategorized as Grains',
  COUNT(*)
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (food_name ILIKE '%turnip%' OR food_name ILIKE '%greens%')

UNION ALL

SELECT 
  'Chips miscategorized as Dairy',
  COUNT(*)
FROM food_servings
WHERE category = 'Dairy & Eggs'
  AND food_name ILIKE '%chip%'

UNION ALL

SELECT 
  'Duplicate entries flagged',
  COUNT(*)
FROM food_servings
WHERE 'DUPLICATE_ENTRY' = ANY(review_flags)

UNION ALL

SELECT 
  'MAX_CORRECTION_ATTEMPTS_EXCEEDED',
  COUNT(*)
FROM food_servings
WHERE 'MAX_CORRECTION_ATTEMPTS_EXCEEDED' = ANY(review_flags);

-- ============================================================================
-- VERIFICATION: Check that fixes were applied
-- ============================================================================

-- Should return 0 rows after fixes
SELECT 'POST-FIX: Alcohol still in Grains category' as check_name, COUNT(*) as violations
FROM food_servings
WHERE category = 'Grains, Bread & Pasta'
  AND (food_name ILIKE '%whiskey%' OR food_name ILIKE '%vodka%' OR food_name ILIKE '%wine%')
HAVING COUNT(*) > 0;
