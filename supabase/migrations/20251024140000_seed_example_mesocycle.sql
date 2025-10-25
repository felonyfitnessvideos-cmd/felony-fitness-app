-- Migration: seed an example mesocycle for demo/testing
-- Generated: 2025-10-24
-- WARNING: This will insert demo data for the specified user id.
-- Replace the user_id below if you want to seed for a different user.

BEGIN;

-- Ensure the user profile referenced by the seed exists. This avoids FK
-- violations when seeding demo data on an environment that doesn't contain
-- the hardcoded demo user. Adjust or remove as appropriate for your setup.
INSERT INTO public.user_profiles (id)
VALUES ('5cfccb78-c91c-442f-83c3-3ccad142754d')
ON CONFLICT (id) DO NOTHING;

WITH new_m AS (
  INSERT INTO public.mesocycles (user_id, name, focus, weeks, start_date, notes)
  VALUES ('5cfccb78-c91c-442f-83c3-3ccad142754d', 'Demo Strength Block', 'Strength', 4, CURRENT_DATE, 'Seeded demo mesocycle')
  RETURNING id
)
INSERT INTO public.mesocycle_weeks (mesocycle_id, week_index)
SELECT id, gs FROM new_m, generate_series(1, (SELECT weeks FROM public.mesocycles WHERE id = new_m.id)) AS gs;

COMMIT;
