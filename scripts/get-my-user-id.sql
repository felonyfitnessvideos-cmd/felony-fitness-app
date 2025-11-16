/**
 * Get Your User ID
 * 
 * Run this in Supabase SQL Editor to find your user ID
 * Copy the UUID result and paste it into seed-test-client-progress-data.sql
 */

-- Get your user ID from user_profiles
SELECT 
  id as your_user_id,
  email,
  first_name,
  last_name,
  full_name,
  is_trainer
FROM user_profiles
WHERE is_trainer = true
ORDER BY created_at DESC
LIMIT 5;

-- Alternative: Get from auth.users if you know your email
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
