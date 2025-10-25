-- Migration: add explicit day_type to mesocycle_weeks and migrate notes
-- Generated: 2025-10-24

ALTER TABLE IF EXISTS public.mesocycle_weeks
  ADD COLUMN IF NOT EXISTS day_type text;

-- Migrate legacy values from notes where appropriate
-- We only migrate 'rest' and 'deload' markers which were previously stored
-- in the notes column by the UI. Leave other notes untouched.
UPDATE public.mesocycle_weeks
SET day_type = notes
WHERE notes IN ('rest','deload') AND (day_type IS NULL OR day_type = '');

-- Optionally, add a check constraint to narrow values (commented out for safety).
-- Uncomment if you want to enforce allowed values at DB level.
-- ALTER TABLE public.mesocycle_weeks ADD CONSTRAINT mesocycle_weeks_day_type_check CHECK (day_type IS NULL OR day_type IN ('routine','rest','deload'));

COMMENT ON COLUMN public.mesocycle_weeks.day_type IS 'Optional explicit enum: "routine" | "rest" | "deload". Prefer this over notes for scheduling logic.';
