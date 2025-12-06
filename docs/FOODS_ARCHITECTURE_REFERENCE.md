# Quick Reference: New Foods Architecture

## Database Structure

### Foods Table (Nutrition per 100g)

```sql
foods
├── id (uuid, primary key)
├── name (text) - Food name
├── brand_owner (text) - Brand/manufacturer
├── category (text) - Food category
├── data_source (text) - 'USDA_IMPORT' or 'USER_CUSTOM'
├──
├── Macros (per 100g)
├── calories (numeric)
├── protein_g (numeric)
├── carbs_g (numeric)
├── fat_g (numeric)
├── sugar_g (numeric)
├── fiber_g (numeric)
├──
├── Minerals (per 100g)
├── sodium_mg, potassium_mg, calcium_mg, iron_mg
├── magnesium_mg, phosphorus_mg, zinc_mg
├── copper_mg, selenium_mcg, cholesterol_mg
├──
├── Vitamins (per 100g)
├── vitamin_a_mcg, vitamin_c_mg, vitamin_e_mg
├── vitamin_d_mcg, vitamin_k_mcg
├── thiamin_mg, riboflavin_mg, niacin_mg
├── vitamin_b6_mg, folate_mcg, vitamin_b12_mcg
├──
└── Metadata
    ├── quality_score (integer)
    ├── enrichment_status (text)
    ├── last_enrichment (timestamp)
    ├── created_at (timestamp)
    └── updated_at (timestamp)
```

### Portions Table (Serving Sizes)

```sql
portions
├── id (uuid, primary key)
├── food_id (uuid) → foods.id
├── amount (numeric) - Quantity (e.g., 1, 0.5)
├── measure_unit (text) - Unit (e.g., "cup", "oz")
├── gram_weight (numeric) - Weight in grams
├── portion_description (text) - Display text
└── created_at (timestamp)
```

### Foreign Keys (Updated)

```sql
meal_foods.food_id → foods.id
nutrition_logs.food_id → foods.id
user_meal_foods.food_id → foods.id
```

---

## Code Patterns

### ✅ Search Foods (Client-Side)

```javascript
import { searchFoods } from "../utils/foodSearch";

const results = await searchFoods("chicken breast");
// Returns: Array of foods with portions embedded
```

### ✅ Direct Supabase Query

```javascript
const { data: foods, error } = await supabase
  .from("foods")
  .select("*, portions(*)")
  .or("name.ilike.%chicken%,brand_owner.ilike.%tyson%")
  .limit(20);
```

### ✅ Calculate Nutrition for Display

```javascript
import { formatFoodForDisplay } from "../utils/foodSearch";

const food = {
  /* food from foods table */
};
const portion = {
  /* portion from portions table */
};

const displayFood = formatFoodForDisplay(food, portion);
// Returns food with nutrition calculated for portion size
```

### ✅ Insert Custom Food

```javascript
// Insert food (stored per 100g)
const { data: newFood } = await supabase
  .from("foods")
  .insert({
    name: "My Custom Food",
    brand_owner: "Homemade",
    category: "custom",
    data_source: "USER_CUSTOM",
    calories: 200,
    protein_g: 25,
    carbs_g: 10,
    fat_g: 8,
  })
  .select()
  .single();

// Create default portion
await supabase.from("portions").insert({
  food_id: newFood.id,
  amount: 1,
  measure_unit: "serving",
  gram_weight: 100,
  portion_description: "1 serving (100g)",
});
```

### ✅ Log Food to Nutrition Log

```javascript
const { error } = await supabase.from("nutrition_logs").insert({
  user_id: user.id,
  food_id: selectedFood.id, // ← Changed from food_serving_id
  meal_type: "breakfast",
  quantity_consumed: 1.5,
  log_date: "2025-01-06",
});

// Database trigger automatically calculates nutrition values
```

### ✅ Add Food to Meal

```javascript
await supabase.from("user_meal_foods").insert({
  user_meal_id: mealId,
  food_id: foodId, // ← Changed from food_servings_id
  quantity: 2,
  notes: "Extra protein",
});
```

---

## Nutrition Calculation

### Formula

```
displayValue = (baseValue * portionGramWeight / 100) * quantity
```

### Example 1: 100g Portion

```javascript
// Food: Chicken breast (per 100g)
calories: 165
protein_g: 31

// Portion: 100g (1:1 ratio)
gram_weight: 100

// User logs 2 servings
quantity: 2

// Display:
calories = (165 * 100 / 100) * 2 = 330 cal
protein = (31 * 100 / 100) * 2 = 62g
```

### Example 2: Cup Portion

```javascript
// Food: Rice (per 100g)
calories: 130
carbs_g: 28

// Portion: 1 cup cooked
gram_weight: 195

// User logs 1.5 servings
quantity: 1.5

// Display:
calories = (130 * 195 / 100) * 1.5 = 380 cal
carbs = (28 * 195 / 100) * 1.5 = 82g
```

---

## Common Queries

### Get Food with All Portions

```sql
SELECT f.*,
       json_agg(p.*) as portions
FROM foods f
LEFT JOIN portions p ON f.id = p.food_id
WHERE f.name ILIKE '%chicken%'
GROUP BY f.id;
```

### Search Foods (Case-Insensitive)

```sql
SELECT * FROM foods
WHERE name ILIKE '%search term%'
   OR brand_owner ILIKE '%search term%'
ORDER BY name
LIMIT 20;
```

### Get User's Nutrition Logs with Food Details

```sql
SELECT nl.*, f.name, f.brand_owner
FROM nutrition_logs nl
JOIN foods f ON nl.food_id = f.id
WHERE nl.user_id = 'user-uuid'
  AND nl.log_date = '2025-01-06'
ORDER BY nl.created_at;
```

### Get Meal with Foods

```sql
SELECT m.*,
       json_agg(
         json_build_object(
           'food', f.*,
           'quantity', umf.quantity,
           'notes', umf.notes
         )
       ) as foods
FROM user_meals m
LEFT JOIN user_meal_foods umf ON m.id = umf.user_meal_id
LEFT JOIN foods f ON umf.food_id = f.id
WHERE m.user_id = 'user-uuid'
GROUP BY m.id;
```

---

## Validation Rules

### Foods Table

- ✅ `name` must not be empty
- ✅ `data_source` should be 'USDA_IMPORT' or 'USER_CUSTOM'
- ✅ All nutrition values should be >= 0
- ✅ `quality_score` should be 0-100

### Portions Table

- ✅ `food_id` must reference valid food
- ✅ `amount` must be > 0
- ✅ `gram_weight` must be > 0
- ✅ `measure_unit` should not be empty

### Foreign Keys

- ✅ `meal_foods.food_id` → `foods.id`
- ✅ `nutrition_logs.food_id` → `foods.id`
- ✅ `user_meal_foods.food_id` → `foods.id`
- ✅ All use `ON DELETE SET NULL` for safety

---

## Migration Notes

### Deprecated Fields (DO NOT USE)

- ❌ `food_servings` table (use `foods` + `portions`)
- ❌ `food_servings_id` column (use `food_id`)
- ❌ `food_serving_id` column (use `food_id`)
- ❌ `food_name` column (use `foods.name`)

### Updated Fields

- ✅ `food_id` (replaces food_servings_id)
- ✅ `foods.name` (replaces food_servings.food_name)
- ✅ `data_source` (replaces source)
- ✅ `brand_owner` (replaces brand)

---

## Troubleshooting

### "food_id cannot be null" Error

**Cause:** Trying to insert without proper food reference  
**Fix:** Ensure food exists in `foods` table first, then use its `id`

### Nutrition Values Seem Wrong

**Cause:** Forgetting to multiply by portion size  
**Fix:** Use formula: `(baseValue * gram_weight / 100) * quantity`

### Search Returns No Results

**Cause:** Querying old `food_servings` table  
**Fix:** Update query to use `foods` table: `.from('foods')`

### External Food Creation Fails

**Cause:** Using old `food_servings` insert pattern  
**Fix:**

1. Insert into `foods` table
2. Create corresponding `portions` record
3. Use `foods.id` for foreign keys

---

## Performance Tips

### Use Indexes

```sql
-- Already created by migration script
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_brand ON foods(brand_owner);
CREATE INDEX idx_portions_food_id ON portions(food_id);
```

### Batch Queries

```javascript
// Good: Single query with join
const { data } = await supabase
  .from("foods")
  .select("*, portions(*)")
  .in("id", foodIds);

// Bad: Multiple separate queries
for (const id of foodIds) {
  await supabase.from("foods").select("*").eq("id", id);
}
```

### Limit Results

```javascript
// Always limit search results
const { data } = await supabase
  .from("foods")
  .select("*")
  .ilike("name", "%search%")
  .limit(20); // Prevents loading thousands of rows
```

---

## Testing Checklist

### ✓ Search

- [ ] Search returns foods from `foods` table
- [ ] Portions display correctly
- [ ] Brand names show properly

### ✓ Logging

- [ ] Can log food with quantity
- [ ] Nutrition calculates correctly
- [ ] Custom foods save properly

### ✓ Meals

- [ ] Can create meal with foods
- [ ] Meal loading works
- [ ] Foods display in meal builder

### ✓ Calculations

- [ ] 100g portion = base values
- [ ] Custom portions scale correctly
- [ ] Multiple quantities multiply properly

---

_Quick Reference v1.0 | Last Updated: 2025-01-06_
