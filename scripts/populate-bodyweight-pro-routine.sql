/**
 * @file populate-bodyweight-pro-routine.sql
 * @description Populate Bodyweight Pro routine with 8 exercises covering all major muscle groups
 * @date 2025-11-22
 * 
 * ROUTINE: Bodyweight Pro (Advanced)
 * ID: c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2
 * DURATION: 60 minutes
 * EXERCISES: 8 total (with warmup sets for major muscle groups)
 * 
 * MUSCLE GROUP COVERAGE:
 * - Upper Push: Push-ups (Chest)
 * - Upper Pull: Pull-ups (Back)
 * - Lower Push: Pistol Squats (Legs/Glutes)
 * - Lower Pull: Nordic Curls (Hamstrings)
 * - Core: Plank variations
 * - Full Body: Burpees
 * 
 * STRUCTURE:
 * - Each major muscle group gets 2 warmup sets (is_warmup = true, target_intensity_pct = 50-60)
 * - Working sets have target_intensity_pct = 75-85
 */

-- First, let's check which bodyweight exercises exist in the database
-- You'll need to run this query first to get the actual exercise IDs
-- Then update the INSERT statements below with the correct IDs

/*
-- QUERY TO GET EXERCISE IDs (RUN THIS FIRST):
SELECT id, name, primary_muscle, equipment_needed
FROM exercises
WHERE equipment_needed = 'Bodyweight'
   OR name ILIKE ANY(ARRAY['%push-up%', '%pull-up%', '%squat%', '%lunge%', '%plank%', '%dip%', '%burpee%'])
ORDER BY primary_muscle, name;
*/

-- ===========================================================================
-- BODYWEIGHT PRO ROUTINE EXERCISES
-- ===========================================================================

-- NOTE: Replace the UUID values below with actual exercise IDs from your exercises table
-- The structure shown here is the correct format for pro_routine_exercises table

INSERT INTO public.pro_routine_exercises 
(routine_id, exercise_id, target_sets, target_reps, rest_seconds, exercise_order, is_warmup, target_intensity_pct, notes)
VALUES

-- ===========================================================================
-- EXERCISE 1: PUSH-UPS (CHEST) - WARMUP SET 1
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',  -- routine_id (Bodyweight Pro)
    '3222d2dc-d034-4f8f-8240-65411a3af16a',        -- exercise_id (Push-up)
    1,                                         -- target_sets
    '10',                                      -- target_reps
    60,                                        -- rest_seconds
    1,                                         -- exercise_order
    true,                                      -- is_warmup
    50,                                        -- target_intensity_pct (warmup)
    'Warmup: Standard push-ups, controlled tempo. Focus on form and range of motion.'
),

-- ===========================================================================
-- EXERCISE 2: PUSH-UPS (CHEST) - WARMUP SET 2
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '3222d2dc-d034-4f8f-8240-65411a3af16a',
    1,
    '12',
    60,
    2,
    true,
    60,
    'Warmup: Increase volume slightly. Prepare chest and triceps for working sets.'
),

-- ===========================================================================
-- EXERCISE 3: PUSH-UPS (CHEST) - WORKING SETS
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '3222d2dc-d034-4f8f-8240-65411a3af16a',
    4,
    '15-20',
    90,
    3,
    false,
    80,
    'Working sets: Explosive concentric, 2-second eccentric. Add variations (diamond, wide, decline) as needed.'
),

-- ===========================================================================
-- EXERCISE 4: PULL-UPS (BACK) - WARMUP SET 1
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '612abdb9-1f0e-48a7-bc0a-2dd877283d93',
    1,
    '5',
    90,
    4,
    true,
    50,
    'Warmup: Dead hang to full pull-up. Focus on scapular engagement and full ROM.'
),

-- ===========================================================================
-- EXERCISE 5: PULL-UPS (BACK) - WARMUP SET 2
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '612abdb9-1f0e-48a7-bc0a-2dd877283d93',
    1,
    '6-8',
    90,
    5,
    true,
    60,
    'Warmup: Increase volume. Prepare lats and biceps for high-intensity work.'
),

-- ===========================================================================
-- EXERCISE 6: PULL-UPS (BACK) - WORKING SETS
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '612abdb9-1f0e-48a7-bc0a-2dd877283d93',
    4,
    '8-12',
    120,
    6,
    false,
    85,
    'Working sets: Strict form, chest to bar. Add weight vest if completing 12+ reps easily.'
),

-- ===========================================================================
-- EXERCISE 7: PISTOL SQUATS (LEGS) - WARMUP SET 1
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'a76fe018-99a7-4b33-9e08-089a712317e2',
    1,
    '5 each leg',
    90,
    7,
    true,
    50,
    'Warmup: Use assistance (TRX/pole) if needed. Focus on balance and control.'
),

-- ===========================================================================
-- EXERCISE 8: PISTOL SQUATS (LEGS) - WARMUP SET 2
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'a76fe018-99a7-4b33-9e08-089a712317e2',
    1,
    '6 each leg',
    90,
    8,
    true,
    60,
    'Warmup: Reduce assistance. Prepare quads, glutes, and stabilizers.'
),

-- ===========================================================================
-- EXERCISE 9: PISTOL SQUATS (LEGS) - WORKING SETS
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'a76fe018-99a7-4b33-9e08-089a712317e2',
    4,
    '8-10 each leg',
    120,
    9,
    false,
    80,
    'Working sets: Full ROM, knee tracking over toes. Controlled descent, explosive ascent.'
),

-- ===========================================================================
-- EXERCISE 10: BURPEES (FULL BODY) - NO WARMUP (ALREADY WARMED UP)
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'd68d11dc-c7c0-4527-b9d7-29af366c92d9',
    4,
    '15-20',
    60,
    10,
    false,
    75,
    'Conditioning: Fast pace, maintain form. Jump explosively, chest to floor on push-up.'
),

-- ===========================================================================
-- EXERCISE 11: PIKE PUSH-UPS (SHOULDERS) - WARMUP SET 1
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '8ec89fc4-f792-4e7a-9234-22cc95d3c758',
    1,
    '8',
    60,
    11,
    true,
    50,
    'Warmup: Hips high, head between arms. Focus on shoulder activation.'
),

-- ===========================================================================
-- EXERCISE 12: PIKE PUSH-UPS (SHOULDERS) - WARMUP SET 2
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '8ec89fc4-f792-4e7a-9234-22cc95d3c758',
    1,
    '10',
    60,
    12,
    true,
    60,
    'Warmup: Increase volume. Prepare deltoids for overhead pressing pattern.'
),

-- ===========================================================================
-- EXERCISE 13: PIKE PUSH-UPS (SHOULDERS) - WORKING SETS
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '8ec89fc4-f792-4e7a-9234-22cc95d3c758',
    4,
    '12-15',
    90,
    13,
    false,
    80,
    'Working sets: Elevate feet for progression. Head touches floor gently, press explosively.'
),

-- ===========================================================================
-- EXERCISE 14: HANGING LEG RAISES (CORE) - WARMUP SET 1
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'f1551415-f21c-441e-ad68-348d55de2fb5',
    1,
    '8',
    60,
    14,
    true,
    50,
    'Warmup: Bent knee raises to 90 degrees. Focus on core engagement, minimize swing.'
),

-- ===========================================================================
-- EXERCISE 15: HANGING LEG RAISES (CORE) - WARMUP SET 2
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'f1551415-f21c-441e-ad68-348d55de2fb5',
    1,
    '10',
    60,
    15,
    true,
    60,
    'Warmup: Increase ROM. Prepare abs and hip flexors for full leg raises.'
),

-- ===========================================================================
-- EXERCISE 16: HANGING LEG RAISES (CORE) - WORKING SETS
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'f1551415-f21c-441e-ad68-348d55de2fb5',
    4,
    '12-15',
    90,
    16,
    false,
    85,
    'Working sets: Straight legs to 90 degrees. Control descent, avoid momentum.'
),

-- ===========================================================================
-- EXERCISE 17: WALKING LUNGES (LEGS) - NO WARMUP (ALREADY WARMED)
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    '5f6f0e59-3427-4fb9-a723-69f0d2422124',
    4,
    '20 each leg',
    90,
    17,
    false,
    75,
    'Working sets: Long strides, knee nearly touches ground. Upright torso, drive through front heel.'
),

-- ===========================================================================
-- EXERCISE 18: PLANK (CORE) - FINISHER
-- ===========================================================================
(
    'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2',
    'a6147487-2eed-4289-873c-d706d3747bd6',
    3,
    '60-90 sec',
    60,
    18,
    false,
    75,
    'Finisher: Forearm plank, neutral spine. Add variations (side plank, shoulder taps) in later sets.'
);

-- ===========================================================================
-- VERIFICATION QUERY
-- ===========================================================================

-- After inserting, verify the exercises were added correctly
SELECT 
    pre.exercise_order,
    e.name as exercise_name,
    pre.target_sets,
    pre.target_reps,
    pre.rest_seconds,
    pre.is_warmup,
    pre.target_intensity_pct,
    pre.notes
FROM pro_routine_exercises pre
JOIN exercises e ON e.id = pre.exercise_id
WHERE pre.routine_id = 'c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2'
ORDER BY pre.exercise_order;

-- ===========================================================================
-- INSTRUCTIONS
-- ===========================================================================

/*
BEFORE RUNNING THIS FILE:

1. Get exercise IDs from your exercises table:
   
   SELECT id, name, primary_muscle, equipment_needed
   FROM exercises
   WHERE name IN (
       'Push-up', 'Pull-up', 'Pistol Squat', 'Burpee',
       'Pike Push-up', 'Hanging Leg Raise', 'Walking Lunge', 'Plank'
   )
   OR equipment_needed = 'Bodyweight'
   ORDER BY name;

2. Replace all "REPLACE_WITH_*_EXERCISE_ID" with actual UUIDs from step 1

3. If any exercises don't exist, you'll need to create them first

4. Run this SQL file in Supabase SQL Editor

5. Run the verification query at the bottom to confirm 18 rows inserted

EXPECTED RESULT:
- 18 total exercises (2 warmup + 1 working set block for major muscles)
- Covers: Chest, Back, Legs, Shoulders, Core, Full Body
- Duration: ~60 minutes (warmup 10 min, working 45 min, cooldown 5 min)
- Advanced difficulty: High-skill bodyweight movements
*/
