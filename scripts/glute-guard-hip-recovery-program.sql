/**
 * @file glute-guard-hip-recovery-program.sql
 * @description Glute Guard - Hip Recovery & Glute Activation Program
 * @date 2025-11-22
 * 
 * ⚠️ IMPORTANT: Run add-hip-recovery-exercises.sql FIRST
 * Then update the UUIDs below with the actual exercise IDs
 * 
 * PROGRAM OVERVIEW:
 * - Targeted activation for Glute Medius and Minimus
 * - Stabilizes pelvis and offloads lower back
 * - 6-8 weeks progressive hip strengthening
 * - Goal: Activate Glute Medius to reduce lower back pressure
 * 
 * TRAINING STRUCTURE:
 * - Glute activation (clamshells, hip abduction)
 * - Hip extension (bridges, single-leg variations)
 * - Core stability (bird dog, dead bug)
 * - Functional strength (goblet squat, cable pull through)
 * - Mobility work (90/90 stretch, foam rolling)
 * 
 * PROGRESSION:
 * - Weeks 1-2: Movement quality and muscle activation
 * - Weeks 3-4: Add external load and time under tension
 * - Weeks 5-6: Increase volume and complexity
 * - Weeks 7-8: Integration with compound movements
 * 
 * EXERCISE SELECTION:
 * - Clamshell, Hip Abduction - Glute Medius isolation
 * - Glute Bridge variations - Hip extension strength
 * - Bird Dog, Dead Bug - Core stability and anti-rotation
 * - Goblet Squat, Cable Pull Through - Functional hip strength
 * - 90/90 Stretch, Foam Rolling - Mobility and recovery
 */

-- Insert Glute Guard hip recovery program
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
  'Glute Guard',
  'A 6-8 week targeted activation routine for the Glute Medius and Minimus to stabilize the pelvis and offload the lower back. Perfect for addressing lower back pain, hip instability, or knee tracking issues. Emphasizes glute activation, hip extension strength, and pelvic control.',
  'beginner',
  'recovery',
  8,
  ARRAY['Glutes', 'Hips', 'Core', 'Lower Back'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 10 exercises
  jsonb_build_array(
    
    -- ========================================
    -- GLUTE ACTIVATION
    -- ========================================
    
    -- Exercise 1: Dumbbell Clamshell
    jsonb_build_object(
      'exercise_id', '03544f6d-856e-4267-8bd2-f2894a9eb3db',
      'exercise_name', 'Dumbbell Clamshell',
      'exercise_data', jsonb_build_object(
        'id', '03544f6d-856e-4267-8bd2-f2894a9eb3db',
        'name', 'Dumbbell Clamshell',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hip Abductors',
        'tertiary_muscle', 'Tensor Fasciae Latae',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '15-20 each side',
      'rest_seconds', 45,
      'notes', 'Lie on side, knees bent, dumbbell on top knee. Open top knee while keeping feet together. Pure Glute Medius activation. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: 5 lb DB; Weeks 5-6: 10 lb DB; Weeks 7-8: 15 lb DB or resistance band.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hip Abductors'),
        'tertiary', jsonb_build_array('Tensor Fasciae Latae')
      )
    ),
    
    -- Exercise 2: Hip Abduction Machine
    jsonb_build_object(
      'exercise_id', 'c355d6cd-87b8-4c57-8525-22bee935e8f7',
      'exercise_name', 'Hip Abduction Machine',
      'exercise_data', jsonb_build_object(
        'id', 'c355d6cd-87b8-4c57-8525-22bee935e8f7',
        'name', 'Hip Abduction Machine',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hip Abductors',
        'tertiary_muscle', 'Tensor Fasciae Latae',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '15-20',
      'rest_seconds', 60,
      'notes', 'Seated hip abduction machine. Press legs out against pads. Focus on controlled tempo and peak contraction. Progression: Weeks 1-2: 30-40 lbs; Weeks 3-4: 50-60 lbs; Weeks 5-6: 70-80 lbs; Weeks 7-8: 90+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes', 'Hip Abductors'),
        'secondary', jsonb_build_array('Tensor Fasciae Latae'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- HIP EXTENSION STRENGTH
    -- ========================================
    
    -- Exercise 3: Glute Bridge
    jsonb_build_object(
      'exercise_id', 'ae03a275-7c8a-494e-a83d-07e03131f808',
      'exercise_name', 'Dumbbell Glute Bridge',
      'exercise_data', jsonb_build_object(
        'id', 'ae03a275-7c8a-494e-a83d-07e03131f808',
        'name', 'Dumbbell Glute Bridge',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Erector Spinae',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Lie on back, feet flat, dumbbell on hips. Bridge up squeezing glutes at top. Drive through heels. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: 25 lb DB; Weeks 5-6: 35 lb DB; Weeks 7-8: 45+ lb DB with 2-sec holds.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hamstrings'),
        'tertiary', jsonb_build_array('Erector Spinae')
      )
    ),
    
    -- Exercise 4: Single-Leg Glute Bridge
    jsonb_build_object(
      'exercise_id', 'c4fb5530-ecdd-4f27-b472-1892fe20cfdc',
      'exercise_name', 'Single-Leg Glute Bridge',
      'exercise_data', jsonb_build_object(
        'id', 'c4fb5530-ecdd-4f27-b472-1892fe20cfdc',
        'name', 'Single-Leg Glute Bridge',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '10-12 each leg',
      'rest_seconds', 60,
      'notes', 'One foot flat, other leg extended. Bridge up on single leg. Challenges stability and glute strength. Progression: Weeks 1-2: Skip or both feet; Weeks 3-4: Single leg; Weeks 5-6: Add 2-sec pause; Weeks 7-8: Elevated on bench.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hamstrings', 'Core'),
        'tertiary', jsonb_build_array('Erector Spinae')
      )
    ),
    
    -- ========================================
    -- CORE STABILITY
    -- ========================================
    
    -- Exercise 5: Bird Dog
    jsonb_build_object(
      'exercise_id', '2fbcf6dd-fb2a-4d1e-ae02-9557e0d207e6',
      'exercise_name', 'Bird Dog',
      'exercise_data', jsonb_build_object(
        'id', '2fbcf6dd-fb2a-4d1e-ae02-9557e0d207e6',
        'name', 'Bird Dog',
        'primary_muscle', 'Erector Spinae',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12 each side',
      'rest_seconds', 45,
      'notes', 'Hands and knees. Extend opposite arm and leg. Hold 2-3 seconds. Core stability and glute activation. Progression: Weeks 1-2: 1-sec holds; Weeks 3-4: 2-sec holds; Weeks 5-6: 3-sec holds; Weeks 7-8: Add ankle weight.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Core', 'Erector Spinae'),
        'secondary', jsonb_build_array('Glutes'),
        'tertiary', jsonb_build_array('Shoulders')
      )
    ),
    
    -- Exercise 6: Dead Bug
    jsonb_build_object(
      'exercise_id', '12dc9004-36a0-4998-b610-0ed3c1b2e003',
      'exercise_name', 'Dead Bug',
      'exercise_data', jsonb_build_object(
        'id', '12dc9004-36a0-4998-b610-0ed3c1b2e003',
        'name', 'Dead Bug',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Hip Flexors',
        'tertiary_muscle', 'Transverse Abdominis',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12 each side',
      'rest_seconds', 45,
      'notes', 'Lie on back, arms extended up, knees bent 90 degrees. Lower opposite arm and leg. Anti-extension core work. Progression: Weeks 1-2: Partial range; Weeks 3-4: Full range; Weeks 5-6: Slower tempo; Weeks 7-8: Add light weight in hands.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Core', 'Upper Abdominals'),
        'secondary', jsonb_build_array('Hip Flexors'),
        'tertiary', jsonb_build_array('Transverse Abdominis')
      )
    ),
    
    -- ========================================
    -- FUNCTIONAL HIP STRENGTH
    -- ========================================
    
    -- Exercise 7: Goblet Squat
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
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Hold dumbbell at chest, squat to parallel or box. Focus on sitting back into hips. Progression: Weeks 1-2: 20 lb DB; Weeks 3-4: 30 lb DB; Weeks 5-6: 40 lb DB; Weeks 7-8: 50+ lb DB.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Hamstrings'),
        'tertiary', jsonb_build_array('Core')
      )
    ),
    
    -- Exercise 8: Cable Pull Through
    jsonb_build_object(
      'exercise_id', 'ade75d16-c4c1-4595-b8cf-e876c5a9d5b9',
      'exercise_name', 'Cable Pull-Through',
      'exercise_data', jsonb_build_object(
        'id', 'ade75d16-c4c1-4595-b8cf-e876c5a9d5b9',
        'name', 'Cable Pull-Through',
        'primary_muscle', 'Glutes',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Erector Spinae',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Stand facing away from cable, rope between legs. Hinge at hips, pull through with glutes. Hip hinge pattern with glute focus. Progression: Weeks 1-2: 30 lbs; Weeks 3-4: 40 lbs; Weeks 5-6: 50 lbs; Weeks 7-8: 60+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hamstrings'),
        'tertiary', jsonb_build_array('Erector Spinae')
      )
    ),
    
    -- ========================================
    -- MOBILITY & RECOVERY
    -- ========================================
    
    -- Exercise 9: 90/90 Hip Stretch
    jsonb_build_object(
      'exercise_id', '24f157e8-0647-47e9-a461-9a40b49e23bf',
      'exercise_name', '90/90 Hip Stretch',
      'exercise_data', jsonb_build_object(
        'id', '24f157e8-0647-47e9-a461-9a40b49e23bf',
        'name', '90/90 Hip Stretch',
        'primary_muscle', 'Hip Flexors',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Lower Back',
        'difficulty_level', 'Beginner'
      ),
      'sets', 2,
      'reps', '60-90 sec each side',
      'rest_seconds', 30,
      'notes', 'Seated hip mobility stretch. Front and back leg both at 90 degrees. Lean forward over front leg. Targets hip capsule and rotators. Progression: Weeks 1-2: 45 sec; Weeks 3-4: 60 sec; Weeks 5-6: 75 sec; Weeks 7-8: 90 sec with deeper lean.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hip Flexors'),
        'secondary', jsonb_build_array('Glutes', 'Hip Rotators'),
        'tertiary', jsonb_build_array('Lower Back')
      )
    ),
    
    -- Exercise 10: Foam Roll (IT Band)
    jsonb_build_object(
      'exercise_id', 'e70740e5-6fe7-4b6a-b7be-a78011b7a789',
      'exercise_name', 'Foam Roll (IT Band)',
      'exercise_data', jsonb_build_object(
        'id', 'e70740e5-6fe7-4b6a-b7be-a78011b7a789',
        'name', 'Foam Roll (IT Band)',
        'primary_muscle', 'Hip Abductors',
        'secondary_muscle', 'Quadriceps',
        'tertiary_muscle', 'Tensor Fasciae Latae',
        'difficulty_level', 'Beginner'
      ),
      'sets', 1,
      'reps', '60-90 sec each side',
      'rest_seconds', 30,
      'notes', 'Lie on side, roller under outer thigh. Roll from hip to above knee. Will be uncomfortable - IT band is dense tissue. Use opposite leg to adjust pressure. Progression: Weeks 1-2: Light pressure; Weeks 3-4: Moderate pressure with pauses; Weeks 5-8: Full pressure with trigger point work.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hip Abductors', 'IT Band'),
        'secondary', jsonb_build_array('Quadriceps'),
        'tertiary', jsonb_build_array('Tensor Fasciae Latae')
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ Glute Guard program created successfully!' as status;

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
WHERE name = 'Glute Guard';

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
WHERE name = 'Glute Guard';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 10 (flat array)' as detail1;
SELECT '   - Program type: recovery' as detail2;
SELECT '   - Difficulty: beginner' as detail3;
SELECT '   - Duration: 8 weeks progressive' as detail4;
SELECT '   - Focus: glute activation, hip stability, lower back relief' as detail5;
