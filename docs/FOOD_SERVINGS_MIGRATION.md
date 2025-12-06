# Food Servings → Foods Table Migration

## Summary

The `food_servings` table has been replaced by the `foods` table with integrated nutrition data and a separate `portions` table for serving sizes.

## Database Schema Changes

### OLD Structure:

- `food_servings` table: Food items with nutrition per serving
- `foods` table: Minimal food metadata (name, brand, category)

### NEW Structure:

- `foods` table: Complete food data with all nutrition (per 100g base)
- `portions` table: Serving size data (links to foods via `food_id`)

## Code Changes Required

### 1. Direct Table References

**Files with `.from('food_servings')`:**

- ✅ `src/pages/NutritionLogPage.jsx` (lines 391, 447) - UPDATED
- ❌ `src/pages/WeeklyMealPlannerPage.jsx` (line 345)
- ❌ `src/components/MealBuilder.jsx` (line 512)
- ❌ `src/components/trainer/NutritionPlanner.jsx` (lines 260, 280)
- ❌ `src/utils/nutritionPipeline.js` (lines 281, 300)

**Change:** `.from('food_servings')` → `.from('foods')`

### 2. Foreign Key Column References

**Files with `food_servings_id`:**

- ❌ `src/pages/WeeklyMealPlannerPage.jsx`
- ❌ `src/pages/NutritionLogPage.jsx` (lines 567, 588)
- ❌ `src/pages/MyMealsPage.jsx` (multiple lines)
- ❌ `src/components/MealBuilder.jsx` (multiple lines)
- ❌ `src/components/trainer/NutritionPlanner.jsx` (line 323)

**Change:** `food_servings_id` → `food_id`

### 3. Join Queries

**OLD Pattern:**

```javascript
.from('meal_foods')
.select(`
  *,
  food_servings (
    food_name,
    calories,
    protein_g
  )
`)
```

**NEW Pattern:**

```javascript
.from('meal_foods')
.select(`
  *,
  foods (
    name,
    calories,
    protein_g,
    portions (*)
  )
`)
```

### 4. Nutrition Calculation

**OLD:** Nutrition values were stored per serving  
**NEW:** Nutrition values are per 100g, must calculate for portions

```javascript
// Calculate nutrition for a portion
const portionGrams = portion.gram_weight || 100;
const multiplier = portionGrams / 100;

const displayCalories = Math.round(food.calories * multiplier);
const displayProtein = Math.round(food.protein_g * multiplier * 10) / 10;
```

## Migration Checklist

### Phase 1: Search Functions ✅

- ✅ `src/pages/NutritionLogPage.jsx` - Direct Supabase search
- ✅ `src/components/MealBuilder.jsx` - Direct Supabase search
- ✅ `src/components/trainer/NutritionPlanner.jsx` - Direct Supabase search
- ✅ `src/utils/nutritionAPI.js` - Direct Supabase search
- ✅ Created `src/utils/foodSearch.js` - Centralized search utility

### Phase 2: Table References ⏳

- ❌ Update `NutritionLogPage.jsx` serving fetches (lines 391, 447)
- ❌ Update `WeeklyMealPlannerPage.jsx` food queries
- ❌ Update `MyMealsPage.jsx` meal food queries
- ❌ Update `MealBuilder.jsx` external food inserts
- ❌ Update `NutritionPlanner.jsx` external food inserts
- ❌ Update `nutritionPipeline.js` search functions

### Phase 3: Database Schema ⏳

- ❌ Update `meal_foods` table: `food_servings_id` → `food_id`
- ❌ Update `user_meal_foods` table: `food_servings_id` → `food_id`
- ❌ Update `nutrition_logs` table: `food_serving_id` → `food_id`
- ❌ Create migration script for existing data
- ❌ Update foreign key constraints

### Phase 4: Components ⏳

- ❌ Update `MealBuilder.jsx` food display
- ❌ Update `NutritionPlanner.jsx` food display
- ❌ Update `MyMealsPage.jsx` food display
- ❌ Update `WeeklyMealPlannerPage.jsx` food display

## Testing Required

1. **Food Search:** Verify search returns foods with portions
2. **Meal Logging:** Test adding foods to meals
3. **Nutrition Calculation:** Verify calories/macros calculated correctly
4. **Portion Selection:** Test portion dropdown functionality
5. **Saved Meals:** Verify existing meals still load
6. **Weekly Planner:** Test meal plan creation

## Rollback Plan

If issues occur:

1. Keep `food_servings` table as backup
2. Revert code changes via git
3. Restore old edge functions
4. Re-enable old search paths

## Notes

- All new USDA data is in `foods` table
- Portions stored separately in `portions` table
- Nutrition is per 100g base (USDA standard)
- Must calculate display values based on portion size
- Old `food_servings` data may need migration
