/**
 * @file batch-insert-100-new-exercises.sql
 * @description 100 NEW exercises filling gaps - PART 1 OF 2 (50 exercises)
 * @date 2025-11-17
 * 
 * VALID exercise_type VALUES:
 * - 'Free Weight' (barbells, dumbbells, kettlebells)
 * - 'Machine' (Hammer Strength, HOIST, Smith machine)
 * - 'Cable' (cable machines)
 * - 'Bodyweight' (TRX, stability ball, functional movements)
 * 
 * RUN THIS FIRST, THEN RUN batch-insert-100-new-exercises-part2.sql
 */

-- ========================================
-- HAMMER STRENGTH MACHINES (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Hammer Strength Chest Press', 'Plate-loaded chest press machine', 'Sit in machine, grip handles at chest level, press forward to lockout. Independent arms allow unilateral training.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Incline Press', 'ISO-lateral incline chest press', 'Sit in inclined position, press handles upward. Each arm moves independently for balanced development.', 'Upper Chest', 'Front Deltoids', 'Triceps', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Decline Press', 'Plate-loaded decline press', 'Sit in declined position, press handles forward. Targets lower chest effectively.', 'Lower Chest', 'Triceps', 'Front Deltoids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Wide Chest Press', 'Wide grip chest press machine', 'Wide grip handles for outer chest emphasis. Press handles together focusing on chest squeeze.', 'Middle Chest', 'Front Deltoids', 'Serratus Anterior', 'Hammer Strength Machine', 'Intermediate', 'Machine'),
  ('Hammer Strength Low Row', 'Plate-loaded low row machine', 'Sit upright, pull handles to lower abdomen. Independent arms for balanced back development.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength High Row', 'ISO-lateral high row machine', 'Pull handles to upper chest. Targets upper back and rear delts. Each arm works independently.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Hammer Strength Machine', 'Intermediate', 'Machine'),
  ('Hammer Strength Seated Row', 'Horizontal rowing machine', 'Sit at machine, chest against pad. Row handles to sides. Excellent for lat width.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Pulldown', 'ISO-lateral pulldown machine', 'Sit at machine, pull handles down to chest. Independent arms allow unilateral focus.', 'Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Shoulder Press', 'Plate-loaded shoulder press', 'Sit at machine, press handles overhead. Independent movement for balanced shoulder development.', 'Front Deltoids', 'Triceps', 'Upper Chest', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Lateral Raise', 'ISO-lateral side delt machine', 'Sit in machine, raise handles laterally. Isolated side delt work with stability.', 'Side Deltoids', 'Front Deltoids', 'Trapezius', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Shrug', 'Plate-loaded shrug machine', 'Stand in machine, shrug shoulders upward against resistance. Heavy loading for trap development.', 'Trapezius', 'Upper Trapezius', 'Rhomboids', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Leg Press', '45-degree plate-loaded leg press', 'Sit in angled seat, press platform away with feet. Adjust foot position for quad/glute emphasis.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength V-Squat', 'Angled plate-loaded squat machine', 'Stand on platform, shoulders under pads. Squat down in fixed path. Quad emphasis.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Hammer Strength Machine', 'Intermediate', 'Machine'),
  ('Hammer Strength Seated Leg Curl', 'ISO-lateral hamstring curl', 'Sit in machine, curl legs down. Independent leg movement for balanced hamstring development.', 'Hamstrings', 'Calves', 'Glutes', 'Hammer Strength Machine', 'Beginner', 'Machine'),
  ('Hammer Strength Abdominal Crunch', 'Plate-loaded ab crunch machine', 'Sit in machine, crunch forward against resistance. Weighted ab training for core strength.', 'Upper Abdominals', 'Middle Abdominals', 'Hip Flexors', 'Hammer Strength Machine', 'Beginner', 'Machine')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- HOIST MACHINES (10)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('HOIST Chest Press', 'Selectorized chest press machine', 'Sit at machine, adjust seat height. Press handles forward to full extension. Smooth motion control.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Leg Press', 'Selectorized leg press machine', 'Sit with back against pad, feet on platform. Press forward extending legs. Constant tension.', 'Quadriceps', 'Glutes', 'Hamstrings', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Lat Pulldown', 'Selectorized pulldown machine', 'Sit at machine, pull bar down to upper chest. Multiple grip attachments available.', 'Latissimus Dorsi', 'Biceps', 'Rhomboids', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Seated Row', 'Cable-based rowing machine', 'Sit upright, pull handles to torso. Chest pad prevents momentum. Focus on back squeeze.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Shoulder Press', 'Selectorized overhead press', 'Sit at machine, press handles overhead. Guided path for shoulder safety.', 'Front Deltoids', 'Triceps', 'Upper Chest', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Leg Extension', 'Selectorized leg extension machine', 'Sit with back against pad, extend legs to lockout. Adjust starting position for knee safety.', 'Quadriceps', 'Hip Flexors', 'Glutes', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Leg Curl', 'Selectorized hamstring curl', 'Lie face down, curl heels to glutes. Pad adjusts for different leg lengths.', 'Hamstrings', 'Calves', 'Glutes', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Pec Fly', 'Chest fly machine with pivot', 'Sit upright, bring handles together in front of chest. Smooth arc motion for pec isolation.', 'Middle Chest', 'Front Deltoids', 'Serratus Anterior', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Rear Delt Fly', 'Reverse fly machine', 'Sit facing machine, pull handles apart. Targets rear delts and upper back.', 'Rear Deltoids', 'Rhomboids', 'Middle Trapezius', 'HOIST Machine', 'Beginner', 'Machine'),
  ('HOIST Tricep Extension', 'Overhead tricep extension machine', 'Sit at machine, extend arms overhead. Fixed path isolates triceps effectively.', 'Triceps', 'Rear Deltoids', 'Forearms', 'HOIST Machine', 'Beginner', 'Machine')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- BARBELL VARIATIONS (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Paused Barbell Bench Press', 'Bench press with pause at chest', 'Lower bar to chest, pause 2-3 seconds, then press. Removes stretch reflex, builds strength.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Advanced', 'Free Weight'),
  ('Tempo Barbell Squat', 'Squat with controlled tempo', 'Descend slowly (3-4 seconds), pause at bottom, explode up. Time under tension for growth.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Barbell', 'Intermediate', 'Free Weight'),
  ('Deficit Deadlift', 'Deadlift from elevated platform', 'Stand on 2-4 inch platform. Increases range of motion and hamstring stretch.', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Barbell', 'Advanced', 'Free Weight'),
  ('Pin Press', 'Bench press from pins', 'Set pins at various heights. Press from dead stop. Builds lockout strength.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Advanced', 'Free Weight'),
  ('Safety Bar Squat', 'Squat with safety squat bar', 'Cambered bar with padded yoke. Easier on shoulders, more upright torso.', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'Barbell', 'Intermediate', 'Free Weight'),
  ('Larsen Press', 'Bench press with feet up', 'Bench press without leg drive. Isolates chest and triceps. Feet off ground.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Advanced', 'Free Weight'),
  ('Anderson Squat', 'Squat from pins in rack', 'Start from bottom position on pins. Builds strength from dead stop.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Barbell', 'Advanced', 'Free Weight'),
  ('Floor Press', 'Bench press on floor', 'Lie on floor, press barbell from chest. Limited range builds lockout strength.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Intermediate', 'Free Weight'),
  ('Box Squat', 'Squat to box for depth', 'Squat to box, pause briefly, explode up. Teaches proper depth and hip drive.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Barbell', 'Intermediate', 'Free Weight'),
  ('Spoto Press', 'Bench press paused 1 inch from chest', 'Lower to 1 inch from chest, pause, press. Builds explosive strength off chest.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Advanced', 'Free Weight'),
  ('Barbell Zercher Squat', 'Squat with bar in elbow crooks', 'Hold bar in elbow crooks, squat. Core and upper back intensive.', 'Quadriceps', 'Upper Abdominals', 'Glutes', 'Barbell', 'Advanced', 'Free Weight'),
  ('Barbell Overhead Squat', 'Squat with bar overhead', 'Hold bar overhead in snatch grip, squat. Requires mobility and stability.', 'Quadriceps', 'Front Deltoids', 'Upper Abdominals', 'Barbell', 'Advanced', 'Free Weight'),
  ('Barbell Clean Pull', 'Explosive pull to hip level', 'Pull bar explosively from floor to hip. Builds power for Olympic lifts.', 'Hamstrings', 'Trapezius', 'Glutes', 'Barbell', 'Advanced', 'Free Weight'),
  ('Barbell Snatch Grip Deadlift', 'Wide grip deadlift variation', 'Deadlift with wide snatch grip. Increases range of motion and upper back work.', 'Hamstrings', 'Trapezius', 'Erector Spinae', 'Barbell', 'Advanced', 'Free Weight'),
  ('Barbell Z-Press', 'Seated floor press overhead', 'Sit on floor, legs extended. Press barbell overhead. Core stability required.', 'Front Deltoids', 'Upper Abdominals', 'Triceps', 'Barbell', 'Advanced', 'Free Weight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- CABLE MACHINE VARIATIONS (10)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Single-Arm Cable Chest Press', 'Unilateral cable chest press', 'Stand facing away from cable. Press single handle forward. Engage core for stability.', 'Middle Chest', 'Triceps', 'Upper Abdominals', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Cable Incline Fly', 'Low cable fly for upper chest', 'Set cables low. Bring handles up and together. Targets upper chest fibers.', 'Upper Chest', 'Front Deltoids', 'Serratus Anterior', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Cable Decline Fly', 'High cable fly for lower chest', 'Set cables high. Bring handles down and together. Lower chest emphasis.', 'Lower Chest', 'Front Deltoids', 'Triceps', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Single-Arm Cable Row', 'Unilateral horizontal pull', 'Pull single cable handle to side. Rotate torso slightly. Core engagement.', 'Latissimus Dorsi', 'Rhomboids', 'Obliques', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Y-Raise', 'Cable raise in Y-pattern', 'Pull cables up and apart forming Y-shape. Targets lower traps and rear delts.', 'Lower Trapezius', 'Rear Deltoids', 'Side Deltoids', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Cable W-Raise', 'External rotation cable raise', 'Pull cables to face, bend elbows. External rotation emphasis. Shoulder health.', 'Rear Deltoids', 'Rotator Cuff', 'Rhomboids', 'Cable Machine', 'Beginner', 'Cable'),
  ('Single-Arm Cable Lateral Raise', 'One arm side delt cable raise', 'Stand beside cable. Raise single handle laterally. Better tension than dumbbells.', 'Side Deltoids', 'Front Deltoids', 'Trapezius', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Chest Fly Mid-Height', 'Mid-height cable crossover', 'Set cables at chest height. Bring handles together. Targets mid-chest.', 'Middle Chest', 'Front Deltoids', 'Serratus Anterior', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Rope Tricep Extension', 'Cable rope skull crusher', 'Lie on bench with rope attachment, extend cable from overhead. Constant tension on triceps.', 'Triceps', 'Front Deltoids', 'Forearms', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Cable Preacher Curl', 'Cable curl on preacher bench', 'Position preacher bench at cable. Curl handle up. Constant tension biceps.', 'Biceps', 'Brachialis', 'Forearms', 'Cable Machine', 'Beginner', 'Cable')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- PART 1 COMPLETE - 50 EXERCISES
-- ========================================
-- Run batch-insert-100-new-exercises-part2.sql next for remaining 50 exercises
