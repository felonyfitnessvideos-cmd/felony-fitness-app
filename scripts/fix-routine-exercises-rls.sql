-- Fix RLS policy for routine_exercises to allow trainers to insert exercises for client routines
-- This allows trainers to assign programs with exercises to their clients

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "trainer_can_insert_client_routine_exercises" ON routine_exercises;

-- Create policy that allows trainers to insert routine_exercises for their clients' routines
CREATE POLICY "trainer_can_insert_client_routine_exercises"
ON routine_exercises
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if the routine belongs to the trainer themselves
  EXISTS (
    SELECT 1 FROM workout_routines
    WHERE workout_routines.id = routine_exercises.routine_id
    AND workout_routines.user_id = auth.uid()
  )
  OR
  -- Allow if the routine belongs to a client of this trainer
  EXISTS (
    SELECT 1 FROM workout_routines
    INNER JOIN trainer_clients ON trainer_clients.client_id = workout_routines.user_id
    WHERE workout_routines.id = routine_exercises.routine_id
    AND trainer_clients.trainer_id = auth.uid()
  )
);

-- Also ensure trainers can SELECT their clients' routine_exercises
DROP POLICY IF EXISTS "trainer_can_view_client_routine_exercises" ON routine_exercises;

CREATE POLICY "trainer_can_view_client_routine_exercises"
ON routine_exercises
FOR SELECT
TO authenticated
USING (
  -- Allow if the routine belongs to the user themselves
  EXISTS (
    SELECT 1 FROM workout_routines
    WHERE workout_routines.id = routine_exercises.routine_id
    AND workout_routines.user_id = auth.uid()
  )
  OR
  -- Allow if the routine belongs to a client of this trainer
  EXISTS (
    SELECT 1 FROM workout_routines
    INNER JOIN trainer_clients ON trainer_clients.client_id = workout_routines.user_id
    WHERE workout_routines.id = routine_exercises.routine_id
    AND trainer_clients.trainer_id = auth.uid()
  )
);

-- Allow trainers to UPDATE routine_exercises for their clients' routines
DROP POLICY IF EXISTS "trainer_can_update_client_routine_exercises" ON routine_exercises;

CREATE POLICY "trainer_can_update_client_routine_exercises"
ON routine_exercises
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workout_routines
    WHERE workout_routines.id = routine_exercises.routine_id
    AND workout_routines.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM workout_routines
    INNER JOIN trainer_clients ON trainer_clients.client_id = workout_routines.user_id
    WHERE workout_routines.id = routine_exercises.routine_id
    AND trainer_clients.trainer_id = auth.uid()
  )
);

-- Allow trainers to DELETE routine_exercises for their clients' routines
DROP POLICY IF EXISTS "trainer_can_delete_client_routine_exercises" ON routine_exercises;

CREATE POLICY "trainer_can_delete_client_routine_exercises"
ON routine_exercises
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workout_routines
    WHERE workout_routines.id = routine_exercises.routine_id
    AND workout_routines.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM workout_routines
    INNER JOIN trainer_clients ON trainer_clients.client_id = workout_routines.user_id
    WHERE workout_routines.id = routine_exercises.routine_id
    AND trainer_clients.trainer_id = auth.uid()
  )
);
