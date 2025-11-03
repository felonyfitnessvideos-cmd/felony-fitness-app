-- Apply messaging migration directly
-- =====================================================================================
-- 1. CREATE DIRECT_MESSAGES TABLE
-- =====================================================================================

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

-- =====================================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Index for finding messages between two users (most common query)
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
ON public.direct_messages (
    LEAST(sender_id, recipient_id), 
    GREATEST(sender_id, recipient_id), 
    created_at DESC
);

-- Index for finding unread messages for a user
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread 
ON public.direct_messages (recipient_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Index for user's sent messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender 
ON public.direct_messages (sender_id, created_at DESC);

-- Index for user's received messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient 
ON public.direct_messages (recipient_id, created_at DESC);

-- =====================================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================================================

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 4. CREATE RLS POLICIES
-- =====================================================================================

-- Policy: Users can read messages they sent or received
CREATE POLICY "Users can read messages they sent or received" 
ON public.direct_messages 
FOR SELECT 
USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Policy: Users can send messages as themselves
CREATE POLICY "Users can send messages as themselves" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id
);

-- Policy: Users can update read status of messages sent to them
CREATE POLICY "Users can mark their received messages as read" 
ON public.direct_messages 
FOR UPDATE 
USING (
    auth.uid() = recipient_id
) 
WITH CHECK (
    auth.uid() = recipient_id
);