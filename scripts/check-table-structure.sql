-- Check the actual structure of workout_log_entries table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workout_log_entries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check workout_logs structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workout_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;