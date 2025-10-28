-- Add authorization checks to SECURITY DEFINER functions
-- This migration adds proper user ownership validation to database functions

-- Update get_meal_nutrition function to include authorization check
CREATE OR REPLACE FUNCTION get_meal_nutrition(meal_uuid UUID)
RETURNS TABLE (
    calories DECIMAL,
    protein DECIMAL,
    carbs DECIMAL,
    fat DECIMAL,
    fiber DECIMAL,
    sugar DECIMAL
) AS $$
BEGIN
    -- Verify the meal is accessible to the user (owned by user or is premade)
    IF NOT EXISTS (
        SELECT 1 FROM meals 
        WHERE id = meal_uuid 
        AND (user_id = auth.uid() OR is_premade = true)
    ) THEN
        RAISE EXCEPTION 'Meal not found or access denied';
    END IF;

    RETURN QUERY
    SELECT 
        COALESCE(SUM((fs.calories * mf.quantity)), 0) as calories,
        COALESCE(SUM((fs.protein * mf.quantity)), 0) as protein,
        COALESCE(SUM((fs.carbs * mf.quantity)), 0) as carbs,
        COALESCE(SUM((fs.fat * mf.quantity)), 0) as fat,
        COALESCE(SUM((fs.fiber * mf.quantity)), 0) as fiber,
        COALESCE(SUM((fs.sugar * mf.quantity)), 0) as sugar
    FROM meal_foods mf
    JOIN food_servings fs ON fs.id = mf.food_servings_id
    WHERE mf.meal_id = meal_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_daily_meal_plan_nutrition function to include authorization check
CREATE OR REPLACE FUNCTION get_daily_meal_plan_nutrition(plan_uuid UUID, target_date DATE)
RETURNS TABLE (
    calories DECIMAL,
    protein DECIMAL,
    carbs DECIMAL,
    fat DECIMAL,
    fiber DECIMAL,
    sugar DECIMAL
) AS $$
BEGIN
    -- Verify the meal plan belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM weekly_meal_plans 
        WHERE id = plan_uuid AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Meal plan not found or access denied';
    END IF;

    RETURN QUERY
    WITH meal_nutrition AS (
        SELECT 
            mpe.servings,
            (SELECT calories FROM get_meal_nutrition(mpe.meal_id)) as meal_calories,
            (SELECT protein FROM get_meal_nutrition(mpe.meal_id)) as meal_protein,
            (SELECT carbs FROM get_meal_nutrition(mpe.meal_id)) as meal_carbs,
            (SELECT fat FROM get_meal_nutrition(mpe.meal_id)) as meal_fat,
            (SELECT fiber FROM get_meal_nutrition(mpe.meal_id)) as meal_fiber,
            (SELECT sugar FROM get_meal_nutrition(mpe.meal_id)) as meal_sugar
        FROM meal_plan_entries mpe
        WHERE mpe.weekly_meal_plan_id = plan_uuid 
        AND mpe.plan_date = target_date
    )
    SELECT 
        COALESCE(SUM(meal_calories * servings), 0) as calories,
        COALESCE(SUM(meal_protein * servings), 0) as protein,
        COALESCE(SUM(meal_carbs * servings), 0) as carbs,
        COALESCE(SUM(meal_fat * servings), 0) as fat,
        COALESCE(SUM(meal_fiber * servings), 0) as fiber,
        COALESCE(SUM(meal_sugar * servings), 0) as sugar
    FROM meal_nutrition;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_meal_nutrition(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_meal_plan_nutrition(UUID, DATE) TO authenticated;