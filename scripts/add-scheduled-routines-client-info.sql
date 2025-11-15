/**
 * Add client info columns to scheduled_routines table
 * 
 * Purpose: Make scheduled_routines self-contained with client data
 * No need to query trainer_clients or user_profiles - everything in one table
 * 
 * Run this in Supabase SQL Editor AFTER add-trainer-clients-email.sql
 */

-- Add client info columns to scheduled_routines
ALTER TABLE scheduled_routines
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Add indexes for lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_routines_client_email ON scheduled_routines(client_email);

-- Add comments
COMMENT ON COLUMN scheduled_routines.client_name IS 'Client full name, synced from trainer_clients for quick display';
COMMENT ON COLUMN scheduled_routines.client_email IS 'Client email, synced from trainer_clients for notifications';

-- Backfill existing rows with data from trainer_clients
UPDATE scheduled_routines sr
SET 
  client_name = tc.full_name,
  client_email = tc.email
FROM trainer_clients tc
WHERE sr.user_id = tc.client_id
  AND (sr.client_name IS NULL OR sr.client_email IS NULL);

-- Create trigger function to auto-populate client info on INSERT
CREATE OR REPLACE FUNCTION sync_scheduled_routine_client_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Get client info from trainer_clients
  SELECT full_name, email
  INTO NEW.client_name, NEW.client_email
  FROM trainer_clients
  WHERE client_id = NEW.user_id
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on INSERT
DROP TRIGGER IF EXISTS trigger_sync_scheduled_routine_client_info_on_insert ON scheduled_routines;
CREATE TRIGGER trigger_sync_scheduled_routine_client_info_on_insert
  BEFORE INSERT ON scheduled_routines
  FOR EACH ROW
  WHEN (NEW.client_name IS NULL OR NEW.client_email IS NULL)
  EXECUTE FUNCTION sync_scheduled_routine_client_info();

-- Create trigger function to keep client info in sync when trainer_clients changes
CREATE OR REPLACE FUNCTION sync_scheduled_routine_client_info_on_trainer_client_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all scheduled_routines when trainer_clients data changes
  IF NEW.full_name IS DISTINCT FROM OLD.full_name OR NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE scheduled_routines
    SET 
      client_name = NEW.full_name,
      client_email = NEW.email
    WHERE user_id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on trainer_clients to sync changes
DROP TRIGGER IF EXISTS trigger_sync_scheduled_routine_client_info_on_trainer_client_update ON trainer_clients;
CREATE TRIGGER trigger_sync_scheduled_routine_client_info_on_trainer_client_update
  AFTER UPDATE ON trainer_clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_scheduled_routine_client_info_on_trainer_client_update();

-- Verify the changes
SELECT 
  sr.id,
  sr.user_id,
  sr.client_name,
  sr.client_email,
  sr.scheduled_date,
  tc.full_name as trainer_clients_name,
  tc.email as trainer_clients_email
FROM scheduled_routines sr
LEFT JOIN trainer_clients tc ON sr.user_id = tc.client_id
LIMIT 5;
