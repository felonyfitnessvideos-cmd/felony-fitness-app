-- Improve RLS policies with verb-specific WITH CHECK clauses
-- This migration replaces broad FOR ALL policies with specific policies for each operation

-- Drop existing broad policies that don't have proper WITH CHECK validation
DROP POLICY IF EXISTS "Users can manage meal foods for their own meals" ON meal_foods;
DROP POLICY IF EXISTS "Users can manage their own weekly meal plans" ON weekly_meal_plans;
DROP POLICY IF EXISTS "Users can manage their own meal plan entries" ON meal_plan_entries;
DROP POLICY IF EXISTS "Users can manage their own saved meals" ON user_meals;

-- Add the missing WITH CHECK clause to the UPDATE policy for meals
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
CREATE POLICY "Users can update their own meals" ON meals
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create verb-specific policies for meal_foods
CREATE POLICY "Users can insert meal foods for their own meals" ON meal_foods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meal foods for their own meals" ON meal_foods
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meal foods for their own meals" ON meal_foods
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

-- Create verb-specific policies for weekly_meal_plans
CREATE POLICY "Users can insert their own weekly meal plans" ON weekly_meal_plans
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own weekly meal plans" ON weekly_meal_plans
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own weekly meal plans" ON weekly_meal_plans
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can select their own weekly meal plans" ON weekly_meal_plans
    FOR SELECT USING (user_id = auth.uid());

-- Create verb-specific policies for meal_plan_entries
CREATE POLICY "Users can insert their own meal plan entries" ON meal_plan_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can select their own meal plan entries" ON meal_plan_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own meal plan entries" ON meal_plan_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own meal plan entries" ON meal_plan_entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

-- Create verb-specific policies for user_meals (if table exists)
CREATE POLICY "Users can insert their own saved meals" ON user_meals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can select their own saved meals" ON user_meals
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own saved meals" ON user_meals
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved meals" ON user_meals
    FOR DELETE USING (user_id = auth.uid());

-- Add comments to document the policy improvements
COMMENT ON POLICY "Users can update their own meals" ON meals IS 
'Updated to include WITH CHECK clause for proper validation on updates';

COMMENT ON POLICY "Users can insert meal foods for their own meals" ON meal_foods IS 
'Verb-specific policy with proper WITH CHECK validation';

COMMENT ON POLICY "Users can update meal foods for their own meals" ON meal_foods IS 
'Verb-specific policy with both USING and WITH CHECK clauses';

COMMENT ON POLICY "Users can insert their own weekly meal plans" ON weekly_meal_plans IS 
'Replaced broad FOR ALL policy with specific INSERT policy';

COMMENT ON POLICY "Users can update their own weekly meal plans" ON weekly_meal_plans IS 
'Replaced broad FOR ALL policy with specific UPDATE policy including WITH CHECK';

COMMENT ON POLICY "Users can insert their own meal plan entries" ON meal_plan_entries IS 
'Verb-specific policy ensuring entries can only be added to user-owned meal plans';