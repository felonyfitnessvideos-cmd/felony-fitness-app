/**
 * @file add-stability-balance-exercises.sql
 * @description Add missing exercises for Stability balance program
 * @date 2025-11-22
 * 
 * MISSING EXERCISES:
 * 1. Stability Ball Plank - plank on unstable surface
 * 2. Alternating Dumbbell Press - unilateral pressing with alternation
 * 3. Suitcase Carry - unilateral loaded carry
 * 
 * Run this BEFORE stability-balance-program.sql
 * Then extract UUIDs from exercises table to update the program SQL
 */

-- Insert missing exercises for Stability program
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

-- 1. Stability Ball Plank
(
  gen_random_uuid(),
  'Stability Ball Plank',
  'Plank with forearms on stability ball',
  'Place forearms on stability ball in plank position. Keep body straight, core engaged. The instability forces increased core activation. Hold position while maintaining balance. Progress by adding small ball movements.',
  'Stability Ball',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Upper Abdominals',
  'Transverse Abdominis',
  'Front Deltoids',
  'Intermediate'
),

-- 2. Alternating Dumbbell Press
(
  gen_random_uuid(),
  'Alternating Dumbbell Press',
  'Single-arm overhead press alternating sides',
  'Stand or sit with dumbbells at shoulders. Press one dumbbell overhead while keeping the other at shoulder height. Lower and repeat on opposite side. Core must stabilize against rotational forces. Maintain neutral spine throughout.',
  'Dumbbells',
  'Free Weight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Front Deltoids',
  'Upper Abdominals',
  'Triceps',
  'Intermediate'
),

-- 3. Suitcase Carry
(
  gen_random_uuid(),
  'Suitcase Carry',
  'Single-sided loaded carry exercise',
  'Hold heavy dumbbell or kettlebell in one hand at side. Walk maintaining upright posture, resisting lateral flexion. Core engages to prevent leaning. Switch sides after completing distance. Builds anti-lateral flexion strength and grip.',
  'Dumbbell',
  'Free Weight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Upper Abdominals',
  'Obliques',
  'Forearms',
  'Intermediate'
);

-- Verification queries
SELECT '✅ New stability/balance exercises added!' as status;

SELECT 
  id,
  name,
  primary_muscle,
  secondary_muscle,
  difficulty_level,
  equipment_needed
FROM exercises
WHERE name IN (
  'Stability Ball Plank',
  'Alternating Dumbbell Press',
  'Suitcase Carry'
)
ORDER BY name;

SELECT '🔍 Copy these UUIDs for stability-balance-program.sql:' as instruction;
