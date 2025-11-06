-- Add weight columns in pounds (lbs) to user_profiles table
-- Date: November 5, 2025
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS weight_lbs DECIMAL(6, 2),
    ADD COLUMN IF NOT EXISTS target_weight_lbs DECIMAL(6, 2);
-- Add comments for documentation
COMMENT ON COLUMN user_profiles.weight_lbs IS 'Current weight in pounds';
COMMENT ON COLUMN user_profiles.target_weight_lbs IS 'Target weight in pounds';