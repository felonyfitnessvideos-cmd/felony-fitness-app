# Program Data Structure Guide

## 📚 How Program Data is Stored

### **Programs Table Schema**
```sql
programs (
  id                    UUID PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  difficulty_level      TEXT ('beginner'|'intermediate'|'advanced'),
  estimated_weeks       INTEGER,
  program_type          TEXT,
  exercise_pool         JSONB,          -- This is where exercises are stored!
  target_muscle_groups  TEXT[],
  is_active             BOOLEAN,
  is_template           BOOLEAN,
  trainer_id            UUID,
  created_at            TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ
)
```

### **Exercise Pool Structure (JSONB)**

The `exercise_pool` column stores a JSON array of exercise objects:

```json
[
  {
    "exercise_id": "uuid-of-exercise-from-exercises-table",
    "exercise_name": "Bench Press",
    "sets": 3,
    "reps": "8-12",
    "rest_seconds": 90,
    "notes": "Focus on form",
    "muscle_groups": {
      "primary": ["Chest"],
      "secondary": ["Triceps"],
      "tertiary": []
    }
  },
  {
    "exercise_id": "another-uuid",
    "exercise_name": "Squat",
    "sets": 4,
    "reps": "5-8",
    "rest_seconds": 120,
    "notes": "",
    "muscle_groups": {
      "primary": ["Quadriceps"],
      "secondary": ["Glutes", "Hamstrings"],
      "tertiary": ["Core"]
    }
  }
]
```

### **Key Points:**

1. **Exercise IDs**: The `exercise_id` field references the `exercises` table:
   ```sql
   SELECT id, name, primary_muscle, secondary_muscle 
   FROM exercises 
   WHERE id = 'exercise_id';
   ```

2. **Muscle Groups**: Automatically extracted from the exercises in the pool and stored in `target_muscle_groups` array

3. **Configuration**: Each exercise has its own sets/reps/rest configuration within the pool

4. **Flexibility**: JSONB allows dynamic structure - can add exercises without schema changes

---

## 🔍 Where Your Test Programs Went

Your development test programs are likely in one of these places:

### Option 1: Check Production Database
```sql
SELECT id, name, description, exercise_pool 
FROM programs 
WHERE is_active = true
ORDER BY created_at DESC;
```

### Option 2: Check if `is_active` Column is Missing
If you get error: `column "is_active" does not exist`, then run:
```sql
-- Add is_active column
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Then check again
SELECT * FROM programs;
```

### Option 3: Programs Might Be in Development DB
Check your Supabase project URL in `.env.local`:
- **Production**: `wkmrdelhoeqhsdifrarn.supabase.co`
- **Development**: `ytpblkbwgdbiserhrlqm.supabase.co`

You might have created test data in one database but are looking in the other.

---

## 🛠️ How to Run SQL Migrations

### **IMPORTANT: Do NOT run the file path in SQL Editor!**

**❌ WRONG:**
```sql
scripts/add-programs-is-active-column.sql  -- This causes syntax error!
```

**✅ CORRECT:**
1. Open the SQL file in VS Code
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. Go to Supabase Dashboard → SQL Editor
4. Paste the contents
5. Click "Run"

### **Required Migrations (in order):**

#### 1. Add `is_active` column to programs
**File:** `scripts/add-programs-is-active-column.sql`
```sql
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

#### 2. Add `full_name` column to trainer_clients
**File:** `scripts/add-trainer-clients-full-name.sql`
```sql
-- (Copy entire file contents - 84 lines with triggers)
```

#### 3. Add `target_reps` column to routine_exercises
**File:** `scripts/add-target-reps-column.sql`
```sql
ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS target_reps TEXT;

UPDATE routine_exercises 
SET target_reps = '8-12' 
WHERE target_reps IS NULL;
```

---

## 🎯 Create Test Programs

If your programs table is empty, you can create test data:

### **Option A: Use the Program Builder (Recommended)**
1. Go to Trainer Dashboard → Programs
2. Click "New Program" button
3. Fill out the 3-step wizard
4. Add exercises from the search
5. Save

### **Option B: Insert SQL Test Data**

```sql
-- Insert a sample program
INSERT INTO programs (
  name, 
  description, 
  difficulty_level, 
  estimated_weeks, 
  program_type,
  exercise_pool,
  target_muscle_groups,
  is_active,
  trainer_id
) VALUES (
  'Upper Body Strength', 
  'Focus on chest, back, and arms',
  'intermediate',
  8,
  'Strength',
  '[
    {
      "exercise_id": "get-this-from-exercises-table",
      "exercise_name": "Bench Press",
      "sets": 4,
      "reps": "8-10",
      "rest_seconds": 120,
      "muscle_groups": {"primary": ["Chest"], "secondary": ["Triceps"], "tertiary": []}
    },
    {
      "exercise_id": "another-uuid",
      "exercise_name": "Pull-ups",
      "sets": 3,
      "reps": "6-8",
      "rest_seconds": 90,
      "muscle_groups": {"primary": ["Back"], "secondary": ["Biceps"], "tertiary": []}
    }
  ]'::jsonb,
  ARRAY['Chest', 'Back', 'Arms'],
  true,
  'your-user-id'
);
```

### **Get Exercise IDs:**
```sql
-- List all available exercises
SELECT id, name, primary_muscle, secondary_muscle, difficulty_level
FROM exercises
ORDER BY name
LIMIT 20;
```

---

## 🔧 Troubleshooting

### "Programs table is empty"
1. Check you're in the correct database (prod vs dev)
2. Run: `SELECT * FROM programs;`
3. If empty, create test programs using Program Builder

### "Exercise IDs don't exist"
1. Check exercises table: `SELECT * FROM exercises LIMIT 10;`
2. If empty, exercises need to be seeded first
3. Use the Program Builder search - it queries the exercises table

### "Column does not exist" errors
Run the migrations in the `scripts/` folder:
- `add-programs-is-active-column.sql`
- `add-trainer-clients-full-name.sql`
- `add-target-reps-column.sql`

### "Exercise pool is null"
Programs created before the Program Builder might have:
- Empty exercise_pool: `[]`
- Null exercise_pool: `null`
- Old structure: Check and migrate if needed

---

## 📊 Query Examples

### View all programs with exercise counts:
```sql
SELECT 
  id,
  name,
  difficulty_level,
  jsonb_array_length(exercise_pool) as exercise_count,
  target_muscle_groups,
  is_active
FROM programs
ORDER BY created_at DESC;
```

### View exercises in a specific program:
```sql
SELECT 
  name,
  jsonb_pretty(exercise_pool) as exercises
FROM programs
WHERE id = 'your-program-id';
```

### Find programs by muscle group:
```sql
SELECT name, target_muscle_groups
FROM programs
WHERE 'Chest' = ANY(target_muscle_groups);
```

---

**Last Updated:** November 10, 2025
