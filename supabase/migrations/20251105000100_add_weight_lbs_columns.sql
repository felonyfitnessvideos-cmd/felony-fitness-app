-- Add weight columns in pounds (lbs) to user_profiles table
-- Date: November 5, 2025
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS weight_lbs DECIMAL(6, 2) CHECK (weight_lbs IS NULL OR weight_lbs > 0),
    ADD COLUMN IF NOT EXISTS target_weight_lbs DECIMAL(6, 2) CHECK (target_weight_lbs IS NULL OR target_weight_lbs > 0);
-- Add comments for documentation
COMMENT ON COLUMN user_profiles.weight_lbs IS 'Current weight in pounds (must be positive if set)';
COMMENT ON COLUMN user_profiles.target_weight_lbs IS 'Target weight in pounds (must be positive if set)';