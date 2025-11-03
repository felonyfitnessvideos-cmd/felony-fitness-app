-- =====================================================================================
-- COMPREHENSIVE MESSAGING SYSTEM FIX
-- =====================================================================================
-- Run this SQL in the Supabase Dashboard SQL Editor
-- This creates all necessary components for the messaging system to work
-- =====================================================================================

-- 1. Create the profiles view for backward compatibility
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id,
    COALESCE(
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
            THEN CONCAT(first_name, ' ', last_name)
            ELSE email
        END,
        'Unknown User'
    ) as full_name,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
FROM public.user_profiles;

-- Grant permissions on the view
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 2. Ensure direct_messages table exists
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    
    -- Ensure users can't send messages to themselves
    CONSTRAINT direct_messages_different_users CHECK (sender_id != recipient_id),
    
    -- Ensure content is not empty
    CONSTRAINT direct_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

-- 3. Enable RLS on direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for direct_messages
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON public.direct_messages;
CREATE POLICY "Users can read messages they sent or received" 
ON public.direct_messages 
FOR SELECT 
USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
);

DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.direct_messages;
CREATE POLICY "Users can send messages as themselves" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id
);

DROP POLICY IF EXISTS "Users can mark their received messages as read" ON public.direct_messages;
CREATE POLICY "Users can mark their received messages as read" 
ON public.direct_messages 
FOR UPDATE 
USING (
    auth.uid() = recipient_id
) 
WITH CHECK (
    auth.uid() = recipient_id
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
ON public.direct_messages (
    LEAST(sender_id, recipient_id), 
    GREATEST(sender_id, recipient_id), 
    created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_unread 
ON public.direct_messages (recipient_id, is_read, created_at DESC) 
WHERE is_read = false;

-- 6. Create the get_conversations function
CREATE OR REPLACE FUNCTION public.get_conversations()
RETURNS TABLE (
    user_id uuid,
    user_full_name text,
    user_email text,
    last_message_content text,
    last_message_at timestamptz,
    unread_count bigint,
    is_last_message_from_me boolean
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Return empty if no user is authenticated
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    WITH conversation_partners AS (
        -- Get all users who have exchanged messages with current user
        SELECT DISTINCT 
            CASE 
                WHEN dm.sender_id = current_user_id THEN dm.recipient_id
                ELSE dm.sender_id
            END as partner_id
        FROM public.direct_messages dm
        WHERE dm.sender_id = current_user_id OR dm.recipient_id = current_user_id
    ),
    latest_messages AS (
        -- Get the latest message for each conversation
        SELECT DISTINCT ON (
            LEAST(dm.sender_id, dm.recipient_id),
            GREATEST(dm.sender_id, dm.recipient_id)
        )
            dm.sender_id,
            dm.recipient_id,
            dm.content,
            dm.created_at,
            CASE 
                WHEN dm.sender_id = current_user_id THEN dm.recipient_id
                ELSE dm.sender_id
            END as partner_id
        FROM public.direct_messages dm
        WHERE dm.sender_id = current_user_id OR dm.recipient_id = current_user_id
        ORDER BY 
            LEAST(dm.sender_id, dm.recipient_id),
            GREATEST(dm.sender_id, dm.recipient_id),
            dm.created_at DESC
    ),
    unread_counts AS (
        -- Count unread messages from each partner
        SELECT 
            dm.sender_id as partner_id,
            COUNT(*) as unread_count
        FROM public.direct_messages dm
        WHERE dm.recipient_id = current_user_id 
        AND dm.is_read = false
        GROUP BY dm.sender_id
    )
    SELECT 
        cp.partner_id as user_id,
        COALESCE(p.full_name, p.email, 'Unknown User') as user_full_name,
        p.email as user_email,
        lm.content as last_message_content,
        lm.created_at as last_message_at,
        COALESCE(uc.unread_count, 0) as unread_count,
        (lm.sender_id = current_user_id) as is_last_message_from_me
    FROM conversation_partners cp
    LEFT JOIN public.profiles p ON p.id = cp.partner_id
    LEFT JOIN latest_messages lm ON lm.partner_id = cp.partner_id  
    LEFT JOIN unread_counts uc ON uc.partner_id = cp.partner_id
    ORDER BY lm.created_at DESC NULLS LAST;
END;
$$;

-- 7. Create the get_conversation_messages function
CREATE OR REPLACE FUNCTION public.get_conversation_messages(other_user_id uuid)
RETURNS TABLE (
    id uuid,
    sender_id uuid,
    recipient_id uuid,
    content text,
    created_at timestamptz,
    is_read boolean,
    sender_name text,
    is_from_current_user boolean
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Return empty if no user is authenticated
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Validate that other_user_id exists and is different from current user
    IF other_user_id IS NULL OR other_user_id = current_user_id THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        dm.id,
        dm.sender_id,
        dm.recipient_id,
        dm.content,
        dm.created_at,
        dm.is_read,
        COALESCE(p.full_name, p.email, 'Unknown User') as sender_name,
        (dm.sender_id = current_user_id) as is_from_current_user
    FROM public.direct_messages dm
    LEFT JOIN public.profiles p ON p.id = dm.sender_id
    WHERE (
        (dm.sender_id = current_user_id AND dm.recipient_id = other_user_id) OR
        (dm.sender_id = other_user_id AND dm.recipient_id = current_user_id)
    )
    ORDER BY dm.created_at ASC;
END;
$$;

-- 8. Create other necessary functions
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(other_user_id uuid)
RETURNS integer
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    updated_count integer;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL OR other_user_id IS NULL OR other_user_id = current_user_id THEN
        RETURN 0;
    END IF;
    
    UPDATE public.direct_messages 
    SET is_read = true 
    WHERE sender_id = other_user_id 
    AND recipient_id = current_user_id 
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_message_count()
RETURNS integer
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    unread_count integer;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*)::integer 
    INTO unread_count
    FROM public.direct_messages 
    WHERE recipient_id = current_user_id 
    AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- 9. Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.get_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_as_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_message_count() TO authenticated;

-- 10. Test the setup
SELECT 'Messaging system setup complete!' as status;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as messages_count FROM public.direct_messages;