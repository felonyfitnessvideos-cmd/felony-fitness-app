-- Additional Foods Batch Insert
-- Execute this in your Supabase SQL Editor to add more foods
-- Go to: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql

-- Insert additional foods into foods table
INSERT INTO foods (name, category, pdcaas_score) 
VALUES 
-- More Proteins
('Chicken Thigh, Skinless', 'Protein', 1.0),
('Ground Turkey, 93% Lean', 'Protein', 1.0),
('Cod, Atlantic', 'Protein', 1.0),
('Tuna, Yellowfin', 'Protein', 1.0),
('Shrimp, Cooked', 'Protein', 1.0),
('Lean Ground Beef, 90%', 'Protein', 0.92),
('Pork Tenderloin', 'Protein', 0.90),
('Egg Whites', 'Protein', 1.0),

-- More Vegetables
('Kale, Raw', 'Vegetables', 0.65),
('Brussels Sprouts', 'Vegetables', 0.60),
('Asparagus', 'Vegetables', 0.55),
('Cauliflower', 'Vegetables', 0.52),
('Zucchini', 'Vegetables', 0.48),
('Green Beans', 'Vegetables', 0.50),
('Mushrooms, White', 'Vegetables', 0.45),
('Celery', 'Vegetables', 0.40),

-- More Fruits
('Berries, Mixed', 'Fruits', 0.45),
('Pineapple, Fresh', 'Fruits', 0.42),
('Mango, Fresh', 'Fruits', 0.48),
('Kiwi Fruit', 'Fruits', 0.50),
('Peach, Fresh', 'Fruits', 0.45),
('Pear, Fresh', 'Fruits', 0.42),
('Cherries, Sweet', 'Fruits', 0.48),
('Watermelon', 'Fruits', 0.40),

-- More Grains & Carbs
('Wild Rice, Cooked', 'Grains', 0.65),
('Barley, Cooked', 'Grains', 0.60),
('Bulgur Wheat, Cooked', 'Grains', 0.58),
('Millet, Cooked', 'Grains', 0.55),
('Potato, Baked with Skin', 'Vegetables', 0.65),
('Yam, Baked', 'Vegetables', 0.55),

-- More Nuts & Seeds  
('Cashews, Raw', 'Nuts', 0.52),
('Pecans, Raw', 'Nuts', 0.48),
('Pistachios, Raw', 'Nuts', 0.55),
('Brazil Nuts', 'Nuts', 0.50),
('Pumpkin Seeds', 'Seeds', 0.58),
('Sunflower Seeds', 'Seeds', 0.55),
('Sesame Seeds', 'Seeds', 0.52),

-- More Legumes
('Navy Beans, Cooked', 'Legumes', 0.70),
('Pinto Beans, Cooked', 'Legumes', 0.68),
('Lima Beans, Cooked', 'Legumes', 0.72),
('Red Lentils, Cooked', 'Legumes', 0.69),
('Green Peas, Cooked', 'Legumes', 0.65),

-- More Dairy Products
('Plain Whole Milk', 'Dairy', 1.0),
('Low-Fat Milk, 1%', 'Dairy', 1.0),
('Skim Milk', 'Dairy', 1.0),
('Swiss Cheese', 'Dairy', 1.0),
('Feta Cheese', 'Dairy', 1.0),
('Ricotta Cheese, Part Skim', 'Dairy', 1.0),

-- Healthy Fats
('Avocado Oil', 'Oils', 0.0),
('MCT Oil', 'Oils', 0.0),
('Grass-Fed Butter', 'Dairy', 0.0)

ON CONFLICT (name) DO NOTHING;

-- Now insert the nutrition data into food_servings table
DO $$
DECLARE
    food_rec RECORD;
BEGIN
    -- Insert serving data for each food
    FOR food_rec IN SELECT id, name FROM foods WHERE name IN (
        'Chicken Thigh, Skinless', 'Ground Turkey, 93% Lean', 'Cod, Atlantic',
        'Tuna, Yellowfin', 'Shrimp, Cooked', 'Lean Ground Beef, 90%',
        'Pork Tenderloin', 'Egg Whites', 'Kale, Raw', 'Brussels Sprouts',
        'Asparagus', 'Cauliflower', 'Zucchini', 'Green Beans', 'Mushrooms, White',
        'Celery', 'Berries, Mixed', 'Pineapple, Fresh', 'Mango, Fresh',
        'Kiwi Fruit', 'Peach, Fresh', 'Pear, Fresh', 'Cherries, Sweet',
        'Watermelon', 'Wild Rice, Cooked', 'Barley, Cooked', 'Bulgur Wheat, Cooked',
        'Millet, Cooked', 'Potato, Baked with Skin', 'Yam, Baked', 'Cashews, Raw',
        'Pecans, Raw', 'Pistachios, Raw', 'Brazil Nuts', 'Pumpkin Seeds',
        'Sunflower Seeds', 'Sesame Seeds', 'Navy Beans, Cooked', 'Pinto Beans, Cooked',
        'Lima Beans, Cooked', 'Red Lentils, Cooked', 'Green Peas, Cooked',
        'Plain Whole Milk', 'Low-Fat Milk, 1%', 'Skim Milk', 'Swiss Cheese',
        'Feta Cheese', 'Ricotta Cheese, Part Skim', 'Avocado Oil', 'MCT Oil',
        'Grass-Fed Butter'
    )
    LOOP
        INSERT INTO food_servings (food_id, serving_description, calories, protein_g, carbs_g, fat_g)
        VALUES (
            food_rec.id,
            '100g',
            CASE food_rec.name
                WHEN 'Chicken Thigh, Skinless' THEN 209
                WHEN 'Ground Turkey, 93% Lean' THEN 120
                WHEN 'Cod, Atlantic' THEN 82
                WHEN 'Tuna, Yellowfin' THEN 109
                WHEN 'Shrimp, Cooked' THEN 99
                WHEN 'Lean Ground Beef, 90%' THEN 176
                WHEN 'Pork Tenderloin' THEN 147
                WHEN 'Egg Whites' THEN 52
                WHEN 'Kale, Raw' THEN 35
                WHEN 'Brussels Sprouts' THEN 43
                WHEN 'Asparagus' THEN 20
                WHEN 'Cauliflower' THEN 25
                WHEN 'Zucchini' THEN 17
                WHEN 'Green Beans' THEN 31
                WHEN 'Mushrooms, White' THEN 22
                WHEN 'Celery' THEN 16
                WHEN 'Berries, Mixed' THEN 57
                WHEN 'Pineapple, Fresh' THEN 50
                WHEN 'Mango, Fresh' THEN 60
                WHEN 'Kiwi Fruit' THEN 61
                WHEN 'Peach, Fresh' THEN 39
                WHEN 'Pear, Fresh' THEN 57
                WHEN 'Cherries, Sweet' THEN 63
                WHEN 'Watermelon' THEN 30
                WHEN 'Wild Rice, Cooked' THEN 101
                WHEN 'Barley, Cooked' THEN 123
                WHEN 'Bulgur Wheat, Cooked' THEN 83
                WHEN 'Millet, Cooked' THEN 119
                WHEN 'Potato, Baked with Skin' THEN 161
                WHEN 'Yam, Baked' THEN 116
                WHEN 'Cashews, Raw' THEN 553
                WHEN 'Pecans, Raw' THEN 691
                WHEN 'Pistachios, Raw' THEN 560
                WHEN 'Brazil Nuts' THEN 656
                WHEN 'Pumpkin Seeds' THEN 559
                WHEN 'Sunflower Seeds' THEN 584
                WHEN 'Sesame Seeds' THEN 573
                WHEN 'Navy Beans, Cooked' THEN 140
                WHEN 'Pinto Beans, Cooked' THEN 143
                WHEN 'Lima Beans, Cooked' THEN 115
                WHEN 'Red Lentils, Cooked' THEN 116
                WHEN 'Green Peas, Cooked' THEN 84
                WHEN 'Plain Whole Milk' THEN 61
                WHEN 'Low-Fat Milk, 1%' THEN 42
                WHEN 'Skim Milk' THEN 34
                WHEN 'Swiss Cheese' THEN 380
                WHEN 'Feta Cheese' THEN 264
                WHEN 'Ricotta Cheese, Part Skim' THEN 138
                WHEN 'Avocado Oil' THEN 884
                WHEN 'MCT Oil' THEN 830
                WHEN 'Grass-Fed Butter' THEN 717
            END,
            CASE food_rec.name
                WHEN 'Chicken Thigh, Skinless' THEN 26.0
                WHEN 'Ground Turkey, 93% Lean' THEN 26.0
                WHEN 'Cod, Atlantic' THEN 18.0
                WHEN 'Tuna, Yellowfin' THEN 25.0
                WHEN 'Shrimp, Cooked' THEN 24.0
                WHEN 'Lean Ground Beef, 90%' THEN 26.0
                WHEN 'Pork Tenderloin' THEN 26.0
                WHEN 'Egg Whites' THEN 11.0
                WHEN 'Kale, Raw' THEN 2.9
                WHEN 'Brussels Sprouts' THEN 3.4
                WHEN 'Asparagus' THEN 2.2
                WHEN 'Cauliflower' THEN 1.9
                WHEN 'Zucchini' THEN 1.2
                WHEN 'Green Beans' THEN 1.8
                WHEN 'Mushrooms, White' THEN 3.1
                WHEN 'Celery' THEN 0.7
                WHEN 'Berries, Mixed' THEN 0.7
                WHEN 'Pineapple, Fresh' THEN 0.5
                WHEN 'Mango, Fresh' THEN 0.8
                WHEN 'Kiwi Fruit' THEN 1.1
                WHEN 'Peach, Fresh' THEN 0.9
                WHEN 'Pear, Fresh' THEN 0.4
                WHEN 'Cherries, Sweet' THEN 1.1
                WHEN 'Watermelon' THEN 0.6
                WHEN 'Wild Rice, Cooked' THEN 4.0
                WHEN 'Barley, Cooked' THEN 2.3
                WHEN 'Bulgur Wheat, Cooked' THEN 3.1
                WHEN 'Millet, Cooked' THEN 3.5
                WHEN 'Potato, Baked with Skin' THEN 4.3
                WHEN 'Yam, Baked' THEN 1.5
                WHEN 'Cashews, Raw' THEN 18.0
                WHEN 'Pecans, Raw' THEN 9.2
                WHEN 'Pistachios, Raw' THEN 20.0
                WHEN 'Brazil Nuts' THEN 14.0
                WHEN 'Pumpkin Seeds' THEN 30.0
                WHEN 'Sunflower Seeds' THEN 21.0
                WHEN 'Sesame Seeds' THEN 18.0
                WHEN 'Navy Beans, Cooked' THEN 8.2
                WHEN 'Pinto Beans, Cooked' THEN 9.0
                WHEN 'Lima Beans, Cooked' THEN 7.8
                WHEN 'Red Lentils, Cooked' THEN 9.0
                WHEN 'Green Peas, Cooked' THEN 5.4
                WHEN 'Plain Whole Milk' THEN 3.2
                WHEN 'Low-Fat Milk, 1%' THEN 3.4
                WHEN 'Skim Milk' THEN 3.4
                WHEN 'Swiss Cheese' THEN 27.0
                WHEN 'Feta Cheese' THEN 14.0
                WHEN 'Ricotta Cheese, Part Skim' THEN 11.0
                WHEN 'Avocado Oil' THEN 0
                WHEN 'MCT Oil' THEN 0
                WHEN 'Grass-Fed Butter' THEN 0.9
            END,
            CASE food_rec.name
                WHEN 'Chicken Thigh, Skinless' THEN 0
                WHEN 'Ground Turkey, 93% Lean' THEN 0
                WHEN 'Cod, Atlantic' THEN 0
                WHEN 'Tuna, Yellowfin' THEN 0
                WHEN 'Shrimp, Cooked' THEN 0.2
                WHEN 'Lean Ground Beef, 90%' THEN 0
                WHEN 'Pork Tenderloin' THEN 0
                WHEN 'Egg Whites' THEN 0.7
                WHEN 'Kale, Raw' THEN 7.3
                WHEN 'Brussels Sprouts' THEN 8.9
                WHEN 'Asparagus' THEN 3.9
                WHEN 'Cauliflower' THEN 5.0
                WHEN 'Zucchini' THEN 3.1
                WHEN 'Green Beans' THEN 7.0
                WHEN 'Mushrooms, White' THEN 3.3
                WHEN 'Celery' THEN 3.0
                WHEN 'Berries, Mixed' THEN 14.0
                WHEN 'Pineapple, Fresh' THEN 13.0
                WHEN 'Mango, Fresh' THEN 15.0
                WHEN 'Kiwi Fruit' THEN 15.0
                WHEN 'Peach, Fresh' THEN 9.5
                WHEN 'Pear, Fresh' THEN 15.0
                WHEN 'Cherries, Sweet' THEN 16.0
                WHEN 'Watermelon' THEN 8.0
                WHEN 'Wild Rice, Cooked' THEN 21.0
                WHEN 'Barley, Cooked' THEN 28.0
                WHEN 'Bulgur Wheat, Cooked' THEN 19.0
                WHEN 'Millet, Cooked' THEN 23.0
                WHEN 'Potato, Baked with Skin' THEN 37.0
                WHEN 'Yam, Baked' THEN 27.0
                WHEN 'Cashews, Raw' THEN 30.0
                WHEN 'Pecans, Raw' THEN 14.0
                WHEN 'Pistachios, Raw' THEN 28.0
                WHEN 'Brazil Nuts' THEN 12.0
                WHEN 'Pumpkin Seeds' THEN 15.0
                WHEN 'Sunflower Seeds' THEN 20.0
                WHEN 'Sesame Seeds' THEN 23.0
                WHEN 'Navy Beans, Cooked' THEN 26.0
                WHEN 'Pinto Beans, Cooked' THEN 26.0
                WHEN 'Lima Beans, Cooked' THEN 21.0
                WHEN 'Red Lentils, Cooked' THEN 20.0
                WHEN 'Green Peas, Cooked' THEN 16.0
                WHEN 'Plain Whole Milk' THEN 4.8
                WHEN 'Low-Fat Milk, 1%' THEN 5.0
                WHEN 'Skim Milk' THEN 5.0
                WHEN 'Swiss Cheese' THEN 5.4
                WHEN 'Feta Cheese' THEN 4.1
                WHEN 'Ricotta Cheese, Part Skim' THEN 5.1
                WHEN 'Avocado Oil' THEN 0
                WHEN 'MCT Oil' THEN 0
                WHEN 'Grass-Fed Butter' THEN 0.1
            END,
            CASE food_rec.name
                WHEN 'Chicken Thigh, Skinless' THEN 10.9
                WHEN 'Ground Turkey, 93% Lean' THEN 2.0
                WHEN 'Cod, Atlantic' THEN 0.7
                WHEN 'Tuna, Yellowfin' THEN 0.5
                WHEN 'Shrimp, Cooked' THEN 0.3
                WHEN 'Lean Ground Beef, 90%' THEN 8.0
                WHEN 'Pork Tenderloin' THEN 4.0
                WHEN 'Egg Whites' THEN 0.2
                WHEN 'Kale, Raw' THEN 0.4
                WHEN 'Brussels Sprouts' THEN 0.3
                WHEN 'Asparagus' THEN 0.1
                WHEN 'Cauliflower' THEN 0.3
                WHEN 'Zucchini' THEN 0.3
                WHEN 'Green Beans' THEN 0.2
                WHEN 'Mushrooms, White' THEN 0.3
                WHEN 'Celery' THEN 0.2
                WHEN 'Berries, Mixed' THEN 0.3
                WHEN 'Pineapple, Fresh' THEN 0.1
                WHEN 'Mango, Fresh' THEN 0.4
                WHEN 'Kiwi Fruit' THEN 0.5
                WHEN 'Peach, Fresh' THEN 0.3
                WHEN 'Pear, Fresh' THEN 0.1
                WHEN 'Cherries, Sweet' THEN 0.2
                WHEN 'Watermelon' THEN 0.2
                WHEN 'Wild Rice, Cooked' THEN 0.3
                WHEN 'Barley, Cooked' THEN 0.4
                WHEN 'Bulgur Wheat, Cooked' THEN 0.2
                WHEN 'Millet, Cooked' THEN 1.0
                WHEN 'Potato, Baked with Skin' THEN 0.2
                WHEN 'Yam, Baked' THEN 0.1
                WHEN 'Cashews, Raw' THEN 44.0
                WHEN 'Pecans, Raw' THEN 72.0
                WHEN 'Pistachios, Raw' THEN 45.0
                WHEN 'Brazil Nuts' THEN 66.0
                WHEN 'Pumpkin Seeds' THEN 49.0
                WHEN 'Sunflower Seeds' THEN 51.0
                WHEN 'Sesame Seeds' THEN 50.0
                WHEN 'Navy Beans, Cooked' THEN 0.6
                WHEN 'Pinto Beans, Cooked' THEN 0.7
                WHEN 'Lima Beans, Cooked' THEN 0.4
                WHEN 'Red Lentils, Cooked' THEN 0.4
                WHEN 'Green Peas, Cooked' THEN 0.2
                WHEN 'Plain Whole Milk' THEN 3.3
                WHEN 'Low-Fat Milk, 1%' THEN 1.0
                WHEN 'Skim Milk' THEN 0.2
                WHEN 'Swiss Cheese' THEN 28.0
                WHEN 'Feta Cheese' THEN 21.0
                WHEN 'Ricotta Cheese, Part Skim' THEN 8.0
                WHEN 'Avocado Oil' THEN 100.0
                WHEN 'MCT Oil' THEN 93.0
                WHEN 'Grass-Fed Butter' THEN 81.0
            END
        ) ON CONFLICT (food_id, serving_description) DO NOTHING;
    END LOOP;
END $$;

-- Verify the insertion
SELECT COUNT(*) as total_foods_after_batch FROM foods;
SELECT category, COUNT(*) as count FROM foods GROUP BY category ORDER BY count DESC;