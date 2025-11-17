/**
 * @file scripts/audit-current-content.sql
 * @description Quick audit of current database content before expansion
 * @date 2025-11-17
 */

-- ========================================
-- FOODS AUDIT
-- ========================================

-- Total foods count
SELECT 'TOTAL FOODS' as metric, COUNT(*) as count FROM food_servings;

-- Foods by category
SELECT 
    food_category,
    COUNT(*) as count,
    ROUND(AVG(quality_score), 2) as avg_quality
FROM food_servings
GROUP BY food_category
ORDER BY count DESC;

-- Top 20 most common foods
SELECT 
    food_name,
    food_category,
    quality_score,
    calories,
    protein as protein_g,
    carbs as carbs_g,
    fat as fat_g
FROM food_servings
ORDER BY food_name
LIMIT 20;

-- Quality score distribution
SELECT 
    CASE 
        WHEN quality_score = 0 THEN 'Not Scored'
        WHEN quality_score < 50 THEN 'Poor (1-49)'
        WHEN quality_score < 70 THEN 'Fair (50-69)'
        WHEN quality_score < 85 THEN 'Good (70-84)'
        ELSE 'Excellent (85-100)'
    END as quality_range,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM food_servings), 1) as percentage
FROM food_servings
GROUP BY quality_range
ORDER BY 
    CASE quality_range
        WHEN 'Not Scored' THEN 1
        WHEN 'Poor (1-49)' THEN 2
        WHEN 'Fair (50-69)' THEN 3
        WHEN 'Good (70-84)' THEN 4
        WHEN 'Excellent (85-100)' THEN 5
    END;

-- ========================================
-- EXERCISES AUDIT
-- ========================================

-- Total exercises
SELECT 'TOTAL EXERCISES' as metric, COUNT(*) as count FROM exercises;

-- Exercises by muscle group
SELECT 
    primary_muscle_group,
    COUNT(*) as count
FROM exercises
GROUP BY primary_muscle_group
ORDER BY count DESC;

-- Exercises by equipment
SELECT 
    equipment_needed,
    COUNT(*) as count
FROM exercises
GROUP BY equipment_needed
ORDER BY count DESC;

-- Sample exercises
SELECT 
    name,
    primary_muscle_group,
    equipment_needed,
    difficulty_level
FROM exercises
ORDER BY primary_muscle_group, name
LIMIT 30;

-- ========================================
-- MEALS AUDIT  
-- ========================================

-- Total meals
SELECT 'TOTAL MEALS' as metric, COUNT(*) as count FROM meals;

-- Meals by type
SELECT 
    meal_type,
    COUNT(*) as count
FROM meals
GROUP BY meal_type
ORDER BY count DESC;

-- Sample meals
SELECT 
    meal_name,
    meal_type,
    total_calories,
    total_protein,
    total_carbs,
    total_fat
FROM meals
LIMIT 10;

-- ========================================
-- PROGRAMS AUDIT
-- ========================================

-- Total programs
SELECT 'TOTAL PROGRAMS' as metric, COUNT(*) as count FROM programs;

-- Programs by type
SELECT 
    program_type,
    is_active,
    COUNT(*) as count
FROM programs
GROUP BY program_type, is_active
ORDER BY count DESC;

-- ========================================
-- PRO ROUTINES AUDIT
-- ========================================

-- Total pro routines
SELECT 'TOTAL PRO ROUTINES' as metric, COUNT(*) as count FROM pro_routines;

-- Routines by type
SELECT 
    routine_type,
    COUNT(*) as count
FROM pro_routines
GROUP BY routine_type
ORDER BY count DESC;

-- ========================================
-- SUMMARY DASHBOARD
-- ========================================

SELECT 
    'Foods' as content_type,
    (SELECT COUNT(*) FROM food_servings) as total_count,
    (SELECT COUNT(*) FROM food_servings WHERE quality_score >= 70) as high_quality_count
UNION ALL
SELECT 
    'Exercises',
    (SELECT COUNT(*) FROM exercises),
    (SELECT COUNT(*) FROM exercises WHERE difficulty_level IS NOT NULL)
UNION ALL
SELECT 
    'Meals',
    (SELECT COUNT(*) FROM meals),
    (SELECT COUNT(*) FROM meals WHERE total_calories > 0)
UNION ALL
SELECT 
    'Programs',
    (SELECT COUNT(*) FROM programs),
    (SELECT COUNT(*) FROM programs WHERE is_active = true)
UNION ALL
SELECT 
    'Pro Routines',
    (SELECT COUNT(*) FROM pro_routines),
    (SELECT COUNT(*) FROM pro_routines WHERE is_template = true);
