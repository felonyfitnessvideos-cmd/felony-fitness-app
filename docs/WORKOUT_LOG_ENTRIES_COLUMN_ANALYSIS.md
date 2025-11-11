# workout_log_entries Table Column Analysis

**Date**: November 11, 2025  
**Purpose**: Analyze which columns are used, which are planned features, and which can be removed

---

## Currently Used Columns (ACTIVE)

These columns are actively used in the app right now:

| Column | Type | Usage | Code Location |
|--------|------|-------|---------------|
| `id` | UUID | Primary key | All queries |
| `log_id` | UUID | FK to workout_logs | WorkoutLogPage.jsx line 451 |
| `exercise_id` | UUID | FK to exercises | WorkoutLogPage.jsx line 452 |
| `set_number` | INTEGER | Track set order (1, 2, 3...) | WorkoutLogPage.jsx line 453 |
| `reps_completed` | INTEGER | **ACTIVELY USED** | WorkoutLogPage.jsx line 454, update-workout-set Edge Function |
| `weight_lbs` | NUMERIC | **ACTIVELY USED** (pounds) | WorkoutLogPage.jsx line 455, update-workout-set Edge Function |
| `created_at` | TIMESTAMP | Auto-generated | Database default |

**Total Active**: 7 columns

---

## Unused Columns - Feature Planning

These columns exist but are NOT currently used. They represent planned features:

### 1. **RPE Rating** 🎯 **HIGH PRIORITY - YOU WANT THIS**
- **Column**: `rpe_rating` (Rate of Perceived Exertion, 1-10 scale)
- **Purpose**: Track how difficult a set felt to the user
- **Value**: Extremely useful for:
  - Determining if weight progression is appropriate
  - Tracking fatigue and recovery
  - Programming deloads
  - Understanding training intensity
- **Implementation**: Add input field next to weight/reps in WorkoutLogPage
- **Recommendation**: ✅ **IMPLEMENT THIS** - Very valuable metric

### 2. **Duration Seconds**
- **Column**: `duration_seconds`
- **Purpose**: Track time for:
  - Timed exercises (planks, wall sits)
  - Cardio sessions (running, cycling)
  - Rest periods between sets
- **Current Use**: NONE (all exercises use reps/weight)
- **Potential Use Cases**:
  - Isometric holds
  - Cardio tracking
  - Tempo training (3-0-1-0 notation)
- **Recommendation**: ⚠️ **KEEP FOR FUTURE** - Useful if adding timed exercises

### 3. **Weight in KG**
- **Column**: `weight_kg`
- **Purpose**: Metric system support
- **Current Use**: NONE (only `weight_lbs` is used)
- **Potential Use Cases**:
  - International users
  - User preference settings (imperial vs metric)
  - Automatic conversion from lbs
- **Recommendation**: ⚠️ **KEEP FOR FUTURE** - If adding settings for metric/imperial

### 4. **Distance**
- **Column**: `distance_miles` or `distance_km` (need to verify which exists)
- **Purpose**: Track distance for cardio exercises
- **Current Use**: NONE
- **Potential Use Cases**:
  - Running on treadmill
  - Cycling
  - Rowing machine
  - Walking/hiking
- **Recommendation**: ⚠️ **KEEP FOR FUTURE** - Useful if expanding to cardio tracking

### 5. **Reps (Target)**
- **Column**: `reps` (different from `reps_completed`)
- **Purpose**: Likely the TARGET reps for the set
- **Current Use**: NONE (we use `routine_exercises.target_sets` for targets)
- **Confusion**: Why have target reps per set when we have target sets per exercise?
- **Recommendation**: ❓ **CLARIFY OR REMOVE** - Redundant with current design

### 6. **Notes**
- **Column**: `notes` (TEXT)
- **Purpose**: User notes about specific sets
- **Current Use**: NONE (always NULL)
- **Potential Use Cases**:
  - "Felt easy, increase weight next time"
  - "Lower back pain on this set"
  - "Used spotter for last 2 reps"
- **Recommendation**: ⚠️ **KEEP FOR FUTURE** - Very useful feature, low storage cost

---

## Recommendations

### Immediate Action (This Week)

1. **✅ IMPLEMENT RPE Rating**
   - Add input field in WorkoutLogPage.jsx
   - Update handleSaveSet to include rpe_rating
   - Add to edit set modal
   - Display in "Last Time" section
   - Show in progress charts

### Keep for Future Features (Don't Remove)

2. **duration_seconds** - For timed exercises/cardio
3. **weight_kg** - For metric system support
4. **distance** - For cardio tracking
5. **notes** - For set-specific comments

### Investigate and Decide

6. **reps** column - Why does this exist separate from reps_completed?
   - Check if it's used in any old queries
   - If not, consider removing to avoid confusion
   - Or clarify its purpose (target vs actual?)

### Storage Impact

**Current Status**: These unused columns add minimal overhead
- NULL values take very little space in PostgreSQL
- No performance impact on queries (we don't SELECT them)
- No harm in keeping them for future features

**Recommendation**: Don't remove them unless you're certain you'll never use them. They're not causing problems.

---

## Implementation Plan: RPE Rating

### Database Changes
✅ Column already exists! Just need to use it.

### Frontend Changes Needed

1. **WorkoutLogPage.jsx** - Add RPE input:
```jsx
// In currentSet state, add:
const [currentSet, setCurrentSet] = useState({
  weight: '',
  reps: '',
  rpe: '' // NEW: RPE rating 1-10
});

// In handleSaveSet, add to newSetPayload:
const newSetPayload = {
  log_id: workoutLogId,
  exercise_id: selectedExercise.id,
  set_number: (todaysLog[selectedExercise.id]?.length || 0) + 1,
  reps_completed: parseInt(currentSet.reps, 10),
  weight_lbs: parseInt(currentSet.weight, 10),
  rpe_rating: currentSet.rpe ? parseInt(currentSet.rpe, 10) : null // NEW
};
```

2. **UI Component** - Add RPE selector:
```jsx
<div className="rpe-input">
  <label>RPE (1-10)</label>
  <input
    type="number"
    min="1"
    max="10"
    value={currentSet.rpe}
    onChange={(e) => setCurrentSet({...currentSet, rpe: e.target.value})}
    placeholder="How hard?"
  />
</div>
```

3. **Display in "Last Time"**:
```jsx
{prevSet.rpe_rating && (
  <span className="rpe-badge">RPE: {prevSet.rpe_rating}</span>
)}
```

### Benefits of RPE

- **Autoregulation**: Adjust weight based on daily readiness
- **Deload Indicator**: If RPE consistently >9, time to deload
- **Progress Tracking**: Same weight but lower RPE = getting stronger
- **Client Communication**: Trainers can see if clients are pushing hard enough

---

## Summary

| Status | Columns | Action |
|--------|---------|--------|
| ✅ **ACTIVE** | 7 columns | Keep using |
| 🎯 **IMPLEMENT NOW** | rpe_rating | Add to UI this week |
| ⚠️ **FUTURE FEATURES** | duration_seconds, weight_kg, distance, notes | Keep for expansion |
| ❓ **INVESTIGATE** | reps | Clarify purpose or remove |

**Bottom Line**: You have a well-designed table with columns for future features. The unused columns aren't hurting anything. Focus on implementing RPE rating - it's the most valuable unused feature and the column already exists!

