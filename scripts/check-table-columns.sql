-- Query to get all table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'workout_logs',
    'workout_log_entries',
    'workout_routines',
    'routine_exercises',
    'cycle_sessions',
    'mesocycles',
    'user_meals',
    'meal_food_items',
    'trainer_clients',
    'direct_messages',
    'exercises',
    'programs'
  )
ORDER BY table_name, ordinal_position;
