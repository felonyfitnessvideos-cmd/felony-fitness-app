# Workout Schema Redesign Proposal

**Date**: November 11, 2025  
**Status**: PROPOSAL (Not Implemented)  
**Purpose**: Analyze current schema inefficiencies and propose optimized design

---

## Current Schema Analysis

### Tables Involved in Workout Logging

#### 1. **workout_logs** (Session metadata)
```
Columns:
- id (UUID, PK)
- user_id (UUID, FK)
- routine_id (UUID, FK)
- is_complete (boolean)
- created_at (timestamp)
- started_at (timestamp)
- ended_at (timestamp)
- duration_minutes (integer)
- calories_burned (integer)
- notes (text)
- cycle_session_id (UUID, FK - optional)
- log_date (date)
```

**Purpose**: Track a workout session (start/end time, completion status, metadata)

#### 2. **workout_log_entries** (Individual sets)
```
Columns:
- id (UUID, PK)
- log_id (UUID, FK to workout_logs)
- exercise_id (UUID, FK to exercises)
- set_number (integer)
- weight_lbs (numeric)
- weight_kg (numeric) - UNUSED
- reps_completed (integer)
- reps (integer) - UNUSED/CONFUSING
- duration_seconds (integer) - UNUSED
- distance_miles (numeric) - UNUSED
- rpe_rating (integer) - NEWLY USED
- notes (text) - UNUSED
- created_at (timestamp)
```

**Purpose**: Track individual sets within a workout session

#### 3. **routine_exercises** (Template/Plan)
```
Columns:
- id (UUID, PK)
- routine_id (UUID, FK)
- exercise_id (UUID, FK)
- target_sets (integer)
- target_reps (integer) - NEWLY ADDED
- exercise_order (integer)
```

**Purpose**: Define what exercises are in a routine and target sets/reps

#### 4. **exercises** (Exercise library)
```
Columns:
- id (UUID, PK)
- name (text)
- description (text)
- primary_muscle (text)
- secondary_muscle (text)
- tertiary_muscle (text)
- equipment (text)
- difficulty_level (text)
- exercise_type (text)
- video_url (text)
- thumbnail_url (text)
- created_at (timestamp)
```

**Purpose**: Master list of all exercises with metadata

---

## Current Issues & Inefficiencies

### Issue 1: Nested Queries Don't Work
**Problem**: 
```javascript
// This FAILS due to RLS:
workout_logs.select('*, workout_log_entries(*)')
```

**Current Workaround**:
```javascript
// Query 1: Get workout_logs
const logs = await supabase.from('workout_logs').select('*')

// Query 2: Get entries separately
const entries = await supabase.from('workout_log_entries')
  .select('*')
  .in('log_id', logIds)
```

**Impact**: 
- 2 database round trips instead of 1
- More complex code
- Slower page loads

---

### Issue 2: Too Many Foreign Key Lookups

**To display a workout**, we need:
1. Query `workout_logs` (get session info)
2. Query `workout_log_entries` (get sets)
3. Query `exercises` (get exercise names/details) - via exercise_id FK
4. Query `routine_exercises` (get target sets) - via routine_id + exercise_id
5. Query `workout_routines` (get routine name)

**That's 5 tables minimum!**

---

### Issue 3: Duplicate/Confusing Data

**Duplication**:
- `workout_logs.is_complete` vs `workout_log_entries.completed` (doesn't exist, but conceptually redundant)
- `weight_lbs` AND `weight_kg` (only use one)
- `reps` AND `reps_completed` (confusing naming)

**Unused Columns** (wasted space, confusing schema):
- `workout_log_entries.weight_kg`
- `workout_log_entries.reps` (vs reps_completed?)
- `workout_log_entries.duration_seconds`
- `workout_log_entries.distance_miles`
- `workout_log_entries.notes`

---

### Issue 4: "Last Time" Requires Extra Edge Function Call

**Current Flow**:
1. Load today's workout → Query workout_logs + workout_log_entries
2. For each exercise (12 exercises) → Call Edge Function to get "Last Time"
3. Edge Function queries workout_logs (find last completed) → Then queries workout_log_entries

**Result**: 1 + 12 = **13 separate queries** just to load the workout page!

---

### Issue 5: Rebuilding State on Every Action

**Problem**: When user edits a set:
- We update the database ✅
- Then we update local state manually ✅
- If we mess up state, we have to refetch everything ❌

**Better Approach**: Real-time subscriptions that auto-update state

---

## Proposed Schema Redesign

### Option 1: Denormalize for Performance (RECOMMENDED)

**Changes**:

#### A. Add exercise name to workout_log_entries
```sql
ALTER TABLE workout_log_entries 
ADD COLUMN exercise_name TEXT,
ADD COLUMN target_sets INTEGER,
ADD COLUMN target_reps INTEGER;
```

**Why**: 
- No need to join exercises table
- No need to join routine_exercises table
- Exercise name displayed instantly
- Targets displayed instantly

**Downside**: 
- If exercise name changes, old logs keep old name (but that's actually GOOD for historical accuracy!)

---

#### B. Add previous_session JSON to workout_logs
```sql
ALTER TABLE workout_logs
ADD COLUMN previous_session JSONB;
```

**Store**:
```json
{
  "exercise_id_1": [
    {"set": 1, "weight": 185, "reps": 10, "rpe": 8},
    {"set": 2, "weight": 185, "reps": 9, "rpe": 9}
  ],
  "exercise_id_2": [...]
}
```

**Why**:
- "Last Time" data loaded with workout_logs (1 query, not 13!)
- No Edge Function needed
- Instant display

**How to populate**:
- When finishing a workout, query previous session and store in JSONB
- Or use a trigger to auto-populate when is_complete = true

---

#### C. Clean up unused columns

**Remove**:
- `workout_log_entries.weight_kg` (calculate on display if needed)
- `workout_log_entries.reps` (rename reps_completed → reps)
- `workout_log_entries.duration_seconds` (move to separate table if cardio added later)
- `workout_log_entries.distance_miles` (move to separate table if cardio added later)
- `workout_log_entries.notes` (keep if planning to use, remove if not)

**Result**: Simpler, faster, less confusing

---

### Option 2: Materialized View for "Last Time"

**Create View**:
```sql
CREATE MATERIALIZED VIEW workout_last_sessions AS
SELECT DISTINCT ON (user_id, routine_id, exercise_id)
  user_id,
  routine_id,
  exercise_id,
  jsonb_agg(
    jsonb_build_object(
      'weight_lbs', weight_lbs,
      'reps_completed', reps_completed,
      'rpe_rating', rpe_rating,
      'set_number', set_number
    ) ORDER BY set_number
  ) as sets
FROM workout_log_entries wle
JOIN workout_logs wl ON wle.log_id = wl.id
WHERE wl.is_complete = true
GROUP BY user_id, routine_id, exercise_id, wl.created_at
ORDER BY user_id, routine_id, exercise_id, wl.created_at DESC;

-- Refresh when workout completes
REFRESH MATERIALIZED VIEW CONCURRENTLY workout_last_sessions;
```

**Why**:
- Pre-computed "Last Time" data
- 1 query to get all last sessions
- No Edge Function needed

**Downside**:
- Need to refresh after each workout completion
- More complex database setup

---

### Option 3: Real-Time Subscriptions (MODERN APPROACH)

**Use Supabase Realtime**:
```javascript
// Subscribe to workout_log_entries changes
const subscription = supabase
  .channel('workout-entries')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'workout_log_entries',
      filter: `log_id=eq.${workoutLogId}`
    },
    (payload) => {
      // Auto-update state when database changes
      handleRealtimeUpdate(payload);
    }
  )
  .subscribe();
```

**Why**:
- State automatically syncs with database
- No manual state updates needed
- Works across multiple devices/tabs
- User sees updates in real-time if trainer edits

**Downside**:
- More complex setup
- Potential for race conditions

---

## Performance Comparison

### Current Approach
```
Page Load:
1. Query workout_logs (1 query)
2. Query workout_log_entries separately (1 query)
3. Query exercises for names (1 query with IN clause)
4. Query routine_exercises for targets (1 query)
5. Call Edge Function 12 times for "Last Time" (12 queries)

Total: ~16 queries
Time: ~1-2 seconds
```

### Proposed Approach (Option 1 - Denormalized)
```
Page Load:
1. Query workout_logs with previous_session JSONB (1 query)
2. Query workout_log_entries with exercise_name denormalized (1 query)

Total: 2 queries
Time: ~200-300ms
```

**Speed Improvement**: 5-10x faster! 🚀

---

## Migration Strategy (If We Do This)

### Phase 1: Add New Columns (Non-Breaking)
```sql
-- Add denormalized columns
ALTER TABLE workout_log_entries 
ADD COLUMN exercise_name TEXT,
ADD COLUMN target_sets INTEGER,
ADD COLUMN target_reps INTEGER;

ALTER TABLE workout_logs
ADD COLUMN previous_session JSONB;
```

### Phase 2: Backfill Existing Data
```sql
-- Populate exercise_name for existing entries
UPDATE workout_log_entries wle
SET exercise_name = e.name,
    target_sets = re.target_sets,
    target_reps = re.target_reps
FROM exercises e
JOIN workout_logs wl ON wl.id = wle.log_id
JOIN routine_exercises re ON re.routine_id = wl.routine_id 
  AND re.exercise_id = e.id
WHERE wle.exercise_id = e.id;
```

### Phase 3: Update Application Code
- Modify queries to use denormalized columns
- Remove Edge Function calls for "Last Time"
- Update state management to use JSONB data

### Phase 4: Clean Up (After Testing)
- Remove unused columns
- Update documentation
- Remove old Edge Functions

**Estimated Timeline**: 2-3 hours of work, 1-2 weeks of testing

---

## Recommended Approach

**I recommend Option 1 (Denormalization)** for these reasons:

### ✅ Pros:
1. **Massive performance improvement** (16 queries → 2 queries)
2. **Simpler code** (no complex joins, no Edge Functions)
3. **Historical accuracy** (exercise names don't change in old logs)
4. **Easy to implement** (just add columns and backfill)
5. **No breaking changes** (additive only)
6. **Works with existing RLS** (no nested query issues)

### ⚠️ Cons:
1. **Data duplication** (exercise name stored multiple times)
2. **Slightly more storage** (~50 bytes per entry)
3. **Must update code** to populate new columns

### 💾 Storage Impact:
- Current: ~200 bytes per workout_log_entry
- Proposed: ~250 bytes per workout_log_entry
- For 10,000 entries: +500 KB total (negligible)

### ⚡ Performance Impact:
- Page load: **1-2 seconds → 200-300ms** (5-10x faster!)
- Queries: **16 → 2** (88% reduction)
- Edge Function calls: **12 → 0** (100% reduction)

---

## Alternative: Keep Current Schema But Optimize

If you don't want to change the schema, we can optimize the current approach:

### 1. Use Supabase Views
Create a view that pre-joins the data:
```sql
CREATE VIEW workout_entries_detailed AS
SELECT 
  wle.*,
  e.name as exercise_name,
  e.primary_muscle,
  re.target_sets,
  re.target_reps,
  wl.routine_id,
  wl.is_complete as workout_is_complete
FROM workout_log_entries wle
JOIN exercises e ON e.id = wle.exercise_id
JOIN workout_logs wl ON wl.id = wle.log_id
JOIN routine_exercises re ON re.routine_id = wl.routine_id 
  AND re.exercise_id = wle.exercise_id;
```

Then query the view instead of joining manually.

### 2. Add Database Indexes
```sql
-- Speed up "Last Time" queries
CREATE INDEX idx_workout_logs_complete_date 
ON workout_logs(user_id, routine_id, created_at DESC) 
WHERE is_complete = true;

-- Speed up entry lookups
CREATE INDEX idx_entries_log_exercise 
ON workout_log_entries(log_id, exercise_id);
```

### 3. Batch Edge Function Calls
Instead of 12 separate calls, make 1 call that returns all exercises:
```javascript
// Edge Function accepts: { user_id, routine_id, exercise_ids: [...] }
// Returns: { exercise_id_1: [...], exercise_id_2: [...] }
```

**This would reduce 12 calls to 1 call!**

---

## Questions for You

Before I implement anything:

1. **Do you want to keep historical accuracy?** (If exercise name changes, should old logs show old name or new name?)

2. **Are you planning to add cardio tracking?** (If yes, keep duration_seconds and distance columns)

3. **Do you care about metric system?** (If no, remove weight_kg column)

4. **Do you use workout notes?** (If no, remove notes column from entries)

5. **How important is speed vs simplicity?** (Denormalization is faster but more complex to maintain)

6. **Do you have a maintenance window?** (Schema changes require brief downtime)

---

## My Recommendation

**Start with the easy wins**:

1. ✅ **Batch Edge Function calls** (1 hour, no schema changes)
   - Change get-last-session-entries to accept multiple exercise_ids
   - Reduce 12 calls → 1 call
   - Immediate 5x speedup for "Last Time" loading

2. ✅ **Add database indexes** (5 minutes, no downtime)
   - Speed up queries by 2-3x
   - No code changes needed

3. ✅ **Clean up unused columns** (optional, no urgency)
   - Remove confusion
   - Document which columns are for future features

**Then later, if needed**:

4. ⚠️ **Add denormalized columns** (2-3 hours, requires testing)
   - Only if speed is still an issue
   - Requires careful migration planning

---

## Bottom Line

Your current schema is **functionally correct** but **not optimized for performance**. The nested query issue (RLS blocking) is the main pain point, and we've worked around it.

**The quickest win** would be batching the Edge Function calls (12 → 1) and adding indexes. That alone would make things 5x faster with minimal code changes.

**The biggest win** would be denormalizing exercise_name and previous_session JSONB, which would make things 10x faster but requires more work.

What do you think? Want to start with the easy optimizations first?

