# SQL Migration Status

## ⚠️ MIGRATION NEEDED

### Current Status
The SQL migration for warmup/intensity columns has **NOT** been applied yet.

### What Needs to Be Done
Run the SQL script: `scripts/add-exercise-warmup-intensity.sql`

### Steps to Apply Migration

#### Option 1: Supabase Dashboard (Recommended)
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **felony-fitness-app**
3. Go to **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy contents of `scripts/add-exercise-warmup-intensity.sql`
6. Paste into editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify success: Should see "2 rows" in results showing the new columns

#### Option 2: Supabase CLI (Advanced)
```bash
cd c:\Users\david\felony-fitness-app-production
supabase db push scripts/add-exercise-warmup-intensity.sql
```

### What This Migration Adds

**Table:** `program_routines_exercises`

**New Columns:**
1. `is_warmup` (BOOLEAN, default: false)
   - Marks exercises as warmup sets
   - Used by routine generator for warmup/cooldown structure

2. `target_intensity_pct` (INTEGER, default: 75)
   - Target intensity as % of 1RM
   - Range: 0-100 (enforced by CHECK constraint)
   - Typical values:
     - Warmup: 50%
     - Working sets: 70-80%
     - Peak intensity: 90-100%
     - Cooldown: 30%

### Why It's Optional Right Now

The routine generator (`src/utils/routineGenerator.js`) will work WITHOUT this migration, but:
- ❌ Won't be able to SAVE warmup flags to database
- ❌ Won't be able to SAVE intensity percentages
- ❌ Trainers can't customize intensity per exercise in UI
- ✅ Generated routines WILL still follow the structure rules
- ✅ Intensity is calculated in-memory during generation

### When You NEED to Apply It

Apply this migration **BEFORE**:
1. Updating ProgramBuilderModal to show warmup checkbox
2. Adding intensity sliders to exercise editor
3. Displaying intensity badges on routine cards
4. Allowing trainers to customize generated routines

### Verification After Migration

Run this query in Supabase SQL Editor:
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'program_routines_exercises'
  AND column_name IN ('is_warmup', 'target_intensity_pct')
ORDER BY column_name;
```

Expected result:
```
column_name           | data_type | column_default | is_nullable
--------------------- | --------- | -------------- | -----------
is_warmup             | boolean   | false          | YES
target_intensity_pct  | integer   | 75             | YES
```

---

**Bottom Line:** The routine generator works now, but you'll need this migration to unlock full UI functionality for warmup/intensity customization.
