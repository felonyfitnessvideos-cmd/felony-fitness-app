/**
 * Add email column to trainer_clients table
 * 
 * Purpose: Make trainer_clients a one-stop shop for trainer dashboard
 * Auto-populates from user_profiles.email and keeps in sync
 * 
 * Run this in Supabase SQL Editor
 */

-- Add email column to trainer_clients
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_trainer_clients_email ON trainer_clients(email);

-- Add comment
COMMENT ON COLUMN trainer_clients.email IS 'Client email address, synced from user_profiles for quick access';

-- Populate existing rows with email from user_profiles
UPDATE trainer_clients tc
SET email = up.email
FROM user_profiles up
WHERE tc.client_id = up.id
  AND tc.email IS NULL;

-- Create trigger function to auto-populate email on INSERT
CREATE OR REPLACE FUNCTION sync_trainer_client_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from user_profiles and set it
  SELECT email INTO NEW.email
  FROM user_profiles
  WHERE id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on INSERT
DROP TRIGGER IF EXISTS trigger_sync_trainer_client_email_on_insert ON trainer_clients;
CREATE TRIGGER trigger_sync_trainer_client_email_on_insert
  BEFORE INSERT ON trainer_clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_trainer_client_email();

-- Create trigger function to keep email in sync when user_profiles.email changes
CREATE OR REPLACE FUNCTION sync_trainer_client_email_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all trainer_clients records when user_profiles.email changes
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE trainer_clients
    SET email = NEW.email
    WHERE client_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_profiles to sync email changes
DROP TRIGGER IF EXISTS trigger_sync_trainer_client_email_on_profile_update ON user_profiles;
CREATE TRIGGER trigger_sync_trainer_client_email_on_profile_update
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_trainer_client_email_on_profile_update();

-- Verify the changes
SELECT 
  tc.id,
  tc.client_id,
  tc.full_name,
  tc.email,
  up.email as user_profile_email
FROM trainer_clients tc
LEFT JOIN user_profiles up ON tc.client_id = up.id
LIMIT 5;
