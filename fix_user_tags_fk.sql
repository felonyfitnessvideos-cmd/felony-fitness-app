-- =====================================================================================
-- Fix User Tags Foreign Key Constraint
-- =====================================================================================
-- Description: Fix the user_tags table foreign key constraint to properly reference auth.users
-- Created: 2025-11-02
-- Author: Felony Fitness Development Team

BEGIN;

-- Check if the problematic foreign key exists and drop it
DO $$
BEGIN
    -- Drop the foreign key constraint if it exists and points to wrong table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'user_tags' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Get the constraint name
        DECLARE
            constraint_name_var text;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name_var
            FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'user_tags' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'user_id'
            LIMIT 1;
            
            IF constraint_name_var IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.user_tags DROP CONSTRAINT ' || constraint_name_var;
                RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name_var;
            END IF;
        END;
    END IF;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE public.user_tags 
ADD CONSTRAINT user_tags_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

RAISE NOTICE 'Added correct foreign key constraint to user_tags.user_id -> auth.users(id)';

-- Ensure the trainer_clients table exists with correct foreign keys
CREATE TABLE IF NOT EXISTS public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_status text DEFAULT 'active' CHECK (relationship_status IN ('pending', 'active', 'inactive', 'terminated')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    
    -- Prevent duplicate trainer-client relationships
    UNIQUE(trainer_id, client_id),
    
    -- Ensure trainer and client are different users
    CONSTRAINT trainer_client_different_users CHECK (trainer_id != client_id)
);

-- Create essential system tags if they don't exist
INSERT INTO public.tags (name, description, tag_type, color, is_system_tag) VALUES
    ('User', 'Basic user role - assigned to all users', 'role', '#3b82f6', true),
    ('Trainer', 'Personal trainer role - can manage clients and programs', 'role', '#10b981', true),
    ('Client', 'Client role - assigned to users who are training under a trainer', 'role', '#f59e0b', true)
ON CONFLICT (name) DO NOTHING;

COMMIT;

RAISE NOTICE 'Successfully fixed user_tags foreign key constraints and created essential system tags';