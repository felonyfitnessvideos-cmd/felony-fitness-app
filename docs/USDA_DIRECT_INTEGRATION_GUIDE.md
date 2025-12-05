# USDA Direct Integration - Setup Guide

## Overview

**Clean, simple architecture**: Import USDA data locally → Search database directly → No APIs, no workers, no enrichment.

## What Changed

### ❌ DELETED (Old Approach)

- ~~GPT enrichment workers~~ → Expensive, slow, inconsistent
- ~~Portion miners~~ → Timeout issues, overcomplicated
- ~~Hybrid search with external APIs~~ → Rate limits, latency
- ~~6 GitHub Action workflows~~ → Background noise
- ~~Mixed serving sizes~~ → Data quality nightmare

### ✅ NEW (USDA Direct)

- Complete USDA database imported locally
- 40+ nutrients per food (not 6-8)
- Direct PostgreSQL full-text search
- No external dependencies
- One-time import, done forever

---

## Setup Instructions

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
supabase/migrations/20251205_create_usda_food_servings.sql
```

This creates:

- `food_servings` table with 40+ nutrient columns
- Full-text search indexes (trigram + tsvector)
- Auto-updating search vectors
- Helper views (`branded_foods`, `foundation_foods`)
- RLS policies

### Step 2: Download USDA Data

Get the latest USDA FoodData Central download:

- **URL**: https://fdc.nal.usda.gov/download-datasets.html
- **File**: `FoodData_Central_csv_YYYY-MM-DD.zip` (Full Download)
- **Size**: ~3-4 GB unzipped

Extract to a local folder (e.g., `C:\usda_data\`)

Required files:

- `food.csv` (core food metadata)
- `food_nutrient.csv` (nutrient values)
- `branded_food.csv` (branded product data)
- `nutrient.csv` (nutrient definitions)

### Step 3: Install Dependencies

```bash
npm install csv-parse @supabase/supabase-js
```

### Step 4: Set Environment Variables

```bash
# .env.local or shell environment
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...  # From Supabase Settings → API
```

### Step 5: Import USDA Data

```bash
# Dry run to test (no database insert)
node scripts/import-usda-data.js C:\usda_data --dry-run

# Import branded foods only (faster, most useful)
node scripts/import-usda-data.js C:\usda_data --data-types=branded_food

# Import branded + foundation foods (recommended)
node scripts/import-usda-data.js C:\usda_data --data-types=branded_food,foundation_food

# Import everything (takes ~30-60 minutes)
node scripts/import-usda-data.js C:\usda_data
```

**Expected results**:

- **Branded foods**: ~600,000 records (commercial products with UPC codes)
- **Foundation foods**: ~1,000 records (USDA reference foods, highest quality)
- **SR Legacy**: ~8,000 records (historical USDA database)

### Step 6: Deploy Search Edge Function

```bash
# Deploy to Supabase
supabase functions deploy usda-search
```

### Step 7: Update Frontend

Replace all `food-search-v2` calls with `usda-search`:

```javascript
// OLD (deleted)
const { data } = await supabase.functions.invoke("food-search-v2", {
  body: { query: "chicken" },
});

// NEW (direct USDA search)
const { data } = await supabase.functions.invoke("usda-search", {
  body: {
    query: "chicken",
    limit: 50,
    data_types: ["branded_food", "foundation_food"],
  },
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  USDA FoodData Central (Downloaded CSV Files)           │
│  - food.csv (1.2M foods)                                │
│  - food_nutrient.csv (65M nutrient values)              │
│  - branded_food.csv (600K branded products)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ ONE-TIME IMPORT
                     │ (node scripts/import-usda-data.js)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL Database                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ food_servings (600K+ records)                   │   │
│  │ - All 40+ nutrients pre-populated              │   │
│  │ - Full-text search indexes                     │   │
│  │ - Trigram fuzzy matching                       │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ SEARCH (edge function)
                     │ (supabase.functions.invoke('usda-search'))
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend (React)                                       │
│  - User types "chicken breast"                          │
│  - Instant search results (50ms)                        │
│  - Complete nutrition data                              │
│  - No external API calls                                │
└─────────────────────────────────────────────────────────┘
```

---

## API Reference

### Search Endpoint

**POST** `/functions/v1/usda-search`

**Request Body**:

```json
{
  "query": "chicken breast",
  "limit": 50,
  "data_types": ["branded_food", "foundation_food"],
  "category": "Meat & Poultry"
}
```

**Response**:

```json
{
  "success": true,
  "query": "chicken breast",
  "total": 42,
  "results": [
    {
      "id": "uuid...",
      "fdc_id": 123456,
      "description": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
      "brand_owner": "Perdue Farms",
      "brand_name": "Perdue Perfect Portions",
      "data_type": "branded_food",
      "category": "Meat & Poultry",
      "serving_size": 112,
      "serving_size_unit": "g",
      "household_serving_fulltext": "1 breast (4 oz)",
      "calories": 165,
      "protein_g": 31,
      "carbs_g": 0,
      "fat_g": 3.6,
      "fiber_g": 0,
      "sugar_g": 0,
      "sodium_mg": 74,
      "similarity": 95
    }
  ]
}
```

---

## Benefits

| Old System                               | New System                    |
| ---------------------------------------- | ----------------------------- |
| 🐌 Slow (30s per food with GPT)          | ⚡ Instant (50ms search)      |
| 💰 Expensive (GPT API costs)             | 🆓 Free (local database)      |
| 🔧 Complex (9 edge functions, 6 workers) | 🎯 Simple (1 search function) |
| 🎲 Unreliable (timeouts, rate limits)    | ✅ Reliable (local data)      |
| 📉 Incomplete (6-8 nutrients)            | 📊 Complete (40+ nutrients)   |
| 🔄 Needs workers (background jobs)       | 🚀 Ready instantly            |

---

## Maintenance

**Updating USDA Data** (quarterly or as needed):

1. Download new USDA CSV files
2. Run import script: `node scripts/import-usda-data.js ./usda_data`
3. Use `--skip-existing` to only add new foods

**No workers needed**. No cron jobs. No GPT calls. **Just works**.

---

## Troubleshooting

### Import fails with "ENOENT" error

- Check that CSV files exist in specified folder
- Required: `food.csv`, `food_nutrient.csv`, `branded_food.csv`

### Import is slow

- Normal: 600K foods takes ~20-30 minutes
- Use smaller batch with `--data-types=branded_food` (~10 minutes)

### Search returns no results

- Check that import completed successfully
- Verify data exists: `SELECT COUNT(*) FROM food_servings;`
- Try broader search terms ("chicken" vs "chicken breast rotisserie")

### Frontend gets CORS errors

- Ensure edge function has `corsHeaders` in response
- Check that function is deployed: `supabase functions list`

---

## Next Steps

1. ✅ Run migration (Step 1)
2. ✅ Import USDA data (Steps 2-5)
3. ✅ Deploy search function (Step 6)
4. 🔄 Update frontend components (Step 7)
5. 🧪 Test search in app
6. 🚀 Deploy to production

---

**Last Updated**: 2025-12-05  
**Status**: Ready for implementation
