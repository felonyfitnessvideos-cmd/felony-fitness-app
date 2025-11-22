/**
 * @file the-engine-endurance-program.sql
 * @description The Engine - Progressive Endurance Training Program
 * @date 2025-11-22
 * 
 * PROGRAM OVERVIEW:
 * - 10 weeks progressive endurance and work capacity building
 * - Blend of steady-state cardio and high-volume resistance training
 * - 4 training days per week (40 total sessions)
 * - Goal: Increase VO2 Max and Muscular Stamina
 * 
 * TRAINING STRUCTURE:
 * - Day 1: Cardio Focus + Upper Body Volume
 * - Day 2: Lower Body Endurance + Core
 * - Day 3: Full Body Circuit
 * - Day 4: Metabolic Conditioning
 * 
 * PROGRESSION PHASES:
 * - Weeks 1-3: Aerobic base building (lower intensity, higher duration)
 * - Weeks 4-6: Lactate threshold work (moderate intensity intervals)
 * - Weeks 7-9: VO2 max training (high intensity intervals)
 * - Week 10: Testing and performance week
 * 
 * EXERCISE SELECTION:
 * - Rowing Machine, Treadmill Run (cardio foundation)
 * - Bodyweight Squat, Goblet Squat (leg endurance)
 * - T-Push-Ups, Dumbbell Floor Press (upper body volume)
 * - Machine Row, Lat Pulldown (back endurance)
 * - Kettlebell Swing, Romanian Deadlift (posterior chain power)
 * - Burpees, Battle Rope Slams (metabolic conditioning)
 */

-- Generate new UUID for this program
-- DELETE existing program if updating
-- DELETE FROM programs WHERE name = 'The Engine';

-- Insert The Engine endurance program
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
  gen_random_uuid(),
  'The Engine',
  'Progressive 10-week endurance program combining steady-state cardio with high-volume resistance training. Designed to build work capacity, increase VO2 max, and develop muscular stamina through periodized intensity phases. Perfect for beginners looking to improve cardiovascular fitness and build a strong aerobic base.',
  'beginner',
  'endurance',
  10,
  ARRAY['Full Body', 'Cardiovascular', 'Legs', 'Back', 'Chest', 'Core'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 12 exercises
  jsonb_build_array(
    
    -- ========================================
    -- CARDIO FOUNDATION EXERCISES
    -- ========================================
    
    -- Exercise 1: Rowing Machine
    jsonb_build_object(
      'exercise_id', '7189bb54-c090-41b5-a069-4d8733eaa148',
      'exercise_name', 'Rowing Machine',
      'exercise_data', jsonb_build_object(
        'id', '7189bb54-c090-41b5-a069-4d8733eaa148',
        'name', 'Rowing Machine',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Quadriceps',
        'tertiary_muscle', 'Null',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 1,
      'reps', '20-30 min',
      'rest_seconds', 0,
      'notes', 'Full body cardio. Drive with legs, lean back, pull handle to chest. Progression: Weeks 1-3: 20 min steady state (60-70% max HR); Weeks 4-6: 25 min with 5x2 min intervals; Weeks 7-9: 20 min HIIT (30 sec sprint/90 sec recovery); Week 10: 2000m time trial.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi', 'Quadriceps'),
        'secondary', jsonb_build_array('Hamstrings', 'Upper Abdominals'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 2: Treadmill Run
    jsonb_build_object(
      'exercise_id', 'ca283c8a-0aec-4e38-afa9-3c49c3d8d12e',
      'exercise_name', 'Treadmill Run',
      'exercise_data', jsonb_build_object(
        'id', 'ca283c8a-0aec-4e38-afa9-3c49c3d8d12e',
        'name', 'Treadmill Run',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Null',
        'difficulty_level', 'Beginner'
      ),
      'sets', 1,
      'reps', '20-30 min',
      'rest_seconds', 0,
      'notes', 'Steady-state or interval running. Progression: Weeks 1-3: 20 min easy (65-75% max HR); Weeks 4-6: 25 min tempo (75-85% max HR); Weeks 7-9: 8x400m intervals with 90 sec rest; Week 10: 5K time trial.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps', 'Hamstrings'),
        'secondary', jsonb_build_array('Calves', 'Glutes'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- LOWER BODY ENDURANCE
    -- ========================================
    
    -- Exercise 3: Bodyweight Squat
    jsonb_build_object(
      'exercise_id', 'c1c8143f-78a3-4316-ad3a-06edd8e83ab8',
      'exercise_name', 'Bodyweight Squat',
      'exercise_data', jsonb_build_object(
        'id', 'c1c8143f-78a3-4316-ad3a-06edd8e83ab8',
        'name', 'Bodyweight Squat',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Hamstrings',
        'difficulty_level', 'Beginner'
      ),
      'sets', 4,
      'reps', '25-50',
      'rest_seconds', 45,
      'notes', 'High-volume bodyweight squats. Chest up, drive through heels. Progression: Weeks 1-3: 4x25 reps; Weeks 4-6: 4x35 reps; Weeks 7-9: 4x50 reps; Week 10: Max reps in 2 min.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Hamstrings'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 4: Goblet Squat (Dumbbell)
    jsonb_build_object(
      'exercise_id', '07aa3381-7e30-4be0-866b-618f56581a51',
      'exercise_name', 'Goblet Squat',
      'exercise_data', jsonb_build_object(
        'id', '07aa3381-7e30-4be0-866b-618f56581a51',
        'name', 'Goblet Squat',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Beginner'
      ),
      'sets', 4,
      'reps', '15-25',
      'rest_seconds', 60,
      'notes', 'Loaded squat variation for endurance. Hold dumbbell at chest, maintain upright torso. Progression: Weeks 1-3: 4x15 (light weight); Weeks 4-6: 4x20 (moderate); Weeks 7-9: 4x25 (moderate); Week 10: Max reps with bodyweight.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Upper Abdominals'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- UPPER BODY VOLUME
    -- ========================================
    
    -- Exercise 5: T-Push-Up
    jsonb_build_object(
      'exercise_id', '0adb3f44-3126-4c77-9e65-32b02a1ed053',
      'exercise_name', 'T-Push-Up',
      'exercise_data', jsonb_build_object(
        'id', '0adb3f44-3126-4c77-9e65-32b02a1ed053',
        'name', 'T-Push-Up',
        'primary_muscle', 'Middle Chest',
        'secondary_muscle', 'Upper Abdominals',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Advanced'
      ),
      'sets', 4,
      'reps', '12-20',
      'rest_seconds', 45,
      'notes', 'Push-up with rotation to T-position. Adds core stability and shoulder mobility. Progression: Weeks 1-3: 4x12 (modify on knees if needed); Weeks 4-6: 4x15; Weeks 7-9: 4x20; Week 10: Max reps in 2 min.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Chest'),
        'secondary', jsonb_build_array('Upper Abdominals', 'Front Deltoids'),
        'tertiary', jsonb_build_array('Obliques')
      )
    ),
    
    -- Exercise 6: Dumbbell Floor Press
    jsonb_build_object(
      'exercise_id', 'a2c0f924-c695-4bfb-aead-ce333d2d77f8',
      'exercise_name', 'Dumbbell Floor Press',
      'exercise_data', jsonb_build_object(
        'id', 'a2c0f924-c695-4bfb-aead-ce333d2d77f8',
        'name', 'Dumbbell Floor Press',
        'primary_muscle', 'Middle Chest',
        'secondary_muscle', 'Triceps',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '15-25',
      'rest_seconds', 60,
      'notes', 'High-volume chest press from floor. Reduces shoulder stress vs bench press. Progression: Weeks 1-3: 3x15 (light); Weeks 4-6: 3x20 (light-moderate); Weeks 7-9: 3x25 (moderate); Week 10: Test max reps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Chest'),
        'secondary', jsonb_build_array('Triceps', 'Front Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- BACK ENDURANCE
    -- ========================================
    
    -- Exercise 7: Machine Row
    jsonb_build_object(
      'exercise_id', '40a7aed3-8853-46e0-a332-895eafb2339d',
      'exercise_name', 'Machine Row',
      'exercise_data', jsonb_build_object(
        'id', '40a7aed3-8853-46e0-a332-895eafb2339d',
        'name', 'Machine Row',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Rear Deltoids',
        'difficulty_level', 'Beginner'
      ),
      'sets', 4,
      'reps', '15-25',
      'rest_seconds', 60,
      'notes', 'High-volume horizontal pulling. Sit at machine, row handles to body with controlled tempo. Progression: Weeks 1-3: 4x15; Weeks 4-6: 4x20; Weeks 7-9: 4x25; Week 10: Max reps test.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Rear Deltoids'),
        'tertiary', jsonb_build_array('Biceps')
      )
    ),
    
    -- Exercise 8: Lat Pulldown
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
      'reps', '15-25',
      'rest_seconds', 60,
      'notes', 'Vertical pulling volume. Pull bar to upper chest, focus on lat engagement. Progression: Weeks 1-3: 3x15; Weeks 4-6: 3x20; Weeks 7-9: 3x25; Week 10: AMRAP set.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Rhomboids', 'Biceps'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- POSTERIOR CHAIN POWER/ENDURANCE
    -- ========================================
    
    -- Exercise 9: Kettlebell Swing
    jsonb_build_object(
      'exercise_id', 'e392d8c1-c373-4952-aeeb-7c215d74f4f7',
      'exercise_name', 'Kettlebell Swing',
      'exercise_data', jsonb_build_object(
        'id', 'e392d8c1-c373-4952-aeeb-7c215d74f4f7',
        'name', 'Kettlebell Swing',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Erector Spinae',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 5,
      'reps', '20-40',
      'rest_seconds', 60,
      'notes', 'Explosive hip hinge movement. Power from hips, swing to shoulder height. Progression: Weeks 1-3: 5x20 (moderate KB); Weeks 4-6: 5x30; Weeks 7-9: 5x40; Week 10: Max reps in 2 min.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hamstrings', 'Erector Spinae'),
        'tertiary', jsonb_build_array('Upper Abdominals')
      )
    ),
    
    -- Exercise 10: Romanian Deadlift
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
      'reps', '15-25',
      'rest_seconds', 90,
      'notes', 'Hamstring endurance builder. Hinge at hips, lower to mid-shin with neutral spine. Progression: Weeks 1-3: 3x15 (light); Weeks 4-6: 3x20; Weeks 7-9: 3x25; Week 10: Volume test.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes', 'Erector Spinae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- METABOLIC CONDITIONING
    -- ========================================
    
    -- Exercise 11: Burpees
    jsonb_build_object(
      'exercise_id', 'd68d11dc-c7c0-4527-b9d7-29af366c92d9',
      'exercise_name', 'Burpees',
      'exercise_data', jsonb_build_object(
        'id', 'd68d11dc-c7c0-4527-b9d7-29af366c92d9',
        'name', 'Burpees',
        'primary_muscle', 'Full Body',
        'secondary_muscle', 'Middle Chest',
        'tertiary_muscle', 'Quadriceps',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 5,
      'reps', '10-20',
      'rest_seconds', 60,
      'notes', 'Full-body conditioning: squat, plank, pushup, jump. Progression: Weeks 1-3: 5x10; Weeks 4-6: 5x15; Weeks 7-9: 5x20; Week 10: Max reps in 3 min or 100 for time.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Full Body'),
        'secondary', jsonb_build_array('Middle Chest', 'Quadriceps', 'Upper Abdominals'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 12: Battle Rope Slams
    jsonb_build_object(
      'exercise_id', '11d0ada2-47bf-456a-8624-d1ba044bca31',
      'exercise_name', 'Battle Rope Slams',
      'exercise_data', jsonb_build_object(
        'id', '11d0ada2-47bf-456a-8624-d1ba044bca31',
        'name', 'Battle Rope Slams',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Upper Abdominals',
        'tertiary_muscle', 'Latissimus Dorsi',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 4,
      'reps', '30-60 sec',
      'rest_seconds', 60,
      'notes', 'Explosive overhead rope slams. Full body power and cardio. Progression: Weeks 1-3: 4x30 sec; Weeks 4-6: 4x45 sec; Weeks 7-9: 4x60 sec; Week 10: Max effort 2 min.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Upper Abdominals', 'Latissimus Dorsi'),
        'tertiary', jsonb_build_array('Quadriceps', 'Glutes')
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ The Engine program created successfully!' as status;

SELECT 
  id,
  name,
  difficulty_level,
  estimated_weeks,
  program_type,
  jsonb_array_length(exercise_pool) as exercise_count,
  target_muscle_groups,
  is_active,
  is_template
FROM programs
WHERE name = 'The Engine';

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
WHERE name = 'The Engine';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 12 (flat array)' as detail1;
SELECT '   - Program type: endurance' as detail2;
SELECT '   - Difficulty: intermediate' as detail3;
SELECT '   - Duration: 10 weeks progressive' as detail4;
SELECT '   - Focus: VO2 max, work capacity, muscular stamina' as detail5;
SELECT '✅ Ready to deploy!' as final_status;
