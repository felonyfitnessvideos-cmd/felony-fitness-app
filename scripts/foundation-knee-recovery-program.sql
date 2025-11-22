/**
 * @file foundation-knee-recovery-program.sql
 * @description Foundation - Knee Recovery & VMO Strengthening Program
 * @date 2025-11-22
 * 
 * ⚠️ IMPORTANT: Run add-knee-recovery-exercises.sql FIRST
 * Then update the UUIDs below with the actual exercise IDs
 * 
 * PROGRAM OVERVIEW:
 * - Low-impact strength routine for knee rehabilitation
 * - Focus: VMO (vastus medialis oblique - teardrop muscle)
 * - Secondary focus: Hamstring strength for knee stability
 * - Zero/low-impact exercises to protect healing knee joint
 * - Goal: Strengthen supporting muscles without grinding the knee
 * 
 * TRAINING STRUCTURE:
 * - Cardio warm-up (bike, elliptical) - blood flow without impact
 * - Isometric VMO work (wall sit, Spanish squat)
 * - Controlled quad strengthening (HOIST leg extension)
 * - Functional movements (step ups)
 * - Hamstring balance (stability ball curl, seated curl)
 * - Ankle stability (calf raises) - foundation for knee tracking
 * 
 * PROGRESSION:
 * - Weeks 1-2: Movement quality, pain-free range of motion
 * - Weeks 3-4: Increase time under tension and reps
 * - Weeks 5-6: Add external load gradually
 * - Weeks 7-8: Progress to more functional patterns
 * 
 * EXERCISE RATIONALE:
 * - VMO strengthening: Critical for patellar tracking and stability
 * - Hamstring balance: Prevents anterior knee shear forces
 * - Zero-impact cardio: Maintains fitness without joint stress
 * - Calf work: Improves ankle stability which affects knee alignment
 */

-- Insert Foundation knee recovery program
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
  'Foundation',
  'An 8-week low-impact strength routine designed for knee rehabilitation. Focuses on strengthening the VMO (vastus medialis oblique - the "teardrop" muscle) and hamstrings to support and stabilize the knee joint without impact or grinding. Perfect for post-injury recovery, patellar tracking issues, or chronic knee pain. Emphasizes controlled movements, isometric holds, and progressive loading.',
  'beginner',
  'recovery',
  8,
  ARRAY['Quadriceps', 'VMO', 'Hamstrings', 'Calves', 'Knee Stability'],
  true,
  true,
  NULL,
  '98d4870d-e3e4-4303-86ec-42232c2c166d',
  
  -- EXERCISE POOL: Flat array with 10 exercises
  jsonb_build_array(
    
    -- ========================================
    -- CARDIO WARM-UP (Zero/Low-Impact)
    -- ========================================
    
    -- Exercise 1: Stationary Bike
    jsonb_build_object(
      'exercise_id', '43ed5e3d-41d5-413c-bb9a-dc034ff67a11',
      'exercise_name', 'Stationary Bike',
      'exercise_data', jsonb_build_object(
        'id', '43ed5e3d-41d5-413c-bb9a-dc034ff67a11',
        'name', 'Stationary Bike',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Hamstrings',
        'tertiary_muscle', 'Glutes',
        'difficulty_level', 'Beginner'
      ),
      'sets', 1,
      'reps', '10-15 minutes',
      'rest_seconds', 0,
      'notes', 'Low-impact warm-up. Start with low resistance, maintain 80-100 RPM. Focus on smooth, pain-free pedaling. Seat height: slight knee bend at bottom. Progression: Weeks 1-2: 10 min; Weeks 3-4: 12 min; Weeks 5-6: 15 min; Weeks 7-8: Add intervals (30 sec higher resistance).',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Hamstrings', 'Cardiovascular'),
        'tertiary', jsonb_build_array('Glutes')
      )
    ),
    
    -- Exercise 2: Elliptical
    jsonb_build_object(
      'exercise_id', '4e3fceaf-d805-49c3-b192-9acb6b0e5596',
      'exercise_name', 'Elliptical',
      'exercise_data', jsonb_build_object(
        'id', '4e3fceaf-d805-49c3-b192-9acb6b0e5596',
        'name', 'Elliptical',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Hamstrings',
        'difficulty_level', 'Beginner'
      ),
      'sets', 1,
      'reps', '15-20 minutes',
      'rest_seconds', 0,
      'notes', 'Zero-impact cardio. Can substitute for bike or do as finisher. Try backward pedaling for more hamstring activation. Progression: Weeks 1-2: 15 min forward; Weeks 3-4: 18 min mixed; Weeks 5-6: 20 min with incline; Weeks 7-8: Add resistance intervals.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Cardiovascular'),
        'tertiary', jsonb_build_array('Hamstrings')
      )
    ),
    
    -- ========================================
    -- VMO ISOLATION & ACTIVATION
    -- ========================================
    
    -- Exercise 3: Wall Sit
    jsonb_build_object(
      'exercise_id', '4e69f1dc-54d4-4e95-976c-1b3486584802',
      'exercise_name', 'Wall Sit',
      'exercise_data', jsonb_build_object(
        'id', '4e69f1dc-54d4-4e95-976c-1b3486584802',
        'name', 'Wall Sit',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '30-60 seconds',
      'rest_seconds', 60,
      'notes', 'Isometric VMO activation. Back flat against wall, knees at 90 degrees over ankles. Press knees outward slightly to engage VMO. Progression: Weeks 1-2: 30 sec; Weeks 3-4: 40 sec; Weeks 5-6: 50 sec; Weeks 7-8: 60 sec or add 10 lb plate on lap.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps', 'VMO'),
        'secondary', jsonb_build_array('Glutes'),
        'tertiary', jsonb_build_array('Calves', 'Core')
      )
    ),
    
    -- Exercise 4: Spanish Squat
    jsonb_build_object(
      'exercise_id', 'ef527556-a867-42b6-a02f-f84e107aec99',
      'exercise_name', 'Spanish Squat',
      'exercise_data', jsonb_build_object(
        'id', 'ef527556-a867-42b6-a02f-f84e107aec99',
        'name', 'Spanish Squat',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'VMO',
        'tertiary_muscle', 'Glutes',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Heavy band behind knees, walk forward to create tension. Band pulls shins back as you descend 4-6 inches. Pure VMO isolation. Hold bottom 2-3 sec. Progression: Weeks 1-2: Bodyweight; Weeks 3-4: 5 lb DBs; Weeks 5-6: 10 lb DBs; Weeks 7-8: 15 lb DBs with longer holds.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps', 'VMO'),
        'secondary', jsonb_build_array('Glutes'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- CONTROLLED QUAD STRENGTHENING
    -- ========================================
    
    -- Exercise 5: HOIST Leg Extension
    jsonb_build_object(
      'exercise_id', '3eb8fb38-5648-4920-a61c-bb3d195a74c5',
      'exercise_name', 'HOIST Leg Extension',
      'exercise_data', jsonb_build_object(
        'id', '3eb8fb38-5648-4920-a61c-bb3d195a74c5',
        'name', 'HOIST Leg Extension',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'VMO',
        'tertiary_muscle', NULL,
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Controlled quad isolation. Focus on last 30 degrees of extension for VMO peak activation. Pause 1-2 sec at top. Use 2-1-2 tempo (2 up, 1 hold, 2 down). NO ballistic movements. Progression: Weeks 1-2: 30 lbs; Weeks 3-4: 40 lbs; Weeks 5-6: 50 lbs; Weeks 7-8: 60+ lbs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps', 'VMO'),
        'secondary', jsonb_build_array(),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- FUNCTIONAL STRENGTH
    -- ========================================
    
    -- Exercise 6: Step Up
    jsonb_build_object(
      'exercise_id', '325cbcda-f427-4a8e-9748-6d653ec67c70',
      'exercise_name', 'Step Up',
      'exercise_data', jsonb_build_object(
        'id', '325cbcda-f427-4a8e-9748-6d653ec67c70',
        'name', 'Step Up',
        'primary_muscle', 'Quadriceps',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Hamstrings',
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '10-12 each leg',
      'rest_seconds', 60,
      'notes', 'Functional knee strengthening. Use 6-8 inch box initially, focus on driving through heel, NOT pushing off back foot. Step down controlled. Progression: Weeks 1-2: 6" box, bodyweight; Weeks 3-4: 8" box; Weeks 5-6: 10" box or 5 lb DBs; Weeks 7-8: 12" box or 10 lb DBs.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'VMO'),
        'tertiary', jsonb_build_array('Hamstrings', 'Calves')
      )
    ),
    
    -- ========================================
    -- HAMSTRING BALANCE
    -- ========================================
    
    -- Exercise 7: Stability Ball Hamstring Curl
    jsonb_build_object(
      'exercise_id', '3ae05beb-edb7-4662-922a-3d27fce4cf18',
      'exercise_name', 'Stability Ball Hamstring Curl',
      'exercise_data', jsonb_build_object(
        'id', '3ae05beb-edb7-4662-922a-3d27fce4cf18',
        'name', 'Stability Ball Hamstring Curl',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Glutes',
        'tertiary_muscle', 'Calves',
        'difficulty_level', 'Intermediate'
      ),
      'sets', 3,
      'reps', '10-12',
      'rest_seconds', 60,
      'notes', 'Lie on back, heels on ball. Bridge up, curl ball toward glutes. Keep hips elevated throughout. Squeeze hamstrings at peak. Progression: Weeks 1-2: Partial curls; Weeks 3-4: Full curls; Weeks 5-6: Add 2-sec holds; Weeks 7-8: Single-leg attempts or weight on hips.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Glutes'),
        'tertiary', jsonb_build_array('Calves', 'Core')
      )
    ),
    
    -- Exercise 8: Seated Leg Curl
    jsonb_build_object(
      'exercise_id', 'e7612891-4f70-4902-9e03-5900da6b8781',
      'exercise_name', 'Seated Leg Curl',
      'exercise_data', jsonb_build_object(
        'id', 'e7612891-4f70-4902-9e03-5900da6b8781',
        'name', 'Seated Leg Curl',
        'primary_muscle', 'Hamstrings',
        'secondary_muscle', 'Calves',
        'tertiary_muscle', NULL,
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '12-15',
      'rest_seconds', 60,
      'notes', 'Isolated hamstring curl. Curl heels to glutes, pause 1-2 sec, control return. Balances quad strength and protects knee from anterior shear. Progression: Weeks 1-2: 40 lbs; Weeks 3-4: 50 lbs; Weeks 5-6: 60 lbs; Weeks 7-8: 70+ lbs with slower tempo.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Hamstrings'),
        'secondary', jsonb_build_array('Calves'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- ========================================
    -- ANKLE STABILITY (Knee Foundation)
    -- ========================================
    
    -- Exercise 9: Calf Raise (Standing)
    jsonb_build_object(
      'exercise_id', 'cb2dd4f1-0b00-4b31-9adf-bc5f97fe66bc',
      'exercise_name', 'Standing Calf Raise',
      'exercise_data', jsonb_build_object(
        'id', 'cb2dd4f1-0b00-4b31-9adf-bc5f97fe66bc',
        'name', 'Calf Raise (Standing)',
        'primary_muscle', 'Calves',
        'secondary_muscle', 'Gastrocnemius',
        'tertiary_muscle', NULL,
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '15-20',
      'rest_seconds', 45,
      'notes', 'Standing calf raise for gastrocnemius. Full stretch at bottom, maximum contraction at top. Ankle stability improves knee tracking. Progression: Weeks 1-2: Bodyweight or 15 lb DBs; Weeks 3-4: 20 lb DBs; Weeks 5-6: 25 lb DBs; Weeks 7-8: 30+ lb DBs or machine.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Calves', 'Gastrocnemius'),
        'secondary', jsonb_build_array(),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- Exercise 10: Calf Raise (Seated)
    jsonb_build_object(
      'exercise_id', 'c4467f1b-c463-4afd-ab89-56c677d46f82',
      'exercise_name', 'HOIST Seated Calf Raise',
      'exercise_data', jsonb_build_object(
        'id', 'c4467f1b-c463-4afd-ab89-56c677d46f82',
        'name', 'Calf Raise (Seated)',
        'primary_muscle', 'Calves',
        'secondary_muscle', 'Soleus',
        'tertiary_muscle', NULL,
        'difficulty_level', 'Beginner'
      ),
      'sets', 3,
      'reps', '15-20',
      'rest_seconds', 45,
      'notes', 'Seated calf raise targets soleus (bent-knee calf). Critical for ankle stability during walking/running. Slow tempo, full ROM. Progression: Weeks 1-2: 45 lbs; Weeks 3-4: 60 lbs; Weeks 5-6: 75 lbs; Weeks 7-8: 90+ lbs. Soleus responds well to higher reps.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Calves', 'Soleus'),
        'secondary', jsonb_build_array(),
        'tertiary', jsonb_build_array()
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- Verification queries
SELECT '✅ Foundation knee recovery program created successfully!' as status;

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
WHERE name = 'Foundation';

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
WHERE name = 'Foundation';

SELECT '📋 Program Structure Verified:' as info;
SELECT '   - Exercise count: 10 (flat array)' as detail1;
SELECT '   - Program type: recovery' as detail2;
SELECT '   - Difficulty: beginner' as detail3;
SELECT '   - Duration: 8 weeks progressive' as detail4;
SELECT '   - Focus: VMO strengthening, hamstring balance, zero-impact knee rehab' as detail5;
