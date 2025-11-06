-- Add RLS policy for workout_log_entries table
-- This allows users to manage entries for their own workout logs
CREATE POLICY "Users can manage workout log entries for own logs" ON workout_log_entries FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM workout_logs
    WHERE workout_logs.id = workout_log_entries.log_id
      AND workout_logs.user_id = auth.uid()
  )
);