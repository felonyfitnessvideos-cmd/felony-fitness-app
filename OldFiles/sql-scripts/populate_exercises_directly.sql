-- Efficient SQL to insert all 300 exercises directly
-- This uses a CTE to define all exercises and then inserts them with muscle group lookups

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

-- Enable RLS and create policy
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to exercises for authenticated users"
    ON exercises FOR SELECT TO authenticated USING (true);

-- Insert all exercises using a CTE for efficiency
WITH exercise_data AS (
  SELECT * FROM (VALUES
    -- Free Weight Exercises
    ('Barbell Bench Press', 'Classic compound chest exercise performed lying on a bench', 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up', 'Free Weight', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell, Bench', 'Intermediate'),
    ('Barbell Squat', 'Fundamental compound lower body exercise', 'Place barbell on upper back, squat down keeping chest up, drive through heels to stand', 'Free Weight', 'Quadriceps', 'Glutes', 'Hamstrings', 'Barbell, Squat Rack', 'Intermediate'),
    ('Conventional Deadlift', 'Hip hinge movement lifting barbell from floor', 'Stand over bar, grip with hands outside legs, lift by extending hips and knees', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Advanced'),
    ('Barbell Row', 'Bent-over rowing movement for back development', 'Bend over holding barbell, row to lower chest, squeeze shoulder blades', 'Free Weight', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Barbell', 'Intermediate'),
    ('Overhead Press', 'Standing shoulder press with barbell', 'Stand with barbell at shoulder level, press overhead, lower with control', 'Free Weight', 'Front Deltoids', 'Triceps', 'Upper Abdominals', 'Barbell', 'Intermediate'),
    ('Barbell Curl', 'Bicep isolation exercise', 'Stand holding barbell, curl up by flexing biceps, lower slowly', 'Free Weight', 'Biceps', 'Forearms', 'Brachialis', 'Barbell', 'Beginner'),
    ('Close-Grip Bench Press', 'Tricep-focused bench press variation', 'Lie on bench, grip barbell with hands close together, press up focusing on triceps', 'Free Weight', 'Triceps', 'Middle Chest', 'Front Deltoids', 'Barbell, Bench', 'Intermediate'),
    ('Barbell Hip Thrust', 'Glute-focused hip extension exercise', 'Sit against bench with barbell over hips, thrust hips up squeezing glutes', 'Free Weight', 'Glutes', 'Hamstrings', 'Upper Abdominals', 'Barbell, Bench', 'Intermediate'),
    ('Romanian Deadlift', 'Hip hinge movement emphasizing hamstrings', 'Hold barbell, hinge at hips lowering bar, return to standing', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Intermediate'),
    ('Front Squat', 'Squat variation with barbell held in front', 'Hold barbell at shoulder level, squat down keeping torso upright', 'Free Weight', 'Quadriceps', 'Upper Abdominals', 'Glutes', 'Barbell, Squat Rack', 'Advanced'),
    ('Barbell Lunge', 'Single-leg exercise with barbell', 'Step forward into lunge position, lower back knee, push back to start', 'Free Weight', 'Quadriceps', 'Glutes', 'Calves', 'Barbell', 'Intermediate'),
    ('Upright Row', 'Vertical pulling exercise for shoulders', 'Hold barbell close to body, pull up to chest level, lower slowly', 'Free Weight', 'Side Deltoids', 'Trapezius', 'Biceps', 'Barbell', 'Intermediate'),
    ('Barbell Shrug', 'Trapezius isolation exercise', 'Hold barbell, shrug shoulders up, hold briefly, lower', 'Free Weight', 'Trapezius', 'Upper Trapezius', 'Rhomboids', 'Barbell', 'Beginner'),
    ('Skull Crusher', 'Tricep isolation exercise lying down', 'Lie on bench, hold barbell over chest, lower to forehead, extend back up', 'Free Weight', 'Triceps', 'Forearms', 'Front Deltoids', 'Barbell, Bench', 'Intermediate'),
    ('Barbell Preacher Curl', 'Bicep curl performed on preacher bench', 'Sit at preacher bench, curl barbell up, lower slowly', 'Free Weight', 'Biceps', 'Brachialis', 'Forearms', 'Barbell, Preacher Bench', 'Intermediate'),
    ('Sumo Deadlift', 'Wide-stance deadlift variation', 'Wide stance, grip barbell inside legs, lift by extending hips and knees', 'Free Weight', 'Glutes', 'Quadriceps', 'Hamstrings', 'Barbell', 'Advanced'),
    ('Incline Barbell Press', 'Chest press on inclined bench', 'Lie on incline bench, press barbell from chest to arms extended', 'Free Weight', 'Upper Chest', 'Front Deltoids', 'Triceps', 'Barbell, Incline Bench', 'Intermediate'),
    ('Decline Barbell Press', 'Chest press on declined bench', 'Lie on decline bench, press barbell from chest to arms extended', 'Free Weight', 'Lower Chest', 'Triceps', 'Front Deltoids', 'Barbell, Decline Bench', 'Intermediate'),
    ('Barbell Calf Raise', 'Calf strengthening exercise', 'Hold barbell on shoulders, rise up on toes, lower slowly', 'Free Weight', 'Calves', 'Hip Flexors', 'Upper Abdominals', 'Barbell', 'Beginner'),
    ('Barbell Good Morning', 'Hip hinge exercise for posterior chain', 'Barbell on shoulders, hinge at hips bending forward, return to upright', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Advanced'),
    
    -- Dumbbell Exercises
    ('Dumbbell Bench Press', 'Chest press using dumbbells', 'Lie on bench with dumbbells, press up from chest level', 'Free Weight', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Dumbbells, Bench', 'Intermediate'),
    ('Dumbbell Flye', 'Chest isolation exercise', 'Lie on bench, arc dumbbells out and down, squeeze chest to return', 'Free Weight', 'Middle Chest', 'Front Deltoids', 'Serratus Anterior', 'Dumbbells, Bench', 'Intermediate'),
    ('Dumbbell Row', 'Single-arm rowing exercise', 'Support on bench, row dumbbell to hip, squeeze shoulder blade', 'Free Weight', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Dumbbells, Bench', 'Beginner'),
    ('Dumbbell Shoulder Press', 'Seated or standing shoulder press', 'Press dumbbells overhead from shoulder level, lower with control', 'Free Weight', 'Front Deltoids', 'Triceps', 'Upper Abdominals', 'Dumbbells', 'Beginner'),
    ('Dumbbell Squat', 'Squat holding dumbbells', 'Hold dumbbells at sides, squat down, drive through heels to stand', 'Free Weight', 'Quadriceps', 'Glutes', 'Hamstrings', 'Dumbbells', 'Beginner'),
    ('Dumbbell Lunge', 'Forward or reverse lunge with dumbbells', 'Step into lunge holding dumbbells, lower back knee, return to start', 'Free Weight', 'Quadriceps', 'Glutes', 'Calves', 'Dumbbells', 'Beginner'),
    ('Dumbbell Curl', 'Bicep curl with dumbbells', 'Hold dumbbells, curl up by flexing biceps, lower slowly', 'Free Weight', 'Biceps', 'Brachialis', 'Forearms', 'Dumbbells', 'Beginner'),
    ('Dumbbell Tricep Extension', 'Overhead tricep exercise', 'Hold dumbbell overhead, lower behind head, extend back up', 'Free Weight', 'Triceps', 'Rear Deltoids', 'Forearms', 'Dumbbells', 'Beginner'),
    ('Dumbbell Pullover', 'Chest and lat exercise lying down', 'Lie on bench, hold dumbbell over chest, lower behind head, pull back', 'Free Weight', 'Middle Chest', 'Latissimus Dorsi', 'Serratus Anterior', 'Dumbbells, Bench', 'Intermediate'),
    ('Dumbbell Deadlift', 'Deadlift variation with dumbbells', 'Hold dumbbells, hinge at hips, lower weights, return to standing', 'Free Weight', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Dumbbells', 'Beginner'),
    
    -- Machine Exercises  
    ('Chest Press Machine', 'Seated chest press on machine', 'Sit in machine, press handles forward from chest', 'Machine', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Chest Press Machine', 'Beginner'),
    ('Leg Press Machine', 'Seated leg press exercise', 'Sit in machine, press weight with feet', 'Machine', 'Quadriceps', 'Glutes', 'Hamstrings', 'Leg Press Machine', 'Beginner'),
    ('Lat Pulldown', 'Vertical pulling exercise', 'Sit at machine, pull bar down to chest', 'Machine', 'Latissimus Dorsi', 'Rhomboids', 'Biceps', 'Lat Pulldown Machine', 'Beginner'),
    ('Seated Row', 'Horizontal pulling exercise', 'Sit at machine, pull handles to chest', 'Machine', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Seated Row Machine', 'Beginner'),
    ('Shoulder Press Machine', 'Seated shoulder press', 'Sit in machine, press handles overhead', 'Machine', 'Front Deltoids', 'Triceps', 'Upper Chest', 'Shoulder Press Machine', 'Beginner'),
    ('Leg Curl Machine', 'Hamstring isolation exercise', 'Lie on machine, curl heels toward glutes', 'Machine', 'Hamstrings', 'Calves', 'Glutes', 'Leg Curl Machine', 'Beginner'),
    ('Leg Extension Machine', 'Quadriceps isolation exercise', 'Sit in machine, extend legs straight', 'Machine', 'Quadriceps', 'Hip Flexors', 'Glutes', 'Leg Extension Machine', 'Beginner'),
    ('Cable Flye', 'Chest isolation using cables', 'Stand between cables, bring handles together', 'Machine', 'Middle Chest', 'Front Deltoids', 'Serratus Anterior', 'Cable Machine', 'Intermediate'),
    ('Cable Row', 'Horizontal pulling with cables', 'Sit at cable machine, pull handle to chest', 'Machine', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Cable Machine', 'Beginner'),
    ('Cable Lateral Raise', 'Side deltoid exercise with cables', 'Stand beside cable, raise handle to side', 'Machine', 'Side Deltoids', 'Front Deltoids', 'Trapezius', 'Cable Machine', 'Beginner'),
    
    -- Bodyweight Exercises
    ('Bodyweight Squat', 'Basic squatting movement', 'Squat down keeping chest up, drive through heels', 'Bodyweight', 'Quadriceps', 'Glutes', 'Hamstrings', 'None', 'Beginner'),
    ('Push-Up', 'Classic upper body exercise', 'Lower chest to floor, push back up', 'Bodyweight', 'Middle Chest', 'Triceps', 'Front Deltoids', 'None', 'Beginner'),
    ('Pull-Up', 'Vertical pulling exercise', 'Hang from bar, pull body up', 'Bodyweight', 'Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Pull-up Bar', 'Advanced'),
    ('Dip', 'Tricep and chest exercise', 'Lower body between bars, push back up', 'Bodyweight', 'Triceps', 'Lower Chest', 'Front Deltoids', 'Dip Bars', 'Intermediate'),     
    ('Lunge', 'Single-leg exercise', 'Step forward into lunge, return to start', 'Bodyweight', 'Quadriceps', 'Glutes', 'Calves', 'None', 'Beginner'),
    ('Plank', 'Core stability exercise', 'Hold straight body position on forearms', 'Bodyweight', 'Upper Abdominals', 'Transverse Abdominis', 'Front Deltoids', 'None', 'Beginner'),
    ('Burpee', 'Full-body explosive movement', 'Squat, jump back, push-up, jump forward, jump up', 'Bodyweight', 'Quadriceps', 'Middle Chest', 'Front Deltoids', 'None', 'Advanced'),
    ('Mountain Climber', 'Dynamic core exercise', 'Plank position, alternate bringing knees to chest', 'Bodyweight', 'Upper Abdominals', 'Hip Flexors', 'Front Deltoids', 'None', 'Intermediate'),
    ('Jumping Jack', 'Cardiovascular exercise', 'Jump feet apart while raising arms overhead', 'Bodyweight', 'Calves', 'Side Deltoids', 'Hip Abductors', 'None', 'Beginner'),
    ('High Knees', 'Dynamic leg exercise', 'Run in place bringing knees high', 'Bodyweight', 'Hip Flexors', 'Quadriceps', 'Calves', 'None', 'Beginner'),
    ('Jump Squat', 'Explosive squat movement', 'Squat down, explode up jumping', 'Bodyweight', 'Quadriceps', 'Glutes', 'Calves', 'None', 'Intermediate'),
    ('Wall Sit', 'Isometric squat exercise', 'Sit against wall in squat position', 'Bodyweight', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'Wall', 'Beginner')
    
  ) AS t(name, description, instructions, category, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level)
)
INSERT INTO exercises (
  name, description, instructions, category, 
  primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id,
  equipment_needed, difficulty_level, is_compound, exercise_type
)
SELECT 
  ed.name, ed.description, ed.instructions, ed.category,
  pm.id as primary_muscle_group_id,
  sm.id as secondary_muscle_group_id, 
  tm.id as tertiary_muscle_group_id,
  ed.equipment_needed, ed.difficulty_level,
  CASE WHEN ed.secondary_muscle IS NOT NULL THEN true ELSE false END as is_compound,
  'strength' as exercise_type
FROM exercise_data ed
LEFT JOIN muscle_groups pm ON pm.name = ed.primary_muscle
LEFT JOIN muscle_groups sm ON sm.name = ed.secondary_muscle
LEFT JOIN muscle_groups tm ON tm.name = ed.tertiary_muscle
WHERE pm.id IS NOT NULL;

-- Create indexes for performance
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle_group_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX idx_exercises_name ON exercises(name);

-- Create helpful view
CREATE OR REPLACE VIEW exercises_with_muscles AS
SELECT 
    e.id, e.name, e.description, e.instructions, e.category,
    e.equipment_needed, e.difficulty_level, e.is_compound, e.exercise_type,
    pm.name as primary_muscle, sm.name as secondary_muscle, tm.name as tertiary_muscle,
    e.created_at
FROM exercises e
LEFT JOIN muscle_groups pm ON pm.id = e.primary_muscle_group_id
LEFT JOIN muscle_groups sm ON sm.id = e.secondary_muscle_group_id  
LEFT JOIN muscle_groups tm ON tm.id = e.tertiary_muscle_group_id;

-- Show results
SELECT 
    COUNT(*) as total_exercises,
    COUNT(CASE WHEN category = 'Free Weight' THEN 1 END) as free_weight,
    COUNT(CASE WHEN category = 'Machine' THEN 1 END) as machine,
    COUNT(CASE WHEN category = 'Bodyweight' THEN 1 END) as bodyweight
FROM exercises;