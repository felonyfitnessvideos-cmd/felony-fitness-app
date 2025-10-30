-- High-Quality Foods from Multi-API Nutrition Pipeline
-- Generated from USDA database via nutrition-aggregator
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql

-- Insert foods with safe IDs (aggressive approach - find available ID ranges)
DO $$
DECLARE
  food_data RECORD;
  safe_id INTEGER;
  id_offset INTEGER := 1000;
  foods_to_insert CONSTANT TEXT[][] := ARRAY[
    ['CHICKEN BREAST', 'Meat & Poultry', '1'],
    ['SALMON', 'Fish & Seafood', '1'],
    ['EGGS', 'Dairy & Eggs', '1'],
    ['TURKEY BREAST', 'Meat & Poultry', '1'],
    ['TUNA', 'Fish & Seafood', '0.5'],
    ['Fish, tuna salad', 'Fish & Seafood', '1'],
    ['SHRIMP', 'Fish & Seafood', '0.5'],
    ['TOFU', 'Plant Proteins', '0.5'],
    ['BROWN RICE', 'Grains, Bread & Pasta', '0.65'],
    ['OATS', 'Grains, Bread & Pasta', '0.65'],
    ['QUINOA', 'Grains, Bread & Pasta', '0.7'],
    ['SWEET POTATO', 'Vegetables', '0.5'],
    ['WHOLE WHEAT BREAD', 'Grains, Bread & Pasta', '0.5'],
    ['BANANA', 'Fruits', '0.5'],
    ['APPLE', 'Fruits', '0'],
    ['BLUEBERRIES', 'Fruits', '0'],
    ['SPINACH', 'Vegetables', '0.5'],
    ['BROCCOLI', 'Vegetables', '0.5'],
    ['ALMONDS', 'Nuts & Seeds', '0.5'],
    ['WALNUTS', 'Nuts & Seeds', '0.55'],
    ['OLIVE OIL', 'Oils & Fats', '0'],
    ['Avocado dressing', 'Fruits', '0.5'],
    ['Avocado, raw', 'Fruits', '0.5'],
    ['PEANUT BUTTER', 'Nuts & Seeds', '0.55'],
    ['MILK', 'Dairy & Eggs', '1'],
    ['CHEESE', 'Dairy & Eggs', '1'],
    ['BUTTER', 'Dairy & Eggs', '0'],
    ['PASTA', 'Grains, Bread & Pasta', '0.5'],
    ['Potato patty', 'Vegetables', '0.5'],
    ['Soup, potato', 'Vegetables', '0.5'],
    ['CARROTS', 'Vegetables', '0.5'],
    ['Onions, raw', 'Vegetables', '0'],
    ['Bread, onion', 'Grains, Bread & Pasta', '0.5'],
    ['TOMATOES', 'Vegetables', '0'],
    ['Lettuce, raw', 'Vegetables', '0'],
    ['Lettuce, cooked', 'Vegetables', '0.5'],
    ['GARLIC', 'Vegetables', '0']
  ];
BEGIN
  -- Find the highest existing ID and start from a safe range
  SELECT COALESCE(MAX(id), 0) + id_offset INTO safe_id FROM foods;
  
  -- Insert each food with a guaranteed safe ID
  FOR i IN 1..array_length(foods_to_insert, 1) LOOP
    -- Check if food already exists (case insensitive)
    IF NOT EXISTS (
      SELECT 1 FROM foods 
      WHERE UPPER(name) = UPPER(foods_to_insert[i][1])
    ) THEN
      -- Find next available ID
      WHILE EXISTS (SELECT 1 FROM foods WHERE id = safe_id) LOOP
        safe_id := safe_id + 1000;
      END LOOP;
      
      -- Insert with explicit safe ID (override identity column)
      INSERT INTO foods (id, name, category, pdcaas_score) 
      OVERRIDING SYSTEM VALUE
      VALUES (
        safe_id,
        foods_to_insert[i][1],
        foods_to_insert[i][2],
        foods_to_insert[i][3]::NUMERIC
      );
      
      RAISE NOTICE 'Inserted % with ID %', foods_to_insert[i][1], safe_id;
      safe_id := safe_id + 1;
    ELSE
      RAISE NOTICE 'Skipped % (already exists)', foods_to_insert[i][1];
    END IF;
  END LOOP;
  
  -- Update the sequence to prevent future conflicts
  PERFORM setval('foods_id_seq', (SELECT MAX(id) FROM foods));
END $$;

-- Insert nutrition data  
DO $$
DECLARE
    f RECORD;
BEGIN
    FOR f IN SELECT id, name FROM foods WHERE name IN ('CHICKEN BREAST', 'SALMON', 'EGGS', 'TURKEY BREAST', 'TUNA', 'Fish, tuna salad', 'SHRIMP', 'TOFU', 'BROWN RICE', 'OATS', 'QUINOA', 'SWEET POTATO', 'WHOLE WHEAT BREAD', 'BANANA', 'APPLE', 'BLUEBERRIES', 'SPINACH', 'BROCCOLI', 'ALMONDS', 'WALNUTS', 'OLIVE OIL', 'Avocado dressing', 'Avocado, raw', 'PEANUT BUTTER', 'MILK', 'CHEESE', 'BUTTER', 'PASTA', 'Potato patty', 'Soup, potato', 'CARROTS', 'Onions, raw', 'Bread, onion', 'TOMATOES', 'Lettuce, raw', 'Lettuce, cooked', 'GARLIC')
    LOOP
        -- Check if serving already exists for this food
        IF NOT EXISTS (SELECT 1 FROM food_servings WHERE food_id = f.id AND serving_description = '100g') THEN
            INSERT INTO food_servings (food_id, serving_description, calories, protein_g, carbs_g, fat_g)
            OVERRIDING SYSTEM VALUE
        VALUES (
            f.id,
            '100g',
            CASE 
        WHEN f.name = 'CHICKEN BREAST' THEN 165
        WHEN f.name = 'SALMON' THEN 208
        WHEN f.name = 'EGGS' THEN 155
        WHEN f.name = 'TURKEY BREAST' THEN 135
        WHEN f.name = 'TUNA' THEN 132
        WHEN f.name = 'Fish, tuna salad' THEN 187
        WHEN f.name = 'SHRIMP' THEN 99
        WHEN f.name = 'TOFU' THEN 94
        WHEN f.name = 'BROWN RICE' THEN 363
        WHEN f.name = 'OATS' THEN 375
        WHEN f.name = 'QUINOA' THEN 368
        WHEN f.name = 'SWEET POTATO' THEN 86
        WHEN f.name = 'WHOLE WHEAT BREAD' THEN 247
        WHEN f.name = 'BANANA' THEN 89
        WHEN f.name = 'APPLE' THEN 52
        WHEN f.name = 'BLUEBERRIES' THEN 57
        WHEN f.name = 'SPINACH' THEN 23
        WHEN f.name = 'BROCCOLI' THEN 34
        WHEN f.name = 'ALMONDS' THEN 579
        WHEN f.name = 'WALNUTS' THEN 654
        WHEN f.name = 'OLIVE OIL' THEN 884
        WHEN f.name = 'Avocado dressing' THEN 427
        WHEN f.name = 'Avocado, raw' THEN 160
        WHEN f.name = 'PEANUT BUTTER' THEN 588
        WHEN f.name = 'MILK' THEN 61
        WHEN f.name = 'CHEESE' THEN 402
        WHEN f.name = 'BUTTER' THEN 717
        WHEN f.name = 'PASTA' THEN 371
        WHEN f.name = 'Potato patty' THEN 171
        WHEN f.name = 'Soup, potato' THEN 90
        WHEN f.name = 'CARROTS' THEN 41
        WHEN f.name = 'Onions, raw' THEN 40
        WHEN f.name = 'Bread, onion' THEN 238
        WHEN f.name = 'TOMATOES' THEN 18
        WHEN f.name = 'Lettuce, raw' THEN 15
        WHEN f.name = 'Lettuce, cooked' THEN 49
        WHEN f.name = 'GARLIC' THEN 149
            END,
            CASE 
        WHEN f.name = 'CHICKEN BREAST' THEN 31.0
        WHEN f.name = 'SALMON' THEN 25.4
        WHEN f.name = 'EGGS' THEN 13.0
        WHEN f.name = 'TURKEY BREAST' THEN 29.3
        WHEN f.name = 'TUNA' THEN 28.0
        WHEN f.name = 'Fish, tuna salad' THEN 16.0
        WHEN f.name = 'SHRIMP' THEN 18.0
        WHEN f.name = 'TOFU' THEN 9.4
        WHEN f.name = 'BROWN RICE' THEN 7.9
        WHEN f.name = 'OATS' THEN 12.5
        WHEN f.name = 'QUINOA' THEN 14.1
        WHEN f.name = 'SWEET POTATO' THEN 2.0
        WHEN f.name = 'WHOLE WHEAT BREAD' THEN 13.2
        WHEN f.name = 'BANANA' THEN 1.1
        WHEN f.name = 'APPLE' THEN 0.3
        WHEN f.name = 'BLUEBERRIES' THEN 0.7
        WHEN f.name = 'SPINACH' THEN 2.9
        WHEN f.name = 'BROCCOLI' THEN 2.8
        WHEN f.name = 'ALMONDS' THEN 21.2
        WHEN f.name = 'WALNUTS' THEN 15.2
        WHEN f.name = 'OLIVE OIL' THEN 0.0
        WHEN f.name = 'Avocado dressing' THEN 1.9
        WHEN f.name = 'Avocado, raw' THEN 2.0
        WHEN f.name = 'PEANUT BUTTER' THEN 25.8
        WHEN f.name = 'MILK' THEN 3.2
        WHEN f.name = 'CHEESE' THEN 25.0
        WHEN f.name = 'BUTTER' THEN 0.9
        WHEN f.name = 'PASTA' THEN 13.0
        WHEN f.name = 'Potato patty' THEN 3.9
        WHEN f.name = 'Soup, potato' THEN 1.5
        WHEN f.name = 'CARROTS' THEN 0.9
        WHEN f.name = 'Onions, raw' THEN 1.1
        WHEN f.name = 'Bread, onion' THEN 8.8
        WHEN f.name = 'TOMATOES' THEN 0.9
        WHEN f.name = 'Lettuce, raw' THEN 1.4
        WHEN f.name = 'Lettuce, cooked' THEN 1.1
        WHEN f.name = 'GARLIC' THEN 6.4
            END,
            CASE 
        WHEN f.name = 'CHICKEN BREAST' THEN 0.0
        WHEN f.name = 'SALMON' THEN 0.0
        WHEN f.name = 'EGGS' THEN 1.1
        WHEN f.name = 'TURKEY BREAST' THEN 0.0
        WHEN f.name = 'TUNA' THEN 0.0
        WHEN f.name = 'Fish, tuna salad' THEN 9.4
        WHEN f.name = 'SHRIMP' THEN 0.2
        WHEN f.name = 'TOFU' THEN 1.9
        WHEN f.name = 'BROWN RICE' THEN 77.2
        WHEN f.name = 'OATS' THEN 67.5
        WHEN f.name = 'QUINOA' THEN 64.2
        WHEN f.name = 'SWEET POTATO' THEN 20.1
        WHEN f.name = 'WHOLE WHEAT BREAD' THEN 41.0
        WHEN f.name = 'BANANA' THEN 22.8
        WHEN f.name = 'APPLE' THEN 13.8
        WHEN f.name = 'BLUEBERRIES' THEN 14.5
        WHEN f.name = 'SPINACH' THEN 3.6
        WHEN f.name = 'BROCCOLI' THEN 6.6
        WHEN f.name = 'ALMONDS' THEN 21.6
        WHEN f.name = 'WALNUTS' THEN 13.7
        WHEN f.name = 'OLIVE OIL' THEN 0.0
        WHEN f.name = 'Avocado dressing' THEN 7.4
        WHEN f.name = 'Avocado, raw' THEN 8.5
        WHEN f.name = 'PEANUT BUTTER' THEN 20.0
        WHEN f.name = 'MILK' THEN 4.8
        WHEN f.name = 'CHEESE' THEN 1.3
        WHEN f.name = 'BUTTER' THEN 0.1
        WHEN f.name = 'PASTA' THEN 75.0
        WHEN f.name = 'Potato patty' THEN 13.5
        WHEN f.name = 'Soup, potato' THEN 10.5
        WHEN f.name = 'CARROTS' THEN 9.6
        WHEN f.name = 'Onions, raw' THEN 9.3
        WHEN f.name = 'Bread, onion' THEN 44.3
        WHEN f.name = 'TOMATOES' THEN 3.9
        WHEN f.name = 'Lettuce, raw' THEN 2.9
        WHEN f.name = 'Lettuce, cooked' THEN 4.2
        WHEN f.name = 'GARLIC' THEN 33.1
            END,
            CASE 
        WHEN f.name = 'CHICKEN BREAST' THEN 3.6
        WHEN f.name = 'SALMON' THEN 13.4
        WHEN f.name = 'EGGS' THEN 11.0
        WHEN f.name = 'TURKEY BREAST' THEN 1.0
        WHEN f.name = 'TUNA' THEN 2.8
        WHEN f.name = 'Fish, tuna salad' THEN 9.3
        WHEN f.name = 'SHRIMP' THEN 0.3
        WHEN f.name = 'TOFU' THEN 6.0
        WHEN f.name = 'BROWN RICE' THEN 2.9
        WHEN f.name = 'OATS' THEN 6.9
        WHEN f.name = 'QUINOA' THEN 6.1
        WHEN f.name = 'SWEET POTATO' THEN 0.1
        WHEN f.name = 'WHOLE WHEAT BREAD' THEN 4.2
        WHEN f.name = 'BANANA' THEN 0.3
        WHEN f.name = 'APPLE' THEN 0.2
        WHEN f.name = 'BLUEBERRIES' THEN 0.3
        WHEN f.name = 'SPINACH' THEN 0.4
        WHEN f.name = 'BROCCOLI' THEN 0.4
        WHEN f.name = 'ALMONDS' THEN 49.9
        WHEN f.name = 'WALNUTS' THEN 65.2
        WHEN f.name = 'OLIVE OIL' THEN 100.0
        WHEN f.name = 'Avocado dressing' THEN 43.3
        WHEN f.name = 'Avocado, raw' THEN 14.7
        WHEN f.name = 'PEANUT BUTTER' THEN 50.4
        WHEN f.name = 'MILK' THEN 3.3
        WHEN f.name = 'CHEESE' THEN 33.1
        WHEN f.name = 'BUTTER' THEN 81.1
        WHEN f.name = 'PASTA' THEN 1.5
        WHEN f.name = 'Potato patty' THEN 11.3
        WHEN f.name = 'Soup, potato' THEN 4.7
        WHEN f.name = 'CARROTS' THEN 0.2
        WHEN f.name = 'Onions, raw' THEN 0.1
        WHEN f.name = 'Bread, onion' THEN 3.0
        WHEN f.name = 'TOMATOES' THEN 0.2
        WHEN f.name = 'Lettuce, raw' THEN 0.2
        WHEN f.name = 'Lettuce, cooked' THEN 3.1
        WHEN f.name = 'GARLIC' THEN 0.5
            END
            );
        END IF;
    END LOOP;
END $$;

-- Verify results
SELECT COUNT(*) as new_foods_added FROM foods;
SELECT category, COUNT(*) as count FROM foods GROUP BY category ORDER BY count DESC;

-- Summary: 37 high-quality foods from USDA database