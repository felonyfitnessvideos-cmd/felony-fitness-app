/**
 * @file add-knee-recovery-exercises.sql
 * @description Add 3 missing knee recovery exercises for Foundation program
 * @date 2025-11-22
 * 
 * EXERCISES ALREADY EXIST (UUIDs found):
 * ✅ Elliptical - 4e3fceaf-d805-49c3-b192-9acb6b0e5596
 * ✅ Wall Sit - 4e69f1dc-54d4-4e95-976c-1b3486584802
 * ✅ HOIST Leg Extension - 3eb8fb38-5648-4920-a61c-bb3d195a74c5
 * ✅ Step-Up - 325cbcda-f427-4a8e-9748-6d653ec67c70
 * ✅ Stability Ball Hamstring Curl - 3ae05beb-edb7-4662-922a-3d27fce4cf18
 * ✅ Seated Leg Curl - e7612891-4f70-4902-9e03-5900da6b8781
 * ✅ HOIST Seated Calf Raise - c4467f1b-c463-4afd-ab89-56c677d46f82
 * 
 * EXERCISES TO ADD (3 total):
 * 1. Stationary Bike - Low-impact cardio warm-up
 * 2. Spanish Squat - VMO isolation with band
 * 3. Calf Raise (Standing Machine) - Gastrocnemius development
 * 
 * RUN THIS FIRST, then export exercises_rows.csv to get UUIDs
 */

-- 1. Stationary Bike
INSERT INTO exercises (
  id,
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  thumbnail_url,
  video_url,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Stationary Bike',
  'Low-impact cardiovascular exercise using a stationary bicycle. Excellent for knee rehab as it allows controlled range of motion without impact forces.',
  '1. Adjust seat height so knee has slight bend at bottom of pedal stroke
2. Start with low resistance for warm-up (5-10 minutes)
3. Maintain steady cadence (80-100 RPM)
4. Keep knees tracking straight, not bowing in or out
5. Gradually increase resistance for conditioning work
6. Cool down with 5 minutes at easy pace',
  'Stationary Bike',
  'Machine',
  NULL,
  NULL,
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Beginner',
  NOW(),
  NOW()
);

-- 2. Spanish Squat
INSERT INTO exercises (
  id,
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  thumbnail_url,
  video_url,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Spanish Squat',
  'VMO-isolation exercise using resistance band behind knees. Creates posterior tibial translation to maximize VMO engagement while minimizing patellofemoral stress.',
  '1. Loop heavy resistance band around squat rack at knee height
2. Step into band, positioning it behind both knees
3. Walk forward to create tension in band (band pulls knees back)
4. Stand tall, feet hip-width apart
5. Keeping torso vertical, bend knees and sink down
6. Band pulls shins backward, isolating VMO contraction
7. Only descend 4-6 inches - focus is VMO activation, not depth
8. Hold bottom position for 2-3 seconds
9. Return to start, maintaining band tension throughout
10. Can add light dumbbells in hands for progression',
  'Resistance Band, Squat Rack',
  'Bodyweight',
  NULL,
  NULL,
  'Quadriceps',
  'VMO',
  'Glutes',
  'Intermediate',
  NOW(),
  NOW()
);

-- 3. Calf Raise (Standing Machine)
INSERT INTO exercises (
  id,
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  thumbnail_url,
  video_url,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Standing Calf Raise',
  'Standing calf raise machine targeting gastrocnemius muscle. Builds ankle/knee stability and improves landing mechanics for knee protection.',
  '1. Stand on calf raise platform or step, balls of feet on edge
2. Heels hanging off, toes pointing forward
3. Hold dumbbells at sides or use machine shoulder pads
4. Lower heels below platform level for full stretch
5. Press up onto toes as high as possible
6. Pause at top, squeeze calves hard (1-2 seconds)
7. Lower with control to stretched position
8. Maintain straight legs throughout (slight knee bend okay)
9. Avoid bouncing - use controlled tempo
10. Can adjust toe angle: neutral, toes in, toes out for variety',
  'Standing Calf Raise Machine',
  'Machine',
  NULL,
  NULL,
  'Calves',
  'Gastrocnemius',
  NULL,
  'Beginner',
  NOW(),
  NOW()
);

-- Verification query
SELECT '✅ 3 new knee recovery exercises added successfully!' as status;

SELECT 
  id,
  name,
  primary_muscle,
  secondary_muscle,
  difficulty_level,
  equipment_needed
FROM exercises
WHERE name IN (
  'Stationary Bike',
  'Spanish Squat',
  'Standing Calf Raise'
)
ORDER BY name;

SELECT '📋 Next Steps:' as info;
SELECT '1. Export exercises table to CSV to get 3 new UUIDs' as step1;
SELECT '2. Update foundation-knee-recovery-program.sql with actual UUIDs' as step2;
SELECT '3. Most exercises already exist - only 3 new ones needed!' as step3;
