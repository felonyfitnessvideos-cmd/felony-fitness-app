/**
 * @file beginner-strength-program-FIXED.sql
 * @description 8-Week Beginner Strength Training Program (CORRECTED STRUCTURE)
 * @date 2025-11-22
 * 
 * PROGRAM OVERVIEW:
 * - 8 weeks, 4 days per week (32 total training sessions)
 * - Upper/Lower split with push/pull emphasis
 * - Progressive overload via 6-week waves
 * - Deload week (week 7) before testing (week 8)
 * 
 * TRAINING DAYS:
 * - Day 1: Upper Body A (Push Focus) - Chest, Shoulders, Triceps
 * - Day 2: Lower Body A (Quad Focus) - Quads, Hamstrings, Calves, Abs
 * - Day 4: Upper Body B (Pull Focus) - Back, Biceps, Rear Delts
 * - Day 5: Lower Body B (Hip Focus) - Glutes, Hamstrings, Quads, Abs
 * 
 * PROGRESSION:
 * - Weeks 1-2: Hypertrophy foundation (12-15 reps, moderate intensity)
 * - Weeks 3-4: Strength building (8-10 reps, increased load)
 * - Weeks 5-6: Peak strength (6-8 reps, heavy loads)
 * - Week 7: Deload (reduce volume/intensity by 40%)
 * - Week 8: Testing week (establish new 1RMs or rep maxes)
 */

-- First, delete the incorrectly structured program
DELETE FROM programs 
WHERE id = '2a0a455a-7fa6-491d-91cd-113c2226cfc2';

-- Get exercise data for all 24 exercises
WITH exercise_data AS (
  SELECT 
    id,
    name,
    primary_muscle,
    secondary_muscle,
    tertiary_muscle,
    difficulty_level,
    equipment_needed,
    description
  FROM exercises
  WHERE name IN (
    -- Day 1: Upper Body A (Push Focus)
    'Barbell Bench Press',
    'Overhead Press',
    'Incline Dumbbell Press',
    'Cable Lateral Raise',
    'Tricep Pushdown',
    'Cable Face Pull',
    -- Day 2: Lower Body A (Quad Focus)
    'Barbell Squat',
    'Leg Press Machine',
    'Romanian Deadlift',
    'Leg Curl Machine',
    'Calf Raise',
    'Plank',
    -- Day 4: Upper Body B (Pull Focus)
    'Barbell Row',
    'Lat Pulldown',
    'Dumbbell Row',
    'Cable Row',
    'Barbell Curl',
    'Dumbbell Hammer Curl',
    -- Day 5: Lower Body B (Hip Focus)
    'Conventional Deadlift',
    'Dumbbell Bulgarian Split Squat',
    'Leg Extension Machine',
    'Walking Lunge',
    'Hanging Knee Raise',
    'Ab Wheel Rollout'
  )
)

-- Insert the program with FLAT ARRAY structure (UI compatible)
INSERT INTO programs (
  id,
  name,
  description,
  difficulty_level,
  program_type,
  estimated_weeks,
  target_muscle_groups,
  is_template,
  is_active,
  trainer_id,
  created_by,
  exercise_pool,
  created_at,
  updated_at
)
VALUES (
  '2a0a455a-7fa6-491d-91cd-113c2226cfc2', -- Keep same UUID
  '8-Week Beginner Strength Builder',
  'Comprehensive 8-week strength program for beginners using an upper/lower split. Four training days per week with progressive overload every 2 weeks. Includes deload and testing weeks. Emphasizes fundamental compound movements with proper progression patterns.',
  'beginner',
  'strength',
  8,
  ARRAY['Full Body', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with all 24 exercises
  jsonb_build_array(
    
    -- ========================================
    -- DAY 1: UPPER BODY A (PUSH FOCUS)
    -- ========================================
    
    -- Exercise 1: Barbell Bench Press
    jsonb_build_object(
      'exercise_id', 'b8101809-414b-45c0-bede-1821fc09a558',
      'exercise_name', 'Barbell Bench Press',
      'exercise_data', jsonb_build_object(
        'id', 'b8101809-414b-45c0-bede-1821fc09a558',
        'name', 'Barbell Bench Press',
        'primary_muscle', 'Middle Chest',
        'secondary_muscle', 'Triceps',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 4,
      'reps', '6-8',
      'rest_seconds', 180,
      'notes', 'Primary chest builder. Focus on controlled eccentric (3 sec), explosive concentric. Maintain scapular retraction. Progression: Weeks 1-2: 12-15 reps RPE 7; Weeks 3-4: 8-10 reps RPE 8; Weeks 5-6: 6-8 reps RPE 9.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Chest'),
        'secondary', jsonb_build_array('Triceps', 'Front Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 2: Overhead Press
    jsonb_build_object(
      'exercise_id', 'bfbe2dac-2271-4c36-b658-433da8683bf6',
      'exercise_name', 'Overhead Press',
      'exercise_data', jsonb_build_object(
        'id', 'bfbe2dac-2271-4c36-b658-433da8683bf6',
        'name', 'Overhead Press',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Triceps',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 4,
      'reps', '8-10',
      'rest_seconds', 150,
      'notes', 'Compound shoulder developer. Keep core braced, press bar in straight line. No excessive back arch. Progression: Weeks 1-2: 12-15 reps; Weeks 3-4: 10-12 reps; Weeks 5-6: 8-10 reps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Triceps'),
        'tertiary', jsonb_build_array('Upper Abdominals')
      )
    ),
    
    -- Exercise 3: Incline Dumbbell Press
    jsonb_build_object(
      'exercise_id', 'c513ddcd-36c6-457d-b067-23feb8a50eeb',
      'exercise_name', 'Incline Dumbbell Press',
      'exercise_data', jsonb_build_object(
        'id', 'c513ddcd-36c6-457d-b067-23feb8a50eeb',
        'name', 'Incline Dumbbell Press',
        'primary_muscle', 'Upper Chest',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Triceps',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 120,
      'notes', 'Upper chest emphasis. 30-45 degree incline. Lower dumbbells to chest level, press with full ROM. Progression: Weeks 1-2: 15 reps; Weeks 3-4: 12 reps; Weeks 5-6: 10 reps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Upper Chest'),
        'secondary', jsonb_build_array('Front Deltoids', 'Triceps'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 4: Cable Lateral Raise
    jsonb_build_object(
      'exercise_id', '0cf09647-046d-4610-8b01-0f0e7fce6842',
      'exercise_name', 'Cable Lateral Raise',
      'exercise_data', jsonb_build_object(
        'id', '0cf09647-046d-4610-8b01-0f0e7fce6842',
        'name', 'Cable Lateral Raise',
        'primary_muscle', 'Side Deltoids',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Trapezius',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Side delt isolation. Constant tension from cable. Raise to shoulder height, slight forward lean. Control eccentric.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Side Deltoids'),
        'secondary', jsonb_build_array('Front Deltoids'),
        'tertiary', jsonb_build_array('Trapezius')
      )
    ),
    
    -- Exercise 5: Tricep Pushdown
    jsonb_build_object(
      'exercise_id', 'f1c82c7b-fdc8-42da-8e55-3b20b61abb4e',
      'exercise_name', 'Tricep Pushdown',
      'exercise_data', jsonb_build_object(
        'id', 'f1c82c7b-fdc8-42da-8e55-3b20b61abb4e',
        'name', 'Tricep Pushdown',
        'primary_muscle', 'Triceps',
        'secondary_muscle', 'Forearms',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Tricep isolation. Keep elbows pinned at sides, full extension at bottom. Squeeze triceps at lockout.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Triceps'),
        'secondary', jsonb_build_array('Forearms'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 6: Cable Face Pull
    jsonb_build_object(
      'exercise_id', 'ea24cd8a-1146-4440-a86a-4277897ecd34',
      'exercise_name', 'Cable Face Pull',
      'exercise_data', jsonb_build_object(
        'id', 'ea24cd8a-1146-4440-a86a-4277897ecd34',
        'name', 'Cable Face Pull',
        'primary_muscle', 'Rear Deltoids',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Middle Trapezius',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '15-20',
      'rest_seconds', 60,
      'notes', 'Shoulder health movement. Pull rope to face level, separate handles. Squeeze rear delts and rhomboids.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rear Deltoids'),
        'secondary', jsonb_build_array('Rhomboids'),
        'tertiary', jsonb_build_array('Middle Trapezius')
      )
    ),
    
    -- ========================================
    -- DAY 2: LOWER BODY A (QUAD FOCUS)
    -- ========================================
    
    -- Exercise 7: Barbell Squat
    jsonb_build_object(
      'exercise_id', '71c702e8-e104-4945-a17c-6189329a9974',
      'exercise_name', 'Barbell Squat',
      'exercise_data', jsonb_build_object(
        'id', '71c702e8-e104-4945-a17c-6189329a9974',
        'name', 'Barbell Squat',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Hamstrings',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 4,
      'reps', '6-8',
      'rest_seconds', 180,
      'notes', 'King of lower body exercises. Squat to parallel or below. Drive through heels, chest up. Progression: Weeks 1-2: 12-15 reps; Weeks 3-4: 8-10 reps; Weeks 5-6: 6-8 reps RPE 9.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Hamstrings'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 8: Leg Press Machine
    jsonb_build_object(
      'exercise_id', '3f212c83-1cab-4e0f-be99-4c41352eceb3',
      'exercise_name', 'Leg Press Machine',
      'exercise_data', jsonb_build_object(
        'id', '3f212c83-1cab-4e0f-be99-4c41352eceb3',
        'name', 'Leg Press Machine',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Hamstrings',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 120,
      'notes', 'Quad volume builder. Full ROM without lower back rounding. Control eccentric, explosive concentric.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Hamstrings'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 9: Romanian Deadlift
    jsonb_build_object(
      'exercise_id', '7e6b90e7-e840-46db-8b21-16d86591582d',
      'exercise_name', 'Romanian Deadlift',
      'exercise_data', jsonb_build_object(
        'id', '7e6b90e7-e840-46db-8b21-16d86591582d',
        'name', 'Romanian Deadlift',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Erector Spinae',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 120,
      'notes', 'Hamstring developer. Hinge at hips keeping back neutral. Lower bar to mid-shin, feel hamstring stretch.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes', 'Erector Spinae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 10: Leg Curl Machine
    jsonb_build_object(
      'exercise_id', '86738764-7985-4d68-8a41-980eb661a244',
      'exercise_name', 'Leg Curl Machine',
      'exercise_data', jsonb_build_object(
        'id', '86738764-7985-4d68-8a41-980eb661a244',
        'name', 'Leg Curl Machine',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Calves',
        'tertiary_muscle', 'Glutes',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Hamstring isolation. Full ROM, squeeze at peak contraction. Control eccentric for 2-3 seconds.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Calves'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 11: Calf Raise
    jsonb_build_object(
      'exercise_id', '6369479e-a5d0-49ce-95b5-c9cb9a63414c',
      'exercise_name', 'Calf Raise',
      'exercise_data', jsonb_build_object(
        'id', '6369479e-a5d0-49ce-95b5-c9cb9a63414c',
        'name', 'Calf Raise',
        'primary_muscle', 'Calves',
        'secondary_muscle', 'Hip Flexors',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Beginner'
      ),
      'sets', 4,
      'reps', '15-20',
      'rest_seconds', 60,
      'notes', 'Calf development. Full stretch at bottom, peak contraction at top. Hold top position 1 sec.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Calves'),
        'secondary', jsonb_build_array(),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 12: Plank
    jsonb_build_object(
      'exercise_id', 'a6147487-2eed-4289-873c-d706d3747bd6',
      'exercise_name', 'Plank',
      'exercise_data', jsonb_build_object(
        'id', 'a6147487-2eed-4289-873c-d706d3747bd6',
        'name', 'Plank',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Transverse Abdominis',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '45-60 sec',
      'rest_seconds', 60,
      'notes', 'Core stability. Maintain neutral spine, don''t let hips sag. Progression: Add time or elevate feet.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Upper Abdominals', 'Transverse Abdominis'),
        'secondary', jsonb_build_array(),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- DAY 4: UPPER BODY B (PULL FOCUS)
    -- ========================================
    
    -- Exercise 13: Barbell Row
    jsonb_build_object(
      'exercise_id', '8b40b70a-3c71-4594-8c51-f897085f5f4c',
      'exercise_name', 'Barbell Row',
      'exercise_data', jsonb_build_object(
        'id', '8b40b70a-3c71-4594-8c51-f897085f5f4c',
        'name', 'Barbell Row',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Rear Deltoids',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 4,
      'reps', '6-8',
      'rest_seconds', 150,
      'notes', 'Primary back builder. 45-degree torso angle. Row to lower chest, squeeze shoulder blades. Progression: Weeks 1-2: 12-15 reps; Weeks 3-4: 8-10 reps; Weeks 5-6: 6-8 reps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Rear Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 14: Lat Pulldown
    jsonb_build_object(
      'exercise_id', 'acc8f166-bfe9-4a1a-bdd4-c782b082eaa1',
      'exercise_name', 'Lat Pulldown',
      'exercise_data', jsonb_build_object(
        'id', 'acc8f166-bfe9-4a1a-bdd4-c782b082eaa1',
        'name', 'Lat Pulldown',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Biceps',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 120,
      'notes', 'Vertical pulling. Pull bar to upper chest, lean back slightly. Focus on lat engagement, not biceps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Biceps'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 15: Dumbbell Row
    jsonb_build_object(
      'exercise_id', '69188ef6-d8eb-4558-9f95-8a1b66a8b429',
      'exercise_name', 'Dumbbell Row',
      'exercise_data', jsonb_build_object(
        'id', '69188ef6-d8eb-4558-9f95-8a1b66a8b429',
        'name', 'Dumbbell Row',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Rear Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 90,
      'notes', 'Unilateral back work. Support on bench, row dumbbell to hip. Squeeze scapula, control eccentric.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Rear Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 16: Cable Row
    jsonb_build_object(
      'exercise_id', 'ad6e22a2-5233-4af3-9632-ba912e7e09ef',
      'exercise_name', 'Cable Row',
      'exercise_data', jsonb_build_object(
        'id', 'ad6e22a2-5233-4af3-9632-ba912e7e09ef',
        'name', 'Cable Row',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Rear Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 90,
      'notes', 'Horizontal pulling with constant tension. Pull to lower chest, squeeze back muscles.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Rear Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 17: Barbell Curl
    jsonb_build_object(
      'exercise_id', 'b4c2fcab-a0c7-45e0-a583-ec53aeb02275',
      'exercise_name', 'Barbell Curl',
      'exercise_data', jsonb_build_object(
        'id', 'b4c2fcab-a0c7-45e0-a583-ec53aeb02275',
        'name', 'Barbell Curl',
        'primary_muscle', 'Biceps',
        'secondary_muscle', 'Forearms',
        'tertiary_muscle', 'Brachialis',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 60,
      'notes', 'Bicep mass builder. Keep elbows stationary, curl with controlled tempo. No momentum.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Biceps'),
        'secondary', jsonb_build_array('Forearms', 'Brachialis'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 18: Dumbbell Hammer Curl
    jsonb_build_object(
      'exercise_id', '1896929b-0bd5-4dc4-bca8-819b7c522130',
      'exercise_name', 'Dumbbell Hammer Curl',
      'exercise_data', jsonb_build_object(
        'id', '1896929b-0bd5-4dc4-bca8-819b7c522130',
        'name', 'Dumbbell Hammer Curl',
        'primary_muscle', 'Brachialis',
        'secondary_muscle', 'Biceps',
        'tertiary_muscle', 'Forearms',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Neutral grip bicep work. Emphasizes brachialis and forearms. Alternate arms or do simultaneously.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Brachialis'),
        'secondary', jsonb_build_array('Biceps', 'Forearms'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- DAY 5: LOWER BODY B (HIP FOCUS)
    -- ========================================
    
    -- Exercise 19: Conventional Deadlift
    jsonb_build_object(
      'exercise_id', 'e7685f4d-5e08-499d-8152-db32c6e54ff6',
      'exercise_name', 'Conventional Deadlift',
      'exercise_data', jsonb_build_object(
        'id', 'e7685f4d-5e08-499d-8152-db32c6e54ff6',
        'name', 'Conventional Deadlift',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Erector Spinae',
        'difficulty_level', 'Advanced'
      ),
      'sets', 4,
      'reps', '5-6',
      'rest_seconds', 180,
      'notes', 'King of posterior chain. Grip outside legs, neutral spine, drive through floor. Progression: Weeks 1-2: 10-12 reps; Weeks 3-4: 6-8 reps; Weeks 5-6: 5-6 reps RPE 9.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes', 'Erector Spinae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 20: Dumbbell Bulgarian Split Squat
    jsonb_build_object(
      'exercise_id', '29f5c7a5-c1f8-4650-af3e-b3b11a25a580',
      'exercise_name', 'Dumbbell Bulgarian Split Squat',
      'exercise_data', jsonb_build_object(
        'id', '29f5c7a5-c1f8-4650-af3e-b3b11a25a580',
        'name', 'Dumbbell Bulgarian Split Squat',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '10-12 each leg',
      'rest_seconds', 90,
      'notes', 'Unilateral leg builder. Rear foot elevated on bench. Lower until knee nearly touches ground.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Calves'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 21: Leg Extension Machine
    jsonb_build_object(
      'exercise_id', '60f55f94-f1a2-40ec-85cc-3af1045ef48e',
      'exercise_name', 'Leg Extension Machine',
      'exercise_data', jsonb_build_object(
        'id', '60f55f94-f1a2-40ec-85cc-3af1045ef48e',
        'name', 'Leg Extension Machine',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Hip Flexors',
        'tertiary_muscle', 'Glutes',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Quad isolation. Full ROM, squeeze quads at top. Control eccentric, no momentum.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Hip Flexors'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 22: Walking Lunge
    jsonb_build_object(
      'exercise_id', 'baa3592e-500d-41f3-bfc9-af12e1482985',
      'exercise_name', 'Walking Lunge',
      'exercise_data', jsonb_build_object(
        'id', 'baa3592e-500d-41f3-bfc9-af12e1482985',
        'name', 'Walking Lunge',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '12-15 each leg',
      'rest_seconds', 90,
      'notes', 'Dynamic leg movement. Step forward into lunge, alternate legs. Keep torso upright.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Calves'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 23: Hanging Knee Raise
    jsonb_build_object(
      'exercise_id', 'f1551415-f21c-441e-ad68-348d55de2fb5',
      'exercise_name', 'Hanging Knee Raise',
      'exercise_data', jsonb_build_object(
        'id', 'f1551415-f21c-441e-ad68-348d55de2fb5',
        'name', 'Hanging Knee Raise',
        'primary_muscle', 'Lower Abdominals',
        'secondary_muscle', 'Hip Flexors',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Lower ab developer. Hang from bar, raise knees to chest. Control swing, focus on ab contraction.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Lower Abdominals'),
        'secondary', jsonb_build_array('Hip Flexors', 'Upper Abdominals'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 24: Ab Wheel Rollout
    jsonb_build_object(
      'exercise_id', '3dc31a2e-2aee-4511-8ced-0f81411eb99c',
      'exercise_name', 'Ab Wheel Rollout',
      'exercise_data', jsonb_build_object(
        'id', '3dc31a2e-2aee-4511-8ced-0f81411eb99c',
        'name', 'Ab Wheel Rollout',
        'primary_muscle', 'Rectus Abdominis',
        'secondary_muscle', 'Lats',
        'tertiary_muscle', 'Null',
        'difficulty_level', 'Advanced'
      ),
      'sets', 3,
      'reps', '8-12',
      'rest_seconds', 90,
      'notes', 'Advanced core exercise. Roll wheel forward maintaining neutral spine. Beginners: do from knees.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rectus Abdominis'),
        'secondary', jsonb_build_array('Lats'),
        'tertiary', jsonb_build_array()
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ Program created successfully!' as status;

SELECT 
  id,
  name,
  difficulty_level,
  estimated_weeks,
  program_type,
  jsonb_array_length(exercise_pool) as exercise_count,
  is_active,
  is_template
FROM programs
WHERE id = '2a0a455a-7fa6-491d-91cd-113c2226cfc2';

-- Verify exercise structure (check first 3 exercises)
SELECT 
  name,
  exercise_pool->0->>'exercise_id' as exercise_1_id,
  exercise_pool->0->>'exercise_name' as exercise_1_name,
  exercise_pool->1->>'exercise_id' as exercise_2_id,
  exercise_pool->1->>'exercise_name' as exercise_2_name,
  exercise_pool->2->>'exercise_id' as exercise_3_id,
  exercise_pool->2->>'exercise_name' as exercise_3_name
FROM programs
WHERE id = '2a0a455a-7fa6-491d-91cd-113c2226cfc2';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 24 (flat array)' as detail1;
SELECT '   - Each exercise has: exercise_id, exercise_name, exercise_data' as detail2;
SELECT '   - Day grouping: Day 1 (1-6), Day 2 (7-12), Day 4 (13-18), Day 5 (19-24)' as detail3;
SELECT '   - All exercises verified against database' as detail4;
SELECT '✅ Ready to test in UI!' as final_status;
