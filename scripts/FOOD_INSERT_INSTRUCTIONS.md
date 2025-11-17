# Food Servings Batch Insert - Instructions

## ✅ Schema Fixed!

The `batch-insert-common-foods.sql` file has been corrected to match the actual `food_servings` table schema.

### Column Mapping Applied:
- `brand_name` → `brand`
- `protein` → `protein_g`
- `carbs` → `carbs_g`
- `fat` → `fat_g`
- `fiber` → `fiber_g`
- `sugar` → `sugar_g`
- `food_category` → `category`
- `data_source` → `source`
- `serving_size` + `serving_unit` → `serving_description` (combined as single string)

### What's in the File:
- **115 foods total** across 6 categories
- All with complete, accurate nutrition data
- All set to `enrichment_status='pending'` for AI processing

### Categories:
1. **Proteins (25)**: Chicken, beef, fish, eggs, protein powders
2. **Carbs (25)**: Rice, pasta, bread, oats, potatoes, tortillas
3. **Vegetables (20)**: Broccoli, spinach, carrots, peppers, etc.
4. **Fruits (15)**: Bananas, apples, berries, oranges, etc.
5. **Dairy (10)**: Milk, cheese, yogurt, string cheese
6. **Fats (10)**: Oils, nuts, nut butters, seeds
7. **Restaurant (10)**: Chipotle, Subway, Chick-fil-A, etc.

## How to Run:

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select project: **wkmrdelhoeqhsdifrarn**
3. Click **SQL Editor** in left sidebar
4. Click **+ New Query**
5. Copy entire contents of `batch-insert-common-foods.sql`
6. Paste into editor
7. Click **Run** button
8. Verify success message: "115 rows inserted"

### Option 2: Supabase CLI
```powershell
npx supabase db execute --project-id wkmrdelhoeqhsdifrarn --file scripts/batch-insert-common-foods.sql
```

## After Insert:

### 1. Verify Foods Were Added
Run this query in SQL Editor:
```sql
SELECT COUNT(*) as new_foods 
FROM food_servings 
WHERE enrichment_status = 'pending'
AND created_at > NOW() - INTERVAL '5 minutes';
```
Should return: `115`

### 2. Run Bulk Enrichment
Navigate to: **Trainer Resources → Nutrition Pipeline Monitor → Controls Tab**

Settings:
- **Threshold**: 70 (default)
- **Limit**: 115 (or 50 to do half first)
- Click **"Start Bulk Enrichment"**

This will:
- Call OpenAI GPT-4o for each food
- Enrich with micronutrients (vitamins, minerals)
- Add health insights, allergens, dietary flags
- Calculate quality scores (target: 70+)
- Update enrichment_status to 'completed'

### 3. Monitor Progress
- Check **Processing Queue** tab
- Watch foods move from 'pending' → 'processing' → 'completed'
- Quality scores should increase from 0 to 70-90+

### 4. Test Food Search
Try searching for:
- "Scrambled Eggs" (should now find plain version)
- "Chicken Breast" (grilled, raw, etc.)
- "Brown Rice" (cooked)
- "Whey Protein" (isolate, concentrate)

## What's Next:

### Exercises (100+)
1. Verify `exercises` table schema
2. Create `batch-insert-common-exercises.sql`
3. Cover all muscle groups and equipment types
4. Include difficulty levels and form cues

### Meals (10)
Create realistic meal templates with accurate macros

### Programs (1)
Build complete 8-week training program

### Routines (1)
Design professional routine template

---

**Generated**: 2025-11-17  
**Schema Reference**: `src/types/database.types.ts`  
**SQL File**: `scripts/batch-insert-common-foods.sql`
