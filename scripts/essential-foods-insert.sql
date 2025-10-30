-- Execute this in your Supabase SQL Editor to seed essential foods
-- Go to: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql

-- First, insert the foods with proper columns (foods table only has: id, name, category, pdcaas_score)
INSERT INTO foods (name, category, pdcaas_score) 
VALUES 
-- Protein Foods (High PDCAAS scores)
('Chicken Breast, Skinless, Boneless, Raw', 'Protein', 1.0),
('Ground Beef, 85% Lean', 'Protein', 0.92),
('Salmon, Atlantic, Raw', 'Protein', 1.0),
('Eggs, Large, Whole', 'Protein', 1.0),
('Greek Yogurt, Plain, Nonfat', 'Dairy', 1.0),
('Turkey Breast, Raw', 'Protein', 1.0),
('Tofu, Firm', 'Protein', 0.91),
('Cottage Cheese, Low Fat', 'Dairy', 1.0),

-- Carbohydrate Foods
('Brown Rice, Cooked', 'Grains', 0.75),
('Sweet Potato, Baked', 'Vegetables', 0.54),
('Oats, Rolled, Dry', 'Grains', 0.57),
('Quinoa, Cooked', 'Grains', 0.73),
('White Rice, Cooked', 'Grains', 0.69),
('Whole Wheat Bread', 'Grains', 0.54),
('Pasta, Cooked', 'Grains', 0.52),

-- Vegetables
('Broccoli, Raw', 'Vegetables', 0.70),
('Spinach, Raw', 'Vegetables', 0.68),
('Carrots, Raw', 'Vegetables', 0.58),
('Bell Peppers, Red, Raw', 'Vegetables', 0.62),
('Tomatoes, Raw', 'Vegetables', 0.55),
('Cucumber, Raw', 'Vegetables', 0.48),
('Lettuce, Green Leaf', 'Vegetables', 0.52),
('Onions, Raw', 'Vegetables', 0.44),

-- Fruits
('Banana, Raw', 'Fruits', 0.64),
('Apple, Raw, with Skin', 'Fruits', 0.58),
('Orange, Raw', 'Fruits', 0.62),
('Blueberries, Raw', 'Fruits', 0.51),
('Strawberries, Raw', 'Fruits', 0.53),
('Avocado, Raw', 'Fruits', 0.67),
('Grapes, Raw', 'Fruits', 0.49),

-- Nuts and Fats
('Almonds, Raw', 'Nuts', 0.52),
('Walnuts, Raw', 'Nuts', 0.45),
('Peanut Butter, Natural', 'Nuts', 0.70),
('Olive Oil, Extra Virgin', 'Oils', 0.0),
('Coconut Oil', 'Oils', 0.0),
('Chia Seeds', 'Seeds', 0.58),
('Flax Seeds', 'Seeds', 0.55),

-- Dairy
('Milk, 2% Fat', 'Dairy', 1.0),
('Cheddar Cheese', 'Dairy', 1.0),
('Mozzarella Cheese', 'Dairy', 1.0),

-- Legumes
('Black Beans, Cooked', 'Legumes', 0.68),
('Kidney Beans, Cooked', 'Legumes', 0.68),
('Lentils, Cooked', 'Legumes', 0.69),
('Chickpeas, Cooked', 'Legumes', 0.78)

ON CONFLICT (name) DO NOTHING;

-- Now insert the nutrition data into food_servings table
-- First, we need to get the food IDs we just inserted
DO $$
DECLARE
    food_rec RECORD;
BEGIN
    -- Insert serving data for each food
    FOR food_rec IN SELECT id, name FROM foods WHERE name IN (
        'Chicken Breast, Skinless, Boneless, Raw', 'Ground Beef, 85% Lean', 'Salmon, Atlantic, Raw',
        'Eggs, Large, Whole', 'Greek Yogurt, Plain, Nonfat', 'Turkey Breast, Raw', 'Tofu, Firm',
        'Cottage Cheese, Low Fat', 'Brown Rice, Cooked', 'Sweet Potato, Baked', 'Oats, Rolled, Dry',
        'Quinoa, Cooked', 'White Rice, Cooked', 'Whole Wheat Bread', 'Pasta, Cooked', 'Broccoli, Raw',
        'Spinach, Raw', 'Carrots, Raw', 'Bell Peppers, Red, Raw', 'Tomatoes, Raw', 'Cucumber, Raw',
        'Lettuce, Green Leaf', 'Onions, Raw', 'Banana, Raw', 'Apple, Raw, with Skin', 'Orange, Raw',
        'Blueberries, Raw', 'Strawberries, Raw', 'Avocado, Raw', 'Grapes, Raw', 'Almonds, Raw',
        'Walnuts, Raw', 'Peanut Butter, Natural', 'Olive Oil, Extra Virgin', 'Coconut Oil',
        'Chia Seeds', 'Flax Seeds', 'Milk, 2% Fat', 'Cheddar Cheese', 'Mozzarella Cheese',
        'Black Beans, Cooked', 'Kidney Beans, Cooked', 'Lentils, Cooked', 'Chickpeas, Cooked'
    )
    LOOP
        INSERT INTO food_servings (food_id, serving_description, calories, protein_g, carbs_g, fat_g)
        VALUES (
            food_rec.id,
            '100g',
            CASE food_rec.name
                WHEN 'Chicken Breast, Skinless, Boneless, Raw' THEN 165
                WHEN 'Ground Beef, 85% Lean' THEN 250
                WHEN 'Salmon, Atlantic, Raw' THEN 208
                WHEN 'Eggs, Large, Whole' THEN 155
                WHEN 'Greek Yogurt, Plain, Nonfat' THEN 59
                WHEN 'Turkey Breast, Raw' THEN 135
                WHEN 'Tofu, Firm' THEN 144
                WHEN 'Cottage Cheese, Low Fat' THEN 98
                WHEN 'Brown Rice, Cooked' THEN 111
                WHEN 'Sweet Potato, Baked' THEN 90
                WHEN 'Oats, Rolled, Dry' THEN 389
                WHEN 'Quinoa, Cooked' THEN 120
                WHEN 'White Rice, Cooked' THEN 130
                WHEN 'Whole Wheat Bread' THEN 247
                WHEN 'Pasta, Cooked' THEN 131
                WHEN 'Broccoli, Raw' THEN 34
                WHEN 'Spinach, Raw' THEN 23
                WHEN 'Carrots, Raw' THEN 41
                WHEN 'Bell Peppers, Red, Raw' THEN 31
                WHEN 'Tomatoes, Raw' THEN 18
                WHEN 'Cucumber, Raw' THEN 16
                WHEN 'Lettuce, Green Leaf' THEN 15
                WHEN 'Onions, Raw' THEN 40
                WHEN 'Banana, Raw' THEN 89
                WHEN 'Apple, Raw, with Skin' THEN 52
                WHEN 'Orange, Raw' THEN 47
                WHEN 'Blueberries, Raw' THEN 57
                WHEN 'Strawberries, Raw' THEN 32
                WHEN 'Avocado, Raw' THEN 160
                WHEN 'Grapes, Raw' THEN 62
                WHEN 'Almonds, Raw' THEN 579
                WHEN 'Walnuts, Raw' THEN 654
                WHEN 'Peanut Butter, Natural' THEN 588
                WHEN 'Olive Oil, Extra Virgin' THEN 884
                WHEN 'Coconut Oil' THEN 862
                WHEN 'Chia Seeds' THEN 486
                WHEN 'Flax Seeds' THEN 534
                WHEN 'Milk, 2% Fat' THEN 50
                WHEN 'Cheddar Cheese' THEN 403
                WHEN 'Mozzarella Cheese' THEN 300
                WHEN 'Black Beans, Cooked' THEN 132
                WHEN 'Kidney Beans, Cooked' THEN 127
                WHEN 'Lentils, Cooked' THEN 116
                WHEN 'Chickpeas, Cooked' THEN 164
            END,
            CASE food_rec.name
                WHEN 'Chicken Breast, Skinless, Boneless, Raw' THEN 31.0
                WHEN 'Ground Beef, 85% Lean' THEN 26.0
                WHEN 'Salmon, Atlantic, Raw' THEN 25.4
                WHEN 'Eggs, Large, Whole' THEN 13.0
                WHEN 'Greek Yogurt, Plain, Nonfat' THEN 10.3
                WHEN 'Turkey Breast, Raw' THEN 30.0
                WHEN 'Tofu, Firm' THEN 17.0
                WHEN 'Cottage Cheese, Low Fat' THEN 11.0
                WHEN 'Brown Rice, Cooked' THEN 2.6
                WHEN 'Sweet Potato, Baked' THEN 2.0
                WHEN 'Oats, Rolled, Dry' THEN 16.9
                WHEN 'Quinoa, Cooked' THEN 4.4
                WHEN 'White Rice, Cooked' THEN 2.7
                WHEN 'Whole Wheat Bread' THEN 13.0
                WHEN 'Pasta, Cooked' THEN 5.0
                WHEN 'Broccoli, Raw' THEN 2.8
                WHEN 'Spinach, Raw' THEN 2.9
                WHEN 'Carrots, Raw' THEN 0.9
                WHEN 'Bell Peppers, Red, Raw' THEN 1.0
                WHEN 'Tomatoes, Raw' THEN 0.9
                WHEN 'Cucumber, Raw' THEN 0.7
                WHEN 'Lettuce, Green Leaf' THEN 1.4
                WHEN 'Onions, Raw' THEN 1.1
                WHEN 'Banana, Raw' THEN 1.1
                WHEN 'Apple, Raw, with Skin' THEN 0.3
                WHEN 'Orange, Raw' THEN 0.9
                WHEN 'Blueberries, Raw' THEN 0.7
                WHEN 'Strawberries, Raw' THEN 0.7
                WHEN 'Avocado, Raw' THEN 2.0
                WHEN 'Grapes, Raw' THEN 0.6
                WHEN 'Almonds, Raw' THEN 21.0
                WHEN 'Walnuts, Raw' THEN 15.0
                WHEN 'Peanut Butter, Natural' THEN 25.0
                WHEN 'Olive Oil, Extra Virgin' THEN 0
                WHEN 'Coconut Oil' THEN 0
                WHEN 'Chia Seeds' THEN 17.0
                WHEN 'Flax Seeds' THEN 18.0
                WHEN 'Milk, 2% Fat' THEN 3.3
                WHEN 'Cheddar Cheese' THEN 25.0
                WHEN 'Mozzarella Cheese' THEN 22.0
                WHEN 'Black Beans, Cooked' THEN 8.9
                WHEN 'Kidney Beans, Cooked' THEN 8.7
                WHEN 'Lentils, Cooked' THEN 9.0
                WHEN 'Chickpeas, Cooked' THEN 8.9
            END,
            CASE food_rec.name
                WHEN 'Chicken Breast, Skinless, Boneless, Raw' THEN 0
                WHEN 'Ground Beef, 85% Lean' THEN 0
                WHEN 'Salmon, Atlantic, Raw' THEN 0
                WHEN 'Eggs, Large, Whole' THEN 1.1
                WHEN 'Greek Yogurt, Plain, Nonfat' THEN 3.6
                WHEN 'Turkey Breast, Raw' THEN 0
                WHEN 'Tofu, Firm' THEN 3.0
                WHEN 'Cottage Cheese, Low Fat' THEN 3.4
                WHEN 'Brown Rice, Cooked' THEN 22.0
                WHEN 'Sweet Potato, Baked' THEN 21.0
                WHEN 'Oats, Rolled, Dry' THEN 66.3
                WHEN 'Quinoa, Cooked' THEN 22.0
                WHEN 'White Rice, Cooked' THEN 28.0
                WHEN 'Whole Wheat Bread' THEN 41.0
                WHEN 'Pasta, Cooked' THEN 25.0
                WHEN 'Broccoli, Raw' THEN 7.0
                WHEN 'Spinach, Raw' THEN 3.6
                WHEN 'Carrots, Raw' THEN 10.0
                WHEN 'Bell Peppers, Red, Raw' THEN 7.0
                WHEN 'Tomatoes, Raw' THEN 3.9
                WHEN 'Cucumber, Raw' THEN 4.0
                WHEN 'Lettuce, Green Leaf' THEN 2.9
                WHEN 'Onions, Raw' THEN 9.3
                WHEN 'Banana, Raw' THEN 23.0
                WHEN 'Apple, Raw, with Skin' THEN 14.0
                WHEN 'Orange, Raw' THEN 12.0
                WHEN 'Blueberries, Raw' THEN 14.0
                WHEN 'Strawberries, Raw' THEN 8.0
                WHEN 'Avocado, Raw' THEN 9.0
                WHEN 'Grapes, Raw' THEN 16.0
                WHEN 'Almonds, Raw' THEN 22.0
                WHEN 'Walnuts, Raw' THEN 14.0
                WHEN 'Peanut Butter, Natural' THEN 20.0
                WHEN 'Olive Oil, Extra Virgin' THEN 0
                WHEN 'Coconut Oil' THEN 0
                WHEN 'Chia Seeds' THEN 42.0
                WHEN 'Flax Seeds' THEN 29.0
                WHEN 'Milk, 2% Fat' THEN 4.8
                WHEN 'Cheddar Cheese' THEN 1.3
                WHEN 'Mozzarella Cheese' THEN 2.2
                WHEN 'Black Beans, Cooked' THEN 24.0
                WHEN 'Kidney Beans, Cooked' THEN 23.0
                WHEN 'Lentils, Cooked' THEN 20.0
                WHEN 'Chickpeas, Cooked' THEN 27.0
            END,
            CASE food_rec.name
                WHEN 'Chicken Breast, Skinless, Boneless, Raw' THEN 3.6
                WHEN 'Ground Beef, 85% Lean' THEN 17.0
                WHEN 'Salmon, Atlantic, Raw' THEN 12.4
                WHEN 'Eggs, Large, Whole' THEN 11.0
                WHEN 'Greek Yogurt, Plain, Nonfat' THEN 0.4
                WHEN 'Turkey Breast, Raw' THEN 1.0
                WHEN 'Tofu, Firm' THEN 9.0
                WHEN 'Cottage Cheese, Low Fat' THEN 4.3
                WHEN 'Brown Rice, Cooked' THEN 0.9
                WHEN 'Sweet Potato, Baked' THEN 0.1
                WHEN 'Oats, Rolled, Dry' THEN 6.9
                WHEN 'Quinoa, Cooked' THEN 1.9
                WHEN 'White Rice, Cooked' THEN 0.3
                WHEN 'Whole Wheat Bread' THEN 4.2
                WHEN 'Pasta, Cooked' THEN 1.1
                WHEN 'Broccoli, Raw' THEN 0.4
                WHEN 'Spinach, Raw' THEN 0.4
                WHEN 'Carrots, Raw' THEN 0.2
                WHEN 'Bell Peppers, Red, Raw' THEN 0.3
                WHEN 'Tomatoes, Raw' THEN 0.2
                WHEN 'Cucumber, Raw' THEN 0.1
                WHEN 'Lettuce, Green Leaf' THEN 0.2
                WHEN 'Onions, Raw' THEN 0.1
                WHEN 'Banana, Raw' THEN 0.3
                WHEN 'Apple, Raw, with Skin' THEN 0.2
                WHEN 'Orange, Raw' THEN 0.1
                WHEN 'Blueberries, Raw' THEN 0.3
                WHEN 'Strawberries, Raw' THEN 0.3
                WHEN 'Avocado, Raw' THEN 15.0
                WHEN 'Grapes, Raw' THEN 0.2
                WHEN 'Almonds, Raw' THEN 50.0
                WHEN 'Walnuts, Raw' THEN 65.0
                WHEN 'Peanut Butter, Natural' THEN 50.0
                WHEN 'Olive Oil, Extra Virgin' THEN 100.0
                WHEN 'Coconut Oil' THEN 100.0
                WHEN 'Chia Seeds' THEN 31.0
                WHEN 'Flax Seeds' THEN 42.0
                WHEN 'Milk, 2% Fat' THEN 2.0
                WHEN 'Cheddar Cheese' THEN 33.0
                WHEN 'Mozzarella Cheese' THEN 22.0
                WHEN 'Black Beans, Cooked' THEN 0.5
                WHEN 'Kidney Beans, Cooked' THEN 0.5
                WHEN 'Lentils, Cooked' THEN 0.4
                WHEN 'Chickpeas, Cooked' THEN 2.6
            END
        ) ON CONFLICT (food_id, serving_description) DO NOTHING;
    END LOOP;
END $$;

-- Verify the insertion
SELECT COUNT(*) as total_foods FROM foods;
SELECT category, COUNT(*) as count FROM foods GROUP BY category ORDER BY count DESC;