-- Debug script to check role assignment for user 9561bcc5-428c-47e4-b53b-ff978125b767

-- Step 1: Verify your user ID in auth.users
SELECT 'Your user info in auth.users:' as info;
-- Note: This may not work due to RLS, so we'll check user_profiles instead

-- Step 2: Check your user in user_profiles
SELECT 'Your user in user_profiles:' as info;
SELECT id, email, first_name, last_name 
FROM user_profiles 
WHERE id = '9561bcc5-428c-47e4-b53b-ff978125b767';

-- Step 3: Check your user_tags entries
SELECT 'Your user_tags entries:' as info;
SELECT ut.*, t.name as tag_name, t.description, t.color
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
WHERE ut.user_id = '9561bcc5-428c-47e4-b53b-ff978125b767'
ORDER BY ut.assigned_at DESC;

-- Step 4: Verify the tag IDs you mentioned exist
SELECT 'Checking the tag IDs you mentioned:' as info;
SELECT * FROM tags WHERE id IN (
    '4df419bc-7269-4162-bbcb-a9a4b8b1e881',  -- Client
    'a0683b88-81e7-4856-9378-674b8fa4514e',  -- User  
    'aba61b1a-16d7-449d-8975-a0af0bfeb6dd'   -- Trainer
);

-- Step 5: Check if there are any issues with the join
SELECT 'Testing the exact query the fallback uses:' as info;
SELECT 
    ut.tag_id,
    ut.assigned_at,
    ut.assigned_by,
    t.id as tag_table_id,
    t.name,
    t.description,
    t.color
FROM user_tags ut
JOIN tags t ON t.id = ut.tag_id
WHERE ut.user_id = '9561bcc5-428c-47e4-b53b-ff978125b767'
ORDER BY ut.assigned_at DESC;

-- Step 6: Check if there are orphaned user_tags (tags that don't exist)
SELECT 'Checking for orphaned user_tags:' as info;
SELECT ut.*, 'TAG_NOT_FOUND' as issue
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
WHERE ut.user_id = '9561bcc5-428c-47e4-b53b-ff978125b767'
AND t.id IS NULL;