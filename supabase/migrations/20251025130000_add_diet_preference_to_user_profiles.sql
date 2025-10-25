-- Add diet_preference column to user_profiles (Vegetarian/Vegan/None)
-- Idempotent: uses IF NOT EXISTS so repeated runs are safe.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS diet_preference TEXT DEFAULT '';

-- Optional: index may be unnecessary, but if you plan to query by diet, consider an index.
-- CREATE INDEX IF NOT EXISTS idx_user_profiles_diet_preference ON public.user_profiles (diet_preference);
