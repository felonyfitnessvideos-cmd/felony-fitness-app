-- Run this SQL in the Supabase Dashboard SQL Editor
-- This creates the profiles view for backward compatibility

-- Create the profiles view mapping to user_profiles
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id,
    COALESCE(
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
            THEN CONCAT(first_name, ' ', last_name)
            ELSE email
        END,
        'Unknown User'
    ) as full_name,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
FROM public.user_profiles;

-- Grant permissions on the view
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Test the view
SELECT * FROM public.profiles LIMIT 5;