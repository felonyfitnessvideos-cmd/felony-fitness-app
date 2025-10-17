create or replace function replace_routine_exercises(p_routine_id uuid, p_name text, p_items jsonb)
returns void
language plpgsql
as $$
begin
  -- This line is critical for preserving RLS context within the function.
  perform set_config('role', current_setting('role'), true);

  -- Step 1: Update the routine's name.
  update workout_routines set routine_name = p_name where id = p_routine_id;

  -- Step 2: Delete all old exercises associated with the routine.
  delete from routine_exercises where routine_id = p_routine_id;

  -- Step 3: Insert the new list of exercises from the JSON payload.
  insert into routine_exercises (routine_id, exercise_id, target_sets, exercise_order)
  select p_routine_id,
         (e->>'exercise_id')::uuid,
         (e->>'target_sets')::int,
         (e->>'exercise_order')::int
  from jsonb_array_elements(p_items) as e;
end $$;