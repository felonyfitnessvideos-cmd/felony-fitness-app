-- Seed premade meals for the meal planner

-- Insert premade meals
INSERT INTO meals (id, name, description, category, is_premade, serving_size, serving_unit, prep_time, cook_time, difficulty_level, instructions, tags) VALUES
-- Breakfast meals
('550e8400-e29b-41d4-a716-446655440001', 'Protein Pancakes', 'High-protein pancakes made with oats and protein powder', 'breakfast', true, 2, 'pancakes', 10, 15, 2, '1. Blend oats, protein powder, banana, and eggs. 2. Cook on medium heat like regular pancakes. 3. Serve with berries.', ARRAY['high-protein', 'gluten-free-option']),
('550e8400-e29b-41d4-a716-446655440002', 'Greek Yogurt Parfait', 'Layered Greek yogurt with berries and granola', 'breakfast', true, 1, 'cup', 5, 0, 1, '1. Layer Greek yogurt with mixed berries. 2. Top with granola and honey. 3. Add chia seeds for extra nutrition.', ARRAY['high-protein', 'vegetarian', 'quick']),
('550e8400-e29b-41d4-a716-446655440003', 'Avocado Toast', 'Whole grain toast topped with mashed avocado and seasonings', 'breakfast', true, 1, 'slice', 5, 2, 1, '1. Toast whole grain bread. 2. Mash avocado with lime juice and salt. 3. Spread on toast and add toppings.', ARRAY['vegetarian', 'healthy-fats', 'quick']),

-- Lunch meals
('550e8400-e29b-41d4-a716-446655440004', 'Chicken Caesar Salad', 'Grilled chicken breast over romaine with Caesar dressing', 'lunch', true, 1, 'serving', 15, 10, 2, '1. Grill seasoned chicken breast. 2. Chop romaine lettuce. 3. Toss with Caesar dressing and parmesan. 4. Top with grilled chicken.', ARRAY['high-protein', 'low-carb']),
('550e8400-e29b-41d4-a716-446655440005', 'Quinoa Buddha Bowl', 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing', 'lunch', true, 1, 'bowl', 20, 25, 3, '1. Cook quinoa. 2. Roast mixed vegetables. 3. Prepare tahini dressing. 4. Assemble bowl with quinoa, vegetables, and dressing.', ARRAY['vegetarian', 'vegan-option', 'high-fiber']),
('550e8400-e29b-41d4-a716-446655440006', 'Turkey Club Wrap', 'Whole wheat wrap with turkey, bacon, lettuce, and tomato', 'lunch', true, 1, 'wrap', 10, 5, 1, '1. Cook bacon until crispy. 2. Warm tortilla. 3. Layer turkey, bacon, lettuce, tomato, and mayo. 4. Roll tightly and slice.', ARRAY['high-protein', 'quick']),

-- Dinner meals
('550e8400-e29b-41d4-a716-446655440007', 'Salmon with Sweet Potato', 'Baked salmon fillet with roasted sweet potato and green beans', 'dinner', true, 1, 'serving', 15, 25, 2, '1. Season salmon with herbs. 2. Cube sweet potato and toss with oil. 3. Roast vegetables for 20 min. 4. Bake salmon for 12-15 min.', ARRAY['high-protein', 'omega-3', 'gluten-free']),
('550e8400-e29b-41d4-a716-446655440008', 'Chicken Stir Fry', 'Chicken breast stir-fried with mixed vegetables and brown rice', 'dinner', true, 1, 'serving', 15, 12, 2, '1. Cut chicken into strips. 2. Heat wok with oil. 3. Stir-fry chicken until cooked. 4. Add vegetables and sauce. 5. Serve over brown rice.', ARRAY['high-protein', 'quick', 'balanced']),
('550e8400-e29b-41d4-a716-446655440009', 'Lean Beef Tacos', 'Ground lean beef tacos with corn tortillas and fresh toppings', 'dinner', true, 3, 'tacos', 10, 15, 2, '1. Brown lean ground beef with spices. 2. Warm corn tortillas. 3. Fill with beef and top with lettuce, tomato, and salsa.', ARRAY['high-protein', 'gluten-free']),

-- Snack meals
('550e8400-e29b-41d4-a716-446655440010', 'Protein Smoothie', 'Post-workout protein smoothie with banana and berries', 'snack', true, 1, 'serving', 5, 0, 1, '1. Blend protein powder, banana, berries, and almond milk. 2. Add ice for desired consistency. 3. Blend until smooth.', ARRAY['high-protein', 'post-workout', 'quick']),
('550e8400-e29b-41d4-a716-446655440011', 'Apple with Almond Butter', 'Sliced apple with natural almond butter', 'snack', true, 1, 'serving', 2, 0, 1, '1. Wash and slice apple. 2. Serve with 2 tablespoons almond butter for dipping.', ARRAY['healthy-fats', 'quick', 'natural']),
('550e8400-e29b-41d4-a716-446655440012', 'Greek Yogurt with Nuts', 'Plain Greek yogurt topped with mixed nuts and honey', 'snack', true, 1, 'serving', 2, 0, 1, '1. Place Greek yogurt in bowl. 2. Top with mixed nuts. 3. Drizzle with honey.', ARRAY['high-protein', 'healthy-fats', 'quick']);

-- Insert meal foods (ingredients for each meal)
-- Note: These food_servings_id values should match existing food items in your database
-- You'll need to update these with actual IDs from your food_servings table

-- Protein Pancakes ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM food_servings WHERE food_name ILIKE '%oats%' LIMIT 1), 0.5, '1/2 cup rolled oats'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM food_servings WHERE food_name ILIKE '%protein powder%' LIMIT 1), 1, '1 scoop vanilla protein powder'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM food_servings WHERE food_name ILIKE '%banana%' LIMIT 1), 1, '1 medium banana'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM food_servings WHERE food_name ILIKE '%egg%' LIMIT 1), 2, '2 large eggs');

-- Greek Yogurt Parfait ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM food_servings WHERE food_name ILIKE '%greek yogurt%' LIMIT 1), 1, '1 cup plain Greek yogurt'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM food_servings WHERE food_name ILIKE '%blueberries%' LIMIT 1), 0.5, '1/2 cup fresh blueberries'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM food_servings WHERE food_name ILIKE '%granola%' LIMIT 1), 0.25, '1/4 cup granola'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM food_servings WHERE food_name ILIKE '%honey%' LIMIT 1), 1, '1 tablespoon honey');

-- Avocado Toast ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM food_servings WHERE food_name ILIKE '%bread%whole%' LIMIT 1), 1, '1 slice whole grain bread'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM food_servings WHERE food_name ILIKE '%avocado%' LIMIT 1), 0.5, '1/2 medium avocado'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM food_servings WHERE food_name ILIKE '%lime%' LIMIT 1), 0.25, '1/4 lime juice');

-- Chicken Caesar Salad ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM food_servings WHERE food_name ILIKE '%chicken breast%' LIMIT 1), 1, '4 oz grilled chicken breast'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM food_servings WHERE food_name ILIKE '%romaine%' LIMIT 1), 2, '2 cups chopped romaine lettuce'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM food_servings WHERE food_name ILIKE '%parmesan%' LIMIT 1), 0.25, '1/4 cup grated parmesan'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM food_servings WHERE food_name ILIKE '%caesar dressing%' LIMIT 1), 2, '2 tablespoons Caesar dressing');

-- Quinoa Buddha Bowl ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM food_servings WHERE food_name ILIKE '%quinoa%' LIMIT 1), 0.75, '3/4 cup cooked quinoa'),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM food_servings WHERE food_name ILIKE '%sweet potato%' LIMIT 1), 0.5, '1/2 cup roasted sweet potato'),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM food_servings WHERE food_name ILIKE '%broccoli%' LIMIT 1), 1, '1 cup roasted broccoli'),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM food_servings WHERE food_name ILIKE '%chickpeas%' LIMIT 1), 0.5, '1/2 cup chickpeas');

-- Turkey Club Wrap ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM food_servings WHERE food_name ILIKE '%tortilla%wheat%' LIMIT 1), 1, '1 large whole wheat tortilla'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM food_servings WHERE food_name ILIKE '%turkey%deli%' LIMIT 1), 3, '3 oz sliced turkey'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM food_servings WHERE food_name ILIKE '%bacon%' LIMIT 1), 2, '2 strips bacon'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM food_servings WHERE food_name ILIKE '%lettuce%' LIMIT 1), 1, '1 cup lettuce'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM food_servings WHERE food_name ILIKE '%tomato%' LIMIT 1), 0.5, '1/2 medium tomato');

-- Salmon with Sweet Potato ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM food_servings WHERE food_name ILIKE '%salmon%' LIMIT 1), 1, '5 oz salmon fillet'),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM food_servings WHERE food_name ILIKE '%sweet potato%' LIMIT 1), 1, '1 medium roasted sweet potato'),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM food_servings WHERE food_name ILIKE '%green beans%' LIMIT 1), 1, '1 cup green beans');

-- Chicken Stir Fry ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM food_servings WHERE food_name ILIKE '%chicken breast%' LIMIT 1), 1, '4 oz chicken breast'),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM food_servings WHERE food_name ILIKE '%brown rice%' LIMIT 1), 0.75, '3/4 cup cooked brown rice'),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM food_servings WHERE food_name ILIKE '%mixed vegetables%' LIMIT 1), 1.5, '1.5 cups mixed stir-fry vegetables');

-- Lean Beef Tacos ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440009', (SELECT id FROM food_servings WHERE food_name ILIKE '%ground beef%lean%' LIMIT 1), 3, '3 oz lean ground beef'),
('550e8400-e29b-41d4-a716-446655440009', (SELECT id FROM food_servings WHERE food_name ILIKE '%corn tortilla%' LIMIT 1), 3, '3 small corn tortillas'),
('550e8400-e29b-41d4-a716-446655440009', (SELECT id FROM food_servings WHERE food_name ILIKE '%lettuce%' LIMIT 1), 1, '1 cup shredded lettuce'),
('550e8400-e29b-41d4-a716-446655440009', (SELECT id FROM food_servings WHERE food_name ILIKE '%tomato%' LIMIT 1), 0.5, '1/2 cup diced tomato');

-- Protein Smoothie ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM food_servings WHERE food_name ILIKE '%protein powder%' LIMIT 1), 1, '1 scoop protein powder'),
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM food_servings WHERE food_name ILIKE '%banana%' LIMIT 1), 1, '1 medium banana'),
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM food_servings WHERE food_name ILIKE '%almond milk%' LIMIT 1), 1, '1 cup unsweetened almond milk'),
('550e8400-e29b-41d4-a716-446655440010', (SELECT id FROM food_servings WHERE food_name ILIKE '%berries%mixed%' LIMIT 1), 0.5, '1/2 cup mixed berries');

-- Apple with Almond Butter ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440011', (SELECT id FROM food_servings WHERE food_name ILIKE '%apple%' LIMIT 1), 1, '1 medium apple'),
('550e8400-e29b-41d4-a716-446655440011', (SELECT id FROM food_servings WHERE food_name ILIKE '%almond butter%' LIMIT 1), 2, '2 tablespoons almond butter');

-- Greek Yogurt with Nuts ingredients
INSERT INTO meal_foods (meal_id, food_servings_id, quantity, notes) VALUES
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM food_servings WHERE food_name ILIKE '%greek yogurt%' LIMIT 1), 1, '1 cup plain Greek yogurt'),
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM food_servings WHERE food_name ILIKE '%mixed nuts%' LIMIT 1), 0.25, '1/4 cup mixed nuts'),
('550e8400-e29b-41d4-a716-446655440012', (SELECT id FROM food_servings WHERE food_name ILIKE '%honey%' LIMIT 1), 1, '1 tablespoon honey');