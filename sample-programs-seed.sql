-- Sample Programs Data to Match Mockup
-- This script creates sample programs and routines to demonstrate the trainer programs interface

-- Create sample programs
INSERT INTO programs (id, name, description, difficulty_level, estimated_weeks, target_muscle_groups, is_active, created_by) VALUES
(
  'b6f4a2d1-8c9e-4b5f-a3d2-1e8f9c0b7a6d',
  'Beginner Strength Foundation',
  'Perfect starting point for newcomers to strength training. Focuses on fundamental movement patterns and building a solid base.',
  'beginner',
  8,
  ARRAY['Chest', 'Back', 'Legs', 'Shoulders'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'c7f5b3e2-9d0f-5c6a-b4e3-2f9a0d1c8b7e',
  'Intermediate Hypertrophy',
  'Muscle building program designed for intermediate lifters focusing on volume and progressive overload.',
  'intermediate',
  12,
  ARRAY['Chest', 'Back', 'Arms', 'Legs', 'Shoulders'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'd8a6c4f3-ae1b-6d7b-c5f4-3a0b1e2d9c8f',
  'Advanced Powerlifting',
  'Competition-focused program for advanced lifters emphasizing the big three lifts: squat, bench, deadlift.',
  'advanced',
  16,
  ARRAY['Full Body', 'Core'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Create sample routines for the Beginner Strength program
INSERT INTO routines (id, name, description, estimated_duration_minutes, difficulty_level, is_active, created_by) VALUES
(
  'r1-legs-shoulders',
  'Legs & Shoulders',
  'Lower body focused workout with shoulder development',
  45,
  'beginner',
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'r2-back-biceps',
  'Back & Biceps',
  'Pull focused workout targeting back muscles and biceps',
  40,
  'beginner',
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'r3-chest-triceps',
  'Chest & Triceps',
  'Push focused workout emphasizing chest and tricep development',
  45,
  'beginner',
  true,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Link routines to the Beginner Strength program
INSERT INTO program_routines (program_id, routine_id, week_number, day_number) VALUES
('b6f4a2d1-8c9e-4b5f-a3d2-1e8f9c0b7a6d', 'r1-legs-shoulders', 1, 1),
('b6f4a2d1-8c9e-4b5f-a3d2-1e8f9c0b7a6d', 'r2-back-biceps', 1, 2),
('b6f4a2d1-8c9e-4b5f-a3d2-1e8f9c0b7a6d', 'r3-chest-triceps', 1, 3);

-- Add sample exercises to routines to enable muscle analysis
-- Get some exercise IDs (assuming they exist from previous migrations)
-- Legs & Shoulders routine exercises
INSERT INTO routine_exercises (routine_id, exercise_id, target_sets, target_reps, target_weight, exercise_order) 
SELECT 
  'r1-legs-shoulders',
  e.id,
  3,
  10,
  0,
  row_number() OVER ()
FROM exercises e 
WHERE e.name IN ('Barbell Squat', 'Lateral Raises', 'Leg Press') 
LIMIT 3;

-- Back & Biceps routine exercises  
INSERT INTO routine_exercises (routine_id, exercise_id, target_sets, target_reps, target_weight, exercise_order)
SELECT 
  'r2-back-biceps',
  e.id,
  3,
  10,
  0,
  row_number() OVER ()
FROM exercises e 
WHERE e.name IN ('Lat Pulldown', 'Bicep Curl', 'Bent Over Rows')
LIMIT 3;

-- Chest & Triceps routine exercises
INSERT INTO routine_exercises (routine_id, exercise_id, target_sets, target_reps, target_weight, exercise_order)
SELECT 
  'r3-chest-triceps',
  e.id,
  3,
  10,
  0,
  row_number() OVER ()
FROM exercises e 
WHERE e.name IN ('Barbell Bench Press', 'Triceps Extensions', 'Push-ups')
LIMIT 3;

-- Add more sample programs for variety
INSERT INTO programs (id, name, description, difficulty_level, estimated_weeks, target_muscle_groups, is_active, created_by) VALUES
(
  'e9b7d5g4-bf2c-7e8c-d6g5-4b1c2f3e0d9a',
  'Cardio Conditioning',
  'High-intensity cardio program for improved cardiovascular health and endurance.',
  'intermediate',
  6,
  ARRAY['Full Body', 'Cardio'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'f0c8e6h5-ca3d-8f9d-e7h6-5c2d3a4f1e0b',
  'Flexibility & Mobility',
  'Comprehensive flexibility program focusing on mobility, stretching, and injury prevention.',
  'beginner',
  4,
  ARRAY['Full Body', 'Core'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'a1d9f7i6-db4e-9a0e-f8i7-6d3e4b5a2f1c',
  'Athletic Performance',
  'Sport-specific training program designed to enhance athletic performance and power.',
  'advanced',
  20,
  ARRAY['Full Body', 'Core', 'Power'],
  true,
  (SELECT id FROM auth.users LIMIT 1)
);