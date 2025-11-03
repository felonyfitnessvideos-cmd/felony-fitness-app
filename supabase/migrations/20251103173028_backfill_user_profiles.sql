-- Backfill user profiles for existing users
-- This ensures all existing auth.users have corresponding user_profiles

-- Create profiles for all existing users who don't have them
INSERT INTO user_profiles (id, user_id, email, created_at, updated_at)
SELECT 
    au.id,
    au.id,
    au.email,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Assign User tags to all users who don't have any tags
INSERT INTO user_tags (user_id, tag_id)
SELECT 
    au.id,
    t.id
FROM auth.users au
CROSS JOIN tags t
LEFT JOIN user_tags ut ON au.id = ut.user_id AND t.id = ut.tag_id
WHERE t.name = 'User'
  AND ut.id IS NULL;

-- Show results
SELECT 
    'Backfill complete' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_profiles) as total_user_profiles,
    (SELECT COUNT(*) FROM user_tags ut JOIN tags t ON ut.tag_id = t.id WHERE t.name = 'User') as users_with_user_tag;
