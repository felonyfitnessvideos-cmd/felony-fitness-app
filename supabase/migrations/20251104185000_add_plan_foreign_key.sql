-- Create foreign key relationship between user_profiles and plans
-- This ensures data integrity and enables proper joins

-- First, change plan_type column to bigint to match plans.id
ALTER TABLE user_profiles 
ALTER COLUMN plan_type TYPE bigint;

-- Add foreign key constraint
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_plan_type_fkey 
FOREIGN KEY (plan_type) REFERENCES plans(id);

-- Add index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_type ON user_profiles(plan_type);