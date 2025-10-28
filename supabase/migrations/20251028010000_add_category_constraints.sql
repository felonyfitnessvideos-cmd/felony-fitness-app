-- Add CHECK constraints for category validation
-- This migration adds constraints to ensure category fields only accept valid values

-- Add CHECK constraint for meals.category to enforce valid meal categories
ALTER TABLE meals
ADD CONSTRAINT meals_category_check 
CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- Add CHECK constraint for foods.category (if needed)
-- Note: We'll need to investigate what valid food categories should be
-- For now, we'll allow any string value but can tighten this later
-- ALTER TABLE foods
-- ADD CONSTRAINT foods_category_check 
-- CHECK (category IS NULL OR length(category) > 0);

-- Note: pro_routines already uses enum type routine_category, so no constraint needed

-- Add comment to document the constraint
COMMENT ON CONSTRAINT meals_category_check ON meals IS 
'Ensures meal category is one of the valid meal types: breakfast, lunch, dinner, snack';