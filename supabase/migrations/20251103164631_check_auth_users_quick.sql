-- Quick check of user data location
SELECT 'Checking auth.users...' as info;
SELECT COUNT(*) as auth_users_count FROM auth.users;

SELECT 'Recent auth users:' as info;  
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 3;

SELECT 'Checking user_profiles...' as info;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
