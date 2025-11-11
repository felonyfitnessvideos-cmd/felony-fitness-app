# 🚀 Quick Start: Running SQL Migrations

## ⚠️ Common Error You're Seeing:

```
ERROR: 42601: syntax error at or near "scripts"
LINE 2: scripts/add-programs-is-active-column.sql
```

**Why?** You're trying to run a **file path** as SQL code. SQL Editor doesn't understand file paths!

---

## ✅ CORRECT Way to Run Migrations

### Step-by-Step:

1. **Open VS Code**
   - Navigate to `scripts/add-programs-is-active-column.sql`

2. **Copy the SQL Contents**
   - Press `Ctrl+A` (select all)
   - Press `Ctrl+C` (copy)

3. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in left sidebar

4. **Paste and Run**
   - Click "New Query"
   - Press `Ctrl+V` (paste the SQL)
   - Click "Run" button

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the results showing the new column

---

## 📝 Required Migrations (Copy These Directly)

### Migration 1: Add is_active to programs

```sql
-- ============================================================================
-- Add is_active column to programs table
-- ============================================================================

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE programs
SET is_active = true
WHERE is_active IS NULL;

-- Verify
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'programs'
  AND column_name = 'is_active';
```

**Expected Result:** Column `is_active` appears in the verification query.

---

### Migration 2: Add full_name to trainer_clients

```sql
-- ============================================================================
-- Add full_name column to trainer_clients with auto-sync
-- ============================================================================

-- Add full_name column
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Populate existing rows
UPDATE trainer_clients tc
SET full_name = CONCAT(up.first_name, ' ', up.last_name)
FROM user_profiles up
WHERE tc.client_id = up.id
  AND (tc.full_name IS NULL OR tc.full_name = '');

-- Create sync function
CREATE OR REPLACE FUNCTION sync_trainer_client_full_name()
RETURNS TRIGGER AS $$
BEGIN
  SELECT CONCAT(first_name, ' ', last_name)
  INTO NEW.full_name
  FROM user_profiles
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on trainer_clients
DROP TRIGGER IF EXISTS sync_trainer_client_full_name_trigger ON trainer_clients;
CREATE TRIGGER sync_trainer_client_full_name_trigger
BEFORE INSERT OR UPDATE OF client_id ON trainer_clients
FOR EACH ROW
EXECUTE FUNCTION sync_trainer_client_full_name();

-- Create sync function for profile updates
CREATE OR REPLACE FUNCTION sync_trainer_client_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainer_clients
  SET full_name = CONCAT(NEW.first_name, ' ', NEW.last_name)
  WHERE client_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_profiles
DROP TRIGGER IF EXISTS sync_trainer_client_on_profile_update_trigger ON user_profiles;
CREATE TRIGGER sync_trainer_client_on_profile_update_trigger
AFTER UPDATE OF first_name, last_name ON user_profiles
FOR EACH ROW
WHEN (OLD.first_name IS DISTINCT FROM NEW.first_name OR OLD.last_name IS DISTINCT FROM NEW.last_name)
EXECUTE FUNCTION sync_trainer_client_on_profile_update();

-- Verify
SELECT 
    trainer_id,
    client_id,
    full_name,
    status
FROM trainer_clients
LIMIT 5;
```

**Expected Result:** `full_name` column appears with names like "John Doe".

---

### Migration 3: Add target_reps to routine_exercises

```sql
-- ============================================================================
-- Add target_reps column to routine_exercises
-- ============================================================================

ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS target_reps TEXT;

UPDATE routine_exercises 
SET target_reps = '8-12' 
WHERE target_reps IS NULL;

-- Verify
SELECT 
    id,
    exercise_id,
    target_sets,
    target_reps,
    rest_seconds
FROM routine_exercises
LIMIT 5;
```

**Expected Result:** `target_reps` column shows values like "8-12", "5-10", etc.

---

## 🎯 After Running Migrations

### Check Your Programs:

```sql
-- See if you have any programs
SELECT 
  id,
  name,
  difficulty_level,
  jsonb_array_length(exercise_pool) as exercise_count,
  is_active,
  created_at
FROM programs
ORDER BY created_at DESC;
```

### If Empty:

Your test programs might be:
1. In the **other database** (dev vs prod) - check your Supabase project URL
2. **Not created yet** - use the Program Builder in the app to create them

### Create a Test Program:

Use the **Program Builder** in the app (easier):
1. Go to Trainer Dashboard → Programs
2. Click "New Program" 
3. Follow the wizard

Or insert via SQL (harder - need exercise IDs):
```sql
-- First, get some exercise IDs
SELECT id, name FROM exercises LIMIT 10;

-- Then insert a program (replace UUIDs with real exercise IDs)
INSERT INTO programs (
  name, 
  description, 
  difficulty_level,
  exercise_pool,
  is_active
) VALUES (
  'Test Program',
  'Sample workout program',
  'intermediate',
  '[{"exercise_id": "paste-uuid-here", "exercise_name": "Bench Press", "sets": 3, "reps": "10-12", "rest_seconds": 90}]'::jsonb,
  true
);
```

---

## 🔥 Quick Checklist

- [ ] Run Migration 1 (is_active)
- [ ] Run Migration 2 (full_name) 
- [ ] Run Migration 3 (target_reps)
- [ ] Check programs table
- [ ] Create test program if needed
- [ ] Test Program Builder in app

---

## 💡 Pro Tip

Run migrations in **BOTH** databases if you use separate dev/prod:

1. **Development**: Project `ytpblkbwgdbiserhrlqm`
2. **Production**: Project `wkmrdelhoeqhsdifrarn`

This ensures both environments stay in sync!

---

**Need Help?** Check `docs/PROGRAM_DATA_STRUCTURE.md` for detailed explanations.
