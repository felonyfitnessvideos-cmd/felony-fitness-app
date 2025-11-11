-- ============================================================================
-- Add is_active column to programs table
-- ============================================================================
-- Purpose: Track whether a program is active/available for use
-- Date: November 10, 2025
-- ============================================================================

-- Add is_active column to programs
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set all existing programs to active
UPDATE programs
SET is_active = true
WHERE is_active IS NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'programs'
  AND column_name = 'is_active';

-- Show sample data
SELECT 
    id,
    name,
    is_active,
    created_at
FROM programs
LIMIT 5;
