-- Food Values Audit Script
-- Run this to check nutritional data consistency and identify issues

-- 1. Check for foods with missing or zero calories
SELECT 
    id,
    name,
    calories_per_100g,
    protein_per_100g,
    carbs_per_100g,
    fat_per_100g,
    created_at
FROM foods 
WHERE calories_per_100g IS NULL 
   OR calories_per_100g = 0 
   OR calories_per_100g < 0
ORDER BY name;

-- 2. Check for foods with unrealistic calorie calculations
-- (Calories should roughly equal: (protein*4) + (carbs*4) + (fat*9))
SELECT 
    id,
    name,
    calories_per_100g,
    protein_per_100g,
    carbs_per_100g,
    fat_per_100g,
    -- Calculate expected calories
    ROUND((COALESCE(protein_per_100g, 0) * 4) + 
          (COALESCE(carbs_per_100g, 0) * 4) + 
          (COALESCE(fat_per_100g, 0) * 9), 1) as calculated_calories,
    -- Calculate difference
    ABS(calories_per_100g - 
        ((COALESCE(protein_per_100g, 0) * 4) + 
         (COALESCE(carbs_per_100g, 0) * 4) + 
         (COALESCE(fat_per_100g, 0) * 9))) as calorie_difference
FROM foods 
WHERE calories_per_100g IS NOT NULL
  AND calories_per_100g > 0
  -- Flag foods where calculated calories differ by more than 50 calories
  AND ABS(calories_per_100g - 
          ((COALESCE(protein_per_100g, 0) * 4) + 
           (COALESCE(carbs_per_100g, 0) * 4) + 
           (COALESCE(fat_per_100g, 0) * 9))) > 50
ORDER BY calorie_difference DESC;

-- 3. Check for foods with missing macronutrients
SELECT 
    id,
    name,
    calories_per_100g,
    CASE WHEN protein_per_100g IS NULL THEN 'Missing Protein' END as protein_issue,
    CASE WHEN carbs_per_100g IS NULL THEN 'Missing Carbs' END as carbs_issue,
    CASE WHEN fat_per_100g IS NULL THEN 'Missing Fat' END as fat_issue
FROM foods 
WHERE protein_per_100g IS NULL 
   OR carbs_per_100g IS NULL 
   OR fat_per_100g IS NULL
ORDER BY name;

-- 4. Check for duplicate food entries
SELECT 
    name,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as food_ids
FROM foods 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 5. Check for foods with extreme values (potential data entry errors)
SELECT 
    id,
    name,
    calories_per_100g,
    protein_per_100g,
    carbs_per_100g,
    fat_per_100g,
    CASE 
        WHEN calories_per_100g > 900 THEN 'Very High Calories'
        WHEN protein_per_100g > 100 THEN 'Impossible Protein'
        WHEN carbs_per_100g > 100 THEN 'Very High Carbs'
        WHEN fat_per_100g > 100 THEN 'Impossible Fat'
        WHEN (protein_per_100g + carbs_per_100g + fat_per_100g) > 100 THEN 'Macros exceed 100g'
    END as issue_type
FROM foods 
WHERE calories_per_100g > 900 
   OR protein_per_100g > 100 
   OR carbs_per_100g > 100 
   OR fat_per_100g > 100
   OR (COALESCE(protein_per_100g, 0) + COALESCE(carbs_per_100g, 0) + COALESCE(fat_per_100g, 0)) > 100
ORDER BY calories_per_100g DESC;

-- 6. Summary statistics for all foods
SELECT 
    COUNT(*) as total_foods,
    COUNT(CASE WHEN calories_per_100g IS NULL OR calories_per_100g = 0 THEN 1 END) as missing_calories,
    COUNT(CASE WHEN protein_per_100g IS NULL THEN 1 END) as missing_protein,
    COUNT(CASE WHEN carbs_per_100g IS NULL THEN 1 END) as missing_carbs,
    COUNT(CASE WHEN fat_per_100g IS NULL THEN 1 END) as missing_fat,
    ROUND(AVG(calories_per_100g), 1) as avg_calories,
    MIN(calories_per_100g) as min_calories,
    MAX(calories_per_100g) as max_calories
FROM foods;

-- 7. Check foods used in meal entries but with data issues
SELECT DISTINCT
    f.id,
    f.name,
    f.calories_per_100g,
    COUNT(me.id) as times_used_in_meals,
    CASE 
        WHEN f.calories_per_100g IS NULL OR f.calories_per_100g = 0 THEN 'Missing/Zero Calories'
        WHEN f.protein_per_100g IS NULL THEN 'Missing Protein'
        WHEN f.carbs_per_100g IS NULL THEN 'Missing Carbs'
        WHEN f.fat_per_100g IS NULL THEN 'Missing Fat'
    END as data_issue
FROM foods f
JOIN meal_entries me ON f.id = me.food_id
WHERE f.calories_per_100g IS NULL 
   OR f.calories_per_100g = 0
   OR f.protein_per_100g IS NULL
   OR f.carbs_per_100g IS NULL
   OR f.fat_per_100g IS NULL
GROUP BY f.id, f.name, f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g
ORDER BY times_used_in_meals DESC;