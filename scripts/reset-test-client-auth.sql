/**
 * Reset Test Client Authentication
 * 
 * This script deletes and recreates the test client properly
 * so you can log in with the password.
 * 
 * Run this in Supabase SQL Editor
 */

DO $$
DECLARE
  test_client_id UUID;
  your_trainer_id UUID := '98d4870d-e3e4-4303-86ec-42232c2c166d';
BEGIN
  -- Find the test client
  SELECT id INTO test_client_id
  FROM auth.users
  WHERE email = 'testclient@felonyfitness.com'
  LIMIT 1;
  
  IF test_client_id IS NOT NULL THEN
    -- Delete all related data first (cascade should handle most)
    DELETE FROM goals WHERE user_id = test_client_id;
    DELETE FROM nutrition_logs WHERE user_id = test_client_id;
    DELETE FROM workout_logs WHERE user_id = test_client_id;
    DELETE FROM trainer_clients WHERE client_id = test_client_id;
    DELETE FROM user_profiles WHERE id = test_client_id;
    DELETE FROM auth.users WHERE id = test_client_id;
    
    RAISE NOTICE 'Deleted existing test client: %', test_client_id;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test client deleted successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Go to your app and SIGN UP a new account with:';
  RAISE NOTICE '     Email: testclient@felonyfitness.com';
  RAISE NOTICE '     Password: TestClient123!';
  RAISE NOTICE '     First Name: Test';
  RAISE NOTICE '     Last Name: Client';
  RAISE NOTICE '     Select: "I am a Client"';
  RAISE NOTICE '';
  RAISE NOTICE '  2. After signing up, come back and run the';
  RAISE NOTICE '     seed-test-client-progress-data-CORRECTED.sql script again';
  RAISE NOTICE '     (it will link the client to your trainer account and add data)';
  RAISE NOTICE '========================================';
END $$;
