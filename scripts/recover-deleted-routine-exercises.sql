-- ============================================================================
-- EMERGENCY: Recover routine exercises from workout logs
-- ============================================================================
-- Purpose: Restore routine exercises that were accidentally deleted
-- This happens when edit routine page encounters network error after deletion
-- Date: November 10, 2025
-- ============================================================================

-- Step 1: Find the affected routine and check its current state
-- Replace 'YOUR_ROUTINE_NAME' with the actual routine name
SELECT 
    wr.id as routine_id,
    wr.routine_name,
    wr.created_at,
    COUNT(re.id) as exercise_count
FROM workout_routines wr
LEFT JOIN routine_exercises re ON wr.id = re.routine_id
WHERE wr.routine_name ILIKE '%YOUR_ROUTINE_NAME%'
GROUP BY wr.id, wr.routine_name, wr.created_at;

-- Step 2: Find the most recent workout log for this routine
-- This shows what exercises SHOULD be in the routine
SELECT 
    wl.id as log_id,
    wl.routine_id,
    wl.log_date,
    wle.exercise_id,
    e.name as exercise_name,
    wle.target_sets,
    wle.target_reps,
    wle.is_warmup,
    wle.exercise_order
FROM workout_logs wl
JOIN workout_log_exercises wle ON wl.id = wle.log_id
JOIN exercises e ON wle.exercise_id = e.id
WHERE wl.routine_id = 'YOUR_ROUTINE_ID_HERE'  -- Replace with actual routine ID from Step 1
ORDER BY wl.log_date DESC, wle.exercise_order ASC
LIMIT 20;

-- Step 3: Restore exercises from the most recent workout log
-- IMPORTANT: Review Step 2 output first, then uncomment and run this
/*
INSERT INTO routine_exercises (routine_id, exercise_id, target_sets, target_reps, exercise_order, is_warmup)
SELECT 
    'YOUR_ROUTINE_ID_HERE' as routine_id,
    wle.exercise_id,
    wle.target_sets,
    COALESCE(wle.target_reps, '8-12') as target_reps,
    wle.exercise_order,
    COALESCE(wle.is_warmup, false) as is_warmup
FROM workout_logs wl
JOIN workout_log_exercises wle ON wl.id = wle.log_id
WHERE wl.routine_id = 'YOUR_ROUTINE_ID_HERE'
  AND wl.log_date = (
    SELECT MAX(log_date) 
    FROM workout_logs 
    WHERE routine_id = 'YOUR_ROUTINE_ID_HERE'
  )
ORDER BY wle.exercise_order;
*/

-- Step 4: Verify the restoration
SELECT 
    re.routine_id,
    re.exercise_id,
    e.name as exercise_name,
    re.target_sets,
    re.target_reps,
    re.exercise_order,
    re.is_warmup
FROM routine_exercises re
JOIN exercises e ON re.exercise_id = e.id
WHERE re.routine_id = 'YOUR_ROUTINE_ID_HERE'
ORDER BY re.exercise_order;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Run Step 1 to find your routine ID
-- 2. Run Step 2 with the routine ID to see what exercises should be restored
-- 3. Uncomment Step 3, replace the routine ID, and run to restore
-- 4. Run Step 4 to verify the exercises are back
-- ============================================================================
