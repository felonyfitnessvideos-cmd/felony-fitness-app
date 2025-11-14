/**
 * Add duration_weeks column to programs table
 * 
 * Purpose: Store program duration in weeks for automatic recurrence end date calculation
 * in SmartScheduling. This replaces estimated_weeks which was already added but may need
 * to be used consistently.
 * 
 * Usage: Run in Supabase SQL Editor
 */

-- Add duration_weeks column (if not using estimated_weeks)
-- Check if estimated_weeks exists first
DO $$
BEGIN
    -- If estimated_weeks exists, we'll use that
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programs' 
        AND column_name = 'estimated_weeks'
    ) THEN
        RAISE NOTICE 'estimated_weeks column already exists - using that for duration';
        
        -- Ensure it has a default value
        ALTER TABLE programs 
        ALTER COLUMN estimated_weeks SET DEFAULT 12;
        
        -- Update NULL values
        UPDATE programs 
        SET estimated_weeks = 12 
        WHERE estimated_weeks IS NULL;
        
    ELSE
        -- Add duration_weeks if estimated_weeks doesn't exist
        ALTER TABLE programs
        ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 12;
        
        -- Add check constraint (must be positive)
        ALTER TABLE programs
        ADD CONSTRAINT programs_duration_weeks_check CHECK (duration_weeks > 0);
        
        RAISE NOTICE 'Added duration_weeks column';
    END IF;
END
$$;

-- Add column comment
COMMENT ON COLUMN programs.estimated_weeks IS 'Program duration in weeks - used to calculate recurrence end date in SmartScheduling';

-- Verify
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'programs'
  AND column_name IN ('estimated_weeks', 'duration_weeks')
ORDER BY column_name;

-- Show programs with their duration
SELECT 
    id,
    name,
    estimated_weeks,
    difficulty_level,
    program_type
FROM programs
ORDER BY created_at DESC
LIMIT 10;
