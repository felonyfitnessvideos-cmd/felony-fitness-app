# Deploy Worker Fixes - Quick Start

## 🚀 Deployment Steps

### 1. Deploy Edge Function (REQUIRED)
The Edge Function must be deployed to Supabase for changes to take effect:

```bash
# Make sure Supabase CLI is installed
# If not: npm install -g supabase

# Login to Supabase (if not already logged in)
supabase login

# Deploy the nutrition-usda-enrichment function
supabase functions deploy nutrition-usda-enrichment
```

**What this deploys**:
- ✅ 8-second timeout protection on USDA API calls
- ✅ Improved error handling (always returns valid JSON)
- ✅ Food name normalization for better matches
- ✅ 3-second delays between requests (was 2s)

### 2. Verify Deployment
```bash
# Test the deployed function
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"worker_id": 1, "offset_multiplier": 0}' \
  "https://wkmrdelhoeqhsdifrarn.supabase.co/functions/v1/nutrition-usda-enrichment"

# Should return valid JSON like:
# {"success":true,"processed":5,"successful":4,"failed":1,"remaining":2370}
```

### 3. GitHub Actions Workflows
The workflow files are already updated in the repo. Changes will take effect on next scheduled run (every 5 minutes).

**No manual deployment needed** - GitHub reads these files directly.

Files updated:
- ✅ `.github/workflows/nutrition-enrichment.yml`
- ✅ `.github/workflows/nutrition-enrichment-worker-2.yml`
- ✅ `.github/workflows/nutrition-enrichment-worker-3.yml`

### 4. Monitor Workers
Watch GitHub Actions for the next few runs:

1. Go to: https://github.com/felonyfitnessvideos-cmd/felony-fitness-app/actions
2. Look for "Nutrition Enrichment Queue Worker" (runs every 5 min)
3. Should see ✅ green checkmarks instead of ❌ failures

### 5. Reset Failed Foods (Optional)
Give the 14 currently failed foods another chance:

```bash
$env:VITE_SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co'
$env:VITE_SUPABASE_ANON_KEY = 'your-anon-key'
node scripts/reset-failed-enrichments.js
```

---

## ✅ Verification Checklist

- [ ] Edge Function deployed successfully
- [ ] Test curl returns valid JSON
- [ ] GitHub Actions workflows updated (check repo)
- [ ] Next scheduled worker run succeeds (no jq errors)
- [ ] Failed food count stays low (< 50)
- [ ] Pending food count decreases daily

---

## 🆘 Troubleshooting

### "supabase: command not found"
```bash
npm install -g supabase
```

### "Login failed"
```bash
# Get your access token from: https://app.supabase.com/account/tokens
supabase login
```

### "Function deployment failed"
Check that you're in the project directory:
```bash
cd c:\Users\david\felony-fitness-app-production
supabase functions deploy nutrition-usda-enrichment
```

### "Workers still failing"
Wait 5-10 minutes after deployment for changes to take effect. Old function instances may still be running.

---

## 📊 Expected Timeline

- **Immediate**: Edge Function deployed, ready for next worker run
- **5 minutes**: First worker run with new error handling
- **1 hour**: All 3 workers have run with new code
- **24 hours**: Clear pattern of success, failed foods auto-retry
- **1-2 weeks**: All 2,375 pending foods enriched (at ~150-200 foods/day)

---

**Ready to deploy?** Run: `supabase functions deploy nutrition-usda-enrichment`
