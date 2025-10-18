-- 1. Create an ENUM type for the routine categories for data consistency.
CREATE TYPE public.routine_category AS ENUM ('Strength', 'Hypertrophy', 'Endurance', 'Challenges', 'Interval', 'Bodyweight Beast');

-- 2. Create the `pro_routines` table to store the templates.
CREATE TABLE public.pro_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    category public.routine_category,
    -- The exercises are stored as a JSON array.
    -- Format: [{"exercise_id": "uuid", "target_sets": 3}, ...]
    exercises JSONB NOT NULL
);

-- 3. Seed the table with initial pro routines using real UUIDs.
INSERT INTO public.pro_routines (name, description, category, exercises)
VALUES
    (
        'Beginner 5x5 Strength',
        'A classic strength-building program focused on five compound lifts. Perform this routine 3 times a week on non-consecutive days.',
        'Strength',
        '[
            {"exercise_id": "39904b7b-2313-40ec-8610-c08f417f77a8", "target_sets": 5},
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 5},
            {"exercise_id": "3e5362e2-04e4-4467-b1a1-8288544c2742", "target_sets": 5}
        ]'::jsonb
    ),
    (
        'Push-Pull-Legs (PPL) - Push Day',
        'Focuses on upper body pushing muscles: chest, shoulders, and triceps. Part of a classic 3 or 6-day split.',
        'Hypertrophy',
        '[
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 4},
            {"exercise_id": "2a1e5088-4f51-4f9e-9d29-1a7d6e469794", "target_sets": 3},
            {"exercise_id": "ca62346e-4c15-4568-9692-d1fef3ad99d3", "target_sets": 3},
            {"exercise_id": "9f8f4a3e-6d1b-4f8e-9d4a-9e1e8b2b7a5d", "target_sets": 3},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Full Body Endurance Circuit',
        'A high-intensity circuit to improve cardiovascular health and muscular endurance. Perform each exercise back-to-back with minimal rest.',
        'Endurance',
        '[
            {"exercise_id": "5d0d9f8c-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 3},
            {"exercise_id": "8f8d9f8c-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 3},
            {"exercise_id": "9c8d9f8c-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 3},
            {"exercise_id": "6f8d9f8c-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'The Murph Challenge',
        'A classic CrossFit hero WOD (Workout of the Day) in memory of Navy Lieutenant Michael Murphy. Partition the pull-ups, push-ups, and squats as needed.',
        'Challenges',
        '[
            {"exercise_id": "b5e8c9f8-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 1},
            {"exercise_id": "35d4f3b2-6a8c-4a8e-9b8c-5f8d9f8c8e7c", "target_sets": 100},
            {"exercise_id": "5a8c9f8d-6a8c-4a8e-9b8c-5f8d9f8c8e7c", "target_sets": 200},
            {"exercise_id": "39904b7b-2313-40ec-8610-c08f417f77a8", "target_sets": 300},
            {"exercise_id": "b5e8c9f8-8e7c-4a3b-9e8c-5f8d9f8c8e7c", "target_sets": 1}
        ]'::jsonb
    );

-- 4. Create the function to copy a pro routine to a user's account.
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
        (item_index - 1)
    FROM jsonb_array_elements(pro_exercises) WITH ORDINALITY arr(item, item_index);

    RETURN new_routine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

