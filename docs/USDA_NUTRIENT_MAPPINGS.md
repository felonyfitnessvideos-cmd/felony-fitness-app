# USDA FoodData Central - Nutrient ID Mappings

## Overview

This document maps USDA FoodData Central nutrient IDs to our database columns for direct API integration.

## Primary Macronutrients

| Nutrient ID | Name                         | Unit | Database Column | Notes                |
| ----------- | ---------------------------- | ---- | --------------- | -------------------- |
| **203**     | Protein                      | g    | `protein_g`     | Primary macro        |
| **204**     | Total lipid (fat)            | g    | `fat_g`         | Primary macro        |
| **205**     | Carbohydrate, by difference  | g    | `carbs_g`       | Primary macro        |
| **208**     | Energy                       | kcal | `calories`      | Primary energy value |
| **291**     | Fiber, total dietary         | g    | `fiber_g`       | Dietary fiber        |
| **269**     | Sugars, total including NLEA | g    | `sugar_g`       | Total sugars         |

## Minerals

| Nutrient ID | Name          | Unit | Database Column | Notes                 |
| ----------- | ------------- | ---- | --------------- | --------------------- |
| **301**     | Calcium, Ca   | mg   | `calcium_mg`    | Bone health           |
| **303**     | Iron, Fe      | mg   | `iron_mg`       | Blood health          |
| **304**     | Magnesium, Mg | mg   | `magnesium_mg`  | Muscle/nerve function |
| **305**     | Phosphorus, P | mg   | `phosphorus_mg` | Bone health           |
| **306**     | Potassium, K  | mg   | `potassium_mg`  | Electrolyte           |
| **307**     | Sodium, Na    | mg   | `sodium_mg`     | Electrolyte           |
| **309**     | Zinc, Zn      | mg   | `zinc_mg`       | Immune function       |

## Vitamins

| Nutrient ID | Name                           | Unit | Database Column       | Notes                       |
| ----------- | ------------------------------ | ---- | --------------------- | --------------------------- |
| **318**     | Vitamin A, IU                  | IU   | -                     | Convert to mcg RAE          |
| **320**     | Vitamin A, RAE                 | µg   | `vitamin_a_mcg`       | Retinol Activity Equivalent |
| **401**     | Vitamin C, total ascorbic acid | mg   | `vitamin_c_mg`        | Antioxidant                 |
| **404**     | Thiamin                        | mg   | `thiamin_mg`          | Vitamin B1                  |
| **405**     | Riboflavin                     | mg   | `riboflavin_mg`       | Vitamin B2                  |
| **406**     | Niacin                         | mg   | `niacin_mg`           | Vitamin B3                  |
| **410**     | Pantothenic acid               | mg   | `pantothenic_acid_mg` | Vitamin B5                  |
| **415**     | Vitamin B-6                    | mg   | `vitamin_b6_mg`       | Pyridoxine                  |
| **417**     | Folate, total                  | µg   | `folate_mcg`          | Vitamin B9                  |
| **418**     | Vitamin B-12                   | µg   | `vitamin_b12_mcg`     | Cobalamin                   |
| **421**     | Choline, total                 | mg   | `choline_mg`          | Brain health                |
| **323**     | Vitamin E (alpha-tocopherol)   | mg   | `vitamin_e_mg`        | Antioxidant                 |
| **328**     | Vitamin D (D2 + D3)            | µg   | `vitamin_d_mcg`       | Bone health                 |
| **430**     | Vitamin K (phylloquinone)      | µg   | `vitamin_k_mcg`       | Blood clotting              |

## Fatty Acids

| Nutrient ID | Name                               | Unit | Database Column         | Notes               |
| ----------- | ---------------------------------- | ---- | ----------------------- | ------------------- |
| **606**     | Fatty acids, total saturated       | g    | `saturated_fat_g`       | Bad fat             |
| **645**     | Fatty acids, total monounsaturated | g    | `monounsaturated_fat_g` | Good fat            |
| **646**     | Fatty acids, total polyunsaturated | g    | `polyunsaturated_fat_g` | Good fat            |
| **605**     | Fatty acids, total trans           | g    | `trans_fat_g`           | Very bad fat        |
| **601**     | Cholesterol                        | mg   | `cholesterol_mg`        | Dietary cholesterol |

## Other Important Nutrients

| Nutrient ID | Name           | Unit | Database Column | Notes             |
| ----------- | -------------- | ---- | --------------- | ----------------- |
| **255**     | Water          | g    | `water_g`       | Hydration content |
| **262**     | Caffeine       | mg   | `caffeine_mg`   | Stimulant         |
| **221**     | Alcohol, ethyl | g    | `alcohol_g`     | 7 kcal/g          |

## USDA API Endpoints

### FoodData Central API v1

- **Base URL**: `https://api.nal.usda.gov/fdc/v1/`
- **API Key Required**: Yes (get from data.gov)

### Key Endpoints

1. **Search Foods**

   ```
   GET /foods/search
   Parameters:
   - query: search term
   - dataType: Branded, Foundation, SR Legacy
   - pageSize: results per page (default 50, max 200)
   - pageNumber: page number
   ```

2. **Get Food Details**

   ```
   GET /food/{fdcId}
   Returns complete nutrient data for specific food
   ```

3. **Get Multiple Foods**
   ```
   POST /foods
   Body: { "fdcIds": [123, 456, 789] }
   Returns data for multiple foods in single request
   ```

## Database Schema Changes Needed

### New `food_servings` Structure (USDA Native)

```sql
CREATE TABLE food_servings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- USDA Core Fields
  fdc_id INTEGER UNIQUE NOT NULL,  -- USDA FoodData Central ID
  food_name TEXT NOT NULL,
  description TEXT,
  data_type TEXT,  -- 'Branded', 'Foundation', 'SR Legacy', etc.

  -- Serving Information
  serving_size DECIMAL,  -- e.g., 100
  serving_unit TEXT,     -- e.g., 'g', 'ml'
  household_serving_fulltext TEXT,  -- e.g., '1 cup', '1 packet'

  -- Macronutrients (Nutrient IDs: 203, 204, 205, 208, 291, 269)
  protein_g DECIMAL DEFAULT 0,
  fat_g DECIMAL DEFAULT 0,
  carbs_g DECIMAL DEFAULT 0,
  calories DECIMAL DEFAULT 0,
  fiber_g DECIMAL DEFAULT 0,
  sugar_g DECIMAL DEFAULT 0,

  -- Minerals (Nutrient IDs: 301, 303, 304, 305, 306, 307, 309)
  calcium_mg DECIMAL DEFAULT 0,
  iron_mg DECIMAL DEFAULT 0,
  magnesium_mg DECIMAL DEFAULT 0,
  phosphorus_mg DECIMAL DEFAULT 0,
  potassium_mg DECIMAL DEFAULT 0,
  sodium_mg DECIMAL DEFAULT 0,
  zinc_mg DECIMAL DEFAULT 0,

  -- Vitamins (Nutrient IDs: 320, 401, 404, 405, 406, 410, 415, 417, 418, 421, 323, 328, 430)
  vitamin_a_mcg DECIMAL DEFAULT 0,
  vitamin_c_mg DECIMAL DEFAULT 0,
  thiamin_mg DECIMAL DEFAULT 0,
  riboflavin_mg DECIMAL DEFAULT 0,
  niacin_mg DECIMAL DEFAULT 0,
  pantothenic_acid_mg DECIMAL DEFAULT 0,
  vitamin_b6_mg DECIMAL DEFAULT 0,
  folate_mcg DECIMAL DEFAULT 0,
  vitamin_b12_mcg DECIMAL DEFAULT 0,
  choline_mg DECIMAL DEFAULT 0,
  vitamin_e_mg DECIMAL DEFAULT 0,
  vitamin_d_mcg DECIMAL DEFAULT 0,
  vitamin_k_mcg DECIMAL DEFAULT 0,

  -- Fatty Acids (Nutrient IDs: 606, 645, 646, 605, 601)
  saturated_fat_g DECIMAL DEFAULT 0,
  monounsaturated_fat_g DECIMAL DEFAULT 0,
  polyunsaturated_fat_g DECIMAL DEFAULT 0,
  trans_fat_g DECIMAL DEFAULT 0,
  cholesterol_mg DECIMAL DEFAULT 0,

  -- Other (Nutrient IDs: 255, 262, 221)
  water_g DECIMAL DEFAULT 0,
  caffeine_mg DECIMAL DEFAULT 0,
  alcohol_g DECIMAL DEFAULT 0,

  -- Branded Food Specific
  brand_owner TEXT,
  brand_name TEXT,
  gtin_upc TEXT,
  ingredients TEXT,

  -- Metadata
  category TEXT,
  publication_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_food_servings_fdc_id ON food_servings(fdc_id);
CREATE INDEX idx_food_servings_food_name ON food_servings USING gin(food_name gin_trgm_ops);
CREATE INDEX idx_food_servings_brand ON food_servings(brand_owner);
CREATE INDEX idx_food_servings_category ON food_servings(category);
```

## Implementation Strategy

### Phase 1: Direct USDA Integration

1. Create new `usda-food-search` edge function
2. Search USDA API directly (no local cache initially)
3. Transform USDA response to our format on-the-fly
4. Return results to frontend

### Phase 2: Smart Caching

1. Cache frequently searched foods in `food_servings`
2. Store complete USDA response in JSONB column for reference
3. Update cache weekly via background worker

### Phase 3: User Additions

1. Allow users to add custom foods (mark as `data_type: 'Custom'`)
2. Validate custom entries against USDA patterns
3. Suggest USDA matches for custom foods

## Nutrient Extraction Function

```typescript
// Example: Transform USDA API response to our schema
function extractNutrients(fdcFood: any): FoodServing {
  const nutrientMap = {
    203: "protein_g",
    204: "fat_g",
    205: "carbs_g",
    208: "calories",
    291: "fiber_g",
    269: "sugar_g",
    301: "calcium_mg",
    303: "iron_mg",
    306: "potassium_mg",
    307: "sodium_mg",
    // ... rest of mappings
  };

  const result: Partial<FoodServing> = {
    fdc_id: fdcFood.fdcId,
    food_name: fdcFood.description,
    data_type: fdcFood.dataType,
    brand_owner: fdcFood.brandOwner,
    gtin_upc: fdcFood.gtinUpc,
    ingredients: fdcFood.ingredients,
  };

  // Extract nutrients
  fdcFood.foodNutrients?.forEach((nutrient: any) => {
    const columnName = nutrientMap[nutrient.nutrientId];
    if (columnName) {
      result[columnName] = nutrient.value || 0;
    }
  });

  return result as FoodServing;
}
```

## References

- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- [API Documentation](https://fdc.nal.usda.gov/api-guide.html)
- [Get API Key](https://api.data.gov/signup/)
- [Nutrient List](https://fdc.nal.usda.gov/nutrient-list.html)

---

**Last Updated**: 2025-12-05  
**Status**: Planning Phase - USDA Direct Integration
