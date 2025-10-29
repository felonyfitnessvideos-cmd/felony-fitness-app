-- Fix the get_entries_for_last_session function to use correct column names
-- The function was looking for 'workout_date' but the actual columns are 'created_at' and 'log_date'

CREATE OR REPLACE FUNCTION public.get_entries_for_last_session(
    p_user_id uuid,
    p_exercise_id uuid,
    p_routine_id uuid
)
RETURNS SETOF workout_log_entries AS $$
BEGIN
    RETURN QUERY
    SELECT wle.*
    FROM workout_log_entries wle
    JOIN workout_logs wl ON wle.log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wle.exercise_id = p_exercise_id
      AND wl.routine_id = p_routine_id
      AND wl.id = (
          SELECT id
          FROM workout_logs
          WHERE user_id = p_user_id
            AND routine_id = p_routine_id
            AND is_complete = TRUE
          -- Use created_at instead of non-existent workout_date
          ORDER BY created_at DESC
          LIMIT 1
      )
    ORDER BY wle.set_number;
END;
$$ LANGUAGE plpgsql;