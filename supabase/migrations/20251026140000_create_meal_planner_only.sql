-- Create meal planner tables only

-- Table for storing individual meals (both user-created and premade)
CREATE TABLE IF NOT EXISTS meals (
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
CREATE TABLE IF NOT EXISTS meal_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    food_servings_id UUID REFERENCES food_servings(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weekly meal plans
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
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
CREATE TABLE IF NOT EXISTS meal_plan_entries (
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
CREATE TABLE IF NOT EXISTS user_meals (
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
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
CREATE INDEX IF NOT EXISTS idx_meals_is_premade ON meals(is_premade);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_user_id ON weekly_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_active ON weekly_meal_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_plan_id ON meal_plan_entries(weekly_meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_date ON meal_plan_entries(plan_date);
CREATE INDEX IF NOT EXISTS idx_user_meals_user_id ON user_meals(user_id);

-- Create RLS policies
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own meals and premade meals" ON meals;
DROP POLICY IF EXISTS "Users can insert their own meals" ON meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON meals;

CREATE POLICY "Users can view their own meals and premade meals" ON meals
    FOR SELECT USING (user_id = auth.uid() OR is_premade = true);

CREATE POLICY "Users can insert their own meals" ON meals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own meals" ON meals
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own meals" ON meals
    FOR DELETE USING (user_id = auth.uid());

-- Meal foods policies
DROP POLICY IF EXISTS "Users can view meal foods for accessible meals" ON meal_foods;
DROP POLICY IF EXISTS "Users can manage meal foods for their own meals" ON meal_foods;

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
DROP POLICY IF EXISTS "Users can manage their own weekly meal plans" ON weekly_meal_plans;
CREATE POLICY "Users can manage their own weekly meal plans" ON weekly_meal_plans
    FOR ALL USING (user_id = auth.uid());

-- Meal plan entries policies
DROP POLICY IF EXISTS "Users can manage their own meal plan entries" ON meal_plan_entries;
CREATE POLICY "Users can manage their own meal plan entries" ON meal_plan_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM weekly_meal_plans 
            WHERE weekly_meal_plans.id = meal_plan_entries.weekly_meal_plan_id 
            AND weekly_meal_plans.user_id = auth.uid()
        )
    );

-- User meals policies
DROP POLICY IF EXISTS "Users can manage their own saved meals" ON user_meals;
CREATE POLICY "Users can manage their own saved meals" ON user_meals
    FOR ALL USING (user_id = auth.uid());