-- Migration: 20251019180000_seed_missing_exercises.sql
-- Purpose: Seed placeholder exercise rows for UUIDs referenced by `pro_routines` but missing from `exercises`.
-- Run this migration with your usual Supabase migration tooling or psql. It uses ON CONFLICT DO NOTHING
-- so it is safe to run multiple times.

INSERT INTO "public"."exercises" (
  "id",
  "name",
  "description",
  "category_id",
  "thumbnail_url",
  "muscle_group_id",
  "type"
)
VALUES
  ('52c4b829-37e6-4f48-9e58-86d7e63b156a', 'Placeholder Exercise - 52c4b829', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('a1e8c8a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d', 'Placeholder Exercise - a1e8c8a0', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('3127c595-5c1a-4f51-87c2-1e967a503525', 'Placeholder Exercise - 3127c595', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('93f0b2a3-5c6e-4b8a-9c4c-3e6f6a7b8c9d', 'Placeholder Exercise - 93f0b2a3', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('6712b3c2-8438-4876-9d32-d178f73117b9', 'Placeholder Exercise - 6712b3c2', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('803a6234-f869-4e3b-9e8c-843f0e0f8b1a', 'Placeholder Exercise - 803a6234', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('b3e0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b', 'Placeholder Exercise - b3e0a1b2', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('c0a3e8d2-5e48-4a68-80b6-7b44383c0757', 'Placeholder Exercise - c0a3e8d2', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('62c1e878-5e48-4a68-80b6-7b44383c0757', 'Placeholder Exercise - 62c1e878', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('1f0c4b8a-3e6b-4e6f-8b2f-3c5d8a9e6b3c', 'Placeholder Exercise - 1f0c4b8a', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength'),
  ('d6f0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b', 'Placeholder Exercise - d6f0a1b2', 'Seeded placeholder for missing exercise reference', NULL, NULL, NULL, 'Strength')
ON CONFLICT (id) DO NOTHING;

-- NOTE:
-- 1) These are placeholder rows to restore app UX quickly. Replace the names/descriptions with
--    accurate values when you have them and reapply the migration (or run an UPDATE).
-- 2) To apply with the Supabase CLI (example):
--    supabase db push --file supabase/migrations/20251019180000_seed_missing_exercises.sql
--    or run with psql against your DB/connection string.
