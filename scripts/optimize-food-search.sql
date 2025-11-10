-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Food Search Trigram Index
-- ============================================================================
-- Purpose: Dramatically improve LIKE query performance on food_servings table
-- Expected Impact: 10-100x faster search queries
-- Run in: Supabase SQL Editor
-- Date: November 10, 2025
-- ============================================================================

-- Step 1: Check existing indexes on food_servings table
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'food_servings';

-- Step 2: Enable pg_trgm extension (if not already enabled)
-- This enables trigram matching for fast fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 3: Create trigram index on food_name column
-- This will make ILIKE '%search%' queries incredibly fast
-- GIN (Generalized Inverted Index) is the recommended type for trigrams
CREATE INDEX IF NOT EXISTS food_servings_name_trgm_idx 
ON food_servings 
USING gin (food_name gin_trgm_ops);

-- Step 4: Create additional supporting indexes
-- These help with common query patterns in food-search-v2

-- Index for brand filtering (when users search by brand)
CREATE INDEX IF NOT EXISTS food_servings_brand_idx 
ON food_servings (brand) 
WHERE brand IS NOT NULL;

-- Index for category filtering (when browsing by food type)
CREATE INDEX IF NOT EXISTS food_servings_category_idx 
ON food_servings (category);

-- Composite index for category + name searches
-- Useful for: "Show me all fruits matching 'apple'"
CREATE INDEX IF NOT EXISTS food_servings_category_name_idx 
ON food_servings (category, food_name);

-- Step 5: Analyze table to update statistics
-- This helps PostgreSQL query planner make better decisions
ANALYZE food_servings;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'food_servings'
ORDER BY indexname;

-- Test query performance (should be MUCH faster after indexing)
-- Look for "Index Scan" instead of "Seq Scan" in the output
EXPLAIN ANALYZE
SELECT food_name, serving_description, calories, protein_g, carbs_g, fat_g
FROM food_servings
WHERE food_name ILIKE '%chicken breast%'
LIMIT 10;

-- Check index size (should be reasonable, not huge)
SELECT
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname = 'food_servings'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================
-- 1. Trigram indexes automatically stay updated as data changes
-- 2. Run ANALYZE food_servings; monthly if you add lots of new foods
-- 3. Monitor index bloat with pg_stat_user_indexes if database grows large
-- 4. Consider VACUUM ANALYZE food_servings; if doing bulk inserts/updates
-- ============================================================================
