-- Migration: add deload metadata to cycle_sessions
-- Generated: 2025-10-24

ALTER TABLE IF EXISTS public.cycle_sessions
  ADD COLUMN IF NOT EXISTS is_deload boolean DEFAULT false;

ALTER TABLE IF EXISTS public.cycle_sessions
  ADD COLUMN IF NOT EXISTS planned_volume_multiplier numeric DEFAULT 1.0;

COMMENT ON COLUMN public.cycle_sessions.is_deload IS 'True when this session is a deload session (reduced volume).';
COMMENT ON COLUMN public.cycle_sessions.planned_volume_multiplier IS 'Multiplier to apply to planned volume; 1.0 = normal, 0.5 = half volume for deloads.';
