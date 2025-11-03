-- =============================================================================
-- FELONY FITNESS APP - COMPLETE FOUNDATION SCHEMA
-- =============================================================================
-- Date: November 3, 2025
-- Purpose: Clean slate rebuild with comprehensive schema design
-- Features: Core fitness app + messaging system + extensible architecture
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- CORE IDENTITY & USER MANAGEMENT
-- =============================================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For backward compatibility
    email VARCHAR(255), -- Denormalized for easier queries
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other')),
    
    -- Fitness profile
    height_cm INTEGER,
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
    fitness_goal VARCHAR(50) CHECK (fitness_goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_endurance')),
    
    -- Nutrition preferences
    diet_preference VARCHAR(50),
    daily_calorie_goal INTEGER,
    daily_protein_goal_g DECIMAL(6,2),
    daily_carb_goal_g DECIMAL(6,2),
    daily_fat_goal_g DECIMAL(6,2),
    daily_water_goal_oz INTEGER,
    
    -- App preferences
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROLE & PERMISSION SYSTEM
-- =============================================================================

-- Tags for user roles and categorization
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-tag relationships (many-to-many)
CREATE TABLE IF NOT EXISTS user_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id), -- Who assigned this tag
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tag_id)
);

-- Trainer-client relationships
CREATE TABLE IF NOT EXISTS trainer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'blocked')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trainer_id, client_id)
);

-- =============================================================================
-- MESSAGING SYSTEM
-- =============================================================================

-- Direct messages between users
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FITNESS DATA STRUCTURE
-- =============================================================================

-- Muscle groups hierarchy
CREATE TABLE IF NOT EXISTS muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_muscle_group_id UUID REFERENCES muscle_groups(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise library
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Categorization
    primary_muscle_group_id UUID REFERENCES muscle_groups(id),
    secondary_muscle_group_id UUID REFERENCES muscle_groups(id),
    tertiary_muscle_group_id UUID REFERENCES muscle_groups(id),
    
    -- Exercise properties
    equipment VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    is_bodyweight BOOLEAN DEFAULT FALSE,
    exercise_type VARCHAR(20) CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance')),
    
    -- Media
    thumbnail_url TEXT,
    video_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise-muscle group relationships (many-to-many for complex exercises)
CREATE TABLE IF NOT EXISTS exercise_muscle_groups (
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
    involvement_type VARCHAR(20) CHECK (involvement_type IN ('primary', 'secondary', 'stabilizer')),
    PRIMARY KEY (exercise_id, muscle_group_id)
);

-- User workout routines
CREATE TABLE IF NOT EXISTS workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Routine properties
    estimated_duration_minutes INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    routine_type VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises within routines
CREATE TABLE IF NOT EXISTS routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID REFERENCES workout_routines(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Exercise parameters
    sets INTEGER NOT NULL DEFAULT 1,
    reps VARCHAR(20), -- Can be "8-12", "AMRAP", etc.
    weight_kg DECIMAL(6,2),
    rest_seconds INTEGER,
    notes TEXT,
    
    -- Ordering
    exercise_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES workout_routines(id) ON DELETE SET NULL,
    
    -- Workout details
    workout_name VARCHAR(255),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Performance metrics
    total_volume_kg DECIMAL(10,2),
    total_reps INTEGER,
    calories_burned INTEGER,
    
    -- Status and notes
    is_complete BOOLEAN DEFAULT FALSE,
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual exercise sets within workout logs
CREATE TABLE IF NOT EXISTS workout_log_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Set details
    set_number INTEGER NOT NULL,
    reps_completed INTEGER,
    weight_lifted_kg DECIMAL(6,2),
    duration_seconds INTEGER, -- For time-based exercises
    distance_meters DECIMAL(8,2), -- For cardio
    
    -- Performance notes
    rpe_rating INTEGER CHECK (rpe_rating BETWEEN 1 AND 10), -- Rate of Perceived Exertion
    notes TEXT,
    completed BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- NUTRITION SYSTEM
-- =============================================================================

-- Food database
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    
    -- Data quality
    data_sources TEXT[], -- Track where data came from
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food serving sizes and nutrition info
CREATE TABLE IF NOT EXISTS food_servings (
    id SERIAL PRIMARY KEY,
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    serving_description VARCHAR(255) NOT NULL, -- "1 cup", "100g", etc.
    
    -- Macronutrients per serving
    calories DECIMAL(8,2),
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg DECIMAL(8,2),
    
    -- Additional nutrients
    calcium_mg DECIMAL(8,2),
    iron_mg DECIMAL(8,2),
    vitamin_c_mg DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User nutrition logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Food reference
    food_id INTEGER REFERENCES foods(id) ON DELETE SET NULL,
    food_serving_id INTEGER REFERENCES food_servings(id) ON DELETE SET NULL,
    
    -- Log details
    quantity_consumed DECIMAL(8,2) NOT NULL DEFAULT 1,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Custom food support
    custom_food_name VARCHAR(255), -- If food_id is null
    custom_calories DECIMAL(8,2),
    custom_protein_g DECIMAL(6,2),
    custom_carbs_g DECIMAL(6,2),
    custom_fat_g DECIMAL(6,2),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MEAL PLANNING SYSTEM
-- =============================================================================

-- User-created meals
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Meal properties
    category VARCHAR(100), -- "breakfast", "dinner", "snack", etc.
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    serving_size INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Instructions and media
    instructions TEXT,
    image_url TEXT,
    
    -- Status
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods within meals (recipes)
CREATE TABLE IF NOT EXISTS meal_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    food_serving_id INTEGER REFERENCES food_servings(id) ON DELETE CASCADE,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly meal plans
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    
    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual meal plan entries
CREATE TABLE IF NOT EXISTS meal_plan_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_meal_plan_id UUID REFERENCES weekly_meal_plans(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    
    -- Scheduling
    plan_date DATE NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    servings DECIMAL(4,2) DEFAULT 1,
    
    -- Status
    is_logged BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TRAINING PROGRAMS & MESOCYCLES
-- =============================================================================

-- Long-term training programs (macrocycles)
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Program properties
    total_weeks INTEGER,
    program_type VARCHAR(50), -- "strength", "hypertrophy", "endurance", etc.
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training mesocycles (4-8 week blocks)
CREATE TABLE IF NOT EXISTS mesocycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    focus VARCHAR(100), -- "strength", "hypertrophy", "deload", etc.
    
    -- Cycle properties
    weeks INTEGER NOT NULL,
    cycle_order INTEGER,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual training sessions within mesocycles
CREATE TABLE IF NOT EXISTS cycle_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesocycle_id UUID REFERENCES mesocycles(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES workout_routines(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session scheduling
    week_index INTEGER NOT NULL,
    day_index INTEGER,
    scheduled_date DATE NOT NULL,
    
    -- Session properties
    session_type VARCHAR(50), -- "workout", "rest", "deload", "test"
    planned_intensity DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Status
    is_complete BOOLEAN DEFAULT FALSE,
    actual_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert essential tags
INSERT INTO tags (name, description, color) VALUES 
('User', 'Regular app user', '#3B82F6'),
('Trainer', 'Fitness trainer', '#10B981'),
('Client', 'Training client', '#F59E0B'),
('Admin', 'System administrator', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Insert basic muscle groups
INSERT INTO muscle_groups (name, description) VALUES 
('Chest', 'Pectoral muscles'),
('Back', 'Latissimus dorsi, rhomboids, trapezius'),
('Shoulders', 'Deltoids'),
('Arms', 'Biceps, triceps, forearms'),
('Legs', 'Quadriceps, hamstrings, calves'),
('Glutes', 'Gluteal muscles'),
('Core', 'Abdominals, obliques'),
('Full Body', 'Multi-muscle compound movements')
ON CONFLICT (name) DO NOTHING;

-- Insert basic exercises
INSERT INTO exercises (name, primary_muscle_group_id, is_bodyweight, description, exercise_type) VALUES 
('Push-up', (SELECT id FROM muscle_groups WHERE name = 'Chest'), true, 'Basic bodyweight chest exercise', 'strength'),
('Pull-up', (SELECT id FROM muscle_groups WHERE name = 'Back'), true, 'Bodyweight back exercise', 'strength'),
('Squat', (SELECT id FROM muscle_groups WHERE name = 'Legs'), true, 'Basic leg exercise', 'strength'),
('Plank', (SELECT id FROM muscle_groups WHERE name = 'Core'), true, 'Core stability exercise', 'strength');

-- Add unique constraint on exercise name after inserting
ALTER TABLE exercises ADD CONSTRAINT exercises_name_unique UNIQUE (name);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);

-- Workout logs
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_workout_log_entries_log_id ON workout_log_entries(log_id);

-- Nutrition logs
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);

-- Foods search
CREATE INDEX IF NOT EXISTS idx_foods_name_gin ON foods USING gin (name gin_trgm_ops);

-- Training programs
CREATE INDEX IF NOT EXISTS idx_mesocycles_user_active ON mesocycles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cycle_sessions_date ON cycle_sessions(scheduled_date);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_sessions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own routines" ON workout_routines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own workout logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own meal plans" ON weekly_meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own training programs" ON training_programs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own mesocycles" ON mesocycles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own cycle sessions" ON cycle_sessions FOR ALL USING (auth.uid() = user_id);

-- Message policies (can send/receive messages)
CREATE POLICY "Users can send messages" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view their messages" ON direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can update messages they sent" ON direct_messages FOR UPDATE USING (auth.uid() = sender_id);

-- Trainer-client relationship policies
CREATE POLICY "Users can view their relationships" ON trainer_clients FOR SELECT USING (auth.uid() = trainer_id OR auth.uid() = client_id);
CREATE POLICY "Trainers can manage client relationships" ON trainer_clients FOR ALL USING (auth.uid() = trainer_id);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_routines_updated_at BEFORE UPDATE ON workout_routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direct_messages_updated_at BEFORE UPDATE ON direct_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainer_clients_updated_at BEFORE UPDATE ON trainer_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_meal_plans_updated_at BEFORE UPDATE ON weekly_meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mesocycles_updated_at BEFORE UPDATE ON mesocycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cycle_sessions_updated_at BEFORE UPDATE ON cycle_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

SELECT 'Fresh Felony Fitness Foundation Complete! 🚀' as status,
       'All tables, indexes, policies, and seed data created successfully' as message;
