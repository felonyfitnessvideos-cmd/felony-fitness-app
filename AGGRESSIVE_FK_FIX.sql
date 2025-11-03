-- =====================================================================================
-- AGGRESSIVE FOREIGN KEY FIX - Run this in Supabase Studio SQL Editor
-- =====================================================================================
-- This script will completely rebuild the user_tags table with the correct foreign key
-- =====================================================================================

-- Step 1: Find and drop ALL foreign key constraints on user_tags
DO $$
DECLARE
    constraint_rec record;
BEGIN
    -- Find all foreign key constraints on user_tags table
    FOR constraint_rec IN 
        SELECT tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'user_tags' 
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.user_tags DROP CONSTRAINT ' || constraint_rec.constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: % on column %', constraint_rec.constraint_name, constraint_rec.column_name;
    END LOOP;
END $$;

-- Step 2: Backup existing user_tags data
CREATE TEMP TABLE user_tags_backup AS SELECT * FROM public.user_tags;

-- Step 3: Drop and recreate user_tags table with correct structure
DROP TABLE IF EXISTS public.user_tags CASCADE;

CREATE TABLE public.user_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    assigned_at timestamptz DEFAULT now() NOT NULL,
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, tag_id)
);

-- Step 4: Create indexes
CREATE INDEX idx_user_tags_user_id ON public.user_tags (user_id);
CREATE INDEX idx_user_tags_tag_id ON public.user_tags (tag_id);
CREATE INDEX idx_user_tags_assigned_at ON public.user_tags (assigned_at DESC);

-- Step 5: Enable RLS
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view their own tags" ON public.user_tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON public.user_tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 7: Restore data (only for users that exist in auth.users)
INSERT INTO public.user_tags (user_id, tag_id, assigned_at, assigned_by)
SELECT 
    backup.user_id, 
    backup.tag_id, 
    backup.assigned_at, 
    backup.assigned_by
FROM user_tags_backup backup
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = backup.user_id
)
ON CONFLICT (user_id, tag_id) DO NOTHING;

-- Step 8: Grant permissions
GRANT SELECT, INSERT ON public.user_tags TO authenticated;

-- Step 9: Verify the fix
DO $$
DECLARE
    constraint_count integer;
    fk_target text;
BEGIN
    -- Check the foreign key constraint
    SELECT COUNT(*), string_agg(ccu.table_name, ', ')
    INTO constraint_count, fk_target
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'user_tags' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✅ Foreign key constraint exists and points to: %', fk_target;
    ELSE
        RAISE NOTICE '❌ No foreign key constraint found!';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ USER_TAGS TABLE COMPLETELY REBUILT!';
    RAISE NOTICE '✅ Foreign key now correctly references auth.users(id)';
    RAISE NOTICE '✅ Data restored for valid users only';
    RAISE NOTICE '🚀 Try the role system test again!';
END $$;