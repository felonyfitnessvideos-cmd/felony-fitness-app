-- Add plan_type to user_profiles table
-- This links user profiles to their subscription plan

-- Add plan_type column that references the plans table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS plan_type INTEGER REFERENCES plans(id) DEFAULT 1;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_type ON user_profiles(plan_type);

-- Add foreign key constraint comment
COMMENT ON COLUMN user_profiles.plan_type IS 'References plans.id - users subscription plan';