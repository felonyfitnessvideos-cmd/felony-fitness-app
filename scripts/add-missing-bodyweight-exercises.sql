/**
 * @file add-missing-bodyweight-exercises.sql
 * @description Add Jump Squats and Burpees exercises needed for CrossFit program
 * @date 2025-11-17
 * 
 * These exercises are referenced in the CrossFit Circuit program but were missing
 * from the exercises table, causing "Unknown Exercise" display issues.
 */

-- Insert Jump Squats
INSERT INTO exercises (
  name,
  description,
  instructions,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  equipment_needed,
  difficulty_level,
  exercise_type
)
SELECT * FROM (VALUES
  ('Jump Squats', 
   'Explosive plyometric squat variation for lower body power development', 
   '1. Stand with feet shoulder-width apart, toes slightly turned out. 2. Lower into a squat position (thighs parallel to ground). 3. Explosively jump straight up, extending through hips, knees, and ankles. 4. Land softly with bent knees, immediately descending into next rep. 5. Maintain upright torso throughout movement',
   'Quadriceps', 
   'Glutes', 
   'Hamstrings', 
   'Bodyweight', 
   'Intermediate', 
   'Bodyweight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- Insert Burpees
INSERT INTO exercises (
  name,
  description,
  instructions,
  primary_muscle,
  secondary_muscle,
  tertiary_muscle,
  equipment_needed,
  difficulty_level,
  exercise_type
)
SELECT * FROM (VALUES
  ('Burpees',
   'Full-body conditioning exercise combining squat, plank, pushup, and jump',
   '1. Start standing with feet shoulder-width apart. 2. Drop into a squat position, place hands on floor. 3. Jump feet back into plank/pushup position. 4. Perform a pushup (chest to ground). 5. Jump feet forward back to squat position. 6. Explosively jump up, reaching arms overhead. 7. Land softly and immediately begin next rep',
   'Full Body',
   'Middle Chest',
   'Front Deltoids',
   'Bodyweight',
   'Intermediate',
   'Bodyweight')
) AS new_exercises(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level, exercise_type)
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.name = new_exercises.name);

-- Verify insertion
SELECT 
  name,
  primary_muscle,
  equipment_needed,
  difficulty_level
FROM exercises
WHERE name IN ('Jump Squats', 'Burpees');

SELECT '✅ Successfully added Jump Squats and Burpees exercises!' as status;
