/**
 * @file the-cuff-shoulder-recovery-program.sql
 * @description The Cuff - Shoulder Recovery & Rotator Cuff Program
 * @date 2025-11-22
 * 
 * ⚠️ IMPORTANT: Run add-shoulder-recovery-exercises.sql FIRST
 * Then update the UUIDs below with the actual exercise IDs
 * 
 * PROGRAM OVERVIEW:
 * - Low-load, high-focus routine for shoulder health
 * - Bulletproofs small stabilizer muscles of shoulder girdle
 * - 6-8 weeks of progressive shoulder strengthening
 * - Goal: Rotator cuff stability and scapular control
 * 
 * TRAINING STRUCTURE:
 * - Mobility and warm-up (arm circles, wall slides)
 * - Scapular control (face pulls, band pull-aparts)
 * - Rotator cuff isolation (external rotations)
 * - Functional stability (scaption, bottom-up press)
 * - Core integration (bear crawl static hold, plank variations)
 * 
 * PROGRESSION:
 * - Weeks 1-2: Movement quality and range of motion
 * - Weeks 3-4: Light resistance and endurance
 * - Weeks 5-6: Progressive overload with control
 * - Weeks 7-8: Integration with functional movements
 * 
 * EXERCISE SELECTION:
 * - Arm Circles, Wall Slides - mobility and activation
 * - Face Pull, Band Pull-Apart - scapular retraction
 * - Cable External Rotation, Side-Lying ER - rotator cuff isolation
 * - Scaption, Bottom-Up Press - functional shoulder stability
 * - Bear Crawl Hold, Plank (Shoulder Tap) - integrated stability
 */

-- Insert The Cuff shoulder recovery program
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
  'The Cuff',
  'A 6-8 week low-load, high-focus routine designed to bulletproof the small stabilizer muscles of the shoulder girdle. Perfect for injury prevention, post-rehab strengthening, or addressing shoulder instability. Emphasizes rotator cuff stability, scapular control, and proper movement patterns.',
  'beginner',
  'recovery',
  8,
  ARRAY['Shoulders', 'Rotator Cuff', 'Upper Back', 'Core'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 10 exercises
  jsonb_build_array(
    
    -- ========================================
    -- MOBILITY & WARM-UP
    -- ========================================
    
    -- Exercise 1: Arm Circles
    jsonb_build_object(
      'exercise_id', '37dde179-ec47-4cc7-a9a8-707c8870dd09',
      'exercise_name', 'Arm Circles',
      'exercise_data', jsonb_build_object(
        'id', '37dde179-ec47-4cc7-a9a8-707c8870dd09',
        'name', 'Arm Circles',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Side Deltoids',
        'tertiary_muscle', 'Rotator Cuff',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '15 each direction',
      'rest_seconds', 30,
      'notes', 'Dynamic warm-up for shoulders. Start with small circles, progress to larger. Forward 15 reps, reverse 15 reps. Focus on full ROM without arching back. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: Hold 2-3 lb plates; Weeks 5-8: 5 lb plates.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Side Deltoids', 'Rotator Cuff'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 2: Wall Slides
    jsonb_build_object(
      'exercise_id', 'ee5ccd7c-15be-44eb-9e7a-42d3c8d24e4d',
      'exercise_name', 'Wall Slides',
      'exercise_data', jsonb_build_object(
        'id', 'ee5ccd7c-15be-44eb-9e7a-42d3c8d24e4d',
        'name', 'Wall Slides',
        'primary_muscle', 'Middle Trapezius',
        'secondary_muscle', 'Serratus Anterior',
        'tertiary_muscle', 'Rotator Cuff',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 45,
      'notes', 'Scapular control drill. Maintain wall contact with back, arms, and hands. Slide arms overhead keeping shoulders down. Progression: Weeks 1-2: Focus on full range; Weeks 3-4: Add 2-sec pause at top; Weeks 5-6: Slow tempo (3 sec up, 3 sec down); Weeks 7-8: Add light resistance band.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Trapezius'),
        'secondary', jsonb_build_array('Serratus Anterior', 'Rotator Cuff'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- SCAPULAR CONTROL
    -- ========================================
    
    -- Exercise 3: Face Pull (Cable)
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
      'notes', 'Pull cable to face level, separate hands wide. Squeeze shoulder blades together at peak. Light weight, high quality reps. Progression: Weeks 1-2: 15 lbs; Weeks 3-4: 20 lbs; Weeks 5-6: 25 lbs; Weeks 7-8: 30 lbs with slower tempo.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rear Deltoids'),
        'secondary', jsonb_build_array('Rhomboids', 'Middle Trapezius'),
        'tertiary', jsonb_build_array('Rotator Cuff')
      )
    ),
    
    -- Exercise 4: Band Pull-Apart
    jsonb_build_object(
      'exercise_id', '1ba300c5-c7cc-4b13-8f2d-5aa089e8f430',
      'exercise_name', 'Band Pull-Apart',
      'exercise_data', jsonb_build_object(
        'id', '1ba300c5-c7cc-4b13-8f2d-5aa089e8f430',
        'name', 'Band Pull-Apart',
        'primary_muscle', 'Rear Deltoids',
        'secondary_muscle', 'Rhomboids',
        'tertiary_muscle', 'Middle Trapezius',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '20-25',
      'rest_seconds', 45,
      'notes', 'Hold band at chest height, pull apart squeezing shoulder blades. High reps for endurance. Progression: Weeks 1-2: Light band; Weeks 3-4: Medium band; Weeks 5-6: Heavy band; Weeks 7-8: Add pauses at peak contraction.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rear Deltoids'),
        'secondary', jsonb_build_array('Rhomboids', 'Middle Trapezius'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- ROTATOR CUFF ISOLATION
    -- ========================================
    
    -- Exercise 5: Cable External Rotation
    jsonb_build_object(
      'exercise_id', 'cf2c86da-1dc5-4e9a-a4a6-518a21be545d',
      'exercise_name', 'Cable External Rotation',
      'exercise_data', jsonb_build_object(
        'id', 'cf2c86da-1dc5-4e9a-a4a6-518a21be545d',
        'name', 'Cable External Rotation',
        'primary_muscle', 'Rotator Cuff',
        'secondary_muscle', 'Rear Deltoids',
        'tertiary_muscle', 'Middle Trapezius',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15 each arm',
      'rest_seconds', 60,
      'notes', 'Standing cable external rotation. Elbow bent 90 degrees pinned to side. Rotate arm outward against resistance. LIGHT weight is key. Progression: Weeks 1-2: 5 lbs; Weeks 3-4: 7.5 lbs; Weeks 5-6: 10 lbs; Weeks 7-8: 12.5 lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rotator Cuff'),
        'secondary', jsonb_build_array('Rear Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 6: Dumbbell Side-Lying External Rotation
    jsonb_build_object(
      'exercise_id', '3b27bced-e13d-4726-b7cb-9bec126415ef',
      'exercise_name', 'Dumbbell Side-Lying External Rotation',
      'exercise_data', jsonb_build_object(
        'id', '3b27bced-e13d-4726-b7cb-9bec126415ef',
        'name', 'Dumbbell Side-Lying External Rotation',
        'primary_muscle', 'Rotator Cuff',
        'secondary_muscle', 'Rear Deltoids',
        'tertiary_muscle', 'Middle Trapezius',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15 each side',
      'rest_seconds', 60,
      'notes', 'Lie on side, rotate dumbbell up keeping elbow pinned. Pure rotator cuff isolation. VERY LIGHT weight. Progression: Weeks 1-2: 3-5 lbs; Weeks 3-4: 5-7 lbs; Weeks 5-6: 7-10 lbs; Weeks 7-8: Add 2-sec pause at top.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rotator Cuff'),
        'secondary', jsonb_build_array('Rear Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- FUNCTIONAL SHOULDER STABILITY
    -- ========================================
    
    -- Exercise 7: Dumbbell Scaption
    jsonb_build_object(
      'exercise_id', 'd8f859a1-946d-4558-a8dc-7d59accf983a',
      'exercise_name', 'Dumbbell Scaption',
      'exercise_data', jsonb_build_object(
        'id', 'd8f859a1-946d-4558-a8dc-7d59accf983a',
        'name', 'Dumbbell Scaption',
        'primary_muscle', 'Side Deltoids',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Serratus Anterior',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Raise dumbbells forward at 45-degree angle (scapular plane). Thumbs up, controlled tempo. Safer than lateral raises for shoulder health. Progression: Weeks 1-2: 5-8 lbs; Weeks 3-4: 8-10 lbs; Weeks 5-6: 10-12 lbs; Weeks 7-8: 12-15 lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Side Deltoids'),
        'secondary', jsonb_build_array('Front Deltoids', 'Serratus Anterior'),
        'tertiary', jsonb_build_array('Rotator Cuff')
      )
    ),
    
    -- Exercise 8: Kettlebell Bottom-Up Press
    jsonb_build_object(
      'exercise_id', 'e214e922-d3c0-473e-a4f3-0acde9aec2ae',
      'exercise_name', 'Kettlebell Bottom-Up Press',
      'exercise_data', jsonb_build_object(
        'id', 'e214e922-d3c0-473e-a4f3-0acde9aec2ae',
        'name', 'Kettlebell Bottom-Up Press',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Rotator Cuff',
        'tertiary_muscle', 'Triceps',
        'difficulty_level', 'Advanced'
      ),
      'sets', 3,
      'reps', '6-8 each arm',
      'rest_seconds', 90,
      'notes', 'Hold kettlebell upside down, press overhead maintaining vertical alignment. Maximum stabilizer engagement. Start LIGHT. Progression: Weeks 1-2: Skip (too advanced); Weeks 3-4: 10 lb KB; Weeks 5-6: 15 lb KB; Weeks 7-8: 20 lb KB.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Rotator Cuff', 'Triceps'),
        'tertiary', jsonb_build_array('Core')
      )
    ),
    
    -- ========================================
    -- INTEGRATED STABILITY
    -- ========================================
    
    -- Exercise 9: Bear Crawl (Static Hold)
    jsonb_build_object(
      'exercise_id', '0037faa4-77d6-43be-9a93-0658a249f921',
      'exercise_name', 'Bear Crawl',
      'exercise_data', jsonb_build_object(
        'id', '0037faa4-77d6-43be-9a93-0658a249f921',
        'name', 'Bear Crawl',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Quadriceps',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '30-45 sec hold',
      'rest_seconds', 60,
      'notes', 'Quadruped position on hands and feet, knees hovering 2 inches off ground. STATIC HOLD (no crawling). Shoulders packed, core tight. Progression: Weeks 1-2: 20 sec holds; Weeks 3-4: 30 sec holds; Weeks 5-6: 40 sec holds; Weeks 7-8: 45-60 sec holds.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Core'),
        'secondary', jsonb_build_array('Front Deltoids', 'Quadriceps'),
        'tertiary', jsonb_build_array('Hip Flexors')
      )
    ),
    
    -- Exercise 10: Plank (Shoulder Tap)
    jsonb_build_object(
      'exercise_id', '8a164529-ba9d-4b7e-a82c-b82dd5740ea9',
      'exercise_name', 'Plank (Shoulder Tap)',
      'exercise_data', jsonb_build_object(
        'id', '8a164529-ba9d-4b7e-a82c-b82dd5740ea9',
        'name', 'Plank (Shoulder Tap)',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Obliques',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '20 total taps (10 each)',
      'rest_seconds', 60,
      'notes', 'High plank, alternate tapping opposite shoulder. Minimize hip rotation. Challenges shoulder stability and anti-rotation. Progression: Weeks 1-2: 12 taps; Weeks 3-4: 16 taps; Weeks 5-6: 20 taps; Weeks 7-8: 24 taps with slower tempo.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Core'),
        'secondary', jsonb_build_array('Front Deltoids', 'Obliques'),
        'tertiary', jsonb_build_array('Serratus Anterior')
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ The Cuff program created successfully!' as status;

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
WHERE name = 'The Cuff';

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
WHERE name = 'The Cuff';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 10 (flat array)' as detail1;
SELECT '   - Program type: recovery' as detail2;
SELECT '   - Difficulty: beginner' as detail3;
SELECT '   - Duration: 8 weeks progressive' as detail4;
SELECT '   - Focus: rotator cuff stability, scapular control' as detail5;
