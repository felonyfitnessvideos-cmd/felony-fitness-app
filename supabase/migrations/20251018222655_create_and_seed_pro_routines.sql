-- 1. Create an ENUM type for the routine categories for data consistency.
CREATE TYPE public.routine_category AS ENUM ('Strength', 'Hypertrophy', 'Endurance', 'Challenges', 'Bodyweight Beast', 'Interval');

-- 2. Create the `pro_routines` table with added constraints for data integrity.
CREATE TABLE public.pro_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    -- FIX APPLIED: `category` is now required.
    category public.routine_category NOT NULL,
    -- The exercises are stored as a JSON array.
    exercises JSONB NOT NULL,
    -- FIX APPLIED: Add a CHECK constraint to ensure `exercises` is always a JSON array.
    CONSTRAINT pro_routines_exercises_is_array
      CHECK (jsonb_typeof(exercises) = 'array')
);

-- 3. FIX APPLIED: Add an index on the `category` column for faster filtering.
CREATE INDEX IF NOT EXISTS pro_routines_category_idx
  ON public.pro_routines (category);

-- 4. Seed the table with initial pro routines.
INSERT INTO public.pro_routines (name, description, category, exercises)
VALUES
    (
        'Beginner 5x5 Strength',
        'A classic strength-building program focused on five compound lifts. Perform this routine 3 times a week on non-consecutive days.',
        'Strength',
        '[
            {"exercise_id": "c622e9e4-6c3e-4d43-91b4-7935a81e3427", "target_sets": 5},
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 5},
            {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 5}
        ]'::jsonb
    ),
    (
        'Push-Pull-Legs (PPL) - Push Day',
        'Focuses on upper body pushing muscles: chest, shoulders, and triceps. Part of a classic 3 or 6-day split.',
        'Hypertrophy',
        '[
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 4},
            {"exercise_id": "6c49c748-a021-4f18-8631-5c8a7c8c227a", "target_sets": 3},
            {"exercise_id": "ca62346e-4c15-4568-9692-d1fef3ad99d3", "target_sets": 3},
            {"exercise_id": "bf7e3f84-3b1d-4c3e-9b2f-2c09192a5b2e", "target_sets": 3},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Full Body Endurance Circuit',
        'A high-intensity circuit to improve cardiovascular health and muscular endurance. Perform each exercise back-to-back with minimal rest.',
        'Endurance',
        '[
            {"exercise_id": "99f4857d-41a4-4424-b0a0-05e839217e47", "target_sets": 3},
            {"exercise_id": "d1e1f745-a8b2-4b7b-8f9f-6e8b46e3e11f", "target_sets": 3},
            {"exercise_id": "9d0b7d34-3c67-4e63-8f2c-5b3f2e1b1a0d", "target_sets": 3},
            {"exercise_id": "8604d59a-5b6c-4b6e-8f9f-6e8b46e3e11f", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'The Murph Challenge',
        'A classic CrossFit hero WOD (Workout of the Day) in memory of Navy Lieutenant Michael Murphy. Partition the pull-ups, push-ups, and squats as needed.',
        'Challenges',
        '[
            {"exercise_id": "e4f22e12-577b-4f82-8c0f-75ad0316bcfe", "target_sets": 1},
            {"exercise_id": "52c8b7f7-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 100},
            {"exercise_id": "4b2e8b8c-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 200},
            {"exercise_id": "c622e9e4-6c3e-4d43-91b4-7935a81e3427", "target_sets": 300},
            {"exercise_id": "e4f22e12-577b-4f82-8c0f-75ad0316bcfe", "target_sets": 1}
        ]'::jsonb
    );

-- 5. Create the function to copy a pro routine to a user's account.
CREATE OR REPLACE FUNCTION public.copy_pro_routine_to_user(p_pro_routine_id UUID)
RETURNS UUID AS $$
DECLARE
    new_routine_id UUID;
    pro_routine_name TEXT;
    pro_exercises JSONB;
BEGIN
    -- Get the details from the selected pro routine
    SELECT name, exercises INTO pro_routine_name, pro_exercises
    FROM public.pro_routines
    WHERE id = p_pro_routine_id;

    -- FIX APPLIED: Add a check to ensure the routine exists before proceeding.
    IF pro_routine_name IS NULL OR pro_exercises IS NULL THEN
        RAISE EXCEPTION 'Pro routine % not found' USING ERRCODE = 'NO_DATA_FOUND';
    END IF;

    -- Create a new routine for the user
    INSERT INTO public.workout_routines (user_id, routine_name, is_active)
    VALUES (auth.uid(), pro_routine_name, false)
    RETURNING id INTO new_routine_id;

    -- Unpack the JSON and insert the exercises into the user's routine
    INSERT INTO public.routine_exercises (routine_id, exercise_id, target_sets, exercise_order)
    SELECT
        new_routine_id,
        (item->>'exercise_id')::uuid,
        (item->>'target_sets')::integer,
        (item_index - 1) -- Keep 0-based index for UI consistency
    FROM jsonb_array_elements(pro_exercises) WITH ORDINALITY arr(item, item_index);

    RETURN new_routine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   -- FIX APPLIED: Set search_path for SECURITY DEFINER functions to prevent hijacking.
   SET search_path = public, pg_temp;

-- 6. FIX APPLIED: Grant execute permissions to the authenticated role so the app can call the function.
GRANT EXECUTE ON FUNCTION public.copy_pro_routine_to_user(uuid) TO authenticated;

