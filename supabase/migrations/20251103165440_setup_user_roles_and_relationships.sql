-- Setup user roles and relationships for testing
-- This migration will assign trainer and client roles, and create test relationships

-- First, let's see what users we have
SELECT 'Current users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Get tag IDs for roles
DO $$
DECLARE
    user_tag_id UUID;
    trainer_tag_id UUID;
    client_tag_id UUID;
    first_user_id UUID;
    second_user_id UUID;
BEGIN
    -- Get tag IDs
    SELECT id INTO user_tag_id FROM tags WHERE name = 'User';
    SELECT id INTO trainer_tag_id FROM tags WHERE name = 'Trainer';
    SELECT id INTO client_tag_id FROM tags WHERE name = 'Client';
    
    -- Get first user (should be your account)
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- Assign Trainer and User tags to first user
    IF first_user_id IS NOT NULL THEN
        INSERT INTO user_tags (user_id, tag_id) VALUES 
            (first_user_id, user_tag_id),
            (first_user_id, trainer_tag_id)
        ON CONFLICT (user_id, tag_id) DO NOTHING;
        
        RAISE NOTICE 'Assigned Trainer and User tags to user: %', first_user_id;
    END IF;
    
    -- If there's a second user, make them a client of the first user
    SELECT id INTO second_user_id FROM auth.users WHERE id != first_user_id ORDER BY created_at ASC LIMIT 1;
    
    IF second_user_id IS NOT NULL AND first_user_id IS NOT NULL THEN
        -- Assign Client and User tags to second user
        INSERT INTO user_tags (user_id, tag_id) VALUES 
            (second_user_id, user_tag_id),
            (second_user_id, client_tag_id)
        ON CONFLICT (user_id, tag_id) DO NOTHING;
        
        -- Create trainer-client relationship
        INSERT INTO trainer_clients (trainer_id, client_id, status, notes) 
        VALUES (first_user_id, second_user_id, 'active', 'Test client relationship for development')
        ON CONFLICT (trainer_id, client_id) DO NOTHING;
        
        RAISE NOTICE 'Created trainer-client relationship: % -> %', first_user_id, second_user_id;
    END IF;
    
    -- Create user profiles for users that don't have them
    INSERT INTO user_profiles (id, user_id, email, first_name, last_name, created_at)
    SELECT 
        au.id,
        au.id,
        au.email,
        'Test',
        'User',
        NOW()
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.user_id
    WHERE up.user_id IS NULL
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created user profiles for users without profiles';
END $$;

-- Show the results
SELECT 'User roles assigned:' as info;
SELECT 
    au.email,
    t.name as role,
    ut.assigned_at
FROM auth.users au
JOIN user_tags ut ON au.id = ut.user_id
JOIN tags t ON ut.tag_id = t.id
ORDER BY au.email, t.name;

SELECT 'Trainer-client relationships:' as info;
SELECT 
    trainer.email as trainer_email,
    client.email as client_email,
    tc.status,
    tc.created_at
FROM trainer_clients tc
JOIN auth.users trainer ON tc.trainer_id = trainer.id
JOIN auth.users client ON tc.client_id = client.id
ORDER BY tc.created_at DESC;
