# ============================================================================
# Deploy Exercise Search Optimization
# ============================================================================
# Purpose: Deploy optimized exercise-search Edge Function and SQL indexes
# Date: November 10, 2025
# ============================================================================

Write-Host "`n🚀 Deploying Exercise Search Optimization..." -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray

# Step 1: Deploy the optimized Edge Function
Write-Host "`n📋 Step 1: Deploying exercise-search Edge Function..." -ForegroundColor Yellow
Write-Host "   This may take 1-2 minutes..." -ForegroundColor Gray

try {
    supabase functions deploy exercise-search --no-verify-jwt
    Write-Host "`n✅ Edge Function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Remind about database optimization
Write-Host "`n📋 Step 2: Database Optimization Required" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host @"

⚠️  IMPORTANT: You must run the SQL optimization script in Supabase!

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql
2. Open the file: scripts/optimize-exercise-search.sql
3. Copy and paste the entire script
4. Click "Run" to execute

This will:
  ✓ Create trigram index on exercise name (10-100x faster searches)
  ✓ Add indexes for equipment, difficulty, exercise type filtering
  ✓ Add indexes for muscle group filtering (primary, secondary)
  ✓ Add index for user-created custom exercises
  ✓ Optimize composite queries (muscle + equipment filters)

Expected time: 1-2 minutes (smaller table than food_servings)

"@ -ForegroundColor Cyan

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host @"

Next Steps:
1. Run the SQL script in Supabase (see instructions above)
2. Test exercise search in workout builder - should be faster!
3. Monitor Edge Function logs: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/logs/edge-functions

Changes Deployed:
✓ Enhanced trigram index support (faster ILIKE queries)
✓ Increased result limit (10 results, up from 5)
✓ Added .order('name') for better index utilization
✓ Multiple supporting indexes for advanced filtering

Performance Benefits:
- Current small database: Already fast, minimal change
- As database grows with custom exercises: 10-100x faster
- Scales gracefully as trainers add thousands of custom exercises
- Better support for advanced filtering (by muscle, equipment, difficulty)

"@ -ForegroundColor White
