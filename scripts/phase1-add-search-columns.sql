-- ============================================================================
-- PHASE 1.3: Add Search Helper Columns
-- ============================================================================
-- Purpose: Add columns to support flexible search and intelligent ranking
-- 
-- New Columns:
-- - name_simplified: Lowercase, no punctuation (for flexible matching)
-- - search_tokens: Tokenized words for word-order-independent search
-- - commonness_score: 0-100 score for ranking (100 = most common)
--
-- This enables:
-- - "chicken stew" to find "Stew, chicken"
-- - Better ranking of common foods over specialty items
-- - Faster full-text search with PostgreSQL indexes
-- ============================================================================

-- Step 1: Add new columns to foods table
ALTER TABLE foods 
ADD COLUMN IF NOT EXISTS name_simplified text,
ADD COLUMN IF NOT EXISTS search_tokens text,
ADD COLUMN IF NOT EXISTS commonness_score integer DEFAULT 50;

-- Step 2: Create function to generate simplified name
CREATE OR REPLACE FUNCTION generate_simplified_name(original_name text)
RETURNS text AS $$
BEGIN
  -- Convert to lowercase
  -- Remove punctuation (keep only letters, numbers, spaces)
  -- Normalize whitespace
  RETURN lower(
    trim(
      regexp_replace(
        regexp_replace(original_name, '[^a-zA-Z0-9\s]', ' ', 'g'),
        '\s+', ' ', 'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Populate name_simplified for all foods
UPDATE foods 
SET name_simplified = generate_simplified_name(name);

-- Step 4: Populate search_tokens (same as simplified, used for FTS)
UPDATE foods 
SET search_tokens = name_simplified;

-- Step 5: Create full-text search indexes for performance
CREATE INDEX IF NOT EXISTS idx_foods_name_simplified 
ON foods USING gin(to_tsvector('english', name_simplified));

CREATE INDEX IF NOT EXISTS idx_foods_search_tokens 
ON foods USING gin(to_tsvector('english', search_tokens));

-- Step 6: Create regular indexes for common queries
CREATE INDEX IF NOT EXISTS idx_foods_name_lower 
ON foods (lower(name));

CREATE INDEX IF NOT EXISTS idx_foods_category 
ON foods (category);

CREATE INDEX IF NOT EXISTS idx_foods_commonness_score 
ON foods (commonness_score DESC);

-- Step 7: Create composite index for search + ranking
CREATE INDEX IF NOT EXISTS idx_foods_search_ranking 
ON foods (commonness_score DESC, category, name);

-- Step 8: Report results
DO $$
DECLARE
  total_foods integer;
  with_simplified integer;
BEGIN
  SELECT COUNT(*) INTO total_foods FROM foods;
  SELECT COUNT(*) INTO with_simplified FROM foods WHERE name_simplified IS NOT NULL;
  
  RAISE NOTICE '✅ Search Helper Columns Added:';
  RAISE NOTICE '   - Total foods: %', total_foods;
  RAISE NOTICE '   - With simplified names: %', with_simplified;
  RAISE NOTICE '   - Coverage: %%%', ROUND((with_simplified::numeric / total_foods * 100), 2);
END $$;

-- Step 9: Show examples of the new columns
SELECT 
  id,
  name as original_name,
  name_simplified,
  category,
  commonness_score
FROM foods
WHERE name ILIKE '%chicken%' OR name ILIKE '%milk%'
ORDER BY commonness_score DESC, name
LIMIT 10;

-- Step 10: Create trigger to auto-update on insert/update
CREATE OR REPLACE FUNCTION update_search_helpers()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_simplified := generate_simplified_name(NEW.name);
  NEW.search_tokens := NEW.name_simplified;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_search_helpers ON foods;
CREATE TRIGGER trigger_update_search_helpers
  BEFORE INSERT OR UPDATE OF name ON foods
  FOR EACH ROW
  EXECUTE FUNCTION update_search_helpers();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1.3 Complete: Search helper columns and indexes created';
  RAISE NOTICE '   Trigger installed to auto-update on new/changed foods';
END $$;
