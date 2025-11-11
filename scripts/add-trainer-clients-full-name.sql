-- ============================================================================
-- Add full_name column to trainer_clients with auto-sync from user_profiles
-- ============================================================================
-- Purpose: Store denormalized full_name for easier queries without joins
-- Date: November 10, 2025
-- ============================================================================

-- Add full_name column to trainer_clients
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Populate existing rows by combining first_name and last_name from user_profiles
UPDATE trainer_clients tc
SET full_name = CONCAT(up.first_name, ' ', up.last_name)
FROM user_profiles up
WHERE tc.client_id = up.id
  AND (tc.full_name IS NULL OR tc.full_name = '');

-- Create or replace function to sync full_name when trainer_clients is inserted/updated
CREATE OR REPLACE FUNCTION sync_trainer_client_full_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Get full_name from user_profiles for the client_id
  SELECT CONCAT(first_name, ' ', last_name)
  INTO NEW.full_name
  FROM user_profiles
  WHERE id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS sync_trainer_client_full_name_trigger ON trainer_clients;

-- Create trigger to auto-populate full_name on INSERT or UPDATE
CREATE TRIGGER sync_trainer_client_full_name_trigger
BEFORE INSERT OR UPDATE OF client_id ON trainer_clients
FOR EACH ROW
EXECUTE FUNCTION sync_trainer_client_full_name();

-- Create or replace function to update trainer_clients when user_profiles name changes
CREATE OR REPLACE FUNCTION sync_trainer_client_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all trainer_clients records for this user
  UPDATE trainer_clients
  SET full_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
  WHERE client_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS sync_trainer_client_on_profile_update_trigger ON user_profiles;

-- Create trigger to update trainer_clients when user_profiles name changes
CREATE TRIGGER sync_trainer_client_on_profile_update_trigger
AFTER UPDATE OF first_name, last_name ON user_profiles
FOR EACH ROW
WHEN (OLD.first_name IS DISTINCT FROM NEW.first_name OR OLD.last_name IS DISTINCT FROM NEW.last_name)
EXECUTE FUNCTION sync_trainer_client_on_profile_update();

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'trainer_clients'
  AND column_name = 'full_name';

-- Show sample data
SELECT 
    trainer_id,
    client_id,
    full_name,
    status,
    created_at
FROM trainer_clients
LIMIT 10;
