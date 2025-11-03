-- Add missing trainer-client management functions
-- These functions handle the trainer-client onboarding process

-- Function to add a client to a trainer
CREATE OR REPLACE FUNCTION public.add_client_to_trainer(
    client_user_id UUID,
    trainer_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    new_relationship_id UUID;
    result JSON;
BEGIN
    -- Check if relationship already exists
    IF EXISTS (
        SELECT 1 FROM trainer_clients 
        WHERE trainer_id = trainer_user_id AND client_id = client_user_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Relationship already exists',
            'code', 'RELATIONSHIP_EXISTS'
        );
    END IF;

    -- Check if both users exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = client_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Client user not found',
            'code', 'CLIENT_NOT_FOUND'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = trainer_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Trainer user not found',
            'code', 'TRAINER_NOT_FOUND'
        );
    END IF;

    -- Create the trainer-client relationship
    INSERT INTO trainer_clients (trainer_id, client_id, status)
    VALUES (trainer_user_id, client_user_id, 'active')
    RETURNING id INTO new_relationship_id;

    -- Assign Client tag to the client if they don't have it
    INSERT INTO user_tags (user_id, tag_id)
    SELECT client_user_id, t.id
    FROM tags t
    WHERE t.name = 'Client'
    AND NOT EXISTS (
        SELECT 1 FROM user_tags ut 
        WHERE ut.user_id = client_user_id AND ut.tag_id = t.id
    );

    -- Assign Trainer tag to the trainer if they don't have it
    INSERT INTO user_tags (user_id, tag_id)
    SELECT trainer_user_id, t.id
    FROM tags t
    WHERE t.name = 'Trainer'
    AND NOT EXISTS (
        SELECT 1 FROM user_tags ut 
        WHERE ut.user_id = trainer_user_id AND ut.tag_id = t.id
    );

    -- Return success response
    RETURN json_build_object(
        'success', true,
        'relationship_id', new_relationship_id,
        'message', 'Client successfully added to trainer'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'code', 'DATABASE_ERROR'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trainer's clients with profile info
CREATE OR REPLACE FUNCTION public.get_trainer_clients(trainer_user_id UUID)
RETURNS TABLE (
    client_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    relationship_status TEXT,
    relationship_created_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.client_id,
        COALESCE(up.email, au.email) as email,
        up.first_name,
        up.last_name,
        tc.status as relationship_status,
        tc.created_at as relationship_created_at,
        (
            SELECT MAX(dm.created_at)
            FROM direct_messages dm
            WHERE (dm.sender_id = tc.client_id AND dm.recipient_id = trainer_user_id)
               OR (dm.sender_id = trainer_user_id AND dm.recipient_id = tc.client_id)
        ) as last_message_at
    FROM trainer_clients tc
    JOIN auth.users au ON tc.client_id = au.id
    LEFT JOIN user_profiles up ON tc.client_id = up.id
    WHERE tc.trainer_id = trainer_user_id
    ORDER BY tc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile if it doesn't exist
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    profile_exists BOOLEAN;
    user_email TEXT;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = user_uuid) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Get user email from auth.users
        SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
        
        -- Create the profile
        INSERT INTO user_profiles (id, user_id, email, created_at, updated_at)
        VALUES (user_uuid, user_uuid, user_email, NOW(), NOW());
        
        -- Assign default User tag
        INSERT INTO user_tags (user_id, tag_id)
        SELECT user_uuid, t.id
        FROM tags t
        WHERE t.name = 'User'
        AND NOT EXISTS (
            SELECT 1 FROM user_tags ut 
            WHERE ut.user_id = user_uuid AND ut.tag_id = t.id
        );
    END IF;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration (create profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, user_id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.id, NEW.email, NOW(), NOW());
    
    -- Assign default User tag
    INSERT INTO user_tags (user_id, tag_id)
    SELECT NEW.id, t.id
    FROM tags t
    WHERE t.name = 'User';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.add_client_to_trainer(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trainer_clients(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID) TO authenticated;
