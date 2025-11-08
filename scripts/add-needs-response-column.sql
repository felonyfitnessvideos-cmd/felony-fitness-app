-- Run this SQL in the Supabase SQL Editor
-- Or paste into scripts/add-needs-response-column.sql and run manually
-- Add needs_response column to track if messages need trainer responses
ALTER TABLE direct_messages
ADD COLUMN IF NOT EXISTS needs_response BOOLEAN DEFAULT true;
-- Add index for faster queries on messages needing response
CREATE INDEX IF NOT EXISTS idx_direct_messages_needs_response ON direct_messages(recipient_id, needs_response)
WHERE needs_response = true;
-- Set existing messages to false (they're old, assume handled)
UPDATE direct_messages
SET needs_response = false
WHERE needs_response IS NULL;
-- Verify the column was added
SELECT column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'direct_messages'
    AND column_name = 'needs_response';