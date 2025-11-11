# 🚨 URGENT: Programs Table Missing Columns

## The Problem

Your `programs` table is missing these critical columns:
- ❌ `difficulty_level` 
- ❌ `exercise_pool` (JSONB)
- ❌ `program_type`
- ❌ `estimated_weeks`
- ❌ `target_muscle_groups`
- ❌ Other required columns

This is why the Program Builder and TrainerPrograms page won't work!

---

## ✅ SOLUTION: Run This SQL Now

### **Step 1: Check what columns you have**

Copy this and run in Supabase SQL Editor:

```sql
-- See current programs table structure
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'programs'
ORDER BY ordinal_position;
```

### **Step 2: Add ALL missing columns**

Copy and paste this entire block into Supabase SQL Editor:

```sql
-- ============================================================================
-- Add missing columns to programs table
-- ============================================================================

-- Add difficulty_level column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS difficulty_level TEXT 
DEFAULT 'intermediate'
CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

-- Add exercise_pool column (JSONB to store exercise configurations)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS exercise_pool JSONB DEFAULT '[]'::jsonb;

-- Add program_type column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Add estimated_weeks column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS estimated_weeks INTEGER DEFAULT 8;

-- Add target_muscle_groups column (array of muscle group names)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS target_muscle_groups TEXT[] DEFAULT '{}';

-- Add is_active column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_template column (for distinguishing templates from user programs)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add trainer_id column (for trainer-created programs)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add created_by column (if missing - for backward compatibility)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add description column (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add timestamps (if missing)
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_is_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON programs(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_programs_trainer_id ON programs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);

-- Verify all columns were added
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'programs'
ORDER BY ordinal_position;
```

**Expected Result:** You should see all these columns listed:
- ✅ id
- ✅ name
- ✅ description
- ✅ difficulty_level
- ✅ estimated_weeks
- ✅ exercise_pool (jsonb)
- ✅ program_type
- ✅ target_muscle_groups (ARRAY)
- ✅ is_active (boolean)
- ✅ is_template (boolean)
- ✅ trainer_id (uuid)
- ✅ created_by (uuid)
- ✅ created_at (timestamptz)
- ✅ updated_at (timestamptz)

---

## 🎯 After Adding Columns

### **Then run the other migrations:**

#### Migration 2: Full Name (you have this file open)
```sql
-- Copy ALL contents from: scripts/add-trainer-clients-full-name.sql
-- Paste into Supabase SQL Editor and run
```

#### Migration 3: Target Reps
```sql
ALTER TABLE routine_exercises 
ADD COLUMN IF NOT EXISTS target_reps TEXT;

UPDATE routine_exercises 
SET target_reps = '8-12' 
WHERE target_reps IS NULL;
```

---

## 🚀 Test the Program Builder

After running all migrations:

1. Go to **Trainer Dashboard → Programs**
2. Click **"New Program"** button
3. You should see the 3-step wizard:
   - Step 1: Enter name, description, type, difficulty, weeks
   - Step 2: Search and add exercises
   - Step 3: Review and save
4. Save a test program
5. Verify it appears in the programs list

---

## 🔍 Verify Everything Worked

Run this to see your new program:

```sql
SELECT 
  id,
  name,
  difficulty_level,
  program_type,
  estimated_weeks,
  jsonb_array_length(exercise_pool) as exercise_count,
  target_muscle_groups,
  is_active,
  created_at
FROM programs
ORDER BY created_at DESC;
```

---

## 📝 What This Fixes

✅ Program Builder will work  
✅ Trainer Programs page will load  
✅ Programs can store exercise pools  
✅ Difficulty levels can be set  
✅ Muscle groups are tracked  
✅ No more "column does not exist" errors  

---

## ⚠️ Important

Run these migrations in **BOTH databases** if you use separate dev/prod:
1. **Development**: Project `ytpblkbwgdbiserhrlqm`
2. **Production**: Project `wkmrdelhoeqhsdifrarn`

---

**Files Created:**
- `scripts/add-programs-missing-columns.sql` - Complete migration
- `scripts/check-programs-table-structure.sql` - Verification script
