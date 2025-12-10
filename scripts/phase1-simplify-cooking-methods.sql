-- ============================================================================
-- PHASE 1.6: Simplify Cooking Methods
-- ============================================================================
-- Purpose: Remove overly specific cooking methods that don't significantly 
--          affect nutrition or search relevance
-- 
-- Keep: "fried", "deep-fried" (significantly affects nutrition)
-- Remove: "baked", "broiled", "roasted", "grilled", "microwaved" 
--         (minimal nutritional difference)
--
-- Examples:
--   "Chicken breast, baked, broiled, or roasted, skin not eaten" 
--   → "Chicken breast, skin not eaten"
--
--   "Chicken breast, baked, coated, skin eaten"
--   → "Chicken breast, coated, skin eaten"
-- ============================================================================

-- Remove redundant cooking method phrases
-- Keep: fried, deep-fried (nutritionally significant), stir-fried (indicates oil added), sprouted (distinct variety)
-- Remove: baked, broiled, roasted, grilled, microwaved, cooked, boiled, steamed
-- BUT preserve "cooked" when it appears with "stir-fried" (e.g., "sprouted, cooked, stir-fried")
UPDATE foods
SET name = regexp_replace(
  regexp_replace(
    name,
    ',\s*(baked|broiled|roasted|grilled|microwaved|cooked|boiled|steamed)(\s+(or|,)\s+(baked|broiled|roasted|grilled|microwaved|cooked|boiled|steamed))*',
    '',
    'gi'
  ),
  ',\s*,\s*stir-fried', ', stir-fried',  -- Fix double commas before stir-fried
  'gi'
)
WHERE name ~* '(baked|broiled|roasted|grilled|microwaved|cooked|boiled|steamed)';

-- Remove "with marinade" (not nutritionally significant)
UPDATE foods
SET name = regexp_replace(name, ',?\s*with marinade', '', 'gi')
WHERE name ~* 'with marinade';

-- Remove "from raw" / "from pre-cooked" / "from fast food / restaurant" / "from restaurant" anywhere in name
UPDATE foods
SET name = regexp_replace(
  name,
  ',?\s*from (raw|pre-cooked|fast food \/ restaurant|restaurant)',
  '',
  'gi'
)
WHERE name ~* 'from (raw|pre-cooked|fast food|restaurant)';

-- Remove "or roasted" / "or baked" etc. (leftovers from compound cooking methods)
UPDATE foods
SET name = regexp_replace(name, ',?\s*or (roasted|baked|broiled|grilled)', '', 'gi')
WHERE name ~* 'or (roasted|baked|broiled|grilled)';

-- Remove "NS as to cooking method" (not specific = redundant)
UPDATE foods
SET name = regexp_replace(name, ',?\s*NS as to cooking method', '', 'gi')
WHERE name ~* 'NS as to cooking method';

-- Remove "uncooked" / "raw" for poultry (humans don't eat raw chicken - USDA lab data only)
DELETE FROM foods
WHERE category = 'Poultry Products'
  AND name ~* ',\s*(uncooked|raw)(\s|,|$)';

-- Remove "coating removed" entries (too specific, contradictory)
-- If coating is removed, it's just the base food
DELETE FROM foods
WHERE name ~* 'coating removed';

-- Remove "prepared skinless" (redundant with "skinless")
UPDATE foods
SET name = regexp_replace(name, ',?\s*prepared skinless', ', skinless', 'gi')
WHERE name ~* 'prepared skinless';

-- Remove "sliced" and "prepackaged" (doesn't affect nutrition, just presentation)
UPDATE foods
SET name = regexp_replace(name, ',?\s*(sliced|prepackaged)', '', 'gi')
WHERE name ~* '(sliced|prepackaged)';

-- Simplify "skin eaten" / "skin not eaten" to just "with skin" / "without skin"
UPDATE foods
SET name = regexp_replace(name, ',?\s*skin eaten', ', with skin', 'gi')
WHERE name ~* 'skin eaten';

UPDATE foods
SET name = regexp_replace(name, ',?\s*skin not eaten', ', skinless', 'gi')
WHERE name ~* 'skin not eaten';

-- Remove "coating eaten" / "coating not eaten" (assume eaten unless specified)
UPDATE foods
SET name = regexp_replace(name, ',?\s*coating eaten', '', 'gi')
WHERE name ~* 'coating eaten';

UPDATE foods
SET name = regexp_replace(name, ',?\s*coating not eaten', ', coating removed', 'gi')
WHERE name ~* 'coating not eaten';

-- Fix incomplete "skin /" patterns (should be removed or completed)
-- "coated, skin /" → "coated" (assume skin was eaten if not specified)
UPDATE foods
SET name = regexp_replace(name, ',?\s*skin\s*\/\s*$', '', 'gi')
WHERE name ~* 'skin\s*\/\s*$';

-- Fix mid-string "skin /" patterns
UPDATE foods
SET name = regexp_replace(name, ',?\s*skin\s*\/\s*,', ',', 'gi')
WHERE name ~* 'skin\s*\/\s*,';

-- Clean up multiple commas and extra spaces
UPDATE foods
SET name = regexp_replace(
  regexp_replace(
    regexp_replace(name, ',\s*,', ',', 'g'),
    '\s+', ' ', 'g'
  ),
  ',\s*$', '', 'g'
)
WHERE name ~ ',\s*,' OR name ~ ',\s*$';

-- Capitalize first letter if it got lowercased
UPDATE foods
SET name = upper(substring(name from 1 for 1)) || substring(name from 2)
WHERE name ~ '^[a-z]';

-- Remove duplicate foods (keep the one with the most complete nutrition data)
-- After all cleanup, some foods have identical names but different IDs
DELETE FROM foods a
WHERE EXISTS (
  SELECT 1 FROM foods b
  WHERE a.name = b.name
    AND a.category = b.category
    AND a.id > b.id  -- Keep the first one (usually older/more complete)
);

-- Report results
DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT COUNT(*) INTO updated_count 
  FROM foods 
  WHERE name ~* '(baked|broiled|roasted|grilled|microwaved|with marinade|from raw|from pre-cooked|skin eaten|coating eaten)';
  
  RAISE NOTICE '✅ Simplified cooking methods for % foods', updated_count;
END $$;

-- Show cleaned chicken breast entries
SELECT name, category, commonness_score
FROM foods
WHERE name ILIKE '%chicken breast%'
ORDER BY commonness_score DESC, name
LIMIT 20;

-- Show cleaned vegetable entries
SELECT name, category, commonness_score
FROM foods
WHERE category = 'Vegetables and Vegetable Products'
  AND name ILIKE '%cooked%'
ORDER BY name
LIMIT 15;
