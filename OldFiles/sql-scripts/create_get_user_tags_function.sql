-- Create the get_user_tags function that the app is expecting
CREATE OR REPLACE FUNCTION public.get_user_tags(target_user_id UUID)
RETURNS TABLE (
    tag_id UUID,
    tag_name TEXT,
    tag_description TEXT,
    tag_color TEXT,
    assigned_at TIMESTAMPTZ,
    assigned_by UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ut.tag_id,
        t.name as tag_name,
        t.description as tag_description,
        t.color as tag_color,
        ut.assigned_at,
        ut.assigned_by
    FROM user_tags ut
    INNER JOIN tags t ON t.id = ut.tag_id
    WHERE ut.user_id = target_user_id
    ORDER BY ut.assigned_at DESC;
END;
$$;