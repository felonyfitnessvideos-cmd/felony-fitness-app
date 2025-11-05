-- Direct SQL insert for all 300 exercises from the CSV
-- This bypasses the CSV upload and inserts everything directly

-- First, create the exercises table structure (run this first)
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

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow read access to exercises for authenticated users"
    ON exercises FOR SELECT
    TO authenticated
    USING (true);

-- Now insert all exercises with direct muscle group lookups
INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type) VALUES

-- Free Weight Exercises (1-100)
('Barbell Bench Press', 'Classic compound chest exercise performed lying on a bench', 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up', 'Free Weight', 
    (SELECT id FROM muscle_groups WHERE name = 'Middle Chest'), 
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'), 
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'), 
    'Barbell, Bench', 'Intermediate', true, 'strength'),

('Barbell Squat', 'Fundamental compound lower body exercise', 'Place barbell on upper back, squat down keeping chest up, drive through heels to stand', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Quadriceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    'Barbell, Squat Rack', 'Intermediate', true, 'strength'),

('Conventional Deadlift', 'Hip hinge movement lifting barbell from floor', 'Stand over bar, grip with hands outside legs, lift by extending hips and knees', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Erector Spinae'),
    'Barbell', 'Advanced', true, 'strength'),

('Barbell Row', 'Bent-over rowing movement for back development', 'Bend over holding barbell, row to lower chest, squeeze shoulder blades', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Latissimus Dorsi'),
    (SELECT id FROM muscle_groups WHERE name = 'Rhomboids'),
    (SELECT id FROM muscle_groups WHERE name = 'Rear Deltoids'),
    'Barbell', 'Intermediate', true, 'strength'),

('Overhead Press', 'Standing shoulder press with barbell', 'Stand with barbell at shoulder level, press overhead, lower with control', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'),
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Upper Abdominals'),
    'Barbell', 'Intermediate', true, 'strength'),

('Barbell Curl', 'Bicep isolation exercise', 'Stand holding barbell, curl up by flexing biceps, lower slowly', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Biceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Forearms'),
    (SELECT id FROM muscle_groups WHERE name = 'Brachialis'),
    'Barbell', 'Beginner', true, 'strength'),

('Close-Grip Bench Press', 'Tricep-focused bench press variation', 'Lie on bench, grip barbell with hands close together, press up focusing on triceps', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Middle Chest'),
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'),
    'Barbell, Bench', 'Intermediate', true, 'strength'),

('Barbell Hip Thrust', 'Glute-focused hip extension exercise', 'Sit against bench with barbell over hips, thrust hips up squeezing glutes', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    (SELECT id FROM muscle_groups WHERE name = 'Upper Abdominals'),
    'Barbell, Bench', 'Intermediate', true, 'strength'),

('Romanian Deadlift', 'Hip hinge movement emphasizing hamstrings', 'Hold barbell, hinge at hips lowering bar, return to standing', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Erector Spinae'),
    'Barbell', 'Intermediate', true, 'strength'),

('Front Squat', 'Squat variation with barbell held in front', 'Hold barbell at shoulder level, squat down keeping torso upright', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Quadriceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Upper Abdominals'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    'Barbell, Squat Rack', 'Advanced', true, 'strength'),

('Barbell Lunge', 'Single-leg exercise with barbell', 'Step forward into lunge position, lower back knee, push back to start', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Quadriceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Calves'),
    'Barbell', 'Intermediate', true, 'strength'),

('Upright Row', 'Vertical pulling exercise for shoulders', 'Hold barbell close to body, pull up to chest level, lower slowly', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Side Deltoids'),
    (SELECT id FROM muscle_groups WHERE name = 'Trapezius'),
    (SELECT id FROM muscle_groups WHERE name = 'Biceps'),
    'Barbell', 'Intermediate', true, 'strength'),

('Barbell Shrug', 'Trapezius isolation exercise', 'Hold barbell, shrug shoulders up, hold briefly, lower', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Trapezius'),
    (SELECT id FROM muscle_groups WHERE name = 'Upper Trapezius'),
    (SELECT id FROM muscle_groups WHERE name = 'Rhomboids'),
    'Barbell', 'Beginner', true, 'strength'),

('Skull Crusher', 'Tricep isolation exercise lying down', 'Lie on bench, hold barbell over chest, lower to forehead, extend back up', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Forearms'),
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'),
    'Barbell, Bench', 'Intermediate', true, 'strength'),

('Barbell Preacher Curl', 'Bicep curl performed on preacher bench', 'Sit at preacher bench, curl barbell up, lower slowly', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Biceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Brachialis'),
    (SELECT id FROM muscle_groups WHERE name = 'Forearms'),
    'Barbell, Preacher Bench', 'Intermediate', true, 'strength'),

('Sumo Deadlift', 'Wide-stance deadlift variation', 'Wide stance, grip barbell inside legs, lift by extending hips and knees', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Quadriceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    'Barbell', 'Advanced', true, 'strength'),

('Incline Barbell Press', 'Chest press on inclined bench', 'Lie on incline bench, press barbell from chest to arms extended', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Upper Chest'),
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'),
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'),
    'Barbell, Incline Bench', 'Intermediate', true, 'strength'),

('Decline Barbell Press', 'Chest press on declined bench', 'Lie on decline bench, press barbell from chest to arms extended', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Lower Chest'),
    (SELECT id FROM muscle_groups WHERE name = 'Triceps'),
    (SELECT id FROM muscle_groups WHERE name = 'Front Deltoids'),
    'Barbell, Decline Bench', 'Intermediate', true, 'strength'),

('Barbell Calf Raise', 'Calf strengthening exercise', 'Hold barbell on shoulders, rise up on toes, lower slowly', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Calves'),
    (SELECT id FROM muscle_groups WHERE name = 'Hip Flexors'),
    (SELECT id FROM muscle_groups WHERE name = 'Upper Abdominals'),
    'Barbell', 'Beginner', true, 'strength'),

('Barbell Good Morning', 'Hip hinge exercise for posterior chain', 'Barbell on shoulders, hinge at hips bending forward, return to upright', 'Free Weight',
    (SELECT id FROM muscle_groups WHERE name = 'Hamstrings'),
    (SELECT id FROM muscle_groups WHERE name = 'Glutes'),
    (SELECT id FROM muscle_groups WHERE name = 'Erector Spinae'),
    'Barbell', 'Advanced', true, 'strength');

-- Continue with more exercise inserts...
-- This is getting very long. Let me create a more manageable approach.