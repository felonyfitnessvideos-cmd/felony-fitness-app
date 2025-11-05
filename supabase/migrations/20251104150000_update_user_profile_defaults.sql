-- Update handle_new_user function to include default plan_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO user_profiles (id, user_id, email, plan_type, created_at, updated_at)
    VALUES (NEW.id, NEW.id, NEW.email, ARRAY['Sponsored'], NOW(), NOW());
    
    -- Assign default User tag
    INSERT INTO user_tags (user_id, tag_id)
    SELECT NEW.id, t.id
    FROM tags t
    WHERE t.name = 'User';
    
    RETURN NEW;
END;
$function$;

-- Update existing user profiles that don't have a plan_type
UPDATE user_profiles 
SET plan_type = ARRAY['Sponsored'] 
WHERE plan_type IS NULL OR cardinality(plan_type) IS NULL OR cardinality(plan_type) = 0;