-- Migration: link workout_logs to cycle_sessions
-- Generated: 2025-10-24

ALTER TABLE IF EXISTS public.workout_logs
  ADD COLUMN IF NOT EXISTS cycle_session_id uuid;

ALTER TABLE IF EXISTS public.workout_logs
  ADD CONSTRAINT IF NOT EXISTS workout_logs_cycle_session_fkey
  FOREIGN KEY (cycle_session_id) REFERENCES public.cycle_sessions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.workout_logs.cycle_session_id IS 'Optional link to a cycle_sessions row when the workout is part of a generated mesocycle.';
