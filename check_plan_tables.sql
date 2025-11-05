-- First, let's see what tables exist in production
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%plan%'
ORDER BY table_name;