-- Insert 12 sample workout routines into workout_routines table
INSERT INTO workout_routines (
  id, user_id, routine_name, name, description, estimated_duration_minutes, difficulty_level, routine_type, is_active, is_public, created_at, updated_at
) VALUES
('e2b7c1e2-2e7b-4c1e-8e2b-7c1e22e7b4c1', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Leg Day', NULL, 'Lower body strength and hypertrophy', 60, 'Intermediate', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('f3c8d2f3-3c8d-4d2f-9f3c-8d2f33c8d4d2', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Push Day', NULL, 'Chest, shoulders, triceps', 55, 'Intermediate', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('a4d9e3a4-4d9e-4e3a-8a4d-9e3a44d9e4e3', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Pull Day', NULL, 'Back, biceps, forearms', 50, 'Intermediate', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('b5e1f4b5-5e1f-4f4b-9b5e-1f4b55e1f4f4', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Full Body Blast', NULL, 'Total body circuit', 45, 'Beginner', 'Circuit', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('c6f2a5c6-6f2a-4a5c-8c6f-2a5c66f2a4a5', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'HIIT Cardio', NULL, 'High intensity interval training', 30, 'Advanced', 'Cardio', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('d7a3b6d7-7a3b-4b6d-9d7a-3b6d77a3b4b6', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Core Crusher', NULL, 'Abs and core stability', 40, 'Intermediate', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('e8b4c7e8-8b4c-4c7e-8e8b-4c7e88b4c4c7', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Upper Body Power', NULL, 'Chest, back, arms', 50, 'Advanced', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('f9c5d8f9-9c5d-4d8f-9f9c-5d8f99c5d4d8', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Glute Focus', NULL, 'Glutes and hamstrings', 45, 'Intermediate', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('a1d6e9a1-1d6e-4e9a-8a1d-6e9a11d6e4e9', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Arm Day', NULL, 'Biceps, triceps, forearms', 40, 'Beginner', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('b2e7f1b2-2e7f-4f1b-9b2e-7f1b22e7f4f1', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Cardio Endurance', NULL, 'Steady-state cardio', 60, 'Intermediate', 'Cardio', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Flexibility Flow', NULL, 'Stretching and mobility', 35, 'Beginner', 'Flexibility', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00'),
('d4a9b3d4-4a9b-4b3d-9d4a-9b3d44a9b4b3', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Powerlifting Prep', NULL, 'Squat, bench, deadlift focus', 75, 'Advanced', 'Strength', true, false, '2025-11-04 21:40:00+00', '2025-11-04 21:40:00+00');
