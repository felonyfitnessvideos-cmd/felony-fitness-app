/**
 * @file add-foundational-bodyweight-exercises.sql
 * @description Add Push-up - THE foundational bodyweight exercise
 * @date 2025-11-22
 * 
 * MISSING EXERCISE:
 * - Push-up (standard) - THE foundational upper body push exercise
 * 
 * Critical for bodyweight training programs and pro routines
 */

-- ===========================================================================
-- INSERT PUSH-UP EXERCISE
-- ===========================================================================

INSERT INTO public.exercises 
(name, description, instructions, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, exercise_type, difficulty_level)
VALUES

-- ===========================================================================
-- PUSH-UP (Standard) - THE foundational chest/tricep exercise
-- ===========================================================================
(
    'Push-up',
    'Fundamental bodyweight chest and tricep exercise. The foundation of all upper body pushing movements.',
    '1. Start in high plank position with hands slightly wider than shoulder-width apart
2. Keep body in straight line from head to heels - engage core and glutes
3. Lower chest toward floor by bending elbows, keeping them at 45-degree angle to body
4. Descend until chest is 1-2 inches from floor or touches ground
5. Press through palms to return to starting position, fully extending arms
6. Maintain neutral neck position, looking slightly ahead of hands
7. Breathe in on descent, exhale forcefully on push-up
8. Keep shoulders packed (pulled slightly back and down) throughout movement
Regression: Elevate hands on bench/box or perform from knees
Progression: Add weight vest, elevate feet, or use single-arm variations',
    'Middle Chest',
    'Triceps',
    'Front Deltoids',
    'Bodyweight',
    'Bodyweight',
    'Beginner'
);

-- ===========================================================================
-- VERIFICATION QUERY
-- ===========================================================================

-- Verify Push-up was added
SELECT 
    name,
    primary_muscle,
    secondary_muscle,
    tertiary_muscle,
    equipment_needed,
    difficulty_level,
    created_at
FROM exercises
WHERE name = 'Push-up';

-- ===========================================================================
-- GET EXERCISE IDs FOR PRO ROUTINE POPULATION
-- ===========================================================================

-- Run this query to get the IDs needed for populate-bodyweight-pro-routine.sql
SELECT 
    id,
    name,
    primary_muscle,
    equipment_needed
FROM exercises
WHERE name IN (
    'Push-up',
    'Pull-up',
    'Pistol Squat',
    'Burpees',
    'Pike Push-Up',
    'Hanging Leg Raise',
    'Walking Lunge',
    'Plank'
)
ORDER BY name;

-- ===========================================================================
-- SUCCESS MESSAGE
-- ===========================================================================

SELECT '✅ Added Push-up - foundational bodyweight exercise' as status;
