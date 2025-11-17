/**
 * @file fix-user-meals-data-structure.sql
 * @description Fix user_meals system - migrate user-created meals from meals table to user_meals table
 * @date 2025-11-17
 * 
 * PROBLEM: User-created meals were being saved to the 'meals' table with user_id,
 * when they should have been saved to the 'user_meals' table. This caused them to
 * disappear when the 'meals' table was cleaned up.
 * 
 * SOLUTION:
 * 1. Migrate any user-created meals from 'meals' table to 'user_meals' table
 * 2. Migrate meal_foods entries to user_meal_foods
 * 3. Update weekly_meal_plan_entries to add support for both meals and user_meals
 */

-- Step 1: Check if we need to migrate any meals from 'meals' to 'user_meals'
-- (Meals with user_id set are user-created meals)
DO $$
DECLARE
  meal_record RECORD;
  new_user_meal_id UUID;
BEGIN
  -- Loop through all user-created meals in the meals table
  FOR meal_record IN 
    SELECT * FROM meals 
    WHERE user_id IS NOT NULL 
      AND is_premade = FALSE
  LOOP
    RAISE NOTICE 'Migrating meal: % (ID: %)', meal_record.name, meal_record.id;
    
    -- Insert into user_meals table
    INSERT INTO user_meals (
      id,  -- Keep the same ID to preserve foreign key relationships
      user_id,
      meal_id,  -- NULL for user-created meals
      name,
      description,
      category,
      prep_time_minutes,
      cook_time_minutes,
      serving_size,
      difficulty_level,
      instructions,
      image_url,
      is_favorite,
      custom_name,
      tags,
      created_at,
      updated_at
    ) VALUES (
      meal_record.id,  -- Preserve the ID
      meal_record.user_id,
      NULL,  -- Not linked to premade meals
      meal_record.name,
      meal_record.description,
      meal_record.category,
      meal_record.prep_time_minutes,
      meal_record.cook_time_minutes,
      meal_record.serving_size,
      meal_record.difficulty_level,
      meal_record.instructions,
      meal_record.image_url,
      meal_record.is_favorite,
      NULL,  -- custom_name
      meal_record.tags,
      meal_record.created_at,
      meal_record.updated_at
    ) ON CONFLICT (id) DO NOTHING;  -- Skip if already exists
    
    -- Migrate meal_foods to user_meal_foods
    INSERT INTO user_meal_foods (
      user_meal_id,
      food_servings_id,
      quantity,
      notes,
      created_at
    )
    SELECT 
      meal_record.id,  -- Use the same ID as user_meal_id
      food_servings_id,
      quantity,
      notes,
      created_at
    FROM meal_foods
    WHERE meal_id = meal_record.id
    ON CONFLICT DO NOTHING;  -- Skip if already exists
    
  END LOOP;
  
  RAISE NOTICE 'Migration complete!';
END $$;

-- Step 2: Add user_meal_id column to weekly_meal_plan_entries if it doesn't exist
-- This allows meal plans to reference EITHER meals (premade) OR user_meals (user-created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'weekly_meal_plan_entries' 
    AND column_name = 'user_meal_id'
  ) THEN
    ALTER TABLE weekly_meal_plan_entries 
    ADD COLUMN user_meal_id UUID REFERENCES user_meals(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added user_meal_id column to weekly_meal_plan_entries';
  ELSE
    RAISE NOTICE 'user_meal_id column already exists';
  END IF;
END $$;

-- Step 3: Add constraint to ensure either meal_id OR user_meal_id is set (not both, not neither)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'weekly_meal_plan_entries_meal_xor'
  ) THEN
    ALTER TABLE weekly_meal_plan_entries 
    ADD CONSTRAINT weekly_meal_plan_entries_meal_xor 
    CHECK (
      (meal_id IS NOT NULL AND user_meal_id IS NULL) OR 
      (meal_id IS NULL AND user_meal_id IS NOT NULL)
    );
    
    RAISE NOTICE 'Added XOR constraint for meal_id and user_meal_id';
  ELSE
    RAISE NOTICE 'XOR constraint already exists';
  END IF;
END $$;

-- Step 4: Update any existing weekly_meal_plan_entries that point to migrated meals
-- If meal_id points to a meal that was migrated to user_meals, update to use user_meal_id
UPDATE weekly_meal_plan_entries
SET 
  user_meal_id = meal_id,
  meal_id = NULL
WHERE meal_id IN (
  SELECT id FROM user_meals WHERE meal_id IS NULL
);

-- Step 5: Clean up - delete user-created meals from meals table (they're now in user_meals)
DELETE FROM meals
WHERE user_id IS NOT NULL 
  AND is_premade = FALSE
  AND id IN (SELECT id FROM user_meals WHERE meal_id IS NULL);

-- Verify the migration
SELECT 
  'User-created meals in user_meals' as table_name,
  COUNT(*) as count
FROM user_meals
WHERE meal_id IS NULL

UNION ALL

SELECT 
  'User-created meals still in meals' as table_name,
  COUNT(*) as count
FROM meals
WHERE user_id IS NOT NULL 
  AND is_premade = FALSE;
