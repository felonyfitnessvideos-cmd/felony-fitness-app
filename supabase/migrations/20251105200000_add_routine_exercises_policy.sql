-- Add RLS policy for routine_exercises table
-- This allows users to manage exercises for their own routines

CREATE POLICY "Users can manage routine exercises for own routines" 
ON routine_exercises 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM workout_routines 
    WHERE workout_routines.id = routine_exercises.routine_id 
    AND workout_routines.user_id = auth.uid()
  )
);
