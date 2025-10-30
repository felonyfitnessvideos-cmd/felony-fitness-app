-- Migration: Enhanced food data quality and AI guardrails
-- Created: 2025-01-29

-- Drop existing log_food_item function to replace with enhanced version
DROP FUNCTION IF EXISTS log_food_item(jsonb, integer, varchar, varchar, numeric, varchar);
DROP FUNCTION IF EXISTS log_food_item(jsonb, integer, varchar, numeric, varchar);

-- Create enhanced log_food_item function with guardrails
CREATE OR REPLACE FUNCTION log_food_item(
  p_external_food jsonb DEFAULT NULL,
  p_food_serving_id integer DEFAULT NULL,
  p_meal_type varchar DEFAULT 'Snack',
  p_quantity_consumed numeric DEFAULT 1.0,
  p_user_id varchar DEFAULT NULL,
  p_log_date varchar DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_food_id integer;
  v_serving_id integer;
  v_log_date date;
  v_validation_result jsonb;
  v_category_suggestion text;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User ID is required');
  END IF;
  
  IF p_food_serving_id IS NULL AND p_external_food IS NULL THEN
    RETURN jsonb_build_object('error', 'Either food_serving_id or external_food must be provided');
  END IF;

  -- Set log date
  v_log_date := CASE 
    WHEN p_log_date IS NOT NULL THEN p_log_date::date 
    ELSE CURRENT_DATE 
  END;

  -- Handle external food with validation
  IF p_external_food IS NOT NULL THEN
    -- Validate nutritional data
    v_validation_result := validate_nutrition_data(p_external_food);
    IF v_validation_result->>'valid' = 'false' THEN
      RETURN jsonb_build_object(
        'error', 'Nutritional data validation failed',
        'details', v_validation_result->>'errors'
      );
    END IF;

    -- Suggest/validate category
    v_category_suggestion := suggest_food_category(p_external_food->>'name');
    
    -- Check for potential duplicates
    IF EXISTS (
      SELECT 1 FROM foods 
      WHERE similarity(name, p_external_food->>'name') > 0.8
      LIMIT 1
    ) THEN
      RETURN jsonb_build_object(
        'warning', 'Potential duplicate food detected',
        'suggested_action', 'Review existing foods before adding'
      );
    END IF;

    -- Insert new food with validated category
    INSERT INTO foods (name, category) 
    VALUES (
      p_external_food->>'name',
      COALESCE(v_category_suggestion, p_external_food->>'category', 'Grains, Bread & Pasta')
    )
    RETURNING id INTO v_food_id;

    -- Insert serving with validated data
    INSERT INTO food_servings (
      food_id, 
      serving_description, 
      calories, 
      protein_g, 
      carbs_g, 
      fat_g
    ) VALUES (
      v_food_id,
      p_external_food->>'serving_description',
      LEAST((p_external_food->>'calories')::numeric, 2000), -- Cap at 2000 calories
      LEAST((p_external_food->>'protein_g')::numeric, 100), -- Cap at 100g protein
      LEAST((p_external_food->>'carbs_g')::numeric, 200),   -- Cap at 200g carbs
      LEAST((p_external_food->>'fat_g')::numeric, 100)     -- Cap at 100g fat
    )
    RETURNING id INTO v_serving_id;
  ELSE
    -- Use existing serving
    v_serving_id := p_food_serving_id;
    SELECT food_id INTO v_food_id FROM food_servings WHERE id = v_serving_id;
  END IF;

  -- Log the food consumption
  INSERT INTO nutrition_logs (
    user_id, 
    food_id, 
    food_serving_id, 
    meal_type, 
    quantity_consumed, 
    log_date,
    created_at
  ) VALUES (
    p_user_id, 
    v_food_id, 
    v_serving_id, 
    p_meal_type, 
    LEAST(p_quantity_consumed, 20.0), -- Cap quantity at 20 servings
    v_log_date,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'food_id', v_food_id,
    'serving_id', v_serving_id,
    'quality_score', CASE 
      WHEN p_external_food IS NOT NULL THEN 'ai_generated'
      ELSE 'verified'
    END
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', 'Database error occurred',
    'details', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create nutrition validation function
CREATE OR REPLACE FUNCTION validate_nutrition_data(food_data jsonb) 
RETURNS jsonb AS $$
DECLARE
  v_calories numeric;
  v_protein numeric;
  v_carbs numeric;
  v_fat numeric;
  v_estimated_calories numeric;
  v_errors text[] := '{}';
BEGIN
  -- Extract values
  v_calories := COALESCE((food_data->>'calories')::numeric, 0);
  v_protein := COALESCE((food_data->>'protein_g')::numeric, 0);
  v_carbs := COALESCE((food_data->>'carbs_g')::numeric, 0);
  v_fat := COALESCE((food_data->>'fat_g')::numeric, 0);

  -- Validate ranges
  IF v_calories < 0 OR v_calories > 2000 THEN
    v_errors := array_append(v_errors, 'Calories out of range (0-2000)');
  END IF;
  
  IF v_protein < 0 OR v_protein > 100 THEN
    v_errors := array_append(v_errors, 'Protein out of range (0-100g)');
  END IF;
  
  IF v_carbs < 0 OR v_carbs > 200 THEN
    v_errors := array_append(v_errors, 'Carbs out of range (0-200g)');
  END IF;
  
  IF v_fat < 0 OR v_fat > 100 THEN
    v_errors := array_append(v_errors, 'Fat out of range (0-100g)');
  END IF;

  -- Calorie consistency check
  v_estimated_calories := (v_carbs * 4) + (v_protein * 4) + (v_fat * 9);
  IF v_calories > 0 AND ABS(v_estimated_calories - v_calories) > (v_calories * 0.3) THEN
    v_errors := array_append(v_errors, 
      format('Calorie inconsistency: %s calories vs estimated %s', v_calories, v_estimated_calories)
    );
  END IF;

  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', v_errors,
    'estimated_calories', v_estimated_calories
  );
END;
$$ LANGUAGE plpgsql;

-- Create category suggestion function
CREATE OR REPLACE FUNCTION suggest_food_category(food_name text) 
RETURNS text AS $$
DECLARE
  v_name text := lower(food_name);
BEGIN
  -- Category rules based on primary ingredient
  IF v_name ~ '(chicken|beef|pork|turkey|meat|steak)' THEN
    RETURN 'Meat & Poultry';
  ELSIF v_name ~ '(fish|salmon|tuna|shrimp|crab|seafood)' THEN
    RETURN 'Seafood';
  ELSIF v_name ~ '(milk|cheese|yogurt|egg|dairy)' THEN
    RETURN 'Dairy & Eggs';
  ELSIF v_name ~ '(rice|bread|pasta|oats|cereal|grain|chip)' THEN
    RETURN 'Grains, Bread & Pasta';
  ELSIF v_name ~ '(protein|whey|casein|supplement)' THEN
    RETURN 'Protein & Supplements';
  ELSIF v_name ~ '(apple|banana|orange|berry|fruit)' THEN
    RETURN 'Fruits';
  ELSIF v_name ~ '(broccoli|spinach|carrot|vegetable)' THEN
    RETURN 'Vegetables';
  ELSIF v_name ~ '(coffee|tea|water|juice|drink|beverage)' THEN
    RETURN 'Beverages';
  ELSIF v_name ~ '(cake|cookie|candy|chocolate|sweet|dessert)' THEN
    RETURN 'Desserts & Sweets';
  ELSE
    RETURN 'Grains, Bread & Pasta'; -- Default
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to find potential duplicates
CREATE OR REPLACE FUNCTION find_duplicate_foods(search_name text, similarity_threshold float DEFAULT 0.8)
RETURNS TABLE(food_id integer, food_name text, similarity_score float) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    similarity(f.name, search_name) as sim_score
  FROM foods f
  WHERE similarity(f.name, search_name) > similarity_threshold
  ORDER BY sim_score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for similarity functions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON foods USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_food_servings_nutrition ON food_servings(calories, protein_g, carbs_g, fat_g) WHERE calories IS NOT NULL;