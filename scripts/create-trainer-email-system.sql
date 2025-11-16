/**
 * @file create-trainer-email-system.sql
 * @description Create trainer email messaging system with simplified tagging architecture
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @date 2025-11-16
 * 
 * MINIMAL SCHEMA APPROACH:
 * - Only 2 new tables (trainer_group_tags, trainer_email_templates)
 * - 1 column addition to existing trainer_clients table (tags array)
 * - No membership table, no campaign tracking
 * 
 * Run this in Supabase SQL Editor
 */

-- ============================================================================
-- 1. CREATE TRAINER GROUP TAGS TABLE
-- ============================================================================
-- Stores trainer-specific group tags (e.g., "Monday Bootcamp", "Beach Event")
-- Each trainer can create their own set of tags for organizing clients

CREATE TABLE IF NOT EXISTS trainer_group_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each trainer's tag names must be unique
    UNIQUE(trainer_id, name)
);

-- Add index for fast trainer lookup
CREATE INDEX IF NOT EXISTS idx_trainer_group_tags_trainer_id 
ON trainer_group_tags(trainer_id);

-- Add comment
COMMENT ON TABLE trainer_group_tags IS 'Trainer-specific group tags for organizing clients (e.g., "Monday Bootcamp", "Nutrition Challenge")';
COMMENT ON COLUMN trainer_group_tags.name IS 'Human-readable tag name displayed on orange buttons in UI';

-- ============================================================================
-- 2. CREATE TRAINER EMAIL TEMPLATES TABLE
-- ============================================================================
-- Stores reusable email templates with subject and HTML body

CREATE TABLE IF NOT EXISTS trainer_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL, -- HTML content from TinyMCE editor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each trainer's template names must be unique
    UNIQUE(trainer_id, name)
);

-- Add index for fast trainer lookup
CREATE INDEX IF NOT EXISTS idx_trainer_email_templates_trainer_id 
ON trainer_email_templates(trainer_id);

-- Add comment
COMMENT ON TABLE trainer_email_templates IS 'Reusable email templates created by trainers for marketing campaigns';
COMMENT ON COLUMN trainer_email_templates.body IS 'HTML content from TinyMCE editor, supports rich formatting';

-- ============================================================================
-- 3. ADD TAGS COLUMN TO EXISTING TRAINER_CLIENTS TABLE
-- ============================================================================
-- Stores array of tag UUIDs for each client
-- Example: ['uuid-1', 'uuid-2', 'uuid-3']

ALTER TABLE trainer_clients 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add GIN index for fast tag queries (array operations)
CREATE INDEX IF NOT EXISTS idx_trainer_clients_tags 
ON trainer_clients USING GIN(tags);

-- Add comment
COMMENT ON COLUMN trainer_clients.tags IS 'Array of trainer_group_tags UUIDs. Use for querying clients by tag: WHERE tag_id = ANY(tags)';

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE trainer_group_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_email_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- TRAINER GROUP TAGS POLICIES
-- Trainers can only see and modify their own tags

CREATE POLICY "Trainers can view their own group tags" 
ON trainer_group_tags 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create their own group tags" 
ON trainer_group_tags 
FOR INSERT 
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own group tags" 
ON trainer_group_tags 
FOR UPDATE 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own group tags" 
ON trainer_group_tags 
FOR DELETE 
USING (auth.uid() = trainer_id);

-- TRAINER EMAIL TEMPLATES POLICIES
-- Trainers can only see and modify their own templates

CREATE POLICY "Trainers can view their own email templates" 
ON trainer_email_templates 
FOR SELECT 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create their own email templates" 
ON trainer_email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own email templates" 
ON trainer_email_templates 
FOR UPDATE 
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own email templates" 
ON trainer_email_templates 
FOR DELETE 
USING (auth.uid() = trainer_id);

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON trainer_group_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trainer_email_templates TO authenticated;

-- ============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================================================

/**
 * Add a tag to a client's tags array
 * @param p_client_id UUID - The client's ID
 * @param p_tag_id TEXT - The tag UUID to add
 * @returns BOOLEAN - Success status
 */
CREATE OR REPLACE FUNCTION add_tag_to_client(
    p_client_id UUID,
    p_tag_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify tag exists and belongs to the current trainer
    IF NOT EXISTS (
        SELECT 1 FROM trainer_group_tags 
        WHERE id::TEXT = p_tag_id AND trainer_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Tag % does not exist or does not belong to you', p_tag_id;
    END IF;
    
    -- Add tag to client's tags array if not already present
    UPDATE trainer_clients
    SET tags = array_append(tags, p_tag_id),
        updated_at = NOW()
    WHERE client_id = p_client_id
      AND trainer_id = auth.uid()
      AND NOT (p_tag_id = ANY(tags)); -- Only add if not already present

    RETURN FOUND;
END;
$$;/**
 * Remove a tag from a client's tags array
 * @param p_client_id UUID - The client's ID
 * @param p_tag_id TEXT - The tag UUID to remove
 * @returns BOOLEAN - Success status
 */
CREATE OR REPLACE FUNCTION remove_tag_from_client(
    p_client_id UUID,
    p_tag_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify tag exists and belongs to the current trainer
    IF NOT EXISTS (
        SELECT 1 FROM trainer_group_tags 
        WHERE id::TEXT = p_tag_id AND trainer_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Tag % does not exist or does not belong to you', p_tag_id;
    END IF;
    
    -- Remove tag from client's tags array
    UPDATE trainer_clients
    SET tags = array_remove(tags, p_tag_id),
        updated_at = NOW()
    WHERE client_id = p_client_id
      AND trainer_id = auth.uid()
      AND p_tag_id = ANY(tags); -- Only remove if present
    
    RETURN FOUND;
END;
$$;

/**
 * Get all clients with a specific tag
 * @param p_tag_id TEXT - The tag UUID to search for
 * @returns TABLE - Clients with the specified tag
 */
CREATE OR REPLACE FUNCTION get_clients_by_tag(p_tag_id TEXT)
RETURNS TABLE (
    client_id UUID,
    full_name TEXT,
    email TEXT,
    tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.client_id,
        tc.full_name,
        tc.email,
        tc.tags
    FROM trainer_clients tc
    WHERE tc.trainer_id = auth.uid()
      AND p_tag_id = ANY(tc.tags)
      AND tc.status = 'active';
END;
$$;

-- ============================================================================
-- 8. CREATE TRIGGER TO AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================================

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to trainer_group_tags
DROP TRIGGER IF EXISTS update_trainer_group_tags_updated_at ON trainer_group_tags;
CREATE TRIGGER update_trainer_group_tags_updated_at
    BEFORE UPDATE ON trainer_group_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to trainer_email_templates
DROP TRIGGER IF EXISTS update_trainer_email_templates_updated_at ON trainer_email_templates;
CREATE TRIGGER update_trainer_email_templates_updated_at
    BEFORE UPDATE ON trainer_email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
DECLARE
    tags_exists BOOLEAN;
    templates_exists BOOLEAN;
    tags_column_exists BOOLEAN;
BEGIN
    -- Check if trainer_group_tags table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trainer_group_tags' AND table_schema = 'public'
    ) INTO tags_exists;
    
    -- Check if trainer_email_templates table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trainer_email_templates' AND table_schema = 'public'
    ) INTO templates_exists;
    
    -- Check if tags column was added to trainer_clients
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainer_clients' 
          AND column_name = 'tags' 
          AND table_schema = 'public'
    ) INTO tags_column_exists;
    
    -- Report results
    IF tags_exists THEN
        RAISE NOTICE '✅ trainer_group_tags table created successfully';
    ELSE
        RAISE NOTICE '❌ trainer_group_tags table NOT created!';
    END IF;
    
    IF templates_exists THEN
        RAISE NOTICE '✅ trainer_email_templates table created successfully';
    ELSE
        RAISE NOTICE '❌ trainer_email_templates table NOT created!';
    END IF;
    
    IF tags_column_exists THEN
        RAISE NOTICE '✅ tags column added to trainer_clients successfully';
    ELSE
        RAISE NOTICE '❌ tags column NOT added to trainer_clients!';
    END IF;
    
    -- Final status
    IF tags_exists AND templates_exists AND tags_column_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 TRAINER EMAIL SYSTEM SETUP COMPLETE!';
        RAISE NOTICE '📊 Database schema ready for implementation';
        RAISE NOTICE '🚀 Next step: Create Edge Function for sending campaigns';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  SETUP INCOMPLETE - Please review errors above';
    END IF;
END $$;

-- Show trainer_group_tags structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'trainer_group_tags' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show trainer_email_templates structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'trainer_email_templates' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show trainer_clients tags column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'trainer_clients' AND column_name = 'tags' AND table_schema = 'public';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Create a group tag
INSERT INTO trainer_group_tags (trainer_id, name)
VALUES (auth.uid(), 'Monday Bootcamp');

-- Add tag to client
SELECT add_tag_to_client(
    'client-uuid-here',
    'tag-uuid-here'
);

-- Get all clients with a tag
SELECT * FROM get_clients_by_tag('tag-uuid-here');

-- Query clients with specific tag (direct query)
SELECT * FROM trainer_clients
WHERE trainer_id = auth.uid()
  AND 'tag-uuid-here' = ANY(tags);

-- Save an email template
INSERT INTO trainer_email_templates (trainer_id, name, subject, body)
VALUES (
    auth.uid(),
    'Weekly Motivation',
    'Keep Pushing! 💪',
    '<h1>You Got This!</h1><p>Remember why you started...</p>'
);
*/
