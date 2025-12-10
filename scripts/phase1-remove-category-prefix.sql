-- ============================================================================
-- PHASE 1.4: Remove Redundant Category Prefixes from Names
-- ============================================================================
-- Purpose: Clean up food names that start with their category name
-- 
-- Examples:
--   "Beverages, coffee, ready to drink" → "Coffee, ready to drink"
--   "Vegetables, carrots, raw" → "Carrots, raw"
--   "Fruits, apple, raw" → "Apple, raw"
--
-- This avoids redundancy since we already have the category column
-- ============================================================================

-- Create function to remove category prefix
CREATE OR REPLACE FUNCTION remove_category_prefix(food_name text, food_category text)
RETURNS text AS $$
DECLARE
  cleaned_name text;
  category_singular text;
BEGIN
  cleaned_name := food_name;
  
  -- Don't process if category is unknown or null
  IF food_category IS NULL OR food_category IN ('Unknown', '') THEN
    RETURN cleaned_name;
  END IF;
  
  -- Remove exact category name from start (case insensitive)
  -- Pattern: "Category, rest of name" → "rest of name"
  cleaned_name := regexp_replace(
    cleaned_name, 
    '^' || food_category || ',\s*', 
    '', 
    'i'
  );
  
  -- Remove common category prefixes
  cleaned_name := regexp_replace(cleaned_name, '^Beverages?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Vegetables?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Fruits?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Meats?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Dairy,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Grains?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Cereals?,\s*', '', 'i');
  cleaned_name := regexp_replace(cleaned_name, '^Legumes?,\s*', '', 'i');
  
  -- Capitalize first letter after cleanup
  cleaned_name := upper(substring(cleaned_name from 1 for 1)) || substring(cleaned_name from 2);
  
  RETURN cleaned_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Preview changes (uncomment to see what will change)
-- SELECT 
--   id,
--   name as original_name,
--   category,
--   remove_category_prefix(name, category) as new_name
-- FROM foods
-- WHERE name ~* '^(Beverages?|Vegetables?|Fruits?|Meats?|Dairy|Grains?|Cereals?|Legumes?),\s'
-- ORDER BY category, name
-- LIMIT 50;

-- Apply the cleanup
UPDATE foods
SET name = remove_category_prefix(name, category)
WHERE name ~* '^(Beverages?|Vegetables?|Fruits?|Meats?|Dairy|Grains?|Cereals?|Legumes?),\s';

-- Report results
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Removed category prefixes from % food names', updated_count;
END $$;

-- Show sample of cleaned beverage names
SELECT 
  id,
  name,
  category
FROM foods
WHERE category = 'Beverages'
ORDER BY name
LIMIT 20;

-- Show sample of other cleaned names
SELECT 
  id,
  name,
  category
FROM foods
WHERE category IN ('Vegetables and Vegetable Products', 'Fruits and Fruit Juices')
ORDER BY category, name
LIMIT 20;
