-- Quick RLS status check for key tables
-- Run with: psql <direct-connection-string> -f check-rls-status.sql

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN (
    'nutrition_logs',
    'user_profiles',
    'trainer_client_relationships',
    'messages',
    'workouts',
    'exercises',
    'programs',
    'meals',
    'meal_foods',
    'user_meals',
    'weekly_meal_plans',
    'bug_reports',
    'foods',
    'portions'
  )
ORDER BY rls_status DESC, tablename;
