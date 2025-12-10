-- ============================================================================
-- PHASE 1.1: Food Name Simplification
-- ============================================================================
-- Purpose: Clean up overly specific food names to make them more user-friendly
-- 
-- Changes:
-- - Remove geographic qualifiers: (Alaska Native), (Northern Plains Indians)
-- - Remove ethnic/cultural qualifiers: (Native American), (Hispanic)
-- - Simplify "wild" variants when generic exists
-- - Clean up extra whitespace and formatting
-- - Preserve essential info: preparation method (raw, cooked, canned, frozen)
-- - Preserve brand names for branded products
--
-- Examples:
--   "Blackberries, wild, raw (Alaska Native)" → "Blackberries, raw"
--   "Corn, white (Northern Plains Indians)" → "Corn, white"
--   "Squash, Indian" → "Squash"
-- ============================================================================

-- Step 1: Create helper function for name simplification
CREATE OR REPLACE FUNCTION simplify_food_name(original_name text) 
RETURNS text AS $$
DECLARE
  cleaned_name text;
BEGIN
  cleaned_name := original_name;
  
  -- Remove parenthetical geographic qualifiers
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Alaska[^)]*\)', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Native[^)]*\)', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Indian[^)]*\)', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Plains[^)]*\)', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Hispanic[^)]*\)', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Mexican[^)]*\)', '', 'gi');
  
  -- Remove standalone "wild" when it's the only descriptor before a comma
  -- Keep "wild" if it's part of a compound name like "wild rice"
  cleaned_name := regexp_replace(cleaned_name, ',\s*wild\s*,', ',', 'gi');
  cleaned_name := regexp_replace(cleaned_name, ',\s*wild\s*$', '', 'gi');
  
  -- Remove "NFS" (Not Further Specified) - redundant information
  cleaned_name := regexp_replace(cleaned_name, ',\s*NFS\s*$', '', 'gi');
  cleaned_name := regexp_replace(cleaned_name, ',\s*NFS\s*,', ',', 'gi');
  
  -- Clean up multiple commas and spaces
  cleaned_name := regexp_replace(cleaned_name, ',\s*,', ',', 'g');
  cleaned_name := regexp_replace(cleaned_name, '\s+', ' ', 'g');
  
  -- Trim leading/trailing whitespace and commas
  cleaned_name := regexp_replace(cleaned_name, '^\s*,\s*', '', 'g');
  cleaned_name := regexp_replace(cleaned_name, '\s*,\s*$', '', 'g');
  cleaned_name := trim(cleaned_name);
  
  RETURN cleaned_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Preview changes (uncomment to see what will change)
-- SELECT 
--   id,
--   name as original_name,
--   simplify_food_name(name) as new_name
-- FROM foods
-- WHERE name ~ '\([^)]*Native[^)]*\)|\([^)]*Indian[^)]*\)|\([^)]*Alaska[^)]*\)|, wild[,$]'
-- ORDER BY name
-- LIMIT 50;

-- Step 3: Apply name simplification
UPDATE foods 
SET name = simplify_food_name(name)
WHERE name ~ '\([^)]*Native[^)]*\)|\([^)]*Indian[^)]*\)|\([^)]*Alaska[^)]*\)|\([^)]*Plains[^)]*\)|\([^)]*Hispanic[^)]*\)|, wild[,$]|, NFS';

-- Step 4: Report results
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Simplified % food names', updated_count;
END $$;

-- Step 5: Show sample of cleaned names
SELECT 
  id,
  name,
  category
FROM foods
WHERE name ILIKE '%berries%' 
   OR name ILIKE '%corn%'
   OR name ILIKE '%squash%'
ORDER BY name
LIMIT 20;
