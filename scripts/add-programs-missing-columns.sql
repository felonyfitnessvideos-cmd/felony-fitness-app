-- ============================================================================
-- Add missing columns to programs table
-- ============================================================================
-- Purpose: Add exercise_pool, difficulty_level, and other required columns
-- Date: November 10, 2025
-- ============================================================================

-- Add difficulty_level column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS difficulty_level TEXT 
DEFAULT 'intermediate'
CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

-- Add exercise_pool column (JSONB to store exercise configurations)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS exercise_pool JSONB DEFAULT '[]'::jsonb;

-- Add program_type column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Add estimated_weeks column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS estimated_weeks INTEGER DEFAULT 8;

-- Add target_muscle_groups column (array of muscle group names)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS target_muscle_groups TEXT[] DEFAULT '{}';

-- Add is_active column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_template column (for distinguishing templates from user programs)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add trainer_id column (for trainer-created programs)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add created_by column (if missing - for backward compatibility)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add description column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add timestamps (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_programs_is_active ON programs(is_active);

-- Create index on difficulty_level for filtering
CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON programs(difficulty_level);

-- Create index on trainer_id for trainer-specific queries
CREATE INDEX IF NOT EXISTS idx_programs_trainer_id ON programs(trainer_id);

-- Create index on created_by for user-specific queries
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);

-- Verify all columns were added
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'programs'
ORDER BY ordinal_position;

-- Show counts
SELECT 
    COUNT(*) as total_programs,
    COUNT(*) FILTER (WHERE is_active = true) as active_programs,
    COUNT(*) FILTER (WHERE is_template = true) as template_programs
FROM programs;
