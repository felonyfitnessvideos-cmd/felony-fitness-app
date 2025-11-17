# Exercise Batch Insert - Instructions

## ✅ Schema Verified!

The `batch-insert-common-exercises.sql` file matches the `exercises` table schema.

### Columns Used:
- `name` (string, required)
- `description` (string | null)
- `instructions` (string | null)
- `primary_muscle` (string | null)
- `secondary_muscle` (string | null)
- `tertiary_muscle` (string | null)
- `equipment_needed` (string | null)
- `difficulty_level` (string | null)
- `exercise_type` (string | null)

### What's in the File:
- **100 exercises total** across 7 categories
- All with descriptions, instructions, and muscle targeting
- Difficulty levels: Beginner, Intermediate, Advanced
- Equipment types: Barbell, Dumbbell, Machine, Cable, Bodyweight, Kettlebell

### Categories:
1. **Chest (15)**: Bench press variations, flyes, dips, push-ups
2. **Back (15)**: Deadlifts, rows, pull-ups, pulldowns
3. **Shoulders (15)**: Presses, raises (front/side/rear), pike push-ups
4. **Legs (20)**: Squats, deadlifts, lunges, leg press, calf work
5. **Arms (15)**: Bicep curls, tricep extensions, dips, skull crushers
6. **Core (10)**: Planks, leg raises, crunches, anti-rotation work
7. **Full Body (10)**: Olympic lifts, burpees, kettlebell swings, carries

## How to Run:

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select project: **wkmrdelhoeqhsdifrarn**
3. Click **SQL Editor** in left sidebar
4. Click **+ New Query**
5. Copy entire contents of `batch-insert-common-exercises.sql`
6. Paste into editor
7. Click **Run** button
8. Verify success: "100 rows inserted"

### Option 2: Supabase CLI
```powershell
npx supabase db execute --project-id wkmrdelhoeqhsdifrarn --file scripts/batch-insert-common-exercises.sql
```

## After Insert:

### 1. Verify Exercises Were Added
```sql
SELECT COUNT(*) as new_exercises 
FROM exercises 
WHERE created_at > NOW() - INTERVAL '5 minutes';
```
Should return: `100`

### 2. Check Coverage by Muscle Group
```sql
SELECT primary_muscle, COUNT(*) as count
FROM exercises
GROUP BY primary_muscle
ORDER BY count DESC;
```

### 3. Check Equipment Distribution
```sql
SELECT equipment_needed, COUNT(*) as count
FROM exercises
GROUP BY equipment_needed
ORDER BY count DESC;
```

### 4. Check Difficulty Levels
```sql
SELECT difficulty_level, COUNT(*) as count
FROM exercises
GROUP BY difficulty_level
ORDER BY 
  CASE difficulty_level
    WHEN 'Beginner' THEN 1
    WHEN 'Intermediate' THEN 2
    WHEN 'Advanced' THEN 3
  END;
```

## Exercise Library Features:

### Muscle Groups Covered:
- **Upper Body**: Chest, Back, Shoulders, Biceps, Triceps
- **Lower Body**: Quads, Hamstrings, Glutes, Calves, Adductors
- **Core**: Abs, Obliques, Lower Back
- **Full Body**: Multi-joint compound movements

### Equipment Types:
- **Free Weights**: Barbell (35), Dumbbell (30), Kettlebell (3)
- **Machines**: Machine (15), Cable (12)
- **Bodyweight**: 15 exercises
- **Specialty**: Battle Rope (1), Sled (1)

### Exercise Types:
- **Compound**: ~60 exercises (multi-joint movements)
- **Isolation**: ~40 exercises (single-joint movements)

## What's Next:

### Meals (10)
Create realistic meal templates:
- High-protein breakfast options
- Lean lunch variations
- Post-workout meals
- Low-carb dinner options
- Snack options

### Programs (1)
Build complete 8-week program:
- Progressive overload structure
- Volume progression
- Deload weeks
- Exercise selection variety

### Routines (1)
Design professional routine template:
- Push/Pull/Legs split
- Upper/Lower split
- Full body routine
- Or custom client routine

---

**Generated**: 2025-11-17  
**Schema Reference**: `src/types/database.types.ts` (exercises table, line 342-385)  
**SQL File**: `scripts/batch-insert-common-exercises.sql`  
**Total Exercises**: 100 (ready for program building)
