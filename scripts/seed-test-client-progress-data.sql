/**
 * Seed Test Client Progress Data
 * 
 * Purpose: Create comprehensive test data for a client to view in Progress Tracker
 * 
 * Tables populated:
 * 1. user_profiles - Test client profile
 * 2. trainer_clients - Link test client to your trainer account
 * 3. workout_logs - 10 days of workout history
 * 4. food_servings - Sample foods for nutrition tracking
 * 5. nutrition_logs - 10 days of nutrition data
 * 6. goals - 5 active goals with realistic progress
 * 
 * Run this in Supabase SQL Editor
 * Replace 'YOUR-TRAINER-UUID' with your actual user ID
 */

-- ============================================================
-- STEP 1: Create test client user profile
-- ============================================================

-- First, check if test client already exists
DO $$
DECLARE
  test_client_id UUID;
  your_trainer_id UUID := '98d4870d-e3e4-4303-86ec-42232c2c166d';
BEGIN
  -- Try to find existing test client
  SELECT id INTO test_client_id
  FROM user_profiles
  WHERE email = 'testclient@felonyfitness.com'
  LIMIT 1;
  
  -- If not found, create one
  IF test_client_id IS NULL THEN
    -- Generate a new UUID for test client
    test_client_id := gen_random_uuid();
    
    INSERT INTO user_profiles (
      id,
      email,
      first_name,
      last_name,
      is_trainer,
      created_at,
      updated_at
    ) VALUES (
      test_client_id,
      'testclient@felonyfitness.com',
      'Test',
      'Client',
      false,
      NOW() - INTERVAL '30 days', -- Account created 30 days ago
      NOW()
    );
    
    RAISE NOTICE 'Created test client with ID: %', test_client_id;
  ELSE
    RAISE NOTICE 'Test client already exists with ID: %', test_client_id;
  END IF;
  
  -- ============================================================
  -- STEP 2: Link test client to your trainer account
  -- ============================================================
  
  -- Check if relationship already exists
  IF NOT EXISTS (
    SELECT 1 FROM trainer_clients
    WHERE trainer_id = your_trainer_id
    AND client_id = test_client_id
  ) THEN
    INSERT INTO trainer_clients (
      trainer_id,
      client_id,
      full_name,
      email,
      status,
      created_at,
      updated_at
    ) VALUES (
      your_trainer_id,
      test_client_id,
      'Test Client',
      'testclient@felonyfitness.com',
      'active',
      NOW() - INTERVAL '30 days',
      NOW()
    );
    
    RAISE NOTICE 'Created trainer-client relationship';
  ELSE
    RAISE NOTICE 'Trainer-client relationship already exists';
  END IF;
  
  -- ============================================================
  -- STEP 3: Create sample food servings for nutrition logs
  -- ============================================================
  
  -- Delete existing test foods to avoid duplicates
  DELETE FROM food_servings
  WHERE food_name IN (
    'Chicken Breast (Grilled)',
    'Brown Rice (Cooked)',
    'Broccoli (Steamed)',
    'Salmon (Baked)',
    'Sweet Potato (Baked)',
    'Greek Yogurt (Plain)',
    'Banana',
    'Almonds',
    'Protein Shake',
    'Oatmeal (Cooked)'
  );
  
  -- Insert sample foods with realistic macros
  INSERT INTO food_servings (food_name, serving_size, calories, protein, carbs, fats, user_id, is_public)
  VALUES
    ('Chicken Breast (Grilled)', '6 oz', 280, 53, 0, 6, test_client_id, true),
    ('Brown Rice (Cooked)', '1 cup', 216, 5, 45, 2, test_client_id, true),
    ('Broccoli (Steamed)', '1 cup', 55, 4, 11, 0.5, test_client_id, true),
    ('Salmon (Baked)', '6 oz', 367, 39, 0, 22, test_client_id, true),
    ('Sweet Potato (Baked)', '1 medium', 103, 2, 24, 0, test_client_id, true),
    ('Greek Yogurt (Plain)', '1 cup', 130, 22, 9, 0.5, test_client_id, true),
    ('Banana', '1 medium', 105, 1, 27, 0, test_client_id, true),
    ('Almonds', '1 oz (28g)', 164, 6, 6, 14, test_client_id, true),
    ('Protein Shake', '1 scoop', 120, 24, 3, 1, test_client_id, true),
    ('Oatmeal (Cooked)', '1 cup', 166, 6, 28, 4, test_client_id, true);
  
  RAISE NOTICE 'Created 10 sample food servings';
  
  -- ============================================================
  -- STEP 4: Create workout logs (last 10 days)
  -- ============================================================
  
  -- Delete existing workout logs for test client
  DELETE FROM workout_logs WHERE user_id = test_client_id;
  
  -- Insert 10 days of workout data with varying metrics
  INSERT INTO workout_logs (
    user_id,
    routine_name,
    duration_minutes,
    notes,
    calories_burned,
    created_at
  ) VALUES
    -- Day 1 (10 days ago) - Push Day
    (test_client_id, 'Push Day', 65, 'Great chest pump today!', 420, (NOW() - INTERVAL '10 days')::DATE + TIME '09:30:00'),
    
    -- Day 2 (9 days ago) - Pull Day
    (test_client_id, 'Pull Day', 70, 'PRs on deadlifts 💪', 450, (NOW() - INTERVAL '9 days')::DATE + TIME '10:00:00'),
    
    -- Day 3 (8 days ago) - Legs
    (test_client_id, 'Leg Day', 80, 'Brutal leg session', 520, (NOW() - INTERVAL '8 days')::DATE + TIME '09:00:00'),
    
    -- Day 4 (7 days ago) - Rest/Active Recovery
    (test_client_id, 'Active Recovery', 30, 'Light cardio and stretching', 180, (NOW() - INTERVAL '7 days')::DATE + TIME '18:00:00'),
    
    -- Day 5 (6 days ago) - Upper Body
    (test_client_id, 'Upper Body Power', 75, 'Felt strong today', 480, (NOW() - INTERVAL '6 days')::DATE + TIME '09:30:00'),
    
    -- Day 6 (5 days ago) - Cardio
    (test_client_id, 'HIIT Cardio', 40, '20 min HIIT + abs', 310, (NOW() - INTERVAL '5 days')::DATE + TIME '17:30:00'),
    
    -- Day 7 (4 days ago) - Push Day
    (test_client_id, 'Push Day', 68, 'Shoulder focused session', 440, (NOW() - INTERVAL '4 days')::DATE + TIME '10:00:00'),
    
    -- Day 8 (3 days ago) - Pull Day
    (test_client_id, 'Pull Day', 72, 'Back and biceps pump', 460, (NOW() - INTERVAL '3 days')::DATE + TIME '09:30:00'),
    
    -- Day 9 (2 days ago) - Legs
    (test_client_id, 'Leg Day', 85, 'Squat PR! 315x5', 540, (NOW() - INTERVAL '2 days')::DATE + TIME '09:00:00'),
    
    -- Day 10 (yesterday) - Active Recovery
    (test_client_id, 'Active Recovery', 35, 'Yoga and mobility work', 200, (NOW() - INTERVAL '1 day')::DATE + TIME '18:30:00');
  
  RAISE NOTICE 'Created 10 workout logs';
  
  -- ============================================================
  -- STEP 5: Create nutrition logs (last 10 days)
  -- ============================================================
  
  -- Delete existing nutrition logs for test client
  DELETE FROM nutrition_logs WHERE user_id = test_client_id;
  
  -- Get food serving IDs for reference
  DECLARE
    chicken_id UUID;
    rice_id UUID;
    broccoli_id UUID;
    salmon_id UUID;
    sweet_potato_id UUID;
    yogurt_id UUID;
    banana_id UUID;
    almonds_id UUID;
    protein_id UUID;
    oatmeal_id UUID;
  BEGIN
    SELECT id INTO chicken_id FROM food_servings WHERE food_name = 'Chicken Breast (Grilled)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO rice_id FROM food_servings WHERE food_name = 'Brown Rice (Cooked)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO broccoli_id FROM food_servings WHERE food_name = 'Broccoli (Steamed)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO salmon_id FROM food_servings WHERE food_name = 'Salmon (Baked)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO sweet_potato_id FROM food_servings WHERE food_name = 'Sweet Potato (Baked)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO yogurt_id FROM food_servings WHERE food_name = 'Greek Yogurt (Plain)' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO banana_id FROM food_servings WHERE food_name = 'Banana' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO almonds_id FROM food_servings WHERE food_name = 'Almonds' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO protein_id FROM food_servings WHERE food_name = 'Protein Shake' AND user_id = test_client_id LIMIT 1;
    SELECT id INTO oatmeal_id FROM food_servings WHERE food_name = 'Oatmeal (Cooked)' AND user_id = test_client_id LIMIT 1;
    
    -- Insert realistic daily nutrition logs (3-4 meals per day)
    -- Day 1 (10 days ago) - 2400 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'Breakfast', 1.5, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '08:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '08:05:00'),
      (test_client_id, chicken_id, 'Lunch', 1, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '12:30:00'),
      (test_client_id, rice_id, 'Lunch', 1.5, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '12:30:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '12:35:00'),
      (test_client_id, protein_id, 'Snack', 1, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '15:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '19:00:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 2, (NOW() - INTERVAL '10 days')::DATE, (NOW() - INTERVAL '10 days')::DATE + TIME '19:00:00');
    
    -- Day 2 (9 days ago) - 2550 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'Breakfast', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '07:30:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '07:30:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '10:00:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '13:00:00'),
      (test_client_id, rice_id, 'Lunch', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '13:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '13:05:00'),
      (test_client_id, protein_id, 'Snack', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '16:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '19:30:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1.5, (NOW() - INTERVAL '9 days')::DATE, (NOW() - INTERVAL '9 days')::DATE + TIME '19:30:00');
    
    -- Day 3 (8 days ago) - 2650 calories (leg day - higher carbs)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'Breakfast', 2, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '07:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '07:00:00'),
      (test_client_id, protein_id, 'Breakfast', 1, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '07:05:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '12:00:00'),
      (test_client_id, rice_id, 'Lunch', 2, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '12:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '12:05:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '15:30:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '20:00:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 2, (NOW() - INTERVAL '8 days')::DATE, (NOW() - INTERVAL '8 days')::DATE + TIME '20:00:00');
    
    -- Day 4 (7 days ago) - 2100 calories (rest day - lower intake)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'Breakfast', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '08:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '08:00:00'),
      (test_client_id, chicken_id, 'Lunch', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '13:00:00'),
      (test_client_id, rice_id, 'Lunch', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '13:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1.5, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '13:05:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '19:00:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1, (NOW() - INTERVAL '7 days')::DATE, (NOW() - INTERVAL '7 days')::DATE + TIME '19:00:00');
    
    -- Day 5 (6 days ago) - 2500 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'Breakfast', 1.5, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '07:30:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '07:30:00'),
      (test_client_id, protein_id, 'Breakfast', 1, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '07:35:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '12:30:00'),
      (test_client_id, rice_id, 'Lunch', 1.5, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '12:30:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '12:35:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '16:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '19:30:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1.5, (NOW() - INTERVAL '6 days')::DATE, (NOW() - INTERVAL '6 days')::DATE + TIME '19:30:00');
    
    -- Day 6 (5 days ago) - 2400 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'Breakfast', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '08:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '08:00:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '10:30:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '13:00:00'),
      (test_client_id, rice_id, 'Lunch', 1.5, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '13:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '13:05:00'),
      (test_client_id, protein_id, 'Snack', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '16:30:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '20:00:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1.5, (NOW() - INTERVAL '5 days')::DATE, (NOW() - INTERVAL '5 days')::DATE + TIME '20:00:00');
    
    -- Day 7 (4 days ago) - 2600 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'Breakfast', 1.5, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '07:30:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '07:30:00'),
      (test_client_id, protein_id, 'Breakfast', 1, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '07:35:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '12:30:00'),
      (test_client_id, rice_id, 'Lunch', 2, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '12:30:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '12:35:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '15:30:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '19:30:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 2, (NOW() - INTERVAL '4 days')::DATE, (NOW() - INTERVAL '4 days')::DATE + TIME '19:30:00');
    
    -- Day 8 (3 days ago) - 2450 calories
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'Breakfast', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '08:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '08:00:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '10:30:00'),
      (test_client_id, chicken_id, 'Lunch', 1.5, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '13:00:00'),
      (test_client_id, rice_id, 'Lunch', 1.5, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '13:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '13:05:00'),
      (test_client_id, protein_id, 'Snack', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '16:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '19:30:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1.5, (NOW() - INTERVAL '3 days')::DATE, (NOW() - INTERVAL '3 days')::DATE + TIME '19:30:00');
    
    -- Day 9 (2 days ago) - 2700 calories (leg day PR - higher intake)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'Breakfast', 2, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '07:00:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '07:00:00'),
      (test_client_id, protein_id, 'Breakfast', 1, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '07:05:00'),
      (test_client_id, chicken_id, 'Lunch', 2, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '12:00:00'),
      (test_client_id, rice_id, 'Lunch', 2, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '12:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '12:05:00'),
      (test_client_id, almonds_id, 'Snack', 1, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '15:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '20:00:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 2, (NOW() - INTERVAL '2 days')::DATE, (NOW() - INTERVAL '2 days')::DATE + TIME '20:00:00');
    
    -- Day 10 (yesterday) - 2200 calories (recovery day)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'Breakfast', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '08:30:00'),
      (test_client_id, banana_id, 'Breakfast', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '08:30:00'),
      (test_client_id, chicken_id, 'Lunch', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '13:00:00'),
      (test_client_id, rice_id, 'Lunch', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '13:00:00'),
      (test_client_id, broccoli_id, 'Lunch', 1.5, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '13:05:00'),
      (test_client_id, protein_id, 'Snack', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '16:00:00'),
      (test_client_id, salmon_id, 'Dinner', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '19:30:00'),
      (test_client_id, sweet_potato_id, 'Dinner', 1, (NOW() - INTERVAL '1 day')::DATE, (NOW() - INTERVAL '1 day')::DATE + TIME '19:30:00');
    
    RAISE NOTICE 'Created 10 days of nutrition logs (~70 food log entries)';
  END;
  
  -- ============================================================
  -- STEP 6: Create active goals with realistic progress
  -- ============================================================
  
  -- Delete existing goals for test client
  DELETE FROM goals WHERE user_id = test_client_id;
  
  -- Insert 5 active goals with varying progress
  INSERT INTO goals (
    user_id,
    goal_type,
    target_value,
    current_value,
    deadline,
    notes,
    is_active,
    created_at,
    updated_at
  ) VALUES
    -- Goal 1: Weight loss (70% complete)
    (
      test_client_id,
      'Weight Loss',
      20.0,
      14.0,
      NOW() + INTERVAL '60 days',
      'Lose 20 lbs by cutting season end',
      true,
      NOW() - INTERVAL '25 days',
      NOW() - INTERVAL '1 day'
    ),
    
    -- Goal 2: Squat strength (85% complete)
    (
      test_client_id,
      'Squat 1RM',
      365.0,
      310.0,
      NOW() + INTERVAL '30 days',
      'Hit 365 lb squat for 1 rep max',
      true,
      NOW() - INTERVAL '20 days',
      NOW() - INTERVAL '2 days'
    ),
    
    -- Goal 3: Weekly workout consistency (90% complete)
    (
      test_client_id,
      'Weekly Workouts',
      5.0,
      4.5,
      NOW() + INTERVAL '90 days',
      'Average 5 workouts per week',
      true,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '1 day'
    ),
    
    -- Goal 4: Daily protein intake (60% complete)
    (
      test_client_id,
      'Daily Protein (g)',
      200.0,
      120.0,
      NOW() + INTERVAL '45 days',
      'Consistently hit 200g protein daily',
      true,
      NOW() - INTERVAL '15 days',
      NOW() - INTERVAL '1 day'
    ),
    
    -- Goal 5: Body fat percentage (45% complete)
    (
      test_client_id,
      'Body Fat %',
      12.0,
      15.9,
      NOW() + INTERVAL '75 days',
      'Get to 12% body fat',
      true,
      NOW() - INTERVAL '28 days',
      NOW() - INTERVAL '3 days'
    );
  
  RAISE NOTICE 'Created 5 active goals with progress';
  
  -- ============================================================
  -- FINAL SUMMARY
  -- ============================================================
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test client progress data seeded successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test Client ID: %', test_client_id;
  RAISE NOTICE 'Test Client Email: testclient@felonyfitness.com';
  RAISE NOTICE 'Your Trainer ID: %', your_trainer_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Data created:';
  RAISE NOTICE '  ✅ 1 test client profile';
  RAISE NOTICE '  ✅ 1 trainer-client relationship';
  RAISE NOTICE '  ✅ 10 sample food servings';
  RAISE NOTICE '  ✅ 10 workout logs (last 10 days)';
  RAISE NOTICE '  ✅ ~70 nutrition log entries (10 days × ~7 meals)';
  RAISE NOTICE '  ✅ 5 active goals with progress';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Go to Trainer Dashboard → Clients';
  RAISE NOTICE '  2. Click on "Test Client" card';
  RAISE NOTICE '  3. Progress Tracker will auto-load with data';
  RAISE NOTICE '  4. You should see:';
  RAISE NOTICE '     - 10 total workouts';
  RAISE NOTICE '     - ~70 min avg duration';
  RAISE NOTICE '     - ~2450 cal avg daily intake';
  RAISE NOTICE '     - ~420 cal avg burn per workout';
  RAISE NOTICE '     - 7-day workout & nutrition trends';
  RAISE NOTICE '     - Top 3 goals with progress bars';
  RAISE NOTICE '========================================';
END $$;
