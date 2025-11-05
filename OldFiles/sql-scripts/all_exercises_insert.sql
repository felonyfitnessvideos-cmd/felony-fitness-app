-- COMPLETE 300 Exercise Insert - Generated from CSV
-- This bypasses CSV upload and inserts all exercises directly

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
CREATE POLICY "Allow read access to exercises for authenticated users" ON exercises FOR SELECT TO authenticated USING (true);

-- Helper function for muscle lookup
CREATE OR REPLACE FUNCTION get_muscle_id(muscle_name TEXT) RETURNS UUID AS $$
BEGIN
    IF muscle_name IS NULL OR muscle_name = 'None' THEN RETURN NULL; END IF;
    RETURN (SELECT id FROM muscle_groups WHERE name = muscle_name LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Insert all exercises
INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Bench Press', 'Classic compound chest exercise performed lying on a bench', 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Barbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Squat', 'Fundamental compound lower body exercise', 'Place barbell on upper back, squat down keeping chest up, drive through heels to stand', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Barbell, Squat Rack', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Conventional Deadlift', 'Hip hinge movement lifting barbell from floor', 'Stand over bar, grip with hands outside legs, lift by extending hips and knees', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Barbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Row', 'Bent-over rowing movement for back development', 'Bend over holding barbell, row to lower chest, squeeze shoulder blades', 'Free Weight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Barbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Overhead Press', 'Standing shoulder press with barbell', 'Stand with barbell at shoulder level, press overhead, lower with control', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Abdominals'),
        'Barbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Curl', 'Bicep isolation exercise', 'Stand holding barbell, curl up by flexing biceps, lower slowly', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Brachialis'),
        'Barbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Close-Grip Bench Press', 'Tricep-focused bench press variation', 'Lie on bench, grip barbell with hands close together, press up focusing on triceps', 'Free Weight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'),
        'Barbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Hip Thrust', 'Glute-focused hip extension exercise', 'Sit against bench with barbell over hips, thrust hips up squeezing glutes', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Barbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Romanian Deadlift', 'Hip hinge movement emphasizing hamstrings', 'Hold barbell, hinge at hips lowering bar, return to standing', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Barbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Front Squat', 'Squat variation with barbell held in front', 'Hold barbell at shoulder level, squat down keeping torso upright', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Glutes'),
        'Barbell, Squat Rack', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Lunge', 'Single-leg exercise with barbell', 'Step forward into lunge position, lower back knee, push back to start', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Barbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Upright Row', 'Vertical pulling exercise for shoulders', 'Hold barbell close to body, pull up to chest level, lower slowly', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Biceps'),
        'Barbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Shrug', 'Trapezius isolation exercise', 'Hold barbell, shrug shoulders up, hold briefly, lower', 'Free Weight', 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Upper Trapezius'), 
        get_muscle_id('Rhomboids'),
        'Barbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Skull Crusher', 'Tricep isolation exercise lying down', 'Lie on bench, hold barbell over chest, lower to forehead, extend back up', 'Free Weight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Front Deltoids'),
        'Barbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Preacher Curl', 'Bicep curl performed on preacher bench', 'Sit at preacher bench, curl barbell up, lower slowly', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Barbell, Preacher Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Sumo Deadlift', 'Wide-stance deadlift variation', 'Wide stance, grip barbell inside legs, lift by extending hips and knees', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Hamstrings'),
        'Barbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Incline Barbell Press', 'Chest press on inclined bench', 'Lie on incline bench, press barbell from chest to arms extended', 'Free Weight', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'Barbell, Incline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Decline Barbell Press', 'Chest press on declined bench', 'Lie on decline bench, press barbell from chest to arms extended', 'Free Weight', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Barbell, Decline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Calf Raise', 'Calf strengthening exercise', 'Hold barbell on shoulders, rise up on toes, lower slowly', 'Free Weight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Barbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Barbell Good Morning', 'Hip hinge exercise for posterior chain', 'Barbell on shoulders, hinge at hips bending forward, return to upright', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Barbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Bench Press', 'Chest press using dumbbells', 'Lie on bench with dumbbells, press up from chest level', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Flye', 'Chest isolation exercise', 'Lie on bench, arc dumbbells out and down, squeeze chest to return', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Row', 'Single-arm rowing exercise', 'Support on bench, row dumbbell to hip, squeeze shoulder blade', 'Free Weight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Dumbbells, Bench', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Shoulder Press', 'Seated or standing shoulder press', 'Press dumbbells overhead from shoulder level, lower with control', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Squat', 'Squat holding dumbbells', 'Hold dumbbells at sides, squat down, drive through heels to stand', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Lunge', 'Forward or reverse lunge with dumbbells', 'Step into lunge holding dumbbells, lower back knee, return to start', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Curl', 'Bicep curl with dumbbells', 'Hold dumbbells, curl up by flexing biceps, lower slowly', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Tricep Extension', 'Overhead tricep exercise', 'Hold dumbbell overhead, lower behind head, extend back up', 'Free Weight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Pullover', 'Chest and lat exercise lying down', 'Lie on bench, hold dumbbell over chest, lower behind head, pull back', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Deadlift', 'Deadlift variation with dumbbells', 'Hold dumbbells, hinge at hips, lower weights, return to standing', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Goblet Squat', 'Squat holding single dumbbell', 'Hold dumbbell at chest, squat down keeping chest up', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Step-Up', 'Single-leg exercise stepping onto platform', 'Step up onto platform with one leg, step down with control', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells, Platform', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Bulgarian Split Squat', 'Rear-foot elevated single-leg squat', 'Rear foot on bench, lower into lunge, drive through front heel', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Hammer Curl', 'Neutral grip bicep curl', 'Hold dumbbells with neutral grip, curl up, lower slowly', 'Free Weight', 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Lateral Raise', 'Side deltoid isolation', 'Hold dumbbells at sides, raise out to sides, lower slowly', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Trapezius'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Rear Delt Flye', 'Rear deltoid isolation exercise', 'Bend over, raise dumbbells out to sides squeezing shoulder blades', 'Free Weight', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Incline Flye', 'Incline chest isolation', 'On incline bench, arc dumbbells out and up', 'Free Weight', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells, Incline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Shrug', 'Trapezius exercise with dumbbells', 'Hold dumbbells, shrug shoulders up, hold, lower', 'Free Weight', 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Upper Trapezius'), 
        get_muscle_id('Rhomboids'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Farmer''s Walk', 'Functional carrying exercise', 'Hold heavy dumbbells, walk maintaining posture', 'Free Weight', 
        get_muscle_id('Forearms'), 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Thruster', 'Compound squat to press movement', 'Squat holding dumbbells, drive up pressing weights overhead', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Glutes'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Romanian Deadlift', 'Hip hinge with dumbbells', 'Hold dumbbells, hinge at hips, lower weights, return', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Bent-Over Row', 'Bent-over rowing with both arms', 'Bend over holding dumbbells, row both to hips', 'Free Weight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Clean and Press', 'Olympic lift variation', 'Clean dumbbells to shoulders, press overhead', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Snatch', 'Single-arm power movement', 'Pull dumbbell from floor to overhead in one motion', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Turkish Get-Up', 'Complex full-body movement', 'Complex movement from lying to standing holding weight', 'Free Weight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Glutes'),
        'Dumbbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Arm Dumbbell Press', 'Unilateral shoulder press', 'Press single dumbbell overhead, engage core for stability', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Triceps'),
        'Dumbbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Woodchop', 'Rotational core exercise', 'Hold dumbbell, rotate from high to low across body', 'Free Weight', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Swing', 'Hip hinge power movement', 'Swing dumbbell between legs and up to chest level', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Renegade Row', 'Plank position rowing', 'In plank on dumbbells, row one at a time', 'Free Weight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Rhomboids'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Man Maker', 'Complex full-body exercise', 'Burpee with dumbbell rows and overhead press', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Arnold Press', 'Rotating shoulder press', 'Start with palms facing you, rotate and press overhead', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Triceps'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Zottman Curl', 'Bicep curl with rotation', 'Curl up normally, rotate and lower slowly', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Brachialis'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell 21s', 'Bicep curl variation with partial reps', '7 bottom half reps, 7 top half, 7 full range', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Concentration Curl', 'Isolated bicep curl', 'Sit, elbow on thigh, curl dumbbell focusing on bicep', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Wrist Curl', 'Forearm strengthening', 'Forearms on thighs, curl weight with wrists only', 'Free Weight', 
        get_muscle_id('Forearms'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Reverse Curl', 'Bicep curl with overhand grip', 'Hold dumbbells overhand, curl up, lower slowly', 'Free Weight', 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Kickback', 'Tricep isolation exercise', 'Bend over, extend dumbbell back squeezing tricep', 'Free Weight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Forearms'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Arm Dumbbell Row', 'Unilateral back exercise', 'Support on bench, row single dumbbell to hip', 'Free Weight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Dumbbell, Bench', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Incline Curl', 'Bicep curl on incline bench', 'On incline bench, curl dumbbells with full stretch', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Dumbbells, Incline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Decline Press', 'Chest press on decline bench', 'On decline bench, press dumbbells from chest', 'Free Weight', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Dumbbells, Decline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Floor Press', 'Floor chest press', 'Lie on floor, press dumbbells from chest level', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Pullover Cross-Bench', 'Chest expansion exercise', 'Lie across bench, hold dumbbell over chest, lower behind head', 'Free Weight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Spider Curl', 'Bicep curl on incline bench face down', 'Face down on incline, curl dumbbells up', 'Free Weight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Dumbbells, Incline Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Single-Leg Deadlift', 'Unilateral hip hinge', 'Stand on one leg, hinge at hip lowering weights', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Calf Raise', 'Standing calf exercise', 'Hold dumbbells, rise up on toes, lower slowly', 'Free Weight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Side Lunge', 'Lateral lunge movement', 'Step to side into lunge, push back to center', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Reverse Lunge', 'Backward stepping lunge', 'Step back into lunge, push through front heel to return', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Sumo Squat', 'Wide-stance squat', 'Wide stance, hold dumbbell between legs, squat down', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Box Step-Up', 'Platform stepping exercise', 'Step up onto box, step down with control', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells, Box', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Walking Lunge', 'Dynamic lunge movement', 'Lunge forward alternating legs while walking', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Curtsy Lunge', 'Cross-behind lunge movement', 'Step back and across behind other leg', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Jump Squat', 'Explosive squat movement', 'Squat down, explode up jumping, land softly', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Single-Arm Snatch', 'Unilateral power movement', 'Pull dumbbell from floor to overhead explosively', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell High Pull', 'Power movement to chest level', 'Pull dumbbells from floor to chest level explosively', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Quadriceps'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Push Press', 'Lower body assisted shoulder press', 'Slight knee bend to assist pressing dumbbells overhead', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Triceps'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Front Raise', 'Anterior deltoid isolation', 'Hold dumbbells, raise forward to shoulder height', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Upright Row', 'Vertical pulling exercise', 'Hold dumbbells close, pull up to chest level', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Biceps'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Reverse Flye', 'Rear deltoid exercise', 'Bend over, raise dumbbells out to sides', 'Free Weight', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Scaption', 'Shoulder abduction in scapular plane', 'Raise dumbbells forward at 45-degree angle', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell L-Raise', 'Combination front and lateral raise', 'Raise one dumbbell forward, one to side', 'Free Weight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Upper Chest'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Y-Raise', 'Overhead Y-position raise', 'Raise dumbbells overhead in Y position', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Lower Trapezius'), 
        get_muscle_id('Serratus Anterior'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell T-Raise', 'Lateral raise to T-position', 'Raise dumbbells to sides forming T shape', 'Free Weight', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Cuban Press', 'Shoulder external rotation exercise', 'Upright row, rotate, then press overhead', 'Free Weight', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rotator Cuff'), 
        get_muscle_id('Side Deltoids'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Face Pull', 'Rear deltoid and upper back exercise', 'Pull dumbbells to face level separating hands', 'Free Weight', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Prone Y-Raise', 'Chest-down Y-raise', 'Lie face down, raise dumbbells in Y position', 'Free Weight', 
        get_muscle_id('Lower Trapezius'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Prone T-Raise', 'Chest-down T-raise', 'Lie face down, raise dumbbells to sides', 'Free Weight', 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Middle Trapezius'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Prone I-Raise', 'Chest-down overhead raise', 'Lie face down, raise dumbbells overhead', 'Free Weight', 
        get_muscle_id('Lower Trapezius'), 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Rhomboids'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Wall Sit Shoulder Press', 'Isometric squat with press', 'Wall sit position, press dumbbells overhead', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Glutes'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Single-Leg Squat', 'Unilateral squat movement', 'Single leg squat holding dumbbell for balance', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Pistol Squat', 'Advanced single-leg squat', 'Full range single-leg squat, other leg extended', 'Free Weight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Deficit Deadlift', 'Deadlift from elevated position', 'Stand on platform, deadlift from greater range', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbells, Platform', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Stiff-Leg Deadlift', 'Straight leg hip hinge', 'Keep legs straight, hinge at hips', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbells', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Good Morning', 'Hip hinge with dumbbells', 'Hold dumbbells, hinge forward at hips', 'Free Weight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbells', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Hip Thrust', 'Glute exercise with dumbbells', 'Back on bench, thrust hips up with dumbbell', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbells, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Glute Bridge', 'Floor-based glute exercise', 'Lie on floor, bridge up with dumbbell on hips', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Single-Leg Hip Thrust', 'Unilateral glute exercise', 'Single leg hip thrust with dumbbell', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell, Bench', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Frog Pump', 'High-rep glute exercise', 'Feet together, knees out, bridge with dumbbell', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'), 
        get_muscle_id('Lower Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Clamshell', 'Hip abduction exercise', 'Side-lying, rotate top leg up with weight', 'Free Weight', 
        get_muscle_id('Hip Abductors'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Obliques'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Fire Hydrant', 'Hip abduction from hands and knees', 'On hands and knees, lift leg to side with weight', 'Free Weight', 
        get_muscle_id('Hip Abductors'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Donkey Kick', 'Glute isolation exercise', 'On hands and knees, kick leg back with weight', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Lower Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Reverse Hyperextension', 'Lower back and glute exercise', 'Lie face down on bench, lift legs with weight', 'Free Weight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Erector Spinae'),
        'Dumbbell, Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Standing Calf Raise', 'Unilateral calf exercise', 'Single leg calf raise holding dumbbell', 'Free Weight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Seated Calf Raise', 'Seated calf strengthening', 'Sit with dumbbell on thigh, raise up on toes', 'Free Weight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'),
        'Dumbbell', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dumbbell Toe Walk', 'Dynamic calf exercise', 'Walk on toes holding dumbbells', 'Free Weight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'Dumbbells', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Chest Press Machine', 'Seated chest press on machine', 'Sit in machine, press handles forward from chest', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Chest Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Leg Press Machine', 'Seated leg press exercise', 'Sit in machine, press weight with feet', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Leg Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Lat Pulldown', 'Vertical pulling exercise', 'Sit at machine, pull bar down to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Biceps'),
        'Lat Pulldown Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Seated Row', 'Horizontal pulling exercise', 'Sit at machine, pull handles to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Seated Row Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Shoulder Press Machine', 'Seated shoulder press', 'Sit in machine, press handles overhead', 'Machine', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Chest'),
        'Shoulder Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Leg Curl Machine', 'Hamstring isolation exercise', 'Lie on machine, curl heels toward glutes', 'Machine', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Calves'), 
        get_muscle_id('Glutes'),
        'Leg Curl Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Leg Extension Machine', 'Quadriceps isolation exercise', 'Sit in machine, extend legs straight', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Glutes'),
        'Leg Extension Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Flye', 'Chest isolation using cables', 'Stand between cables, bring handles together', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Row', 'Horizontal pulling with cables', 'Sit at cable machine, pull handle to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Lateral Raise', 'Side deltoid exercise with cables', 'Stand beside cable, raise handle to side', 'Machine', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Trapezius'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Tricep Pushdown', 'Tricep isolation using cables', 'Stand at cable machine, push bar down', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Front Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Bicep Curl', 'Bicep curl using cable machine', 'Stand at cable, curl handle up', 'Machine', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Face Pull', 'Rear deltoid exercise with cables', 'Pull cable to face level, separate hands', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Woodchop', 'Rotational core exercise with cable', 'Rotate cable from high to low position', 'Machine', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Reverse Flye', 'Rear deltoid cable exercise', 'Cross cables, pull handles apart', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pec Deck Machine', 'Chest isolation machine', 'Sit in machine, bring pads together', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Pec Deck Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Calf Raise Machine', 'Standing calf exercise on machine', 'Stand on machine, raise up on toes', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'),
        'Calf Raise Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Smith Machine Squat', 'Squat using guided barbell', 'Squat with guided barbell for stability', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Smith Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Smith Machine Bench Press', 'Bench press with guided bar', 'Bench press with guided barbell', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Smith Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hip Abduction Machine', 'Hip abductor strengthening', 'Sit in machine, push legs apart', 'Machine', 
        get_muscle_id('Hip Abductors'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Obliques'),
        'Hip Abduction Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hip Adduction Machine', 'Hip adductor strengthening', 'Sit in machine, squeeze legs together', 'Machine', 
        get_muscle_id('Hip Adductors'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Obliques'),
        'Hip Adduction Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Back Extension Machine', 'Lower back strengthening', 'Position in machine, extend back upward', 'Machine', 
        get_muscle_id('Erector Spinae'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Back Extension Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Ab Crunch Machine', 'Abdominal strengthening machine', 'Sit in machine, crunch forward', 'Machine', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Middle Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'Ab Crunch Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Assisted Dip Machine', 'Tricep and chest exercise with assistance', 'Kneel on machine, perform dips with assistance', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Assisted Dip Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Assisted Pull-up Machine', 'Back exercise with assistance', 'Kneel on machine, pull up with assistance', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Assisted Pull-up Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Crunch', 'Abdominal exercise using cable', 'Kneel at cable, crunch down', 'Machine', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Middle Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Russian Twist', 'Rotational core exercise', 'Rotate cable side to side', 'Machine', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Middle Abdominals'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Pull-Through', 'Hip hinge exercise with cable', 'Pull cable through legs with hip hinge', 'Machine', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Erector Spinae'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Kickback', 'Glute exercise using cable', 'Kick leg back against cable resistance', 'Machine', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Hip Abductors'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Side Bend', 'Oblique exercise with cable', 'Bend to side against cable resistance', 'Machine', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Quadratus Lumborum'), 
        get_muscle_id('Erector Spinae'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Seated Leg Curl', 'Hamstring exercise seated', 'Sit in machine, curl legs down', 'Machine', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Calves'), 
        get_muscle_id('Glutes'),
        'Leg Curl Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Standing Leg Curl', 'Hamstring exercise standing', 'Stand at machine, curl one leg at a time', 'Machine', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Calves'), 
        get_muscle_id('Glutes'),
        'Leg Curl Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Preacher Curl Machine', 'Bicep isolation machine', 'Sit at machine, curl handles up', 'Machine', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Preacher Curl Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Fly', 'Chest isolation machine', 'Sit in machine, bring handles together', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Machine Fly', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('T-Bar Row Machine', 'Back exercise using T-bar', 'Straddle machine, row handles to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'T-Bar Row Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Incline Press Machine', 'Incline chest press machine', 'Sit in inclined machine, press handles up', 'Machine', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'Incline Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Decline Press Machine', 'Decline chest press machine', 'Sit in declined machine, press handles up', 'Machine', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Decline Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Reverse Pec Deck', 'Rear deltoid machine exercise', 'Sit facing machine, pull handles apart', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Reverse Pec Deck', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Upright Row', 'Upright row using cable', 'Pull cable up to chest level', 'Machine', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Biceps'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Shrug', 'Trapezius exercise with cable', 'Shrug shoulders up against cable', 'Machine', 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Upper Trapezius'), 
        get_muscle_id('Rhomboids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Shrug', 'Trapezius exercise on machine', 'Stand in machine, shrug shoulders up', 'Machine', 
        get_muscle_id('Trapezius'), 
        get_muscle_id('Upper Trapezius'), 
        get_muscle_id('Rhomboids'),
        'Shrug Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Glute Ham Raise', 'Hamstring and glute exercise', 'Secure feet, lower and raise body', 'Machine', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Erector Spinae'),
        'GHR Machine', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Roman Chair Sit-Up', 'Abdominal exercise on roman chair', 'Sit on chair, perform sit-ups', 'Machine', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Middle Abdominals'),
        'Roman Chair', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Captain''s Chair Leg Raise', 'Hanging leg raise variation', 'Support on arms, raise legs up', 'Machine', 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Captain''s Chair', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Hammer Curl', 'Neutral grip bicep curl with cable', 'Curl cable with neutral grip', 'Machine', 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Concentration Curl', 'Isolated bicep curl with cable', 'Single arm curl with cable support', 'Machine', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Overhead Tricep Extension', 'Tricep exercise with cable overhead', 'Pull cable down from overhead position', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Lying Tricep Extension', 'Tricep exercise lying with cable', 'Lie down, extend cable from overhead', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Chest Dip Machine', 'Chest and tricep dip machine', 'Sit in machine, perform dips', 'Machine', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Dip Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Vertical Leg Press', 'Leg press in vertical position', 'Lie under machine, press weight up', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Vertical Leg Press', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hack Squat Machine', 'Squat exercise on hack machine', 'Stand in machine, squat with back support', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Hack Squat Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Belt Squat Machine', 'Squat using belt attachment', 'Wear belt, squat with weight attached', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Belt Squat Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pendulum Squat', 'Squat on pendulum machine', 'Stand on machine, squat in arc motion', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'Pendulum Squat', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Sissy Squat Machine', 'Quadriceps isolation machine', 'Lean back, squat focusing on quads', 'Machine', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Sissy Squat Machine', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Leg Press Calf Raise', 'Calf raise on leg press machine', 'Perform calf raises on leg press platform', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'),
        'Leg Press Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Smith Machine Calf Raise', 'Calf raise using Smith machine', 'Stand under Smith bar, perform calf raises', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'Smith Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Calf Raise', 'Calf raise using cable machine', 'Stand on platform, perform calf raises with cable', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Donkey Calf Raise Machine', 'Bent-over calf raise machine', 'Bend over in machine, perform calf raises', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Erector Spinae'),
        'Donkey Calf Raise Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Seated Calf Raise Machine', 'Seated calf strengthening machine', 'Sit in machine, raise up on toes with weight', 'Machine', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'),
        'Seated Calf Raise Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Side Lateral Raise', 'Lateral raise using cable from side', 'Stand beside cable, raise to side', 'Machine', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Trapezius'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Front Raise', 'Front deltoid raise with cable', 'Raise cable forward to shoulder height', 'Machine', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Rear Delt Fly', 'Rear deltoid fly with cables', 'Stand between cables, pull apart', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Lateral Raise', 'Lateral raise on machine', 'Sit in machine, raise handles to sides', 'Machine', 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Trapezius'),
        'Lateral Raise Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Rear Delt Fly', 'Rear deltoid machine', 'Sit facing backward, pull handles apart', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Rear Delt Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Internal Rotation', 'Shoulder internal rotation', 'Rotate arm inward against cable', 'Machine', 
        get_muscle_id('Rotator Cuff'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Middle Chest'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable External Rotation', 'Shoulder external rotation', 'Rotate arm outward against cable', 'Machine', 
        get_muscle_id('Rotator Cuff'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Middle Trapezius'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pulley System Face Pull', 'High pulley face pull', 'Pull high pulley to face level', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Middle Trapezius'),
        'Pulley System', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Low Row Machine', 'Low rowing machine', 'Sit at machine, row handles to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Low Row Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('High Row Machine', 'High rowing machine', 'Sit at machine, row handles to upper chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'High Row Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Wide Grip Lat Pulldown', 'Wide grip vertical pull', 'Pull wide bar down to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Biceps'),
        'Lat Pulldown Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Close Grip Lat Pulldown', 'Close grip vertical pull', 'Pull close grip bar to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Lat Pulldown Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('V-Bar Lat Pulldown', 'V-shaped handle pulldown', 'Pull V-bar down to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Lat Pulldown Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Pulldown', 'Cable version of lat pulldown', 'Pull cable down to chest from high position', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Pullover', 'Lat pullover on machine', 'Sit in machine, pull bar down and back', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Serratus Anterior'),
        'Pullover Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Pullover', 'Pullover using cable machine', 'Pull cable from high to low position', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Straight Arm Pulldown', 'Lat exercise with straight arms', 'Pull cable down with straight arms', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Straight Arm Pullback', 'Rear delt exercise with cable', 'Pull cable back with straight arms', 'Machine', 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Row', 'Generic rowing machine', 'Sit at machine, row handles to body', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Rowing Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hammer Strength Row', 'Plate-loaded rowing machine', 'Sit at machine, row handles alternately', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Hammer Strength Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Lever Row', 'Lever-based rowing machine', 'Sit at machine, pull lever to chest', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Lever Row Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable One-Arm Row', 'Single arm row with cable', 'Single arm rowing motion with cable', 'Machine', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Chest Fly', 'Chest fly on machine', 'Sit in machine, bring handles together', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Chest Fly Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Incline Machine Fly', 'Incline chest fly machine', 'Sit in inclined machine, bring handles together', 'Machine', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Incline Fly Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Decline Machine Fly', 'Decline chest fly machine', 'Sit in declined machine, bring handles together', 'Machine', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'Decline Fly Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Crossover', 'Cable chest crossover', 'Cross cables at chest level', 'Machine', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('High Cable Crossover', 'High cable chest crossover', 'Pull cables down and across', 'Machine', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Low Cable Crossover', 'Low cable chest crossover', 'Pull cables up and across', 'Machine', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Serratus Anterior'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Tricep Dip', 'Tricep dip on machine', 'Sit in machine, perform dips', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Tricep Dip Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Tricep Kickback', 'Tricep kickback with cable', 'Bend over, extend cable back', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cable Overhead Tricep Press', 'Overhead tricep press with cable', 'Press cable overhead from behind head', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'),
        'Cable Machine', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Rope Tricep Pushdown', 'Tricep pushdown with rope', 'Push rope down separating at bottom', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Front Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('V-Bar Tricep Pushdown', 'Tricep pushdown with V-bar', 'Push V-bar down with both hands', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Front Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Straight Bar Tricep Pushdown', 'Tricep pushdown with straight bar', 'Push straight bar down', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Forearms'), 
        get_muscle_id('Front Deltoids'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Reverse Grip Tricep Pushdown', 'Underhand tricep pushdown', 'Push bar down with underhand grip', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Forearms'),
        'Cable Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Machine Tricep Extension', 'Tricep extension machine', 'Sit in machine, extend arms', 'Machine', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'), 
        get_muscle_id('Forearms'),
        'Tricep Extension Machine', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Bodyweight Squat', 'Basic squatting movement', 'Squat down keeping chest up, drive through heels', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Push-Up', 'Classic upper body exercise', 'Lower chest to floor, push back up', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pull-Up', 'Vertical pulling exercise', 'Hang from bar, pull body up', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dip', 'Tricep and chest exercise', 'Lower body between bars, push back up', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Dip Bars', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Lunge', 'Single-leg exercise', 'Step forward into lunge, return to start', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Plank', 'Core stability exercise', 'Hold straight body position on forearms', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Transverse Abdominis'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Burpee', 'Full-body explosive movement', 'Squat, jump back, push-up, jump forward, jump up', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Mountain Climber', 'Dynamic core exercise', 'Plank position, alternate bringing knees to chest', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Jumping Jack', 'Cardiovascular exercise', 'Jump feet apart while raising arms overhead', 'Bodyweight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Hip Abductors'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('High Knees', 'Dynamic leg exercise', 'Run in place bringing knees high', 'Bodyweight', 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Calves'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Butt Kicks', 'Dynamic hamstring exercise', 'Run in place kicking heels to glutes', 'Bodyweight', 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Jump Squat', 'Explosive squat movement', 'Squat down, explode up jumping', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Leg Squat', 'Unilateral squat exercise', 'Squat on one leg, other leg extended', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pistol Squat', 'Advanced single-leg squat', 'Full range single-leg squat', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Wall Sit', 'Isometric squat exercise', 'Sit against wall in squat position', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'Wall', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Calf Raise', 'Standing calf exercise', 'Rise up on toes, lower slowly', 'Bodyweight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Leg Calf Raise', 'Unilateral calf exercise', 'Calf raise on one leg', 'Bodyweight', 
        get_muscle_id('Calves'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Glute Bridge', 'Hip extension exercise', 'Lie on back, bridge hips up', 'Bodyweight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Leg Glute Bridge', 'Unilateral glute exercise', 'Bridge on one leg', 'Bodyweight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hip Thrust', 'Glute exercise against bench', 'Back against bench, thrust hips up', 'Bodyweight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Upper Abdominals'),
        'Bench', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Reverse Lunge', 'Backward stepping lunge', 'Step back into lunge', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Side Lunge', 'Lateral lunge movement', 'Step to side into lunge', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Curtsy Lunge', 'Cross-behind lunge', 'Step back and across', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Walking Lunge', 'Dynamic lunge movement', 'Lunge forward alternating legs', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Jump Lunge', 'Explosive lunge variation', 'Switch legs mid-air in lunge position', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Step-Up', 'Single-leg step exercise', 'Step up onto platform', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Platform', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Box Jump', 'Explosive jumping exercise', 'Jump up onto box', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'Box', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Broad Jump', 'Horizontal jumping exercise', 'Jump forward as far as possible', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Vertical Jump', 'Vertical jumping exercise', 'Jump straight up as high as possible', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Tuck Jump', 'Knee-to-chest jump', 'Jump bringing knees to chest', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Calves'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Star Jump', 'Explosive jumping jack variation', 'Jump spreading arms and legs wide', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Side Deltoids'), 
        get_muscle_id('Hip Abductors'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Squat Jump', 'Explosive squat variation', 'Jump from squat position', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Split Jump', 'Alternating lunge jump', 'Jump switching lunge positions', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Lateral Bound', 'Side-to-side jumping', 'Jump laterally from leg to leg', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Abductors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Single-Leg Hop', 'Unilateral hopping exercise', 'Hop on one leg', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Diamond Push-Up', 'Tricep-focused push-up', 'Push-up with hands in diamond shape', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Wide Push-Up', 'Chest-focused push-up', 'Push-up with wide hand placement', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Decline Push-Up', 'Elevated feet push-up', 'Push-up with feet elevated', 'Bodyweight', 
        get_muscle_id('Upper Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'Platform', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Incline Push-Up', 'Elevated hands push-up', 'Push-up with hands elevated', 'Bodyweight', 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Platform', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pike Push-Up', 'Shoulder-focused push-up', 'Push-up in pike position', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Chest'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hindu Push-Up', 'Dynamic push-up variation', 'Flow from plank to downward dog', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Archer Push-Up', 'Single-arm focused push-up', 'Push-up shifting weight to one arm', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('One-Arm Push-Up', 'Single-arm push-up', 'Push-up using only one arm', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Clapping Push-Up', 'Explosive push-up', 'Push-up with explosive clap', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Spiderman Push-Up', 'Push-up with knee drive', 'Push-up bringing knee to elbow', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('T-Push-Up', 'Push-up with rotation', 'Push-up rotating to T position', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Staggered Push-Up', 'Uneven hand placement push-up', 'Push-up with hands at different levels', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Pseudo Planche Push-Up', 'Advanced strength push-up', 'Push-up with hands by ribs', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Handstand Push-Up', 'Inverted shoulder press', 'Press up from handstand position', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Chest'),
        'Wall', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Chin-Up', 'Underhand pull-up', 'Pull up with underhand grip', 'Bodyweight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Wide-Grip Pull-Up', 'Wide grip vertical pull', 'Pull up with wide grip', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Biceps'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Close-Grip Pull-Up', 'Narrow grip pull-up', 'Pull up with close grip', 'Bodyweight', 
        get_muscle_id('Biceps'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Neutral Grip Pull-Up', 'Parallel grip pull-up', 'Pull up with palms facing each other', 'Bodyweight', 
        get_muscle_id('Brachialis'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Commando Pull-Up', 'Alternating side pull-up', 'Pull up alternating sides of bar', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Upper Abdominals'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('L-Sit Pull-Up', 'Pull-up holding L-sit', 'Pull up while holding legs horizontal', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Hip Flexors'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Muscle-Up', 'Pull-up to dip transition', 'Pull up and transition to dip', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Front Deltoids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Typewriter Pull-Up', 'Side-to-side pull-up', 'Pull up shifting side to side', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('One-Arm Pull-Up', 'Single-arm vertical pull', 'Pull up using one arm', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Upper Abdominals'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Archer Pull-Up', 'Single-arm focused pull-up', 'Pull up focusing on one arm', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Biceps'), 
        get_muscle_id('Rhomboids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Australian Pull-Up', 'Inverted row', 'Pull body up from under bar', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Bar', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Inverted Row', 'Horizontal bodyweight pull', 'Pull chest to bar from underneath', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Bar', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Ring Row', 'Row using suspension rings', 'Row using gymnastic rings', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'Rings', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('TRX Row', 'Suspension trainer row', 'Row using TRX straps', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Rhomboids'), 
        get_muscle_id('Rear Deltoids'),
        'TRX', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Tricep Dip', 'Parallel bar dip', 'Lower between bars, push up', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Dip Bars', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Bench Dip', 'Dip using bench', 'Dip with hands on bench behind you', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Bench', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Chair Dip', 'Dip using chair', 'Dip with hands on chair', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Chair', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Ring Dip', 'Dip using gymnastic rings', 'Dip using unstable rings', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Upper Abdominals'),
        'Rings', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Korean Dip', 'Deep dip variation', 'Dip with deeper range of motion', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Dip Bars', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Straight Bar Dip', 'Dip on single bar', 'Dip supporting body on single bar', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Straight Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Russian Dip', 'Dip with forward lean', 'Dip leaning forward', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Dip Bars', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Weighted Dip', 'Dip with added weight', 'Dip with weight belt', 'Bodyweight', 
        get_muscle_id('Triceps'), 
        get_muscle_id('Lower Chest'), 
        get_muscle_id('Front Deltoids'),
        'Dip Belt', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('L-Sit', 'Core isometric hold', 'Hold body with legs horizontal', 'Bodyweight', 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Front Deltoids'),
        'Parallel Bars', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('V-Sit', 'Core strengthening hold', 'Balance on tailbone with legs up', 'Bodyweight', 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Hollow Body Hold', 'Core stability exercise', 'Hold hollow position on back', 'Bodyweight', 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dead Bug', 'Core stability exercise', 'Lie on back, opposite arm and leg movements', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Hip Flexors'), 
        get_muscle_id('Transverse Abdominis'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Bird Dog', 'Core and stability exercise', 'On hands and knees, extend opposite limbs', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Rear Deltoids'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Superman', 'Lower back strengthening', 'Lie face down, lift chest and legs', 'Bodyweight', 
        get_muscle_id('Erector Spinae'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Rear Deltoids'),
        'None', 'Beginner', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Reverse Plank', 'Posterior chain plank', 'Plank facing up', 'Bodyweight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hamstrings'), 
        get_muscle_id('Rear Deltoids'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Side Plank', 'Lateral core stability', 'Plank on side', 'Bodyweight', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Transverse Abdominis'), 
        get_muscle_id('Side Deltoids'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Plank Up-Down', 'Dynamic plank variation', 'Move from plank to forearm plank', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Plank Jack', 'Plank with jumping feet', 'Jump feet apart and together in plank', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Hip Abductors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Plank to Pike', 'Dynamic plank movement', 'Move from plank to pike position', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Hip Flexors'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Bear Crawl', 'Quadrupedal movement', 'Crawl on hands and feet', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Quadriceps'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Crab Walk', 'Reverse quadrupedal movement', 'Walk on hands and feet facing up', 'Bodyweight', 
        get_muscle_id('Glutes'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Rear Deltoids'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Duck Walk', 'Low squat walking', 'Walk in deep squat position', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Frog Jump', 'Explosive forward jumping', 'Jump forward in squat position', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Calves'),
        'None', 'Intermediate', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Lizard Crawl', 'Low crawling movement', 'Crawl with body low to ground', 'Bodyweight', 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Hip Flexors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Shrimp Squat', 'Advanced single-leg squat', 'Single-leg squat holding other leg', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Dragon Squat', 'Single-leg squat variation', 'Single-leg squat with leg behind', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Cossack Squat', 'Lateral single-leg squat', 'Deep lateral squat', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Archer Squat', 'Single-leg focused squat', 'Squat shifting weight to one leg', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Hip Adductors'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Shrimp Pistol Squat', 'Combined advanced squat', 'Single-leg squat holding foot behind', 'Bodyweight', 
        get_muscle_id('Quadriceps'), 
        get_muscle_id('Glutes'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Wall Handstand', 'Inverted hold against wall', 'Hold handstand against wall', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Triceps'),
        'Wall', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Freestanding Handstand', 'Inverted hold without support', 'Hold handstand without support', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Forearms'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Crow Pose', 'Arm balancing pose', 'Balance on hands with knees on arms', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'), 
        get_muscle_id('Triceps'),
        'None', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Front Lever', 'Advanced pulling hold', 'Hold body horizontal from bar', 'Bodyweight', 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Lower Abdominals'), 
        get_muscle_id('Rear Deltoids'),
        'Pull-up Bar', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Back Lever', 'Advanced pushing hold', 'Hold body horizontal behind rings', 'Bodyweight', 
        get_muscle_id('Middle Chest'), 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Upper Abdominals'),
        'Rings', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Human Flag', 'Lateral strength hold', 'Hold body horizontal on pole', 'Bodyweight', 
        get_muscle_id('Obliques'), 
        get_muscle_id('Latissimus Dorsi'), 
        get_muscle_id('Side Deltoids'),
        'Vertical Pole', 'Advanced', 
        true, 'strength');

INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('Planche', 'Advanced pushing hold', 'Hold body horizontal on hands', 'Bodyweight', 
        get_muscle_id('Front Deltoids'), 
        get_muscle_id('Triceps'), 
        get_muscle_id('Upper Abdominals'),
        'None', 'Advanced', 
        true, 'strength');
-- Clean up
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

-- Results
SELECT COUNT(*) as total_exercises,
       COUNT(CASE WHEN category = 'Free Weight' THEN 1 END) as free_weight,
       COUNT(CASE WHEN category = 'Machine' THEN 1 END) as machine,  
       COUNT(CASE WHEN category = 'Bodyweight' THEN 1 END) as bodyweight
FROM exercises;
