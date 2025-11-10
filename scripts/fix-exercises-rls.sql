-- Fix RLS policies for exercises table to allow inserts
-- Run this in Supabase SQL Editor

-- Check current policies FIRST
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'exercises';

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can update exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update their exercises" ON exercises;
DROP POLICY IF EXISTS "Enable read access for all users" ON exercises;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON exercises;

-- Create new permissive policies with unique names
-- Allow all authenticated users to read exercises
CREATE POLICY "exercises_select_policy"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert exercises
CREATE POLICY "exercises_insert_policy"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update exercises
CREATE POLICY "exercises_update_policy"
  ON exercises
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Check final policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'exercises';
