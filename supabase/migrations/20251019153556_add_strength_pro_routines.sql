-- This migration adds the `recommended_for` column and seeds the
-- pro_routines table with 20 new strength routines.

-- 1. Create an ENUM type for the gender recommendation if it doesn't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_recommendation') THEN
        CREATE TYPE public.gender_recommendation AS ENUM ('Male', 'Female', 'Unisex');
    END IF;
END$$;

-- 2. Add the `recommended_for` column to the `pro_routines` table if it doesn't exist.
ALTER TABLE public.pro_routines
ADD COLUMN IF NOT EXISTS recommended_for public.gender_recommendation DEFAULT 'Unisex';

-- 3. Seed the table with 20 new strength routines.
INSERT INTO public.pro_routines (name, description, category, recommended_for, exercises)
VALUES
    -- Routines Recommended for Men (10)
    (
        'Heavy 5x5 Foundation',
        'A classic strength-building program focused on five reps of heavy compound lifts to build a powerful base.',
        'Strength', 'Male',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 5},
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 5},
            {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 5}
        ]'::jsonb
    ),
    (
        'Powerbuilding Upper Body',
        'Combines heavy compound pressing with hypertrophy work to build both size and strength in the upper body.',
        'Strength', 'Male',
        '[
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 4},
            {"exercise_id": "d4016dc3-4301-4247-9754-36aa558f4c93", "target_sets": 4},
            {"exercise_id": "ca62346e-4c15-4568-9692-d1fef3ad99d3", "target_sets": 3},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Classic Bro Split: Chest & Tris',
        'A high-volume workout focused on building the chest and triceps.',
        'Hypertrophy', 'Male',
        '[
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 4},
            {"exercise_id": "ca62346e-4c15-4568-9692-d1fef3ad99d3", "target_sets": 4},
            {"exercise_id": "e9a0aff1-afdf-418b-9679-62d9265b4014", "target_sets": 3},
            {"exercise_id": "0894af64-1b02-40cb-af13-5e4a5d0c350d", "target_sets": 3},
            {"exercise_id": "2193872e-53ff-462c-a73e-a640e969c9c0", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Classic Bro Split: Back & Bis',
        'A high-volume workout focused on building a wide, thick back and big biceps.',
        'Hypertrophy', 'Male',
        '[
            {"exercise_id": "a1e8c8a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 5},
            {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 4},
            {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 4},
            {"exercise_id": "23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9", "target_sets": 3},
            {"exercise_id": "1d8b2c4f-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Powerbuilding Lower Body',
        'A leg day focused on heavy squats and deadlifts, followed by accessory work for hypertrophy.',
        'Strength', 'Male',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 5},
            {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 3},
            {"exercise_id": "803a6234-f869-4e3b-9e8c-843f0e0f8b1a", "target_sets": 4},
            {"exercise_id": "b3e0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Shoulder Boulder Builder',
        'A workout dedicated to building broad, 3D shoulders by targeting all three heads of the deltoid.',
        'Hypertrophy', 'Male',
        '[
            {"exercise_id": "d4016dc3-4301-4247-9754-36aa558f4c93", "target_sets": 4},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 5},
            {"exercise_id": "0a005975-3d4d-4e3c-8ec4-6b8588abe8a1", "target_sets": 3},
            {"exercise_id": "c0a3e8d2-5e48-4a68-80b6-7b44383c0757", "target_sets": 3},
            {"exercise_id": "62c1e878-5e48-4a68-80b6-7b44383c0757", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Upper Body Power',
        'A simple but brutally effective upper body workout based on the principles of 5/3/1.',
        'Strength', 'Male',
        '[
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 5},
            {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 5},
            {"exercise_id": "10c9cc2e-4c23-4bb5-a424-5339dee8830b", "target_sets": 3},
            {"exercise_id": "78c5b9a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'Lower Body Power',
        'A simple but brutally effective lower body workout based on the principles of 5/3/1.',
        'Strength', 'Male',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 5},
            {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 1},
            {"exercise_id": "803a6234-f869-4e3b-9e8c-843f0e0f8b1a", "target_sets": 4},
            {"exercise_id": "1f0c4b8a-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Full Body Strength A',
        'A full-body routine designed to be alternated with "Full Body Strength B" for a balanced, 3-day-a-week program.',
        'Strength', 'Male',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 3},
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 3},
            {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'Full Body Strength B',
        'A full-body routine designed to be alternated with "Full Body Strength A" for a balanced, 3-day-a-week program.',
        'Strength', 'Male',
        '[
            {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 3},
            {"exercise_id": "d4016dc3-4301-4247-9754-36aa558f4c93", "target_sets": 3},
            {"exercise_id": "a1e8c8a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}
        ]'::jsonb
    ),
    -- Routines Recommended for Women (10)
    (
        'Glute Growth & Hamstrings',
        'A lower body day focused on building strong, powerful glutes and hamstrings.',
        'Hypertrophy', 'Female',
        '[
            {"exercise_id": "7c8b9a0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c", "target_sets": 4},
            {"exercise_id": "11812838-a8b2-4b7b-8f9f-6e8b46e3e11f", "target_sets": 3},
            {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3},
            {"exercise_id": "b3e0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Upper Body Sculpt',
        'A workout focused on building strength and definition in the back, shoulders, and arms.',
        'Hypertrophy', 'Female',
        '[
            {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 3},
            {"exercise_id": "a0e3a2b0-f26e-4d86-b219-3663e4f23b8e", "target_sets": 3},
            {"exercise_id": "78c5b9a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Full Body Toning A',
        'A full-body routine focused on compound movements to build lean muscle and improve overall fitness.',
        'Strength', 'Female',
        '[
            {"exercise_id": "6a7b8c9d-1e2f-3a4b-5c6d-7e8f9a0b1c2d", "target_sets": 3},
            {"exercise_id": "10c9cc2e-4c23-4bb5-a424-5339dee8830b", "target_sets": 3},
            {"exercise_id": "78c5b9a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'Full Body Toning B',
        'An alternative full-body routine to be alternated with "Full Body Toning A".',
        'Strength', 'Female',
        '[
            {"exercise_id": "11812838-a8b2-4b7b-8f9f-6e8b46e3e11f", "target_sets": 3},
            {"exercise_id": "d4016dc3-4301-4247-9754-36aa558f4c93", "target_sets": 3},
            {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'Lower Body Strength & Power',
        'Focuses on building raw strength in the lower body with heavy compound lifts.',
        'Strength', 'Female',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 4},
            {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 3},
            {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'At-Home Bodyweight Strength',
        'A challenging bodyweight-only routine that can be done anywhere to build functional strength.',
        'Bodyweight Beast', 'Female',
        '[
            {"exercise_id": "d6f0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b", "target_sets": 4},
            {"exercise_id": "4b2e8b8c-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 4},
            {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3},
            {"exercise_id": "8604d59a-5b6c-4b6e-8f9f-6e8b46e3e11f", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Glute & Leg Accessories',
        'A workout focused on isolation and accessory movements to shape and strengthen the glutes and legs.',
        'Hypertrophy', 'Female',
        '[
            {"exercise_id": "a4d9b2c3-e4f5-4a6b-8c9d-1e2f3a4b5c6d", "target_sets": 3},
            {"exercise_id": "b3e0a1b2-c3d4-4e5f-8a9b-0c1d2e3f4a5b", "target_sets": 4},
            {"exercise_id": "1f0c4b8a-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 3},
            {"exercise_id": "a4d9b2c3-e4f5-4a6b-8c9d-1e2f3a4b5c6d", "target_sets": 4}
        ]'::jsonb
    ),
    (
        'Push Day (Aesthetic Focus)',
        'An upper body push day designed to build shapely shoulders, chest, and triceps.',
        'Hypertrophy', 'Female',
        '[
            {"exercise_id": "10c9cc2e-4c23-4bb5-a424-5339dee8830b", "target_sets": 4},
            {"exercise_id": "a0e3a2b0-f26e-4d86-b219-3663e4f23b8e", "target_sets": 3},
            {"exercise_id": "2412df94-0d37-48c5-bb18-73b29760172d", "target_sets": 4},
            {"exercise_id": "2193872e-53ff-462c-a73e-a640e969c9c0", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'Pull Day (Aesthetic Focus)',
        'An upper body pull day designed to build a strong back and defined biceps.',
        'Hypertrophy', 'Female',
        '[
            {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 4},
            {"exercise_id": "78c5b9a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3},
            {"exercise_id": "c0a3e8d2-5e48-4a68-80b6-7b44383c0757", "target_sets": 3},
            {"exercise_id": "1d8b2c4f-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 3}
        ]'::jsonb
    ),
    (
        'StrongLifts 5x5 Variation A',
        'A classic and highly effective beginner strength program. Alternate this workout with Variation B.',
        'Strength', 'Female',
        '[
            {"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 5},
            {"exercise_id": "028746de-feb0-47c6-8d62-3f34f4e9d02d", "target_sets": 5},
            {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 5}
        ]'::jsonb
    )
;
