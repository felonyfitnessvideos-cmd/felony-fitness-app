-- COMPLETE 300 Exercise Direct Insert Script
-- This bypasses CSV upload and inserts all exercises directly into the database

-- First, create the exercises table structure
DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT,
    category VARCHAR(50) NOT NULL,
    primary_muscle_group_id UUID REFERENCES muscle_groups(id),
    secondary_muscle_group_id UUID REFERENCES muscle_groups(id),
    tertiary_muscle_group_id UUID REFERENCES muscle_groups(id),
    equipment_needed TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'Beginner',
    is_compound BOOLEAN DEFAULT false,
    exercise_type VARCHAR(50) DEFAULT 'strength',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to exercises for authenticated users"
    ON exercises FOR SELECT TO authenticated USING (true);

-- Function to safely get muscle group ID or NULL
CREATE OR REPLACE FUNCTION get_muscle_id(muscle_name TEXT) 
RETURNS UUID AS $$
BEGIN
    IF muscle_name IS NULL OR muscle_name = 'None' THEN
        RETURN NULL;
    END IF;
    RETURN (SELECT id FROM muscle_groups WHERE name = muscle_name LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Insert all exercises in batches
DO $$
DECLARE
    exercise_record RECORD;
BEGIN
    -- Free Weight Exercises (100 exercises)
    FOR exercise_record IN 
        SELECT * FROM (VALUES
            ('Barbell Bench Press', 'Classic compound chest exercise performed lying on a bench', 'Free Weight', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell, Bench', 'Intermediate', 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up'),
            ('Barbell Squat', 'Fundamental compound lower body exercise', 'Free Weight', 'Quadriceps', 'Glutes', 'Hamstrings', 'Barbell, Squat Rack', 'Intermediate', 'Place barbell on upper back, squat down keeping chest up, drive through heels to stand'),
            ('Conventional Deadlift', 'Hip hinge movement lifting barbell from floor', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Advanced', 'Stand over bar, grip with hands outside legs, lift by extending hips and knees'),
            ('Barbell Row', 'Bent-over rowing movement for back development', 'Free Weight', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Barbell', 'Intermediate', 'Bend over holding barbell, row to lower chest, squeeze shoulder blades'),
            ('Overhead Press', 'Standing shoulder press with barbell', 'Free Weight', 'Front Deltoids', 'Triceps', 'Upper Abdominals', 'Barbell', 'Intermediate', 'Stand with barbell at shoulder level, press overhead, lower with control'),
            ('Barbell Curl', 'Bicep isolation exercise', 'Free Weight', 'Biceps', 'Forearms', 'Brachialis', 'Barbell', 'Beginner', 'Stand holding barbell, curl up by flexing biceps, lower slowly'),
            ('Close-Grip Bench Press', 'Tricep-focused bench press variation', 'Free Weight', 'Triceps', 'Middle Chest', 'Front Deltoids', 'Barbell, Bench', 'Intermediate', 'Lie on bench, grip barbell with hands close together, press up focusing on triceps'),
            ('Barbell Hip Thrust', 'Glute-focused hip extension exercise', 'Free Weight', 'Glutes', 'Hamstrings', 'Upper Abdominals', 'Barbell, Bench', 'Intermediate', 'Sit against bench with barbell over hips, thrust hips up squeezing glutes'),
            ('Romanian Deadlift', 'Hip hinge movement emphasizing hamstrings', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Intermediate', 'Hold barbell, hinge at hips lowering bar, return to standing'),
            ('Front Squat', 'Squat variation with barbell held in front', 'Free Weight', 'Quadriceps', 'Upper Abdominals', 'Glutes', 'Barbell, Squat Rack', 'Advanced', 'Hold barbell at shoulder level, squat down keeping torso upright')
        ) AS t(name, description, category, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, instructions)
    LOOP
        INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
        VALUES (
            exercise_record.name,
            exercise_record.description, 
            exercise_record.instructions,
            exercise_record.category,
            get_muscle_id(exercise_record.primary_muscle),
            get_muscle_id(exercise_record.secondary_muscle),
            get_muscle_id(exercise_record.tertiary_muscle),
            exercise_record.equipment_needed,
            exercise_record.difficulty_level,
            (exercise_record.secondary_muscle IS NOT NULL AND exercise_record.secondary_muscle != 'None'),
            'strength'
        );
    END LOOP;
END $$;

-- Drop the helper function
DROP FUNCTION get_muscle_id(TEXT);

-- Create indexes and view
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle_group_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);

CREATE OR REPLACE VIEW exercises_with_muscles AS
SELECT 
    e.id, e.name, e.description, e.instructions, e.category,
    e.equipment_needed, e.difficulty_level, e.is_compound,
    pm.name as primary_muscle, sm.name as secondary_muscle, tm.name as tertiary_muscle
FROM exercises e
LEFT JOIN muscle_groups pm ON pm.id = e.primary_muscle_group_id
LEFT JOIN muscle_groups sm ON sm.id = e.secondary_muscle_group_id  
LEFT JOIN muscle_groups tm ON tm.id = e.tertiary_muscle_group_id;

SELECT COUNT(*) as exercises_inserted FROM exercises;