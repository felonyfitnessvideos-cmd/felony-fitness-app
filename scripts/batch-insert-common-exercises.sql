/**
 * @file scripts/batch-insert-common-exercises.sql
 * @description Batch insert of 100+ common exercises across all muscle groups
 * @date 2025-11-17
 * 
 * SCHEMA COLUMNS (exercises table):
 * - name (string, required)
 * - description (string | null)
 * - instructions (string | null)
 * - primary_muscle (string | null)
 * - secondary_muscle (string | null)
 * - tertiary_muscle (string | null)
 * - equipment_needed (string | null)
 * - difficulty_level (string | null)
 * - exercise_type (string | null)
 * - video_url (string | null)
 * - thumbnail_url (string | null)
 * 
 * CATEGORIES COVERED (100 exercises):
 * - Chest: 15 exercises (barbell, dumbbell, machine, bodyweight)
 * - Back: 15 exercises (rows, pulldowns, deadlifts, pullups)
 * - Shoulders: 15 exercises (press, raises, rear delt)
 * - Legs: 20 exercises (quads, hamstrings, glutes, calves)
 * - Arms: 15 exercises (biceps, triceps)
 * - Core: 10 exercises (abs, obliques, lower back)
 * - Full Body: 10 exercises (compound movements)
 */

-- ========================================
-- CHEST EXERCISES (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Barbell Bench Press', 'Classic compound chest exercise', 'Lie on bench, lower bar to chest, press up explosively. Keep elbows at 45 degrees.', 'Chest', 'Triceps', 'Shoulders', 'Barbell', 'Intermediate', 'Compound'),
  ('Dumbbell Bench Press', 'Allows greater range of motion than barbell', 'Lie on bench with dumbbells at chest level. Press up and together. Control the descent.', 'Chest', 'Triceps', 'Shoulders', 'Dumbbell', 'Beginner', 'Compound'),
  ('Incline Barbell Press', 'Targets upper chest', 'Set bench to 30-45 degrees. Press bar from upper chest to lockout. Focus on upper pec contraction.', 'Chest', 'Shoulders', 'Triceps', 'Barbell', 'Intermediate', 'Compound'),
  ('Incline Dumbbell Press', 'Upper chest emphasis with greater ROM', 'Set bench to 30-45 degrees. Press dumbbells from chest level, rotate slightly inward at top.', 'Chest', 'Shoulders', 'Triceps', 'Dumbbell', 'Beginner', 'Compound'),
  ('Decline Barbell Press', 'Targets lower chest', 'Set bench to -15 degrees. Lower bar to lower chest, press to lockout. Squeeze at top.', 'Chest', 'Triceps', 'Shoulders', 'Barbell', 'Intermediate', 'Compound'),
  ('Dumbbell Flyes', 'Isolation exercise for chest stretch', 'Lie flat, arms extended. Lower dumbbells in arc with slight elbow bend. Feel stretch, contract at top.', 'Chest', NULL, 'Shoulders', 'Dumbbell', 'Beginner', 'Isolation'),
  ('Cable Flyes', 'Constant tension chest isolation', 'Stand between cables. Bring handles together in front of chest. Control the negative.', 'Chest', NULL, 'Shoulders', 'Cable', 'Beginner', 'Isolation'),
  ('Push-Ups', 'Bodyweight chest builder', 'Hands shoulder-width, lower chest to ground, press up. Keep core tight, full range of motion.', 'Chest', 'Triceps', 'Core', 'Bodyweight', 'Beginner', 'Compound'),
  ('Dips (Chest)', 'Advanced bodyweight chest exercise', 'Lean forward on dip bars. Lower until stretch in chest, press back up. Control the movement.', 'Chest', 'Triceps', 'Shoulders', 'Bodyweight', 'Advanced', 'Compound'),
  ('Machine Chest Press', 'Fixed path for safety', 'Sit with handles at chest level. Press forward to lockout. Control return to start.', 'Chest', 'Triceps', 'Shoulders', 'Machine', 'Beginner', 'Compound'),
  ('Pec Deck Flyes', 'Isolation with machine stability', 'Sit upright, arms on pads. Bring pads together in front of chest. Squeeze, slow return.', 'Chest', NULL, 'Shoulders', 'Machine', 'Beginner', 'Isolation'),
  ('Landmine Press', 'Single-arm chest and shoulder press', 'Stand with barbell in landmine. Press up and across body. Great for core stability.', 'Chest', 'Shoulders', 'Core', 'Barbell', 'Intermediate', 'Compound'),
  ('Dumbbell Pullover', 'Chest and lat stretch', 'Lie across bench. Hold dumbbell overhead, lower behind head. Pull back to start with chest.', 'Chest', 'Lats', 'Triceps', 'Dumbbell', 'Intermediate', 'Compound'),
  ('Incline Cable Flyes', 'Upper chest isolation', 'Set cables low. Incline bench 30 degrees. Bring cables up and together. Peak contraction.', 'Chest', NULL, 'Shoulders', 'Cable', 'Intermediate', 'Isolation'),
  ('Svend Press', 'Isometric chest squeeze', 'Hold plates together at chest. Press forward while squeezing plates. Slow and controlled.', 'Chest', 'Shoulders', NULL, 'Dumbbell', 'Beginner', 'Isolation');

-- ========================================
-- BACK EXERCISES (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Deadlift', 'King of back exercises', 'Feet hip-width, grip bar. Drive through heels, hips forward. Keep bar close, neutral spine.', 'Back', 'Glutes', 'Hamstrings', 'Barbell', 'Advanced', 'Compound'),
  ('Barbell Row', 'Mass builder for entire back', 'Hinge at hips, row bar to lower chest. Squeeze shoulder blades. Control the eccentric.', 'Back', 'Biceps', 'Rear Delts', 'Barbell', 'Intermediate', 'Compound'),
  ('Pull-Ups', 'Vertical pull bodyweight exercise', 'Hang from bar, pull chest to bar. Full extension at bottom. Focus on lat engagement.', 'Back', 'Biceps', 'Core', 'Bodyweight', 'Intermediate', 'Compound'),
  ('Lat Pulldown', 'Machine alternative to pull-ups', 'Sit at machine, pull bar to upper chest. Lean back slightly. Squeeze lats at bottom.', 'Back', 'Biceps', 'Rear Delts', 'Machine', 'Beginner', 'Compound'),
  ('T-Bar Row', 'Thick back builder', 'Straddle bar, hinge at hips. Row bar to chest. Keep back neutral, squeeze at top.', 'Back', 'Biceps', 'Rear Delts', 'Barbell', 'Intermediate', 'Compound'),
  ('Dumbbell Row', 'Unilateral back development', 'One knee on bench, row dumbbell to hip. Full stretch at bottom, squeeze at top.', 'Back', 'Biceps', 'Rear Delts', 'Dumbbell', 'Beginner', 'Compound'),
  ('Seated Cable Row', 'Horizontal pull with constant tension', 'Sit upright, pull handles to torso. Squeeze shoulder blades. Keep chest up.', 'Back', 'Biceps', 'Rear Delts', 'Cable', 'Beginner', 'Compound'),
  ('Chest-Supported Row', 'Isolated back work, no cheating', 'Lie on incline bench. Row dumbbells to sides. Remove lower back from equation.', 'Back', 'Biceps', 'Rear Delts', 'Dumbbell', 'Beginner', 'Compound'),
  ('Face Pulls', 'Rear delt and upper back', 'Pull rope to face, hands apart. External rotation at end. Great for posture.', 'Back', 'Rear Delts', 'Traps', 'Cable', 'Beginner', 'Isolation'),
  ('Rack Pulls', 'Partial deadlift for upper back', 'Bar on pins at knee height. Deadlift from elevated position. Focus on upper back squeeze.', 'Back', 'Traps', 'Glutes', 'Barbell', 'Intermediate', 'Compound'),
  ('Meadows Row', 'Unilateral landmine row', 'Stand perpendicular to landmine. Row bar to hip. Great stretch and contraction.', 'Back', 'Biceps', 'Core', 'Barbell', 'Intermediate', 'Compound'),
  ('Straight-Arm Pulldown', 'Lat isolation', 'Stand at cable, arms extended. Pull bar down to thighs. Keep arms straight, feel lats.', 'Back', NULL, 'Core', 'Cable', 'Beginner', 'Isolation'),
  ('Inverted Row', 'Bodyweight horizontal pull', 'Hang under bar, pull chest to bar. Keep body straight. Scale with bar height.', 'Back', 'Biceps', 'Core', 'Bodyweight', 'Beginner', 'Compound'),
  ('Kroc Row', 'Heavy dumbbell row with momentum', 'One hand on bench. Heavy dumbbell row with slight body english. Volume builder.', 'Back', 'Biceps', 'Core', 'Dumbbell', 'Advanced', 'Compound'),
  ('Machine Row (Hammer Strength)', 'Unilateral machine row', 'Sit at machine, pull handles to torso. Squeeze and hold. Control negative.', 'Back', 'Biceps', 'Rear Delts', 'Machine', 'Beginner', 'Compound');

-- ========================================
-- SHOULDER EXERCISES (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Overhead Press (Barbell)', 'Compound shoulder builder', 'Stand with bar at clavicles. Press overhead to lockout. Keep core tight, no arch.', 'Shoulders', 'Triceps', 'Upper Chest', 'Barbell', 'Intermediate', 'Compound'),
  ('Dumbbell Shoulder Press', 'Shoulder press with greater ROM', 'Sit or stand. Press dumbbells overhead. Neutral wrist position at top.', 'Shoulders', 'Triceps', 'Upper Chest', 'Dumbbell', 'Beginner', 'Compound'),
  ('Arnold Press', 'Dumbbell press with rotation', 'Start palms facing you. Press and rotate to palms forward. Hit all deltoid heads.', 'Shoulders', 'Triceps', 'Upper Chest', 'Dumbbell', 'Intermediate', 'Compound'),
  ('Lateral Raise', 'Side delt isolation', 'Arms at sides, raise dumbbells laterally to shoulder height. Control the descent.', 'Shoulders', NULL, NULL, 'Dumbbell', 'Beginner', 'Isolation'),
  ('Front Raise', 'Front delt isolation', 'Arms at sides, raise dumbbells forward to shoulder height. Alternate or both arms.', 'Shoulders', NULL, 'Upper Chest', 'Dumbbell', 'Beginner', 'Isolation'),
  ('Rear Delt Flyes', 'Rear shoulder isolation', 'Bend at hips. Raise dumbbells laterally with slight bend. Squeeze rear delts.', 'Shoulders', 'Back', NULL, 'Dumbbell', 'Beginner', 'Isolation'),
  ('Cable Lateral Raise', 'Constant tension side delt', 'Stand beside cable. Raise cable laterally. Better tension curve than dumbbells.', 'Shoulders', NULL, NULL, 'Cable', 'Beginner', 'Isolation'),
  ('Face Pulls (Shoulders)', 'Upper back and rear delts', 'Pull rope to face, hands apart at end. External rotation focus. Posture builder.', 'Shoulders', 'Back', 'Traps', 'Cable', 'Beginner', 'Isolation'),
  ('Upright Row', 'Trap and shoulder builder', 'Pull bar up to chest level. Elbows high. Careful with shoulder mobility.', 'Shoulders', 'Traps', 'Biceps', 'Barbell', 'Intermediate', 'Compound'),
  ('Reverse Pec Deck', 'Machine rear delt isolation', 'Sit facing machine. Pull handles back. Squeeze rear delts and upper back.', 'Shoulders', 'Back', NULL, 'Machine', 'Beginner', 'Isolation'),
  ('Pike Push-Ups', 'Bodyweight shoulder press', 'Hands on ground, hips high. Lower head to ground, press back up. Vertical pressing.', 'Shoulders', 'Triceps', 'Upper Chest', 'Bodyweight', 'Intermediate', 'Compound'),
  ('Single-Arm Landmine Press', 'Unilateral shoulder press', 'Stand with landmine bar. Press up and across. Core stability required.', 'Shoulders', 'Core', 'Triceps', 'Barbell', 'Intermediate', 'Compound'),
  ('Bradford Press', 'Press front and back of neck', 'Overhead press, lower behind neck, press up, lower to front. Continuous tension.', 'Shoulders', 'Triceps', 'Traps', 'Barbell', 'Advanced', 'Compound'),
  ('Machine Shoulder Press', 'Fixed path shoulder press', 'Sit at machine, press handles overhead. Good for beginners or burnout sets.', 'Shoulders', 'Triceps', 'Upper Chest', 'Machine', 'Beginner', 'Compound'),
  ('Y-Raise', 'Upper trap and shoulder isolation', 'Lie face down on incline. Raise arms in Y-shape. Focus on upper back and delts.', 'Shoulders', 'Traps', 'Back', 'Dumbbell', 'Beginner', 'Isolation');

-- ========================================
-- LEG EXERCISES (20)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Barbell Back Squat', 'King of leg exercises', 'Bar on upper back. Descend with control, drive through heels. Hit depth.', 'Quads', 'Glutes', 'Hamstrings', 'Barbell', 'Intermediate', 'Compound'),
  ('Front Squat', 'Quad-dominant squat variation', 'Bar on front delts. Upright torso. Descend, drive up through midfoot.', 'Quads', 'Core', 'Glutes', 'Barbell', 'Advanced', 'Compound'),
  ('Romanian Deadlift', 'Hamstring and glute builder', 'Slight knee bend. Hinge at hips, lower bar to shins. Drive hips forward.', 'Hamstrings', 'Glutes', 'Lower Back', 'Barbell', 'Intermediate', 'Compound'),
  ('Leg Press', 'Machine quad and glute work', 'Feet shoulder-width on platform. Lower with control, press to lockout.', 'Quads', 'Glutes', 'Hamstrings', 'Machine', 'Beginner', 'Compound'),
  ('Bulgarian Split Squat', 'Unilateral quad and glute builder', 'Rear foot elevated. Descend on front leg. Drive through heel to stand.', 'Quads', 'Glutes', 'Hamstrings', 'Dumbbell', 'Intermediate', 'Compound'),
  ('Walking Lunges', 'Dynamic leg builder', 'Step forward, lower back knee. Push off front leg to next step. Control and balance.', 'Quads', 'Glutes', 'Hamstrings', 'Dumbbell', 'Beginner', 'Compound'),
  ('Leg Extension', 'Quad isolation', 'Sit at machine. Extend legs to lockout. Squeeze quads. Control return.', 'Quads', NULL, NULL, 'Machine', 'Beginner', 'Isolation'),
  ('Leg Curl (Lying)', 'Hamstring isolation', 'Lie face down. Curl heels to glutes. Squeeze hamstrings. Slow negative.', 'Hamstrings', NULL, 'Calves', 'Machine', 'Beginner', 'Isolation'),
  ('Hip Thrust', 'Glute builder', 'Upper back on bench, bar on hips. Thrust hips up. Squeeze glutes at top.', 'Glutes', 'Hamstrings', 'Lower Back', 'Barbell', 'Beginner', 'Compound'),
  ('Goblet Squat', 'Beginner-friendly squat', 'Hold dumbbell at chest. Squat deep with upright torso. Great for learning pattern.', 'Quads', 'Glutes', 'Core', 'Dumbbell', 'Beginner', 'Compound'),
  ('Hack Squat', 'Machine quad emphasis', 'Stand on platform, shoulders under pads. Squat deep. Drive through heels.', 'Quads', 'Glutes', NULL, 'Machine', 'Intermediate', 'Compound'),
  ('Sumo Deadlift', 'Wide-stance deadlift', 'Wide stance, grip inside legs. Drive knees out, hips forward. Glute emphasis.', 'Glutes', 'Hamstrings', 'Adductors', 'Barbell', 'Intermediate', 'Compound'),
  ('Step-Ups', 'Unilateral leg builder', 'Step onto box with one leg. Drive through heel to stand. Controlled descent.', 'Quads', 'Glutes', 'Hamstrings', 'Dumbbell', 'Beginner', 'Compound'),
  ('Calf Raise (Standing)', 'Calf builder', 'Stand on platform edge. Rise onto toes. Full stretch at bottom, squeeze at top.', 'Calves', NULL, NULL, 'Machine', 'Beginner', 'Isolation'),
  ('Seated Calf Raise', 'Soleus-focused calf work', 'Sit with weight on knees. Rise onto toes. Great for lower calf development.', 'Calves', NULL, NULL, 'Machine', 'Beginner', 'Isolation'),
  ('Glute Bridge', 'Bodyweight glute activation', 'Lie on back, feet flat. Thrust hips up. Squeeze glutes at top. Control descent.', 'Glutes', 'Hamstrings', 'Core', 'Bodyweight', 'Beginner', 'Isolation'),
  ('Single-Leg Romanian Deadlift', 'Unilateral hamstring work', 'Stand on one leg. Hinge at hip, lower weight. Balance and control required.', 'Hamstrings', 'Glutes', 'Core', 'Dumbbell', 'Intermediate', 'Compound'),
  ('Sissy Squat', 'Advanced quad isolation', 'Lean back, knees forward. Lower until quads are stretched. Drive back up.', 'Quads', NULL, 'Core', 'Bodyweight', 'Advanced', 'Isolation'),
  ('Good Morning', 'Posterior chain builder', 'Bar on upper back. Hinge at hips with slight knee bend. Feel hamstring stretch.', 'Hamstrings', 'Lower Back', 'Glutes', 'Barbell', 'Intermediate', 'Compound'),
  ('Box Squat', 'Squat to box for depth cue', 'Squat to box, pause briefly, explode up. Teaches proper depth and power.', 'Quads', 'Glutes', 'Hamstrings', 'Barbell', 'Intermediate', 'Compound');

-- ========================================
-- ARM EXERCISES (15)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Barbell Curl', 'Classic bicep builder', 'Stand with bar. Curl to shoulders, squeeze biceps. Control descent. No swinging.', 'Biceps', NULL, 'Forearms', 'Barbell', 'Beginner', 'Isolation'),
  ('Dumbbell Curl', 'Unilateral bicep work', 'Arms at sides. Curl dumbbells alternating or together. Supinate at top.', 'Biceps', NULL, 'Forearms', 'Dumbbell', 'Beginner', 'Isolation'),
  ('Hammer Curl', 'Bicep and brachialis', 'Neutral grip curls. Develops thickness. Great for forearms too.', 'Biceps', 'Forearms', NULL, 'Dumbbell', 'Beginner', 'Isolation'),
  ('Preacher Curl', 'Isolated bicep work', 'Arms on pad. Curl bar or dumbbells. Removes momentum. Full stretch.', 'Biceps', NULL, NULL, 'Barbell', 'Beginner', 'Isolation'),
  ('Cable Curl', 'Constant tension bicep work', 'Stand at cable. Curl bar to shoulders. Squeeze. Slow negative.', 'Biceps', NULL, 'Forearms', 'Cable', 'Beginner', 'Isolation'),
  ('Close-Grip Bench Press', 'Tricep mass builder', 'Hands shoulder-width on bar. Press focusing on triceps. Keep elbows tucked.', 'Triceps', 'Chest', 'Shoulders', 'Barbell', 'Intermediate', 'Compound'),
  ('Tricep Dips', 'Bodyweight tricep builder', 'Upright torso on bars. Lower until upper arms parallel. Press to lockout.', 'Triceps', 'Chest', 'Shoulders', 'Bodyweight', 'Intermediate', 'Compound'),
  ('Overhead Tricep Extension', 'Long head tricep focus', 'Hold dumbbell overhead. Lower behind head. Extend to stretch. Elbows in.', 'Triceps', NULL, 'Shoulders', 'Dumbbell', 'Beginner', 'Isolation'),
  ('Tricep Pushdown', 'Cable tricep isolation', 'Stand at cable. Push bar or rope down. Lock elbows at sides. Full contraction.', 'Triceps', NULL, NULL, 'Cable', 'Beginner', 'Isolation'),
  ('Skull Crusher', 'Tricep mass builder', 'Lie on bench. Lower bar to forehead. Extend to lockout. Keep elbows in.', 'Triceps', NULL, 'Shoulders', 'Barbell', 'Intermediate', 'Isolation'),
  ('Concentration Curl', 'Peak contraction bicep work', 'Sit, elbow on inner thigh. Curl with focus on squeeze. Mind-muscle connection.', 'Biceps', NULL, NULL, 'Dumbbell', 'Beginner', 'Isolation'),
  ('Spider Curl', 'Strict bicep isolation', 'Chest on incline bench. Arms hanging. Curl with no momentum. Peak contraction.', 'Biceps', NULL, NULL, 'Barbell', 'Intermediate', 'Isolation'),
  ('Rope Tricep Pushdown', 'Tricep lateral head focus', 'Cable with rope. Push down, spread rope at bottom. Full contraction.', 'Triceps', NULL, NULL, 'Cable', 'Beginner', 'Isolation'),
  ('Zottman Curl', 'Bicep and forearm builder', 'Curl up supinated, rotate at top, lower pronated. Great for forearms.', 'Biceps', 'Forearms', NULL, 'Dumbbell', 'Intermediate', 'Isolation'),
  ('Diamond Push-Ups', 'Bodyweight tricep isolation', 'Hands form diamond shape. Lower chest to hands. Press up. Great tricep burn.', 'Triceps', 'Chest', 'Shoulders', 'Bodyweight', 'Intermediate', 'Compound');

-- ========================================
-- CORE EXERCISES (10)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Plank', 'Isometric core stability', 'Forearms and toes on ground. Body straight. Hold position. Engage entire core.', 'Core', NULL, 'Shoulders', 'Bodyweight', 'Beginner', 'Isolation'),
  ('Hanging Leg Raise', 'Lower ab focus', 'Hang from bar. Raise legs to parallel or higher. Control descent. No swinging.', 'Core', 'Hip Flexors', NULL, 'Bodyweight', 'Advanced', 'Isolation'),
  ('Cable Crunch', 'Weighted ab work', 'Kneel at cable. Crunch down pulling cable. Squeeze abs. Control return.', 'Core', NULL, NULL, 'Cable', 'Beginner', 'Isolation'),
  ('Russian Twist', 'Oblique rotation', 'Sit with feet elevated. Rotate torso side to side. Hold weight for intensity.', 'Core', 'Obliques', NULL, 'Dumbbell', 'Beginner', 'Isolation'),
  ('Ab Wheel Rollout', 'Advanced core builder', 'Kneel with wheel. Roll forward extending body. Pull back with abs. Very challenging.', 'Core', 'Lats', 'Shoulders', 'Bodyweight', 'Advanced', 'Compound'),
  ('Bicycle Crunches', 'Dynamic ab and oblique work', 'Lie on back. Bring opposite elbow to knee. Continuous alternating motion.', 'Core', 'Obliques', NULL, 'Bodyweight', 'Beginner', 'Isolation'),
  ('Side Plank', 'Oblique and lateral core', 'Lie on side, forearm down. Lift hips off ground. Hold straight line. Great for obliques.', 'Core', 'Obliques', 'Shoulders', 'Bodyweight', 'Beginner', 'Isolation'),
  ('Pallof Press', 'Anti-rotation core work', 'Stand perpendicular to cable. Press forward resisting rotation. Core stability.', 'Core', 'Obliques', NULL, 'Cable', 'Intermediate', 'Isolation'),
  ('Mountain Climbers', 'Dynamic core and cardio', 'Plank position. Drive knees to chest alternating. Keep hips down. Continuous motion.', 'Core', 'Shoulders', 'Quads', 'Bodyweight', 'Beginner', 'Compound'),
  ('Dead Bug', 'Core stability and coordination', 'Lie on back. Opposite arm and leg extend. Keep lower back flat. Controlled movement.', 'Core', NULL, NULL, 'Bodyweight', 'Beginner', 'Isolation');

-- ========================================
-- FULL BODY / COMPOUND EXERCISES (10)
-- ========================================

INSERT INTO exercises (
  name, description, instructions, 
  primary_muscle, secondary_muscle, tertiary_muscle,
  equipment_needed, difficulty_level, exercise_type
) VALUES
  ('Clean and Press', 'Olympic lift variation', 'Clean bar to shoulders, press overhead. Explosive hip drive. Full body power.', 'Shoulders', 'Back', 'Legs', 'Barbell', 'Advanced', 'Compound'),
  ('Burpee', 'Full body conditioning', 'Drop to plank, push-up, jump feet to hands, jump up. Continuous motion. Cardio and strength.', 'Full Body', 'Core', 'Legs', 'Bodyweight', 'Intermediate', 'Compound'),
  ('Thruster', 'Front squat to overhead press', 'Front squat, drive up, press overhead in one motion. Full body burner.', 'Legs', 'Shoulders', 'Core', 'Barbell', 'Intermediate', 'Compound'),
  ('Man Maker', 'Dumbbell complex exercise', 'Push-up with dumbbells, row each arm, clean to squat, press overhead. Complete package.', 'Full Body', 'Core', 'Back', 'Dumbbell', 'Advanced', 'Compound'),
  ('Kettlebell Swing', 'Hip hinge power exercise', 'Explosive hip thrust. Swing kettlebell to shoulder height. Power from hips not arms.', 'Glutes', 'Hamstrings', 'Core', 'Kettlebell', 'Intermediate', 'Compound'),
  ('Turkish Get-Up', 'Complex stability exercise', 'Lie with weight overhead. Stand up through series of positions. Reverse to lying. Total body control.', 'Shoulders', 'Core', 'Legs', 'Kettlebell', 'Advanced', 'Compound'),
  ('Battle Ropes', 'Wave ropes for full body', 'Hold rope ends. Create waves with alternating or simultaneous motion. Cardio and upper body.', 'Shoulders', 'Core', 'Back', 'Battle Rope', 'Intermediate', 'Compound'),
  ('Sled Push', 'Push loaded sled', 'Low position, drive legs, push sled. Explosive leg drive. Great conditioning.', 'Legs', 'Core', 'Shoulders', 'Sled', 'Intermediate', 'Compound'),
  ('Farmer''s Walk', 'Loaded carry exercise', 'Hold heavy weights at sides. Walk with upright posture. Grip, core, and trap work.', 'Traps', 'Forearms', 'Core', 'Dumbbell', 'Beginner', 'Compound'),
  ('Box Jump', 'Explosive plyometric', 'Jump onto box from standing. Land softly. Step down. Builds power and explosiveness.', 'Legs', 'Glutes', 'Core', 'Bodyweight', 'Intermediate', 'Compound');

-- ========================================
-- SUMMARY
-- ========================================
-- Total exercises inserted: 100
-- Coverage: All major muscle groups and equipment types
-- Difficulty levels: Beginner through Advanced
-- Mix of compound and isolation movements
-- Ready for program building and routine creation
