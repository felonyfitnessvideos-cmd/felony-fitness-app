-- Quick fix for the most critical issues
-- Remove direct_messages constraint to allow self-messaging
ALTER TABLE public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_different_users;

-- Fix user_tags foreign key
ALTER TABLE public.user_tags DROP CONSTRAINT IF EXISTS user_tags_user_id_fkey;
ALTER TABLE public.user_tags ADD CONSTRAINT user_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure trainer_clients table exists
CREATE TABLE IF NOT EXISTS public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_status text DEFAULT 'active' CHECK (relationship_status IN ('pending', 'active', 'inactive', 'terminated')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    notes text,
    UNIQUE(trainer_id, client_id)
);

-- Enable RLS
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can view their own trainer relationships" ON public.trainer_clients
    FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = client_id);

CREATE POLICY IF NOT EXISTS "Users can insert new client relationships" ON public.trainer_clients
    FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- Create system tags
INSERT INTO public.tags (name, description, tag_type, color, is_system_tag) VALUES
    ('User', 'Basic user role', 'role', '#3b82f6', true),
    ('Trainer', 'Personal trainer role', 'role', '#10b981', true),
    ('Client', 'Client role', 'role', '#f59e0b', true)
ON CONFLICT (name) DO NOTHING;

-- Update assign_user_tag function
CREATE OR REPLACE FUNCTION public.assign_user_tag(target_user_id uuid, tag_name text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE tag_record record;
BEGIN
    SELECT id INTO tag_record FROM public.tags WHERE name = tag_name;
    IF NOT FOUND THEN RAISE EXCEPTION 'Tag "%" does not exist', tag_name; END IF;
    INSERT INTO public.user_tags (user_id, tag_id) VALUES (target_user_id, tag_record.id) ON CONFLICT (user_id, tag_id) DO NOTHING;
    RETURN true;
END;
$$;

-- Update add_client_to_trainer function
CREATE OR REPLACE FUNCTION public.add_client_to_trainer(trainer_user_id uuid, client_user_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_tags ut JOIN public.tags t ON ut.tag_id = t.id WHERE ut.user_id = trainer_user_id AND t.name = 'Trainer') THEN
        PERFORM public.assign_user_tag(trainer_user_id, 'Trainer');
    END IF;
    INSERT INTO public.trainer_clients (trainer_id, client_id) VALUES (trainer_user_id, client_user_id) ON CONFLICT (trainer_id, client_id) DO NOTHING;
    PERFORM public.assign_user_tag(client_user_id, 'Client');
    RETURN true;
END;
$$;