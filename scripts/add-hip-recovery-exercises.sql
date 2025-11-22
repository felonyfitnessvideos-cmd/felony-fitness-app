/**
 * @file add-hip-recovery-exercises.sql
 * @description Add missing exercises for Glute Guard hip recovery program
 * @date 2025-11-22
 * 
 * MISSING EXERCISES:
 * 1. 90/90 Hip Stretch - seated hip mobility stretch
 * 2. Foam Roll (IT Band) - iliotibial band self-myofascial release
 * 
 * Run this BEFORE glute-guard-hip-recovery-program.sql
 * Then extract UUIDs from exercises table to update the program SQL
 */

-- Insert missing exercises for Glute Guard program
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

-- 1. 90/90 Hip Stretch
(
  gen_random_uuid(),
  '90/90 Hip Stretch',
  'Seated hip mobility stretch for internal and external rotation',
  'Sit on floor with front leg bent 90 degrees (knee forward, shin perpendicular). Back leg bent 90 degrees behind you (knee to side, shin perpendicular). Sit tall, lean forward over front leg to increase stretch. Switch sides. Targets hip capsule, external rotators, and internal rotators. Hold each position 60-90 seconds.',
  'None',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Hip Flexors',
  'Glutes',
  'Lower Back',
  'Beginner'
),

-- 2. Foam Roll (IT Band)
(
  gen_random_uuid(),
  'Foam Roll (IT Band)',
  'Self-myofascial release for iliotibial band',
  'Lie on side with foam roller under outer thigh. Support upper body with forearm. Roll from hip to just above knee, pausing on tender spots. The IT band is dense connective tissue - this will be uncomfortable. Use opposite leg for support to adjust pressure. Roll slowly, 30-60 seconds each side.',
  'Foam Roller',
  'Bodyweight',
  NULL,
  NULL,
  NOW(),
  NOW(),
  'Hip Abductors',
  'Quadriceps',
  'Tensor Fasciae Latae',
  'Beginner'
);

-- Verification queries
SELECT '✅ New hip recovery exercises added!' as status;

SELECT 
  id,
  name,
  primary_muscle,
  secondary_muscle,
  difficulty_level,
  equipment_needed
FROM exercises
WHERE name IN (
  '90/90 Hip Stretch',
  'Foam Roll (IT Band)'
)
ORDER BY name;

SELECT '🔍 Copy these UUIDs for glute-guard-hip-recovery-program.sql:' as instruction;
