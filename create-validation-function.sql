-- Create validation function via SQL
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