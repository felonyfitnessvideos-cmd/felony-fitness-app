# =====================================================
# FOOD DATABASE NUTRIENT AUDIT & ENRICHMENT STRATEGY
# =====================================================
# Analyzes foods table for missing micronutrient data
# and creates prioritized enrichment plan using USDA API

param(
    [switch]$GenerateEnrichmentSQL,
    [switch]$ExportMissingToCSV
)

Write-Host "`n🔍 FOOD DATABASE NUTRIENT AUDIT" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Run the audit SQL script
Write-Host "`n📊 Running comprehensive nutrient audit..." -ForegroundColor Yellow
$auditResults = psql $env:DATABASE_URL -f "scripts/audit-foods-missing-nutrients.sql"
$auditResults

# Parse results to get high-priority foods
Write-Host "`n🎯 Analyzing audit results..." -ForegroundColor Yellow

$highPriorityQuery = @"
SELECT 
    id,
    name,
    brand_owner,
    category,
    times_logged,
    (CASE WHEN sodium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN potassium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN calcium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN iron_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN magnesium_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN phosphorus_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN zinc_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_a_mcg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_c_mg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_d_mcg = 0 THEN 1 ELSE 0 END +
     CASE WHEN vitamin_b12_mcg = 0 THEN 1 ELSE 0 END) as missing_count
FROM foods
WHERE (sodium_mg = 0 OR calcium_mg = 0 OR iron_mg = 0 OR 
       vitamin_c_mg = 0 OR vitamin_d_mcg = 0 OR vitamin_b12_mcg = 0)
ORDER BY times_logged DESC, missing_count DESC
LIMIT 100;
"@

Write-Host "`n📋 ENRICHMENT STRATEGY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🎯 Priority Tiers for Enrichment:" -ForegroundColor Yellow
Write-Host "  TIER 1: Foods logged 10+ times (CRITICAL - User favorites)" -ForegroundColor Red
Write-Host "  TIER 2: Foods logged 5-9 times (HIGH - Frequently used)" -ForegroundColor Yellow
Write-Host "  TIER 3: Foods logged 1-4 times (MEDIUM - Recently used)" -ForegroundColor Blue
Write-Host "  TIER 4: Never logged (LOW - Archive/cleanup candidates)" -ForegroundColor Gray

Write-Host "`n🔄 Enrichment Methods:" -ForegroundColor Yellow
Write-Host "  1. USDA FoodData Central API - Direct match by name" -ForegroundColor Green
Write-Host "  2. USDA CSV Local Files - Bulk import from local dataset" -ForegroundColor Green
Write-Host "  3. Manual Research - For branded/unique items" -ForegroundColor Yellow
Write-Host "  4. Average by Category - Last resort for generic items" -ForegroundColor Gray

Write-Host "`n📊 Recommended Actions:" -ForegroundColor Cyan
Write-Host "  1️⃣  Run USDA enrichment worker on Tier 1 foods (10+ logs)" -ForegroundColor White
Write-Host "     Command: node scripts/import_stream.js --priority-mode" -ForegroundColor Gray
Write-Host "`n  2️⃣  Bulk import from local USDA CSV for remaining gaps" -ForegroundColor White
Write-Host "     Command: node scripts/import-usda-data.js" -ForegroundColor Gray
Write-Host "`n  3️⃣  Manual review for branded foods without USDA match" -ForegroundColor White
Write-Host "     Export: Use --ExportMissingToCSV flag" -ForegroundColor Gray
Write-Host "`n  4️⃣  Archive/delete never-logged foods with no data" -ForegroundColor White
Write-Host "     Consider cleanup after enrichment attempts" -ForegroundColor Gray

if ($ExportMissingToCSV) {
    Write-Host "`n📤 Exporting high-priority missing foods to CSV..." -ForegroundColor Yellow
    
    $exportQuery = @"
COPY (
    SELECT 
        id,
        name,
        brand_owner,
        category,
        data_source,
        times_logged,
        last_logged_at,
        calories,
        protein_g,
        fat_g,
        carbs_g,
        CASE WHEN sodium_mg = 0 THEN 'MISSING' ELSE sodium_mg::text END as sodium_status,
        CASE WHEN calcium_mg = 0 THEN 'MISSING' ELSE calcium_mg::text END as calcium_status,
        CASE WHEN iron_mg = 0 THEN 'MISSING' ELSE iron_mg::text END as iron_status,
        CASE WHEN vitamin_c_mg = 0 THEN 'MISSING' ELSE vitamin_c_mg::text END as vitamin_c_status,
        CASE WHEN vitamin_d_mcg = 0 THEN 'MISSING' ELSE vitamin_d_mcg::text END as vitamin_d_status
    FROM foods
    WHERE (sodium_mg = 0 OR calcium_mg = 0 OR iron_mg = 0 OR 
           vitamin_c_mg = 0 OR vitamin_d_mcg = 0)
    ORDER BY times_logged DESC, last_logged_at DESC NULLS LAST
    LIMIT 200
) TO STDOUT WITH CSV HEADER;
"@
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $exportPath = "scripts\foods-missing-nutrients-$timestamp.csv"
    
    psql $env:DATABASE_URL -c $exportQuery | Out-File -FilePath $exportPath -Encoding UTF8
    
    Write-Host "✅ Exported to: $exportPath" -ForegroundColor Green
}

if ($GenerateEnrichmentSQL) {
    Write-Host "`n🔧 Generating enrichment SQL template..." -ForegroundColor Yellow
    
    $sqlTemplate = @"
-- =====================================================
-- NUTRIENT ENRICHMENT TEMPLATE
-- =====================================================
-- Use this template to manually enrich foods with data
-- from USDA FoodData Central or other sources

-- Example: Update a food with complete micronutrient data
UPDATE foods SET
    sodium_mg = 150.0,
    potassium_mg = 350.0,
    calcium_mg = 25.0,
    iron_mg = 1.2,
    magnesium_mg = 30.0,
    phosphorus_mg = 100.0,
    zinc_mg = 0.8,
    copper_mg = 0.1,
    selenium_mcg = 5.0,
    vitamin_a_mcg = 50.0,
    vitamin_c_mg = 2.0,
    vitamin_d_mcg = 0.0,
    vitamin_e_mg = 1.5,
    vitamin_k_mcg = 5.0,
    thiamin_mg = 0.1,
    riboflavin_mg = 0.15,
    niacin_mg = 2.0,
    vitamin_b6_mg = 0.2,
    folate_mcg = 25.0,
    vitamin_b12_mcg = 0.5,
    data_source = 'USDA'
WHERE id = 123456;

-- Bulk update from USDA API results
-- (Generate this dynamically from enrichment worker)
"@
    
    $templatePath = "scripts\nutrient-enrichment-template.sql"
    $sqlTemplate | Out-File -FilePath $templatePath -Encoding UTF8
    
    Write-Host "✅ Template created: $templatePath" -ForegroundColor Green
}

Write-Host "`n🎬 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review audit results above" -ForegroundColor White
Write-Host "  2. Run enrichment worker: .\scripts\run-usda-enrichment-loop.ps1" -ForegroundColor White
Write-Host "  3. Monitor progress and gaps" -ForegroundColor White
Write-Host "  4. Re-run audit to verify improvements" -ForegroundColor White

Write-Host "`n✅ Audit complete!" -ForegroundColor Green
