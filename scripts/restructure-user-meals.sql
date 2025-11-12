-- Restructure user_meals to be self-contained
-- Migration to make user_meals a complete table instead of a junction table
-- Based on actual schema from database.types.ts

-- Step 1: Add all meal definition columns to user_meals (matching meals table structure)
ALTER TABLE user_meals
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled Meal',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS cook_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS serving_size DECIMAL,
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Update existing user_meals records with data from meals table
-- This migrates existing user meals that are stored in the meals table
UPDATE user_meals um
SET 
  name = COALESCE(m.name, 'Untitled Meal'),
  description = m.description,
  instructions = m.instructions,
  tags = m.tags,
  category = m.category,
  prep_time_minutes = m.prep_time_minutes,
  cook_time_minutes = m.cook_time_minutes,
  serving_size = m.serving_size,
  difficulty_level = m.difficulty_level,
  image_url = m.image_url
FROM meals m
WHERE um.meal_id = m.id
  AND um.name = 'Untitled Meal'; -- Only update if not already set

-- Step 3: Make meal_id nullable (optional - for backward compatibility)
-- Keep this for now so we can still reference premade meals if needed
ALTER TABLE user_meals ALTER COLUMN meal_id DROP NOT NULL;

-- Step 4: Remove the foreign key constraint (makes user_meals independent)
-- WARNING: This will prevent cascading deletes from meals table
ALTER TABLE user_meals DROP CONSTRAINT IF EXISTS user_meals_meal_id_fkey;

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_meals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_meals_updated_at ON user_meals;
CREATE TRIGGER user_meals_updated_at
  BEFORE UPDATE ON user_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_meals_updated_at();

-- Step 6: Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_meals'
ORDER BY ordinal_position;

-- Step 7: Show sample of migrated data
SELECT 
  id,
  user_id,
  name,
  category,
  is_favorite,
  meal_id,
  created_at
FROM user_meals
LIMIT 5;

-- ============================================================================
-- Create user_meal_foods table for user-created meals
-- ============================================================================
-- This is needed because meal_foods has a foreign key to meals.id,
-- but user meals are now stored in user_meals table.
-- Using separate table pattern (mirrors meal_foods structure)

CREATE TABLE IF NOT EXISTS user_meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_meal_id UUID NOT NULL REFERENCES user_meals(id) ON DELETE CASCADE,
  food_servings_id UUID REFERENCES food_servings(id) ON DELETE SET NULL,
  quantity DECIMAL NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy existing meal_foods for user-created meals
INSERT INTO user_meal_foods (user_meal_id, food_servings_id, quantity, notes, created_at)
SELECT 
  um.id as user_meal_id,
  mf.food_servings_id,
  mf.quantity,
  mf.notes,
  mf.created_at
FROM user_meals um
JOIN meal_foods mf ON mf.meal_id = um.meal_id
WHERE um.meal_id IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_meal_foods_user_meal_id ON user_meal_foods(user_meal_id);
CREATE INDEX IF NOT EXISTS idx_user_meal_foods_food_servings_id ON user_meal_foods(food_servings_id);

-- RLS Policies for user_meal_foods
ALTER TABLE user_meal_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own meal foods" ON user_meal_foods;
CREATE POLICY "Users can view their own meal foods" ON user_meal_foods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_meals 
      WHERE user_meals.id = user_meal_foods.user_meal_id 
      AND user_meals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own meal foods" ON user_meal_foods;
CREATE POLICY "Users can insert their own meal foods" ON user_meal_foods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_meals 
      WHERE user_meals.id = user_meal_foods.user_meal_id 
      AND user_meals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own meal foods" ON user_meal_foods;
CREATE POLICY "Users can update their own meal foods" ON user_meal_foods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_meals 
      WHERE user_meals.id = user_meal_foods.user_meal_id 
      AND user_meals.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own meal foods" ON user_meal_foods;
CREATE POLICY "Users can delete their own meal foods" ON user_meal_foods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_meals 
      WHERE user_meals.id = user_meal_foods.user_meal_id 
      AND user_meals.user_id = auth.uid()
    )
  );
