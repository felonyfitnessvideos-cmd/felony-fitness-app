# Performance Optimization Plan

**Project:** Felony Fitness App  
**Date Created:** December 13, 2025  
**Goal:** Move computations to backend, optimize database, reduce frontend load

---

## 🎯 Overall Strategy

### Phase 1: Frontend → Backend Migration (Week 1)

Move computation-heavy operations from client-side JavaScript to database/Edge Functions

### Phase 2: Database Optimization (Week 1-2)

Streamline tables, optimize indexes, reduce bloat, tackle heavy queries

### Phase 3: Caching & Bundle Optimization (Week 2)

Implement caching layer and reduce frontend bundle size

### Phase 4: Testing & Validation (Week 2)

Performance testing, validation, and monitoring setup

---

## 🔴 HIGH PRIORITY OPTIMIZATIONS

### 1. **Dashboard Daily Nutrition Totals**

**Current:** Client-side aggregation of 10-50 nutrition log entries  
**Impact:** 600ms → 250ms (58% faster)  
**Complexity:** Medium (3-4 hours)

**Problem:**

```javascript
// DashboardPage.jsx lines 191-206
const dailyNutrition = logs.reduce(
  (acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein_g: acc.protein_g + (log.protein_g || 0),
    carbs_g: acc.carbs_g + (log.carbs_g || 0),
    fat_g: acc.fat_g + (log.fat_g || 0),
  }),
  { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
);
```

**Solution:** Database view with pre-aggregated daily totals

```sql
CREATE OR REPLACE VIEW daily_nutrition_totals AS
SELECT
  user_id,
  log_date,
  SUM(calories * quantity_consumed) as total_calories,
  SUM(protein_g * quantity_consumed) as total_protein_g,
  SUM(carbs_g * quantity_consumed) as total_carbs_g,
  SUM(fat_g * quantity_consumed) as total_fat_g,
  SUM(fiber_g * quantity_consumed) as total_fiber_g,
  SUM(sugar_g * quantity_consumed) as total_sugar_g,
  COUNT(*) as entry_count,
  MAX(created_at) as last_entry_time
FROM nutrition_logs
WHERE food_serving_id IS NOT NULL
GROUP BY user_id, log_date;
```

**RLS Policy:**

```sql
CREATE POLICY "Users can view own daily nutrition totals"
  ON daily_nutrition_totals FOR SELECT
  USING (auth.uid() = user_id);
```

**Frontend Change:**

```javascript
// Before: Fetch all logs and reduce
const { data: logs } = await supabase
  .from("nutrition_logs")
  .select("*")
  .eq("user_id", user.id)
  .eq("log_date", today);

// After: Fetch pre-aggregated totals
const { data: dailyTotals } = await supabase
  .from("daily_nutrition_totals")
  .select("*")
  .eq("log_date", today)
  .single();
```

---

### 2. **Nutrition Log Daily Totals**

**Current:** Client-side reduce over 20-30 entries  
**Impact:** 300ms → 80ms (73% faster)  
**Complexity:** Low (1-2 hours) - Uses same view as #1

**Implementation:** Same database view as Dashboard (#1 above)

---

### 3. **Weekly Meal Planner Nutrition Calculation** 🚨 CRITICAL

**Current:** 1,050+ nested loop iterations (7 days × 3-5 meals × 2-10 foods)  
**Impact:** 1.2s → 400ms (67% faster)  
**Complexity:** High (6-8 hours)

**Problem:**

```javascript
// WeeklyMealPlannerPage.jsx lines 227-256
planEntries.forEach((entry) => {
  const servings = entry.servings || 1;
  const mealFoods = entry.meals?.meal_foods || [];

  mealFoods.forEach((mealFood) => {
    const food = mealFood.foods || mealFood.food_servings;
    const quantity = mealFood.quantity * servings;

    // 28 nutrient calculations per food item
    Object.keys(totals).forEach((nutrient) => {
      totals[nutrient] += food[nutrient] * quantity;
    });
  });
});
```

**Solution:** Materialized view with auto-refresh trigger

```sql
CREATE MATERIALIZED VIEW weekly_meal_plan_nutrition AS
SELECT
  wmpe.weekly_meal_plan_id,
  wmpe.day_of_week,

  -- Macros
  SUM((COALESCE(f.calories, 0) * mf.quantity * wmpe.servings)) as total_calories,
  SUM((COALESCE(f.protein_g, 0) * mf.quantity * wmpe.servings)) as total_protein_g,
  SUM((COALESCE(f.carbs_g, 0) * mf.quantity * wmpe.servings)) as total_carbs_g,
  SUM((COALESCE(f.fat_g, 0) * mf.quantity * wmpe.servings)) as total_fat_g,
  SUM((COALESCE(f.fiber_g, 0) * mf.quantity * wmpe.servings)) as total_fiber_g,
  SUM((COALESCE(f.sugar_g, 0) * mf.quantity * wmpe.servings)) as total_sugar_g,

  -- Minerals (9 nutrients)
  SUM((COALESCE(f.sodium_mg, 0) * mf.quantity * wmpe.servings)) as total_sodium_mg,
  SUM((COALESCE(f.calcium_mg, 0) * mf.quantity * wmpe.servings)) as total_calcium_mg,
  SUM((COALESCE(f.iron_mg, 0) * mf.quantity * wmpe.servings)) as total_iron_mg,
  SUM((COALESCE(f.potassium_mg, 0) * mf.quantity * wmpe.servings)) as total_potassium_mg,
  SUM((COALESCE(f.magnesium_mg, 0) * mf.quantity * wmpe.servings)) as total_magnesium_mg,
  SUM((COALESCE(f.phosphorus_mg, 0) * mf.quantity * wmpe.servings)) as total_phosphorus_mg,
  SUM((COALESCE(f.zinc_mg, 0) * mf.quantity * wmpe.servings)) as total_zinc_mg,
  SUM((COALESCE(f.copper_mg, 0) * mf.quantity * wmpe.servings)) as total_copper_mg,
  SUM((COALESCE(f.selenium_mcg, 0) * mf.quantity * wmpe.servings)) as total_selenium_mcg,
  SUM((COALESCE(f.cholesterol_mg, 0) * mf.quantity * wmpe.servings)) as total_cholesterol_mg,

  -- Vitamins (11 nutrients)
  SUM((COALESCE(f.vitamin_a_mcg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_a_mcg,
  SUM((COALESCE(f.vitamin_c_mg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_c_mg,
  SUM((COALESCE(f.vitamin_e_mg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_e_mg,
  SUM((COALESCE(f.vitamin_d_mcg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_d_mcg,
  SUM((COALESCE(f.vitamin_k_mcg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_k_mcg,
  SUM((COALESCE(f.thiamin_mg, 0) * mf.quantity * wmpe.servings)) as total_thiamin_mg,
  SUM((COALESCE(f.riboflavin_mg, 0) * mf.quantity * wmpe.servings)) as total_riboflavin_mg,
  SUM((COALESCE(f.niacin_mg, 0) * mf.quantity * wmpe.servings)) as total_niacin_mg,
  SUM((COALESCE(f.vitamin_b6_mg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_b6_mg,
  SUM((COALESCE(f.folate_mcg, 0) * mf.quantity * wmpe.servings)) as total_folate_mcg,
  SUM((COALESCE(f.vitamin_b12_mcg, 0) * mf.quantity * wmpe.servings)) as total_vitamin_b12_mcg,

  -- Metadata
  COUNT(DISTINCT wmpe.user_meal_id) as meal_count,
  COUNT(mf.id) as food_item_count

FROM weekly_meal_plan_entries wmpe
JOIN meals m ON wmpe.user_meal_id = m.id
JOIN meal_foods mf ON m.id = mf.meal_id
JOIN foods f ON mf.food_id = f.id
GROUP BY wmpe.weekly_meal_plan_id, wmpe.day_of_week;

-- Auto-refresh trigger
CREATE OR REPLACE FUNCTION refresh_weekly_meal_plan_nutrition()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_meal_plan_nutrition;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_meal_plan_nutrition
AFTER INSERT OR UPDATE OR DELETE ON weekly_meal_plan_entries
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_weekly_meal_plan_nutrition();
```

---

### 4. **Workout Log Set Volume Calculations**

**Current:** Client-side calculations scattered throughout component  
**Impact:** 200ms → 60ms (70% faster)  
**Complexity:** Medium (4-5 hours)

**Problem:**

```javascript
// Scattered throughout WorkoutLogPage.jsx
const volume = weight * reps;
const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
```

**Solution:** Computed column with trigger

```sql
-- Add computed volume column
ALTER TABLE workout_sets
ADD COLUMN volume_lbs DECIMAL(10,2) GENERATED ALWAYS AS (weight_lbs * reps) STORED;

-- Add session total volume view
CREATE OR REPLACE VIEW workout_session_totals AS
SELECT
  workout_log_id,
  COUNT(DISTINCT exercise_id) as exercise_count,
  COUNT(*) as total_sets,
  SUM(volume_lbs) as total_volume_lbs,
  AVG(rpe) as avg_rpe,
  MAX(weight_lbs) as max_weight_lbs
FROM workout_sets
GROUP BY workout_log_id;
```

---

### 5. **Shopping List Generation** 🚨 CRITICAL

**Current:** 200-500 Map operations blocking UI (800ms)  
**Impact:** 800ms → 150ms (81% faster)  
**Complexity:** High (5-6 hours)

**Problem:**

```javascript
// WeeklyMealPlannerPage.jsx lines 443-490
const ingredientMap = new Map();
planEntries.forEach((entry) => {
  entry.meals?.meal_foods.forEach((mealFood) => {
    const food = mealFood.foods;
    const key = `${food.id}-${food.name}`;
    const existing = ingredientMap.get(key);
    // ... complex aggregation logic
  });
});
```

**Solution:** PostgreSQL function

```sql
CREATE OR REPLACE FUNCTION generate_shopping_list(plan_id UUID)
RETURNS TABLE (
  food_id UUID,
  food_name TEXT,
  total_quantity DECIMAL(10,2),
  unit TEXT,
  category TEXT,
  days_needed TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id as food_id,
    f.name as food_name,
    SUM(mf.quantity * wmpe.servings)::DECIMAL(10,2) as total_quantity,
    'serving'::TEXT as unit,
    COALESCE(f.category, 'Uncategorized')::TEXT as category,
    ARRAY_AGG(DISTINCT wmpe.day_of_week ORDER BY wmpe.day_of_week) as days_needed
  FROM weekly_meal_plan_entries wmpe
  JOIN meals m ON wmpe.user_meal_id = m.id
  JOIN meal_foods mf ON m.id = mf.meal_id
  JOIN foods f ON mf.food_id = f.id
  WHERE wmpe.weekly_meal_plan_id = plan_id
  GROUP BY f.id, f.name, f.category
  ORDER BY f.category, f.name;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Frontend Change:**

```javascript
// Before: Complex Map operations client-side
const ingredientMap = new Map();
// ... 50+ lines of logic

// After: Single database call
const { data: shoppingList } = await supabase.rpc("generate_shopping_list", {
  plan_id: currentPlan.id,
});
```

---

### 6. **Profile Page Height Conversion**

**Current:** Imperial ↔ Metric conversion on every render  
**Impact:** 100ms → 20ms (80% faster)  
**Complexity:** Low (2-3 hours)

**Solution:** Computed columns

```sql
ALTER TABLE user_profiles
ADD COLUMN height_cm DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE
    WHEN height_unit = 'imperial' THEN
      (height_feet * 12 + height_inches) * 2.54
    ELSE height_cm_stored
  END
) STORED;

ALTER TABLE body_metrics
ADD COLUMN weight_kg DECIMAL(6,2) GENERATED ALWAYS AS (weight_lbs * 0.453592) STORED;
```

---

## 🟡 MEDIUM PRIORITY OPTIMIZATIONS

### 7. **Food Search Result Filtering**

- Move food search to PostgreSQL full-text search
- Implement search vector computed column
- Add GIN index for search performance

### 8. **Nutrition Value Scaling**

- Store serving size multipliers in database
- Pre-calculate common serving conversions

### 9. **Meal Nutrition Calculation**

- Similar to #3 but for individual meals (not weekly plans)
- Create view for meal-level nutrition totals

### 10. **Superset Exercise Grouping**

- Store superset relationships in database
- Add computed column for display order

### 11. **Session Completion Status**

- Add completion_status computed column to workout_logs
- Track via trigger on workout_sets inserts

### 12. **Age Calculation**

- Add age computed column to user_profiles
- Update via trigger on date_of_birth changes

---

## 🟢 LOW PRIORITY OPTIMIZATIONS

### 13-14. **Meal Filtering & Search**

- Implement client-side caching for meal library
- Use React.memo for meal cards
- Debounce search input

---

## 📊 DATABASE OPTIMIZATION PHASE

### Index Analysis

```sql
-- Find missing indexes
SELECT
  schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;

-- Find unused indexes
SELECT
  schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_%';
```

### Recommended Indexes

```sql
-- Nutrition logs (for daily totals view)
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
CREATE INDEX idx_nutrition_logs_date_serving ON nutrition_logs(log_date, food_serving_id)
  WHERE food_serving_id IS NOT NULL;

-- Workout sets (for volume calculations)
CREATE INDEX idx_workout_sets_log_exercise ON workout_sets(workout_log_id, exercise_id);
CREATE INDEX idx_workout_sets_volume ON workout_sets(volume_lbs DESC) WHERE volume_lbs IS NOT NULL;

-- Weekly meal plans (for nutrition view)
CREATE INDEX idx_weekly_meal_entries_plan_day ON weekly_meal_plan_entries(weekly_meal_plan_id, day_of_week);

-- Foods (for search)
CREATE INDEX idx_foods_search_vector ON foods USING GIN(search_tokens);
CREATE INDEX idx_foods_category_logged ON foods(category, times_logged DESC);
```

### Bloat Reduction

```sql
-- Identify bloated tables
SELECT
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_dead_tup, n_live_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as bloat_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Vacuum and analyze
VACUUM ANALYZE nutrition_logs;
VACUUM ANALYZE workout_sets;
VACUUM ANALYZE foods;
```

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1 - Days 1-2: High Priority Backend Migration

- ✅ Day 1 AM: Daily nutrition totals view (#1, #2)
- ✅ Day 1 PM: Workout volume computed columns (#4)
- ✅ Day 2 AM: Weekly meal plan nutrition view (#3)
- ✅ Day 2 PM: Shopping list function (#5), Height conversion (#6)

### Week 1 - Days 3-4: Database Optimization

- ✅ Day 3: Index analysis and creation
- ✅ Day 4: Bloat reduction, query optimization

### Week 1 - Day 5: Medium Priority Items

- ✅ Food search optimization (#7)
- ✅ Meal nutrition calculations (#9)

### Week 2 - Days 1-2: Remaining Optimizations

- ✅ Superset grouping, age calculation, etc.
- ✅ Caching layer implementation

### Week 2 - Days 3-5: Testing & Validation

- ✅ Performance testing (Lighthouse, query profiling)
- ✅ Validation of all changes
- ✅ Monitoring setup

---

## 📈 EXPECTED PERFORMANCE GAINS

| Page          | Before  | After | Improvement |
| ------------- | ------- | ----- | ----------- |
| Dashboard     | 600ms   | 250ms | 58% faster  |
| Nutrition Log | 300ms   | 80ms  | 73% faster  |
| Meal Planner  | 1,200ms | 400ms | 67% faster  |
| Shopping List | 800ms   | 150ms | 81% faster  |
| Workout Log   | 250ms   | 80ms  | 68% faster  |
| Profile       | 100ms   | 20ms  | 80% faster  |

**Overall:** Reduce average page load time from 540ms to 163ms (70% faster)

---

## ✅ SUCCESS METRICS

- [ ] All pages load in <300ms
- [ ] Database query time <50ms average
- [ ] Lighthouse Performance Score >90
- [ ] Time to Interactive <2s
- [ ] No client-side operations >100ms
- [ ] Bundle size reduced by 20%+
- [ ] Database bloat <5%

---

## 🛠️ TOOLS & MONITORING

- **Performance Profiling:** React DevTools Profiler, Chrome Performance tab
- **Database Monitoring:** Supabase Dashboard, pg_stat_statements
- **Query Analysis:** EXPLAIN ANALYZE, pg_stat_user_tables
- **Bundle Analysis:** vite-bundle-visualizer
- **Lighthouse:** Chrome DevTools Lighthouse tab

---

**Total Estimated Time:** 35-50 hours across 2 weeks  
**Priority:** High impact items first (can see immediate results)  
**Risk:** Low (all changes can be rolled back)  
**Dependencies:** None (can implement incrementally)
