-- Seed premade meals for the meal planner
-- This script is idempotent and can be run multiple times safely

BEGIN;

-- Insert premade meals with conflict resolution
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
('550e8400-e29b-41d4-a716-446655440012', 'Greek Yogurt with Nuts', 'Plain Greek yogurt topped with mixed nuts and honey', 'snack', true, 1, 'serving', 2, 0, 1, '1. Place Greek yogurt in bowl. 2. Top with mixed nuts. 3. Drizzle with honey.', ARRAY['high-protein', 'healthy-fats', 'quick'])
ON CONFLICT (id) DO NOTHING;

COMMIT;