-- SIMPLE CLEANUP SCRIPT
-- Replace 'your-email@example.com' with your actual email

-- Step 1: Find your user ID
SELECT 'Finding your user ID...' as info;
SELECT id, email, created_at
FROM auth.users 
WHERE email = 'your-email@example.com';  -- REPLACE WITH YOUR EMAIL

-- Step 2: Check current trainer-client relationships
SELECT 'Your trainer-client relationships:' as info;
SELECT tc.*, 
       CASE 
           WHEN tc.trainer_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com') THEN 'You are TRAINER'
           WHEN tc.client_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com') THEN 'You are CLIENT'
       END as your_role
FROM trainer_clients tc
WHERE tc.trainer_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
   OR tc.client_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Step 3: Check your current tags
SELECT 'Your current tags:' as info;
SELECT ut.*, t.name as tag_name
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
WHERE ut.user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- UNCOMMENT THE SECTIONS BELOW TO EXECUTE CLEANUP:

-- Step 4: Delete trainer-client relationships
-- DELETE FROM trainer_clients 
-- WHERE trainer_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--    OR client_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Step 5: Remove Client/Trainer tags (keep User tag)
-- DELETE FROM user_tags 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--   AND tag_id IN (SELECT id FROM tags WHERE name IN ('Client', 'Trainer'));

-- Step 6: Verify cleanup
-- SELECT 'Cleanup verification:' as info;
-- SELECT COUNT(*) as remaining_relationships FROM trainer_clients 
-- WHERE trainer_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--    OR client_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- SELECT COUNT(*) as remaining_role_tags FROM user_tags 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
--   AND tag_id IN (SELECT id FROM tags WHERE name IN ('Client', 'Trainer'));