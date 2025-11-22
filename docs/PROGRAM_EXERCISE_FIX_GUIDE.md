# Program Exercise Name Fix - Complete Guide

## Problem Identified
The Beginner Strength & Hypertrophy program used generic exercise names (e.g., "Barbell Bench Press") that didn't exactly match the database exercise names, causing all exercises to show as "unknown" in the UI.

## Solution Applied
All 24 exercises in the program have been updated to match exact database names, and 1 missing exercise was added.

---

## Step-by-Step Deployment Instructions

### **STEP 1: Add Missing Exercise**

**File:** `scripts/add-hanging-knee-raise-exercise.sql`

```sql
-- Run this FIRST in Supabase SQL Editor
-- This adds the missing "Hanging Knee Raise" exercise to the database
```

**Action:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/add-hanging-knee-raise-exercise.sql`
3. Click "Run"
4. Verify output shows 1 row inserted

**Expected Result:**
```
INSERT 0 1
```

---

### **STEP 2: Deploy Updated Program**

**File:** `scripts/batch-insert-beginner-strength-program.sql`

```sql
-- Run this SECOND in Supabase SQL Editor
-- This inserts the program with all correct exercise names
```

**Action:**
1. In Supabase SQL Editor (new query)
2. Copy contents of `scripts/batch-insert-beginner-strength-program.sql`
3. Click "Run"
4. Verify output shows 1 row inserted

**Expected Result:**
```
INSERT 0 1
```

---

## Exercise Mapping - What Was Fixed

### **9 Exercise Names Updated:**

| Original Name (Incorrect) | Fixed Name (Database Match) | Status |
|---|---|---|
| Barbell Overhead Press | **Overhead Press** | ✅ Fixed |
| Tricep Press-Down | **Tricep Pushdown** | ✅ Fixed |
| Face Pulls | **Cable Face Pull** | ✅ Fixed |
| Barbell Back Squat | **Barbell Squat** | ✅ Fixed |
| Leg Press | **Leg Press Machine** | ✅ Fixed |
| Leg Curl | **Leg Curl Machine** | ✅ Fixed |
| Hammer Curl | **Dumbbell Hammer Curl** | ✅ Fixed |
| Bulgarian Split Squat | **Dumbbell Bulgarian Split Squat** | ✅ Fixed |
| Leg Extension | **Leg Extension Machine** | ✅ Fixed |

### **15 Exercises Already Correct:**

- Barbell Bench Press ✅
- Incline Dumbbell Press ✅
- Cable Lateral Raise ✅
- Romanian Deadlift ✅
- Calf Raise ✅
- Plank ✅
- Barbell Row ✅
- Lat Pulldown ✅
- Dumbbell Row ✅
- Cable Row ✅
- Barbell Curl ✅
- Conventional Deadlift ✅
- Walking Lunge ✅
- Ab Wheel Rollout ✅
- Hanging Knee Raise ✅ (newly added)

---

## Verification Steps

### **After Running Both SQL Files:**

**1. Verify Program Exists:**
```sql
SELECT 
  id,
  name,
  difficulty_level,
  estimated_weeks,
  program_type,
  jsonb_array_length(exercise_pool) as total_days,
  is_active,
  is_template
FROM programs
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';
```

**Expected Result:**
- 1 row returned
- `total_days` = 4
- `is_active` = true
- `is_template` = true

---

**2. Check Exercise Count Per Day:**
```sql
SELECT 
  day_data->>'day_name' as day_name,
  jsonb_array_length(day_data->'exercises') as exercise_count,
  day_data->>'estimated_duration_minutes' as duration_min
FROM programs,
LATERAL jsonb_array_elements(exercise_pool) as day_data
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';
```

**Expected Result:**
| day_name | exercise_count | duration_min |
|---|---|---|
| Upper Body A - Push Focus | 6 | 75 |
| Lower Body A - Squat Focus | 6 | 75 |
| Upper Body B - Pull Focus | 6 | 75 |
| Lower Body B - Deadlift Focus | 6 | 75 |

**Total: 24 exercises**

---

**3. View All Exercise Names:**
```sql
SELECT 
  day_data->>'day_name' as workout_day,
  exercise->>'exercise_order' as order_num,
  exercise->>'exercise_name' as exercise_name,
  exercise->>'sets' as sets,
  exercise->>'reps' as reps
FROM programs,
LATERAL jsonb_array_elements(exercise_pool) as day_data,
LATERAL jsonb_array_elements(day_data->'exercises') as exercise
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks'
ORDER BY day_data->>'day', (exercise->>'exercise_order')::int;
```

**Expected Result:**
All 24 exercises should display with proper names (no "unknown" labels)

---

## UI Testing Checklist

### **In Trainer Dashboard:**

- [ ] Navigate to Programs section
- [ ] Verify "Beginner Strength & Hypertrophy - 8 Weeks" appears in list
- [ ] Click to view program details
- [ ] Verify all 4 workout days display
- [ ] Check that all 24 exercises show **actual names** (not "unknown")
- [ ] Verify exercise details (sets, reps, rest, notes) display correctly

### **Program Assignment:**

- [ ] Try assigning program to a test client
- [ ] Verify client can see program in their dashboard
- [ ] Check that exercises display properly for client
- [ ] Verify workout tracking works (can log sets/reps)

---

## Troubleshooting

### **Issue: Still seeing "unknown" exercises**

**Possible Causes:**
1. Program SQL ran before adding "Hanging Knee Raise"
2. Exercise names still don't match database exactly
3. React component caching old data

**Solutions:**
1. Delete the program and re-run both SQL files in order
2. Clear browser cache and reload
3. Check browser console for errors

**Delete Program (if needed):**
```sql
DELETE FROM programs 
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';
```

---

### **Issue: Program not appearing in UI**

**Check:**
```sql
SELECT name, is_active, is_template, created_at
FROM programs
WHERE name LIKE '%Beginner%';
```

**Fix:**
```sql
UPDATE programs
SET is_active = true, is_template = true
WHERE name = 'Beginner Strength & Hypertrophy - 8 Weeks';
```

---

## Technical Notes

### **Why This Happened:**

1. **Generic Names Used:** Program SQL was created with generic exercise names assuming flexibility
2. **Database Has Specific Names:** Database uses exact names with equipment specifications (e.g., "Leg Press Machine" not just "Leg Press")
3. **No Foreign Key Enforcement:** exercise_name is stored as text in JSONB, not as a foreign key to exercises table
4. **UI Lookup Failure:** React components lookup exercises by exact name match, failing when names don't match

### **Long-term Solution:**

Consider refactoring to use exercise IDs instead of names in the JSONB structure:

```json
{
  "exercise_id": "b8101809-414b-45c0-bede-1821fc09a558",
  "sets": 4,
  "reps": "6-8"
}
```

This would:
- Enforce referential integrity
- Prevent name mismatch issues
- Allow exercise renaming without breaking programs
- Enable better data validation

---

## Success Criteria

✅ **All 24 exercises display with proper names in trainer dashboard**  
✅ **No "unknown" exercise labels appear**  
✅ **Program can be assigned to clients successfully**  
✅ **Clients can view and track workouts**  
✅ **All exercise details (sets, reps, notes) display correctly**

---

## Files Modified

1. `scripts/batch-insert-beginner-strength-program.sql` - Updated 9 exercise names
2. `scripts/add-hanging-knee-raise-exercise.sql` - Added missing exercise

## Commit Reference

**Commit:** `fix: update program exercises to match database names exactly`  
**Changes:**
- 9 exercise names corrected
- 1 missing exercise added
- All 24 exercises now match database

---

## Next Steps

After successful deployment:

1. ✅ Mark Priority 4 (Program Template Creation) as COMPLETE in `docs/CONTENT_EXPANSION_STRATEGY.md`
2. Update documentation with lessons learned
3. Create additional programs following same naming conventions
4. Consider implementing exercise ID refactor for future programs

---

**Last Updated:** 2025-11-22  
**Status:** Ready for Deployment  
**Tested:** Pending (awaiting user deployment)
