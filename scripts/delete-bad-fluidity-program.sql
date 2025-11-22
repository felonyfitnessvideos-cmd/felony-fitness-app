-- Delete the Fluidity program with placeholder UUIDs
DELETE FROM programs 
WHERE name = 'Fluidity' 
  OR exercise_pool::text LIKE '%REPLACE_WITH_%';

-- Verify it's gone
SELECT 
  id,
  name,
  created_at
FROM programs
WHERE exercise_pool::text LIKE '%REPLACE_WITH_%';

SELECT '✅ Bad program(s) deleted. You can now insert the corrected Fluidity program.' as status;
