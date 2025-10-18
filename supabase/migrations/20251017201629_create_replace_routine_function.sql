-- Recreate the function to accept and filter by a routine ID.
-- This ensures the "Last Time" data is specific to the routine being performed.
CREATE OR REPLACE FUNCTION public.get_entries_for_last_session(
    p_user_id uuid,
    p_exercise_id uuid,
    p_routine_id uuid -- Add the new routine ID parameter
)
RETURNS SETOF workout_log_entries AS $$
BEGIN
    RETURN QUERY
    SELECT wle.*
    FROM workout_log_entries wle
    JOIN workout_logs wl ON wle.log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND wle.exercise_id = p_exercise_id
      AND wl.routine_id = p_routine_id -- Filter by the specific routine
      AND wl.id = (
          SELECT id
          FROM workout_logs
          WHERE user_id = p_user_id
            AND routine_id = p_routine_id
            AND is_complete = TRUE
          ORDER BY workout_date DESC
          LIMIT 1
      )
    ORDER BY wle.set_number;
END;
$$ LANGUAGE plpgsql;
