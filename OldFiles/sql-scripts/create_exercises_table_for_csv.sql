-- Complete SQL to create exercises table structure and import CSV data
-- This handles the muscle group lookups and populates the exercises table

-- First ensure the muscle_groups table exists with our specific muscles
-- (Run the muscle groups rebuild SQL first if not already done)

-- Create or update the exercises table to match CSV structure
DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT,
    
    -- Categorization
    category VARCHAR(50) NOT NULL, -- Free Weight, Machine, Bodyweight
    primary_muscle_group_id UUID REFERENCES muscle_groups(id),
    secondary_muscle_group_id UUID REFERENCES muscle_groups(id),
    tertiary_muscle_group_id UUID REFERENCES muscle_groups(id),
    
    -- Exercise properties from CSV
    equipment_needed TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
    
    -- Additional useful properties
    is_compound BOOLEAN DEFAULT false,
    is_unilateral BOOLEAN DEFAULT false,
    exercise_type VARCHAR(50) DEFAULT 'strength', -- strength, cardio, flexibility, plyometric
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a temporary table to hold the CSV data before processing
CREATE TEMP TABLE temp_exercises_csv (
    name TEXT,
    description TEXT,
    category TEXT,
    primary_muscle TEXT,
    secondary_muscle TEXT,
    tertiary_muscle TEXT,
    equipment_needed TEXT,
    difficulty_level TEXT,
    instructions TEXT
);

-- Note: You'll need to import the CSV data into temp_exercises_csv table first
-- This can be done via Supabase dashboard or using COPY command

-- After importing CSV data, insert into exercises table with muscle group lookups
INSERT INTO exercises (
    name,
    description,
    instructions,
    category,
    primary_muscle_group_id,
    secondary_muscle_group_id,
    tertiary_muscle_group_id,
    equipment_needed,
    difficulty_level,
    is_compound,
    exercise_type
)
SELECT 
    t.name,
    t.description,
    t.instructions,
    t.category,
    
    -- Lookup muscle group IDs
    pm.id as primary_muscle_group_id,
    sm.id as secondary_muscle_group_id,
    tm.id as tertiary_muscle_group_id,
    
    t.equipment_needed,
    t.difficulty_level,
    
    -- Determine if compound (has secondary muscle)
    CASE WHEN t.secondary_muscle IS NOT NULL AND t.secondary_muscle != 'None' THEN true ELSE false END as is_compound,
    
    -- Default to strength type
    'strength' as exercise_type
    
FROM temp_exercises_csv t
LEFT JOIN muscle_groups pm ON pm.name = t.primary_muscle
LEFT JOIN muscle_groups sm ON sm.name = t.secondary_muscle AND t.secondary_muscle != 'None'
LEFT JOIN muscle_groups tm ON tm.name = t.tertiary_muscle AND t.tertiary_muscle != 'None'
WHERE pm.id IS NOT NULL; -- Only insert if primary muscle exists

-- Create exercise_muscle_groups junction table entries
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, involvement_level)
SELECT 
    e.id,
    e.primary_muscle_group_id,
    'primary'
FROM exercises e
WHERE e.primary_muscle_group_id IS NOT NULL

UNION ALL

SELECT 
    e.id,
    e.secondary_muscle_group_id,
    'secondary'
FROM exercises e
WHERE e.secondary_muscle_group_id IS NOT NULL

UNION ALL

SELECT 
    e.id,
    e.tertiary_muscle_group_id,
    'tertiary'
FROM exercises e
WHERE e.tertiary_muscle_group_id IS NOT NULL;

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for all authenticated users)
CREATE POLICY "Allow read access to exercises for authenticated users"
    ON exercises FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_secondary_muscle ON exercises(secondary_muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_tertiary_muscle ON exercises(tertiary_muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_compound ON exercises(is_compound);

-- View to easily see exercises with muscle group names
CREATE OR REPLACE VIEW exercises_with_muscles AS
SELECT 
    e.id,
    e.name,
    e.description,
    e.instructions,
    e.category,
    e.equipment_needed,
    e.difficulty_level,
    e.is_compound,
    e.exercise_type,
    pm.name as primary_muscle,
    sm.name as secondary_muscle,
    tm.name as tertiary_muscle,
    e.created_at,
    e.updated_at
FROM exercises e
LEFT JOIN muscle_groups pm ON pm.id = e.primary_muscle_group_id
LEFT JOIN muscle_groups sm ON sm.id = e.secondary_muscle_group_id  
LEFT JOIN muscle_groups tm ON tm.id = e.tertiary_muscle_group_id;

-- Grant access to the view (views inherit RLS from underlying tables)
ALTER VIEW exercises_with_muscles OWNER TO postgres;

-- Clean up temp table
DROP TABLE IF EXISTS temp_exercises_csv;

-- Verify the import worked
SELECT 
    'Import Summary' as info,
    COUNT(*) as total_exercises,
    COUNT(CASE WHEN category = 'Free Weight' THEN 1 END) as free_weight_count,
    COUNT(CASE WHEN category = 'Machine' THEN 1 END) as machine_count,
    COUNT(CASE WHEN category = 'Bodyweight' THEN 1 END) as bodyweight_count,
    COUNT(CASE WHEN is_compound = true THEN 1 END) as compound_exercises,
    COUNT(CASE WHEN difficulty_level = 'Beginner' THEN 1 END) as beginner_exercises,
    COUNT(CASE WHEN difficulty_level = 'Intermediate' THEN 1 END) as intermediate_exercises,
    COUNT(CASE WHEN difficulty_level = 'Advanced' THEN 1 END) as advanced_exercises
FROM exercises;

-- Show sample of imported data
SELECT 
    name,
    category,
    primary_muscle,
    secondary_muscle,
    difficulty_level
FROM exercises_with_muscles 
LIMIT 10;