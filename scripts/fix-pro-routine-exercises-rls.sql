-- Fix RLS policy for pro_routine_exercises
-- Allow all authenticated users to SELECT pro routine exercises (they are public templates)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to pro routine exercises" ON public.pro_routine_exercises;

-- Create policy to allow all authenticated users to read pro routine exercises
CREATE POLICY "Allow public read access to pro routine exercises"
ON public.pro_routine_exercises
FOR SELECT
TO authenticated
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'pro_routine_exercises';
