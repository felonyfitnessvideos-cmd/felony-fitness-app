/**
 * @file add-bug-report-ticket-id.sql
 * @description Add ticket_id column to bug_reports and fix foreign key
 * @date 2025-11-16
 */

-- Add ticket_id column with auto-incrementing numeric ID
DO $$
BEGIN
    -- Add ticket_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bug_reports' AND column_name = 'ticket_id'
    ) THEN
        -- Add the column
        ALTER TABLE bug_reports ADD COLUMN ticket_id SERIAL UNIQUE;
        
        -- Backfill existing records
        UPDATE bug_reports SET ticket_id = DEFAULT WHERE ticket_id IS NULL;
        
        -- Make it NOT NULL
        ALTER TABLE bug_reports ALTER COLUMN ticket_id SET NOT NULL;
        
        RAISE NOTICE 'Added ticket_id column to bug_reports';
    ELSE
        RAISE NOTICE 'ticket_id column already exists';
    END IF;
END $$;

-- Add index for ticket_id lookups
CREATE INDEX IF NOT EXISTS idx_bug_reports_ticket_id ON bug_reports(ticket_id);

COMMENT ON COLUMN bug_reports.ticket_id IS 'Numeric ticket ID for easy reference (e.g., #123)';

-- Verify the change
SELECT 
    id,
    ticket_id,
    status,
    priority,
    created_at
FROM bug_reports
ORDER BY created_at DESC
LIMIT 5;
