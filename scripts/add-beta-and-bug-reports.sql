/**
 * @file add-beta-and-bug-reports.sql
 * @description Add beta user support and bug reporting system
 * @author Felony Fitness Development Team
 * @date 2025-11-16
 */

-- ============================================================================
-- STEP 1: Add is_beta column to user_profiles
-- ============================================================================

-- Add is_beta column to identify beta testers
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false;

-- Add index for efficient beta user queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_beta 
ON user_profiles(is_beta) 
WHERE is_beta = true;

COMMENT ON COLUMN user_profiles.is_beta IS 'Indicates if user is part of the beta testing group';

-- ============================================================================
-- STEP 2: Create bug_reports table (similar to direct_messages structure)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL CHECK (char_length(message_text) <= 5000),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category TEXT CHECK (category IN ('bug', 'feature_request', 'ui_ux', 'performance', 'other')),
    browser_info JSONB,
    screenshot_url TEXT,
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT bug_reports_message_not_empty CHECK (char_length(trim(message_text)) > 0)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority ON bug_reports(priority);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_priority ON bug_reports(status, priority);

-- Add comments
COMMENT ON TABLE bug_reports IS 'Bug reports and feature requests from beta users';
COMMENT ON COLUMN bug_reports.status IS 'Current status of the bug report';
COMMENT ON COLUMN bug_reports.priority IS 'Priority level for resolution';
COMMENT ON COLUMN bug_reports.category IS 'Type of report: bug, feature request, etc.';
COMMENT ON COLUMN bug_reports.browser_info IS 'Browser and device information for debugging';
COMMENT ON COLUMN bug_reports.screenshot_url IS 'URL to uploaded screenshot (if provided)';

-- ============================================================================
-- STEP 3: Create bug_report_replies table (for admin responses)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bug_report_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_report_id UUID NOT NULL REFERENCES bug_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL CHECK (char_length(message_text) <= 2000),
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT bug_report_replies_message_not_empty CHECK (char_length(trim(message_text)) > 0)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bug_report_replies_bug_report_id ON bug_report_replies(bug_report_id);
CREATE INDEX IF NOT EXISTS idx_bug_report_replies_created_at ON bug_report_replies(created_at DESC);

COMMENT ON TABLE bug_report_replies IS 'Replies and updates to bug reports';
COMMENT ON COLUMN bug_report_replies.is_admin_reply IS 'True if reply is from admin/support';

-- ============================================================================
-- STEP 4: Enable Row Level Security
-- ============================================================================

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_report_replies ENABLE ROW LEVEL SECURITY;

-- Bug Reports Policies
-- Users can view their own bug reports
CREATE POLICY "Users can view own bug reports"
ON bug_reports FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all bug reports
CREATE POLICY "Admins can view all bug reports"
ON bug_reports FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Beta users can insert bug reports
CREATE POLICY "Beta users can insert bug reports"
ON bug_reports FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_beta = true
    )
);

-- Users can update their own bug reports (message_text only, not admin-only fields)
CREATE POLICY "Users can update own bug reports"
ON bug_reports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from modifying admin-only columns
    admin_notes IS NOT DISTINCT FROM (SELECT admin_notes FROM bug_reports WHERE id = bug_reports.id) AND
    resolved_by IS NOT DISTINCT FROM (SELECT resolved_by FROM bug_reports WHERE id = bug_reports.id) AND
    resolved_at IS NOT DISTINCT FROM (SELECT resolved_at FROM bug_reports WHERE id = bug_reports.id) AND
    status IS NOT DISTINCT FROM (SELECT status FROM bug_reports WHERE id = bug_reports.id) AND
    priority IS NOT DISTINCT FROM (SELECT priority FROM bug_reports WHERE id = bug_reports.id)
);

-- Admins can update any bug report
CREATE POLICY "Admins can update any bug report"
ON bug_reports FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Bug Report Replies Policies
-- Users can view replies to their bug reports
CREATE POLICY "Users can view replies to own bug reports"
ON bug_report_replies FOR SELECT
USING (
    bug_report_id IN (
        SELECT id FROM bug_reports WHERE user_id = auth.uid()
    )
);

-- Admins can view all replies
CREATE POLICY "Admins can view all replies"
ON bug_report_replies FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Users can insert replies to their own bug reports
CREATE POLICY "Users can reply to own bug reports"
ON bug_report_replies FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    bug_report_id IN (
        SELECT id FROM bug_reports WHERE user_id = auth.uid()
    )
);

-- Admins can reply to any bug report
CREATE POLICY "Admins can reply to any bug report"
ON bug_report_replies FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- ============================================================================
-- STEP 5: Create function to update bug report timestamp on reply
-- ============================================================================

CREATE OR REPLACE FUNCTION update_bug_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bug_reports
    SET updated_at = now()
    WHERE id = NEW.bug_report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_bug_report_timestamp
AFTER INSERT ON bug_report_replies
FOR EACH ROW
EXECUTE FUNCTION update_bug_report_timestamp();

-- ============================================================================
-- STEP 6: Grant necessary permissions
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON bug_reports TO authenticated;
GRANT SELECT, INSERT ON bug_report_replies TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify is_beta column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'is_beta';

-- Verify bug_reports table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bug_reports' 
ORDER BY ordinal_position;

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('bug_reports', 'bug_report_replies')
ORDER BY tablename, policyname;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trigger_update_bug_report_timestamp ON bug_report_replies;
DROP FUNCTION IF EXISTS update_bug_report_timestamp();
DROP TABLE IF EXISTS bug_report_replies CASCADE;
DROP TABLE IF EXISTS bug_reports CASCADE;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS is_beta;
*/
