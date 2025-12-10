-- Find ALL functions and triggers that reference food_servings
-- Run this in Supabase SQL Editor to identify what's still using food_servings

-- 1. Find all functions that contain 'food_servings'
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%food_servings%'
    AND n.nspname = 'public'
ORDER BY p.proname;

-- 2. Find all triggers on nutrition_logs
SELECT 
    tgname as trigger_name,
    tgtype,
    proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'nutrition_logs'
    AND tgname NOT LIKE 'pg_%';

-- 3. Find all views that reference food_servings
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition ILIKE '%food_servings%'
    AND schemaname = 'public';
