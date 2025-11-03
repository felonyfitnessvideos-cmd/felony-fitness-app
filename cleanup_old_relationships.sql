-- Clean up old trainer-client relationships and user tags
-- This script will remove old relationships so you can re-onboard properly

-- Step 1: Check what we're about to delete
SELECT 'Current trainer_clients relationships:' as info;
SELECT 
    tc.id,
    tc.trainer_id,
    tc.client_id,
    tc.relationship_status,
    tc.created_at,
    trainer.email as trainer_email,
    client.email as client_email
FROM trainer_clients tc
LEFT JOIN user_profiles trainer ON trainer.id = tc.trainer_id
LEFT JOIN user_profiles client ON client.id = tc.client_id
ORDER BY tc.created_at DESC;

SELECT 'Current user tags:' as info;
SELECT 
    ut.*,
    up.email,
    t.name as tag_name
FROM user_tags ut
LEFT JOIN user_profiles up ON up.id = ut.user_id
LEFT JOIN tags t ON t.id = ut.tag_id
ORDER BY ut.created_at DESC;

-- Step 2: Delete old relationships (uncomment to execute)
-- DELETE FROM trainer_clients 
-- WHERE trainer_id IN (
--     SELECT id FROM user_profiles WHERE email = 'your-email@example.com'
-- ) OR client_id IN (
--     SELECT id FROM user_profiles WHERE email = 'your-email@example.com'
-- );

-- Step 3: Clean up user tags (uncomment to execute)
-- DELETE FROM user_tags 
-- WHERE user_id IN (
--     SELECT id FROM user_profiles WHERE email = 'your-email@example.com'
-- ) AND tag_id IN (
--     SELECT id FROM tags WHERE name IN ('Client', 'Trainer')
-- );

-- Step 4: Verify cleanup (uncomment to check results)
-- SELECT 'After cleanup - trainer_clients:' as info;
-- SELECT COUNT(*) as remaining_relationships FROM trainer_clients;

-- SELECT 'After cleanup - user_tags:' as info;
-- SELECT 
--     COUNT(*) as remaining_tags,
--     t.name as tag_name
-- FROM user_tags ut
-- LEFT JOIN tags t ON t.id = ut.tag_id
-- GROUP BY t.name;