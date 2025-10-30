-- Fix log_food_item function signature to match app expectations
-- This migration ensures the function can be called with named parameters in any order

-- Drop existing function versions to avoid signature conflicts
DROP FUNCTION IF EXISTS log_food_item(jsonb, integer, varchar, numeric, varchar, varchar);
DROP FUNCTION IF EXISTS log_food_item(uuid, text, numeric, integer, jsonb);

-- Create the fixed log_food_item function with proper parameter handling
CREATE OR REPLACE FUNCTION log_food_item(
  p_user_id uuid DEFAULT NULL,
  p_meal_type text DEFAULT 'Snack',
  p_quantity_consumed numeric DEFAULT 1.0,
  p_food_serving_id integer DEFAULT NULL,
  p_external_food jsonb DEFAULT NULL,
  p_log_date text DEFAULT NULL
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
    
    -- Check for potential duplicates (but don't block, just warn)
    IF EXISTS (
      SELECT 1 FROM foods 
      WHERE similarity(name, p_external_food->>'name') > 0.8
      LIMIT 1
    ) THEN
      -- Log warning but continue processing
      RAISE NOTICE 'Potential duplicate food detected: %', p_external_food->>'name';
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
      COALESCE(p_external_food->>'serving_description', '1 serving'),
      LEAST(COALESCE((p_external_food->>'calories')::numeric, 0), 2000), -- Cap at 2000 calories
      LEAST(COALESCE((p_external_food->>'protein_g')::numeric, 0), 100), -- Cap at 100g protein
      LEAST(COALESCE((p_external_food->>'carbs_g')::numeric, 0), 200),   -- Cap at 200g carbs
      LEAST(COALESCE((p_external_food->>'fat_g')::numeric, 0), 100)     -- Cap at 100g fat
    )
    RETURNING id INTO v_serving_id;
  ELSE
    -- Use existing serving
    v_serving_id := p_food_serving_id;
    SELECT food_id INTO v_food_id FROM food_servings WHERE id = v_serving_id;
    
    IF v_food_id IS NULL THEN
      RETURN jsonb_build_object('error', 'Food serving not found');
    END IF;
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