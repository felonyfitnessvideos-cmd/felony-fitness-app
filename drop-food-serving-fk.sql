-- Drop the old foreign key constraint from food_serving_id to food_servings table
-- This is what's causing the "relation food_servings does not exist" error

-- First, find and drop the constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'nutrition_logs'
        AND kcu.column_name = 'food_serving_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LIMIT 1;
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE nutrition_logs DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on food_serving_id';
    END IF;
END $$;

-- Verify: Show remaining foreign keys
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'nutrition_logs'
    AND tc.constraint_type = 'FOREIGN KEY';
