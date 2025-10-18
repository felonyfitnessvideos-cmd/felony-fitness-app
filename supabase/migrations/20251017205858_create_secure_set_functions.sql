-- Function to securely delete a workout set entry
-- It checks if the entry's parent log belongs to the authenticated user.
create or replace function delete_workout_set(p_entry_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.workout_log_entries
  where id = p_entry_id
  and log_id in (
    select id from public.workout_logs where user_id = auth.uid()
  );
end;
$$;

-- Function to securely update a workout set entry
-- It checks for ownership before applying the update.
create or replace function update_workout_set(p_entry_id uuid, p_weight integer, p_reps integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.workout_log_entries
  set
    weight_lifted_lbs = p_weight,
    reps_completed = p_reps
  where id = p_entry_id
  and log_id in (
    select id from public.workout_logs where user_id = auth.uid()
  );
end;
$$;