-- ============================================================================
-- PHASE 1.5: Final Data Quality Cleanup
-- ============================================================================
-- Purpose: Additional cleanup to make food names more user-friendly
-- 
-- Issues to fix:
-- 1. Overly verbose preparation methods: "cooked, boiled, drained, without salt"
-- 2. Incomplete names: "Mixed, frozen" → "Mixed vegetables, frozen"
-- 3. Fast food prefix redundancy: "Fast foods, nachos" → "Nachos (fast food)"
-- 4. Restaurant brand formatting
-- ============================================================================

-- 1. Simplify overly technical preparation methods
-- "cooked, boiled, drained, without salt" → "cooked, boiled"
UPDATE foods
SET name = regexp_replace(
  name,
  ', drained, (with|without) salt$',
  '',
  'gi'
)
WHERE name ~ ', drained, (with|without) salt$';

UPDATE foods  
SET name = regexp_replace(
  name,
  ', drained$',
  '',
  'gi'
)
WHERE name ~ ', drained$' 
  AND name !~ 'canned'; -- Keep "drained" for canned foods (it's important)

-- 2. Fix incomplete "Mixed" entries (assume vegetables unless proven otherwise)
UPDATE foods
SET name = regexp_replace(name, '^Mixed,', 'Mixed vegetables,', 'i')
WHERE name ~* '^Mixed,'
  AND category IN ('Vegetables and Vegetable Products', 'Unknown', '');

-- 3. Simplify "Fast foods" prefix
-- Move to parenthetical suffix for better search
CREATE OR REPLACE FUNCTION simplify_fast_food_name(food_name text)
RETURNS text AS $$
DECLARE
  cleaned_name text;
  main_name text;
BEGIN
  cleaned_name := food_name;
  
  -- Pattern: "Fast foods, item" → "Item (fast food)"
  IF cleaned_name ~* '^Fast foods?,\s*' THEN
    main_name := regexp_replace(cleaned_name, '^Fast foods?,\s*', '', 'i');
    -- Capitalize first letter
    main_name := upper(substring(main_name from 1 for 1)) || substring(main_name from 2);
    cleaned_name := main_name || ' (fast food)';
  END IF;
  
  RETURN cleaned_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE foods
SET name = simplify_fast_food_name(name)
WHERE name ~* '^Fast foods?,\s*';

-- 4. Simplify "no salt added" / "without salt" for consistency
UPDATE foods
SET name = regexp_replace(name, ', no salt added$', '', 'gi')
WHERE name ~* ', no salt added$';

UPDATE foods
SET name = regexp_replace(name, ', without salt$', '', 'gi')  
WHERE name ~* ', without salt$';

-- 5. Remove redundant "on white bread" from sandwiches (assume white unless specified)
UPDATE foods
SET name = regexp_replace(name, ' on white bread', '', 'gi')
WHERE name ~* ' on white bread'
  AND category IN ('Fast Foods', 'Restaurant', 'Meals, Entrees, and Side Dishes');

-- 6. Simplify "with lettuce and tomato" to just "with L&T" for sandwiches
UPDATE foods
SET name = regexp_replace(
  name, 
  ' with lettuce and tomato$', 
  ' (L&T)', 
  'gi'
)
WHERE name ~* ' with lettuce and tomato$';

-- 7. Remove redundant (fast food) suffix since we have the category column
UPDATE foods
SET name = regexp_replace(name, '\s*\(fast food\)\s*$', '', 'gi')
WHERE name ~* '\(fast food\)$'
  AND category = 'Fast Foods';

-- 8. Remove redundant (restaurant) suffix
UPDATE foods
SET name = regexp_replace(name, '\s*\(restaurant\)\s*$', '', 'gi')
WHERE name ~* '\(restaurant\)$'
  AND category IN ('Restaurant', 'Fast Foods');

-- Report results
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1.5 Complete: Additional cleanup applied';
  RAISE NOTICE '   - Simplified preparation methods';
  RAISE NOTICE '   - Fixed incomplete food names';
  RAISE NOTICE '   - Cleaned up fast food naming';
  RAISE NOTICE '   - Removed redundant qualifiers';
END $$;

-- Show sample of cleaned vegetables
SELECT 
  id,
  name,
  category
FROM foods
WHERE category = 'Vegetables and Vegetable Products'
  AND (name ILIKE '%mixed%' OR name ILIKE '%cooked%')
ORDER BY name
LIMIT 15;

-- Show sample of cleaned fast foods
SELECT 
  id,
  name,
  category  
FROM foods
WHERE category = 'Fast Foods'
ORDER BY name
LIMIT 15;
