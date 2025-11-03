-- =====================================================================================
-- User Roles & Tagging System Migration
-- =====================================================================================
-- Description: Creates a comprehensive role-based tagging system for user management
-- Created: 2025-11-02
-- Author: Felony Fitness Development Team
-- 
-- This migration creates:
-- 1. Flexible tagging system (tags, user_tags tables)
-- 2. Trainer-client relationship tracking
-- 3. Automatic role assignment triggers
-- 4. Functions for role management
-- =====================================================================================

-- =====================================================================================
-- 1. CREATE TAGS SYSTEM
-- =====================================================================================

-- Create tags table for defining available role/category tags
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text,
    tag_type text DEFAULT 'role' CHECK (tag_type IN ('role', 'category', 'feature', 'custom')),
    color text DEFAULT '#3b82f6', -- Hex color for UI display
    is_system_tag boolean DEFAULT false, -- System tags cannot be deleted by users
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    assigned_at timestamptz DEFAULT now() NOT NULL,
    assigned_by uuid REFERENCES auth.users(id), -- Who assigned this tag (NULL = auto-assigned)
    
    -- Prevent duplicate user-tag combinations
    UNIQUE(user_id, tag_id)
);

-- Create trainer_clients table for trainer-client relationships
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

-- =====================================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags (name);
CREATE INDEX IF NOT EXISTS idx_tags_type ON public.tags (tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_system ON public.tags (is_system_tag);

-- User tags indexes
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags (user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON public.user_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_assigned_at ON public.user_tags (assigned_at DESC);

-- Trainer clients indexes
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer_id ON public.trainer_clients (trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client_id ON public.trainer_clients (client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_status ON public.trainer_clients (relationship_status);

-- =====================================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================================================

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 4. CREATE RLS POLICIES
-- =====================================================================================

-- Tags policies: Everyone can read tags, only admins can modify
CREATE POLICY "Everyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.tags 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_tags ut 
        JOIN public.tags t ON t.id = ut.tag_id 
        WHERE ut.user_id = auth.uid() 
        AND t.name = 'Admin'
    )
);

-- User Tags policies: Users can see their own tags and manage some assignments
CREATE POLICY "Users can view own tags" 
ON public.user_tags 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can see others' basic tags" 
ON public.user_tags 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.tags t 
        WHERE t.id = tag_id 
        AND t.tag_type IN ('role', 'feature')
    )
);

CREATE POLICY "Users can manage their own removable tags" 
ON public.user_tags 
FOR DELETE 
USING (
    user_id = auth.uid() 
    AND NOT EXISTS (
        SELECT 1 FROM public.tags t 
        WHERE t.id = tag_id 
        AND t.is_system_tag = true
    )
);

-- Trainer-Client relationship policies
CREATE POLICY "Trainers can view their client relationships" 
ON public.trainer_clients 
FOR SELECT 
USING (trainer_id = auth.uid());

CREATE POLICY "Clients can view their trainer relationships" 
ON public.trainer_clients 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Trainers can manage client relationships" 
ON public.trainer_clients 
FOR ALL 
USING (trainer_id = auth.uid());

-- =====================================================================================
-- 5. SEED SYSTEM TAGS
-- =====================================================================================

-- Insert core system tags
INSERT INTO public.tags (name, description, tag_type, color, is_system_tag) 
VALUES 
    ('User', 'Basic user account - assigned to all registered users', 'role', '#3b82f6', true),
    ('Trainer', 'Fitness trainer - can manage clients and programs', 'role', '#10b981', true),
    ('Client', 'Training client - receives programs from trainers', 'role', '#f59e0b', true),
    ('Admin', 'System administrator - full access', 'role', '#dc2626', true),
    ('Premium', 'Premium subscription user', 'feature', '#8b5cf6', true),
    ('Beta', 'Beta tester access', 'feature', '#ec4899', false)
ON CONFLICT (name) DO NOTHING;

-- =====================================================================================
-- 6. CREATE UTILITY FUNCTIONS
-- =====================================================================================

-- Function: Assign a tag to a user (with duplicate prevention)
CREATE OR REPLACE FUNCTION public.assign_user_tag(
    target_user_id uuid,
    tag_name text,
    assigned_by_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
    tag_uuid uuid;
    tag_exists boolean;
BEGIN
    -- Get tag ID by name
    SELECT id INTO tag_uuid FROM public.tags WHERE name = tag_name;
    
    IF tag_uuid IS NULL THEN
        RAISE EXCEPTION 'Tag "%" does not exist', tag_name;
    END IF;
    
    -- Check if user already has this tag
    SELECT EXISTS(
        SELECT 1 FROM public.user_tags 
        WHERE user_id = target_user_id AND tag_id = tag_uuid
    ) INTO tag_exists;
    
    IF tag_exists THEN
        RETURN false; -- Tag already assigned
    END IF;
    
    -- Assign the tag
    INSERT INTO public.user_tags (user_id, tag_id, assigned_by)
    VALUES (target_user_id, tag_uuid, assigned_by_user_id);
    
    RETURN true;
END;
$$;

-- Function: Remove a tag from a user (only if not system-protected)
CREATE OR REPLACE FUNCTION public.remove_user_tag(
    target_user_id uuid,
    tag_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
    tag_uuid uuid;
    is_system boolean;
BEGIN
    -- Get tag info
    SELECT id, is_system_tag INTO tag_uuid, is_system 
    FROM public.tags 
    WHERE name = tag_name;
    
    IF tag_uuid IS NULL THEN
        RAISE EXCEPTION 'Tag "%" does not exist', tag_name;
    END IF;
    
    IF is_system THEN
        RAISE EXCEPTION 'Cannot remove system tag "%"', tag_name;
    END IF;
    
    -- Remove the tag assignment
    DELETE FROM public.user_tags 
    WHERE user_id = target_user_id AND tag_id = tag_uuid;
    
    RETURN FOUND;
END;
$$;

-- Function: Get all tags for a user
CREATE OR REPLACE FUNCTION public.get_user_tags(target_user_id uuid)
RETURNS TABLE (
    tag_id uuid,
    tag_name text,
    tag_type text,
    color text,
    assigned_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as tag_id,
        t.name as tag_name,
        t.tag_type,
        t.color,
        ut.assigned_at
    FROM public.user_tags ut
    JOIN public.tags t ON t.id = ut.tag_id
    WHERE ut.user_id = target_user_id
    ORDER BY t.tag_type, t.name;
END;
$$;

-- Function: Check if user has a specific role/tag
CREATE OR REPLACE FUNCTION public.user_has_tag(
    target_user_id uuid,
    tag_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_tags ut
        JOIN public.tags t ON t.id = ut.tag_id
        WHERE ut.user_id = target_user_id 
        AND t.name = tag_name
    );
END;
$$;

-- Function: Create trainer-client relationship
CREATE OR REPLACE FUNCTION public.add_client_to_trainer(
    trainer_user_id uuid,
    client_user_id uuid,
    relationship_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    relationship_id uuid;
    trainer_has_trainer_tag boolean;
BEGIN
    -- Validate that trainer has trainer tag
    SELECT public.user_has_tag(trainer_user_id, 'Trainer') INTO trainer_has_trainer_tag;
    
    IF NOT trainer_has_trainer_tag THEN
        RAISE EXCEPTION 'User must have "Trainer" tag to add clients';
    END IF;
    
    -- Create relationship (with conflict handling)
    INSERT INTO public.trainer_clients (trainer_id, client_id, notes)
    VALUES (trainer_user_id, client_user_id, relationship_notes)
    ON CONFLICT (trainer_id, client_id) 
    DO UPDATE SET 
        relationship_status = 'active',
        updated_at = now(),
        notes = COALESCE(EXCLUDED.notes, trainer_clients.notes)
    RETURNING id INTO relationship_id;
    
    -- Auto-assign Client tag to the client user
    PERFORM public.assign_user_tag(client_user_id, 'Client', trainer_user_id);
    
    RETURN relationship_id;
END;
$$;

-- =====================================================================================
-- 7. CREATE TRIGGERS FOR AUTO-TAGGING
-- =====================================================================================

-- Function: Auto-assign "User" tag to new users
CREATE OR REPLACE FUNCTION public.auto_assign_user_tag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Assign "User" tag to any new user automatically
    PERFORM public.assign_user_tag(NEW.id, 'User');
    
    RETURN NEW;
END;
$$;

-- Trigger: Auto-assign User tag on signup
CREATE OR REPLACE TRIGGER trigger_auto_assign_user_tag
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_user_tag();

-- =====================================================================================
-- 8. GRANT PERMISSIONS
-- =====================================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_user_tag(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_tag(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tags(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_tag(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_client_to_trainer(uuid, uuid, text) TO authenticated;

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'User Roles & Tagging System Migration completed successfully!';
    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Created: tags, user_tags, trainer_clients tables';
    RAISE NOTICE 'Created: Auto-tagging triggers for new user signups';
    RAISE NOTICE 'Created: Role management functions with RLS policies';
    RAISE NOTICE 'Seeded: Core system tags (User, Trainer, Client, Admin)';
    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Usage Examples:';
    RAISE NOTICE '- New users automatically get "User" tag';
    RAISE NOTICE '- Use assign_user_tag(user_id, ''Trainer'') to make someone a trainer';
    RAISE NOTICE '- Use add_client_to_trainer(trainer_id, client_id) to create relationships';
    RAISE NOTICE '- Clients automatically get "Client" tag when added to trainer';
    RAISE NOTICE '=============================================================';
END $$;