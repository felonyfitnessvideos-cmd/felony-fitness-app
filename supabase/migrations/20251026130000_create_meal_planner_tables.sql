-- Create meal planner tables

-- Table for storing individual meals (both user-created and premade)
CREATE TABLE meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- breakfast, lunch, dinner, snack, etc.
    is_premade BOOLEAN DEFAULT false, -- true for system-provided meals
    serving_size DECIMAL(10,2) DEFAULT 1,
    serving_unit VARCHAR(50) DEFAULT 'serving',
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    instructions TEXT,
    image_url TEXT,
    tags TEXT[], -- dietary restrictions, cuisine type, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing foods within each meal
CREATE TABLE meal_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    food_servings_id UUID REFERENCES food_servings(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weekly meal plans
CREATE TABLE weekly_meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false, -- only one active plan per user
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for individual meal plan entries (which meal on which day/time)
CREATE TABLE meal_plan_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    weekly_meal_plan_id UUID REFERENCES weekly_meal_plans(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack1, snack2, etc.
    servings DECIMAL(10,2) DEFAULT 1,
    notes TEXT,
    is_logged BOOLEAN DEFAULT false, -- whether this has been logged to food log
    logged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user's saved meals (favorites/my meals)
CREATE TABLE user_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    custom_name VARCHAR(255), -- user can rename meals
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, meal_id)
);

-- Create indexes for better performance
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_category ON meals(category);
CREATE INDEX idx_meals_is_premade ON meals(is_premade);
CREATE INDEX idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX idx_weekly_meal_plans_user_id ON weekly_meal_plans(user_id);
CREATE INDEX idx_weekly_meal_plans_active ON weekly_meal_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_meal_plan_entries_plan_id ON meal_plan_entries(weekly_meal_plan_id);
CREATE INDEX idx_meal_plan_entries_date ON meal_plan_entries(plan_date);
CREATE INDEX idx_user_meals_user_id ON user_meals(user_id);

-- Create RLS policies
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;

-- Meals policies (users can see their own meals + premade meals)
CREATE POLICY "Users can view their own meals and premade meals" ON meals
    FOR SELECT USING (user_id = auth.uid() OR is_premade = true);

CREATE POLICY "Users can insert their own meals" ON meals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own meals" ON meals
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own meals" ON meals
    FOR DELETE USING (user_id = auth.uid());

-- Meal foods policies
CREATE POLICY "Users can view meal foods for accessible meals" ON meal_foods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND (meals.user_id = auth.uid() OR meals.is_premade = true)
        )
    );

CREATE POLICY "Users can manage meal foods for their own meals" ON meal_foods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meals 
            WHERE meals.id = meal_foods.meal_id 
            AND meals.user_id = auth.uid()
        )
    );

-- Weekly meal plans policies
CREATE POLICY "Users can manage their own weekly meal plans" ON weekly_meal_plans
    FOR ALL USING (user_id = auth.uid());

-- Meal plan entries policies
CREATE POLICY "Users can manage their own meal plan entries" ON meal_plan_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

-- User meals policies
CREATE POLICY "Users can manage their own saved meals" ON user_meals
    FOR ALL USING (user_id = auth.uid());

-- Create functions for meal nutrition calculations
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

-- Create function to get daily meal plan nutrition
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

-- Create function to ensure only one active meal plan per user
CREATE OR REPLACE FUNCTION ensure_single_active_meal_plan()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        -- Deactivate all other meal plans for this user
        UPDATE weekly_meal_plans 
        SET is_active = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_meal_plan
    BEFORE INSERT OR UPDATE ON weekly_meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_meal_plan();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_weekly_meal_plans_updated_at
    BEFORE UPDATE ON weekly_meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();