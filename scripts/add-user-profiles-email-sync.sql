/**
 * Add trigger to sync email from auth.users to user_profiles
 * 
 * Purpose: Auto-populate user_profiles.email when users sign up
 * Also backfills any existing NULL emails from auth.users
 * 
 * Run this in Supabase SQL Editor
 */

-- First, backfill any existing NULL emails from auth.users
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id
  AND up.email IS NULL
  AND au.email IS NOT NULL;

-- Create trigger function to auto-populate email from auth.users on INSERT
CREATE OR REPLACE FUNCTION sync_user_profile_email_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users and set it
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on INSERT
DROP TRIGGER IF EXISTS trigger_sync_user_profile_email_on_insert ON user_profiles;
CREATE TRIGGER trigger_sync_user_profile_email_on_insert
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  WHEN (NEW.email IS NULL)
  EXECUTE FUNCTION sync_user_profile_email_from_auth();

-- Create trigger function to keep email in sync when auth.users.email changes
CREATE OR REPLACE FUNCTION sync_user_profile_email_on_auth_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when auth.users.email changes
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE user_profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to sync email changes
DROP TRIGGER IF EXISTS trigger_sync_user_profile_email_on_auth_update ON auth.users;
CREATE TRIGGER trigger_sync_user_profile_email_on_auth_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile_email_on_auth_update();

-- Verify the backfill worked
SELECT 
  up.id,
  up.first_name,
  up.last_name,
  up.email as user_profile_email,
  au.email as auth_email,
  CASE 
    WHEN up.email = au.email THEN '✅ Synced'
    WHEN up.email IS NULL THEN '⚠️ NULL in user_profiles'
    ELSE '❌ Mismatch'
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC
LIMIT 10;
