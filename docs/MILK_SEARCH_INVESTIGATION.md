# Milk Search Investigation - December 9, 2025

## Problem

User searches for "milk" but gets "Buttermilk" and "Almond milk" variants first, not regular cow's milk (whole, 2%, skim, etc.).

## Debug Output Analysis

From console logs:

```
[DEBUG] Top 10 sorted results:
1. Buttermilk
2. Buttermilk, low fat
3. Almond milk, chocolate
4. Almond milk, NFS
5. Almond milk, sweetened
6. Almond milk, unsweetened
7. Almond milk, unsweetened, plain, refrigerated
8. Almond milk, unsweetened, plain, shelf stable
9. Almond milk, unsweetened, plain, shelf stable
10. Candies, milk chocolate
```

**CRITICAL FINDING**: No "Milk, whole", "Milk, reduced fat", or plain cow's milk in top 10!

## Root Cause Hypothesis

The USDA `foods` table likely doesn't have entries named exactly:

- "Milk, whole"
- "Milk, 2%"
- "Milk, skim"

Instead, they might be named:

- "Milk, cow's, whole" or "Milk, cow, whole"
- "Milk, whole, cow's"
- "Milk, reduced fat, 2% milkfat"
- "Beverages, Milk, whole"

## Solution Implemented (Commit 4397745)

Updated `getCommonBoost()` function to:

1. Give -100 boost to plain "milk" (if it exists)
2. Give -80 boost to any entry starting with "milk, " followed by common variants:
   - whole, nfs, reduced fat, low fat, lowfat, 2%, 1%, skim, nonfat
3. Give +30 **penalty** to plant-based milks:
   - almond, oat, soy, coconut, rice milk, cashew

This should handle database naming variations like:

- "milk, whole" → -80 boost ✅
- "milk, 2%" → -80 boost ✅
- "milk, reduced fat" → -80 boost ✅
- "almond milk, sweetened" → +30 penalty (pushed down) ✅

## Next Steps

1. Wait for Vercel deployment of commit 4397745
2. Hard refresh browser (Ctrl+Shift+R)
3. Search "milk" again
4. Check console for `[MILK BOOST]` logs showing boost values
5. If still not working, need to query database directly to see actual food names:
   ```sql
   SELECT name FROM foods WHERE name ILIKE '%milk%'
   ORDER BY name LIMIT 50;
   ```

## Potential Alternative Solution

If cow's milk entries don't start with "milk, " pattern, we may need:

1. Add "cow" detection: `if (name.includes('milk') && !name.includes('almond') && !name.includes('oat')...)`
2. Boost any milk WITHOUT plant-based keywords
3. Or manually map specific USDA food IDs to boost values

## Testing Checklist

- [ ] Search "milk" - see cow's milk first?
- [ ] Search "almond milk" - see almond milk first?
- [ ] Search "whole milk" - see whole milk first?
- [ ] Search "skim milk" - see skim milk first?
- [ ] Check console for `[MILK BOOST]` debug logs
