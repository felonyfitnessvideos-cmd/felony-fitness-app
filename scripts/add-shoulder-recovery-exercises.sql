/**
 * @file add-shoulder-recovery-exercises.sql
 * @description Add missing exercises for The Cuff shoulder recovery program
 * @date 2025-11-22
 * 
 * MISSING EXERCISES:
 * 1. Arm Circles - dynamic shoulder warm-up
 * 2. Wall Slides - scapular control and shoulder mobility
 * 3. Band Pull-Apart - scapular retraction and rear delt activation
 * 4. Dumbbell Side-Lying External Rotation - rotator cuff isolation
 * 5. Kettlebell Bottom-Up Press - shoulder stability under load
 * 6. Plank (Shoulder Tap) - anti-rotation core with shoulder stability
 * 
 * Run this BEFORE the-cuff-shoulder-recovery-program.sql
 * Then extract UUIDs from exercises table to update the program SQL
 */

-- Insert missing exercises for The Cuff program
INSERT INTO exercises (
  id,
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  thumbnail_url,
  video_url,
  created_at,
  updated_at,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level
) VALUES

-- 1. Arm Circles
(
  gen_random_uuid(),
  'Arm Circles',
  'Dynamic shoulder mobility warm-up',
  'Stand with arms extended out to sides at shoulder height. Make small circles forward for 10-15 reps, then reverse direction. Progress to larger circles. Keep core engaged and avoid arching back. Great for warming up rotator cuff and increasing shoulder ROM.',
  'None',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Front Deltoids',
  'Side Deltoids',
  'Rotator Cuff',
  'Beginner'
),

-- 2. Wall Slides
(
  gen_random_uuid(),
  'Wall Slides',
  'Scapular control and shoulder mobility drill',
  'Stand with back against wall, feet 6 inches out. Press lower back, arms, and hands flat against wall. Slide arms overhead while maintaining contact with wall. Focus on keeping shoulders down and back. Pause at top, return to start. Builds scapular control and overhead mobility.',
  'None',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Middle Trapezius',
  'Serratus Anterior',
  'Rotator Cuff',
  'Beginner'
),

-- 3. Band Pull-Apart
(
  gen_random_uuid(),
  'Band Pull-Apart',
  'Scapular retraction and rear deltoid activation',
  'Hold resistance band at chest height with arms extended. Pull band apart bringing hands out to sides while squeezing shoulder blades together. Control return to start. Keep slight bend in elbows. Excellent for posture and rear delt activation.',
  'Resistance Band',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Rear Deltoids',
  'Rhomboids',
  'Middle Trapezius',
  'Beginner'
),

-- 4. Dumbbell Side-Lying External Rotation
(
  gen_random_uuid(),
  'Dumbbell Side-Lying External Rotation',
  'Rotator cuff isolation exercise',
  'Lie on side with bottom arm supporting head. Hold light dumbbell in top hand with elbow bent 90 degrees at side. Rotate forearm up keeping elbow pinned to side. Lower with control. Pure rotator cuff (infraspinatus, teres minor) isolation. Use LIGHT weight (5-10 lbs max).',
  'Dumbbell',
  'Free Weight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Rotator Cuff',
  'Rear Deltoids',
  'Middle Trapezius',
  'Beginner'
),

-- 5. Kettlebell Bottom-Up Press
(
  gen_random_uuid(),
  'Kettlebell Bottom-Up Press',
  'Shoulder stability press with unstable load',
  'Hold kettlebell upside down (bell up, handle down) at shoulder height. Press overhead while maintaining vertical alignment of kettlebell. The unstable load forces maximum rotator cuff and stabilizer engagement. Start LIGHT (10-15 lbs) and progress slowly.',
  'Kettlebell',
  'Free Weight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Front Deltoids',
  'Rotator Cuff',
  'Triceps',
  'Advanced'
),

-- 6. Plank (Shoulder Tap)
(
  gen_random_uuid(),
  'Plank (Shoulder Tap)',
  'Anti-rotation plank with shoulder stability',
  'Start in high plank position (straight arms). Tap right hand to left shoulder while resisting rotation through core. Return hand to floor. Alternate sides. Keep hips level and minimize movement. Challenges shoulder stability and anti-rotation strength simultaneously.',
  'None',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Upper Abdominals',
  'Front Deltoids',
  'Obliques',
  'Intermediate'
);

-- Verification queries
SELECT '✅ New shoulder recovery exercises added!' as status;

SELECT 
  id,
  name,
  primary_muscle,
  secondary_muscle,
  difficulty_level,
  equipment_needed
FROM exercises
WHERE name IN (
  'Arm Circles',
  'Wall Slides',
  'Band Pull-Apart',
  'Dumbbell Side-Lying External Rotation',
  'Kettlebell Bottom-Up Press',
  'Plank (Shoulder Tap)'
)
ORDER BY name;

SELECT '🔍 Copy these UUIDs for the-cuff-shoulder-recovery-program.sql:' as instruction;
