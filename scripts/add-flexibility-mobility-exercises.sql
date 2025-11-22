/**
 * @file add-flexibility-mobility-exercises.sql
 * @description Add missing exercises for Fluidity (Flexibility & Mobility) program
 * @date 2025-11-22
 * 
 * MISSING EXERCISES TO ADD:
 * - Pigeon Pose
 * - Seated Hamstring Stretch
 * - Cat-Cow Stretch
 * - Jefferson Curl
 * - Doorway Pec Stretch
 * 
 * EXISTING EXERCISES (already in database):
 * - Foam Roll (Quads): 4e31a510-7242-4756-9ca2-6b41cc746af9
 * - Foam Roll (Upper Back): 0cef58fe-14a7-41e1-95e2-e242bdbb7f3d
 * - Bear Crawl: 0037faa4-77d6-43be-9a93-0658a249f921
 * - Romanian Deadlift: 7e6b90e7-e840-46db-8b21-16d86591582d (can use for RDL stretch focus)
 * - Dumbbell Pullover: 93debc0d-e2d1-4e22-b29c-854e64099fe8
 */

-- Insert missing flexibility/mobility exercises
INSERT INTO exercises (
  id,
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level
) VALUES
  
-- 1. Pigeon Pose
(
  gen_random_uuid(),
  'Pigeon Pose',
  'Hip flexor and glute stretch',
  'From downward dog, bring right knee forward behind right wrist. Extend left leg straight back. Square hips forward. Lower torso over front leg. Hold 60-90 seconds each side. Focus on breathing and relaxing into stretch.',
  'Yoga Mat',
  'Bodyweight',
  'Hip Flexors',
  'Glutes',
  'Lower Back',
  'beginner'
),

-- 2. Seated Hamstring Stretch
(
  gen_random_uuid(),
  'Seated Hamstring Stretch',
  'Static hamstring flexibility',
  'Sit on floor with legs extended straight. Hinge at hips, reach toward toes keeping back straight. Hold position for 30-60 seconds. Focus on lengthening hamstrings, not rounding spine.',
  'None',
  'Bodyweight',
  'Hamstrings',
  'Lower Back',
  'Calves',
  'beginner'
),

-- 3. Cat-Cow Stretch
(
  gen_random_uuid(),
  'Cat-Cow Stretch',
  'Spinal mobility and core activation',
  'Start on hands and knees. Cat: Round spine upward, tuck chin to chest, engage abs. Cow: Arch spine downward, lift head and tailbone up. Alternate between positions with breath. 10-15 cycles.',
  'Yoga Mat',
  'Bodyweight',
  'Erector Spinae',
  'Upper Abdominals',
  'Transverse Abdominis',
  'beginner'
),

-- 4. Jefferson Curl
(
  gen_random_uuid(),
  'Jefferson Curl',
  'Spinal flexion mobility and posterior chain stretch',
  'Stand on elevated surface holding light weight. Slowly round spine vertebra by vertebra, lowering weight toward toes. Pause at bottom. Reverse movement, stacking spine back up. 8-12 reps with VERY light weight.',
  'Dumbbell',
  'Free Weight',
  'Erector Spinae',
  'Hamstrings',
  'Upper Back',
  'advanced'
),

-- 5. Doorway Pec Stretch
(
  gen_random_uuid(),
  'Doorway Pec Stretch',
  'Chest and anterior shoulder stretch',
  'Stand in doorway with forearm on door frame at 90 degrees. Step forward with same-side leg until stretch felt in chest. Hold 30-60 seconds. Repeat with arm at different angles (high, low, level) for complete pec stretch.',
  'Doorway',
  'Bodyweight',
  'Middle Chest',
  'Front Deltoids',
  'Biceps',
  'beginner'
);

-- Verification query
SELECT '✅ Flexibility/Mobility exercises added successfully!' as status;

SELECT 
  id,
  name,
  primary_muscle,
  secondary_muscle,
  difficulty_level
FROM exercises
WHERE name IN (
  'Pigeon Pose',
  'Seated Hamstring Stretch',
  'Cat-Cow Stretch',
  'Jefferson Curl',
  'Doorway Pec Stretch'
)
ORDER BY name;

-- Show existing exercises we'll use
SELECT '📋 Existing Exercises (already in database):' as info;
SELECT 
  id,
  name,
  primary_muscle
FROM exercises
WHERE name IN (
  'Foam Roll (Quads)',
  'Foam Roll (Upper Back)',
  'Bear Crawl',
  'Romanian Deadlift',
  'Dumbbell Pullover'
)
ORDER BY name;

SELECT '📋 Instructions:' as info;
SELECT '   1. Run this SQL to add exercises to database' as step1;
SELECT '   2. Copy the UUIDs from the output above' as step2;
SELECT '   3. Update fluidity-flexibility-program.sql with correct UUIDs' as step3;
SELECT '✅ Ready to proceed!' as final_status;
