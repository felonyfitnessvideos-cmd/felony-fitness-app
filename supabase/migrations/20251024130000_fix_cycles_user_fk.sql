-- Migration: fix foreign key constraints for cycle tables to reference user_profiles
-- Generated: 2025-10-24
-- The original cycle tables referenced a `users(id)` table which does not exist
-- in this project's public schema. This migration switches the FK to reference
-- the existing `user_profiles(id)` table which is used across the app.

-- MESOCYCLES: replace FK to users(id) with FK to user_profiles(id)
ALTER TABLE IF EXISTS public.mesocycles DROP CONSTRAINT IF EXISTS mesocycles_user_id_fkey;
ALTER TABLE IF EXISTS public.mesocycles
  ADD CONSTRAINT mesocycles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- MACROCYCLES: replace FK to users(id) with FK to user_profiles(id)
ALTER TABLE IF EXISTS public.macrocycles DROP CONSTRAINT IF EXISTS macrocycles_user_id_fkey;
ALTER TABLE IF EXISTS public.macrocycles
  ADD CONSTRAINT macrocycles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- CYCLE_SESSIONS: replace FK to users(id) with FK to user_profiles(id)
ALTER TABLE IF EXISTS public.cycle_sessions DROP CONSTRAINT IF EXISTS cycle_sessions_user_id_fkey;
ALTER TABLE IF EXISTS public.cycle_sessions
  ADD CONSTRAINT cycle_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- NOTE: If you manage user rows under a different table name, adjust the
-- REFERENCES clause accordingly. Apply this migration using Supabase Studio
-- or psql (see README or earlier instructions).
