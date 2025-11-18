/**
 * @file create-crossfit-circuit-program.sql
 * @description Create an 8-week Progressive CrossFit-Style Circuit Training Program
 * @date 2025-11-17
 * 
 * PROGRAM OVERVIEW:
 * - 8 weeks, 2x per week (16 total sessions)
 * - Circuit format: 10 exercises per session
 * - Weeks 1-4: Bodyweight/Light (20 sec work, 10 sec rest)
 * - Weeks 5-8: Weighted progression (30 sec work, 15 sec rest)
 * - Equipment: TRX, Battle Ropes, Medicine Ball, Kettlebell, Bodyweight
 * - Progressive difficulty via timing and load
 */

-- First, get the exercise IDs we need
WITH exercise_ids AS (
  SELECT 
    id,
    name,
    equipment_needed,
    primary_muscle
  FROM exercises
  WHERE name IN (
    -- TRX Exercises
    'TRX Chest Fly',
    'TRX Tricep Extension',
    'TRX Pike',
    'TRX Bicep Curl',
    'TRX Single-Leg Squat',
    -- Battle Rope Exercises
    'Battle Rope Waves',
    'Battle Rope Slams',
    -- Medicine Ball Exercises
    'Medicine Ball Slam',
    'Medicine Ball Chest Pass',
    'Medicine Ball Rotational Throw',
    -- Kettlebell Exercises (for weeks 5-8)
    'Kettlebell Swing',
    'Kettlebell Goblet Squat',
    'Kettlebell Clean',
    -- Bodyweight/Functional
    'Burpees',
    'Mountain Climbers',
    'Jump Squats',
    'Walking Lunge'
  )
)

-- Insert the program
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
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  '8-Week CrossFit Circuit Program',
  'Progressive functional fitness circuit training combining TRX, battle ropes, medicine balls, and kettlebells. Weeks 1-4 focus on bodyweight mastery and conditioning. Weeks 5-8 add weighted movements for strength development. 2 sessions per week, 45-60 minutes each.',
  'intermediate',
  'endurance',
  8,
  ARRAY['Full Body', 'Core', 'Cardiovascular Endurance'],
  true,
  false,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d', -- Replace with your user ID
  
  -- EXERCISE POOL: Circuit format with progression notes
  jsonb_build_array(
    -- Exercise 1: TRX Chest Fly
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'TRX Chest Fly'),
      'exercise_name', 'TRX Chest Fly',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 20 sec work. Weeks 5-8: 30 sec work. Increase lean angle for difficulty.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Middle Chest'), 'secondary', jsonb_build_array('Front Deltoids'))
    ),
    
    -- Exercise 2: Battle Rope Waves
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Battle Rope Waves'),
      'exercise_name', 'Battle Rope Waves',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 20 sec work, alternating waves. Weeks 5-8: 30 sec work, add squat jumps between intervals.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Front Deltoids'), 'secondary', jsonb_build_array('Core'))
    ),
    
    -- Exercise 3: Medicine Ball Slam
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Medicine Ball Slam'),
      'exercise_name', 'Medicine Ball Slam',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 10 lb ball, 20 sec. Weeks 5-8: 15-20 lb ball, 30 sec. Explosive power focus.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Core'), 'secondary', jsonb_build_array('Shoulders'))
    ),
    
    -- Exercise 4: TRX Pike
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'TRX Pike'),
      'exercise_name', 'TRX Pike',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 20 sec, controlled pace. Weeks 5-8: 30 sec, add pushup at bottom.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Core'), 'secondary', jsonb_build_array('Front Deltoids'))
    ),
    
    -- Exercise 5: Kettlebell Swing (Weeks 5-8) / Jump Squats (Weeks 1-4)
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Jump Squats' LIMIT 1),
      'exercise_name', 'Jump Squats / Kettlebell Swing',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: Bodyweight Jump Squats, 20 sec. Weeks 5-8: Kettlebell Swings (35-53 lb), 30 sec.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Glutes', 'Hamstrings'), 'secondary', jsonb_build_array('Quads'))
    ),
    
    -- Exercise 6: Battle Rope Slams
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Battle Rope Slams'),
      'exercise_name', 'Battle Rope Slams',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 20 sec double slams. Weeks 5-8: 30 sec, add alternating slams.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Full Body'), 'secondary', jsonb_build_array('Core'))
    ),
    
    -- Exercise 7: TRX Tricep Extension
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'TRX Tricep Extension'),
      'exercise_name', 'TRX Tricep Extension',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 20 sec, moderate lean. Weeks 5-8: 30 sec, increase forward lean.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Triceps'), 'secondary', jsonb_build_array('Core'))
    ),
    
    -- Exercise 8: Medicine Ball Rotational Throw
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Medicine Ball Rotational Throw'),
      'exercise_name', 'Medicine Ball Rotational Throw',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: 8 lb ball, 20 sec each side. Weeks 5-8: 12 lb ball, 30 sec each side.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Obliques'), 'secondary', jsonb_build_array('Core'))
    ),
    
    -- Exercise 9: Walking Lunge (Weeks 1-4) / Kettlebell Goblet Squat (Weeks 5-8)
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Walking Lunge' LIMIT 1),
      'exercise_name', 'Walking Lunge / Kettlebell Goblet Squat',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: Bodyweight Walking Lunges, 20 sec. Weeks 5-8: KB Goblet Squat (35-53 lb), 30 sec.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Quads', 'Glutes'), 'secondary', jsonb_build_array('Core'))
    ),
    
    -- Exercise 10: Burpees (Weeks 1-4) / Kettlebell Clean (Weeks 5-8)
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_ids WHERE name = 'Burpees' LIMIT 1),
      'exercise_name', 'Burpees / Kettlebell Clean',
      'sets', 3,
      'reps', 'AMRAP',
      'rest_seconds', 10,
      'notes', 'Weeks 1-4: Standard Burpees, 20 sec. Weeks 5-8: KB Cleans (26-35 lb), 30 sec alternating.',
      'muscle_groups', jsonb_build_object('primary', jsonb_build_array('Full Body'), 'secondary', jsonb_build_array('Cardio'))
    )
  ),
  
  NOW(),
  NOW()
);

-- Verify the program was created
SELECT 
  id,
  name,
  difficulty_level,
  estimated_weeks,
  program_type,
  jsonb_array_length(exercise_pool) as exercise_count
FROM programs
WHERE id = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

SELECT '✅ Successfully created 8-Week CrossFit Circuit Program!' as status;
SELECT '📋 Program Structure:' as info;
SELECT '   - Weeks 1-4: Bodyweight focus (20 sec work, 10 sec rest)' as phase1;
SELECT '   - Weeks 5-8: Weighted progression (30 sec work, 15 sec rest)' as phase2;
SELECT '   - 10 exercises per circuit, 3 rounds total' as format;
SELECT '   - 2 sessions per week (16 total sessions)' as frequency;
