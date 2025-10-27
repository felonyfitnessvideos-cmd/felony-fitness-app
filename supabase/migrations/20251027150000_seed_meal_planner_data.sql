-- Seed data for meal planner with proper conflict handling
-- This migration adds sample meals and seed data for the meal planner

BEGIN;

-- Insert sample premade meals with conflict handling
-- Only insert if they don't already exist

-- Check if meals table has any premade meals, if not, insert sample data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM meals WHERE is_premade = true LIMIT 1) THEN
        -- Breakfast meals
        INSERT INTO meals (id, user_id, name, description, category, is_premade, serving_size, serving_unit, prep_time, cook_time, difficulty_level, instructions, tags)
        VALUES 
        (gen_random_uuid(), NULL, 'Classic Oatmeal', 'Hearty oatmeal with optional toppings', 'breakfast', true, 1, 'bowl', 5, 10, 1, 'Combine oats with water or milk. Cook for 5-10 minutes until creamy. Add desired toppings.', ARRAY['vegetarian', 'healthy', 'quick']),
        (gen_random_uuid(), NULL, 'Scrambled Eggs', 'Fluffy scrambled eggs with herbs', 'breakfast', true, 2, 'eggs', 5, 5, 2, 'Beat eggs with salt and pepper. Cook in buttered pan over low heat, stirring constantly until fluffy.', ARRAY['protein', 'quick', 'keto-friendly']),
        (gen_random_uuid(), NULL, 'Greek Yogurt Parfait', 'Layered yogurt with berries and granola', 'breakfast', true, 1, 'cup', 5, 0, 1, 'Layer Greek yogurt with fresh berries and granola. Drizzle with honey if desired.', ARRAY['protein', 'healthy', 'no-cook']),
        (gen_random_uuid(), NULL, 'Avocado Toast', 'Whole grain toast topped with mashed avocado', 'breakfast', true, 1, 'slice', 5, 2, 1, 'Toast bread, mash avocado with lime juice, salt and pepper. Spread on toast and garnish.', ARRAY['healthy', 'vegetarian', 'quick']),
        
        -- Lunch meals
        (gen_random_uuid(), NULL, 'Grilled Chicken Salad', 'Mixed greens with grilled chicken breast', 'lunch', true, 1, 'bowl', 10, 15, 2, 'Season and grill chicken breast. Serve over mixed greens with vegetables and dressing.', ARRAY['protein', 'healthy', 'low-carb']),
        (gen_random_uuid(), NULL, 'Turkey Sandwich', 'Deli turkey sandwich with vegetables', 'lunch', true, 1, 'sandwich', 5, 0, 1, 'Layer turkey, cheese, lettuce, tomato and condiments between bread slices.', ARRAY['quick', 'protein', 'portable']),
        (gen_random_uuid(), NULL, 'Quinoa Bowl', 'Nutritious quinoa with roasted vegetables', 'lunch', true, 1, 'bowl', 15, 25, 2, 'Cook quinoa according to package directions. Roast vegetables and combine with cooked quinoa.', ARRAY['vegetarian', 'healthy', 'high-fiber']),
        (gen_random_uuid(), NULL, 'Soup and Salad Combo', 'Hearty soup with side salad', 'lunch', true, 1, 'combo', 10, 20, 2, 'Prepare your favorite soup recipe and serve with a fresh mixed green salad.', ARRAY['comfort-food', 'healthy', 'filling']),
        
        -- Dinner meals
        (gen_random_uuid(), NULL, 'Baked Salmon', 'Herb-crusted salmon with lemon', 'dinner', true, 1, 'fillet', 10, 20, 3, 'Season salmon with herbs, bake at 400°F for 15-20 minutes until flaky.', ARRAY['protein', 'healthy', 'omega-3']),
        (gen_random_uuid(), NULL, 'Chicken Stir Fry', 'Quick chicken and vegetable stir fry', 'dinner', true, 1, 'serving', 15, 10, 2, 'Cut chicken and vegetables into strips. Stir fry in hot oil with sauce until cooked through.', ARRAY['quick', 'protein', 'vegetables']),
        (gen_random_uuid(), NULL, 'Spaghetti Bolognese', 'Classic pasta with meat sauce', 'dinner', true, 1, 'serving', 15, 30, 3, 'Brown ground beef with onions, add tomato sauce and simmer. Serve over cooked pasta.', ARRAY['comfort-food', 'family-friendly', 'protein']),
        (gen_random_uuid(), NULL, 'Vegetable Curry', 'Spiced vegetable curry with rice', 'dinner', true, 1, 'serving', 20, 25, 3, 'Sauté vegetables with curry spices, add coconut milk and simmer. Serve over rice.', ARRAY['vegetarian', 'spicy', 'healthy']),
        
        -- Snack options
        (gen_random_uuid(), NULL, 'Mixed Nuts', 'Portion of mixed nuts', 'snack', true, 1, 'ounce', 0, 0, 1, 'Pre-portioned serving of mixed nuts for convenient snacking.', ARRAY['protein', 'healthy-fats', 'portable']),
        (gen_random_uuid(), NULL, 'Apple with Peanut Butter', 'Sliced apple with natural peanut butter', 'snack', true, 1, 'serving', 3, 0, 1, 'Slice apple and serve with 2 tablespoons natural peanut butter for dipping.', ARRAY['healthy', 'protein', 'fiber']),
        (gen_random_uuid(), NULL, 'Protein Smoothie', 'Fruit and protein powder smoothie', 'snack', true, 1, 'cup', 5, 0, 1, 'Blend protein powder with fruits, liquid of choice, and ice until smooth.', ARRAY['protein', 'quick', 'post-workout']),
        (gen_random_uuid(), NULL, 'Hummus and Veggies', 'Fresh vegetables with hummus dip', 'snack', true, 1, 'serving', 5, 0, 1, 'Cut fresh vegetables into sticks and serve with portion of hummus for dipping.', ARRAY['vegetarian', 'healthy', 'fiber']);
        
        RAISE NOTICE 'Sample meals inserted successfully';
    ELSE
        RAISE NOTICE 'Premade meals already exist, skipping seed data insertion';
    END IF;
END $$;

-- Note: We're not inserting meal_foods relationships here as they would need
-- to reference existing food_servings records, which may vary by database.
-- These would typically be added through the application interface or 
-- a separate data import process.

COMMIT;