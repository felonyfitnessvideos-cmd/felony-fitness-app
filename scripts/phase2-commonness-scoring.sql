-- ============================================================================
-- PHASE 2: Commonness Scoring
-- ============================================================================
-- Purpose: Assign relevance scores to foods based on how commonly they're consumed
--          by fitness-focused Americans
-- 
-- Score Ranges:
-- - 90-100: Staple foods (milk, chicken breast, rice, eggs, bananas)
-- - 70-89:  Very common foods (most fruits, vegetables, lean proteins)
-- - 50-69:  Common foods (branded items, prepared foods)
-- - 30-49:  Less common (specialty items, ethnic variants)
-- - 10-29:  Rare (exotic foods, uncommon preparations)
-- - 0-9:    Very rare (should rarely appear in searches)
--
-- Strategy: Pattern-based scoring using food names and categories
-- ============================================================================

-- Step 1: BOOST TIER - Staple Fitness Foods (Score: 95-100)
-- These should ALWAYS appear first in searches

-- Dairy staples
UPDATE foods SET commonness_score = 100
WHERE name IN (
  'Milk, whole',
  'Milk, reduced fat (2%)',
  'Milk, fat free (skim)',
  'Milk, low fat (1%)',
  'Milk'
);

UPDATE foods SET commonness_score = 98
WHERE name ILIKE '%yogurt, plain%' 
  OR name ILIKE '%greek yogurt%'
  OR name = 'Eggs'
  OR name ILIKE 'Egg, whole%';

-- Protein staples
UPDATE foods SET commonness_score = 100
WHERE name ILIKE '%chicken breast%'
  OR name ILIKE 'Chicken, broilers%breast%meat only%'
  OR name ILIKE '%ground beef%'
  OR name ILIKE '%ground turkey%';

UPDATE foods SET commonness_score = 98
WHERE name ILIKE '%salmon%'
  OR name ILIKE '%tuna%'
  OR name ILIKE '%turkey breast%'
  OR name ILIKE '%chicken thigh%';

-- Grain staples
UPDATE foods SET commonness_score = 100
WHERE name IN (
  'Rice, white',
  'Rice, brown',
  'Oats',
  'Oatmeal'
)
OR name ILIKE 'Rice, white,%'
OR name ILIKE 'Rice, brown,%';

UPDATE foods SET commonness_score = 95
WHERE name ILIKE '%quinoa%'
  OR name ILIKE '%pasta%'
  OR name ILIKE 'Bread, whole%';

-- Fruit staples
UPDATE foods SET commonness_score = 100
WHERE name IN ('Bananas', 'Apples', 'Oranges')
  OR name = 'Banana'
  OR name = 'Apple'
  OR name = 'Orange';

UPDATE foods SET commonness_score = 95
WHERE name ILIKE '%strawberr%'
  OR name ILIKE '%blueberr%'
  OR name ILIKE '%raspberr%'
  OR name ILIKE '%grape%'
  OR name ILIKE '%peach%'
  OR name ILIKE '%pear%';

-- Vegetable staples
UPDATE foods SET commonness_score = 100
WHERE name ILIKE '%broccoli%'
  OR name ILIKE '%carrot%'
  OR name ILIKE '%spinach%'
  OR name IN ('Lettuce', 'Tomatoes', 'Potatoes');

UPDATE foods SET commonness_score = 95
WHERE name ILIKE '%bell pepper%'
  OR name ILIKE '%onion%'
  OR name ILIKE '%sweet potato%'
  OR name ILIKE '%green beans%'
  OR name ILIKE '%cucumber%';

-- Step 2: HIGH TIER - Very Common Foods (Score: 70-89)
-- Common but not staples

UPDATE foods SET commonness_score = 85
WHERE category = 'Poultry Products' 
  AND commonness_score = 50; -- Default, not already boosted

UPDATE foods SET commonness_score = 85
WHERE category = 'Beef Products'
  AND name NOT ILIKE '%organ%'
  AND name NOT ILIKE '%tongue%'
  AND name NOT ILIKE '%brain%'
  AND commonness_score = 50;

UPDATE foods SET commonness_score = 80
WHERE category = 'Fruits and Fruit Juices'
  AND commonness_score = 50;

UPDATE foods SET commonness_score = 80
WHERE category = 'Vegetables and Vegetable Products'
  AND commonness_score = 50;

UPDATE foods SET commonness_score = 75
WHERE category = 'Dairy and Egg Products'
  AND commonness_score = 50;

UPDATE foods SET commonness_score = 75
WHERE category = 'Cereal Grains and Pasta'
  AND commonness_score = 50;

-- Step 3: MEDIUM TIER - Common Foods (Score: 50-69)
-- Branded, prepared, and restaurant foods stay at default or slightly lower

UPDATE foods SET commonness_score = 60
WHERE category IN ('Fast Foods', 'Restaurant')
  AND commonness_score = 50;

UPDATE foods SET commonness_score = 55
WHERE category = 'Meals, Entrees, and Side Dishes'
  AND commonness_score = 50;

-- Step 4: LOW TIER - Specialty/Uncommon Foods (Score: 20-49)

-- Game meats and exotic proteins
UPDATE foods SET commonness_score = 25
WHERE name ILIKE '%bison%'
  OR name ILIKE '%venison%'
  OR name ILIKE '%elk%'
  OR name ILIKE '%buffalo%'
  OR name ILIKE '%goat%'
  OR name ILIKE '%lamb%'
  OR name ILIKE '%rabbit%';

-- Organ meats
UPDATE foods SET commonness_score = 20
WHERE name ILIKE '%liver%'
  OR name ILIKE '%kidney%'
  OR name ILIKE '%heart%'
  OR name ILIKE '%tongue%'
  OR name ILIKE '%brain%'
  OR name ILIKE '%tripe%';

-- Ethnic/specialty categories
UPDATE foods SET commonness_score = 30
WHERE category ILIKE '%Indian%'
  OR category ILIKE '%Native%'
  OR category ILIKE '%ethnic%';

-- Very specific preparations
UPDATE foods SET commonness_score = 35
WHERE name ~ '\([A-Za-z]+ style\)$'; -- "(Mexican style)", "(Asian style)", etc.

-- Step 5: VERY LOW TIER - Rare/Exotic (Score: 0-19)

-- Plant-based milk alternatives (unless user explicitly searches for them)
UPDATE foods SET commonness_score = 40
WHERE name ILIKE '%almond milk%'
  OR name ILIKE '%soy milk%'
  OR name ILIKE '%oat milk%'
  OR name ILIKE '%coconut milk%';

-- Buttermilk (specialty dairy)
UPDATE foods SET commonness_score = 35
WHERE name ILIKE '%buttermilk%';

-- Uncommon seeds and grains
UPDATE foods SET commonness_score = 30
WHERE name ILIKE '%chia%'
  OR name ILIKE '%flax%'
  OR name ILIKE '%hemp%'
  OR name ILIKE '%amaranth%';

-- Report results
DO $$
DECLARE
  tier_100 integer;
  tier_90 integer;
  tier_70 integer;
  tier_50 integer;
  tier_30 integer;
  tier_low integer;
BEGIN
  SELECT COUNT(*) INTO tier_100 FROM foods WHERE commonness_score >= 95;
  SELECT COUNT(*) INTO tier_90 FROM foods WHERE commonness_score BETWEEN 90 AND 94;
  SELECT COUNT(*) INTO tier_70 FROM foods WHERE commonness_score BETWEEN 70 AND 89;
  SELECT COUNT(*) INTO tier_50 FROM foods WHERE commonness_score BETWEEN 50 AND 69;
  SELECT COUNT(*) INTO tier_30 FROM foods WHERE commonness_score BETWEEN 30 AND 49;
  SELECT COUNT(*) INTO tier_low FROM foods WHERE commonness_score < 30;
  
  RAISE NOTICE '✅ Commonness Scoring Complete:';
  RAISE NOTICE '   - Staple foods (95-100): %', tier_100;
  RAISE NOTICE '   - Very common (90-94): %', tier_90;
  RAISE NOTICE '   - Common (70-89): %', tier_70;
  RAISE NOTICE '   - Medium (50-69): %', tier_50;
  RAISE NOTICE '   - Uncommon (30-49): %', tier_30;
  RAISE NOTICE '   - Rare (0-29): %', tier_low;
END $$;

-- Show top-scored milk entries (should see whole milk, 2%, skim at top)
SELECT name, category, commonness_score
FROM foods
WHERE name ILIKE '%milk%'
  AND name NOT ILIKE '%chocolate%'
ORDER BY commonness_score DESC, name
LIMIT 15;

-- Show top-scored chicken entries (should see chicken breast at top)
SELECT name, category, commonness_score
FROM foods
WHERE name ILIKE '%chicken%'
ORDER BY commonness_score DESC, name
LIMIT 15;
