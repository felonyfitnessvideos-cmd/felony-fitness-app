-- Quick check to see what user IDs exist in the system
SELECT 'All user profiles:' as info;
SELECT id, email, first_name, last_name, created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Check all user_tags in the system
SELECT 'All user_tags in system:' as info;
SELECT 
    ut.user_id,
    ut.tag_id,
    t.name as tag_name,
    up.email,
    ut.assigned_at
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
LEFT JOIN user_profiles up ON up.id = ut.user_id
ORDER BY ut.assigned_at DESC;