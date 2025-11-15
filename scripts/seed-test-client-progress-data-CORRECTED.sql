/**
 * Seed Test Client Progress Data - CORRECTED VERSION
 * 
 * Based on actual database schema from database.types.ts
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
 */

-- ============================================================
-- STEP 1: Create test client in auth.users AND user_profiles
-- ============================================================

DO $$
DECLARE
  test_client_id UUID;
  your_trainer_id UUID := '98d4870d-e3e4-4303-86ec-42232c2c166d';
BEGIN
  -- Find existing test client (must sign up through the app first!)
  SELECT id INTO test_client_id
  FROM user_profiles
  WHERE email = 'testclient@felonyfitness.com'
  LIMIT 1;
  
  -- If not found, abort with helpful message
  IF test_client_id IS NULL THEN
    RAISE EXCEPTION 'Test client not found! Please sign up first with email: testclient@felonyfitness.com';
  END IF;
  
  RAISE NOTICE 'Found test client with ID: %', test_client_id;
  
  -- ============================================================
  -- STEP 2: Link test client to your trainer account
  -- ============================================================
  
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
  
  -- Note: food_servings has: food_name, serving_description, calories, protein_g, carbs_g, fat_g
  INSERT INTO food_servings (food_name, serving_description, calories, protein_g, carbs_g, fat_g)
  VALUES
    ('Chicken Breast (Grilled)', '6 oz', 280, 53, 0, 6),
    ('Brown Rice (Cooked)', '1 cup', 216, 5, 45, 2),
    ('Broccoli (Steamed)', '1 cup', 55, 4, 11, 0.5),
    ('Salmon (Baked)', '6 oz', 367, 39, 0, 22),
    ('Sweet Potato (Baked)', '1 medium', 103, 2, 24, 0),
    ('Greek Yogurt (Plain)', '1 cup', 130, 22, 9, 0.5),
    ('Banana', '1 medium', 105, 1, 27, 0),
    ('Almonds', '1 oz (28g)', 164, 6, 6, 14),
    ('Protein Shake', '1 scoop', 120, 24, 3, 1),
    ('Oatmeal (Cooked)', '1 cup', 166, 6, 28, 4);
  
  RAISE NOTICE 'Created 10 sample food servings';
  
  -- ============================================================
  -- STEP 4: Create workout logs (last 10 days)
  -- ============================================================
  
  DELETE FROM workout_logs WHERE user_id = test_client_id;
  
  -- Note: workout_logs has: user_id, workout_name, duration_minutes, notes, calories_burned, log_date, created_at
  INSERT INTO workout_logs (
    user_id,
    workout_name,
    duration_minutes,
    notes,
    calories_burned,
    log_date,
    created_at
  ) VALUES
    (test_client_id, 'Push Day', 65, 'Great chest pump today!', 420, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
    (test_client_id, 'Pull Day', 70, 'PRs on deadlifts 💪', 450, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
    (test_client_id, 'Leg Day', 80, 'Brutal leg session', 520, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
    (test_client_id, 'Active Recovery', 30, 'Light cardio and stretching', 180, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
    (test_client_id, 'Upper Body Power', 75, 'Felt strong today', 480, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
    (test_client_id, 'HIIT Cardio', 40, '20 min HIIT + abs', 310, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
    (test_client_id, 'Push Day', 68, 'Shoulder focused session', 440, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
    (test_client_id, 'Pull Day', 72, 'Back and biceps pump', 460, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
    (test_client_id, 'Leg Day', 85, 'Squat PR! 315x5', 540, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
    (test_client_id, 'Active Recovery', 35, 'Yoga and mobility work', 200, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day');
  
  RAISE NOTICE 'Created 10 workout logs';
  
  -- ============================================================
  -- STEP 5: Create nutrition logs (last 10 days)
  -- ============================================================
  
  DELETE FROM nutrition_logs WHERE user_id = test_client_id;
  
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
    SELECT id INTO chicken_id FROM food_servings WHERE food_name = 'Chicken Breast (Grilled)' LIMIT 1;
    SELECT id INTO rice_id FROM food_servings WHERE food_name = 'Brown Rice (Cooked)' LIMIT 1;
    SELECT id INTO broccoli_id FROM food_servings WHERE food_name = 'Broccoli (Steamed)' LIMIT 1;
    SELECT id INTO salmon_id FROM food_servings WHERE food_name = 'Salmon (Baked)' LIMIT 1;
    SELECT id INTO sweet_potato_id FROM food_servings WHERE food_name = 'Sweet Potato (Baked)' LIMIT 1;
    SELECT id INTO yogurt_id FROM food_servings WHERE food_name = 'Greek Yogurt (Plain)' LIMIT 1;
    SELECT id INTO banana_id FROM food_servings WHERE food_name = 'Banana' LIMIT 1;
    SELECT id INTO almonds_id FROM food_servings WHERE food_name = 'Almonds' LIMIT 1;
    SELECT id INTO protein_id FROM food_servings WHERE food_name = 'Protein Shake' LIMIT 1;
    SELECT id INTO oatmeal_id FROM food_servings WHERE food_name = 'Oatmeal (Cooked)' LIMIT 1;
    
    -- Note: nutrition_logs has: user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at
    -- IMPORTANT: meal_type must be lowercase: 'breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'water'
    -- Day 1 (10 days ago)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, oatmeal_id, 'breakfast', 1.5, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, chicken_id, 'lunch', 1, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, rice_id, 'lunch', 1.5, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, protein_id, 'snack1', 1, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days'),
      (test_client_id, sweet_potato_id, 'dinner', 2, (NOW() - INTERVAL '10 days')::DATE, NOW() - INTERVAL '10 days');
    
    -- Day 2-10 (continuing same pattern)
    INSERT INTO nutrition_logs (user_id, food_serving_id, meal_type, quantity_consumed, log_date, created_at)
    VALUES
      (test_client_id, yogurt_id, 'breakfast', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, rice_id, 'lunch', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, protein_id, 'snack1', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      (test_client_id, sweet_potato_id, 'dinner', 1.5, (NOW() - INTERVAL '9 days')::DATE, NOW() - INTERVAL '9 days'),
      
      (test_client_id, oatmeal_id, 'breakfast', 2, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, protein_id, 'breakfast', 1, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, rice_id, 'lunch', 2, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      (test_client_id, sweet_potato_id, 'dinner', 2, (NOW() - INTERVAL '8 days')::DATE, NOW() - INTERVAL '8 days'),
      
      (test_client_id, yogurt_id, 'breakfast', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, chicken_id, 'lunch', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, rice_id, 'lunch', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, broccoli_id, 'lunch', 1.5, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      (test_client_id, sweet_potato_id, 'dinner', 1, (NOW() - INTERVAL '7 days')::DATE, NOW() - INTERVAL '7 days'),
      
      (test_client_id, oatmeal_id, 'breakfast', 1.5, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, protein_id, 'breakfast', 1, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, rice_id, 'lunch', 1.5, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      (test_client_id, sweet_potato_id, 'dinner', 1.5, (NOW() - INTERVAL '6 days')::DATE, NOW() - INTERVAL '6 days'),
      
      (test_client_id, yogurt_id, 'breakfast', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, rice_id, 'lunch', 1.5, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, protein_id, 'snack1', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      (test_client_id, sweet_potato_id, 'dinner', 1.5, (NOW() - INTERVAL '5 days')::DATE, NOW() - INTERVAL '5 days'),
      
      (test_client_id, oatmeal_id, 'breakfast', 1.5, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, protein_id, 'breakfast', 1, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, rice_id, 'lunch', 2, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      (test_client_id, sweet_potato_id, 'dinner', 2, (NOW() - INTERVAL '4 days')::DATE, NOW() - INTERVAL '4 days'),
      
      (test_client_id, yogurt_id, 'breakfast', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, chicken_id, 'lunch', 1.5, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, rice_id, 'lunch', 1.5, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, protein_id, 'snack1', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      (test_client_id, sweet_potato_id, 'dinner', 1.5, (NOW() - INTERVAL '3 days')::DATE, NOW() - INTERVAL '3 days'),
      
      (test_client_id, oatmeal_id, 'breakfast', 2, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, protein_id, 'breakfast', 1, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, chicken_id, 'lunch', 2, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, rice_id, 'lunch', 2, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, broccoli_id, 'lunch', 1, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, almonds_id, 'snack1', 1, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      (test_client_id, sweet_potato_id, 'dinner', 2, (NOW() - INTERVAL '2 days')::DATE, NOW() - INTERVAL '2 days'),
      
      (test_client_id, yogurt_id, 'breakfast', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, banana_id, 'breakfast', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, chicken_id, 'lunch', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, rice_id, 'lunch', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, broccoli_id, 'lunch', 1.5, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, protein_id, 'snack1', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, salmon_id, 'dinner', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day'),
      (test_client_id, sweet_potato_id, 'dinner', 1, (NOW() - INTERVAL '1 day')::DATE, NOW() - INTERVAL '1 day');
    
    RAISE NOTICE 'Created 10 days of nutrition logs (~70 food log entries)';
  END;
  
  -- ============================================================
  -- STEP 6: Create active goals with realistic progress
  -- ============================================================
  
  DELETE FROM goals WHERE user_id = test_client_id;
  
  -- Note: goals has: user_id, goal_description, target_value, current_value, target_date, notes, status
  INSERT INTO goals (
    user_id,
    goal_description,
    target_value,
    current_value,
    target_date,
    notes,
    status,
    created_at,
    updated_at
  ) VALUES
    (test_client_id, 'Weight Loss', 20.0, 14.0, (NOW() + INTERVAL '60 days')::DATE, 'Lose 20 lbs by cutting season end', 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day'),
    (test_client_id, 'Squat 1RM', 365.0, 310.0, (NOW() + INTERVAL '30 days')::DATE, 'Hit 365 lb squat for 1 rep max', 'active', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
    (test_client_id, 'Weekly Workouts', 5.0, 4.5, (NOW() + INTERVAL '90 days')::DATE, 'Average 5 workouts per week', 'active', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
    (test_client_id, 'Daily Protein (g)', 200.0, 120.0, (NOW() + INTERVAL '45 days')::DATE, 'Consistently hit 200g protein daily', 'active', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),
    (test_client_id, 'Body Fat %', 12.0, 15.9, (NOW() + INTERVAL '75 days')::DATE, 'Get to 12% body fat', 'active', NOW() - INTERVAL '28 days', NOW() - INTERVAL '3 days');
  
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
  RAISE NOTICE '========================================';
END $$;
