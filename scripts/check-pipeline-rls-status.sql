-- Check RLS status on nutrition_pipeline_status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'nutrition_pipeline_status';

-- Check if there are any RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'nutrition_pipeline_status';

-- Check current data in table
SELECT COUNT(*) as row_count FROM nutrition_pipeline_status;
SELECT * FROM nutrition_pipeline_status LIMIT 1;
