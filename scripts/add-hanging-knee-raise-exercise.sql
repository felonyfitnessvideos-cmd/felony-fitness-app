-- =====================================================================================
-- ADD MISSING EXERCISE: Hanging Knee Raise
-- =====================================================================================
-- This exercise is needed for the Beginner Strength & Hypertrophy program
-- =====================================================================================

INSERT INTO exercises (
  name,
  description,
  instructions,
  equipment_needed,
  exercise_type,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  difficulty_level,
  created_at,
  updated_at
) VALUES (
  'Hanging Knee Raise',
  'Core strengthening exercise hanging from pull-up bar',
  'Hang from pull-up bar with straight arms. Engage core and lift knees toward chest by flexing hips and abs. Lower with control and repeat. Keep movement controlled without swinging.',
  'Pull-up Bar',
  'Bodyweight',
  'Lower Abdominals',
  'Hip Flexors',
  'Upper Abdominals',
  'Intermediate',
  NOW(),
  NOW()
);

-- Verify the insert
SELECT id, name, primary_muscle, difficulty_level
FROM exercises
WHERE name = 'Hanging Knee Raise';
