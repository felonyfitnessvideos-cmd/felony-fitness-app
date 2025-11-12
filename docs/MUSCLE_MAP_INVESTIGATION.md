---
# Muscle Map Issues - Investigation Notes

## Issues Identified

### 1. ✅ FIXED: Front and Back Maps Look Identical
**Problem:** Both views showed same muscles (lats appearing where chest should be)

**Root Cause:** 
- Both front and back views received the SAME `highlightedMuscles` array
- No filtering based on variant (front vs back)
- `react-body-highlighter` was showing overlapping muscles on both views

**Solution:**
- Added muscle filtering based on variant
- Front view only shows: chest, abs, obliques, quadriceps, front-deltoids, biceps, forearm, calves
- Back view only shows: upper-back, lower-back, trapezius, back-deltoids, triceps, gluteal, hamstring, calves
- Calves show on both (anatomically correct)

**Code Changes:**
```javascript
const FRONT_VIEW_MUSCLES = ['chest', 'abs', 'obliques', 'quadriceps', 'front-deltoids', 'biceps', 'forearm', 'calves'];
const BACK_VIEW_MUSCLES = ['upper-back', 'lower-back', 'trapezius', 'back-deltoids', 'triceps', 'gluteal', 'hamstring', 'calves'];

const muscles = Array.from(muscleSet).filter(muscle => allowedMuscles.includes(muscle));
```

**Commit:** `e80c3d6`

---

### 2. ✅ FIXED: Scrollbar Visible in Fullscreen Modal
**Problem:** Scrollbar visible on fullscreen muscle map modal

**Solution:**
- Added `scrollbar-width: none` for Firefox
- Added `-ms-overflow-style: none` for IE/Edge
- Added `::-webkit-scrollbar { display: none }` for Chrome/Safari
- Maintains scroll functionality while hiding visual scrollbar

**Commit:** `654b727`

---

### 3. 🔍 INVESTIGATING: Forearms Highlighted with No Forearm Exercises

**Problem:** Forearms are highlighted on muscle map but program has no forearm exercises (only bicep curls)

**Possible Causes:**
1. **Bicep Curls incorrectly mapped to Forearms** - Primary muscle should be Biceps, Forearms should be secondary/tertiary at most
2. **Exercise data has wrong muscle_group_id** - Database might have incorrect foreign keys
3. **Muscle group aggregation includes secondary/tertiary** - Code line 813-815:
   ```javascript
   muscles.primary?.forEach(m => m && muscleGroups.add(m));
   muscles.secondary?.forEach(m => m && muscleGroups.add(m));
   muscles.tertiary?.forEach(m => m && muscleGroups.add(m));
   ```
   This means ANY muscle involvement shows on the map, even minor synergists.

**Expected Behavior:**
- **Bicep Curls:**
  - Primary: Biceps
  - Secondary: Brachialis (can be grouped with Biceps)
  - Tertiary: Forearms (grip stabilizers - this is correct but should be tertiary)

**Next Steps:**
1. Check exercise database for Bicep Curl entries
2. Verify muscle_group_id assignments (primary/secondary/tertiary)
3. Consider if we should ONLY show primary muscles on map (exclude secondary/tertiary)
4. Or: Color-code by importance (primary = bright, secondary = medium, tertiary = dim)

**Debug Output:** Added console.log in AnatomicalMuscleMap to show:
- Input muscles from program
- Unmapped muscles (muscles not in MUSCLE_MAP)
- Final mapped muscles after filtering

---

## Testing Checklist

- [x] Scrollbar hidden in fullscreen modal
- [x] Front view shows chest muscles
- [x] Back view shows back muscles (upper-back, lower-back, traps)
- [x] Views are now different (not identical)
- [ ] Forearm issue investigated (need to check actual program data)
- [ ] Verify bicep curl muscle groups in database
- [ ] Test with program containing various exercises

---

## Console Debug Commands

To check muscle mapping in browser console:
```javascript
// When viewing a program, check what muscles are being passed
console.log('Program target muscles:', program.target_muscle_groups);

// Check exercise pool
console.log('Exercise pool:', program.exercise_pool);

// Check individual exercise muscle groups
program.exercise_pool.forEach(ex => {
  console.log(ex.exercise_name, {
    primary: ex.muscle_groups?.primary,
    secondary: ex.muscle_groups?.secondary,
    tertiary: ex.muscle_groups?.tertiary
  });
});
```

---

## SQL Migration Status

**Status:** ⏳ NOT APPLIED

**File:** `scripts/add-exercise-warmup-intensity.sql`

**What it does:**
- Adds `is_warmup` BOOLEAN column to `program_routines_exercises`
- Adds `target_intensity_pct` INTEGER column (0-100 range)

**Why it's optional right now:**
- Routine generator works WITHOUT it (calculates intensity in-memory)
- NEEDED when we add UI controls for trainers to customize warmup/intensity

**See:** `docs/SQL_MIGRATION_STATUS.md` for full details

---

**Last Updated:** November 12, 2025
**Status:** 2/3 issues fixed, 1 under investigation
