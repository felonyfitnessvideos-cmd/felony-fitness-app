-- Check if food_servings table exists and has data
SELECT 
  'food_servings' as table_name,
  COUNT(*) as row_count
FROM food_servings
UNION ALL
SELECT 
  'foods' as table_name,
  COUNT(*) as row_count
FROM foods
UNION ALL
SELECT 
  'portions' as table_name,
  COUNT(*) as row_count
FROM portions
UNION ALL
SELECT 
  'nutrition_logs' as table_name,
  COUNT(*) as row_count
FROM nutrition_logs
UNION ALL
SELECT 
  'user_meal_foods' as table_name,
  COUNT(*) as row_count
FROM user_meal_foods;
