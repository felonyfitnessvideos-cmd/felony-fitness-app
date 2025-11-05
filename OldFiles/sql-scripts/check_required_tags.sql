-- Check if the required tags exist in the database
SELECT 'Current tags in database:' as info;
SELECT id, name, description, tag_type, color FROM tags ORDER BY name;

-- Check if Trainer and Client tags exist specifically
SELECT 'Trainer and Client tags:' as info;
SELECT * FROM tags WHERE name IN ('Trainer', 'Client');

-- If tags don't exist, create them (UNCOMMENT TO EXECUTE)
-- INSERT INTO tags (name, description, tag_type, color, is_system) VALUES
-- ('Trainer', 'Fitness trainer with client management capabilities', 'role', '#ff6b35', true),
-- ('Client', 'Client receiving training services', 'role', '#3b82f6', true)
-- ON CONFLICT (name) DO NOTHING;