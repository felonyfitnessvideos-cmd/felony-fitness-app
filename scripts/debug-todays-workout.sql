-- Debug script to check today's workout data
-- Run this in Supabase SQL Editor to see what data exists

-- 1. Check workout_logs for today
SELECT 
    id,
    user_id,
    routine_id,
    is_complete,
    created_at,
    started_at,
    ended_at,
    duration_minutes
FROM workout_logs
WHERE user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d'  -- Your user ID from console logs
AND created_at >= CURRENT_DATE
AND created_at < CURRENT_DATE + INTERVAL '1 day'
ORDER BY created_at DESC;

-- 2. Check workout_log_entries for today's logs
SELECT 
    wle.id,
    wle.log_id,
    wle.exercise_id,
    wle.set_number,
    wle.weight_lbs,
    wle.reps_completed,
    wle.rpe_rating,
    wl.is_complete,
    wl.created_at as log_created_at
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wl.user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d'
AND wl.created_at >= CURRENT_DATE
AND wl.created_at < CURRENT_DATE + INTERVAL '1 day'
ORDER BY wl.created_at, wle.exercise_id, wle.set_number;

-- 3. Count entries per log
SELECT 
    wl.id as log_id,
    wl.is_complete,
    wl.created_at,
    COUNT(wle.id) as entry_count
FROM workout_logs wl
LEFT JOIN workout_log_entries wle ON wl.id = wle.log_id
WHERE wl.user_id = '98d4870d-e3e4-4303-86ec-42232c2c166d'
AND wl.created_at >= CURRENT_DATE
AND wl.created_at < CURRENT_DATE + INTERVAL '1 day'
GROUP BY wl.id, wl.is_complete, wl.created_at
ORDER BY wl.created_at DESC;
