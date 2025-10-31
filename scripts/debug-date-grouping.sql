-- Debug the date grouping issue
-- This will show us exactly what dates have chest press entries

SELECT 
    wl.created_at::date as workout_date,
    COUNT(*) as sets_on_this_date,
    STRING_AGG(wle.weight_lifted_lbs::text || 'x' || wle.reps_completed::text, ', ') as all_sets,
    MAX(
        CASE 
            WHEN wle.reps_completed <= 1 THEN wle.weight_lifted_lbs::numeric
            WHEN wle.reps_completed > 12 THEN wle.weight_lifted_lbs::numeric * 1.33
            ELSE wle.weight_lifted_lbs::numeric / (1.0278 - 0.0278 * LEAST(wle.reps_completed, 12))
        END
    ) as calculated_1rm_for_this_date
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad' -- Chest Press
  AND wle.weight_lifted_lbs > 0
  AND wle.reps_completed > 0
GROUP BY wl.created_at::date
ORDER BY wl.created_at::date DESC;

-- Also check if there are any entries being excluded by our filters
SELECT 
    'Total entries' as category,
    COUNT(*) as count
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad'

UNION ALL

SELECT 
    'Entries with valid weight and reps' as category,
    COUNT(*) as count
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wle.exercise_id = '0197ab2e-1312-43c4-b797-9f6550a745ad'
  AND wle.weight_lifted_lbs > 0
  AND wle.reps_completed > 0;