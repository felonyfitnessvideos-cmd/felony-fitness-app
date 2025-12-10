-- ============================================================================
-- PHASE 1.2: Fix Food Categories
-- ============================================================================
-- Purpose: Correct missing and incorrect food categories
-- 
-- Issues:
-- - Milk entries have category "Unknown" instead of "Dairy and Egg Products"
-- - Many chicken products missing "Poultry Products" category
-- - Fruits and vegetables without proper categories
-- - Beef and pork products need categorization
--
-- Strategy: Pattern-based category assignment using food names
-- ============================================================================

-- Step 1: Fix Dairy Products
UPDATE foods 
SET category = 'Dairy and Egg Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%milk%' 
    OR name ILIKE '%cheese%'
    OR name ILIKE '%yogurt%'
    OR name ILIKE '%cream,%'
    OR name ILIKE '%butter,%'
    OR name ILIKE 'eggs%'
  )
  -- Exclude false positives
  AND name NOT ILIKE '%milk chocolate%'
  AND name NOT ILIKE '%milkweed%'
  AND name NOT ILIKE '%coconut milk%'
  AND name NOT ILIKE '%peanut butter%'
  AND name NOT ILIKE '%apple butter%';

-- Step 2: Fix Poultry Products
UPDATE foods 
SET category = 'Poultry Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%chicken%'
    OR name ILIKE '%turkey%'
    OR name ILIKE '%duck%'
    OR name ILIKE '%goose%'
    OR name ILIKE 'poultry%'
  )
  -- Exclude chicken-flavored snacks
  AND name NOT ILIKE '%flavored%'
  AND name NOT ILIKE '%flavor%';

-- Step 3: Fix Beef Products
UPDATE foods 
SET category = 'Beef Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%beef%'
    OR name ILIKE '%steak%'
    OR name ILIKE '%brisket%'
    OR name ILIKE 'veal%'
  )
  AND name NOT ILIKE '%flavored%';

-- Step 4: Fix Pork Products
UPDATE foods 
SET category = 'Pork Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%pork%'
    OR name ILIKE '%bacon%'
    OR name ILIKE '%ham,%'
    OR name ILIKE '%sausage%'
  )
  AND name NOT ILIKE '%turkey bacon%'
  AND name NOT ILIKE '%turkey sausage%';

-- Step 5: Fix Fruits
UPDATE foods 
SET category = 'Fruits and Fruit Juices'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%berries%'
    OR name ILIKE '%apple%'
    OR name ILIKE '%banana%'
    OR name ILIKE '%orange%'
    OR name ILIKE '%grape%'
    OR name ILIKE '%peach%'
    OR name ILIKE '%pear%'
    OR name ILIKE '%melon%'
    OR name ILIKE '%mango%'
    OR name ILIKE '%pineapple%'
    OR name ILIKE '%cherry%'
    OR name ILIKE '%plum%'
  )
  AND name NOT ILIKE '%flavored%'
  AND name NOT ILIKE '%candy%';

-- Step 6: Fix Vegetables
UPDATE foods 
SET category = 'Vegetables and Vegetable Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%broccoli%'
    OR name ILIKE '%carrot%'
    OR name ILIKE '%spinach%'
    OR name ILIKE '%lettuce%'
    OR name ILIKE '%tomato%'
    OR name ILIKE '%pepper,%'
    OR name ILIKE '%onion%'
    OR name ILIKE '%potato%'
    OR name ILIKE '%squash%'
    OR name ILIKE '%zucchini%'
    OR name ILIKE '%corn,%'
    OR name ILIKE '%peas,%'
    OR name ILIKE '%beans,%'
  )
  AND name NOT ILIKE '%flavored%'
  AND name NOT ILIKE '%candy%';

-- Step 7: Fix Grains and Pasta
UPDATE foods 
SET category = 'Cereal Grains and Pasta'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%rice,%'
    OR name ILIKE '%pasta%'
    OR name ILIKE '%noodle%'
    OR name ILIKE '%oats%'
    OR name ILIKE '%oatmeal%'
    OR name ILIKE '%cereal%'
    OR name ILIKE '%bread%'
    OR name ILIKE '%quinoa%'
    OR name ILIKE '%barley%'
  );

-- Step 8: Fix Nuts and Seeds
UPDATE foods 
SET category = 'Nut and Seed Products'
WHERE category IN ('Unknown', '', NULL)
  AND (
    name ILIKE '%almond%'
    OR name ILIKE '%peanut%'
    OR name ILIKE '%cashew%'
    OR name ILIKE '%walnut%'
    OR name ILIKE '%seed%'
    OR name ILIKE '%pecan%'
  )
  AND name NOT ILIKE '%butter%'; -- Peanut butter is different category

-- Step 9: Report results
DO $$
DECLARE
  dairy_count integer;
  poultry_count integer;
  beef_count integer;
  fruit_count integer;
  veg_count integer;
  unknown_remaining integer;
BEGIN
  SELECT COUNT(*) INTO dairy_count FROM foods WHERE category = 'Dairy and Egg Products';
  SELECT COUNT(*) INTO poultry_count FROM foods WHERE category = 'Poultry Products';
  SELECT COUNT(*) INTO beef_count FROM foods WHERE category = 'Beef Products';
  SELECT COUNT(*) INTO fruit_count FROM foods WHERE category = 'Fruits and Fruit Juices';
  SELECT COUNT(*) INTO veg_count FROM foods WHERE category = 'Vegetables and Vegetable Products';
  SELECT COUNT(*) INTO unknown_remaining FROM foods WHERE category IN ('Unknown', '', NULL);
  
  RAISE NOTICE '✅ Category Fix Results:';
  RAISE NOTICE '   - Dairy products: %', dairy_count;
  RAISE NOTICE '   - Poultry products: %', poultry_count;
  RAISE NOTICE '   - Beef products: %', beef_count;
  RAISE NOTICE '   - Fruits: %', fruit_count;
  RAISE NOTICE '   - Vegetables: %', veg_count;
  RAISE NOTICE '   - Still unknown: %', unknown_remaining;
END $$;

-- Step 10: Show milk entries specifically (should now have correct category)
SELECT id, name, category, data_source
FROM foods
WHERE name ILIKE '%milk%'
  AND name NOT ILIKE '%chocolate%'
ORDER BY name
LIMIT 20;
