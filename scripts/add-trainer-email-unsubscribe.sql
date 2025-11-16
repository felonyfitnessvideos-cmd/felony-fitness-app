/**
 * @file add-trainer-email-unsubscribe.sql
 * @description Add email unsubscribe tracking to trainer_clients table
 * @author Felony Fitness Development Team
 * @date 2025-11-16
 * 
 * Purpose: Allow clients to unsubscribe from trainer marketing emails
 * while still receiving transactional notifications
 */

-- =====================================================================================
-- ADD UNSUBSCRIBE COLUMN
-- =====================================================================================

-- Add is_unsubscribed column to trainer_clients
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS is_unsubscribed BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN trainer_clients.is_unsubscribed IS 
'Whether client has unsubscribed from trainer marketing emails. Does not affect transactional emails.';

-- =====================================================================================
-- CREATE UNSUBSCRIBE FUNCTION
-- =====================================================================================

-- Function to unsubscribe a client from trainer emails
CREATE OR REPLACE FUNCTION unsubscribe_from_trainer_emails(
  p_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Update all trainer_clients records with this email
  UPDATE trainer_clients
  SET 
    is_unsubscribed = TRUE,
    updated_at = NOW()
  WHERE email = p_email;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Successfully unsubscribed from trainer emails',
    'updated_count', v_updated_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION unsubscribe_from_trainer_emails(TEXT) TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION unsubscribe_from_trainer_emails(TEXT) IS
'Unsubscribe client from all trainer marketing emails by email address. Updates all trainer_clients records.';

-- =====================================================================================
-- CREATE INDEX FOR PERFORMANCE
-- =====================================================================================

-- Index on email for fast unsubscribe lookups
CREATE INDEX IF NOT EXISTS idx_trainer_clients_email_unsubscribed 
ON trainer_clients(email, is_unsubscribed);

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

-- Show column info
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'trainer_clients'
  AND column_name = 'is_unsubscribed';

-- Count total vs unsubscribed
SELECT 
  COUNT(*) as total_clients,
  COUNT(*) FILTER (WHERE is_unsubscribed = TRUE) as unsubscribed,
  COUNT(*) FILTER (WHERE is_unsubscribed = FALSE) as subscribed
FROM trainer_clients;

-- Note: COMMIT removed - let migration framework manage transactions
