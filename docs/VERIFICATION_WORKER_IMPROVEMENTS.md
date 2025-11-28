# Verification Worker Improvements - 2025-11-28

## Problem Identified

**Issue:** 133 foods flagged as "MAX_CORRECTION_ATTEMPTS_EXCEEDED" despite being accurate
- All 133 foods **pass Atwater check** (within 0-20% tolerance)
- All 133 foods **pass physics check** (macros ≤ serving weight)
- All 133 foods **pass outlier checks** (appropriate for food category)

**Root Cause:** Verification worker required GPT-4 confidence ≥ 80%, causing:
1. False flags for foods with missing/uncertain micronutrient data
2. Conservative AI rejecting accurate macronutrient data due to incomplete micronutrient profiles
3. Slow processing: 1 food every 2 minutes = 30 foods/hour = 170 hours to complete 5,098 foods

---

## Solutions Implemented

### 1. **Lowered GPT Confidence Threshold** (80% → 65%)

**File:** `supabase/functions/nutrition-verification/index.ts`

**Change:**
```typescript
// Before: return result.accurate && result.confidence >= 80
// After:  return result.accurate && result.confidence >= 65
```

**Rationale:**
- If deterministic checks pass (Atwater, Physics, Outliers), GPT just confirms reasonableness
- 65% confidence is sufficient when macros are mathematically correct
- Reduces false flags for foods with incomplete micronutrient data

---

### 2. **Added Batch Processing Support**

**File:** `supabase/functions/nutrition-verification/index.ts`

**Changes:**
- Added `batch_size` parameter (default: 1, configurable)
- Process multiple foods per request instead of just 1
- Return aggregated results: `{ verified: N, flagged: M, batch_size: X }`

**Benefits:**
- Single worker can now process 5-10 foods per run (instead of 1)
- Flexible batch size for manual runs or different worker configs

---

### 3. **Created Parallel Worker System**

**New File:** `.github/workflows/nutrition-verification-parallel.yml`

**Configuration:**
- **5 parallel workers** running simultaneously
- Each worker processes **5 foods per run** (configurable)
- Runs **every 2 minutes**
- Total throughput: **25 foods every 2 minutes = 750 foods/hour**

**Performance:**
- Old: 30 foods/hour → **170 hours** to complete 5,098 foods
- New: 750 foods/hour → **6.8 hours** to complete 5,098 foods
- **25x speed improvement**

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    worker: [1, 2, 3, 4, 5]
  fail-fast: false
  max-parallel: 5
```

---

### 4. **Disabled Old Single Worker**

**File:** `.github/workflows/nutrition-verification-worker.yml`

**Change:** Commented out cron schedule to prevent conflicts
- Old worker still available via manual `workflow_dispatch`
- Default batch size increased to 10 for manual runs

---

## Expected Results

### Immediate Impact
- ✅ Fewer false flags (133 accurate foods should now pass)
- ✅ 25x faster verification (6.8 hours vs 170 hours)
- ✅ Better handling of incomplete micronutrient data

### Verification Outcomes
**53 foods already verified** (quality_score = 100):
- All pass Atwater check (0.2-16% tolerance)
- All pass physics check (with proper serving weights)
- All pass category validation
- Examples: Greek Yogurt (0.2% diff), Cashews, Celery, Carrots

**133 foods to be re-verified**:
- Currently flagged as "MAX_CORRECTION_ATTEMPTS_EXCEEDED"
- All pass deterministic checks
- Should verify successfully with lowered GPT threshold

**119 foods with bad enrichment data**:
- Fixed via SQL (calories estimated, macros reset to NULL)
- Will be re-enriched by enrichment workers
- Then verified by verification workers

**5,098 foods in queue**:
- Normal foods needing first-time verification
- Will be processed at 750/hour rate

---

## Deployment Steps

### 1. Deploy Edge Function Changes
```bash
cd supabase/functions/nutrition-verification
supabase functions deploy nutrition-verification
```

### 2. Enable Parallel Workers
```bash
# Commit and push workflow files
git add .github/workflows/nutrition-verification-parallel.yml
git add .github/workflows/nutrition-verification-worker.yml
git commit -m "feat: Add parallel verification workers (5x workers, 25x faster)"
git push
```

### 3. Monitor First Run
- Check GitHub Actions: https://github.com/felonyfitnessvideos-cmd/felony-fitness-app/actions
- Look for "Nutrition Verification - Parallel Workers"
- Should see 5 workers running simultaneously every 2 minutes

---

## Verification Queries

### Check Progress
```sql
-- Verification status breakdown
SELECT 
  CASE 
    WHEN is_verified = TRUE THEN 'Verified (100%)'
    WHEN needs_review = TRUE THEN 'Flagged for Review'
    ELSE 'In Queue'
  END as status,
  COUNT(*) as count
FROM food_servings
WHERE enrichment_status IN ('completed', 'verified')
GROUP BY 1
ORDER BY count DESC;
```

### Check Worker Performance
```sql
-- Recent verification activity (last hour)
SELECT 
  DATE_TRUNC('minute', last_verification) as minute,
  COUNT(*) as verified_count
FROM food_servings
WHERE last_verification > NOW() - INTERVAL '1 hour'
  AND is_verified = TRUE
GROUP BY 1
ORDER BY 1 DESC;
```

### Check False Flag Rate
```sql
-- Foods flagged as MAX_CORRECTION_ATTEMPTS
SELECT COUNT(*) as flagged_count
FROM food_servings
WHERE review_flags @> ARRAY['MAX_CORRECTION_ATTEMPTS_EXCEEDED'];

-- Expected: Should decrease as workers re-process with new threshold
```

---

## Configuration Options

### Adjust Batch Size
Edit `.github/workflows/nutrition-verification-parallel.yml`:
```yaml
default: '5'  # Change to 10 or 20 for faster processing
```

### Adjust Worker Count
```yaml
matrix:
  worker: [1, 2, 3, 4, 5]  # Add more workers: [1, 2, 3, 4, 5, 6, 7, 8]
```

### Adjust Frequency
```yaml
- cron: '*/2 * * * *'  # Every 2 minutes
# or
- cron: '*/5 * * * *'  # Every 5 minutes (lower API usage)
```

---

## Cost Considerations

### OpenAI API Usage
- **Old:** 30 GPT calls/hour × 24 hours = 720 calls/day
- **New:** 750 GPT calls/hour × 7 hours = 5,250 calls/day (one-time spike)
- **After completion:** 0 calls/hour (queue empty)

**GPT-4o-mini pricing:** ~$0.00015 per call
- Old daily cost: $0.11/day × 7 days = $0.77
- New daily cost: $0.79/day × 1 day = $0.79
- **Total savings:** Complete 7 days earlier, similar total cost

---

## Monitoring & Alerts

### Success Metrics
- ✅ Verification rate: 750 foods/hour
- ✅ False flag rate: <5% (down from ~25%)
- ✅ Time to completion: <7 hours (down from 170 hours)

### Warning Signs
- ⚠️  Workers timing out (increase timeout-minutes)
- ⚠️  API rate limits hit (reduce batch_size or worker count)
- ⚠️  High flag rate (>10% = threshold too strict)

---

## Rollback Plan

If issues occur:

### 1. Disable Parallel Workers
```yaml
# Comment out cron in nutrition-verification-parallel.yml
# on:
#   schedule:
#     - cron: '*/2 * * * *'
```

### 2. Re-enable Single Worker
```yaml
# Uncomment cron in nutrition-verification-worker.yml
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
```

### 3. Revert Confidence Threshold
```typescript
// In index.ts, change back to:
return result.accurate && result.confidence >= 80
```

---

## Next Steps

1. **Deploy changes** to Edge Function and GitHub Actions
2. **Monitor first 2-hour window** (expect 1,500 foods verified)
3. **Review flagged foods** to ensure false flag rate is <5%
4. **Adjust batch size** if workers complete too quickly (queue exhausted)
5. **Document final results** after queue completion

---

**Last Updated:** 2025-11-28  
**Author:** GitHub Copilot + David  
**Status:** Ready for Deployment
