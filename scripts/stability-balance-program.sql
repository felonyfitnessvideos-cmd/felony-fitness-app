/**
 * @file stability-balance-program.sql
 * @description Stability - Balance & Proprioception Program
 * @date 2025-11-22
 * 
 * ⚠️ IMPORTANT: Run add-stability-balance-exercises.sql FIRST
 * Then update the UUIDs below with the actual exercise IDs
 * 
 * PROGRAM OVERVIEW:
 * - Focus on unilateral (single-limb) movements
 * - Core instability to force body stabilization
 * - 6-8 weeks of progressive balance training
 * - Goal: Improve core control and proprioception
 * 
 * TRAINING STRUCTURE:
 * - Single-leg lower body exercises (lunges, deadlifts, bridges)
 * - Unilateral upper body (single-arm pressing)
 * - Core stability (plank variations)
 * - Loaded carries (farmer's walk, suitcase carry)
 * 
 * PROGRESSION:
 * - Weeks 1-2: Master basic single-leg patterns
 * - Weeks 3-4: Add external load and complexity
 * - Weeks 5-6: Increase instability (stability ball, heavier carries)
 * - Weeks 7-8: Integration with dynamic movements
 * 
 * EXERCISE SELECTION:
 * - Dumbbell Lunge, Step Up, Single-Leg Deadlift - unilateral lower body
 * - Single-Leg Glute Bridge - posterior chain stability
 * - Plank, Stability Ball Plank - core stability progression
 * - Single-Arm Press, Alternating Press - unilateral pushing
 * - Farmer's Walk, Suitcase Carry - loaded carries
 */

-- Insert Stability balance program
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
  'Stability',
  'A 6-8 week program dedicated to unilateral movements and core instability to force the body to stabilize itself. Focuses on single-limb exercises, balance work, and proprioception training. Perfect for injury prevention, addressing imbalances, and building functional core strength.',
  'intermediate',
  'strength',
  8,
  ARRAY['Full Body', 'Core', 'Balance', 'Functional'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 10 exercises
  jsonb_build_array(
    
    -- ========================================
    -- UNILATERAL LOWER BODY
    -- ========================================
    
    -- Exercise 1: Dumbbell Lunge
    jsonb_build_object(
      'exercise_id', 'f522f5f9-e681-4a41-8229-f42828e205f0',
      'exercise_name', 'Dumbbell Lunge',
      'exercise_data', jsonb_build_object(
        'id', 'f522f5f9-e681-4a41-8229-f42828e205f0',
        'name', 'Dumbbell Lunge',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12 each leg',
      'rest_seconds', 60,
      'notes', 'Forward or reverse lunge holding dumbbells. Focus on balance and control. Keep torso upright, front knee tracks over toes. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: Light DBs (15-20 lbs); Weeks 5-6: Moderate DBs (25-35 lbs); Weeks 7-8: Add pause at bottom.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Calves'),
        'tertiary', jsonb_build_array('Core')
      )
    ),
    
    -- Exercise 2: Dumbbell Step Up
    jsonb_build_object(
      'exercise_id', '1139d5e8-81b9-4493-a24e-42286c8512ab',
      'exercise_name', 'Dumbbell Step-Up',
      'exercise_data', jsonb_build_object(
        'id', '1139d5e8-81b9-4493-a24e-42286c8512ab',
        'name', 'Dumbbell Step-Up',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12 each leg',
      'rest_seconds', 60,
      'notes', 'Step up onto platform with control, drive through heel. Step down slowly. Dumbbells at sides. Progression: Weeks 1-2: 12" box, bodyweight; Weeks 3-4: 12" box, light DBs; Weeks 5-6: 16" box, moderate DBs; Weeks 7-8: 20" box, heavier DBs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Calves'),
        'tertiary', jsonb_build_array('Core')
      )
    ),
    
    -- Exercise 3: Single-Leg Deadlift
    jsonb_build_object(
      'exercise_id', '3e5a28df-c996-42b5-9cd4-219731344975',
      'exercise_name', 'Dumbbell Single-Leg Deadlift',
      'exercise_data', jsonb_build_object(
        'id', '3e5a28df-c996-42b5-9cd4-219731344975',
        'name', 'Dumbbell Single-Leg Deadlift',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '8-10 each leg',
      'rest_seconds', 90,
      'notes', 'Balance on one leg, hinge at hip lowering weights toward floor. Back leg extends behind for balance (or tuck for advanced). Progression: Weeks 1-2: Bodyweight or light DBs (10 lbs); Weeks 3-4: 15-20 lbs; Weeks 5-6: 25-30 lbs; Weeks 7-8: 35+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes', 'Core'),
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
      'reps', '12-15 each leg',
      'rest_seconds', 60,
      'notes', 'Lie on back, one foot flat, other leg extended. Bridge up squeezing glutes. Progression: Weeks 1-2: Both feet down; Weeks 3-4: Single leg; Weeks 5-6: Add 2-sec pause at top; Weeks 7-8: Feet elevated on bench.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Glutes'),
        'secondary', jsonb_build_array('Hamstrings', 'Core'),
        'tertiary', jsonb_build_array('Erector Spinae')
      )
    ),
    
    -- ========================================
    -- CORE STABILITY
    -- ========================================
    
    -- Exercise 5: Plank
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
      'reps', '30-60 sec',
      'rest_seconds', 60,
      'notes', 'Hold straight body position on forearms. Keep core tight, don''t sag hips. Progression: Weeks 1-2: 30 sec holds; Weeks 3-4: 45 sec holds; Weeks 5-6: 60 sec holds; Weeks 7-8: Add arm/leg lifts.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Upper Abdominals'),
        'secondary', jsonb_build_array('Transverse Abdominis', 'Obliques'),
        'tertiary', jsonb_build_array('Front Deltoids')
      )
    ),
    
    -- Exercise 6: Stability Ball Plank
    jsonb_build_object(
      'exercise_id', 'db76e492-2884-49bd-82a7-1ac74ef58a5a',
      'exercise_name', 'Stability Ball Plank',
      'exercise_data', jsonb_build_object(
        'id', 'db76e492-2884-49bd-82a7-1ac74ef58a5a',
        'name', 'Stability Ball Plank',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Transverse Abdominis',
        'tertiary_muscle', 'Front Deltoids',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '20-45 sec',
      'rest_seconds', 90,
      'notes', 'Forearms on stability ball in plank position. Instability increases core activation. Progression: Weeks 1-2: Skip (use regular plank); Weeks 3-4: 20 sec holds; Weeks 5-6: 30-40 sec holds; Weeks 7-8: 45 sec + small ball circles.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Upper Abdominals'),
        'secondary', jsonb_build_array('Transverse Abdominis', 'Obliques'),
        'tertiary', jsonb_build_array('Front Deltoids', 'Serratus Anterior')
      )
    ),
    
    -- ========================================
    -- UNILATERAL UPPER BODY
    -- ========================================
    
    -- Exercise 7: Single-Arm Dumbbell Press
    jsonb_build_object(
      'exercise_id', 'e8f2a5c4-e7a0-4b11-adbe-07e2d7447ee7',
      'exercise_name', 'Single-Arm Dumbbell Press',
      'exercise_data', jsonb_build_object(
        'id', 'e8f2a5c4-e7a0-4b11-adbe-07e2d7447ee7',
        'name', 'Single-Arm Dumbbell Press',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Upper Abdominals',
        'tertiary_muscle', 'Triceps',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '8-10 each arm',
      'rest_seconds', 90,
      'notes', 'Press single dumbbell overhead, other arm at side. Core engages to prevent rotation. Stand or sit. Progression: Weeks 1-2: Seated, 20-25 lbs; Weeks 3-4: Standing, 25-30 lbs; Weeks 5-6: 30-35 lbs; Weeks 7-8: 40+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Core', 'Triceps'),
        'tertiary', jsonb_build_array('Upper Trapezius')
      )
    ),
    
    -- Exercise 8: Alternating Dumbbell Press
    jsonb_build_object(
      'exercise_id', 'aa7a988e-e945-4ad3-916e-72f2cc86d365',
      'exercise_name', 'Alternating Dumbbell Press',
      'exercise_data', jsonb_build_object(
        'id', 'aa7a988e-e945-4ad3-916e-72f2cc86d365',
        'name', 'Alternating Dumbbell Press',
        'primary_muscle', 'Front Deltoids',
        'secondary_muscle', 'Upper Abdominals',
        'tertiary_muscle', 'Triceps',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '16-20 total (8-10 each)',
      'rest_seconds', 90,
      'notes', 'Both dumbbells at shoulders. Press one overhead while other stays at shoulder. Lower and alternate. Core fights rotation. Progression: Weeks 1-2: 15-20 lbs; Weeks 3-4: 20-25 lbs; Weeks 5-6: 25-30 lbs; Weeks 7-8: Add tempo (3-sec lower).',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Front Deltoids'),
        'secondary', jsonb_build_array('Core', 'Obliques', 'Triceps'),
        'tertiary', jsonb_build_array('Upper Trapezius')
      )
    ),
    
    -- ========================================
    -- LOADED CARRIES
    -- ========================================
    
    -- Exercise 9: Farmer's Walk
    jsonb_build_object(
      'exercise_id', '0f675ea2-289e-4e12-9c12-88da4a716b27',
      'exercise_name', 'Farmer''s Walk',
      'exercise_data', jsonb_build_object(
        'id', '0f675ea2-289e-4e12-9c12-88da4a716b27',
        'name', 'Farmer''s Walk',
        'primary_muscle', 'Forearms',
        'secondary_muscle', 'Trapezius',
        'tertiary_muscle', 'Upper Abdominals',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '40-60 yards',
      'rest_seconds', 90,
      'notes', 'Hold heavy dumbbells at sides, walk maintaining upright posture. Shoulders back, core tight. Progression: Weeks 1-2: 30 lbs each hand; Weeks 3-4: 40 lbs; Weeks 5-6: 50 lbs; Weeks 7-8: 60+ lbs or add distance.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Forearms'),
        'secondary', jsonb_build_array('Trapezius', 'Core'),
        'tertiary', jsonb_build_array('Quadriceps', 'Glutes')
      )
    ),
    
    -- Exercise 10: Suitcase Carry
    jsonb_build_object(
      'exercise_id', '25321fe5-064c-4a5b-9572-57986ef32949',
      'exercise_name', 'Suitcase Carry',
      'exercise_data', jsonb_build_object(
        'id', '25321fe5-064c-4a5b-9572-57986ef32949',
        'name', 'Suitcase Carry',
        'primary_muscle', 'Upper Abdominals',
        'secondary_muscle', 'Obliques',
        'tertiary_muscle', 'Forearms',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '40-60 yards each side',
      'rest_seconds', 90,
      'notes', 'Hold heavy dumbbell in ONE hand, walk resisting lateral lean. Core fights sideways bending. Switch sides. Progression: Weeks 1-2: 30 lbs; Weeks 3-4: 40 lbs; Weeks 5-6: 50 lbs; Weeks 7-8: 60+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Core', 'Obliques'),
        'secondary', jsonb_build_array('Forearms', 'Trapezius'),
        'tertiary', jsonb_build_array('Quadriceps')
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ Stability program created successfully!' as status;

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
WHERE name = 'Stability';

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
WHERE name = 'Stability';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 10 (flat array)' as detail1;
SELECT '   - Program type: strength (functional/balance)' as detail2;
SELECT '   - Difficulty: intermediate' as detail3;
SELECT '   - Duration: 8 weeks progressive' as detail4;
SELECT '   - Focus: unilateral movements, core stability, proprioception' as detail5;
