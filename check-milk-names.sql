-- Check what milk entries actually exist in the database
SELECT name, id 
FROM foods 
WHERE name ILIKE '%milk%' 
  AND name NOT ILIKE '%butter%'
  AND name NOT ILIKE '%shake%'
  AND name NOT ILIKE '%chocolate%'
ORDER BY 
  CASE 
    WHEN name ILIKE 'milk,%' THEN 1
    WHEN name ILIKE 'milk %' THEN 2
    ELSE 3
  END,
  name
LIMIT 50;
