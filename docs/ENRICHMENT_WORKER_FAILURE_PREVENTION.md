# Food Enrichment Worker Failure Prevention Strategy

**Created**: November 24, 2025  
**Status**: 🚀 READY FOR IMPLEMENTATION  
**Context**: After fixing 23 corrupted foods (9999.99 values), implementing safeguards for remaining 2000+ foods

---

## 🎯 Goals

1. **Zero failures** on remaining enrichment queue
2. **Prevent data corruption** like the 9999.99 incident
3. **Maintain data quality** throughout enrichment process
4. **Fast recovery** if failures occur

---

## 📊 Current State

### ✅ Database Status
- **Total foods**: 1,000 in production (5,425 available in backup)
- **Corrupted foods**: 0 (fixed November 24, 2025)
- **Data quality**: All checks passing
- **Enrichment queue**: ~2,000+ foods pending enrichment

### 🔍 Root Cause Analysis
**What went wrong**: Normalization script multiplied small servings by excessive factors
- Example: 14g serving × 7.14 multiplier = per 100g
- Result: Overflow to impossible values (8746g carbs, 9999.99 calories)
- Pattern: Only affected small servings (14g-33g range)

---

## 🛡️ Prevention Strategy

### 1. Pre-Enrichment Validation

**Implement validation BEFORE processing each food**:

```javascript
/**
 * Validate food data before enrichment processing
 * @param {Object} food - Food record to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateFoodPreEnrichment(food) {
  const errors = [];
  
  // Check 1: Required fields present
  if (!food.food_name) errors.push('Missing food_name');
  if (!food.serving_description) errors.push('Missing serving_description');
  
  // Check 2: Current values are reasonable (not already corrupted)
  if (food.calories >= 9999) errors.push('Calories already corrupted (>= 9999)');
  if (food.protein_g > 1000) errors.push('Protein already corrupted (> 1000g)');
  if (food.carbs_g > 1000) errors.push('Carbs already corrupted (> 1000g)');
  if (food.fat_g > 1000) errors.push('Fat already corrupted (> 1000g)');
  
  // Check 3: Serving description is parseable
  const servingMatch = food.serving_description.match(/(\d+(?:\.\d+)?)\s*(g|oz|ml|cup|tbsp|tsp)/i);
  if (!servingMatch) errors.push('Unparseable serving description');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 2. Safe Normalization Rules

**CRITICAL**: Implement these rules to prevent repeat of 9999.99 incident

```javascript
/**
 * Safely normalize food serving to per 100g
 * @param {Object} food - Food record with current serving
 * @returns {Object} Normalized food data OR null if unsafe
 */
function safeNormalizeTo100g(food) {
  const serving = parseServingSize(food.serving_description);
  
  // Rule 1: NEVER normalize supplements/vitamins
  const supplementKeywords = ['vitamin', 'supplement', 'pill', 'capsule', 'tablet', 'powder mix'];
  if (supplementKeywords.some(kw => food.food_name.toLowerCase().includes(kw))) {
    return null; // Skip normalization
  }
  
  // Rule 2: NEVER normalize small servings (< 30g)
  if (serving.amount < 30 && serving.unit === 'g') {
    return null; // Skip normalization to prevent overflow
  }
  
  // Rule 3: Only normalize servings between 30g and 500g
  if (serving.unit === 'g' && (serving.amount < 30 || serving.amount > 500)) {
    return null; // Out of safe range
  }
  
  // Rule 4: Calculate multiplier with cap
  const multiplier = 100 / serving.amount;
  if (multiplier > 5.0) {
    return null; // Multiplier too aggressive (would cause overflow)
  }
  
  // Rule 5: Apply normalization with validation
  const normalized = {
    calories: food.calories * multiplier,
    protein_g: food.protein_g * multiplier,
    carbs_g: food.carbs_g * multiplier,
    fat_g: food.fat_g * multiplier,
    // ... other nutrients
  };
  
  // Rule 6: Validate results are realistic
  if (normalized.calories > 900) return null; // Max 900 cal/100g (pure fat)
  if (normalized.protein_g > 100) return null; // Can't exceed 100g/100g
  if (normalized.carbs_g > 100) return null; // Can't exceed 100g/100g
  if (normalized.fat_g > 100) return null; // Can't exceed 100g/100g
  
  const totalMacros = normalized.protein_g + normalized.carbs_g + normalized.fat_g;
  if (totalMacros > 100) return null; // Total can't exceed 100g/100g
  
  return normalized;
}
```

### 3. Post-Enrichment Validation

**Validate enriched data BEFORE saving to database**:

```javascript
/**
 * Validate enriched food data before database save
 * @param {Object} enrichedFood - Enriched food data
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateEnrichedFood(enrichedFood) {
  const errors = [];
  
  // Check 1: Calories are realistic (0-900 cal/100g)
  if (enrichedFood.calories < 0 || enrichedFood.calories > 900) {
    errors.push(`Unrealistic calories: ${enrichedFood.calories}`);
  }
  
  // Check 2: Protein can't exceed 100g/100g
  if (enrichedFood.protein_g < 0 || enrichedFood.protein_g > 100) {
    errors.push(`Impossible protein: ${enrichedFood.protein_g}g`);
  }
  
  // Check 3: Carbs can't exceed 100g/100g
  if (enrichedFood.carbs_g < 0 || enrichedFood.carbs_g > 100) {
    errors.push(`Impossible carbs: ${enrichedFood.carbs_g}g`);
  }
  
  // Check 4: Fat can't exceed 100g/100g
  if (enrichedFood.fat_g < 0 || enrichedFood.fat_g > 100) {
    errors.push(`Impossible fat: ${enrichedFood.fat_g}g`);
  }
  
  // Check 5: Total macros can't exceed 100g/100g
  const totalMacros = enrichedFood.protein_g + enrichedFood.carbs_g + enrichedFood.fat_g;
  if (totalMacros > 105) { // Allow 5g buffer for water/ash
    errors.push(`Impossible total macros: ${totalMacros.toFixed(2)}g`);
  }
  
  // Check 6: Calorie calculation matches macros (within 15% tolerance)
  const calculatedCalories = (enrichedFood.protein_g * 4) + (enrichedFood.carbs_g * 4) + (enrichedFood.fat_g * 9);
  const calorieDiff = Math.abs(enrichedFood.calories - calculatedCalories);
  const calorieVariance = calorieDiff / enrichedFood.calories;
  if (calorieVariance > 0.15 && enrichedFood.calories > 10) {
    errors.push(`Calorie mismatch: ${enrichedFood.calories} cal vs ${calculatedCalories.toFixed(0)} calculated`);
  }
  
  // Check 7: No 9999.99 placeholder values
  if (enrichedFood.calories >= 9999) errors.push('Calories is 9999.99 placeholder');
  if (enrichedFood.protein_g >= 9999) errors.push('Protein is 9999.99 placeholder');
  if (enrichedFood.carbs_g >= 9999) errors.push('Carbs is 9999.99 placeholder');
  if (enrichedFood.fat_g >= 9999) errors.push('Fat is 9999.99 placeholder');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 4. Error Handling & Recovery

**Implement robust error handling in enrichment worker**:

```javascript
/**
 * Process single food with comprehensive error handling
 * @param {Object} food - Food to enrich
 */
async function enrichFoodSafely(food) {
  try {
    // Step 1: Pre-enrichment validation
    const preValidation = validateFoodPreEnrichment(food);
    if (!preValidation.isValid) {
      await logEnrichmentFailure(food.id, 'PRE_VALIDATION_FAILED', preValidation.errors);
      return { success: false, reason: 'pre_validation', errors: preValidation.errors };
    }
    
    // Step 2: Fetch enrichment data from API
    const enrichedData = await fetchNutritionData(food.food_name);
    if (!enrichedData) {
      await logEnrichmentFailure(food.id, 'API_NO_DATA', ['No nutrition data found']);
      return { success: false, reason: 'no_data', errors: ['API returned no data'] };
    }
    
    // Step 3: Normalize if needed (with safety checks)
    let finalData = enrichedData;
    if (needsNormalization(enrichedData)) {
      finalData = safeNormalizeTo100g(enrichedData);
      if (!finalData) {
        await logEnrichmentFailure(food.id, 'NORMALIZATION_UNSAFE', ['Normalization would produce unsafe values']);
        return { success: false, reason: 'unsafe_normalization', errors: ['Normalization skipped for safety'] };
      }
    }
    
    // Step 4: Post-enrichment validation
    const postValidation = validateEnrichedFood(finalData);
    if (!postValidation.isValid) {
      await logEnrichmentFailure(food.id, 'POST_VALIDATION_FAILED', postValidation.errors);
      return { success: false, reason: 'post_validation', errors: postValidation.errors };
    }
    
    // Step 5: Update database with validated data
    const { error } = await supabase
      .from('food_servings')
      .update({
        ...finalData,
        enrichment_status: 'completed',
        last_enrichment: new Date().toISOString(),
        quality_score: calculateQualityScore(finalData)
      })
      .eq('id', food.id);
    
    if (error) {
      await logEnrichmentFailure(food.id, 'DATABASE_UPDATE_FAILED', [error.message]);
      return { success: false, reason: 'database_error', errors: [error.message] };
    }
    
    await logEnrichmentSuccess(food.id, finalData);
    return { success: true, data: finalData };
    
  } catch (error) {
    await logEnrichmentFailure(food.id, 'EXCEPTION', [error.message, error.stack]);
    return { success: false, reason: 'exception', errors: [error.message] };
  }
}
```

### 5. Monitoring & Logging

**Track enrichment progress and failures**:

```javascript
// Create enrichment_logs table for detailed tracking
const logEnrichmentFailure = async (foodId, failureType, errors) => {
  await supabase.from('enrichment_logs').insert({
    food_id: foodId,
    status: 'failed',
    failure_type: failureType,
    errors: errors,
    timestamp: new Date().toISOString()
  });
  
  console.error(`❌ Enrichment failed for ${foodId}: ${failureType}`, errors);
};

const logEnrichmentSuccess = async (foodId, data) => {
  await supabase.from('enrichment_logs').insert({
    food_id: foodId,
    status: 'success',
    enriched_data: data,
    timestamp: new Date().toISOString()
  });
};

// Real-time progress monitoring
let processed = 0;
let succeeded = 0;
let failed = 0;

const updateProgress = () => {
  const total = 2000; // Approximate queue size
  const progress = (processed / total * 100).toFixed(1);
  const successRate = (succeeded / processed * 100).toFixed(1);
  
  console.log(`
📊 Enrichment Progress:
   Processed: ${processed}/${total} (${progress}%)
   Success: ${succeeded} (${successRate}%)
   Failed: ${failed}
   Remaining: ${total - processed}
  `);
};
```

---

## 🔧 Implementation Checklist

### Phase 1: Setup (30 minutes)
- [ ] Create `enrichment_logs` table in database
- [ ] Add validation functions to enrichment worker
- [ ] Add safe normalization rules
- [ ] Implement error handling wrapper
- [ ] Test validation functions with known good/bad data

### Phase 2: Testing (1 hour)
- [ ] Test with 10 foods from different categories
- [ ] Test with small servings (< 30g) - should skip normalization
- [ ] Test with supplements - should skip enrichment
- [ ] Test with edge cases (0g values, missing fields)
- [ ] Verify validation catches impossible values

### Phase 3: Batch Processing (ongoing)
- [ ] Process foods in batches of 50
- [ ] Monitor logs after each batch
- [ ] Verify no failures before next batch
- [ ] Check data quality after every 200 foods
- [ ] Pause if failure rate > 5%

### Phase 4: Verification (after completion)
- [ ] Run `check-current-food-data.js` to verify quality
- [ ] Check enrichment_logs for failure patterns
- [ ] Verify no 9999.99 values appeared
- [ ] Confirm all macros realistic (< 100g/100g)
- [ ] Update quality scores for enriched foods

---

## 🚨 Emergency Procedures

### If Corruption Detected
1. **STOP** enrichment worker immediately
2. Identify affected foods: `SELECT * FROM food_servings WHERE calories >= 9999 OR protein_g > 1000`
3. Restore from backup: Use `fix-corrupted-foods.js` script
4. Review enrichment logs to find failure point
5. Fix validation bug before resuming

### If Failure Rate > 10%
1. **PAUSE** enrichment worker
2. Analyze failure patterns in enrichment_logs
3. Adjust validation rules if needed
4. Test fixes on small sample (10 foods)
5. Resume with increased monitoring

### If API Rate Limiting
1. Implement exponential backoff
2. Add 2-second delay between requests
3. Batch process in smaller groups (25 instead of 50)
4. Consider caching API responses

---

## 📏 Success Metrics

### Data Quality Targets
- ✅ Zero foods with carbs > 100g/100g
- ✅ Zero foods with protein > 100g/100g
- ✅ Zero foods with fat > 100g/100g
- ✅ Zero foods with total macros > 100g/100g
- ✅ Zero 9999.99 placeholder values
- ✅ < 5% enrichment failure rate
- ✅ 100% of failures logged for review

### Processing Targets
- ⚡ Process 200 foods/hour (with API rate limits)
- ⏱️ Complete 2,000 foods in ~10 hours
- 📊 Maintain > 90% success rate
- 🔍 Zero data corruption incidents

---

## 🎓 Lessons Learned

### From 9999.99 Incident
1. **Never trust normalization without validation** - Always check output is realistic
2. **Small servings are dangerous** - High multipliers cause overflow
3. **Supplements should never normalize** - They're measured differently
4. **Backup before bulk operations** - We had clean backup to restore from
5. **Validate before AND after** - Catch bad data at both ends

### Best Practices Going Forward
1. **Test on samples first** - Don't bulk process untested code
2. **Monitor in real-time** - Catch issues early
3. **Log everything** - Makes debugging possible
4. **Set realistic limits** - 900 cal/100g max, 100g/100g macros
5. **Fail fast, fail safely** - Skip unsafe operations, don't force them

---

## 📝 Implementation Files

### Scripts to Create
1. `scripts/enrichment-worker-safe.js` - New enrichment worker with all validations
2. `scripts/test-enrichment-validation.js` - Test suite for validation functions
3. `scripts/monitor-enrichment-progress.js` - Real-time monitoring dashboard
4. `scripts/analyze-enrichment-logs.js` - Post-mortem analysis tool

### Database Changes
```sql
-- Create enrichment logs table
CREATE TABLE enrichment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID REFERENCES food_servings(id),
  status TEXT NOT NULL, -- 'success', 'failed'
  failure_type TEXT, -- 'PRE_VALIDATION_FAILED', 'POST_VALIDATION_FAILED', etc.
  errors JSONB,
  enriched_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrichment_logs_food_id ON enrichment_logs(food_id);
CREATE INDEX idx_enrichment_logs_status ON enrichment_logs(status);
CREATE INDEX idx_enrichment_logs_timestamp ON enrichment_logs(timestamp);
```

---

**Next Steps**: Implement Phase 1 setup, test thoroughly, then begin batch processing with continuous monitoring.

**Emergency Contact**: Check `enrichment_logs` table and halt worker if any corruption detected.

**Documentation**: This strategy prevents repeat of November 2025 9999.99 corruption incident.
