-- Debug the chart data issue
-- Let's see what's actually in the workout_log_entries table for chest press

-- First, find all entries for chest press
SELECT 
    wle.id,
    wle.exercise_id,
    wle.weight_lifted_lbs,
    wle.reps_completed,
    wle.set_number,
    wle.created_at,
    wl.user_id,
    wl.is_complete,
    wl.created_at as workout_date,
    e.name as exercise_name
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
JOIN exercises e ON wle.exercise_id = e.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad' -- Chest Press
ORDER BY wl.created_at DESC;

-- Now let's see what the function returns
SELECT * FROM calculate_exercise_1rm(
    'your-user-id-here'::uuid, 
    '0197ab2e-1312-43c4-b797-9f6550a745ad'::uuid
);

-- Check for NULL values that might be filtered out
SELECT 
    wl.created_at::date as log_date,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN wle.weight_lifted_lbs > 0 THEN 1 END) as valid_weight,
    COUNT(CASE WHEN wle.reps_completed > 0 THEN 1 END) as valid_reps,
    COUNT(CASE WHEN wle.weight_lifted_lbs > 0 AND wle.reps_completed > 0 THEN 1 END) as valid_both
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad'
GROUP BY wl.created_at::date
ORDER BY wl.created_at::date DESC;