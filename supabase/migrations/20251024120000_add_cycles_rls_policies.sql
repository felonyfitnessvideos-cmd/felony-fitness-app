-- Migration: add Row-Level Security (RLS) policies for cycles tables
-- Generated: 2025-10-24
-- This migration enables RLS and adds conservative policies so authenticated
-- users may access only their own rows. Apply this after the schema migration
-- that creates the cycle tables.

-- MESOCYCLES
ALTER TABLE IF EXISTS public.mesocycles ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own mesocycles
CREATE POLICY IF NOT EXISTS "select_own_mesocycles" ON public.mesocycles
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to INSERT mesocycles only when user_id matches auth.uid()
CREATE POLICY IF NOT EXISTS "insert_own_mesocycles" ON public.mesocycles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE/Delete their own mesocycles
CREATE POLICY IF NOT EXISTS "modify_own_mesocycles" ON public.mesocycles
  FOR UPDATE, DELETE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MESOCYCLE_WEEKS
ALTER TABLE IF EXISTS public.mesocycle_weeks ENABLE ROW LEVEL SECURITY;

-- Weeks belong to a mesocycle; allow access when the parent mesocycle belongs to user
CREATE POLICY IF NOT EXISTS "select_own_mesocycle_weeks" ON public.mesocycle_weeks
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mesocycles m WHERE m.id = mesocycle_id AND m.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "insert_own_mesocycle_weeks" ON public.mesocycle_weeks
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mesocycles m WHERE m.id = mesocycle_id AND m.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "modify_own_mesocycle_weeks" ON public.mesocycle_weeks
  FOR UPDATE, DELETE
  USING (EXISTS (
    SELECT 1 FROM public.mesocycles m WHERE m.id = mesocycle_id AND m.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mesocycles m WHERE m.id = mesocycle_id AND m.user_id = auth.uid()
  ));

-- CYCLE_SESSIONS
ALTER TABLE IF EXISTS public.cycle_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "select_own_cycle_sessions" ON public.cycle_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "insert_own_cycle_sessions" ON public.cycle_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "modify_own_cycle_sessions" ON public.cycle_sessions
  FOR UPDATE, DELETE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MACROCYCLES (optional, same pattern)
ALTER TABLE IF EXISTS public.macrocycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "select_own_macrocycles" ON public.macrocycles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "modify_own_macrocycles" ON public.macrocycles
  FOR INSERT, UPDATE, DELETE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- End of migration
