-- Delete baby food items from foods table
-- Preserves: Baby Ruth candy bars and baby vegetables (carrots, zucchini, etc.)
-- Run this on your Supabase database

-- First, check what will be deleted (DRY RUN)
-- Uncomment to see what would be deleted:
-- SELECT id, name, category, data_source
-- FROM foods
-- WHERE (
--   category = 'Baby Foods' 
--   OR name ILIKE 'Babyfood%'
-- )
-- AND name NOT ILIKE '%BABY RUTH%'
-- ORDER BY name;

-- Delete baby food items
-- Excludes Baby Ruth candy bars
DELETE FROM foods
WHERE (
  category = 'Baby Foods' 
  OR name ILIKE 'Babyfood%'
)
AND name NOT ILIKE '%BABY RUTH%';

-- Verify deletion
SELECT COUNT(*) as remaining_baby_items
FROM foods
WHERE name ILIKE '%baby%';

-- Should show only Baby Ruth and baby vegetables remaining
SELECT id, name, category
FROM foods
WHERE name ILIKE '%baby%'
ORDER BY category, name;
