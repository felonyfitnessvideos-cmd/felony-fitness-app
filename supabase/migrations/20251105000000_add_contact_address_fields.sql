-- Add contact and address fields to user_profiles table
-- Date: November 5, 2025
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS zip_code TEXT;
-- Add comments for documentation
COMMENT ON COLUMN user_profiles.phone IS 'User phone number';
COMMENT ON COLUMN user_profiles.address IS 'Street address';
COMMENT ON COLUMN user_profiles.city IS 'City';
COMMENT ON COLUMN user_profiles.state IS 'State/Province';
COMMENT ON COLUMN user_profiles.zip_code IS 'ZIP/Postal code';