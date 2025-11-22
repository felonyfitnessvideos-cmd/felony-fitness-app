/**
 * @file TEMPLATE-program-structure.sql
 * @description Reusable template for creating training programs in the correct format
 * @date 2025-11-22
 * @updated 2025-11-22 - Verified against schema.sql and exercises table structure
 * 
 * CRITICAL: This is the CORRECT structure that the UI expects
 * 
 * SCHEMA VERIFICATION:
 * Before creating programs, verify column names in schema.sql:
 * - programs table columns: id, name, description, created_at, is_active, 
 *   difficulty_level, exercise_pool, program_type, estimated_weeks,
 *   target_muscle_groups, is_template, trainer_id, created_by, updated_at
 * 
 * EXERCISES TABLE STRUCTURE:
 * - Correct column names: equipment_needed (NOT equipment)
 * - Column order: id, name, description, instructions, equipment_needed, 
 *   exercise_type, thumbnail_url, video_url, created_at, updated_at,
 *   primary_muscle, secondary_muscle, tertiary_muscle, difficulty_level
 * 
 * EXERCISES TABLE CHECK CONSTRAINTS:
 * - exercise_type: 'Free Weight', 'Machine', 'Bodyweight', 'Cable'
 *   (NOTE: 'cardio' is NOT valid - use 'Machine' for cardio equipment)
 * - difficulty_level: 'Beginner', 'Intermediate', 'Advanced'
 *   (NOTE: Case-sensitive - use proper capitalization)
 * 
 * KEY REQUIREMENTS:
 * 1. exercise_pool must be a FLAT ARRAY (not nested by days)
 * 2. Each exercise object MUST include:
 *    - exercise_id: UUID from exercises table
 *    - exercise_name: Display name for UI
 *    - exercise_data: Full exercise object with all fields (recommended)
 *    - sets: Number of sets
 *    - reps: Rep range as string (e.g., "6-8", "12-15", "AMRAP", "45-60 sec")
 *    - rest_seconds: Rest time between sets
 *    - notes: Exercise-specific instructions (progression, form cues, etc.)
 *    - muscle_groups: Object with primary/secondary/tertiary arrays
 * 
 * IMPORTANT SQL SYNTAX:
 * - Escape apostrophes with double apostrophes: "don''t" not "don't"
 * - Escape possessives: "Farmer''s Walk" not "Farmer's Walk"
 * 
 * DAY GROUPING:
 * - Days are created by a SEPARATE FUNCTION from the exercise pool
 * - Do NOT nest exercises under day objects
 * - If day grouping is needed, add day_number and day_name properties to each exercise
 * 
 * EXERCISE DATA RETRIEVAL:
 * Use this query to get exercise UUIDs and data:
 * 
 * SELECT id, name, primary_muscle, secondary_muscle, tertiary_muscle, 
 *        difficulty_level, equipment_needed, description
 * FROM exercises
 * WHERE name IN ('Exercise Name 1', 'Exercise Name 2', ...);
 * 
 * VALID ENUM VALUES (from schema.sql):
 * - difficulty_level: 'beginner', 'intermediate', 'advanced'
 * - program_type: 'strength', 'hypertrophy', 'endurance', 'flexibility', 'recovery'
 *   (NOTE: 'balance' is NOT valid - use 'strength' for functional/balance programs)
 */

-- Step 1: Retrieve exercise data (replace with your exercise names)
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
    'Barbell Bench Press',
    'Barbell Squat',
    'Conventional Deadlift'
    -- Add all your program exercises here
  )
)

-- Step 2: Insert the program
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
  gen_random_uuid(), -- Or specify a UUID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  'Program Name Here',
  'Detailed program description. Include target audience, training philosophy, expected outcomes, and any special notes.',
  'beginner', -- Options: 'beginner', 'intermediate', 'advanced'
  'strength', -- Options: 'strength', 'hypertrophy', 'endurance', 'flexibility', 'recovery'
  8, -- estimated_weeks: Program duration in weeks
  ARRAY['Muscle Group 1', 'Muscle Group 2'], -- e.g., ARRAY['Chest', 'Back', 'Legs']
  true, -- is_template: true if available for all trainers
  true, -- is_active: true to make it visible
  NULL, -- trainer_id: NULL for templates, specific trainer UUID for personal programs
  '98d4870d-e3e4-4303-86ec-42232c2c166d', -- created_by: Replace with your user UUID
  
  -- EXERCISE POOL: Flat array of exercise objects
  jsonb_build_array(
    
    -- EXAMPLE EXERCISE 1
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_data WHERE name = 'Barbell Bench Press'),
      'exercise_name', 'Barbell Bench Press',
      'exercise_data', jsonb_build_object(
        'id', (SELECT id FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'name', 'Barbell Bench Press',
        'primary_muscle', (SELECT primary_muscle FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'secondary_muscle', (SELECT secondary_muscle FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'tertiary_muscle', (SELECT tertiary_muscle FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'difficulty_level', (SELECT difficulty_level FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'equipment_needed', (SELECT equipment_needed FROM exercise_data WHERE name = 'Barbell Bench Press'),
        'description', (SELECT description FROM exercise_data WHERE name = 'Barbell Bench Press')
      ),
      'sets', 4,
      'reps', '6-8',
      'rest_seconds', 180,
      'notes', 'Focus on controlled eccentric (3 sec), explosive concentric. Maintain scapular retraction throughout.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Middle Chest'),
        'secondary', jsonb_build_array('Triceps', 'Front Deltoids'),
        'tertiary', jsonb_build_array()
      )
    ),
    
    -- EXAMPLE EXERCISE 2
    jsonb_build_object(
      'exercise_id', (SELECT id FROM exercise_data WHERE name = 'Barbell Squat'),
      'exercise_name', 'Barbell Squat',
      'exercise_data', jsonb_build_object(
        'id', (SELECT id FROM exercise_data WHERE name = 'Barbell Squat'),
        'name', 'Barbell Squat',
        'primary_muscle', (SELECT primary_muscle FROM exercise_data WHERE name = 'Barbell Squat'),
        'secondary_muscle', (SELECT secondary_muscle FROM exercise_data WHERE name = 'Barbell Squat'),
        'tertiary_muscle', (SELECT tertiary_muscle FROM exercise_data WHERE name = 'Barbell Squat'),
        'difficulty_level', (SELECT difficulty_level FROM exercise_data WHERE name = 'Barbell Squat'),
        'equipment_needed', (SELECT equipment_needed FROM exercise_data WHERE name = 'Barbell Squat'),
        'description', (SELECT description FROM exercise_data WHERE name = 'Barbell Squat')
      ),
      'sets', 4,
      'reps', '8-10',
      'rest_seconds', 180,
      'notes', 'Squat to parallel or slightly below. Drive through heels, keep chest up.',
      'muscle_groups', jsonb_build_object(
        'primary', jsonb_build_array('Quadriceps'),
        'secondary', jsonb_build_array('Glutes', 'Hamstrings'),
        'tertiary', jsonb_build_array()
      )
    )
    
    -- Add more exercises here following the same pattern
    -- Use commas between exercise objects
  ),
  
  NOW(),
  NOW()
);

-- Step 3: Verify the program
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
WHERE name = 'Program Name Here';

-- Step 4: Inspect first exercise in pool (verify structure)
SELECT 
  name,
  exercise_pool->0 as first_exercise
FROM programs
WHERE name = 'Program Name Here';

SELECT '✅ Program created successfully!' as status;
SELECT '📋 Next Steps:' as info;
SELECT '1. Verify exercise_count matches expected number' as step1;
SELECT '2. Check first_exercise structure has exercise_id, exercise_name, exercise_data' as step2;
SELECT '3. Test program assignment in UI' as step3;
SELECT '4. Verify exercises display correctly (not as "unknown")' as step4;

/**
 * OPTIONAL: If you need day-based grouping in the UI
 * 
 * Add these properties to each exercise object:
 * - 'day_number', 1 (which day of the program)
 * - 'day_name', 'Upper Body A - Push Focus'
 * 
 * Example:
 * jsonb_build_object(
 *   'exercise_id', ...,
 *   'exercise_name', ...,
 *   'day_number', 1,
 *   'day_name', 'Upper Body A - Push Focus',
 *   ...rest of properties
 * )
 * 
 * The UI can then filter/group by day_number if needed.
 */
