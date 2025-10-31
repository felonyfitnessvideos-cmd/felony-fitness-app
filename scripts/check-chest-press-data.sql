-- Check workout log entries for Chest Press exercise
-- Exercise ID: 0197ab2e-1312-43c4-b797-9f6550a745ad

SELECT 
    wle.id,
    wle.exercise_id,
    wle.set_number,
    wle.weight_lbs,
    wle.reps,
    wle.created_at::date as log_date,
    wl.user_id,
    wl.is_complete
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.workout_log_id = wl.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad'
ORDER BY wle.created_at DESC;

-- Also check the exercise name to confirm
SELECT id, name FROM exercises WHERE id = '0197ab2e-1312-43c4-b797-9f6550a745ad';