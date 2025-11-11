-- ============================================================================
-- Check programs table structure
-- ============================================================================
-- Purpose: See what columns actually exist in programs table
-- Date: November 10, 2025
-- ============================================================================

-- Show all columns in programs table
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'programs'
ORDER BY ordinal_position;

-- Show sample data (if any exists)
SELECT * FROM programs LIMIT 1;

-- Count total programs
SELECT COUNT(*) as total_programs FROM programs;
