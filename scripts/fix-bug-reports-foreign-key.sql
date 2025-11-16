/**
 * @file fix-bug-reports-foreign-key.sql
 * @description Add proper foreign key from bug_reports to user_profiles
 * @date 2025-11-16
 */

-- Drop the existing foreign key to auth.users and create one to user_profiles instead
-- This allows us to properly join with user_profiles in queries

-- First, check what foreign keys exist
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'bug_reports' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Drop and recreate the foreign key to point to user_profiles
ALTER TABLE bug_reports 
DROP CONSTRAINT IF EXISTS bug_reports_user_id_fkey;

ALTER TABLE bug_reports
ADD CONSTRAINT bug_reports_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Do the same for resolved_by
ALTER TABLE bug_reports 
DROP CONSTRAINT IF EXISTS bug_reports_resolved_by_fkey;

ALTER TABLE bug_reports
ADD CONSTRAINT bug_reports_resolved_by_fkey 
FOREIGN KEY (resolved_by) 
REFERENCES user_profiles(id) 
ON DELETE SET NULL;

-- Verify the changes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'bug_reports' 
  AND tc.constraint_type = 'FOREIGN KEY';
