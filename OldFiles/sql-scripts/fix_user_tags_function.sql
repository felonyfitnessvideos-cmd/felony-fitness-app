-- Create the missing get_user_tags function
CREATE OR REPLACE FUNCTION get_user_tags(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    tag_id UUID,
    tag_name VARCHAR(50),
    tag_description TEXT,
    tag_color VARCHAR(7),
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    query_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    query_user_id := COALESCE(target_user_id, current_user_id);
    
    RETURN QUERY
    SELECT 
        t.id as tag_id,
        t.name as tag_name,
        t.description as tag_description,
        t.color as tag_color,
        ut.assigned_at,
        ut.assigned_by
    FROM user_tags ut
    JOIN tags t ON t.id = ut.tag_id
    WHERE ut.user_id = query_user_id
    ORDER BY ut.assigned_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_tags(UUID) TO authenticated;

-- Also create the assign_user_tag function
CREATE OR REPLACE FUNCTION assign_user_tag(
    target_user_id UUID,
    tag_name VARCHAR(50),
    assigned_by_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    tag_record RECORD;
    assigner_id UUID;
BEGIN
    -- Get current user
    assigner_id := COALESCE(assigned_by_user_id, auth.uid());
    
    IF assigner_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Get tag by name
    SELECT id INTO tag_record
    FROM tags 
    WHERE name = tag_name;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tag "%" not found', tag_name;
    END IF;
    
    -- Check if user already has this tag
    IF EXISTS (
        SELECT 1 FROM user_tags 
        WHERE user_id = target_user_id AND tag_id = tag_record.id
    ) THEN
        RETURN TRUE; -- Already has tag
    END IF;
    
    -- Insert the user tag
    INSERT INTO user_tags (user_id, tag_id, assigned_by, assigned_at)
    VALUES (target_user_id, tag_record.id, assigner_id, NOW());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_user_tag(UUID, VARCHAR, UUID) TO authenticated;