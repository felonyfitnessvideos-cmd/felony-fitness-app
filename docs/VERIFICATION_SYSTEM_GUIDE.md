# Nutrition Data Verification System

**Created**: November 25, 2025  
**Status**: 🚀 READY FOR DEPLOYMENT  
**Purpose**: Automated quality control for nutrition data using deterministic checks and OpenAI validation

---

## 🎯 Overview

The Verification Worker runs every 2 minutes, processing 5 foods per batch through a comprehensive validation pipeline:

1. **Deterministic Checks** (Math, Physics, Outliers)
2. **OpenAI Embedding** (Semantic similarity to USDA reference data)
3. **OpenAI Deep Validation** (GPT-4 triple-check)
4. **Quality Scoring** (Mark as verified with score 100 if all pass)

---

## 🔍 Verification Checks

### 1. Atwater Check (Math Validity) ✅

**Purpose**: Validate calories match macro composition using Atwater factors

**Formula**: 
```
Calculated Calories = (Protein × 4) + (Carbs × 4) + (Fat × 9)
```

**Logic**:
- Compare calculated calories to listed calories
- If difference > 20%, flag as `ATWATER_MISMATCH`
- **Severity**: Warning

**Example Catches**:
- "Brussels Sprouts" listed as 500 calories but only 5g fat
- "Chicken Breast" shows 100 cal but 30g protein (should be ~200 cal)
- "Rice" shows 50 cal but 40g carbs (should be ~160 cal)

**Action**: Flag for review with detailed calculation breakdown

---

### 2. Physics Check (Density Validity) ✅

**Purpose**: Ensure sum of macros doesn't exceed total serving weight

**Formula**:
```
Total Macros = Protein + Carbs + Fat + Fiber
Max Allowed = Serving Weight + 5g buffer (for water/ash)
```

**Logic**:
- For "per 100g" foods: Total macros cannot exceed 105g
- For other servings: Total macros cannot exceed serving weight × 1.05
- If violated, flag as `PHYSICS_VIOLATION`
- **Severity**: CRITICAL

**Example Catches**:
- "Protein Powder" showing 120g protein per 100g (impossible!)
- "Butter" showing 50g protein + 80g fat + 20g carbs = 150g per 100g serving
- "Chicken" with 40g protein + 40g carbs + 40g fat = 120g per 100g

**Action**: Immediate flag for review (critical failure)

---

### 3. Outlier Check (Statistical Validity) ✅

**Purpose**: Category-specific validation based on expected ranges

**Logic**: Compare food values against category expectations

**Rules**:

#### Vegetables
- Fat should be < 10g per 100g (except avocado, olives)
- Calories should be < 100 per 100g (except potatoes)
- Flags: `VEGETABLE_HIGH_FAT`, `VEGETABLE_HIGH_CALORIE`

#### Fruits
- Protein should be < 5g per 100g
- Fat should be < 15g per 100g (except avocado, coconut)
- Flags: `FRUIT_HIGH_PROTEIN`, `FRUIT_HIGH_FAT`

#### Protein Sources (Meat/Poultry/Fish)
- Protein should be > 10g per 100g
- Flag: `PROTEIN_SOURCE_LOW_PROTEIN`

#### Grains/Bread/Pasta
- Carbs should be > 40g per 100g (unless low-carb)
- Flag: `GRAIN_LOW_CARB`

#### Fat Sources (Oil/Butter/Lard)
- Fat should be > 80g per 100g
- Flag: `FAT_SOURCE_LOW_FAT`

**Example Catches**:
- "Broccoli" showing 20g fat per 100g (vegetables don't have that much fat)
- "Apple" showing 15g protein per 100g (fruits don't have that much protein)
- "Chicken Breast" showing 3g protein per 100g (protein sources should have more)

**Action**: Flag for review with category-specific warnings

---

### 4. OpenAI Embedding Check (Semantic Similarity) 🤖

**Purpose**: Compare food against USDA reference data using vector embeddings

**How It Works**:
1. Generate embedding for current food using `text-embedding-3-small`
2. Query Supabase pgvector for nearest 5 USDA reference foods
3. Calculate statistical distance from reference cluster
4. If > 2 standard deviations away, flag for review

**Input Format**:
```
"Apple - 100g serving - 52 calories, 0.3g protein, 14g carbs, 0.2g fat"
```

**Example Catches**:
- "Apple" with 200 calories (reference cluster averages 52 cal)
- "Chicken Breast" with 5g protein (reference cluster averages 30g)
- "Rice" with 50g fat (reference cluster averages 0.3g)

**Action**: Flag if statistically anomalous compared to reference foods

---

### 5. OpenAI Deep Validation (Triple-Check) 🧠

**Purpose**: GPT-4 analyzes all aspects of food data quality

**Questions Asked**:
1. ✅ Does this serving size make sense for this food?
2. ✅ Are the calories and fat content correct for this food?
3. ✅ Are the vitamins and minerals reasonable for this food?
4. ✅ Is the protein and carb content correct for this serving size?
5. ✅ If this is a protein source, does the protein quality justify the PDCAAS score?
6. ✅ Are there any obvious errors or impossible values?
7. ✅ Overall, is this food data ACCURATE and TRUSTWORTHY?

**Response Format** (JSON):
```json
{
  "serving_size_valid": true/false,
  "serving_size_explanation": "...",
  "calories_fat_valid": true/false,
  "calories_fat_explanation": "...",
  "vitamins_minerals_valid": true/false,
  "vitamins_minerals_explanation": "...",
  "protein_carbs_valid": true/false,
  "protein_carbs_explanation": "...",
  "protein_quality_valid": true/false,
  "protein_quality_explanation": "...",
  "no_obvious_errors": true/false,
  "errors_explanation": "...",
  "overall_accurate": true/false,
  "overall_explanation": "...",
  "confidence_score": 0-100
}
```

**Pass Criteria**:
- ALL validations must return `true`
- Confidence score must be ≥ 80%

**Example Catches**:
- "Vitamin C Supplement" with 1000mg vitamin C but labeled as "vegetable"
- "Protein Powder" with unrealistic amino acid profile
- "Milk" with vitamin D levels way above fortified standards

**Action**: Flag if ANY validation fails or confidence < 80%

---

## 📊 Verification Outcomes

### ✅ VERIFIED (Quality Score 100)

**Criteria**: ALL checks passed
- Atwater: ✅ Pass
- Physics: ✅ Pass
- Outlier: ✅ Pass
- Embedding: ✅ Pass
- GPT-4 Deep: ✅ Pass (confidence ≥ 80%)

**Database Updates**:
```sql
UPDATE food_servings SET
  is_verified = TRUE,
  enrichment_quality_score = 100,
  enrichment_status = 'verified',
  needs_review = FALSE,
  verification_details = {all check results},
  last_verification = NOW()
```

---

### ⚠️ FLAGGED FOR REVIEW

**Criteria**: ANY check failed (non-critical)
- One or more warnings detected
- GPT-4 confidence < 80%
- Statistical anomaly detected

**Database Updates**:
```sql
UPDATE food_servings SET
  needs_review = TRUE,
  review_flags = ['ATWATER_MISMATCH', 'VEGETABLE_HIGH_FAT', ...],
  review_details = {detailed check results},
  last_verification = NOW()
```

**Flags Array Examples**:
- `['ATWATER_MISMATCH']` - Calories don't match macros
- `['PHYSICS_VIOLATION']` - Impossible macro totals
- `['VEGETABLE_HIGH_FAT', 'OUTLIER']` - Multiple warnings
- `['GPT_OVERALL_INACCURATE']` - GPT-4 found issues

---

### 🚨 CRITICAL FAILURE

**Criteria**: Physics violation detected
- Total macros exceed serving weight
- Physically impossible data

**Database Updates**:
```sql
UPDATE food_servings SET
  needs_review = TRUE,
  review_flags = ['PHYSICS_VIOLATION'],
  review_details = {physics check results},
  last_verification = NOW()
```

**Action**: IMMEDIATE flag, skip OpenAI checks (data is clearly wrong)

---

## 🚀 Deployment

### Step 1: Add Database Columns
```bash
# Run migration to add verification columns
psql $DATABASE_URL < scripts/add-verification-columns.sql
```

**Columns Added**:
- `is_verified` (BOOLEAN) - TRUE when fully verified
- `needs_review` (BOOLEAN) - TRUE when flagged
- `review_flags` (TEXT[]) - Array of flag codes
- `review_details` (JSONB) - Detailed check results
- `verification_details` (JSONB) - Successful verification details
- `last_verification` (TIMESTAMPTZ) - Last check timestamp

### Step 2: Deploy Edge Function
```bash
supabase functions deploy nutrition-verification
```

**Environment Variables Required**:
- `OPENAI_API_KEY` - For embeddings and GPT-4 validation
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Step 3: Enable GitHub Actions Worker
```bash
# Worker is already committed to:
# .github/workflows/nutrition-verification-worker.yml

# It will start automatically on next cron (every 2 minutes)
# Or trigger manually:
gh workflow run nutrition-verification-worker.yml
```

### Step 4: Monitor Progress
```bash
# Check verification status
node scripts/check-verification-status.js
```

---

## 📈 Performance Metrics

### Processing Rate
- **Batch Size**: 5 foods
- **Frequency**: Every 2 minutes
- **Rate**: 150 foods/hour
- **Daily Capacity**: 3,600 foods/day

### Time Estimates
| Queue Size | Processing Time |
|-----------|----------------|
| 100 foods | ~40 minutes |
| 500 foods | ~3.3 hours |
| 1,000 foods | ~6.7 hours |
| 2,000 foods | ~13.3 hours |
| 5,000 foods | ~33 hours |

### Cost Estimates (OpenAI)
**Per Food**:
- Embedding: $0.00002 (text-embedding-3-small)
- GPT-4 Validation: $0.0015 (gpt-4o-mini, ~500 tokens)
- **Total**: ~$0.00152 per food

**For 5,000 Foods**:
- Total cost: ~$7.60
- Monthly cost (if re-verifying): ~$228

---

## 🎯 Success Criteria

### Data Quality Targets
- ✅ Zero foods with `PHYSICS_VIOLATION` in production
- ✅ < 5% of foods flagged for review
- ✅ > 95% verification coverage
- ✅ All high-traffic foods (> 100 logs) verified
- ✅ Zero user-reported data errors for verified foods

### Operational Targets
- ⚡ < 10 seconds per food verification
- 📊 100% uptime on verification worker
- 🔍 < 24 hours to verify new food additions
- 🚨 < 1 hour to flag critical data errors

---

## 🔧 Maintenance

### Daily Tasks
```bash
# Check verification status
node scripts/check-verification-status.js

# Review flagged foods (if > 50)
# Query: SELECT * FROM foods_needing_review LIMIT 50;
```

### Weekly Tasks
```bash
# Check verification rate
# Target: > 95%

# Review common flag patterns
# Adjust outlier thresholds if needed
```

### Monthly Tasks
```bash
# Audit verified foods quality
# Re-verify foods with user-reported issues
# Update category thresholds based on data
```

---

## 🐛 Troubleshooting

### Worker Not Running
1. Check GitHub Actions: `.github/workflows/nutrition-verification-worker.yml`
2. Verify cron schedule: `*/2 * * * *` (every 2 minutes)
3. Check workflow runs: https://github.com/{org}/{repo}/actions

### OpenAI Errors
1. Verify `OPENAI_API_KEY` is set in Supabase secrets
2. Check API quota/rate limits
3. Review error logs in Edge Function

### High Flag Rate (> 10%)
1. Review common flags: `SELECT review_flags, COUNT(*) FROM food_servings WHERE needs_review = TRUE GROUP BY review_flags`
2. Adjust thresholds if too strict
3. Check if enrichment data quality needs improvement

### Low Verification Rate (< 80%)
1. Check if enrichment workers are running
2. Verify foods have `enrichment_status = 'completed'`
3. Review verification worker logs for errors

---

## 📋 Flag Reference

| Flag Code | Severity | Meaning | Action |
|-----------|----------|---------|--------|
| `ATWATER_MISMATCH` | Warning | Calories don't match macros (>20%) | Review calculation |
| `PHYSICS_VIOLATION` | Critical | Macros exceed serving weight | Immediate fix |
| `VEGETABLE_HIGH_FAT` | Warning | Vegetable has >10g fat/100g | Verify food type |
| `VEGETABLE_HIGH_CALORIE` | Warning | Vegetable has >100 cal/100g | Check portion |
| `FRUIT_HIGH_PROTEIN` | Warning | Fruit has >5g protein/100g | Verify food type |
| `FRUIT_HIGH_FAT` | Warning | Fruit has >15g fat/100g | Check if avocado |
| `PROTEIN_SOURCE_LOW_PROTEIN` | Warning | Meat has <10g protein/100g | Verify data |
| `GRAIN_LOW_CARB` | Warning | Grain has <40g carbs/100g | Check if low-carb |
| `FAT_SOURCE_LOW_FAT` | Warning | Oil/butter has <80g fat/100g | Verify serving |
| `GPT_SERVING_SIZE_INVALID` | Warning | GPT-4 flags serving size | Review portion |
| `GPT_CALORIES_FAT_INVALID` | Warning | GPT-4 flags cal/fat mismatch | Review macros |
| `GPT_MICRONUTRIENTS_INVALID` | Warning | GPT-4 flags vitamin/mineral issues | Check micronutrients |
| `GPT_MACROS_INVALID` | Warning | GPT-4 flags protein/carb issues | Review macros |
| `GPT_ERRORS_DETECTED` | Warning | GPT-4 found obvious errors | Manual review |
| `GPT_OVERALL_INACCURATE` | Warning | GPT-4 low confidence | Comprehensive review |

---

## 🎓 Best Practices

### For Manual Reviews
1. **Check Physics First**: If `PHYSICS_VIOLATION`, data is definitely wrong
2. **Verify Category**: Ensure food is in correct category
3. **Compare to USDA**: Look up food in USDA database
4. **Fix and Re-verify**: Update food, trigger re-verification
5. **Document Changes**: Note what was corrected

### For Adding New Foods
1. **Use USDA Data**: Import from authoritative sources
2. **Normalize Properly**: Don't normalize small servings (<30g)
3. **Set Category**: Assign correct category for outlier checks
4. **Test First**: Add to staging, verify before production

### For Adjusting Thresholds
1. **Review Flags**: Check which flags fire most often
2. **Analyze False Positives**: Are legitimate foods being flagged?
3. **Update Outlier Logic**: Adjust category thresholds in Edge Function
4. **Test Changes**: Verify with known good/bad foods
5. **Deploy and Monitor**: Watch flag rates after changes

---

**Next Steps**: Run `scripts/add-verification-columns.sql`, deploy Edge Function, enable worker, monitor status!
