-- Check if workout calculation functions exist
SELECT 
    routine_name,
    routine_type,
    routine_language,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'calculate_exercise_1rm',
    'calculate_exercise_weight_volume', 
    'calculate_exercise_set_volume'
)
ORDER BY routine_name;