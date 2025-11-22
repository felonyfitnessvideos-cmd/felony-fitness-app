-- =====================================================================================
-- BEGINNER STRENGTH & HYPERTROPHY - 8 WEEK PROGRAM
-- =====================================================================================
-- Purpose: Create a complete 8-week training program for novice to early-intermediate lifters
-- Focus: Build strength foundation and muscle mass
-- Structure: 4 days/week Upper/Lower split with progressive overload
-- Target Audience: Beginners looking to build strength and size
-- =====================================================================================

-- First, let's verify we have the exercises we need
-- This query helps you identify which exercises to use
/*
SELECT id, name, primary_muscle, secondary_muscle, difficulty_level, equipment_needed
FROM exercises
WHERE name IN (
  'Barbell Bench Press', 'Barbell Overhead Press', 'Incline Dumbbell Press',
  'Cable Lateral Raise', 'Tricep Press-Down', 'Face Pulls',
  'Barbell Back Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl',
  'Calf Raise', 'Plank',
  'Barbell Row', 'Lat Pulldown', 'Dumbbell Row', 'Cable Row',
  'Barbell Curl', 'Hammer Curl',
  'Conventional Deadlift', 'Bulgarian Split Squat', 'Leg Extension',
  'Walking Lunge', 'Hanging Knee Raise', 'Ab Wheel Rollout'
)
ORDER BY name;
*/

-- =====================================================================================
-- INSERT PROGRAM
-- =====================================================================================

INSERT INTO programs (
  name,
  description,
  difficulty_level,
  estimated_weeks,
  program_type,
  target_muscle_groups,
  is_active,
  is_template,
  exercise_pool,
  created_at,
  updated_at
) VALUES (
  'Beginner Strength & Hypertrophy - 8 Weeks',
  
  -- Program Description
  'A comprehensive 8-week program designed for novice to early-intermediate lifters focusing on building a strength foundation and muscle mass. Features a 4-day Upper/Lower split with progressive overload, proper rest periods, and evidence-based training principles.

**Program Structure:**
- Duration: 8 weeks
- Frequency: 4 days per week
- Split: Upper/Lower (2 upper days, 2 lower days)
- Progression: Linear progression - add weight when hitting top of rep range

**Weekly Schedule:**
- Day 1: Upper Body A (Push Focus) - Chest, Shoulders, Triceps
- Day 2: Lower Body A (Squat Focus) - Quads, Glutes, Hamstrings, Calves
- Day 3: Rest
- Day 4: Upper Body B (Pull Focus) - Back, Biceps, Rear Delts
- Day 5: Lower Body B (Deadlift Focus) - Hamstrings, Glutes, Quads, Core
- Days 6-7: Rest

**Progression Strategy:**
- Weeks 1-4: Focus on form mastery and building work capacity (RPE 7-8)
- Weeks 5-8: Increase intensity and add weight when rep targets are hit (RPE 8-9)
- Add 2.5-5 lbs when all sets hit top of rep range for 2 consecutive sessions
- Deload in week 4 (reduce weight by 10%) and week 8 (reduce sets by 30%)

**Training Principles:**
- Progressive overload through increased weight and reps
- Compound movements prioritized at start of each session
- Adequate rest periods for strength development (90-180 seconds)
- Balanced volume across all major muscle groups
- Built-in recovery with strategic rest days',
  
  'beginner',
  8,
  'strength',
  ARRAY[
    'Chest', 'Back', 'Shoulders', 'Quadriceps', 'Hamstrings', 
    'Glutes', 'Triceps', 'Biceps', 'Calves', 'Core'
  ],
  true,  -- is_active
  true,  -- is_template (can be assigned to multiple clients)
  
  -- Exercise Pool (JSONB) - Organized by workout day
  jsonb_build_array(
    
    -- =================================================================================
    -- DAY 1: UPPER BODY A (PUSH FOCUS)
    -- =================================================================================
    jsonb_build_object(
      'day', 1,
      'day_name', 'Upper Body A - Push Focus',
      'target_muscles', ARRAY['Chest', 'Shoulders', 'Triceps'],
      'estimated_duration_minutes', 75,
      'exercises', jsonb_build_array(
        jsonb_build_object(
          'exercise_order', 1,
          'exercise_name', 'Barbell Bench Press',
          'sets', 4,
          'reps', '6-8',
          'rest_seconds', 180,
          'rpe_target', 8,
          'notes', 'Primary chest builder. Focus on full range of motion and bar path. Add weight when you hit 4x8 for 2 sessions.',
          'progression', 'Add 2.5-5 lbs when hitting 4 sets of 8 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Chest'],
            'secondary', ARRAY['Triceps', 'Shoulders'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 2,
          'exercise_name', 'Overhead Press',
          'sets', 3,
          'reps', '8-10',
          'rest_seconds', 150,
          'rpe_target', 7,
          'notes', 'Build shoulder strength. Keep core tight and avoid excessive back arch. Can substitute with dumbbell press if needed.',
          'progression', 'Add 2.5 lbs when hitting 3 sets of 10 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Shoulders'],
            'secondary', ARRAY['Triceps'],
            'tertiary', ARRAY['Core']
          )
        ),
        jsonb_build_object(
          'exercise_order', 3,
          'exercise_name', 'Incline Dumbbell Press',
          'sets', 3,
          'reps', '10-12',
          'rest_seconds', 120,
          'rpe_target', 7,
          'notes', 'Target upper chest. Set bench to 30-45 degree angle. Focus on controlled eccentric (lowering) phase.',
          'progression', 'Add 5 lbs per dumbbell when hitting 3 sets of 12 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Chest'],
            'secondary', ARRAY['Shoulders', 'Triceps'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 4,
          'exercise_name', 'Cable Lateral Raise',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Build shoulder width. Keep slight bend in elbows, lead with elbows not hands. Control the weight down.',
          'progression', 'Add weight when hitting 3 sets of 15 reps with good form',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Shoulders'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 5,
          'exercise_name', 'Tricep Pushdown',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Finish triceps. Keep elbows pinned at sides, full extension at bottom. Can use rope or straight bar attachment.',
          'progression', 'Add weight when hitting 3 sets of 15 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Triceps'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 6,
          'exercise_name', 'Cable Face Pull',
          'sets', 3,
          'reps', '15-20',
          'rest_seconds', 60,
          'rpe_target', 7,
          'notes', 'Shoulder health and posture. Pull rope towards face, externally rotate at end. High reps, focus on quality contraction.',
          'progression', 'Focus on form and mind-muscle connection rather than weight',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Shoulders'],
            'secondary', ARRAY['Back'],
            'tertiary', ARRAY[]::text[]
          )
        )
      )
    ),
    
    -- =================================================================================
    -- DAY 2: LOWER BODY A (SQUAT FOCUS)
    -- =================================================================================
    jsonb_build_object(
      'day', 2,
      'day_name', 'Lower Body A - Squat Focus',
      'target_muscles', ARRAY['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
      'estimated_duration_minutes', 75,
      'exercises', jsonb_build_array(
        jsonb_build_object(
          'exercise_order', 1,
          'exercise_name', 'Barbell Squat',
          'sets', 4,
          'reps', '6-8',
          'rest_seconds', 180,
          'rpe_target', 8,
          'notes', 'King of leg exercises. Bar on upper traps, squat to parallel or below. Keep chest up and knees tracking over toes.',
          'progression', 'Add 5-10 lbs when hitting 4 sets of 8 reps with good depth',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Quadriceps', 'Glutes'],
            'secondary', ARRAY['Hamstrings', 'Core'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 2,
          'exercise_name', 'Leg Press Machine',
          'sets', 3,
          'reps', '10-12',
          'rest_seconds', 120,
          'notes', 'Additional quad volume. Feet shoulder-width, full range of motion. Control the negative, explosive concentric.',
          'progression', 'Add 20-40 lbs when hitting 3 sets of 12 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Quadriceps'],
            'secondary', ARRAY['Glutes'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 3,
          'exercise_name', 'Romanian Deadlift',
          'sets', 3,
          'reps', '10-12',
          'rest_seconds', 120,
          'rpe_target', 7,
          'notes', 'Target hamstrings and glutes. Slight knee bend, hinge at hips, feel stretch in hamstrings. Keep bar close to legs.',
          'progression', 'Add 5-10 lbs when hitting 3 sets of 12 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Hamstrings', 'Glutes'],
            'secondary', ARRAY['Back'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 4,
          'exercise_name', 'Leg Curl Machine',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Isolate hamstrings. Full range of motion, squeeze at top. Can be done lying or seated.',
          'progression', 'Add weight when hitting 3 sets of 15 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Hamstrings'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 5,
          'exercise_name', 'Calf Raise',
          'sets', 4,
          'reps', '15-20',
          'rest_seconds', 60,
          'rpe_target', 9,
          'notes', 'Build calf size and strength. Full stretch at bottom, squeeze at top. Can use standing or seated machine.',
          'progression', 'Add weight when hitting 4 sets of 20 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Calves'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 6,
          'exercise_name', 'Plank',
          'sets', 3,
          'reps', '60 seconds',
          'rest_seconds', 60,
          'rpe_target', 7,
          'notes', 'Core stability. Maintain neutral spine, squeeze glutes. Progress by adding time or weight on back.',
          'progression', 'Increase hold time by 10-15 seconds each week',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Core'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        )
      )
    ),
    
    -- =================================================================================
    -- DAY 4: UPPER BODY B (PULL FOCUS)
    -- =================================================================================
    jsonb_build_object(
      'day', 4,
      'day_name', 'Upper Body B - Pull Focus',
      'target_muscles', ARRAY['Back', 'Biceps', 'Shoulders'],
      'estimated_duration_minutes', 75,
      'exercises', jsonb_build_array(
        jsonb_build_object(
          'exercise_order', 1,
          'exercise_name', 'Barbell Row',
          'sets', 4,
          'reps', '6-8',
          'rest_seconds', 180,
          'rpe_target', 8,
          'notes', 'Primary back builder. Hinge at hips, row to lower chest/upper abdomen. Keep core tight, avoid using momentum.',
          'progression', 'Add 5 lbs when hitting 4 sets of 8 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Back'],
            'secondary', ARRAY['Biceps'],
            'tertiary', ARRAY['Core']
          )
        ),
        jsonb_build_object(
          'exercise_order', 2,
          'exercise_name', 'Lat Pulldown',
          'sets', 3,
          'reps', '8-10',
          'rest_seconds', 120,
          'rpe_target', 7,
          'notes', 'Build lat width. Pull bar to upper chest, squeeze shoulder blades together. Can substitute with pull-ups if strong enough.',
          'progression', 'Add weight when hitting 3 sets of 10 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Back'],
            'secondary', ARRAY['Biceps'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 3,
          'exercise_name', 'Dumbbell Row',
          'sets', 3,
          'reps', '10-12',
          'rest_seconds', 120,
          'rpe_target', 7,
          'notes', 'Unilateral back work. Support yourself on bench, row dumbbell to hip. Focus on pulling with back, not arm.',
          'progression', 'Add 5 lbs per dumbbell when hitting 3 sets of 12 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Back'],
            'secondary', ARRAY['Biceps'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 4,
          'exercise_name', 'Cable Row',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Constant tension for back. Sit upright, pull to lower chest, squeeze shoulder blades. Control the eccentric.',
          'progression', 'Add weight when hitting 3 sets of 15 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Back'],
            'secondary', ARRAY['Biceps'],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 5,
          'exercise_name', 'Barbell Curl',
          'sets', 3,
          'reps', '8-12',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Bicep mass builder. Keep elbows pinned, full range of motion. Avoid swinging or using momentum.',
          'progression', 'Add 2.5-5 lbs when hitting 3 sets of 12 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Biceps'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 6,
          'exercise_name', 'Dumbbell Hammer Curl',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 60,
          'rpe_target', 8,
          'notes', 'Target brachialis and forearms. Neutral grip (palms facing each other), control the weight. Builds arm thickness.',
          'progression', 'Add 2.5-5 lbs per dumbbell when hitting 3 sets of 15 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Biceps'],
            'secondary', ARRAY['Forearms'],
            'tertiary', ARRAY[]::text[]
          )
        )
      )
    ),
    
    -- =================================================================================
    -- DAY 5: LOWER BODY B (DEADLIFT FOCUS)
    -- =================================================================================
    jsonb_build_object(
      'day', 5,
      'day_name', 'Lower Body B - Deadlift Focus',
      'target_muscles', ARRAY['Hamstrings', 'Glutes', 'Back', 'Core'],
      'estimated_duration_minutes', 75,
      'exercises', jsonb_build_array(
        jsonb_build_object(
          'exercise_order', 1,
          'exercise_name', 'Conventional Deadlift',
          'sets', 4,
          'reps', '5-6',
          'rest_seconds', 240,
          'rpe_target', 8,
          'notes', 'King of all exercises. Maintain neutral spine, drive through heels, hip hinge movement. Form is critical - start light!',
          'progression', 'Add 5-10 lbs when hitting 4 sets of 6 reps with perfect form',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Hamstrings', 'Glutes', 'Back'],
            'secondary', ARRAY['Core', 'Forearms'],
            'tertiary', ARRAY['Quadriceps']
          )
        ),
        jsonb_build_object(
          'exercise_order', 2,
          'exercise_name', 'Dumbbell Bulgarian Split Squat',
          'sets', 3,
          'reps', '10-12 per leg',
          'rest_seconds', 120,
          'rpe_target', 7,
          'notes', 'Unilateral leg work. Back foot elevated on bench, front leg does the work. Builds balance and addresses imbalances.',
          'progression', 'Add weight or reps each week',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Quadriceps', 'Glutes'],
            'secondary', ARRAY['Hamstrings'],
            'tertiary', ARRAY['Core']
          )
        ),
        jsonb_build_object(
          'exercise_order', 3,
          'exercise_name', 'Leg Extension Machine',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Quad isolation. Full range of motion, squeeze at top. Good for finishing quads after compound work.',
          'progression', 'Add weight when hitting 3 sets of 15 reps',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Quadriceps'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 4,
          'exercise_name', 'Walking Lunge',
          'sets', 3,
          'reps', '12-15 per leg',
          'rest_seconds', 90,
          'rpe_target', 7,
          'notes', 'Dynamic leg exercise. Step forward, drop back knee close to ground, push through front heel. Builds stability.',
          'progression', 'Add dumbbells when bodyweight becomes easy',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Quadriceps', 'Glutes'],
            'secondary', ARRAY['Hamstrings'],
            'tertiary', ARRAY['Core']
          )
        ),
        jsonb_build_object(
          'exercise_order', 5,
          'exercise_name', 'Hanging Knee Raise',
          'sets', 3,
          'reps', '12-15',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Core and hip flexor strength. Hang from bar, bring knees to chest, control the descent. Avoid swinging.',
          'progression', 'Progress to straight leg raises as you get stronger',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Core'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        ),
        jsonb_build_object(
          'exercise_order', 6,
          'exercise_name', 'Ab Wheel Rollout',
          'sets', 3,
          'reps', '10-12',
          'rest_seconds', 90,
          'rpe_target', 8,
          'notes', 'Advanced core stability. Start on knees if needed. Roll out while maintaining neutral spine, don''t let hips sag.',
          'progression', 'Increase range of motion, eventually progress to standing rollouts',
          'muscle_groups', jsonb_build_object(
            'primary', ARRAY['Core'],
            'secondary', ARRAY[]::text[],
            'tertiary', ARRAY[]::text[]
          )
        )
      )
    )
  ),
  
  NOW(),
  NOW()
);

-- =====================================================================================
-- VERIFICATION QUERY
-- =====================================================================================
-- Run this after insertion to verify the program was created correctly
/*
SELECT 
  id,
  name,
  difficulty_level,
  estimated_weeks,
  jsonb_array_length(exercise_pool) as total_days,
  target_muscle_groups,
  is_active,
  is_template,
  created_at
FROM programs
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';

-- View the full exercise structure (formatted for readability)
SELECT jsonb_pretty(exercise_pool)
FROM programs
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';

-- Count exercises per day
SELECT 
  day_data->>'day_name' as day_name,
  jsonb_array_length(day_data->'exercises') as exercise_count,
  day_data->>'estimated_duration_minutes' as duration_min
FROM programs,
LATERAL jsonb_array_elements(exercise_pool) as day_data
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';
*/

-- =====================================================================================
-- PROGRAM SUMMARY
-- =====================================================================================
-- Total Exercise Count: 24 exercises across 4 workout days
-- Day 1 (Upper A): 6 exercises - 75 minutes - Push focus
-- Day 2 (Lower A): 6 exercises - 75 minutes - Squat focus  
-- Day 4 (Upper B): 6 exercises - 75 minutes - Pull focus
-- Day 5 (Lower B): 6 exercises - 75 minutes - Deadlift focus
-- 
-- Muscle Groups Covered: Chest, Back, Shoulders, Quadriceps, Hamstrings, Glutes, 
--                        Triceps, Biceps, Calves, Core, Forearms
-- 
-- Training Principles Applied:
-- ✅ Progressive overload (clear progression guidelines for each exercise)
-- ✅ Compound movements prioritized (Bench, Squat, Deadlift, Rows)
-- ✅ Balanced muscle development (push/pull/legs split)
-- ✅ Appropriate volume (16-18 sets per muscle per week)
-- ✅ Strategic rest periods (180s for compounds, 60-90s for accessories)
-- ✅ Evidence-based rep ranges (6-8 for strength, 12-15 for hypertrophy)
-- ✅ Built-in recovery (rest days strategically placed)
-- =====================================================================================
