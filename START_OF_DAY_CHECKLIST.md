# 🌅 START OF DAY PROTOCOL

> **⚠️ READ THIS FIRST EVERY MORNING BEFORE CODING**

---

## 📋 Daily Review Checklist

### 1️⃣ Check Content Expansion Strategy
**File:** [`docs/CONTENT_EXPANSION_STRATEGY.md`](./docs/CONTENT_EXPANSION_STRATEGY.md)

**Review:**
- ✅ Daily Check-ins section (line 652+)
- ✅ Ongoing Performance Optimization Tasks
- ✅ Weekly objectives and targets
- ✅ Current blockers or pending tasks

**Action:** Read through any new items added yesterday

---

### 2️⃣ Monitor USDA Enrichment Workers
**Status Check:**
```sql
-- Run this in Supabase SQL Editor to check progress
SELECT 
  enrichment_status, 
  COUNT(*) as count
FROM food_servings 
GROUP BY enrichment_status 
ORDER BY enrichment_status;
```

**Expected Progress:**
- 🔄 3 parallel workers running via GitHub Actions
- 📊 40-180 foods processed per hour (conservative to optimistic)
- 📈 Check [GitHub Actions](https://github.com/felonyfitnessvideos-cmd/felony-fitness-app/actions) for recent runs

**Thresholds:**
- ✅ **Good:** 100+ foods enriched overnight (8 hours)
- ⚠️ **Slow:** < 50 foods enriched overnight
- 🚨 **Stalled:** No progress in 6+ hours (check worker logs)

---

### 3️⃣ Review Yesterday's Git Activity
```powershell
# Check recent commits
git log --oneline -n 10

# Check for uncommitted changes
git status

# Pull latest from remote
git pull origin main
```

---

### 4️⃣ Priority Tasks for Today

**Check these locations:**
1. **Performance Optimizations:** `docs/CONTENT_EXPANSION_STRATEGY.md` (line 660+)
   - Nutrition log page query optimization
   - Other identified bottlenecks

2. **Active Issues:** GitHub Issues tab (if enabled)
   - Bug reports from beta testers
   - Feature requests from trainers/clients

3. **Documentation Updates:** 
   - Any new features need README updates
   - Schema changes require migration docs

---

### 5️⃣ Environment Check
**Verify services are running:**
- ✅ Supabase project: [https://wkmrdelhoeqhsdifrarn.supabase.co](https://wkmrdelhoeqhsdifrarn.supabase.co)
- ✅ Local dev server: `npm run dev` (if working locally)
- ✅ GitHub Actions: Check for any failed workflows

**Environment variables:**
```powershell
# Verify .env.local has required keys
Get-Content .env.local | Select-String "VITE_SUPABASE"
```

---

## 🎯 Focus Areas This Week

### Week of [Current Date]

**Primary Goals:**
1. **Content Expansion:**
   - USDA enrichment: Monitor 5,000+ foods being enriched
   - Exercise library: Review quality of existing exercises
   - Meal templates: Add variety for different dietary needs

2. **Performance:**
   - Nutrition log page optimization (see CONTENT_EXPANSION_STRATEGY.md)
   - Identify other slow pages/queries

3. **Bug Fixes:**
   - Monitor Supabase logs for errors
   - Test critical user flows (sign up, create workout, log nutrition)

4. **Documentation:**
   - Keep CONTENT_EXPANSION_STRATEGY.md updated
   - Document any new patterns or architecture decisions

---

## 🚨 Emergency Response

**If you encounter critical issues:**

1. **Production Down:** Check Supabase status page
2. **Auth Failing:** Verify RLS policies in `supabase/migrations/`
3. **Data Loss Risk:** STOP and review schema changes carefully
4. **Performance Crisis:** Check Supabase logs, review recent queries

**Backup Strategy:**
- Database backups: Daily automatic via Supabase
- **Reliable manual backup:** `.\scripts\backup-database.ps1` (see [Backup Guide](./docs/DATABASE_BACKUP_GUIDE.md))
- Alternative: Supabase Dashboard → Database → Backup
- Git commits: Commit working code frequently (every 1-2 hours)
- **Before major changes:** Always run backup with descriptive name

---

## 📚 Quick Reference Links

**Documentation:**
- [Content Expansion Strategy](./docs/CONTENT_EXPANSION_STRATEGY.md)
- [Database Indexing Explained](./docs/DATABASE_INDEXING_EXPLAINED.md)
- [Smart Scheduling Quick Start](./docs/SMART_SCHEDULING_QUICK_START.md)

**Codebase:**
- Nutrition: `src/pages/NutritionLogPage.jsx`, `src/pages/MealPlanPage.jsx`
- Workouts: `src/pages/WorkoutBuilderPage.jsx`, `src/pages/WorkoutLogPage.jsx`
- Admin: `src/pages/AdminPage.jsx`

**External:**
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com/felonyfitnessvideos-cmd/felony-fitness-app)
- [USDA FoodData Central](https://fdc.nal.usda.gov/)

---

## ✅ End of Day Protocol

**Before you stop coding:**

1. ✅ **Run complete database backup:**
   ```powershell
   .\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
   ```
   - Backs up all 39 tables via REST API (works on free tier!)
   - Includes `schema.sql` (functions, triggers, RLS policies, indexes)
   - Includes `database.types.ts` (TypeScript definitions)
   - Creates timestamped JSON exports in `backups/` folder
   - Takes ~2-3 minutes for full database
   - **Location:** `backups/daily-YYYY-MM-DD/`

1a. ⚙️ **Optional: Backup storage buckets (weekly recommended):**
   ```powershell
   .\scripts\backup-storage-buckets.ps1 -BackupName "storage-$(Get-Date -Format 'yyyy-MM-dd')"
   ```
   - Downloads all files from 5 storage buckets
   - Includes trainer manual PDFs, images, assets
   - Takes ~5-10 minutes (233 MB currently)
   - **Location:** `backups/storage-YYYY-MM-DD/`
   - **Note:** Run weekly or after adding new files to buckets

2. ✅ Commit all working changes with clear messages
   ```powershell
   git add .
   git commit -m "feat: describe your changes"
   ```

3. ✅ Update `CONTENT_EXPANSION_STRATEGY.md` Daily Check-ins section
   - Document what was accomplished today
   - Note any blockers or questions for tomorrow

4. ✅ Push code to GitHub: 
   ```powershell
   git push origin main
   ```

5. ✅ Check USDA enrichment progress one last time
   ```sql
   SELECT enrichment_status, COUNT(*) 
   FROM food_servings 
   GROUP BY enrichment_status;
   ```

6. ✅ Verify backup completed successfully
   - Check `backups/daily-YYYY-MM-DD/` folder exists
   - Verify files have reasonable sizes (food_servings.json should be ~6MB)
   - Keep last 7 days of backups, delete older ones

---

**🎉 Ready to Code! Have a productive day!**
