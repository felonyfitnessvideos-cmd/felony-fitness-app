-- =====================================================================================
-- EMERGENCY FIX - Run this directly in Supabase Studio SQL Editor
-- =====================================================================================
-- Instructions: 
-- 1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- =====================================================================================

-- 1. FIX TAGS TABLE RLS POLICY (Infinite recursion issue)
-- =====================================================================================

-- Disable RLS temporarily on tags table
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on tags table that might cause recursion
DROP POLICY IF EXISTS "Users can view tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view public tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can view tags" ON public.tags;

-- Create a simple, non-recursive policy for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read tags (no recursion)
CREATE POLICY "Authenticated users can read tags" ON public.tags
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================================================
-- 2. FIX USER_TAGS FOREIGN KEY CONSTRAINT
-- =====================================================================================

-- Drop the problematic foreign key constraint
ALTER TABLE public.user_tags DROP CONSTRAINT IF EXISTS user_tags_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.user_tags 
ADD CONSTRAINT user_tags_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================================================
-- 3. REMOVE DIRECT_MESSAGES SELF-MESSAGING CONSTRAINT
-- =====================================================================================

-- Drop the constraint that prevents self-messaging
ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_different_users;

-- =====================================================================================
-- 4. CREATE TRAINER_CLIENTS TABLE
-- =====================================================================================

-- Drop and recreate trainer_clients table to ensure it exists
DROP TABLE IF EXISTS public.trainer_clients CASCADE;

CREATE TABLE public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_status text DEFAULT 'active' CHECK (relationship_status IN ('pending', 'active', 'inactive', 'terminated')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    UNIQUE(trainer_id, client_id)
);

-- Create indexes for trainer_clients
CREATE INDEX idx_trainer_clients_trainer_id ON public.trainer_clients (trainer_id);
CREATE INDEX idx_trainer_clients_client_id ON public.trainer_clients (client_id);
CREATE INDEX idx_trainer_clients_status ON public.trainer_clients (relationship_status);

-- Enable RLS and create simple policies
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trainer relationships" ON public.trainer_clients
    FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Users can insert trainer relationships" ON public.trainer_clients
    FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Users can update their trainer relationships" ON public.trainer_clients
    FOR UPDATE USING (auth.uid() = trainer_id OR auth.uid() = client_id);

-- =====================================================================================
-- 5. ENSURE SYSTEM TAGS EXIST
-- =====================================================================================

-- Create system tags
INSERT INTO public.tags (name, description, tag_type, color, is_system_tag) VALUES
    ('User', 'Basic user role', 'role', '#3b82f6', true),
    ('Trainer', 'Personal trainer role', 'role', '#10b981', true),
    ('Client', 'Client role', 'role', '#f59e0b', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    tag_type = EXCLUDED.tag_type,
    color = EXCLUDED.color,
    is_system_tag = EXCLUDED.is_system_tag;

-- =====================================================================================
-- 6. CREATE/UPDATE DATABASE FUNCTIONS
-- =====================================================================================

-- Function to assign user tags
CREATE OR REPLACE FUNCTION public.assign_user_tag(
    target_user_id uuid,
    tag_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tag_record record;
BEGIN
    -- Get the tag
    SELECT id INTO tag_record FROM public.tags WHERE name = tag_name;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tag "%" does not exist', tag_name;
    END IF;
    
    -- Insert user tag if it doesn't exist
    INSERT INTO public.user_tags (user_id, tag_id)
    VALUES (target_user_id, tag_record.id)
    ON CONFLICT (user_id, tag_id) DO NOTHING;
    
    RETURN true;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Error assigning tag: %', SQLERRM;
END;
$$;

-- Function to add client to trainer (with auto trainer assignment)
CREATE OR REPLACE FUNCTION public.add_client_to_trainer(
    trainer_user_id uuid,
    client_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-assign Trainer tag if user doesn't have it
    IF NOT EXISTS (
        SELECT 1 FROM public.user_tags ut
        JOIN public.tags t ON ut.tag_id = t.id
        WHERE ut.user_id = trainer_user_id AND t.name = 'Trainer'
    ) THEN
        PERFORM public.assign_user_tag(trainer_user_id, 'Trainer');
    END IF;
    
    -- Insert trainer-client relationship
    INSERT INTO public.trainer_clients (trainer_id, client_id)
    VALUES (trainer_user_id, client_user_id)
    ON CONFLICT (trainer_id, client_id) DO NOTHING;
    
    -- Assign Client tag to the client
    PERFORM public.assign_user_tag(client_user_id, 'Client');
    
    RETURN true;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Error adding client: %', SQLERRM;
END;
$$;

-- Function to check if user has tag
CREATE OR REPLACE FUNCTION public.user_has_tag(
    target_user_id uuid,
    tag_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_tags ut
        JOIN public.tags t ON ut.tag_id = t.id
        WHERE ut.user_id = target_user_id AND t.name = tag_name
    );
END;
$$;

-- =====================================================================================
-- 7. GRANT PERMISSIONS
-- =====================================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.trainer_clients TO authenticated;
GRANT SELECT ON public.tags TO authenticated;
GRANT SELECT, INSERT ON public.user_tags TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_tag(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_client_to_trainer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_tag(uuid, text) TO authenticated;

-- =====================================================================================
-- SUCCESS MESSAGE
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ ALL FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '✅ Tags table RLS policy fixed (no more infinite recursion)';
    RAISE NOTICE '✅ user_tags foreign key constraint fixed';
    RAISE NOTICE '✅ direct_messages self-messaging constraint removed';
    RAISE NOTICE '✅ trainer_clients table created properly';
    RAISE NOTICE '✅ Database functions updated';
    RAISE NOTICE '🚀 Role system should now work correctly!';
END $$;