/**
 * @file add-meal-foods-for-10-templates.sql
 * @description Add meal_foods relationships for the 10 premade meal templates
 * @date 2025-11-17
 * 
 * Links each meal to actual food_servings entries with realistic quantities
 * Uses foods from batch-insert-common-foods.sql
 */

-- =====================================================
-- BREAKFAST 1: Protein-Packed Scramble & Toast
-- Scrambled Eggs (3 eggs) + Cheddar Cheese + Whole Wheat Toast (2 slices) + Avocado
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f1a2b3c4-d5e6-4f1a-2b3c-4d5e6f7a8b9c',
  id,
  CASE food_name
    WHEN 'Scrambled Eggs' THEN 1.5  -- 150g (about 3 eggs)
    WHEN 'Cheddar Cheese' THEN 1    -- 28g (1 oz)
    WHEN 'Whole Wheat Bread' THEN 2 -- 2 slices
    WHEN 'Avocado' THEN 0.5         -- 50g (about 1/3 avocado)
  END,
  CASE food_name
    WHEN 'Scrambled Eggs' THEN '3 large eggs scrambled'
    WHEN 'Cheddar Cheese' THEN 'Mixed into eggs'
    WHEN 'Whole Wheat Bread' THEN '2 slices toasted'
    WHEN 'Avocado' THEN 'Sliced on top'
  END
FROM food_servings
WHERE food_name IN ('Scrambled Eggs', 'Cheddar Cheese', 'Whole Wheat Bread', 'Avocado')
  AND brand = 'Generic';

-- =====================================================
-- BREAKFAST 2: Greek Yogurt Power Bowl
-- Greek Yogurt + Instant Oats + Banana + Almond Butter + Blueberries
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f2a3b4c5-d6e7-4f2b-3c4d-5e6f7a8b9c0d',
  id,
  CASE food_name
    WHEN 'Greek Yogurt, Plain Nonfat' THEN 1.5   -- 150g
    WHEN 'Instant Oats, Dry' THEN 1              -- 40g
    WHEN 'Banana, Medium' THEN 0.5               -- Half banana
    WHEN 'Almond Butter' THEN 0.5                -- 16g (half serving)
    WHEN 'Blueberries' THEN 0.5                  -- 50g
  END,
  CASE food_name
    WHEN 'Greek Yogurt, Plain Nonfat' THEN '150g nonfat Greek yogurt base'
    WHEN 'Instant Oats, Dry' THEN '40g cooked and cooled'
    WHEN 'Banana, Medium' THEN 'Half banana sliced'
    WHEN 'Almond Butter' THEN '16g drizzled on top'
    WHEN 'Blueberries' THEN '50g fresh or frozen'
  END
FROM food_servings
WHERE food_name IN ('Greek Yogurt, Plain Nonfat', 'Instant Oats, Dry', 'Banana, Medium', 'Almond Butter', 'Blueberries')
  AND brand = 'Generic';

-- =====================================================
-- BREAKFAST 3: Turkey Sausage & Sweet Potato Hash
-- Ground Turkey + Sweet Potato + Bell Pepper
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f3a4b5c6-d7e8-4f3c-4d5e-6f7a8b9c0d1e',
  id,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN 1       -- 100g
    WHEN 'Sweet Potato, Baked' THEN 1      -- 100g
    WHEN 'Bell Pepper, Red' THEN 0.5       -- 50g
  END,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN '100g cooked and crumbled (breakfast sausage seasoning)'
    WHEN 'Sweet Potato, Baked' THEN '100g diced and roasted'
    WHEN 'Bell Pepper, Red' THEN '50g diced and roasted'
  END
FROM food_servings
WHERE food_name IN ('Lean Ground Turkey', 'Sweet Potato, Baked', 'Bell Pepper, Red')
  AND brand = 'Generic';

-- =====================================================
-- LUNCH 1: Grilled Chicken Power Bowl
-- Chicken Breast + Brown Rice + Broccoli + Olive Oil
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f4a5b6c7-d8e9-4f4d-5e6f-7a8b9c0d1e2f',
  id,
  CASE food_name
    WHEN 'Chicken Breast, Grilled' THEN 1.7  -- 170g
    WHEN 'Brown Rice, Cooked' THEN 1.5       -- 150g
    WHEN 'Broccoli, Steamed' THEN 1          -- 100g
    WHEN 'Olive Oil' THEN 1                  -- 1 tbsp (13.5ml)
  END,
  CASE food_name
    WHEN 'Chicken Breast, Grilled' THEN '170g grilled with garlic and herbs'
    WHEN 'Brown Rice, Cooked' THEN '150g cooked brown rice'
    WHEN 'Broccoli, Steamed' THEN '100g steamed broccoli'
    WHEN 'Olive Oil' THEN '1 tbsp drizzled over bowl'
  END
FROM food_servings
WHERE food_name IN ('Chicken Breast, Grilled', 'Brown Rice, Cooked', 'Broccoli, Steamed', 'Olive Oil')
  AND brand = 'Generic';

-- =====================================================
-- LUNCH 2: Turkey & Avocado Whole Wheat Wrap
-- Lean Ground Turkey + Whole Wheat Tortilla + Avocado + Lettuce + Tomato
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f5a6b7c8-d9e0-4f5e-6f7a-8b9c0d1e2f30',
  id,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN 1              -- 100g
    WHEN 'Whole Wheat Tortilla, 8 inch' THEN 1    -- 1 large tortilla
    WHEN 'Avocado' THEN 0.5                       -- 50g
    WHEN 'Lettuce, Romaine' THEN 0.3              -- 30g
    WHEN 'Tomato, Raw' THEN 0.5                   -- 50g
  END,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN '100g cooked turkey slices'
    WHEN 'Whole Wheat Tortilla, 8 inch' THEN '1 large whole wheat tortilla'
    WHEN 'Avocado' THEN '50g sliced avocado'
    WHEN 'Lettuce, Romaine' THEN '30g shredded romaine'
    WHEN 'Tomato, Raw' THEN '50g sliced tomato'
  END
FROM food_servings
WHERE food_name IN ('Lean Ground Turkey', 'Whole Wheat Tortilla, 8 inch', 'Avocado', 'Lettuce, Romaine', 'Tomato, Raw')
  AND brand = 'Generic';

-- =====================================================
-- LUNCH 3: Salmon & Quinoa Mediterranean Bowl
-- Salmon + Quinoa + Spinach + Cucumber + Olive Oil
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f6a7b8c9-d0e1-4f6a-7b8c-9d0e1f2a3b4c',
  id,
  CASE food_name
    WHEN 'Salmon, Atlantic' THEN 1.5      -- 150g
    WHEN 'Quinoa, Cooked' THEN 1          -- 100g
    WHEN 'Spinach, Raw' THEN 0.5          -- 50g
    WHEN 'Cucumber' THEN 0.5              -- 50g
    WHEN 'Olive Oil' THEN 1               -- 1 tbsp
  END,
  CASE food_name
    WHEN 'Salmon, Atlantic' THEN '150g baked salmon fillet'
    WHEN 'Quinoa, Cooked' THEN '100g cooked quinoa'
    WHEN 'Spinach, Raw' THEN '50g fresh spinach'
    WHEN 'Cucumber' THEN '50g sliced cucumber'
    WHEN 'Olive Oil' THEN '1 tbsp + lemon juice dressing'
  END
FROM food_servings
WHERE food_name IN ('Salmon, Atlantic', 'Quinoa, Cooked', 'Spinach, Raw', 'Cucumber', 'Olive Oil')
  AND brand = 'Generic';

-- =====================================================
-- DINNER 1: Lean Beef Stir-Fry
-- Sirloin Steak + Mixed Vegetables + Brown Rice + Olive Oil
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f7a8b9c0-d1e2-4f7b-8c9d-0e1f2a3b4c5d',
  id,
  CASE food_name
    WHEN 'Sirloin Steak' THEN 1.5              -- 150g
    WHEN 'Mixed Vegetables, Frozen' THEN 1.5   -- 150g
    WHEN 'Brown Rice, Cooked' THEN 1.5         -- 150g
    WHEN 'Olive Oil' THEN 0.3                  -- 1 tsp (4.5ml)
  END,
  CASE food_name
    WHEN 'Sirloin Steak' THEN '150g sirloin strips'
    WHEN 'Mixed Vegetables, Frozen' THEN '150g bell peppers, broccoli, carrots'
    WHEN 'Brown Rice, Cooked' THEN '150g cooked brown rice'
    WHEN 'Olive Oil' THEN '1 tsp for stir-frying'
  END
FROM food_servings
WHERE food_name IN ('Sirloin Steak', 'Mixed Vegetables, Frozen', 'Brown Rice, Cooked', 'Olive Oil')
  AND brand = 'Generic';

-- =====================================================
-- DINNER 2: Baked Chicken Thighs & Sweet Potato
-- Chicken Thigh + Sweet Potato + Green Beans
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f8a9b0c1-d2e3-4f8c-9d0e-1f2a3b4c5d6e',
  id,
  CASE food_name
    WHEN 'Chicken Thigh, Skinless' THEN 1.5   -- 150g
    WHEN 'Sweet Potato, Baked' THEN 1.5       -- 150g
    WHEN 'Green Beans' THEN 1.2               -- 120g
  END,
  CASE food_name
    WHEN 'Chicken Thigh, Skinless' THEN '150g skinless chicken thighs'
    WHEN 'Sweet Potato, Baked' THEN '150g cubed and roasted'
    WHEN 'Green Beans' THEN '120g roasted green beans'
  END
FROM food_servings
WHERE food_name IN ('Chicken Thigh, Skinless', 'Sweet Potato, Baked', 'Green Beans')
  AND brand = 'Generic';

-- =====================================================
-- DINNER 3: Ground Turkey Taco Bowl
-- Ground Turkey + Brown Rice + Black Beans + Avocado + Tomato
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'f9a0b1c2-d3e4-4f9d-0e1f-2a3b4c5d6e7f',
  id,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN 1.2      -- 120g
    WHEN 'Brown Rice, Cooked' THEN 1.2     -- 120g
    WHEN 'Black Beans, Cooked' THEN 0.75   -- 75g
    WHEN 'Avocado' THEN 0.3                -- 30g
    WHEN 'Tomato, Raw' THEN 0.4            -- 40g (salsa substitute)
  END,
  CASE food_name
    WHEN 'Lean Ground Turkey' THEN '120g seasoned ground turkey'
    WHEN 'Brown Rice, Cooked' THEN '120g cooked brown rice'
    WHEN 'Black Beans, Cooked' THEN '75g black beans'
    WHEN 'Avocado' THEN '30g diced avocado'
    WHEN 'Tomato, Raw' THEN '40g fresh salsa'
  END
FROM food_servings
WHERE food_name IN ('Lean Ground Turkey', 'Brown Rice, Cooked', 'Black Beans, Cooked', 'Avocado', 'Tomato, Raw')
  AND brand = 'Generic';

-- =====================================================
-- SNACK 1: Pre-Workout Energy Snack
-- Banana + Almond Butter + Instant Oats
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'faabb1c2-d4e5-4f0a-1f2a-3b4c5d6e7f80',
  id,
  CASE food_name
    WHEN 'Banana, Medium' THEN 1         -- 1 medium banana
    WHEN 'Almond Butter' THEN 0.5        -- 16g
    WHEN 'Instant Oats, Dry' THEN 0.5    -- 20g
  END,
  CASE food_name
    WHEN 'Banana, Medium' THEN '1 medium banana sliced'
    WHEN 'Almond Butter' THEN '16g for spreading/dipping'
    WHEN 'Instant Oats, Dry' THEN '20g mixed with cinnamon for dipping'
  END
FROM food_servings
WHERE food_name IN ('Banana, Medium', 'Almond Butter', 'Instant Oats, Dry')
  AND brand = 'Generic';

-- =====================================================
-- SNACK 2: Post-Workout Protein Shake
-- Whey Protein + Banana + Almond Milk
-- =====================================================
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes)
SELECT 
  'fbaccc2c-d5e6-4f1b-2a3b-4c5d6e7f8091',
  id,
  CASE food_name
    WHEN 'Whey Protein Concentrate' THEN 1    -- 1 scoop (30g)
    WHEN 'Banana, Medium' THEN 0.75           -- Small banana
    WHEN 'Almond Milk, Unsweetened' THEN 1    -- 240ml (1 cup)
  END,
  CASE food_name
    WHEN 'Whey Protein Concentrate' THEN '1 scoop (30g) whey protein'
    WHEN 'Banana, Medium' THEN '1 small banana (or 3/4 medium)'
    WHEN 'Almond Milk, Unsweetened' THEN '240ml unsweetened almond milk'
  END
FROM food_servings
WHERE food_name IN ('Whey Protein Concentrate', 'Banana, Medium', 'Almond Milk, Unsweetened')
  AND brand = 'Generic';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 
  m.name as meal_name,
  COUNT(mf.id) as food_count,
  ARRAY_AGG(fs.food_name) as foods
FROM meals m
LEFT JOIN meal_foods mf ON m.id = mf.meal_id
LEFT JOIN food_servings fs ON mf.food_servings_id = fs.id
WHERE m.id IN (
  'f1a2b3c4-d5e6-4f1a-2b3c-4d5e6f7a8b9c',
  'f2a3b4c5-d6e7-4f2b-3c4d-5e6f7a8b9c0d',
  'f3a4b5c6-d7e8-4f3c-4d5e-6f7a8b9c0d1e',
  'f4a5b6c7-d8e9-4f4d-5e6f-7a8b9c0d1e2f',
  'f5a6b7c8-d9e0-4f5e-6f7a-8b9c0d1e2f30',
  'f6a7b8c9-d0e1-4f6a-7b8c-9d0e1f2a3b4c',
  'f7a8b9c0-d1e2-4f7b-8c9d-0e1f2a3b4c5d',
  'f8a9b0c1-d2e3-4f8c-9d0e-1f2a3b4c5d6e',
  'f9a0b1c2-d3e4-4f9d-0e1f-2a3b4c5d6e7f',
  'faabb1c2-d4e5-4f0a-1f2a-3b4c5d6e7f80',
  'fbaccc2c-d5e6-4f1b-2a3b-4c5d6e7f8091'
)
GROUP BY m.id, m.name
ORDER BY m.name;

SELECT 'Successfully added meal_foods for all 10 meal templates!' as status;
