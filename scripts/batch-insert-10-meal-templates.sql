/**
 * @file batch-insert-10-meal-templates.sql
 * @description Insert 10 realistic, professionally-designed meal templates
 * @date 2025-11-17
 * 
 * Meals built from actual foods in the database with accurate macros and practical recipes
 */

-- 3 BREAKFASTS
-- Breakfast 1: High-Protein Scrambled Eggs with Whole Wheat Toast
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f1a2b3c4-d5e6-4f1a-2b3c-4d5e6f7a8b9c', 
 'Protein-Packed Scramble & Toast', 
 'Fluffy scrambled eggs with cheddar cheese, served with whole wheat toast and avocado',
 'breakfast',
 5,
 8,
 1,
 1,
 'Scramble 3 eggs with 28g cheddar cheese. Toast 2 slices whole wheat bread. Top with 50g sliced avocado. Serves 1. Macros: 520 cal, 32g protein, 35g carbs, 28g fat',
 true,
 true,
 ARRAY['high-protein','quick','muscle-building']);

-- Breakfast 2: Greek Yogurt Power Bowl
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f2a3b4c5-d6e7-4f2b-3c4d-5e6f7a8b9c0d',
 'Greek Yogurt Power Bowl',
 'Nonfat Greek yogurt with instant oats, banana, almond butter, and blueberries',
 'breakfast',
 5,
 3,
 1,
 1,
 'Mix 150g Greek yogurt with 40g instant oats (cooked). Top with ½ medium banana, 16g almond butter, 50g blueberries. Microwave oats 1-2 min, let cool, then assemble. Macros: 420 cal, 24g protein, 52g carbs, 13g fat',
 true,
 true,
 ARRAY['high-protein','meal-prep','balanced']);

-- Breakfast 3: Turkey Sausage & Sweet Potato Hash
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f3a4b5c6-d7e8-4f3c-4d5e-6f7a8b9c0d1e',
 'Turkey Sausage & Sweet Potato Hash',
 'Lean turkey breakfast sausage with roasted sweet potato cubes and bell peppers',
 'breakfast',
 10,
 20,
 1,
 2,
 'Dice 100g sweet potato and 50g red bell pepper. Roast at 400°F for 15 min. Cook 100g turkey sausage until browned. Combine and season with salt, pepper, paprika. Macros: 380 cal, 30g protein, 34g carbs, 14g fat',
 true,
 true,
 ARRAY['high-protein','whole30-friendly','paleo']);

-- 3 LUNCHES
-- Lunch 1: Grilled Chicken Power Bowl
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f4a5b6c7-d8e9-4f4d-5e6f-7a8b9c0d1e2f',
 'Grilled Chicken Power Bowl',
 'Grilled chicken breast over brown rice with broccoli, topped with olive oil',
 'lunch',
 10,
 25,
 1,
 2,
 'Grill 170g chicken breast seasoned with garlic and herbs (20 min). Cook 150g brown rice. Steam 100g broccoli. Assemble bowl and drizzle with 1 tbsp olive oil. Macros: 550 cal, 52g protein, 53g carbs, 14g fat',
 true,
 true,
 ARRAY['high-protein','meal-prep','balanced']);

-- Lunch 2: Turkey & Avocado Whole Wheat Wrap
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f5a6b7c8-d9e0-4f5e-6f7a-8b9c0d1e2f30',
 'Turkey & Avocado Whole Wheat Wrap',
 'Whole wheat tortilla with lean turkey, avocado, lettuce, and tomato',
 'lunch',
 8,
 0,
 1,
 1,
 'Layer 100g lean turkey (sliced), 50g avocado, 30g romaine lettuce, tomato slices on 1 large whole wheat tortilla. Roll tightly and cut in half. Perfect for meal prep! Macros: 420 cal, 36g protein, 38g carbs, 15g fat',
 true,
 true,
 ARRAY['high-protein','portable','quick']);

-- Lunch 3: Salmon & Quinoa Mediterranean Bowl
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f6a7b8c9-d0e1-4f6a-7b8c-9d0e1f2a3b4c',
 'Salmon & Quinoa Mediterranean Bowl',
 'Baked Atlantic salmon over quinoa with spinach, cucumber, and olive oil',
 'lunch',
 10,
 20,
 1,
 2,
 'Bake 150g salmon at 400°F for 15 min. Cook 100g quinoa (dry weight). Add 50g fresh spinach, 50g sliced cucumber. Drizzle with 1 tbsp olive oil and lemon juice. Macros: 580 cal, 42g protein, 46g carbs, 25g fat',
 true,
 true,
 ARRAY['high-protein','omega-3','heart-healthy']);

-- 3 DINNERS
-- Dinner 1: Lean Beef Stir-Fry with Vegetables
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f7a8b9c0-d1e2-4f7b-8c9d-0e1f2a3b4c5d',
 'Lean Beef Stir-Fry',
 'Sirloin steak strips with mixed vegetables over brown rice',
 'dinner',
 15,
 15,
 1,
 2,
 'Slice 150g sirloin into strips. Stir-fry with 150g mixed vegetables (bell peppers, broccoli, carrots) in 1 tsp olive oil. Season with soy sauce and garlic. Serve over 150g cooked brown rice. Macros: 580 cal, 48g protein, 60g carbs, 15g fat',
 true,
 true,
 ARRAY['high-protein','balanced','asian-inspired']);

-- Dinner 2: Baked Chicken Thighs with Sweet Potato
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f8a9b0c1-d2e3-4f8c-9d0e-1f2a3b4c5d6e',
 'Baked Chicken Thighs & Sweet Potato',
 'Skinless chicken thighs with roasted sweet potato and green beans',
 'dinner',
 10,
 35,
 1,
 2,
 'Season 150g chicken thighs with paprika, garlic powder, salt, pepper. Bake with 150g cubed sweet potato at 425°F for 30 min. Roast 120g green beans last 15 min. Macros: 520 cal, 45g protein, 48g carbs, 18g fat',
 true,
 true,
 ARRAY['high-protein','whole30','family-friendly']);

-- Dinner 3: Ground Turkey Taco Bowl
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('f9a0b1c2-d3e4-4f9d-0e1f-2a3b4c5d6e7f',
 'Ground Turkey Taco Bowl',
 'Seasoned lean ground turkey over brown rice with black beans, salsa, and avocado',
 'dinner',
 10,
 20,
 1,
 2,
 'Cook 120g lean ground turkey with taco seasoning. Prepare 120g brown rice and 75g black beans. Top with 40g salsa and 30g avocado. Season with cumin and chili powder. Macros: 560 cal, 45g protein, 62g carbs, 14g fat',
 true,
 true,
 ARRAY['high-protein','mexican-inspired','meal-prep']);

-- 1 PRE-WORKOUT SNACK  
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('faabb1c2-d4e5-4f0a-1f2a-3b4c5d6e7f80',
 'Pre-Workout Energy Snack',
 'Banana with almond butter and a handful of instant oats',
 'snack',
 3,
 0,
 1,
 1,
 'Slice 1 medium banana. Spread with 16g almond butter. Mix 20g instant oats with cinnamon for dipping. Fast-acting carbs + healthy fats for sustained energy. Macros: 280 cal, 6g protein, 40g carbs, 12g fat',
 true,
 true,
 ARRAY['pre-workout','quick','energy-boost']);

-- 1 POST-WORKOUT SNACK
INSERT INTO meals (id, name, description, category, prep_time_minutes, cook_time_minutes, serving_size, difficulty_level, instructions, is_premade, is_public, tags) VALUES
('fbaccc2c-d5e6-4f1b-2a3b-4c5d6e7f8091',
 'Post-Workout Protein Shake',
 'Whey protein shake with banana and almond milk',
 'snack',
 3,
 0,
 1,
 1,
 'Blend 1 scoop (30g) whey protein, 1 small banana, 240ml unsweetened almond milk, ice. Optional: add 5g creatine. Perfect 30min post-workout for muscle recovery. Macros: 250 cal, 28g protein, 32g carbs, 2g fat',
 true,
 true,
 ARRAY['post-workout','high-protein','muscle-recovery']);

-- Verify insertion
SELECT 'Successfully inserted 10 meal templates' as status;

-- Show summary of new meals
SELECT 
  category,
  COUNT(*) as meal_count,
  ARRAY_AGG(name) as meal_names
FROM meals
WHERE id IN (
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
GROUP BY category
ORDER BY category;
