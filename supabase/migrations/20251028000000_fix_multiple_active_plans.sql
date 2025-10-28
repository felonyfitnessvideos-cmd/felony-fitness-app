-- Fix multiple active plans issue
-- Add unique constraint to prevent multiple active plans per user

-- First, clean up any existing multiple active plans
DO $$
DECLARE
    user_record RECORD;
    plan_record RECORD;
    first_plan_id UUID;
BEGIN
    -- For each user with multiple active plans, keep only the most recent one
    FOR user_record IN 
        SELECT user_id, COUNT(*) as active_count
        FROM weekly_meal_plans 
        WHERE is_active = true 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    LOOP
        -- Get the most recent active plan for this user
        SELECT id INTO first_plan_id
        FROM weekly_meal_plans
        WHERE user_id = user_record.user_id AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Deactivate all other plans for this user
        UPDATE weekly_meal_plans 
        SET is_active = false 
        WHERE user_id = user_record.user_id 
        AND is_active = true 
        AND id != first_plan_id;
        
        RAISE NOTICE 'Fixed multiple active plans for user %: kept plan % and deactivated % others', 
            user_record.user_id, first_plan_id, user_record.active_count - 1;
    END LOOP;
END $$;

-- Add unique constraint to prevent multiple active plans per user
-- This constraint will only allow one row per user_id where is_active = true
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_meal_plans_user_active 
ON weekly_meal_plans (user_id) 
WHERE is_active = true;

-- Verify the trigger function exists and recreate if needed
CREATE OR REPLACE FUNCTION ensure_single_active_meal_plan()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the new/updated row is being set to active
    IF NEW.is_active = true THEN
        -- Deactivate all other meal plans for this user
        UPDATE weekly_meal_plans 
        SET is_active = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id
        AND is_active = true;
        
        -- Log the change for debugging
        RAISE NOTICE 'Ensured single active plan for user %: activated plan %', NEW.user_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS trigger_ensure_single_active_meal_plan ON weekly_meal_plans;
CREATE TRIGGER trigger_ensure_single_active_meal_plan
    BEFORE INSERT OR UPDATE ON weekly_meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_meal_plan();

-- Add a check constraint to ensure is_active is always boolean
ALTER TABLE weekly_meal_plans 
ADD CONSTRAINT check_is_active_boolean 
CHECK (is_active IN (true, false));

-- Create a function to safely set active meal plan (atomic operation)
CREATE OR REPLACE FUNCTION set_active_meal_plan(plan_uuid UUID, user_uuid UUID)
RETURNS weekly_meal_plans AS $$
DECLARE
    result_plan weekly_meal_plans;
BEGIN
    -- Verify the plan belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM weekly_meal_plans 
        WHERE id = plan_uuid AND user_id = user_uuid
    ) THEN
        RAISE EXCEPTION 'Plan not found or access denied';
    END IF;
    
    -- The trigger will handle deactivating other plans
    UPDATE weekly_meal_plans 
    SET is_active = true 
    WHERE id = plan_uuid
    RETURNING * INTO result_plan;
    
    RETURN result_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_active_meal_plan(UUID, UUID) TO authenticated;