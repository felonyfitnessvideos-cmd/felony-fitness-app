# Verification System - Quick Deployment

**Date**: November 25, 2025  
**Time to Deploy**: ~10 minutes  
**Prerequisites**: Supabase CLI, OpenAI API key

---

## 🚀 Deployment Steps

### 1. Add Database Columns (Required)
```bash
# Connect to your database
psql $DATABASE_URL

# Or via Supabase dashboard SQL editor:
# Copy contents of scripts/add-verification-columns.sql and run
```

**Verify**:
```sql
SELECT 
  COUNT(*) as total_foods,
  COUNT(*) FILTER (WHERE is_verified IS NOT NULL) as has_verification_column
FROM food_servings;
-- Should show: has_verification_column = total_foods
```

---

### 2. Set OpenAI API Key (Required)
```bash
# Add OpenAI API key to Supabase secrets
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

**Verify**:
```bash
supabase secrets list
# Should show: OPENAI_API_KEY (set)
```

---

### 3. Deploy Edge Function (Required)
```bash
# Deploy nutrition-verification function
supabase functions deploy nutrition-verification

# Should see:
# ✅ Deployed Functions on project [your-project]
```

**Test Manually**:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{"batch_size": 5}' \
  "$SUPABASE_URL/functions/v1/nutrition-verification"

# Should return:
# {"success":true,"verified":X,"flagged":Y,"errors":0,"remaining":Z}
```

---

### 4. Enable GitHub Actions Worker (Automatic)
Worker is already in `.github/workflows/nutrition-verification-worker.yml`

It will **start automatically** on next cron trigger (every 2 minutes).

**Manual Trigger** (optional):
```bash
gh workflow run nutrition-verification-worker.yml
```

**Monitor**:
- Go to: https://github.com/{org}/{repo}/actions
- Look for: "Nutrition Data Verification Worker"
- Should see: ✅ Green checkmarks every 2 minutes

---

### 5. Check Status (Monitor)
```bash
# Run monitoring script
node scripts/check-verification-status.js

# Should show:
# 📊 VERIFICATION STATISTICS
# Total foods: 5,425
# ✅ Verified: X (Y%)
# ⚠️  Needs review: Z
# ⏳ Pending verification: W
```

---

## ✅ Verification Checklist

- [ ] Database columns added (`is_verified`, `needs_review`, etc.)
- [ ] OpenAI API key set in Supabase secrets
- [ ] Edge Function deployed successfully
- [ ] GitHub Actions worker enabled (auto-starts)
- [ ] Manual test completed (got valid JSON response)
- [ ] Monitoring script shows status

---

## 📊 Expected Results

### First Run (Immediately After Deployment)
```
✅ Verified: 0-5 foods (first batch)
⚠️  Needs review: 0-2 foods (if any issues found)
⏳ Pending verification: ~3,000 foods (most of database)
```

### After 1 Hour
```
✅ Verified: ~150 foods (5 foods × 30 runs)
⚠️  Needs review: ~8-15 foods (~5% flag rate expected)
⏳ Pending verification: ~2,850 foods
```

### After 24 Hours
```
✅ Verified: ~3,500 foods
⚠️  Needs review: ~175-350 foods
⏳ Pending verification: ~0 foods (queue empty)
```

---

## 🐛 Common Issues

### Issue: "OpenAI API key not found"
**Solution**: 
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
supabase functions deploy nutrition-verification
```

### Issue: "Column 'is_verified' does not exist"
**Solution**: Run database migration
```bash
psql $DATABASE_URL < scripts/add-verification-columns.sql
```

### Issue: Worker not running
**Check**:
1. Go to GitHub Actions
2. Check if workflow file exists: `.github/workflows/nutrition-verification-worker.yml`
3. Verify cron schedule: `*/2 * * * *`
4. Check workflow runs tab

**Fix**: Workflow is already committed, should auto-start. Wait 2 minutes for first run.

### Issue: High flag rate (>20%)
**Review**:
```bash
# Check common flags
node scripts/check-verification-status.js

# Review flagged foods
psql $DATABASE_URL -c "SELECT * FROM foods_needing_review LIMIT 20;"
```

**Action**: May need to adjust outlier thresholds in Edge Function

---

## 🎯 Success Indicators

✅ **Worker is running**: Green checkmarks in GitHub Actions every 2 minutes  
✅ **Foods being verified**: `verified_foods` count increasing  
✅ **Low flag rate**: `needs_review` < 5% of total  
✅ **Queue draining**: `pending_verification` decreasing  
✅ **No errors**: Edge Function returning `"errors": 0`  

---

## 📞 Next Steps

1. **Deploy**: Follow steps 1-5 above
2. **Monitor**: Run `check-verification-status.js` every hour
3. **Review Flags**: Check flagged foods after first 100 verifications
4. **Adjust**: Fine-tune thresholds if needed
5. **Celebrate**: When verification rate hits 95%! 🎉

---

**Estimated Completion Time**: 
- 5,425 foods × 2 minutes ÷ 5 foods per batch = ~36 hours
- Running 24/7, full verification in ~1.5 days

**Cost Estimate**:
- 5,425 foods × $0.00152 = ~$8.25 for complete verification

---

**Ready to deploy?** Run step 1, then step 2, then step 3!
