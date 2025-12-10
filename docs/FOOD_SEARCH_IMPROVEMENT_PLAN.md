# Food Search Improvement Plan

**Created:** December 10, 2025  
**Status:** Planning Phase

---

## 🎯 Goals

1. Make common, healthy foods appear first in search results
2. Improve search flexibility (handle "chicken stew" vs "Stew, Chicken")
3. Simplify food names (remove unnecessary qualifiers)
4. Fix incorrect/missing categories
5. Create a sustainable ranking system

---

## 📊 Current Problems

### 1. **Alphabetical Sorting Prioritizes Wrong Foods**

- Searching "milk" shows "Almond milk" first (alphabetically first)
- Should show "Milk, whole" or "Milk, 2%" first (most common)
- Users don't want specialty/alternative items unless specified

### 2. **Name Format Issues**

- USDA format: "Stew, Chicken" → User searches: "chicken stew"
- Overly specific: "Blackberries, wild, raw (Alaska Native)"
- Should be: "Blackberries, raw" or just "Blackberries"

### 3. **Category Problems**

- Milk entries have `category: Unknown` (should be "Dairy and Egg Products")
- Inconsistent categorization across similar foods

### 4. **Search Flexibility**

- Search is too strict (exact substring match)
- Doesn't handle word reordering
- Doesn't tokenize/parse queries intelligently

---

## 🔧 Step-by-Step Fix Plan

### **Phase 1: Data Cleanup & Normalization** (1-2 hours)

#### Step 1.1: Simplify Food Names

**Goal:** Remove unnecessary qualifiers while preserving essential info

**Rules:**

- Remove geographic qualifiers: `(Alaska Native)`, `(Northern Plains Indians)`
- Remove unnecessary specificity: `wild,` when generic exists
- Standardize format: `"Food, preparation"` → `"Food, preparation"` (keep this format)
- Keep important distinctions: `raw`, `cooked`, `canned`, `frozen`
- Keep brand names for branded foods

**Implementation:**

```sql
-- Create name simplification function
CREATE OR REPLACE FUNCTION simplify_food_name(name text)
RETURNS text AS $$
BEGIN
  -- Remove parenthetical geographic/ethnic qualifiers
  name := regexp_replace(name, '\s*\([^)]*Native[^)]*\)', '', 'gi');
  name := regexp_replace(name, '\s*\([^)]*Indian[^)]*\)', '', 'gi');

  -- Remove "wild," when unnecessary
  name := regexp_replace(name, ',\s*wild,', ',', 'gi');
  name := regexp_replace(name, '^wild\s+', '', 'gi');

  -- Remove extra whitespace
  name := regexp_replace(name, '\s+', ' ', 'g');
  name := trim(name);

  RETURN name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all food names
UPDATE foods
SET name = simplify_food_name(name)
WHERE name ~ '\(.*Native.*\)|\(.*Indian.*\)|, wild,';
```

#### Step 1.2: Fix Missing Categories

**Goal:** Ensure all foods have accurate categories

**Approach:**

```sql
-- Fix milk category
UPDATE foods
SET category = 'Dairy and Egg Products'
WHERE name ILIKE '%milk%'
  AND category IN ('Unknown', NULL)
  AND name NOT ILIKE '%milk chocolate%'
  AND name NOT ILIKE '%milkweed%';

-- Fix other common categories
UPDATE foods SET category = 'Poultry Products'
WHERE name ILIKE '%chicken%' AND category IN ('Unknown', NULL);

UPDATE foods SET category = 'Beef Products'
WHERE name ILIKE '%beef%' AND category IN ('Unknown', NULL);

UPDATE foods SET category = 'Fruits and Fruit Juices'
WHERE name ILIKE '%berries%' AND category IN ('Unknown', NULL);
```

#### Step 1.3: Add Searchable Fields

**Goal:** Create normalized search columns

**Implementation:**

```sql
-- Add search helper columns
ALTER TABLE foods ADD COLUMN IF NOT EXISTS name_simplified text;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS search_tokens text;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS commonness_score integer DEFAULT 50;

-- Populate simplified name (lowercase, no punctuation)
UPDATE foods SET name_simplified = lower(regexp_replace(name, '[^a-zA-Z0-9\s]', ' ', 'g'));

-- Create search tokens (individual words)
UPDATE foods SET search_tokens = lower(regexp_replace(name, '[^a-zA-Z0-9\s]', ' ', 'g'));

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_foods_name_simplified ON foods USING gin(to_tsvector('english', name_simplified));
CREATE INDEX IF NOT EXISTS idx_foods_search_tokens ON foods USING gin(to_tsvector('english', search_tokens));
```

---

### **Phase 2: Implement Commonness Scoring** (1 hour)

#### Step 2.1: Define Common Foods List

**Goal:** Boost frequently consumed foods in search results

**Common Foods by Category:**

```javascript
const COMMON_FOODS = {
  dairy: [
    "Milk, whole",
    "Milk, 2%",
    "Milk, reduced fat",
    "Milk, skim",
    "Yogurt, plain",
    "Cheese, cheddar",
    "Eggs",
  ],
  protein: [
    "Chicken breast",
    "Chicken, broilers or fryers, breast, meat only",
    "Beef, ground",
    "Salmon",
    "Tuna",
    "Turkey breast",
  ],
  fruits: [
    "Bananas",
    "Apples",
    "Oranges",
    "Berries",
    "Strawberries",
    "Blueberries",
    "Peaches",
    "Grapes",
  ],
  vegetables: [
    "Broccoli",
    "Carrots",
    "Spinach",
    "Lettuce",
    "Tomatoes",
    "Peppers",
    "Onions",
    "Potatoes",
  ],
  grains: ["Rice, white", "Rice, brown", "Oats", "Bread, whole wheat", "Pasta"],
};
```

**SQL Implementation:**

```sql
-- Boost common foods
UPDATE foods SET commonness_score = 100
WHERE name ILIKE ANY(ARRAY[
  '%Milk, whole%', '%Milk, 2%%', '%Milk, reduced fat%',
  '%Chicken breast%', '%Chicken, broilers%breast%',
  '%Banana%', '%Apple%', '%Orange%', '%Strawberr%',
  '%Broccoli%', '%Rice, white%', '%Oats%'
]);

-- Penalize specialty/uncommon items
UPDATE foods SET commonness_score = 20
WHERE name ILIKE ANY(ARRAY[
  '%baby food%', '%infant formula%', '%game meat%',
  '%exotic%', '%ethnic%', '%wild%'
]);
```

---

### **Phase 3: Improve Search Algorithm** (2 hours)

#### Step 3.1: Flexible Query Parsing

**Goal:** Handle word reordering and partial matches

**New Search Function:**

```javascript
/**
 * Enhanced food search with flexible matching and smart ranking
 */
async function searchFoods(query, limit = 50) {
  // 1. Sanitize and tokenize query
  const sanitized = query.replace(/[,]/g, " ").trim();
  const tokens = sanitized.toLowerCase().split(/\s+/);

  // 2. Build flexible search patterns
  const patterns = [
    sanitized, // Exact phrase
    tokens.join(" "), // Space-separated
    tokens.reverse().join(", "), // Reversed with comma
    tokens.join("%"), // Wildcarded tokens
  ];

  // 3. Multi-stage search with ranking
  let query = supabase.from("foods").select("*");

  // Search across multiple patterns with OR
  const conditions = patterns
    .map((p) => `name.ilike.%${p}%,name_simplified.ilike.%${p}%`)
    .join(",");

  query = query.or(conditions);

  // 4. Execute query
  const { data: results, error } = await query.limit(200);

  if (error) throw error;

  // 5. Client-side ranking and filtering
  const ranked = results
    .filter((food) => !isUnwantedFood(food))
    .map((food) => ({
      ...food,
      relevance_score: calculateRelevance(food, tokens, sanitized),
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit);

  return ranked;
}

/**
 * Calculate relevance score for ranking
 */
function calculateRelevance(food, tokens, originalQuery) {
  let score = 0;
  const name = food.name.toLowerCase();
  const nameSimplified = food.name_simplified || name;

  // 1. Exact match bonus (highest priority)
  if (name === originalQuery.toLowerCase()) score += 1000;

  // 2. Starts with query bonus
  if (name.startsWith(originalQuery.toLowerCase())) score += 500;

  // 3. First word matches
  const firstWord = name.split(/[\s,]/)[0];
  if (tokens.some((t) => firstWord.startsWith(t))) score += 300;

  // 4. All tokens present
  const allTokensPresent = tokens.every((token) =>
    nameSimplified.includes(token),
  );
  if (allTokensPresent) score += 200;

  // 5. Token count bonus (fewer words = more relevant)
  const wordCount = name.split(/\s+/).length;
  score += Math.max(0, 100 - wordCount * 5);

  // 6. Commonness score from database
  score += food.commonness_score || 50;

  // 7. Category relevance
  if (isPreferredCategory(food.category)) score += 50;

  // 8. Brand penalty (generic foods preferred)
  if (
    food.brand_owner &&
    !tokens.some((t) => food.brand_owner.toLowerCase().includes(t))
  ) {
    score -= 30;
  }

  return score;
}

/**
 * Filter out unwanted foods
 */
function isUnwantedFood(food) {
  const name = food.name.toLowerCase();

  // Filter out baby food (already cleaned but double-check)
  if (name.includes("baby") && !name.includes("baby ruth")) return true;

  // Filter out alcoholic beverages
  if (["alcoholic", "liqueur", "wine", "beer"].some((w) => name.includes(w))) {
    return true;
  }

  // Filter out pet food
  if (name.includes("dog food") || name.includes("cat food")) return true;

  return false;
}

/**
 * Preferred categories for general fitness users
 */
function isPreferredCategory(category) {
  const preferred = [
    "Dairy and Egg Products",
    "Poultry Products",
    "Beef Products",
    "Fruits and Fruit Juices",
    "Vegetables and Vegetable Products",
    "Cereal Grains and Pasta",
    "Legumes and Legume Products",
  ];
  return preferred.includes(category);
}
```

---

### **Phase 4: Testing & Validation** (1 hour)

#### Test Cases:

```javascript
const TEST_QUERIES = [
  { query: "milk", expectFirst: "Milk, whole" },
  { query: "chicken breast", expectFirst: "Chicken breast" },
  { query: "chicken stew", expectResults: ["Stew, chicken"] },
  { query: "blackberries", expectFirst: "Blackberries, raw" },
  { query: "diced peaches", expectResults: ["Peaches, canned, diced"] },
  { query: "brown rice", expectFirst: "Rice, brown" },
  { query: "whole milk", expectFirst: "Milk, whole" },
];
```

---

## 📅 Implementation Timeline

### Day 1 (Today):

- ✅ Create this plan
- ⏳ Phase 1.1: Run name simplification SQL (30 min)
- ⏳ Phase 1.2: Fix categories for milk, chicken, common foods (30 min)
- ⏳ Phase 1.3: Add search helper columns (30 min)

### Day 2:

- Phase 2: Implement commonness scoring (1 hour)
- Phase 3: Update search algorithm in NutritionLogPage.jsx (2 hours)
- Phase 4: Test and validate (1 hour)

---

## 🔄 Migration Scripts Needed

1. `scripts/cleanup-food-names.sql` - Name simplification
2. `scripts/fix-food-categories.sql` - Category corrections
3. `scripts/add-search-columns.sql` - Add helper columns
4. `scripts/calculate-commonness-scores.sql` - Score assignment

---

## 📝 Files to Update

### Backend/Database:

- `schema.sql` - Add new columns
- Migration scripts (above)

### Frontend:

- `src/pages/NutritionLogPage.jsx` - Update search function
- `src/utils/foodSearchUtils.js` - NEW: Extract search logic
- `src/constants/commonFoods.js` - NEW: Common foods list

---

## ✅ Success Metrics

After implementation, these should work correctly:

- [ ] "milk" → Shows whole milk, 2% milk, skim milk first
- [ ] "chicken breast" → Shows plain chicken breast first
- [ ] "chicken stew" → Finds "Stew, chicken"
- [ ] "blackberries" → Shows "Blackberries, raw" not wild Alaska native
- [ ] "diced peaches" → Finds peaches (canned/fresh)
- [ ] Almond milk only appears if user types "almond"
- [ ] Buttermilk only appears if user types "butter"

---

## 🚀 Ready to Start?

Shall we begin with Phase 1 (Data Cleanup)?
