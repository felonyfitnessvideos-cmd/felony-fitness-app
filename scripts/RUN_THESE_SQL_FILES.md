# 🚨 CRITICAL: Run These SQL Files NOW

**Status:** Your app is broken because the database migration hasn't been run yet!

**Errors you're seeing:**
```
null value in column "meal_id" violates not-null constraint
Key (meal_id)=(xxx) is not present in table "meals"
```

---

## ✅ Step-by-Step Instructions

### **Run in THIS ORDER:**

#### 1️⃣ **fix-user-meals-data-structure.sql** (CRITICAL - RUN FIRST!)
- **Why:** Adds `user_meal_id` column and removes NOT NULL constraint from `meal_id`
- **What it fixes:** Allows meal planner to work with both premade and user-created meals
- **Time:** 2 seconds

**How to run:**
1. Open `scripts/fix-user-meals-data-structure.sql`
2. Copy ENTIRE file (Ctrl+A, Ctrl+C)
3. Go to Supabase Dashboard → SQL Editor → New Query
4. Paste and click **"Run"**
5. ✅ Verify you see green checkmarks and NOTICE messages

---

#### 2️⃣ **batch-insert-10-meal-templates.sql** (After step 1)
- **Why:** Adds 10 professional meal templates
- **What you get:** 3 breakfasts, 3 lunches, 3 dinners, 2 snacks
- **Time:** 5 seconds

**How to run:**
1. Open `scripts/batch-insert-10-meal-templates.sql`
2. Copy ENTIRE file
3. Supabase Dashboard → SQL Editor → New Query
4. Paste and click **"Run"**
5. ✅ Should see "Successfully added 10 meal templates!"

---

#### 3️⃣ **add-meal-foods-for-10-templates.sql** (After step 2)
- **Why:** Links meals to actual food ingredients
- **What you get:** 40 meal_foods relationships (3-5 foods per meal)
- **Time:** 5 seconds

**How to run:**
1. Open `scripts/add-meal-foods-for-10-templates.sql`
2. Copy ENTIRE file
3. Supabase Dashboard → SQL Editor → New Query
4. Paste and click **"Run"**
5. ✅ Should see verification table showing 10 meals with food counts

---

## 🎯 Expected Results After All 3 SQL Files

### In Your App:
1. ✅ Meal planner works (no more errors)
2. ✅ Can add user meals to plan
3. ✅ Can add premade meals to plan
4. ✅ 10 new meal templates available in "Browse Meals"
5. ✅ Each meal shows ingredient list with quantities

### In Database:
- `weekly_meal_plan_entries`: Has both `meal_id` AND `user_meal_id` columns (XOR constraint)
- `meals`: Has 10 new premade meals
- `meal_foods`: Has 40 new relationships
- `user_meals`: Still has your personal meals (Breakfast 1, Lunch 1, Dinner 1)

---

## 🚨 Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Solution:** Meals already exist. This is fine - just continue to next step.

### Error: "column user_meal_id already exists"
**Solution:** Migration already ran. This is fine - just continue to next step.

### Error: "constraint already exists"
**Solution:** Migration already ran partially. This is fine - script is idempotent.

### Still seeing errors in app after running SQL?
**Solution:** Refresh your browser (Ctrl+Shift+R) to reload the app.

---

## ⏱️ Total Time Required

**3-5 minutes** to copy/paste and run all 3 SQL files.

---

## 📞 Verification

After running all 3 SQL files, test in your app:

1. Go to Weekly Meal Planner
2. Click any meal slot (e.g., Monday Breakfast)
3. Try adding a meal (user meal or premade)
4. ✅ Should succeed without errors
5. ✅ Meal should appear in the planner grid
6. ✅ Click meal to see ingredients

---

**Last Updated:** November 17, 2025  
**Status:** 🔴 **URGENT - RUN NOW TO FIX APP**
