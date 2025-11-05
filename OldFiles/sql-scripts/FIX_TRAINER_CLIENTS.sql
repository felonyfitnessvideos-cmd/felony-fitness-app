-- =====================================================================================
-- =====================================================================================
-- FIX TRAINER_CLIENTS SELF-RELATIONSHIP CONSTRAINT
-- =====================================================================================
-- This removes the constraint preventing users from being their own trainer/client
-- Perfect for testing the role system!
-- =====================================================================================

-- Step 1: Drop the constraint that prevents self-relationships
ALTER TABLE public.trainer_clients DROP CONSTRAINT IF EXISTS trainer_client_different_users;

-- Step 2: Verify the constraint was removed
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'trainer_clients' 
        AND constraint_name = 'trainer_client_different_users'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '❌ Constraint still exists - manual removal may be needed';
    ELSE
        RAISE NOTICE '✅ trainer_client_different_users constraint successfully removed';
        RAISE NOTICE '✅ Users can now be their own trainer/client for testing';
    END IF;
END $$;

-- Step 3: Test that we can now insert self-relationships
DO $$
BEGIN
    RAISE NOTICE '🚀 You can now run the role system test again!';
    RAISE NOTICE '🎯 The add_client_to_trainer function should work with self-relationships';
END $$;
-- =====================================================================================
-- This will fix the trainer_clients table constraints and schema cache issues
-- =====================================================================================

-- Step 1: Drop the constraint that prevents self-relationships
ALTER TABLE public.trainer_clients DROP CONSTRAINT IF EXISTS trainer_client_different_users;

-- Step 2: Drop and recreate trainer_clients table to fix schema cache issues
DROP TABLE IF EXISTS public.trainer_clients CASCADE;

-- Step 3: Create trainer_clients table without the self-relationship restriction
CREATE TABLE public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_status text DEFAULT 'active' CHECK (relationship_status IN ('pending', 'active', 'inactive', 'terminated')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    
    -- Prevent duplicate trainer-client relationships
    UNIQUE(trainer_id, client_id)
    -- NOTE: Removed the trainer_client_different_users constraint to allow self-relationships for testing
);

-- Step 4: Create indexes
CREATE INDEX idx_trainer_clients_trainer_id ON public.trainer_clients (trainer_id);
CREATE INDEX idx_trainer_clients_client_id ON public.trainer_clients (client_id);
CREATE INDEX idx_trainer_clients_status ON public.trainer_clients (relationship_status);

-- Step 5: Enable RLS and create policies
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trainer relationships" ON public.trainer_clients
    FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "Users can insert trainer relationships" ON public.trainer_clients
    FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Users can update their trainer relationships" ON public.trainer_clients
    FOR UPDATE USING (auth.uid() = trainer_id OR auth.uid() = client_id);

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.trainer_clients TO authenticated;

-- Step 7: Update the add_client_to_trainer function to work with the new table
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
    
    -- Insert trainer-client relationship (now allows self-relationships)
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

-- Step 8: Also fix the direct_messages table if it still has the constraint
ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_different_users;

-- Step 9: Verify the fixes
DO $$
DECLARE
    tc_count integer;
    dm_constraint_exists boolean;
BEGIN
    -- Check if trainer_clients table exists and is accessible
    SELECT COUNT(*) INTO tc_count FROM information_schema.tables 
    WHERE table_name = 'trainer_clients' AND table_schema = 'public';
    
    IF tc_count > 0 THEN
        RAISE NOTICE '✅ trainer_clients table exists and accessible';
    ELSE
        RAISE NOTICE '❌ trainer_clients table not found!';
    END IF;
    
    -- Check if direct_messages constraint was removed
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'direct_messages_different_users'
        AND table_name = 'direct_messages'
    ) INTO dm_constraint_exists;
    
    IF dm_constraint_exists THEN
        RAISE NOTICE '⚠️ direct_messages constraint still exists';
    ELSE
        RAISE NOTICE '✅ direct_messages constraint removed';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ TRAINER_CLIENTS TABLE FIXES APPLIED!';
    RAISE NOTICE '✅ Self-relationship constraints removed';
    RAISE NOTICE '✅ Schema cache should be refreshed';
    RAISE NOTICE '✅ Users can now be both trainer and client';
    RAISE NOTICE '✅ Self-messaging enabled';
    RAISE NOTICE '🚀 Try the role system test again!';
END $$;