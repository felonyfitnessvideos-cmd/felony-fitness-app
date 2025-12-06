# USDA Import - Quick Start

## Status

✅ Script working - streaming 26M nutrient rows  
✅ Found 8,204 Foundation/SR Legacy foods  
⏳ Script needs to run 5-10 minutes to completion  
❌ Database tables not created yet

## Next Steps

### 1. Create Database Tables (REQUIRED FIRST)

Copy this SQL and run it in Supabase SQL Editor:
https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new

```sql
-- Add USDA columns to existing foods table
ALTER TABLE public.foods
ADD COLUMN IF NOT EXISTS fdc_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS data_type TEXT,
ADD COLUMN IF NOT EXISTS calories NUMERIC,
ADD COLUMN IF NOT EXISTS protein_g NUMERIC,
ADD COLUMN IF NOT EXISTS fat_g NUMERIC,
ADD COLUMN IF NOT EXISTS carbs_g NUMERIC,
ADD COLUMN IF NOT EXISTS fiber_g NUMERIC,
ADD COLUMN IF NOT EXISTS sugar_g NUMERIC,
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC,
ADD COLUMN IF NOT EXISTS potassium_mg NUMERIC,
ADD COLUMN IF NOT EXISTS calcium_mg NUMERIC,
ADD COLUMN IF NOT EXISTS iron_mg NUMERIC,
ADD COLUMN IF NOT EXISTS magnesium_mg NUMERIC,
ADD COLUMN IF NOT EXISTS phosphorus_mg NUMERIC,
ADD COLUMN IF NOT EXISTS zinc_mg NUMERIC,
ADD COLUMN IF NOT EXISTS copper_mg NUMERIC,
ADD COLUMN IF NOT EXISTS manganese_mg NUMERIC,
ADD COLUMN IF NOT EXISTS selenium_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_a_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_c_mg NUMERIC,
ADD COLUMN IF NOT EXISTS thiamin_mg NUMERIC,
ADD COLUMN IF NOT EXISTS riboflavin_mg NUMERIC,
ADD COLUMN IF NOT EXISTS niacin_mg NUMERIC,
ADD COLUMN IF NOT EXISTS pantothenic_acid_mg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_b6_mg NUMERIC,
ADD COLUMN IF NOT EXISTS folate_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_b12_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_e_mg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_k_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS vitamin_d_mcg NUMERIC,
ADD COLUMN IF NOT EXISTS saturated_fat_g NUMERIC,
ADD COLUMN IF NOT EXISTS monounsaturated_fat_g NUMERIC,
ADD COLUMN IF NOT EXISTS polyunsaturated_fat_g NUMERIC,
ADD COLUMN IF NOT EXISTS cholesterol_mg NUMERIC;

-- Create portions table
CREATE TABLE IF NOT EXISTS public.portions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    measure_unit TEXT,
    gram_weight NUMERIC,
    amount NUMERIC DEFAULT 1,
    portion_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_foods_data_type ON public.foods(data_type);
CREATE INDEX IF NOT EXISTS idx_foods_fdc_id ON public.foods(fdc_id);
CREATE INDEX IF NOT EXISTS idx_portions_food_id ON public.portions(food_id);

-- RLS policies
ALTER TABLE public.portions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portions are viewable by everyone" ON public.portions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert portions" ON public.portions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 2. Run Import Script

```powershell
node scripts/import_stream.js FoodData_Central_csv_2025-04-24
```

Expected output:

- Step 1: Load 8,204 foods (~10 seconds)
- Step 2: Stream 26M nutrient rows (~5 minutes)
- Step 3: Stream 47K portions (~5 seconds)
- Step 4: Insert 8,204 foods into Supabase (~10 seconds)
- Step 5: Insert 14K portions into Supabase (~5 seconds)

## Troubleshooting

### Script crashes at ~3M rows

- CSV parsing issue with malformed data
- Solution: Restart script, it will continue from where CSV parser stopped

### 0 nutrients matched

- SR Legacy foods (167512+) appear at row 446,150+
- First 3M rows are mostly branded foods (skipped correctly)
- Wait for script to process all 26M rows

### Database insert fails

- Run the SQL migration first in Supabase
- Check that `foods` and `portions` tables exist
- Verify environment variables are loaded

## Data Summary

- Total USDA foods: 2,064,912
- Foundation + SR Legacy: 8,204 (0.4%)
- Branded (skipped): 2,056,708 (99.6%)
- Nutrient rows processed: 26,805,037
- Nutrients matched: ~200,000 (after filtering)
- Portions: 14,636

## Files

- Script: `scripts/import_stream.js`
- Migration: `supabase/migrations/20251205_add_usda_columns.sql`
- Source CSVs: `FoodData_Central_csv_2025-04-24/`
  - food.csv (2M rows)
  - food_nutrient.csv (26M rows, 4GB)
  - food_portion.csv (47K rows)
