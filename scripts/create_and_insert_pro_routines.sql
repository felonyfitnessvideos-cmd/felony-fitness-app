-- Create pro_routines table
CREATE TABLE pro_routines (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  routine_name text,
  name text,
  description text,
  estimated_duration_minutes integer,
  difficulty_level text CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  routine_type text,
  is_active boolean,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  category text CHECK (category IN ('Strength', 'Hypertrophy', 'Endurance', 'Challenges', 'Bodyweight', 'Interval'))
);

-- Insert 12 sample pro routines
INSERT INTO pro_routines (
  id, user_id, routine_name, name, description, estimated_duration_minutes, difficulty_level, routine_type, is_active, is_public, created_at, updated_at, category
) VALUES
('e2b7c1e2-2e7b-4c1e-8e2b-7c1e22e7b4c1', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Strength Starter', NULL, 'Full body strength routine', 60, 'Beginner', 'Strength', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Strength'),
('f3c8d2f3-3c8d-4d2f-9f3c-8d2f33c8d4d2', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Hypertrophy Builder', NULL, 'Muscle growth focus', 55, 'Intermediate', 'Strength', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Hypertrophy'),
('a4d9e3a4-4d9e-4e3a-8a4d-9e3a44d9e4e3', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Endurance Express', NULL, 'Cardio and stamina', 50, 'Intermediate', 'Cardio', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Endurance'),
('b5e1f4b5-5e1f-4f4b-9b5e-1f4b55e1f4f4', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Challenge Circuit', NULL, 'High intensity challenge', 45, 'Advanced', 'Circuit', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Challenges'),
('c6f2a5c6-6f2a-4a5c-8c6f-2a5c66f2a4a5', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Bodyweight Basics', NULL, 'No equipment bodyweight', 30, 'Beginner', 'Bodyweight', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Bodyweight'),
('d7a3b6d7-7a3b-4b6d-9d7a-3b6d77a3b4b6', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Interval Intensity', NULL, 'Interval training', 40, 'Intermediate', 'Interval', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Interval'),
('e8b4c7e8-8b4c-4c7e-8e8b-4c7e88b4c4c7', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Strength Pro', NULL, 'Advanced strength program', 70, 'Advanced', 'Strength', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Strength'),
('f9c5d8f9-9c5d-4d8f-9f9c-5d8f99c5d4d8', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Hypertrophy Pro', NULL, 'Advanced muscle growth', 65, 'Advanced', 'Strength', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Hypertrophy'),
('a1d6e9a1-1d6e-4e9a-8a1d-6e9a11d6e4e9', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Endurance Pro', NULL, 'Long duration cardio', 80, 'Advanced', 'Cardio', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Endurance'),
('b2e7f1b2-2e7f-4f1b-9b2e-7f1b22e7f4f1', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Challenge Pro', NULL, 'Extreme challenge circuit', 75, 'Advanced', 'Circuit', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Challenges'),
('c3f8a2c3-3f8a-4a2c-8c3f-8a2c33f8a4a2', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Bodyweight Pro', NULL, 'Advanced bodyweight', 60, 'Advanced', 'Bodyweight', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Bodyweight'),
('d4a9b3d4-4a9b-4b3d-9d4a-9b3d44a9b4b3', '13564e60-efe2-4b55-ae83-0d266b55ebf8', 'Interval Pro', NULL, 'Advanced interval training', 55, 'Advanced', 'Interval', true, false, '2025-11-04 21:45:00+00', '2025-11-04 21:45:00+00', 'Interval');
