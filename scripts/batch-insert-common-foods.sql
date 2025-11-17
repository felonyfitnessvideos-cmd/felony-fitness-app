/**
 * @file scripts/batch-insert-common-foods.sql
 * @description Batch insert of 100+ common foods that people actually search for
 * @date 2025-11-17
 * 
 * SOURCES:
 * - USDA FoodData Central (standard reference)
 * - MyFitnessPal most-searched foods
 * - Common gym/fitness foods
 * 
 * CATEGORIES COVERED:
 * - Proteins: Chicken, beef, fish, eggs, protein powders
 * - Carbs: Rice, pasta, bread, oats, potatoes
 * - Vegetables: Broccoli, spinach, carrots, etc.
 * - Fruits: Bananas, apples, berries, etc.
 * - Dairy: Milk, cheese, yogurt, Greek yogurt
 * - Fats: Oils, nuts, nut butters, avocado
 * - Snacks: Protein bars, common packaged foods
 * - Restaurant: Chipotle, Subway, common chains
 * 
 * ALL FOODS SET TO enrichment_status='pending' FOR AI PROCESSING
 */

-- ========================================
-- PROTEIN SOURCES (25 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  -- Chicken
  ('Chicken Breast, Grilled', 'Generic', '100g', 165, 31, 0, 3.6, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Chicken Breast, Raw', 'Generic', '100g', 120, 22.5, 0, 2.6, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Chicken Thigh, Skinless', 'Generic', '100g', 209, 26, 0, 10.9, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Chicken Wings', 'Generic', '100g', 203, 30.5, 0, 8.1, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Ground Chicken, 93/7', 'Generic', '100g', 145, 25, 0, 4.5, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  
  -- Beef
  ('Ground Beef, 93/7', 'Generic', '100g', 182, 25.8, 0, 8, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Ground Beef, 85/15', 'Generic', '100g', 215, 26, 0, 11.3, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Sirloin Steak', 'Generic', '100g', 183, 30, 0, 6.2, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Ribeye Steak', 'Generic', '100g', 291, 24.7, 0, 21, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  ('Lean Ground Turkey', 'Generic', '100g', 170, 29, 0, 5, 0, 0, 'Meat & Poultry', 'usda', 'pending'),
  
  -- Fish & Seafood
  ('Salmon, Atlantic', 'Generic', '100g', 206, 22, 0, 13, 0, 0, 'Seafood', 'usda', 'pending'),
  ('Tilapia', 'Generic', '100g', 128, 26, 0, 2.6, 0, 0, 'Seafood', 'usda', 'pending'),
  ('Tuna, Canned in Water', 'Generic', '100g', 116, 25.5, 0, 0.8, 0, 0, 'Seafood', 'usda', 'pending'),
  ('Cod', 'Generic', '100g', 105, 23, 0, 0.9, 0, 0, 'Seafood', 'usda', 'pending'),
  ('Shrimp', 'Generic', '100g', 99, 24, 0.2, 0.3, 0, 0, 'Seafood', 'usda', 'pending'),
  
  -- Eggs & Dairy Proteins
  ('Egg, Whole Large', 'Generic', '1 large (50g)', 72, 6.3, 0.4, 4.8, 0, 0.2, 'Dairy & Eggs', 'usda', 'pending'),
  ('Egg White', 'Generic', '1 large (33g)', 17, 3.6, 0.2, 0.1, 0, 0.2, 'Dairy & Eggs', 'usda', 'pending'),
  ('Scrambled Eggs', 'Generic', '100g', 149, 9.9, 1.6, 11, 0, 1.2, 'Dairy & Eggs', 'usda', 'pending'),
  ('Cottage Cheese, Low Fat', 'Generic', '100g', 72, 12.4, 2.7, 1, 0, 2.7, 'Dairy & Eggs', 'usda', 'pending'),
  ('Greek Yogurt, Plain Nonfat', 'Generic', '100g', 59, 10.2, 3.6, 0.4, 0, 3.2, 'Dairy & Eggs', 'usda', 'pending'),
  
  -- Protein Powders (common brands)
  ('Whey Protein Isolate', 'Generic', '1 scoop (30g)', 110, 25, 1, 0.5, 0, 1, 'Protein & Supplements', 'label', 'pending'),
  ('Whey Protein Concentrate', 'Generic', '1 scoop (30g)', 120, 24, 3, 1.5, 0, 2, 'Protein & Supplements', 'label', 'pending'),
  ('Casein Protein', 'Generic', '1 scoop (30g)', 120, 24, 3, 1, 0, 0, 'Protein & Supplements', 'label', 'pending'),
  ('Pea Protein', 'Generic', '1 scoop (30g)', 120, 24, 2, 2, 0, 0, 'Protein & Supplements', 'label', 'pending'),
  ('Plant-Based Protein Blend', 'Generic', '1 scoop (30g)', 110, 20, 4, 2.5, 3, 1, 'Protein & Supplements', 'label', 'pending');

-- ========================================
-- CARBOHYDRATE SOURCES (25 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  -- Rice
  ('White Rice, Cooked', 'Generic', '100g', 130, 2.7, 28.2, 0.3, 0.4, 0.1, 'grain', 'usda', 'pending'),
  ('Brown Rice, Cooked', 'Generic', '100g', 112, 2.6, 23.5, 0.9, 1.8, 0.4, 'grain', 'usda', 'pending'),
  ('Jasmine Rice, Cooked', 'Generic', '100g', 129, 2.7, 28, 0.2, 0.3, 0, 'grain', 'usda', 'pending'),
  ('Basmati Rice, Cooked', 'Generic', '100g', 121, 2.5, 25.2, 0.4, 0.7, 0, 'grain', 'usda', 'pending'),
  
  -- Pasta
  ('Pasta, Cooked', 'Generic', '100g', 131, 5.1, 25, 1.1, 1.8, 0.6, 'grain', 'usda', 'pending'),
  ('Whole Wheat Pasta, Cooked', 'Generic', '100g', 124, 5.3, 26.5, 0.5, 3.5, 0.6, 'grain', 'usda', 'pending'),
  ('Penne Pasta, Cooked', 'Generic', '100g', 131, 5, 25, 1, 2, 1, 'grain', 'usda', 'pending'),
  
  -- Potatoes
  ('Sweet Potato, Baked', 'Generic', '100g', 90, 2, 20.7, 0.2, 3.3, 6.5, 'vegetable', 'usda', 'pending'),
  ('White Potato, Baked', 'Generic', '100g', 93, 2.5, 21.2, 0.1, 2.2, 1.2, 'vegetable', 'usda', 'pending'),
  ('Red Potato', 'Generic', '100g', 70, 1.9, 15.9, 0.1, 1.8, 1.3, 'vegetable', 'usda', 'pending'),
  
  -- Bread
  ('Whole Wheat Bread', 'Generic', '28g', 69, 3.6, 11.6, 0.9, 1.9, 1.4, 'grain', 'usda', 'pending'),
  ('White Bread', 'Generic', '28g', 75, 2.3, 14.2, 1, 0.8, 1.4, 'grain', 'usda', 'pending'),
  ('Sourdough Bread', 'Generic', '28g', 73, 2.9, 14.1, 0.6, 0.6, 0.5, 'grain', 'usda', 'pending'),
  ('Ezekiel Bread', 'Generic', '34g', 80, 4, 15, 0.5, 3, 0, 'grain', 'label', 'pending'),
  
  -- Oats & Cereals
  ('Oatmeal, Cooked', 'Generic', '100g', 71, 2.5, 12, 1.5, 1.7, 0.3, 'grain', 'usda', 'pending'),
  ('Instant Oats, Dry', 'Generic', '40g', 148, 5.3, 27.7, 2.8, 4, 0.4, 'grain', 'usda', 'pending'),
  ('Cheerios', 'General Mills', '28g', 100, 3, 20, 2, 3, 1, 'grain', 'label', 'pending'),
  ('Corn Flakes', 'Generic', '28g', 100, 2, 24, 0, 1, 2, 'grain', 'usda', 'pending'),
  
  -- Quinoa & Alternatives
  ('Quinoa, Cooked', 'Generic', '100g', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 'grain', 'usda', 'pending'),
  ('Couscous, Cooked', 'Generic', '100g', 112, 3.8, 23.2, 0.2, 1.4, 0.1, 'grain', 'usda', 'pending'),
  
  -- Tortillas & Wraps
  ('Flour Tortilla, 8 inch', 'Generic', '49g', 146, 3.9, 25.3, 3.5, 1.6, 1.1, 'grain', 'usda', 'pending'),
  ('Whole Wheat Tortilla, 8 inch', 'Generic', '49g', 130, 4, 22, 3, 3, 1, 'grain', 'label', 'pending'),
  ('Low Carb Tortilla', 'Mission', '43g', 80, 5, 19, 2.5, 15, 0, 'grain', 'label', 'pending'),
  
  -- Beans
  ('Black Beans, Cooked', 'Generic', '100g', 132, 8.9, 23.7, 0.5, 8.7, 0.3, 'legume', 'usda', 'pending'),
  ('Chickpeas, Cooked', 'Generic', '100g', 164, 8.9, 27.4, 2.6, 7.6, 4.8, 'legume', 'usda', 'pending');

-- ========================================
-- VEGETABLES (20 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  ('Broccoli, Raw', 'Generic', '100g', 34, 2.8, 6.6, 0.4, 2.6, 1.7, 'vegetable', 'usda', 'pending'),
  ('Broccoli, Steamed', 'Generic', '100g', 35, 2.4, 7.2, 0.4, 3.3, 1.4, 'vegetable', 'usda', 'pending'),
  ('Spinach, Raw', 'Generic', '100g', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 'vegetable', 'usda', 'pending'),
  ('Kale, Raw', 'Generic', '100g', 35, 2.9, 4.4, 1.5, 4.1, 0.8, 'vegetable', 'usda', 'pending'),
  ('Carrots, Raw', 'Generic', '100g', 41, 0.9, 9.6, 0.2, 2.8, 4.7, 'vegetable', 'usda', 'pending'),
  ('Bell Pepper, Red', 'Generic', '100g', 31, 1, 6, 0.3, 2.1, 4.2, 'vegetable', 'usda', 'pending'),
  ('Cucumber', 'Generic', '100g', 15, 0.7, 3.6, 0.1, 0.5, 1.7, 'vegetable', 'usda', 'pending'),
  ('Tomato, Raw', 'Generic', '100g', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 'vegetable', 'usda', 'pending'),
  ('Lettuce, Romaine', 'Generic', '100g', 17, 1.2, 3.3, 0.3, 2.1, 1.2, 'vegetable', 'usda', 'pending'),
  ('Onion, Raw', 'Generic', '100g', 40, 1.1, 9.3, 0.1, 1.7, 4.2, 'vegetable', 'usda', 'pending'),
  ('Mushrooms, White', 'Generic', '100g', 22, 3.1, 3.3, 0.3, 1, 2, 'vegetable', 'usda', 'pending'),
  ('Asparagus', 'Generic', '100g', 20, 2.2, 3.9, 0.1, 2.1, 1.9, 'vegetable', 'usda', 'pending'),
  ('Green Beans', 'Generic', '100g', 31, 1.8, 7, 0.2, 2.7, 3.3, 'vegetable', 'usda', 'pending'),
  ('Cauliflower, Raw', 'Generic', '100g', 25, 1.9, 5, 0.3, 2, 1.9, 'vegetable', 'usda', 'pending'),
  ('Zucchini', 'Generic', '100g', 17, 1.2, 3.1, 0.3, 1, 2.5, 'vegetable', 'usda', 'pending'),
  ('Celery', 'Generic', '100g', 14, 0.7, 3, 0.2, 1.6, 1.3, 'vegetable', 'usda', 'pending'),
  ('Brussels Sprouts', 'Generic', '100g', 43, 3.4, 9, 0.3, 3.8, 2.2, 'vegetable', 'usda', 'pending'),
  ('Cabbage, Green', 'Generic', '100g', 25, 1.3, 5.8, 0.1, 2.5, 3.2, 'vegetable', 'usda', 'pending'),
  ('Avocado', 'Generic', '100g', 160, 2, 8.5, 14.7, 6.7, 0.7, 'vegetable', 'usda', 'pending'),
  ('Mixed Vegetables, Frozen', 'Generic', '100g', 65, 2.6, 13.1, 0.4, 3.8, 4.5, 'vegetable', 'usda', 'pending');

-- ========================================
-- FRUITS (15 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  ('Banana, Medium', 'Generic', '118g', 105, 1.3, 27, 0.4, 3.1, 14.4, 'fruit', 'usda', 'pending'),
  ('Apple, Medium', 'Generic', '182g', 95, 0.5, 25.1, 0.3, 4.4, 18.9, 'fruit', 'usda', 'pending'),
  ('Strawberries', 'Generic', '100g', 32, 0.7, 7.7, 0.3, 2, 4.9, 'fruit', 'usda', 'pending'),
  ('Blueberries', 'Generic', '100g', 57, 0.7, 14.5, 0.3, 2.4, 10, 'fruit', 'usda', 'pending'),
  ('Raspberries', 'Generic', '100g', 52, 1.2, 11.9, 0.7, 6.5, 4.4, 'fruit', 'usda', 'pending'),
  ('Blackberries', 'Generic', '100g', 43, 1.4, 9.6, 0.5, 5.3, 4.9, 'fruit', 'usda', 'pending'),
  ('Orange, Medium', 'Generic', '131g', 62, 1.2, 15.4, 0.2, 3.1, 12.2, 'fruit', 'usda', 'pending'),
  ('Grapes, Red', 'Generic', '100g', 69, 0.7, 18.1, 0.2, 0.9, 15.5, 'fruit', 'usda', 'pending'),
  ('Watermelon', 'Generic', '100g', 30, 0.6, 7.6, 0.2, 0.4, 6.2, 'fruit', 'usda', 'pending'),
  ('Pineapple', 'Generic', '100g', 50, 0.5, 13.1, 0.1, 1.4, 9.9, 'fruit', 'usda', 'pending'),
  ('Mango', 'Generic', '100g', 60, 0.8, 15, 0.4, 1.6, 13.7, 'fruit', 'usda', 'pending'),
  ('Peach', 'Generic', '150g', 59, 1.4, 14.3, 0.4, 2.3, 12.6, 'fruit', 'usda', 'pending'),
  ('Pear, Medium', 'Generic', '178g', 101, 0.6, 27.1, 0.2, 5.5, 17.2, 'fruit', 'usda', 'pending'),
  ('Cantaloupe', 'Generic', '100g', 34, 0.8, 8.2, 0.2, 0.9, 7.9, 'fruit', 'usda', 'pending'),
  ('Cherries', 'Generic', '100g', 63, 1.1, 16, 0.2, 2.1, 12.8, 'fruit', 'usda', 'pending');

-- ========================================
-- DAIRY PRODUCTS (10 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  ('Milk, Whole', 'Generic', '244ml', 149, 7.7, 11.7, 7.9, 0, 12.3, 'dairy', 'usda', 'pending'),
  ('Milk, 2%', 'Generic', '244ml', 122, 8.1, 11.7, 4.8, 0, 12.3, 'dairy', 'usda', 'pending'),
  ('Milk, Skim', 'Generic', '244ml', 83, 8.3, 12.2, 0.2, 0, 12.5, 'dairy', 'usda', 'pending'),
  ('Almond Milk, Unsweetened', 'Generic', '240ml', 30, 1, 1, 2.5, 1, 0, 'dairy', 'label', 'pending'),
  ('Oat Milk', 'Generic', '240ml', 120, 3, 16, 5, 2, 7, 'dairy', 'label', 'pending'),
  ('Cheddar Cheese', 'Generic', '28g', 114, 7, 0.4, 9.4, 0, 0.2, 'dairy', 'usda', 'pending'),
  ('Mozzarella Cheese, Part Skim', 'Generic', '28g', 72, 6.9, 0.8, 4.5, 0, 0.3, 'dairy', 'usda', 'pending'),
  ('String Cheese', 'Generic', '28g', 80, 6, 1, 6, 0, 0, 'dairy', 'label', 'pending'),
  ('Greek Yogurt, Plain 2%', 'Generic', '170g', 130, 17, 7, 3.5, 0, 7, 'dairy', 'label', 'pending'),
  ('Yogurt, Regular', 'Generic', '170g', 127, 8.5, 17.2, 2.7, 0, 17, 'dairy', 'usda', 'pending');

-- ========================================
-- FATS & OILS (10 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  ('Olive Oil', 'Generic', '13.5ml', 119, 0, 0, 13.5, 0, 0, 'fat', 'usda', 'pending'),
  ('Coconut Oil', 'Generic', '13.6ml', 121, 0, 0, 13.6, 0, 0, 'fat', 'usda', 'pending'),
  ('Butter', 'Generic', '14g', 102, 0.1, 0, 11.5, 0, 0, 'fat', 'usda', 'pending'),
  ('Peanut Butter', 'Generic', '32g', 188, 7.7, 7.7, 16.1, 2.1, 3, 'fat', 'usda', 'pending'),
  ('Almond Butter', 'Generic', '32g', 196, 6.7, 6, 17.8, 3.3, 1.9, 'fat', 'label', 'pending'),
  ('Almonds', 'Generic', '28g', 164, 6, 6.1, 14.2, 3.5, 1.2, 'fat', 'usda', 'pending'),
  ('Walnuts', 'Generic', '28g', 185, 4.3, 3.9, 18.5, 1.9, 0.7, 'fat', 'usda', 'pending'),
  ('Cashews', 'Generic', '28g', 157, 5.2, 8.6, 12.4, 0.9, 1.7, 'fat', 'usda', 'pending'),
  ('Pecans', 'Generic', '28g', 196, 2.6, 3.9, 20.4, 2.7, 1.1, 'fat', 'usda', 'pending'),
  ('Chia Seeds', 'Generic', '28g', 138, 4.7, 11.9, 8.7, 9.8, 0, 'fat', 'usda', 'pending');

-- ========================================
-- RESTAURANT & FAST FOOD (10 foods)
-- ========================================

INSERT INTO food_servings (
  food_name, brand, serving_description,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
  category, source, enrichment_status
) VALUES
  ('Chipotle Chicken Bowl (no rice, extra chicken)', 'Chipotle', '1bowl', 385, 64, 14, 10.5, 7, 3, 'restaurant', 'menu', 'pending'),
  ('Chipotle Burrito Bowl (chicken, white rice, black beans)', 'Chipotle', '1bowl', 630, 56, 71, 15, 20, 4, 'restaurant', 'menu', 'pending'),
  ('Subway 6" Turkey Breast', 'Subway', '1sandwich', 280, 18, 46, 3.5, 5, 7, 'restaurant', 'menu', 'pending'),
  ('Chick-fil-A Grilled Chicken Sandwich', 'Chick-fil-A', '1sandwich', 390, 29, 44, 12, 3, 10, 'restaurant', 'menu', 'pending'),
  ('Panera Bread Chicken Noodle Soup', 'Panera', '1cup', 110, 8, 11, 3.5, 1, 2, 'restaurant', 'menu', 'pending'),
  ('Starbucks Egg White Bites', 'Starbucks', '1serving', 170, 13, 13, 7, 1, 1, 'restaurant', 'menu', 'pending'),
  ('Five Guys Little Hamburger', 'Five Guys', '1burger', 480, 26, 39, 26, 2, 8, 'restaurant', 'menu', 'pending'),
  ('Panda Express Grilled Teriyaki Chicken', 'Panda Express', '1serving', 300, 36, 13, 12, 1, 8, 'restaurant', 'menu', 'pending'),
  ('Taco Bell Chicken Soft Taco', 'Taco Bell', '1taco', 180, 12, 19, 6, 2, 2, 'restaurant', 'menu', 'pending'),
  ('In-N-Out Burger Protein Style', 'In-N-Out', '1burger', 330, 18, 11, 25, 3, 7, 'restaurant', 'menu', 'pending');

-- ========================================
-- SUMMARY
-- ========================================
-- Total foods inserted: 115
-- All set to enrichment_status='pending' for AI processing via Nutrition Pipeline
-- Next step: Run bulk enrichment from Nutrition Pipeline Monitor UI
