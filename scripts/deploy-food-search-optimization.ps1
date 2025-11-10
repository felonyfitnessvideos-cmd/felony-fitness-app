# ============================================================================
# Deploy Food Search Optimization
# ============================================================================
# Purpose: Deploy optimized food-search-v2 Edge Function to Supabase
# Date: November 10, 2025
# ============================================================================

Write-Host "`n🚀 Deploying Food Search Optimization..." -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray

# Step 1: Verify Supabase CLI is installed
Write-Host "`n📋 Step 1: Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Install from: https://supabase.com/docs/guides/cli" -ForegroundColor Red
    exit 1
}

# Step 2: Link to Supabase project (if not already linked)
Write-Host "`n📋 Step 2: Checking project link..." -ForegroundColor Yellow
if (-Not (Test-Path ".\.supabase\config.toml")) {
    Write-Host "⚠️  Project not linked. Linking now..." -ForegroundColor Yellow
    supabase link --project-ref wkmrdelhoeqhsdifrarn
} else {
    Write-Host "✅ Project already linked" -ForegroundColor Green
}

# Step 3: Deploy the optimized Edge Function
Write-Host "`n📋 Step 3: Deploying food-search-v2 Edge Function..." -ForegroundColor Yellow
Write-Host "   This may take 1-2 minutes..." -ForegroundColor Gray

try {
    supabase functions deploy food-search-v2 --no-verify-jwt
    Write-Host "`n✅ Edge Function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Remind about database optimization
Write-Host "`n📋 Step 4: Database Optimization Required" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host @"

⚠️  IMPORTANT: You must run the SQL optimization script in Supabase!

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql
2. Open the file: scripts/optimize-food-search.sql
3. Copy and paste the entire script
4. Click "Run" to execute

This will:
  ✓ Enable pg_trgm extension (trigram matching)
  ✓ Create trigram index on food_name (10-100x faster searches)
  ✓ Add supporting indexes for brand and category
  ✓ Optimize query planner statistics

Expected time: 2-5 minutes depending on table size

"@ -ForegroundColor Cyan

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host @"

Next Steps:
1. Run the SQL script in Supabase (see instructions above)
2. Test food search in your app - should be much faster!
3. Monitor Edge Function logs: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/functions

Changes Deployed:
✓ Enhanced trigram index support (faster ILIKE queries)
✓ Increased result limit (50 rows for more serving options)
✓ Grouped results by food name (shows multiple serving sizes)
✓ Returns up to 3 serving sizes per food (e.g., "1 cup", "100g", "1/2 cup")

"@ -ForegroundColor White
