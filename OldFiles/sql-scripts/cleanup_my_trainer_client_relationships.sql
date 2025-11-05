-- Clean up your trainer-client relationships for testing
-- This will remove you from trainer_clients table so you can test the onboarding process

-- Step 1: Check your current user ID and relationships
SELECT 'Your user information:' as info;
SELECT 
    id,
    email,
    first_name,
    last_name
FROM user_profiles 
WHERE email LIKE '%david%' OR first_name LIKE '%David%';

-- Step 2: Check current trainer-client relationships
SELECT 'Your current trainer-client relationships:' as info;
SELECT 
    tc.*,
    trainer.email as trainer_email,
    client.email as client_email
FROM trainer_clients tc
LEFT JOIN user_profiles trainer ON trainer.id = tc.trainer_id
LEFT JOIN user_profiles client ON client.id = tc.client_id
WHERE tc.trainer_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
   OR tc.client_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%');

-- Step 3: Check your current roles/tags
SELECT 'Your current roles/tags:' as info;
SELECT 
    ut.user_id,
    t.name as tag_name,
    t.description,
    ut.assigned_at
FROM user_tags ut
JOIN tags t ON t.id = ut.tag_id
WHERE ut.user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
ORDER BY ut.assigned_at DESC;

-- Step 4: Remove your trainer-client relationships (UNCOMMENT TO EXECUTE)
-- DELETE FROM trainer_clients 
-- WHERE trainer_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
--    OR client_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%');

-- Step 5: Optionally remove your role tags (UNCOMMENT TO EXECUTE IF YOU WANT TO START FRESH)
-- DELETE FROM user_tags 
-- WHERE user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
--   AND tag_id IN (SELECT id FROM tags WHERE name IN ('Trainer', 'Client'));

-- Step 6: Verify cleanup (UNCOMMENT AFTER RUNNING DELETES)
-- SELECT 'After cleanup - trainer_clients:' as info;
-- SELECT COUNT(*) as remaining_relationships
-- FROM trainer_clients tc
-- WHERE tc.trainer_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
--    OR tc.client_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%');

-- SELECT 'After cleanup - your roles:' as info;
-- SELECT 
--     ut.user_id,
--     t.name as tag_name,
--     ut.assigned_at
-- FROM user_tags ut
-- JOIN tags t ON t.id = ut.tag_id
-- WHERE ut.user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%david%' OR first_name LIKE '%David%')
-- ORDER BY ut.assigned_at DESC;