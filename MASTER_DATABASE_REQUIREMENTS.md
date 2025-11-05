# FELONY FITNESS - MASTER DATABASE REQUIREMENTS DOCUMENT
## Complete Application Schema Audit & Blueprint

*Generated: November 3, 2025*
*Purpose: Comprehensive audit of all database dependencies across the entire application*

---

## EXECUTIVE SUMMARY
This document catalogs every table, column, function, policy, and relationship that the Felony Fitness application expects to exist in the database. It serves as the single source of truth for creating a complete, working database schema.

---

## 🏗️ DATABASE ARCHITECTURE REQUIREMENTS

### CORE TABLES DISCOVERED

#### 1. AUTHENTICATION & USER MANAGEMENT
**Tables Found:**
- `user_profiles` - Core user information and settings
- `user_tags` - User role/permission tagging system

#### 2. NUTRITION SYSTEM  
**Tables Found:**
- `nutrition_logs` - Food and water consumption tracking
- `food_servings` - Food items with nutrition data
- `foods` - Food catalog (referenced but may not exist)

#### 3. WORKOUT & TRAINING SYSTEM
**Tables Found:**
- `workout_logs` - Exercise session tracking
- `exercises` - Exercise database
- `muscle_groups` - Anatomical muscle targeting
- `routines` - Workout routines

#### 4. MESOCYCLE SYSTEM
**Tables Found:**
- `mesocycles` - Training program periodization
- `mesocycle_sessions` - Individual workout sessions

#### 5. SOCIAL & TRAINER SYSTEM
**Tables Found:**
- `trainer_clients` - Trainer-client relationships
- `direct_messages` - Messaging system

---

## 📄 COMPLETE DATABASE REQUIREMENTS ANALYSIS

### 🗃️ ALL TABLES DISCOVERED

#### **USER MANAGEMENT & PROFILES**
```sql
-- CRITICAL: These are the core user tables
user_profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  dob DATE,
  sex TEXT,
  diet_preference TEXT,
  daily_calorie_goal INTEGER,
  daily_protein_goal_g DECIMAL(6,2),  -- NOTE: Found inconsistency - also referenced as daily_protein_goal
  daily_carb_goal DECIMAL(6,2),
  daily_fat_goal DECIMAL(6,2),
  daily_water_goal_oz INTEGER,
  google_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  weight_lbs DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
)

user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  tag_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  -- Additional goal columns discovered
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### **NUTRITION SYSTEM**
```sql
-- CRITICAL: Core nutrition tables
nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  food_serving_id UUID REFERENCES food_servings(id),
  meal_type TEXT,  -- 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Water'
  quantity_consumed DECIMAL(8,2),
  water_oz_consumed DECIMAL(6,2),
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
)

food_servings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  serving_description TEXT,
  calories DECIMAL(8,2),
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  sugar_g DECIMAL(6,2),
  sodium_mg DECIMAL(8,2),
  calcium_mg DECIMAL(8,2),
  iron_mg DECIMAL(8,2),
  vitamin_c_mg DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT NOW()
)

foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  data_sources TEXT,
  quality_score INTEGER,
  enrichment_status TEXT,
  last_enrichment TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- MEAL PLANNING SYSTEM
meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id),
  food_id UUID REFERENCES foods(id),
  serving_size TEXT,
  quantity DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT NOW()
)

user_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  meal_id UUID REFERENCES meals(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- PIPELINE TABLES
nutrition_pipeline_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

nutrition_enrichment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id),
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### **WORKOUT & EXERCISE SYSTEM**
```sql
-- CRITICAL: Exercise database
muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  body_region TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group_id UUID REFERENCES muscle_groups(id),
  category TEXT,  -- 'Free Weight', 'Machine', 'Bodyweight'
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- ROUTINE SYSTEM
workout_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  routine_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES workout_routines(id),
  exercise_id UUID REFERENCES exercises(id),
  target_sets INTEGER,
  exercise_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

-- WORKOUT LOGGING
workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  routine_id UUID REFERENCES workout_routines(id),
  is_complete BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

workout_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES workout_logs(id),
  exercise_id UUID REFERENCES exercises(id),
  set_number INTEGER,
  reps INTEGER,
  weight_lbs DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
)

programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### **MESOCYCLE SYSTEM**
```sql
-- CRITICAL: Periodization system
mesocycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

cycle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesocycle_id UUID REFERENCES mesocycles(id),
  user_id UUID REFERENCES user_profiles(id),
  routine_id UUID REFERENCES workout_routines(id),
  scheduled_date DATE,
  is_deload BOOLEAN DEFAULT FALSE,
  planned_volume_multiplier DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT NOW()
)

mesocycle_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesocycle_id UUID REFERENCES mesocycles(id),
  week_number INTEGER,
  deload BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### **SOCIAL & COMMUNICATION SYSTEM**
```sql
-- CRITICAL: Trainer-client system
trainer_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES user_profiles(id),
  client_id UUID REFERENCES user_profiles(id),
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
)

direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES user_profiles(id),
  recipient_id UUID REFERENCES user_profiles(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)

profiles (
  -- NOTE: This might be a duplicate of user_profiles
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### **SCHEDULING SYSTEM**
```sql
scheduled_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  routine_id UUID REFERENCES workout_routines(id),
  scheduled_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### 🔧 DATABASE FUNCTIONS REQUIRED

#### **NUTRITION FUNCTIONS**
```sql
-- CRITICAL: Core nutrition functions
get_random_tip() RETURNS TABLE(tip TEXT, category TEXT)
log_food_item(
  p_external_food JSONB DEFAULT NULL,
  p_food_serving_id UUID DEFAULT NULL,
  p_meal_type TEXT DEFAULT 'Snack',
  p_quantity_consumed DECIMAL DEFAULT 1.0,
  p_user_id UUID DEFAULT NULL,
  p_log_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB

-- PIPELINE FUNCTIONS
get_enrichment_status() RETURNS TABLE(...)
get_quality_distribution() RETURNS TABLE(...)
```

#### **USER & ROLE FUNCTIONS**
```sql
-- CRITICAL: User management functions
get_user_tags(target_user_id UUID DEFAULT NULL) RETURNS TABLE(...)
get_conversations() RETURNS TABLE(...)
```

---

### � ROW LEVEL SECURITY POLICIES NEEDED

#### **USER DATA PROTECTION**
```sql
-- All user tables need RLS policies
POLICY "Users can only see own data" ON user_profiles FOR SELECT USING (auth.uid() = id);
POLICY "Users can only see own nutrition logs" ON nutrition_logs FOR SELECT USING (auth.uid() = user_id);
POLICY "Users can only see own workout logs" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
POLICY "Users can only see own mesocycles" ON mesocycles FOR SELECT USING (auth.uid() = user_id);

-- Public data
POLICY "Anyone can view food servings" ON food_servings FOR SELECT TO authenticated USING (true);
POLICY "Anyone can view exercises" ON exercises FOR SELECT TO authenticated USING (true);
POLICY "Anyone can view muscle groups" ON muscle_groups FOR SELECT TO authenticated USING (true);

-- Trainer-client relationships
POLICY "Trainers can see client data" ON user_profiles FOR SELECT TO authenticated USING (...);
```

---

### ⚠️ CRITICAL INCONSISTENCIES FOUND

1. **Column Name Conflicts:**
   - `daily_protein_goal_g` vs `daily_protein_goal` (used interchangeably)
   - `food_servings_id` vs `food_serving_id` in nutrition_logs

2. **Missing Table Relationships:**
   - `foods` table referenced but might not exist in current schema
   - `profiles` vs `user_profiles` confusion

3. **Function Dependencies:**
   - Many Edge Functions expect database functions that don't exist
   - RPC calls failing due to missing functions

---

### 🎯 NEXT STEPS

1. **Create Master Migration:** Build single migration with ALL tables above
2. **Resolve Inconsistencies:** Standardize column names and relationships
3. **Add Missing Functions:** Implement all required database functions
4. **Test Complete Workflows:** Verify every page works end-to-end
