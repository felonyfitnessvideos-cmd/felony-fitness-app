-- Step 1: Run this SQL first to create the exercises table structure
-- This matches the CSV columns exactly for easy import

DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- Free Weight, Machine, Bodyweight
    primary_muscle VARCHAR(100),   -- Will store muscle name from CSV
    secondary_muscle VARCHAR(100), -- Will store muscle name from CSV  
    tertiary_muscle VARCHAR(100),  -- Will store muscle name from CSV
    equipment_needed TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'Beginner',
    instructions TEXT,
    
    -- These will be populated after import via muscle group lookup
    primary_muscle_group_id UUID,
    secondary_muscle_group_id UUID, 
    tertiary_muscle_group_id UUID,
    
    -- Additional properties
    is_compound BOOLEAN DEFAULT false,
    exercise_type VARCHAR(50) DEFAULT 'strength',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow read access to exercises for authenticated users"
    ON exercises FOR SELECT
    TO authenticated
    USING (true);

-- Step 2: After importing CSV via Supabase dashboard, run this to populate muscle group IDs
UPDATE exercises SET 
    primary_muscle_group_id = mg.id,
    is_compound = true
FROM muscle_groups mg
WHERE mg.name = exercises.primary_muscle;

UPDATE exercises SET 
    secondary_muscle_group_id = mg.id
FROM muscle_groups mg
WHERE mg.name = exercises.secondary_muscle 
    AND exercises.secondary_muscle IS NOT NULL 
    AND exercises.secondary_muscle != 'None';

UPDATE exercises SET 
    tertiary_muscle_group_id = mg.id
FROM muscle_groups mg
WHERE mg.name = exercises.tertiary_muscle 
    AND exercises.tertiary_muscle IS NOT NULL 
    AND exercises.tertiary_muscle != 'None';

-- Set compound flag based on whether secondary muscle exists
UPDATE exercises SET 
    is_compound = CASE 
        WHEN secondary_muscle IS NOT NULL AND secondary_muscle != 'None' THEN true 
        ELSE false 
    END;

-- Create foreign key constraints after populating IDs
ALTER TABLE exercises 
ADD CONSTRAINT fk_exercises_primary_muscle 
FOREIGN KEY (primary_muscle_group_id) REFERENCES muscle_groups(id);

ALTER TABLE exercises 
ADD CONSTRAINT fk_exercises_secondary_muscle 
FOREIGN KEY (secondary_muscle_group_id) REFERENCES muscle_groups(id);

ALTER TABLE exercises 
ADD CONSTRAINT fk_exercises_tertiary_muscle 
FOREIGN KEY (tertiary_muscle_group_id) REFERENCES muscle_groups(id);

-- Create indexes
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle_group_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX idx_exercises_name ON exercises(name);

-- Create view for easy querying
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
    e.created_at
FROM exercises e
LEFT JOIN muscle_groups pm ON pm.id = e.primary_muscle_group_id
LEFT JOIN muscle_groups sm ON sm.id = e.secondary_muscle_group_id  
LEFT JOIN muscle_groups tm ON tm.id = e.tertiary_muscle_group_id;

-- Verify import
SELECT 
    COUNT(*) as total_exercises,
    COUNT(CASE WHEN category = 'Free Weight' THEN 1 END) as free_weight,
    COUNT(CASE WHEN category = 'Machine' THEN 1 END) as machine,
    COUNT(CASE WHEN category = 'Bodyweight' THEN 1 END) as bodyweight,
    COUNT(CASE WHEN is_compound = true THEN 1 END) as compound_exercises
FROM exercises;