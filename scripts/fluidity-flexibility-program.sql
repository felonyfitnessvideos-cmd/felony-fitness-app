/**
 * @file fluidity-flexibility-program.sql
 * @description Fluidity - Flexibility & Mobility Regeneration Program
 * @date 2025-11-22
 * 
 * ⚠️ IMPORTANT: Run add-flexibility-mobility-exercises.sql FIRST
 * Then update the UUIDs below with the actual exercise IDs
 * 
 * PROGRAM OVERVIEW:
 * - 6 weeks of regenerative flexibility and mobility work
 * - 3 sessions per week (18 total sessions)
 * - Goal: Improve tissue quality and joint range of motion
 * - Designed to complement heavy training programs
 * 
 * TRAINING STRUCTURE:
 * - Day 1: Lower Body Mobility + Soft Tissue
 * - Day 2: Upper Body Mobility + Thoracic Work
 * - Day 3: Full Body Flow + Deep Stretching
 * 
 * PROGRESSION:
 * - Weeks 1-2: Tissue quality focus (foam rolling, static stretching)
 * - Weeks 3-4: Active mobility (dynamic movements, controlled stretching)
 * - Weeks 5-6: Integration (combining mobility with light loading)
 * 
 * EXERCISE SELECTION:
 * - Foam Roll (Quads, Upper Back) - soft tissue quality
 * - Pigeon Pose, Seated Hamstring Stretch - deep stretching
 * - Cat-Cow, Jefferson Curl - spinal mobility
 * - Bear Crawl - dynamic mobility
 * - Dumbbell RDL, Dumbbell Pullover - loaded stretching
 * - Doorway Pec Stretch - postural correction
 */

-- Insert Fluidity flexibility/mobility program
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
  'Fluidity',
  'Regenerative 6-week flexibility and mobility program focusing on soft tissue work and dynamic stretching. Designed to undo tightness from heavy training, improve joint range of motion, and enhance tissue quality. Perfect for active recovery days or as a standalone program for improving movement quality.',
  'beginner',
  'flexibility',
  6,
  ARRAY['Full Body', 'Flexibility', 'Mobility', 'Recovery'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 10 exercises
  jsonb_build_array(
    
    -- ========================================
    -- SOFT TISSUE / FOAM ROLLING
    -- ========================================
    
    -- Exercise 1: Foam Roll (Quads)
    jsonb_build_object(
      'exercise_id', '4e31a510-7242-4756-9ca2-6b41cc746af9',
      'exercise_name', 'Foam Roll (Quads)',
      'exercise_data', jsonb_build_object(
        'id', '4e31a510-7242-4756-9ca2-6b41cc746af9',
        'name', 'Foam Roll (Quads)',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Hip Flexors',
        'tertiary_muscle', 'Null',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 1,
      'reps', '60-90 sec each leg',
      'rest_seconds', 30,
      'notes', 'Lie face down with roller under thighs. Roll from hip to knee, pausing on tender spots. Progression: Weeks 1-2: Light pressure, continuous rolling; Weeks 3-4: Add pauses on trigger points; Weeks 5-6: Add flexion/extension at pauses.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Hip Flexors'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 2: Foam Roll (Upper Back)
    jsonb_build_object(
      'exercise_id', '0cef58fe-14a7-41e1-95e2-e242bdbb7f3d',
      'exercise_name', 'Foam Roll (Upper Back)',
      'exercise_data', jsonb_build_object(
        'id', '0cef58fe-14a7-41e1-95e2-e242bdbb7f3d',
        'name', 'Foam Roll (Upper Back)',
        'primary_muscle', 'Rhomboids',
        'secondary_muscle', 'Trapezius',
        'tertiary_muscle', 'Null',
        'difficulty_level', 'Beginner'
      ),
      'sets', 1,
      'reps', '60-90 sec',
      'rest_seconds', 30,
      'notes', 'Roll upper back over foam roller to improve thoracic extension. Cross arms over chest. Roll from mid-back to base of neck. Progression: Weeks 1-2: Continuous rolling; Weeks 3-4: Add reaches overhead; Weeks 5-6: Combine with breathing exercises.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Rhomboids', 'Trapezius'),
        'secondary', jsonb_build_array('Erector Spinae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- HIP & LOWER BODY MOBILITY
    -- ========================================
    
    -- Exercise 3: Pigeon Pose
    jsonb_build_object(
      'exercise_id', '559284a7-2eef-4c4f-aeb5-f5e780f08d7b',
      'exercise_name', 'Pigeon Pose',
      'exercise_data', jsonb_build_object(
        'id', '559284a7-2eef-4c4f-aeb5-f5e780f08d7b',
        'name', 'Pigeon Pose',
        'primary_muscle', 'Hip Flexors',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Lower Back',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '60-90 sec each side',
      'rest_seconds', 30,
      'notes', 'Deep hip flexor and glute stretch. From downward dog, bring knee forward, extend back leg. Lower torso over front leg. Progression: Weeks 1-2: Elevated front hip; Weeks 3-4: Lower to floor; Weeks 5-6: Add forward fold.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hip Flexors'),
        'secondary', jsonb_build_array('Glutes', 'Lower Back'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 4: Seated Hamstring Stretch
    jsonb_build_object(
      'exercise_id', '27b1744c-daf0-4449-aa35-a9c54ecd8717',
      'exercise_name', 'Seated Hamstring Stretch',
      'exercise_data', jsonb_build_object(
        'id', '27b1744c-daf0-4449-aa35-a9c54ecd8717',
        'name', 'Seated Hamstring Stretch',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Lower Back',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '45-60 sec each leg',
      'rest_seconds', 30,
      'notes', 'Static hamstring flexibility. Sit with legs extended, hinge at hips toward toes. Keep back straight. Progression: Weeks 1-2: Both legs together; Weeks 3-4: Single leg focus; Weeks 5-6: Add ankle flexion/extension.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Lower Back', 'Calves'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 5: Dumbbell RDL (Stretch Focus)
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
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Loaded hamstring stretch with control. Use LIGHT weight (10-20 lbs). Hinge at hips, lower to mid-shin, PAUSE 2-3 seconds at bottom to feel stretch. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: 10-15 lbs; Weeks 5-6: 15-20 lbs with longer pauses.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes', 'Erector Spinae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- SPINAL MOBILITY
    -- ========================================
    
    -- Exercise 6: Cat-Cow Stretch
    jsonb_build_object(
      'exercise_id', '1bec462d-78a8-419e-b8a6-e1b34399fe04',
      'exercise_name', 'Cat-Cow Stretch',
      'exercise_data', jsonb_build_object(
        'id', '1bec462d-78a8-419e-b8a6-e1b34399fe04',
        'name', 'Cat-Cow Stretch',
        'primary_muscle', 'Erector Spinae',
        'secondary_muscle', 'Upper Abdominals',
        'tertiary_muscle', 'Transverse Abdominis',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '10-15 cycles',
      'rest_seconds', 30,
      'notes', 'Spinal mobility flow. Hands and knees position. Cat: Round spine, tuck chin. Cow: Arch spine, lift head. Sync with breath. Progression: Weeks 1-2: Gentle movement; Weeks 3-4: Full range; Weeks 5-6: Add hip circles.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Erector Spinae'),
        'secondary', jsonb_build_array('Upper Abdominals', 'Transverse Abdominis'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 7: Jefferson Curl
    jsonb_build_object(
      'exercise_id', 'cbde4b08-d9b2-449d-91e6-40a0e221097c',
      'exercise_name', 'Jefferson Curl',
      'exercise_data', jsonb_build_object(
        'id', 'cbde4b08-d9b2-449d-91e6-40a0e221097c',
        'name', 'Jefferson Curl',
        'primary_muscle', 'Erector Spinae',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Upper Back',
        'difficulty_level', 'Advanced'
      ),
      'sets', 2,
      'reps', '8-10',
      'rest_seconds', 90,
      'notes', 'Advanced spinal flexion mobility. Stand on box with VERY light weight (5-10 lbs max). Round spine vertebra by vertebra. SLOW tempo (5 sec down, 5 sec up). Progression: Weeks 1-2: Bodyweight only; Weeks 3-4: 5 lbs; Weeks 5-6: 8-10 lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Erector Spinae'),
        'secondary', jsonb_build_array('Hamstrings', 'Upper Back'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- DYNAMIC MOBILITY
    -- ========================================
    
    -- Exercise 8: Bear Crawl
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
      'reps', '30-60 sec',
      'rest_seconds', 60,
      'notes', 'Dynamic full-body mobility. Crawl on hands and feet with hips low. Focus on contralateral movement (right hand, left foot). Progression: Weeks 1-2: 30 sec forward; Weeks 3-4: 45 sec with direction changes; Weeks 5-6: 60 sec with backwards crawling.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Upper Abdominals'),
        'secondary', jsonb_build_array('Front Deltoids', 'Quadriceps', 'Hip Flexors'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- UPPER BODY MOBILITY & STRETCHING
    -- ========================================
    
    -- Exercise 9: Doorway Pec Stretch
    jsonb_build_object(
      'exercise_id', '9b6a8344-5cbc-4c32-bb6a-2a9197a94ca3',
      'exercise_name', 'Doorway Pec Stretch',
      'exercise_data', jsonb_build_object(
        'id', '9b6a8344-5cbc-4c32-bb6a-2a9197a94ca3',
        'name', 'Doorway Pec Stretch',
        'primary_muscle', 'Middle Chest',
        'secondary_muscle', 'Front Deltoids',
        'tertiary_muscle', 'Biceps',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '45-60 sec each side',
      'rest_seconds', 30,
      'notes', 'Chest and anterior shoulder stretch. Forearm on door frame at 90 degrees, step forward until stretch felt. Progression: Weeks 1-2: Arm at shoulder height; Weeks 3-4: High angle (overhead reach); Weeks 5-6: Low angle (lower chest).',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Chest'),
        'secondary', jsonb_build_array('Front Deltoids', 'Biceps'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 10: Dumbbell Pullover
    jsonb_build_object(
      'exercise_id', '93debc0d-e2d1-4e22-b29c-854e64099fe8',
      'exercise_name', 'Dumbbell Pullover',
      'exercise_data', jsonb_build_object(
        'id', '93debc0d-e2d1-4e22-b29c-854e64099fe8',
        'name', 'Dumbbell Pullover',
        'primary_muscle', 'Latissimus Dorsi',
        'secondary_muscle', 'Middle Chest',
        'tertiary_muscle', 'Serratus Anterior',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Lat and chest stretch under load. Lie perpendicular on bench, hold dumbbell overhead. Lower back behind head in arc, PAUSE 2 sec at stretch. Light weight (10-20 lbs). Progression: Weeks 1-2: 10 lbs; Weeks 3-4: 15 lbs; Weeks 5-6: 20 lbs with longer pauses.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Latissimus Dorsi'),
        'secondary', jsonb_build_array('Middle Chest', 'Serratus Anterior'),
        'tertiary', jsonb_build_array('Triceps')
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ Fluidity program created successfully!' as status;

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
WHERE name = 'Fluidity';

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
WHERE name = 'Fluidity';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 10 (flat array)' as detail1;
SELECT '   - Program type: flexibility' as detail2;
SELECT '   - Difficulty: beginner' as detail3;
SELECT '   - Duration: 6 weeks progressive' as detail4;
SELECT '   - Focus: tissue quality, joint ROM, mobility' as detail5;
SELECT '⚠️  UPDATE UUIDs before running!' as warning;
