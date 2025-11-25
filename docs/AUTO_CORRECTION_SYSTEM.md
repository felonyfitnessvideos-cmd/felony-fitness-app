# 🤖 Auto-Correcting Nutrition Verification System

**Status**: ✅ LIVE (Deployed Nov 25, 2025)

## Overview

The verification system now **automatically corrects** nutrition data using GPT-4 instead of just flagging issues for manual review.

---

## 🔄 Auto-Correction Flow

```
1. Fetch next unverified food (highest quality score first)
   ↓
2. Run deterministic checks:
   • Atwater Check (calorie math validation)
   • Physics Check (density validation)
   • Outlier Check (category-specific rules)
   ↓
3. Issues found? → Ask GPT-4 for corrections
   ↓
4. GPT-4 provides corrected values based on USDA data
   ↓
5. Apply corrections to database
   ↓
6. Re-run all checks with new values
   ↓
7. Still have issues? → Loop back to step 3 (max 3 attempts)
   ↓
8. OUTCOMES:
   ✅ VERIFIED → All checks pass → quality_score=100, is_verified=TRUE
   ⚠️  FLAGGED → Can't fix after 3 attempts → needs_review=TRUE
```

---

## 📊 Processing Metrics

| Metric | Value |
|--------|-------|
| **Batch Size** | 1 food per run |
| **Frequency** | Every 2 minutes |
| **Rate** | 30 foods/hour, 720/day |
| **Max Correction Attempts** | 3 per food |
| **Timeline** | ~7.5 days for 5,400 foods |
| **Current Remaining** | 3,772 foods |
| **Expected Timeline** | ~5.2 days for remaining |

---

## 💰 Cost Estimate

### Per Food Cost:
- **GPT-4o-mini corrections**: $0.0015 per attempt × 3 max = **$0.0045**
- **GPT-4o-mini verification**: $0.0015 × 1 = **$0.0015**
- **Total per food (worst case)**: **$0.0060**
- **Average per food (assuming 1.5 attempts)**: **$0.0030**

### Total Project Cost:
- **3,772 remaining foods × $0.0030** = **~$11.32**
- **Worst case (all 3 attempts)**: **~$22.64**

---

## 🎯 Success Criteria

### Verified Food Requirements:
1. ✅ Atwater Check: Calories match (P×4 + C×4 + F×9) within 20%
2. ✅ Physics Check: Sum of macros ≤ serving weight
3. ✅ Outlier Check: Values appropriate for food category
4. ✅ GPT-4 Verification: Confirms all values are accurate (80%+ confidence)

### Flagged for Review (After 3 Attempts):
- Values still fail deterministic checks after corrections
- GPT-4 cannot provide confident corrections
- Conflicting data (GPT says correct, but deterministic checks fail)

---

## 📝 Example Correction Session

### Food: "Banana Peppers, pickled"
**Attempt 1:**
```
Initial Values:
- Calories: 150 kcal
- Protein: 2g, Carbs: 8g, Fat: 12g

Issues Detected:
- ATWATER_MISMATCH: (2×4 + 8×4 + 12×9 = 148) vs 150 = OK
- VEGETABLE_HIGH_FAT: 12g fat is unusual for vegetables

GPT-4 Correction:
- Reasoning: "Pickled banana peppers typically have ~0.5g fat per 100g"
- Corrected Fat: 0.5g
- Corrected Calories: 48 kcal
```

**Attempt 2:** Re-verify with new values
```
Updated Values:
- Calories: 48 kcal
- Protein: 2g, Carbs: 8g, Fat: 0.5g

All Checks: ✅ PASSED

GPT-4 Final Verification: ✅ "Values are accurate" (95% confidence)

Outcome: VERIFIED (quality_score = 100)
```

---

## 🔍 Monitoring

### Check Status:
```powershell
Get-Content .env.local | ForEach-Object { 
  if ($_ -match '^([^=]+)=(.*)$') { 
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') 
  } 
}
node scripts/check-verification-status.js
```

### View Logs:
```powershell
# Latest run
gh run list --workflow="nutrition-verification-worker.yml" --limit 1

# Watch in real-time
gh run watch <run-id>

# View specific run logs
gh run view <run-id> --log
```

### Query Database:
```sql
-- Verification statistics
SELECT * FROM get_verification_stats();

-- Recently verified foods
SELECT food_name, verification_details 
FROM food_servings 
WHERE is_verified = TRUE 
ORDER BY last_verification DESC 
LIMIT 10;

-- Foods needing review (couldn't auto-fix)
SELECT * FROM foods_needing_review LIMIT 20;
```

---

## 🎛️ Configuration

### Adjust Max Attempts:
Edit `supabase/functions/nutrition-verification/index.ts`:
```typescript
const MAX_CORRECTION_ATTEMPTS = 3 // Increase for harder-to-fix foods
```

### Adjust Batch Size (if needed):
Edit `.github/workflows/nutrition-verification-worker.yml`:
```yaml
default: '1' # Change to 2 or 3 for faster processing (but less thorough)
```

### Adjust Frequency:
Edit `.github/workflows/nutrition-verification-worker.yml`:
```yaml
cron: '*/2 * * * *' # Change */2 to */5 for every 5 minutes
```

---

## 🚨 Troubleshooting

### Issue: Too many foods flagged for review
**Solution**: Increase `MAX_CORRECTION_ATTEMPTS` to 5 or adjust outlier check thresholds

### Issue: GPT-4 making wrong corrections
**Solution**: Review flagged foods and add specific rules to deterministic checks

### Issue: Processing too slow
**Solution**: Increase batch size to 2-3 foods (but may reduce correction quality)

### Issue: High OpenAI costs
**Solution**: Reduce max attempts or add more aggressive filtering before GPT-4 calls

---

## 📈 Expected Results

### After 24 Hours:
- **Processed**: ~720 foods
- **Verified**: ~650 foods (90% success rate)
- **Flagged**: ~70 foods (10% need human review)
- **Cost**: ~$2.16

### After 5 Days:
- **Processed**: ~3,600 foods (95% of remaining)
- **Verified**: ~3,240 foods
- **Flagged**: ~360 foods
- **Cost**: ~$10.80

### Final Results (7.5 days):
- **Total Processed**: 5,400 foods
- **Verified**: ~4,860 foods (90%)
- **Flagged**: ~540 foods (10%)
- **Total Cost**: ~$16.20

---

## 🎉 Benefits Over Manual Review

| Aspect | Manual Review | Auto-Correction |
|--------|---------------|-----------------|
| **Speed** | ~5 min/food | ~20 sec/food |
| **Consistency** | Variable | 100% consistent |
| **Coverage** | Spot-check | All foods verified |
| **Cost** | $50/hour labor | $0.003/food AI |
| **Scale** | Limited | Unlimited |
| **Quality** | Human error | GPT-4 + checks |

---

## 🔮 Future Enhancements

### Phase 2 (Optional):
- [ ] Embedding-based similarity check (requires pgvector)
- [ ] Learn from human corrections on flagged foods
- [ ] Confidence-based retry logic (high confidence = fewer attempts)
- [ ] Batch processing for similar foods (e.g., "Apple, raw" variants)
- [ ] Auto-categorization correction (fix miscategorized foods)

### Phase 3 (Optional):
- [ ] Real-time verification as foods are added
- [ ] User-submitted corrections with auto-verification
- [ ] Quality score boosting for highly-used foods
- [ ] Webhook notifications for high-priority flags

---

## 📞 Support

**Worker Status**: Check GitHub Actions tab for latest runs  
**API Logs**: View in Supabase Dashboard > Edge Functions > nutrition-verification  
**Database**: Query `foods_needing_review` view for flagged items  

**Last Updated**: November 25, 2025  
**Version**: 2.0 (Auto-Correction)
