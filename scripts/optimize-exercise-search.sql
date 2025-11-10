-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Exercise Search Trigram Index
-- ============================================================================
-- Purpose: Dramatically improve LIKE query performance on exercises table
-- Expected Impact: 10-100x faster search queries as database grows with user exercises
-- Run in: Supabase SQL Editor
-- Date: November 10, 2025
-- ============================================================================

-- Step 1: Check existing indexes on exercises table
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'exercises';

-- Step 2: pg_trgm extension should already be enabled from food optimization
-- But we'll ensure it's available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 3: Create trigram index on exercise name column
-- This will make ILIKE '%search%' queries incredibly fast
-- GIN (Generalized Inverted Index) is the recommended type for trigrams
CREATE INDEX IF NOT EXISTS exercises_name_trgm_idx 
ON exercises 
USING gin (name gin_trgm_ops);

-- Step 4: Create additional supporting indexes
-- These help with common query patterns in exercise-search and workout builder

-- Index for equipment filtering (when browsing by equipment type)
CREATE INDEX IF NOT EXISTS exercises_equipment_idx 
ON exercises (equipment_needed)
WHERE equipment_needed IS NOT NULL;

-- Index for difficulty level filtering (when filtering by experience level)
CREATE INDEX IF NOT EXISTS exercises_difficulty_idx 
ON exercises (difficulty_level)
WHERE difficulty_level IS NOT NULL;

-- Index for exercise type filtering (strength, cardio, flexibility, balance)
CREATE INDEX IF NOT EXISTS exercises_type_idx 
ON exercises (exercise_type)
WHERE exercise_type IS NOT NULL;

-- Composite index for muscle group searches
-- Useful for: "Show me all chest exercises" or filtering by primary muscle
CREATE INDEX IF NOT EXISTS exercises_primary_muscle_idx 
ON exercises (primary_muscle)
WHERE primary_muscle IS NOT NULL;

-- Index for secondary muscle targeting
CREATE INDEX IF NOT EXISTS exercises_secondary_muscle_idx 
ON exercises (secondary_muscle)
WHERE secondary_muscle IS NOT NULL;

-- Composite index for filtering by muscle + equipment
-- Example: "Show me all dumbbell chest exercises"
CREATE INDEX IF NOT EXISTS exercises_muscle_equipment_idx 
ON exercises (primary_muscle, equipment_needed);

-- Step 5: Analyze table to update statistics
-- This helps PostgreSQL query planner make better decisions
ANALYZE exercises;

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
WHERE tablename = 'exercises'
ORDER BY indexname;

-- Test query performance (should be MUCH faster after indexing)
-- Look for "Index Scan" instead of "Seq Scan" in the output
EXPLAIN ANALYZE
SELECT name, primary_muscle, equipment_needed, difficulty_level
FROM exercises
WHERE name ILIKE '%bench press%'
LIMIT 10;

-- Test muscle group filtering performance
EXPLAIN ANALYZE
SELECT name, equipment_needed, difficulty_level
FROM exercises
WHERE primary_muscle = 'Chest'
  AND equipment_needed = 'Dumbbell'
LIMIT 10;

-- Check index sizes (should be reasonable, not huge)
SELECT
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname = 'exercises'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check table statistics
SELECT
    schemaname,
    relname AS table_name,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
WHERE relname = 'exercises';

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================
-- 1. Trigram indexes automatically stay updated as data changes
-- 2. As users add custom exercises, the indexes grow proportionally
-- 3. Run ANALYZE exercises; monthly as the database grows
-- 4. Monitor index bloat with pg_stat_user_indexes if table grows very large (10K+ exercises)
-- 5. Consider VACUUM ANALYZE exercises; after bulk imports or major data changes
-- 
-- PERFORMANCE EXPECTATIONS:
-- - Small database (<1K exercises): Minimal difference (already fast)
-- - Medium database (1K-10K exercises): 5-20x faster searches
-- - Large database (10K+ exercises): 10-100x faster searches
-- - User-created exercises: Scales gracefully as trainers add custom content
-- ============================================================================
