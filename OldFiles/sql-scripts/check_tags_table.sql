-- Check what's in the tags table
SELECT 'All tags in system:' as info;
SELECT id, name, description, color, created_at
FROM tags 
ORDER BY created_at;

-- Check if the specific tag IDs from user_tags exist in tags table
SELECT 'Checking specific tag IDs:' as info;
SELECT 
    t.id,
    t.name,
    t.description,
    CASE 
        WHEN t.id = '4df419bc-7269-4162-bbcb-a9a4b8b1e881' THEN 'Client tag exists'
        WHEN t.id = 'a0683b88-81e7-4856-9378-674b8fa4514e' THEN 'User tag exists'
        WHEN t.id = 'aba61b1a-16d7-449d-8975-a0af0bfeb6dd' THEN 'Trainer tag exists'
        ELSE 'Other tag'
    END as tag_status
FROM tags t
WHERE t.id IN (
    '4df419bc-7269-4162-bbcb-a9a4b8b1e881',
    'a0683b88-81e7-4856-9378-674b8fa4514e', 
    'aba61b1a-16d7-449d-8975-a0af0bfeb6dd'
);

-- Check if there are any orphaned user_tags (tags that don't exist in tags table)
SELECT 'Orphaned user_tags:' as info;
SELECT 
    ut.user_id,
    ut.tag_id,
    'Tag does not exist in tags table' as issue
FROM user_tags ut
LEFT JOIN tags t ON t.id = ut.tag_id
WHERE t.id IS NULL;