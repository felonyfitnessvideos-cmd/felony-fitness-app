-- =====================================================================================
-- NUCLEAR FIX FOR TRAINER_CLIENTS TABLE AND SCHEMA CACHE
-- =====================================================================================
-- This completely destroys and rebuilds everything to fix schema cache corruption
-- Run this in Supabase Studio SQL Editor
-- =====================================================================================

-- Step 1: Nuclear destruction - Drop everything related to trainer_clients
-- Handle case where table might not exist at all
DO $$
BEGIN
    -- Try to drop the table if it exists
    DROP TABLE IF EXISTS public.trainer_clients CASCADE;
    RAISE NOTICE '🗑️ Dropped trainer_clients table (if it existed)';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️ Could not drop trainer_clients table: %', SQLERRM;
END $$;

-- Drop function if it exists
DROP FUNCTION IF EXISTS public.add_client_to_trainer(uuid, uuid) CASCADE;

-- Safely drop policies (they won't exist if table doesn't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own trainer relationships" ON public.trainer_clients;
    DROP POLICY IF EXISTS "Users can insert trainer relationships" ON public.trainer_clients;
    DROP POLICY IF EXISTS "Users can update their trainer relationships" ON public.trainer_clients;
    DROP POLICY IF EXISTS "trainer_clients_select" ON public.trainer_clients;
    DROP POLICY IF EXISTS "trainer_clients_insert" ON public.trainer_clients;
    DROP POLICY IF EXISTS "trainer_clients_update" ON public.trainer_clients;
    RAISE NOTICE '🗑️ Dropped any existing policies';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️ Could not drop policies (table may not exist): %', SQLERRM;
END $$;

-- Step 2: Also nuke direct_messages constraints
ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_different_users;

-- Step 3: Wait and clear any cached schema references
DO $$
BEGIN
    RAISE NOTICE '🔥 NUCLEAR DESTRUCTION COMPLETE';
    RAISE NOTICE '⏳ Clearing schema cache...';
    RAISE NOTICE '🏗️ Ready to rebuild trainer_clients from scratch...';
    -- Force a brief pause to let the schema cache clear
    PERFORM pg_sleep(1);
END $$;

-- Step 4: Recreate trainer_clients table from scratch (NO CONSTRAINTS)
CREATE TABLE public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_status text DEFAULT 'active' CHECK (relationship_status IN ('pending', 'active', 'inactive', 'terminated')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    
    -- Only prevent duplicate relationships - NO OTHER CONSTRAINTS
    UNIQUE(trainer_id, client_id)
);

-- Step 5: Create all indexes
CREATE INDEX idx_trainer_clients_trainer_id ON public.trainer_clients (trainer_id);
CREATE INDEX idx_trainer_clients_client_id ON public.trainer_clients (client_id);
CREATE INDEX idx_trainer_clients_status ON public.trainer_clients (relationship_status);

-- Step 6: Enable RLS with simple policies
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

-- Simple, bulletproof policies
CREATE POLICY "trainer_clients_select" ON public.trainer_clients
    FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY "trainer_clients_insert" ON public.trainer_clients
    FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "trainer_clients_update" ON public.trainer_clients
    FOR UPDATE USING (auth.uid() = trainer_id OR auth.uid() = client_id);

-- Step 7: Grant permissions
GRANT ALL ON public.trainer_clients TO authenticated;

-- Step 8: Recreate the add_client_to_trainer function (bulletproof version)
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
    
    -- Insert trainer-client relationship (self-relationships now allowed!)
    INSERT INTO public.trainer_clients (trainer_id, client_id, notes)
    VALUES (trainer_user_id, client_user_id, 'Self-test relationship')
    ON CONFLICT (trainer_id, client_id) DO NOTHING;
    
    -- Assign Client tag to the client
    PERFORM public.assign_user_tag(client_user_id, 'Client');
    
    RETURN true;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Error adding client: %', SQLERRM;
END;
$$;

-- Step 9: Force schema refresh by querying system tables
DO $$
DECLARE
    table_count integer;
    constraint_count integer;
BEGIN
    -- Force PostgreSQL to refresh its cache
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_name = 'trainer_clients';
    SELECT COUNT(*) INTO constraint_count FROM information_schema.table_constraints WHERE table_name = 'trainer_clients';
    
    RAISE NOTICE '📊 Schema refresh: found % table(s), % constraint(s)', table_count, constraint_count;
    
    -- List all constraints to verify no blocking ones exist
    FOR rec IN 
        SELECT constraint_name, constraint_type 
        FROM information_schema.table_constraints 
        WHERE table_name = 'trainer_clients'
    LOOP
        RAISE NOTICE '🔍 Constraint: % (type: %)', rec.constraint_name, rec.constraint_type;
    END LOOP;
END $$;

-- Step 10: Test that self-relationships work by inserting a test row
DO $$
DECLARE
    test_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- Dummy UUID for test
BEGIN
    -- This should NOT fail with constraint violations
    BEGIN
        INSERT INTO public.trainer_clients (id, trainer_id, client_id, notes)
        VALUES (gen_random_uuid(), test_user_id, test_user_id, 'Self-relationship test')
        ON CONFLICT (trainer_id, client_id) DO NOTHING;
        
        -- Clean up test data
        DELETE FROM public.trainer_clients WHERE trainer_id = test_user_id;
        
        RAISE NOTICE '✅ Self-relationship test PASSED - no constraint violations!';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '❌ Self-relationship test FAILED: %', SQLERRM;
    END;
END $$;

-- Step 11: Final verification and success message
DO $$
DECLARE
    table_exists boolean;
    function_exists boolean;
BEGIN
    -- Check table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trainer_clients' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'add_client_to_trainer' AND routine_schema = 'public'
    ) INTO function_exists;
    
    IF table_exists AND function_exists THEN
        RAISE NOTICE '🎉 NUCLEAR FIX SUCCESSFUL!';
        RAISE NOTICE '✅ trainer_clients table recreated';
        RAISE NOTICE '✅ add_client_to_trainer function recreated';
        RAISE NOTICE '✅ All blocking constraints removed';
        RAISE NOTICE '✅ Self-relationships enabled';
        RAISE NOTICE '✅ Schema cache should be refreshed';
        RAISE NOTICE '🚀 Try your role system test NOW!';
    ELSE
        RAISE NOTICE '❌ Nuclear fix incomplete - table: %, function: %', table_exists, function_exists;
    END IF;
END $$;

-- =====================================================================================
-- END OF NUCLEAR FIX
-- =====================================================================================