-- Migration: link workout_logs to cycle_sessions
-- Generated: 2025-10-24

ALTER TABLE IF EXISTS public.workout_logs
  ADD COLUMN IF NOT EXISTS cycle_session_id uuid;
-- Add foreign key constraint in an idempotent way: ensure the referenced
-- table exists then add constraint if it is not present.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cycle_sessions') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'workout_logs_cycle_session_fkey'
    ) THEN
      ALTER TABLE public.workout_logs
        ADD CONSTRAINT workout_logs_cycle_session_fkey
        FOREIGN KEY (cycle_session_id) REFERENCES public.cycle_sessions(id) ON DELETE SET NULL;
    END IF;
  END IF;
END$$;

-- Ensure an index exists to support lookups by cycle_session_id
CREATE INDEX IF NOT EXISTS idx_workout_logs_cycle_session_id ON public.workout_logs (cycle_session_id);

COMMENT ON COLUMN public.workout_logs.cycle_session_id IS 'Optional link to a cycle_sessions row when the workout is part of a generated mesocycle.';
