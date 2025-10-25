-- Migration: add unique index to prevent multiple workout_logs per user/routine/day
-- Generated: 2025-10-24

-- Ensure that a single user cannot have two workout_logs for the same routine on the same day.
CREATE UNIQUE INDEX IF NOT EXISTS ux_workout_logs_user_routine_date
ON public.workout_logs (user_id, routine_id, (date_trunc('day', created_at)));

-- Note: This uses an expression index on the day bucket of created_at. If you
-- prefer created_at::date use that expression instead depending on your Postgres version.
