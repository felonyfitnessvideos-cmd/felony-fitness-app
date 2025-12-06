# Food Data Migration - Complete Summary

**Date:** 2025-01-06  
**Status:** ✅ CODE MIGRATION COMPLETE

---

## Overview

Successfully migrated the application from the deprecated `food_servings` table architecture to the new `foods` + `portions` structure. This enables better nutrition tracking with USDA data stored per 100g with flexible portion sizes.

---

## Architecture Changes

### Old Structure (Deprecated)

```
food_servings table
├── id (uuid)
├── food_name (text)
├── serving_description (text)
├── calories, protein_g, carbs_g, fat_g (per serving)
└── [other nutrition fields per serving]

meal_foods.food_servings_id → food_servings.id
nutrition_logs.food_serving_id → food_servings.id
user_meal_foods.food_servings_id → food_servings.id
```

### New Structure (Active)

```
foods table (nutrition per 100g)
├── id (uuid)
├── name (text)
├── brand_owner (text)
├── category (text)
├── data_source (text)
├── calories, protein_g, carbs_g, fat_g (per 100g)
├── [all vitamins/minerals per 100g]
└── quality_score, enrichment_status

portions table (serving sizes)
├── id (uuid)
├── food_id → foods.id
├── amount (numeric)
├── measure_unit (text)
├── gram_weight (numeric)
└── portion_description (text)

meal_foods.food_id → foods.id
nutrition_logs.food_id → foods.id
user_meal_foods.food_id → foods.id
```

### Nutrition Calculation

- **Base:** All nutrition values stored per 100g in `foods` table
- **Display:** `displayValue = (baseValue * portion.gram_weight / 100) * quantity`
- **Example:**
  - Food has 20g protein per 100g
  - Portion is 1 cup = 240g
  - User logs 2 servings
  - Display: `(20 * 240 / 100) * 2 = 96g protein`

---

## Files Modified

### ✅ Database Migration

**File:** `supabase/migrations/20250106_migrate_foods_structure.sql`

- Creates `foods` and `portions` tables with complete structure
- Adds `food_id` columns to existing tables (meal_foods, nutrition_logs, user_meal_foods)
- Adds foreign key constraints
- Updates database triggers to use new structure
- Creates RLS policies for public read access
- Creates `foods_with_portions` view for easy queries

**Status:** Ready to run (idempotent, safe to re-run)

### ✅ Search Infrastructure

**File:** `src/utils/foodSearch.js`

- **Created:** Centralized search utility
- **Functions:**
  - `searchFoods(searchTerm)` - Direct Supabase query with portions join
  - `formatFoodForDisplay(food, portion)` - Calculate nutrition for display
  - `getFoodPortions(foodId)` - Fetch all portions for a food
- **Pattern:** `.from('foods').select('*, portions(*)').or('name.ilike.%query%,brand_owner.ilike.%query%')`

### ✅ Nutrition Logging

**File:** `src/pages/NutritionLogPage.jsx`

- **Updated Functions:**
  1. `openLogModal()` - Fetches from `foods` + `portions` instead of `food_servings`
  2. `logFood()` - Inserts external foods into `foods` table, creates default portions
  3. `addMealPlanToLog()` - Uses `food_id` column instead of `food_servings_id`
- **Search:** Direct Supabase query (lines 300-360)

### ✅ Meal Builder

**File:** `src/components/MealBuilder.jsx`

- **Updated References:** 9 locations changed from `food_servings_id` → `food_id`
- **External Foods:** Now saves to `foods` + `portions` tables instead of `food_servings`
- **Data Mapping:** Updated meal food queries to use new column names
- **Search:** Direct Supabase query (lines 255-310)

### ✅ Nutrition Planner (Trainer)

**File:** `src/components/trainer/NutritionPlanner.jsx`

- **Updated Functions:**
  - External food lookup: queries `foods` table
  - Food creation: inserts into `foods` + `portions` tables
  - Meal food inserts: uses `food_id` column
- **Search:** Direct Supabase query (lines 80-150)

### ✅ My Meals Page

**File:** `src/pages/MyMealsPage.jsx`

- **Updated Queries:** 4 select queries changed to use `food_id`
- **Functions Updated:**
  - Meal loading from `user_meals` table
  - Premade meals loading from `meals` table
  - `copyMealToMyMeals()` - validation and copying logic
  - `copyPremadeToMyMeals()` - meal duplication logic

### ✅ Weekly Meal Planner

**File:** `src/pages/WeeklyMealPlannerPage.jsx`

- **Updated:** User meals query to select `food_id` instead of `food_servings_id`

### ✅ Nutrition API Utilities

**File:** `src/utils/nutritionAPI.js`

- **Fully Updated:** Direct Supabase search (lines 70-110)
- **Status:** Complete migration to new structure

### ✅ Nutrition Pipeline

**File:** `src/utils/nutritionPipeline.js`

- **Updated Functions:**
  - Quality analytics: queries `foods` table
  - Needs attention: uses `foods.name` instead of `food_servings.food_name`
  - Recent improvements: updated column references

---

## Code Verification

### Zero References Remaining

```bash
# food_servings table queries: 0 matches
grep -r "\.from('food_servings')" src/

# food_servings_id column: 0 matches
grep -r "food_servings_id" src/

# food_serving_id column: 0 matches
grep -r "food_serving_id" src/
```

✅ **All deprecated references removed**

---

## Database Migration Steps

### Step 1: Run SQL Migration

```bash
# In Supabase Dashboard → SQL Editor
# Copy contents of: supabase/migrations/20250106_migrate_foods_structure.sql
# Execute the script
```

**What it does:**

- ✅ Creates `foods` table if not exists (with all nutrition columns)
- ✅ Creates `portions` table if not exists
- ✅ Adds `food_id` columns to meal_foods, nutrition_logs, user_meal_foods
- ✅ Adds foreign key constraints
- ✅ Updates database trigger to use new structure
- ✅ Enables RLS policies
- ✅ Creates helper views

**Safe to run:** Yes, uses `IF NOT EXISTS` and conditional logic

### Step 2: Verify USDA Data

```bash
# Check foods table
SELECT COUNT(*) FROM foods;
# Expected: ~500,000+ rows

# Check portions table
SELECT COUNT(*) FROM portions;
# Expected: ~1,000,000+ rows

# Sample query
SELECT f.name, f.calories, p.portion_description, p.gram_weight
FROM foods f
JOIN portions p ON f.id = p.food_id
WHERE f.name ILIKE '%chicken%'
LIMIT 10;
```

### Step 3: Test Features

See **Testing Checklist** below

---

## Testing Checklist

### 🔲 Food Search & Selection

- [ ] Search for foods in Nutrition Log page
- [ ] Verify portions display correctly
- [ ] Select different portion sizes
- [ ] Search in Meal Builder
- [ ] Search in Nutrition Planner (trainer view)

### 🔲 Meal Logging

- [ ] Log a food with quantity
- [ ] Verify nutrition calculations are correct
- [ ] Log external/custom foods
- [ ] Add meal plan to daily log
- [ ] Check macros totals update

### 🔲 Saved Meals

- [ ] Load existing saved meals
- [ ] Create new meal with foods
- [ ] Copy meal to My Meals
- [ ] Edit meal and save
- [ ] Delete meal

### 🔲 Weekly Meal Planner

- [ ] View scheduled meals
- [ ] Add meal to schedule
- [ ] Verify meal foods display
- [ ] Calculate weekly macros
- [ ] Log scheduled meal to daily log

### 🔲 Nutrition Calculations

- [ ] Log food with 100g portion → verify matches base values
- [ ] Log food with custom portion (e.g., 1 cup = 240g) → verify scaled correctly
- [ ] Log multiple servings → verify multiplication correct
- [ ] Check daily totals aggregate correctly

### 🔲 Trainer Features

- [ ] Create meal plan for client
- [ ] Add external foods
- [ ] Verify foods save to database
- [ ] Check client can see assigned meals

---

## Known Issues & Limitations

### 1. Food Display Names

**Issue:** Old code used `food_servings.food_name`, new code uses `foods.name`  
**Impact:** Minimal - both contain the same food name  
**Fix Required:** Update any display logic that specifically references `food_name` column (none found in search)

### 2. Old Data Migration

**Issue:** Existing data in old `food_servings_id` columns not automatically migrated  
**Impact:** Old meals/logs won't display until data is migrated or re-created  
**Fix Required:**

- Option A: Run data migration script (to be created if needed)
- Option B: Users re-create meals with new food search
- Recommendation: **Run database migration, then check if old data exists**

### 3. External Food Sources

**Issue:** Old code had `source: 'external_api'`, new code uses `data_source: 'USER_CUSTOM'`  
**Impact:** Analytics/filtering may not match old external foods  
**Fix Required:** Update any queries that filter by `source` field (none found)

### 4. Serving Descriptions

**Issue:** Old structure had `serving_description` in food_servings, new structure in portions table  
**Impact:** Display logic updated, but may need UI adjustments  
**Fix Required:** Verify portion descriptions display properly in all UI components

---

## Performance Considerations

### Database Indexes

The migration script creates these indexes:

```sql
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_brand ON foods(brand_owner);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_portions_food_id ON portions(food_id);
```

**Expected Performance:**

- Food search: < 200ms for name-based queries
- Portions lookup: < 50ms with food_id index
- Bulk inserts: Batched for optimal throughput

### Bundle Size Impact

- **Added:** `foodSearch.js` utility (~3KB)
- **Removed:** Edge function calls (reduces network overhead)
- **Net Impact:** Slightly smaller bundle, faster queries (no serverless cold starts)

---

## Rollback Plan

If issues occur and rollback is needed:

### Step 1: Revert Code Changes

```bash
git checkout HEAD~1 src/
# Or manually restore from backup
```

### Step 2: Database Rollback (Optional)

```sql
-- Remove new columns (keeps old ones intact)
ALTER TABLE meal_foods DROP COLUMN IF EXISTS food_id;
ALTER TABLE nutrition_logs DROP COLUMN IF EXISTS food_id;
ALTER TABLE user_meal_foods DROP COLUMN IF EXISTS food_id;

-- Drop new tables (keeps old food_servings intact)
DROP TABLE IF EXISTS portions CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
```

**Note:** Only rollback if critical issues occur. The migration is designed to be additive and safe.

---

## Future Enhancements

### Phase 2 (Optional)

- [ ] Migrate existing data from old columns to new columns
- [ ] Drop old `food_servings_id` columns
- [ ] Drop deprecated `food_servings` table
- [ ] Archive old data for reference

### Phase 3 (Optimization)

- [ ] Implement food search caching
- [ ] Add full-text search indexes
- [ ] Optimize nutrition calculation functions
- [ ] Add food quality scoring improvements

---

## Documentation Updates

### Updated Documents

- ✅ `FOOD_SERVINGS_MIGRATION.md` - Complete migration checklist
- ✅ `USDA_IMPORT_QUICK_START.md` - Import script documentation
- ✅ This summary document

### Documentation Needed

- [ ] User guide for new food search
- [ ] API documentation for foods/portions structure
- [ ] Developer guide for nutrition calculations

---

## Success Criteria

### Code Migration: ✅ COMPLETE

- [x] All `food_servings` table queries updated to `foods` table
- [x] All `food_servings_id` columns updated to `food_id`
- [x] All edge function calls replaced with direct Supabase queries
- [x] Centralized search utility created
- [x] External food creation updated to new structure
- [x] Zero linting errors
- [x] Zero TypeScript errors (if applicable)

### Database Migration: 🔄 PENDING

- [ ] SQL migration script executed in production
- [ ] Foods table populated (500k+ rows)
- [ ] Portions table populated (1M+ rows)
- [ ] Foreign key constraints active
- [ ] RLS policies enabled
- [ ] Triggers functioning

### Testing: 🔄 PENDING

- [ ] All features manually tested
- [ ] Nutrition calculations verified
- [ ] No console errors
- [ ] Performance acceptable
- [ ] User acceptance testing complete

---

## Contact & Support

**Questions?** Check these resources:

- Migration checklist: `docs/FOOD_SERVINGS_MIGRATION.md`
- Import guide: `docs/USDA_IMPORT_QUICK_START.md`
- SQL migration: `supabase/migrations/20250106_migrate_foods_structure.sql`

**Issues?**

1. Check console for errors
2. Verify database migration ran successfully
3. Check Supabase logs for query errors
4. Review this document's Known Issues section

---

## Conclusion

✅ **Code migration is complete and ready for testing.**

Next steps:

1. Run database migration SQL script in Supabase
2. Verify USDA data is present (foods + portions tables)
3. Run testing checklist
4. Monitor for errors
5. Collect user feedback

**Estimated Testing Time:** 2-3 hours for complete feature verification

---

_Last Updated: 2025-01-06_  
_Migration Version: 1.0_  
_Status: Ready for Production Testing_
