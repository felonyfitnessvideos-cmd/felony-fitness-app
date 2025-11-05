-- Quick cleanup script for your specific case
-- Replace 'your-email@example.com' with your actual email

-- Step 1: Find your user ID (simplified - just from auth.users)
SELECT 'Your user profile:' as info;
SELECT 
    au.id, 
    au.email, 
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
WHERE au.email = 'your-email@example.com';  -- REPLACE WITH YOUR EMAIL

-- Also check if user_profiles entry exists
SELECT 'Your user_profiles entry:' as info;
SELECT up.*
FROM user_profiles up
WHERE up.id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Step 2: Check current relationships involving you
SELECT 'Your current trainer-client relationships:' as info;
SELECT 
    tc.*,
    CASE 
        WHEN tc.trainer_id = au.id THEN 'You are the TRAINER'
        WHEN tc.client_id = au.id THEN 'You are the CLIENT'
        ELSE 'Unknown relationship'
    END as your_role
FROM trainer_clients tc
CROSS JOIN auth.users au
WHERE au.email = 'your-email@example.com'  -- REPLACE WITH YOUR EMAIL
AND (tc.trainer_id = au.id OR tc.client_id = au.id);

-- Step 3: Check your current tags
SELECT 'Your current tags:' as info;
SELECT 
    ut.id as user_tag_id,
    t.name as tag_name,
    ut.assigned_at
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
LEFT JOIN auth.users au ON au.id = ut.user_id
WHERE au.email = 'your-email@example.com'  -- REPLACE WITH YOUR EMAIL
ORDER BY ut.assigned_at DESC;

-- UNCOMMENT BELOW TO EXECUTE CLEANUP:

-- Step 4: Delete your trainer-client relationships
-- DELETE FROM trainer_clients 
-- WHERE trainer_id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--    OR client_id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Step 5: Remove role tags (Client/Trainer) but keep User tag
-- DELETE FROM user_tags 
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--   AND tag_id IN (SELECT id FROM tags WHERE name IN ('Client', 'Trainer'));

-- Step 6: Verify cleanup
-- SELECT 'After cleanup verification:' as info;
-- SELECT COUNT(*) as remaining_relationships 
-- FROM trainer_clients tc
-- CROSS JOIN auth.users au
-- WHERE au.email = 'your-email@example.com'
-- AND (tc.trainer_id = au.id OR tc.client_id = au.id);