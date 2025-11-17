/**
 * @file batch-insert-100-new-exercises-part2.sql
 * @description 100 NEW exercises - PART 2 OF 2 (50 exercises)
 * @date 2025-11-17
 * 
 * RUN batch-insert-100-new-exercises.sql FIRST, THEN RUN THIS FILE
 * 
 * VALID exercise_type VALUES:
 * - 'Free Weight' (barbells, dumbbells, kettlebells)
 * - 'Machine' (Hammer Strength, HOIST, Smith machine)
 * - 'Cable' (cable machines)
 * - 'Bodyweight' (TRX, stability ball, functional movements)
 */

-- ========================================
-- CABLE MACHINE VARIATIONS (5 more)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Cable Glute Kickback', 'Cable kickback for glutes', 'Attach ankle cuff. Kick leg back against cable. Glute isolation.', 'Glutes', 'Hamstrings', 'Hip Abductors', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Hip Abduction', 'Lateral leg raise with cable', 'Stand beside cable with ankle cuff. Raise leg laterally. Hip abductor work.', 'Hip Abductors', 'Glutes', 'Obliques', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Hip Adduction', 'Cross-body cable leg pull', 'Stand beside cable with ankle cuff on far leg. Pull leg across body. Inner thigh.', 'Hip Adductors', 'Quadriceps', 'Obliques', 'Cable Machine', 'Beginner', 'Cable'),
  ('Cable Pallof Press', 'Anti-rotation core exercise', 'Stand perpendicular to cable. Press forward resisting rotation. Core stability.', 'Upper Abdominals', 'Obliques', 'Transverse Abdominis', 'Cable Machine', 'Intermediate', 'Cable'),
  ('Cable Reverse Crunch', 'Lower ab cable crunch', 'Lie on back, ankle cuff attached. Crunch knees to chest. Lower ab focus.', 'Lower Abdominals', 'Hip Flexors', 'Upper Abdominals', 'Cable Machine', 'Intermediate', 'Cable')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- FUNCTIONAL & ATHLETIC (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Kettlebell Swing', 'Hip hinge power movement', 'Swing kettlebell between legs, thrust hips forward to shoulder height. Power from hips.', 'Glutes', 'Hamstrings', 'Erector Spinae', 'Kettlebell', 'Intermediate', 'Free Weight'),
  ('Turkish Get-Up', 'Complex stability movement', 'From lying to standing holding weight overhead. Reverse to return. Total body control.', 'Upper Abdominals', 'Front Deltoids', 'Glutes', 'Kettlebell', 'Advanced', 'Free Weight'),
  ('Kettlebell Goblet Squat', 'Front-loaded squat variation', 'Hold kettlebell at chest. Squat deep keeping upright torso. Beginner friendly.', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'Kettlebell', 'Beginner', 'Free Weight'),
  ('Kettlebell Clean', 'Explosive kettlebell movement', 'Clean kettlebell from floor to rack position. Hip drive and catch.', 'Hamstrings', 'Front Deltoids', 'Glutes', 'Kettlebell', 'Intermediate', 'Free Weight'),
  ('Battle Rope Waves', 'Alternating rope waves', 'Create waves with alternating arm motion. Cardio and shoulder endurance.', 'Front Deltoids', 'Upper Abdominals', 'Forearms', 'Battle Ropes', 'Intermediate', 'Bodyweight'),
  ('Battle Rope Slams', 'Overhead rope slams', 'Raise ropes overhead, slam down explosively. Full body power.', 'Front Deltoids', 'Upper Abdominals', 'Latissimus Dorsi', 'Battle Ropes', 'Intermediate', 'Bodyweight'),
  ('Sled Push', 'Prowler sled pushing', 'Low position, drive legs, push loaded sled. Explosive leg power.', 'Quadriceps', 'Glutes', 'Calves', 'Sled', 'Intermediate', 'Bodyweight'),
  ('Sled Drag', 'Backward sled dragging', 'Attach harness, walk backward pulling sled. Quad emphasis, knee-friendly.', 'Quadriceps', 'Glutes', 'Calves', 'Sled', 'Intermediate', 'Bodyweight'),
  ('Tire Flip', 'Heavy tire flipping', 'Squat under tire, drive up and forward flipping it. Full body power.', 'Hamstrings', 'Glutes', 'Upper Abdominals', 'Tire', 'Advanced', 'Bodyweight'),
  ('Medicine Ball Slam', 'Overhead ball slam', 'Raise medicine ball overhead, slam to ground explosively. Power and core.', 'Upper Abdominals', 'Front Deltoids', 'Latissimus Dorsi', 'Medicine Ball', 'Intermediate', 'Bodyweight'),
  ('Medicine Ball Chest Pass', 'Explosive chest throw', 'Stand facing wall. Chest pass medicine ball explosively. Plyometric chest work.', 'Middle Chest', 'Triceps', 'Front Deltoids', 'Medicine Ball', 'Intermediate', 'Bodyweight'),
  ('Medicine Ball Rotational Throw', 'Side throw for power', 'Stand sideways to wall. Rotate and throw ball. Core rotation power.', 'Obliques', 'Upper Abdominals', 'Front Deltoids', 'Medicine Ball', 'Intermediate', 'Bodyweight'),
  ('Sandbag Carry', 'Loaded carry variation', 'Carry sandbag in various positions. Functional strength and stability.', 'Trapezius', 'Upper Abdominals', 'Forearms', 'Sandbag', 'Intermediate', 'Bodyweight'),
  ('Sandbag Shouldering', 'Floor to shoulder lift', 'Lift sandbag from floor to one shoulder. Alternate sides. Functional power.', 'Hamstrings', 'Upper Abdominals', 'Front Deltoids', 'Sandbag', 'Advanced', 'Bodyweight'),
  ('Farmers Walk on Toes', 'Calf-focused carry', 'Walk on toes holding heavy dumbbells. Calf endurance and balance.', 'Calves', 'Forearms', 'Upper Abdominals', 'Dumbbell', 'Intermediate', 'Free Weight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- STABILITY BALL & TRX (10)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Stability Ball Chest Press', 'Dumbbell press on unstable surface', 'Lie on ball, press dumbbells. Core engaged for stability.', 'Middle Chest', 'Triceps', 'Upper Abdominals', 'Stability Ball', 'Intermediate', 'Bodyweight'),
  ('Stability Ball Pike', 'Ab pike on ball', 'Feet on ball in plank. Pike hips up rolling ball in. Advanced core.', 'Upper Abdominals', 'Front Deltoids', 'Hip Flexors', 'Stability Ball', 'Advanced', 'Bodyweight'),
  ('Stability Ball Hamstring Curl', 'Lying leg curl on ball', 'Lie on back, feet on ball. Curl ball in toward glutes. Hamstring isolation.', 'Hamstrings', 'Glutes', 'Calves', 'Stability Ball', 'Intermediate', 'Bodyweight'),
  ('Stability Ball Wall Squat', 'Ball-assisted squat against wall', 'Ball behind back on wall. Squat down. Beginner-friendly squat variation.', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'Stability Ball', 'Beginner', 'Bodyweight'),
  ('Stability Ball Jackknife', 'Dynamic ab crunch', 'Plank with feet on ball. Crunch knees to chest. Core strength.', 'Upper Abdominals', 'Hip Flexors', 'Front Deltoids', 'Stability Ball', 'Advanced', 'Bodyweight'),
  ('TRX Chest Fly', 'Suspension trainer chest fly', 'Hold TRX handles, lean forward. Fly motion with body weight.', 'Middle Chest', 'Front Deltoids', 'Upper Abdominals', 'TRX', 'Intermediate', 'Bodyweight'),
  ('TRX Tricep Extension', 'Overhead extension with TRX', 'Face away from anchor. Lean forward, extend arms. Tricep isolation.', 'Triceps', 'Front Deltoids', 'Upper Abdominals', 'TRX', 'Intermediate', 'Bodyweight'),
  ('TRX Pike', 'Suspension trainer ab pike', 'Feet in straps, plank position. Pike hips up. Advanced core work.', 'Upper Abdominals', 'Front Deltoids', 'Hip Flexors', 'TRX', 'Advanced', 'Bodyweight'),
  ('TRX Bicep Curl', 'Suspension trainer curl', 'Hold handles, lean back. Curl body up. Bicep and core together.', 'Biceps', 'Upper Abdominals', 'Brachialis', 'TRX', 'Intermediate', 'Bodyweight'),
  ('TRX Single-Leg Squat', 'Assisted pistol squat', 'Hold TRX for balance. Single-leg squat. Progression to pistol squat.', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'TRX', 'Advanced', 'Bodyweight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- MISSING VARIATIONS & SPECIALTIES (20)
-- ========================================

INSERT INTO exercises (
  name, description, instructions,
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
)
SELECT * FROM (VALUES
  ('Smith Machine Upright Row', 'Guided upright row', 'Pull Smith bar up to chest level. Elbows high. Trap and shoulder work.', 'Side Deltoids', 'Trapezius', 'Biceps', 'Smith Machine', 'Intermediate', 'Machine'),
  ('Smith Machine Shrug', 'Guided bar shrug', 'Hold Smith bar, shrug shoulders up. Heavy loading for traps.', 'Trapezius', 'Upper Trapezius', 'Rhomboids', 'Smith Machine', 'Beginner', 'Machine'),
  ('Smith Machine Front Squat', 'Guided front squat', 'Bar across front delts. Upright torso squat on Smith machine.', 'Quadriceps', 'Upper Abdominals', 'Glutes', 'Smith Machine', 'Intermediate', 'Machine'),
  ('Smith Machine Romanian Deadlift', 'Guided RDL movement', 'Hinge at hips with Smith bar. Hamstring stretch and load.', 'Hamstrings', 'Glutes', 'Erector Spinae', 'Smith Machine', 'Beginner', 'Machine'),
  ('Reverse Hyper', 'Glute and hamstring machine', 'Lie face down, swing legs up. Decompresses spine, builds glutes.', 'Glutes', 'Hamstrings', 'Erector Spinae', 'Reverse Hyper Machine', 'Intermediate', 'Machine'),
  ('Nordic Hamstring Curl', 'Eccentric hamstring exercise', 'Kneel with ankles secured. Lower body forward slowly. Catch with hands.', 'Hamstrings', 'Glutes', 'Calves', 'Partner/Bench', 'Advanced', 'Bodyweight'),
  ('Seal Row', 'Chest-supported row prone', 'Lie face down on elevated bench. Row dumbbells or barbell. No momentum.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Bench', 'Intermediate', 'Free Weight'),
  ('Pendlay Row', 'Dead-stop barbell row', 'Row bar from floor each rep. Full stop between reps. Explosive pull.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Barbell', 'Advanced', 'Free Weight'),
  ('Yates Row', 'Underhand barbell row', 'Underhand grip, more upright torso. Targets lower lats and biceps.', 'Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Barbell', 'Intermediate', 'Free Weight'),
  ('Kroc Row', 'Heavy single-arm row', 'Heavy dumbbell row with controlled body english. High reps, muscle building.', 'Latissimus Dorsi', 'Biceps', 'Upper Abdominals', 'Dumbbell', 'Advanced', 'Free Weight'),
  ('Chest-Supported T-Bar Row', 'Prone T-bar row', 'Lie face down on angled pad. Row T-bar to chest. Removes lower back.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'T-Bar Machine', 'Intermediate', 'Machine'),
  ('Meadows Row', 'Landmine single-arm row', 'Stand perpendicular to landmine. Row bar to hip. Unique angle hits lats.', 'Latissimus Dorsi', 'Biceps', 'Obliques', 'Landmine', 'Intermediate', 'Free Weight'),
  ('Trap Bar Deadlift', 'Hex bar deadlift', 'Stand inside trap bar. Deadlift with neutral grip. More quad emphasis.', 'Quadriceps', 'Glutes', 'Hamstrings', 'Trap Bar', 'Intermediate', 'Free Weight'),
  ('Trap Bar Carry', 'Loaded carry with trap bar', 'Hold trap bar at sides. Walk maintaining posture. Farmer walk variation.', 'Trapezius', 'Forearms', 'Upper Abdominals', 'Trap Bar', 'Beginner', 'Free Weight'),
  ('Landmine Press', 'Angled barbell press', 'Press landmine bar overhead. Shoulder-friendly press angle.', 'Front Deltoids', 'Triceps', 'Upper Abdominals', 'Landmine', 'Intermediate', 'Free Weight'),
  ('Landmine Row', 'Two-hand landmine row', 'Straddle landmine, row with both hands. T-bar row alternative.', 'Latissimus Dorsi', 'Rhomboids', 'Rear Deltoids', 'Landmine', 'Intermediate', 'Free Weight'),
  ('Landmine Squat', 'Goblet squat with barbell', 'Hold end of landmine at chest. Squat. Upright torso emphasis.', 'Quadriceps', 'Glutes', 'Upper Abdominals', 'Landmine', 'Beginner', 'Free Weight'),
  ('Landmine Single-Leg RDL', 'Unilateral hinge movement', 'Hold landmine with both hands. Single-leg RDL. Balance and hamstring.', 'Hamstrings', 'Glutes', 'Upper Abdominals', 'Landmine', 'Intermediate', 'Free Weight'),
  ('Landmine Rotation', 'Anti-rotation core exercise', 'Hold landmine at chest. Rotate side to side. Core stability and power.', 'Obliques', 'Upper Abdominals', 'Front Deltoids', 'Landmine', 'Intermediate', 'Free Weight'),
  ('Reverse Grip Bench Press', 'Underhand bench press', 'Bench press with underhand grip. Upper chest and tricep emphasis.', 'Upper Chest', 'Triceps', 'Front Deltoids', 'Barbell', 'Advanced', 'Free Weight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- ========================================
-- PART 2 COMPLETE
-- ========================================
-- Total exercises inserted: Up to 100 (50 from part 1 + 50 from part 2)
-- Duplicates are automatically skipped
-- 
-- Breakdown:
-- - Hammer Strength: 15 machines
-- - HOIST: 10 machines  
-- - Barbell Variations: 15 advanced techniques
-- - Cable Variations: 15 total
-- - Functional/Athletic: 15 movements
-- - Stability Ball/TRX: 10 exercises
-- - Missing Variations: 20 specialized movements
