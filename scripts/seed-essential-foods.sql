-- Essential Foods Seeding Script
-- Direct SQL insertion of common foods for immediate use

-- Insert essential protein foods
INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sodium, data_source, quality_score, created_at) VALUES
('Chicken Breast, Skinless, Boneless, Raw', 'Protein', 100, 'g', 165, 31.0, 0, 3.6, 0, 74, 'Manual', 85, NOW()),
('Ground Beef, 85% Lean', 'Protein', 100, 'g', 250, 26.0, 0, 17.0, 0, 75, 'Manual', 85, NOW()),
('Salmon, Atlantic, Raw', 'Protein', 100, 'g', 208, 25.4, 0, 12.4, 0, 59, 'Manual', 85, NOW()),
('Eggs, Large, Whole', 'Protein', 100, 'g', 155, 13.0, 1.1, 11.0, 0, 124, 'Manual', 85, NOW()),
('Greek Yogurt, Plain, Nonfat', 'Dairy', 100, 'g', 59, 10.3, 3.6, 0.4, 0, 36, 'Manual', 85, NOW()),

-- Insert essential carbohydrate foods
('Brown Rice, Cooked', 'Grains', 100, 'g', 111, 2.6, 22.0, 0.9, 1.6, 1, 'Manual', 80, NOW()),
('Sweet Potato, Baked', 'Vegetables', 100, 'g', 90, 2.0, 21.0, 0.1, 3.3, 6, 'Manual', 80, NOW()),
('Oats, Rolled, Dry', 'Grains', 100, 'g', 389, 16.9, 66.3, 6.9, 10.6, 2, 'Manual', 85, NOW()),
('Quinoa, Cooked', 'Grains', 100, 'g', 120, 4.4, 22.0, 1.9, 2.8, 7, 'Manual', 85, NOW()),
('Whole Wheat Bread', 'Grains', 100, 'g', 247, 13.0, 41.0, 4.2, 6.0, 490, 'Manual', 75, NOW()),

-- Insert essential vegetables
('Broccoli, Raw', 'Vegetables', 100, 'g', 34, 2.8, 7.0, 0.4, 2.6, 33, 'Manual', 90, NOW()),
('Spinach, Raw', 'Vegetables', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2, 79, 'Manual', 90, NOW()),
('Carrots, Raw', 'Vegetables', 100, 'g', 41, 0.9, 10.0, 0.2, 2.8, 69, 'Manual', 85, NOW()),
('Bell Peppers, Red, Raw', 'Vegetables', 100, 'g', 31, 1.0, 7.0, 0.3, 2.5, 4, 'Manual', 85, NOW()),
('Tomatoes, Raw', 'Vegetables', 100, 'g', 18, 0.9, 3.9, 0.2, 1.2, 5, 'Manual', 85, NOW()),

-- Insert essential fruits
('Banana, Raw', 'Fruits', 100, 'g', 89, 1.1, 23.0, 0.3, 2.6, 1, 'Manual', 85, NOW()),
('Apple, Raw, with Skin', 'Fruits', 100, 'g', 52, 0.3, 14.0, 0.2, 2.4, 1, 'Manual', 85, NOW()),
('Blueberries, Raw', 'Fruits', 100, 'g', 57, 0.7, 14.0, 0.3, 2.4, 1, 'Manual', 85, NOW()),
('Orange, Raw', 'Fruits', 100, 'g', 47, 0.9, 12.0, 0.1, 2.4, 0, 'Manual', 85, NOW()),
('Avocado, Raw', 'Fruits', 100, 'g', 160, 2.0, 9.0, 15.0, 7.0, 7, 'Manual', 90, NOW()),

-- Insert essential fats and oils
('Olive Oil, Extra Virgin', 'Oils', 100, 'g', 884, 0, 0, 100.0, 0, 2, 'Manual', 80, NOW()),
('Almonds, Raw', 'Nuts', 100, 'g', 579, 21.0, 22.0, 50.0, 12.0, 1, 'Manual', 90, NOW()),
('Peanut Butter, Natural', 'Nuts', 100, 'g', 588, 25.0, 20.0, 50.0, 8.0, 17, 'Manual', 85, NOW()),
('Walnuts, Raw', 'Nuts', 100, 'g', 654, 15.0, 14.0, 65.0, 7.0, 2, 'Manual', 85, NOW()),
('Chia Seeds', 'Seeds', 100, 'g', 486, 17.0, 42.0, 31.0, 34.0, 16, 'Manual', 90, NOW()),

-- Insert essential dairy
('Milk, 2% Fat', 'Dairy', 100, 'g', 50, 3.3, 4.8, 2.0, 0, 44, 'Manual', 80, NOW()),
('Cheddar Cheese', 'Dairy', 100, 'g', 403, 25.0, 1.3, 33.0, 0, 621, 'Manual', 80, NOW()),
('Cottage Cheese, Low Fat', 'Dairy', 100, 'g', 98, 11.0, 3.4, 4.3, 0, 364, 'Manual', 85, NOW()),

-- Insert protein alternatives
('Tofu, Firm', 'Protein', 100, 'g', 144, 17.0, 3.0, 9.0, 2.0, 11, 'Manual', 85, NOW()),
('Black Beans, Cooked', 'Legumes', 100, 'g', 132, 8.9, 24.0, 0.5, 8.7, 2, 'Manual', 85, NOW()),
('Lentils, Cooked', 'Legumes', 100, 'g', 116, 9.0, 20.0, 0.4, 7.9, 2, 'Manual', 85, NOW())

ON CONFLICT (name) DO NOTHING;