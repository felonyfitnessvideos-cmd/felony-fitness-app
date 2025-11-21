# USDA Data Quality Fix - November 20, 2025

## 🚨 Critical Issue Discovered

**Problem**: Nutrition enrichment was systematically corrupting food data by prioritizing processed/packaged products over whole foods.

**Impact**: 
- Brussels Sprouts showing 500 cal instead of 43 cal (11.6x error!)
- Kale showing 324 cal instead of 35 cal (9.3x error!)
- Green Beans showing 164 cal instead of 31 cal (5.3x error!)
- Users' nutrition tracking completely inaccurate

**Root Cause**: The `nutrition-usda-enrichment` Edge Function was searching USDA data types in wrong order:
```typescript
// WRONG (OLD):
Branded → SR Legacy → Foundation → Survey
// Result: "Brussels Sprouts" matched "Brussels Sprout Chips"

// CORRECT (NEW):
Survey (FNDDS) → Foundation → SR Legacy → Branded
// Result: "Brussels Sprouts" matches FNDDS import or raw whole food
```

---

## ✅ Fix Implementation

### 1. Updated Search Strategy
**File**: `supabase/functions/nutrition-usda-enrichment/index.ts`

**New Priority Order**:
1. **Survey (FNDDS)** - Match our 5000+ imported FNDDS foods first
2. **Foundation** - Lab-analyzed basic ingredients (most accurate)
3. **SR Legacy** - Gold standard for generic foods
4. **Branded** - Packaged products (LAST RESORT only)

**Rationale**:
- We imported 5000 foods directly from FNDDS dataset
- FNDDS contains accurate whole food data
- Foundation/SR Legacy are gold standards for ingredients
- Branded should only be used when nothing else matches

### 2. Created Cleanup Scripts

**File**: `scripts/fix-corrupted-usda-foods.sql` (129 lines)
- Identifies corrupted foods using calorie discrepancy formula
- Marks specific problem patterns (vegetables >100 cal, fruits >150 cal)
- Flags produce with >15g fat (likely fried/chips)
- Sets `enrichment_status = 'pending'` to trigger re-enrichment

**File**: `scripts/verify-usda-data-quality.sql` (105 lines)
- Checks specific problem foods for corrections
- Validates calorie-macro consistency across dataset
- Provides expected value references
- Identifies remaining suspicious entries

### 3. Removed Transaction Wrapper
**Issue**: `BEGIN;` and `COMMIT;` caused trigger function errors:
```
ERROR: trigger functions can only be called as triggers
CONTEXT: compilation of PL/pgSQL function "refresh_pipeline_status"
```

**Solution**: Removed transaction wrapper. Statements run sequentially without explicit transaction control.

---

## 📋 Execution Steps

### Step 1: Deploy Fixed Enrichment Function ✅
```bash
npx supabase functions deploy nutrition-usda-enrichment
```
**Status**: ✅ Deployed successfully on 2025-11-20

### Step 2: Mark Corrupted Foods for Re-enrichment
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new)
2. Copy **entire contents** of `scripts/fix-corrupted-usda-foods.sql`
3. Paste and click **Run**
4. Expected: 20-50+ foods marked as `pending`

### Step 3: Wait for Enrichment Worker
- **Automatic**: GitHub Actions runs nutrition-enrichment every 5 minutes
- **Manual**: Go to Actions → nutrition-enrichment → Run workflow
- **Duration**: 5-10 minutes for processing

### Step 4: Verify Corrections
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new)
2. Copy contents of `scripts/verify-usda-data-quality.sql`
3. Run and verify results match expected values

---

## 📊 Expected Results

### Before Fix (Corrupted Data)
| Food | Calories | Fat | Source |
|------|----------|-----|--------|
| Brussels Sprouts | 500 cal | 28g | Rob's Brands LLC Brussels Sprout Chips |
| Kale, Raw | 324 cal | 16g | Good For Life Ministries Kale Chips |
| Green Beans | 164 cal | 8g | Generic (fried) |
| Apple, Medium | 260 cal | - | Target Stores (dried) |

### After Fix (Correct Data)
| Food | Calories | Fat | Source |
|------|----------|-----|--------|
| Brussels Sprouts | ~43 cal | <1g | Foundation/FNDDS (raw) |
| Kale, Raw | ~35 cal | <1g | SR Legacy (raw) |
| Green Beans | ~31 cal | <0.5g | Foundation (raw) |
| Apple, Medium | ~52 cal | <0.5g | Foundation (fresh) |

---

## 🎯 Validation Criteria

### ✅ Pass Criteria
- Brussels Sprouts: 40-50 cal, <1g fat
- Kale: 30-40 cal, <1g fat
- Green Beans: 30-35 cal, <0.5g fat
- Most vegetables: <1g fat per 100g
- Calorie discrepancy: <20 for most foods
- No fruits/vegetables with >15g fat (except avocado/olives)

### ⚠️ Quality Check Formula
```sql
-- Expected calories = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)
-- Flag if: ABS(actual_calories - calculated_calories) > 30
```

---

## 🔍 Detection Method

### Calorie-Macro Consistency Check
User ran Python analysis comparing `calories` to calculated value:
```python
df['calculated_cal'] = (df['protein_g'] * 4) + (df['carbs_g'] * 4) + (df['fat_g'] * 9)
df['cal_diff'] = abs(df['calories'] - df['calculated_cal'])
df[df['cal_diff'] > 30]  # Found 20+ corrupted entries
```

This revealed the systematic pattern of chips/fried versions being selected.

---

## 🛡️ Prevention Measures

### 1. Ongoing Monitoring
Add to daily checklist:
```sql
-- Flag foods with suspicious calorie/macro ratios
SELECT food_name, calories, 
       ROUND((protein_g * 4) + (carbs_g * 4) + (fat_g * 9), 2) as calculated_cal,
       ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) as diff
FROM food_servings
WHERE enrichment_status = 'completed'
  AND ABS(calories - ((protein_g * 4) + (carbs_g * 4) + (fat_g * 9))) > 30
ORDER BY diff DESC
LIMIT 10;
```

### 2. Future Enhancement Ideas
- Add automated validation in enrichment worker
- Reject data with >50 calorie discrepancy automatically
- Flag suspicious results for manual review before saving
- Add unit tests for search strategy priority
- Track which data type (FNDDS/Foundation/etc.) was used per food

### 3. Documentation Updates
- Updated `.github/copilot-instructions.md` with data quality standards
- Document this incident as case study for future developers
- Add "Data Quality" section to CONTENT_EXPANSION_STRATEGY.md

---

## 📚 Related Files

**Modified**:
- `supabase/functions/nutrition-usda-enrichment/index.ts` - Fixed search priority

**Created**:
- `scripts/fix-corrupted-usda-foods.sql` - Cleanup script
- `scripts/verify-usda-data-quality.sql` - Verification script
- `docs/USDA_DATA_QUALITY_FIX_2025-11-20.md` - This document

**Reference**:
- `.github/copilot-instructions.md` - Code quality standards
- `docs/CONTENT_EXPANSION_STRATEGY.md` - Food database expansion plan

---

## 🎓 Lessons Learned

1. **API Defaults Can Be Wrong**: USDA API returns largest dataset first (Branded has 300K+ items), but that doesn't mean it's the right choice for whole foods.

2. **Test Data Carefully**: "Brussels Sprouts" from an API might not be the Brussels Sprouts you expect. Always validate actual vs. expected results.

3. **Simple Formulas Catch Complex Issues**: The calorie calculation formula (4/4/9 rule) quickly exposed systematic data corruption that quality scores missed.

4. **Transaction Wrappers Can Break Things**: Supabase trigger functions fail inside explicit transactions. Let the database handle implicit transactions.

5. **Prioritize Your Own Data**: When you've imported 5000 foods from a specific dataset (FNDDS), search that first before hitting external APIs.

---

## 📞 Contact

If similar data quality issues arise:
1. Check `verify-usda-data-quality.sql` for suspicious patterns
2. Review enrichment worker logs in GitHub Actions
3. Validate with calorie-macro consistency formula
4. Document findings in this format

**Last Updated**: November 20, 2025  
**Maintainer**: Felony Fitness Development Team
