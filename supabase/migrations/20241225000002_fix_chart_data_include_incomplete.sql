-- Apply updated calculation functions that include incomplete workouts
-- This fixes the issue where charts show no data because they only looked for is_complete = true

-- Function to calculate estimated 1RM over time for an exercise
CREATE OR REPLACE FUNCTION public.calculate_exercise_1rm(
    p_user_id uuid,
    p_exercise_id uuid
)
RETURNS TABLE(log_date date, value numeric) AS $$
BEGIN
    RETURN QUERY
    WITH daily_max_1rm AS (
        SELECT 
            wl.created_at::date as log_date,
            MAX(
                -- Brzycki formula: Weight / (1.0278 - 0.0278 × Reps)
                -- Cap reps at 12 to avoid negative denominators and unrealistic estimates
                CASE 
                    WHEN wle.reps_completed <= 1 THEN wle.weight_lifted_lbs::numeric
                    WHEN wle.reps_completed > 12 THEN wle.weight_lifted_lbs::numeric * 1.33 -- approximate for high reps
                    ELSE wle.weight_lifted_lbs::numeric / (1.0278 - 0.0278 * LEAST(wle.reps_completed, 12))
                END
            ) as max_1rm
        FROM workout_log_entries wle
        JOIN workout_logs wl ON wle.log_id = wl.id
        WHERE wl.user_id = p_user_id
          AND wle.exercise_id = p_exercise_id
          AND (wl.is_complete = true OR wl.is_complete IS NULL)
          AND wle.weight_lifted_lbs > 0
          AND wle.reps_completed > 0
        GROUP BY wl.created_at::date
    )
    SELECT 
        dmr.log_date,
        ROUND(dmr.max_1rm, 1) as value
    FROM daily_max_1rm dmr
    ORDER BY dmr.log_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total weight volume (sets × reps × weight) per workout
CREATE OR REPLACE FUNCTION public.calculate_exercise_weight_volume(
    p_user_id uuid,
    p_exercise_id uuid
)
RETURNS TABLE(log_date date, value numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wl.created_at::date as log_date,
        SUM(wle.reps_completed * wle.weight_lifted_lbs)::numeric as value
    FROM workout_log_entries wle
    JOIN workout_logs wl ON wle.log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wle.exercise_id = p_exercise_id
      AND (wl.is_complete = true OR wl.is_complete IS NULL)
      AND wle.weight_lifted_lbs > 0
      AND wle.reps_completed > 0
    GROUP BY wl.created_at::date
    ORDER BY wl.created_at::date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total set volume (total number of sets) per workout
CREATE OR REPLACE FUNCTION public.calculate_exercise_set_volume(
    p_user_id uuid,
    p_exercise_id uuid
)
RETURNS TABLE(log_date date, value numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wl.created_at::date as log_date,
        COUNT(*)::numeric as value
    FROM workout_log_entries wle
    JOIN workout_logs wl ON wle.log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wle.exercise_id = p_exercise_id
      AND (wl.is_complete = true OR wl.is_complete IS NULL)
      AND wle.weight_lifted_lbs > 0
      AND wle.reps_completed > 0
    GROUP BY wl.created_at::date
    ORDER BY wl.created_at::date ASC;
END;
$$ LANGUAGE plpgsql;