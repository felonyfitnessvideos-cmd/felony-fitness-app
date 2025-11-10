-- Fix RLS policies for exercises table to allow inserts
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'exercises';

-- Drop existing restrictive policies if needed
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update their exercises" ON exercises;

-- Create new permissive policies
-- Allow all authenticated users to read exercises
CREATE POLICY "Anyone can view exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert exercises
CREATE POLICY "Authenticated users can insert exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update exercises (optional - could restrict to creator)
CREATE POLICY "Authenticated users can update exercises"
  ON exercises
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Check final policies
SELECT * FROM pg_policies WHERE tablename = 'exercises';
