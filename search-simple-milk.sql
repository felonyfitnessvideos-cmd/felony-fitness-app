-- Search for simple milk entries in the foods table
-- Check if basic milk exists

-- 1. Search for exact "milk" (case insensitive)
SELECT id, name, brand_owner, category, calories, protein_g
FROM foods
WHERE name ILIKE 'milk'
LIMIT 10;

-- 2. Search for entries that start with "Milk" only (no comma)
SELECT id, name, brand_owner, category, calories, protein_g
FROM foods
WHERE name ILIKE 'Milk%'
  AND name NOT LIKE '%,%'
ORDER BY LENGTH(name)
LIMIT 20;

-- 3. Search for "whole milk" specifically
SELECT id, name, brand_owner, category, calories, protein_g
FROM foods
WHERE name ILIKE '%whole milk%'
ORDER BY LENGTH(name)
LIMIT 20;

-- 4. Get the simplest milk entries (shortest names)
SELECT id, name, brand_owner, category, calories, protein_g, LENGTH(name) as name_length
FROM foods
WHERE name ILIKE '%milk%'
ORDER BY LENGTH(name), name
LIMIT 30;

-- 5. Search for entries containing exactly the word "milk" with word boundaries
SELECT id, name, brand_owner, category, calories, protein_g
FROM foods
WHERE name ~* '\ymilk\y'
  AND LENGTH(name) < 30
ORDER BY LENGTH(name)
LIMIT 20;
