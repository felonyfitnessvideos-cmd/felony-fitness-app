#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import USDA FNDDS 2023 foods into food_servings table
.DESCRIPTION
    Reads the master list CSV and generates SQL INSERT statements with ON CONFLICT DO NOTHING
    to safely import all foods without violating unique constraints
#>

Write-Host "=== USDA FNDDS 2023 BATCH IMPORT SCRIPT ===" -ForegroundColor Cyan
Write-Host "Reading master list..." -ForegroundColor Yellow

$csvPath = "c:\Users\david\felony-fitness-app-production\scripts\usda-fndds-2023-master-list.csv"
$sqlPath = "c:\Users\david\felony-fitness-app-production\scripts\import-usda-fndds-2023-foods.sql"

$masterList = Import-Csv $csvPath

Write-Host "Total foods to import: $($masterList.Count)" -ForegroundColor Green
Write-Host "Generating SQL with ON CONFLICT DO NOTHING..." -ForegroundColor Yellow

# Start SQL file
$sql = @"
-- Import USDA FNDDS 2023 Foods
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Total foods: $($masterList.Count)
--
-- This script uses ON CONFLICT DO NOTHING to safely skip foods that already exist
-- New foods will be automatically enriched by the USDA enrichment worker

BEGIN;

"@

# Generate INSERT statements in batches of 100 for performance
$batchSize = 100
$batches = [math]::Ceiling($masterList.Count / $batchSize)

Write-Host "Creating $batches batches of $batchSize foods each..." -ForegroundColor Cyan

for ($i = 0; $i -lt $batches; $i++) {
    $start = $i * $batchSize
    $end = [math]::Min(($i + 1) * $batchSize, $masterList.Count)
    $batch = $masterList[$start..($end - 1)]
    
    $sql += "`n-- Batch $($i + 1) of $batches (foods $($start + 1) to $end)`n"
    $sql += "INSERT INTO food_servings (food_name, serving_description, enrichment_status) VALUES`n"
    
    $values = @()
    foreach ($food in $batch) {
        # Escape single quotes by doubling them (SQL standard)
        $escapedName = $food.food_name -replace "'", "''"
        $values += "  ('$escapedName', '100g', NULL)"
    }
    
    $sql += $values -join ",`n"
    $sql += "`nON CONFLICT (food_name) DO NOTHING;`n"
    
    # Progress indicator
    if (($i + 1) % 10 -eq 0 -or ($i + 1) -eq $batches) {
        Write-Host "  Generated batch $($i + 1) of $batches" -ForegroundColor Gray
    }
}

$sql += @"

COMMIT;

-- Summary query to see what was added
SELECT 
    enrichment_status,
    COUNT(*) as food_count
FROM food_servings
WHERE food_name IN (
    SELECT food_name 
    FROM food_servings 
    ORDER BY id DESC 
    LIMIT $($masterList.Count)
)
GROUP BY enrichment_status
ORDER BY enrichment_status;
"@

# Write SQL file
$sql | Out-File -FilePath $sqlPath -Encoding UTF8 -NoNewline

Write-Host "`n✅ SQL script created: $sqlPath" -ForegroundColor Green
Write-Host "`nFile size: $([math]::Round((Get-Item $sqlPath).Length / 1KB, 2)) KB" -ForegroundColor Yellow

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Review the SQL file (first 50 lines shown below)" -ForegroundColor White
Write-Host "2. Execute in Supabase SQL Editor or via psql" -ForegroundColor White
Write-Host "3. USDA enrichment worker will automatically process new foods" -ForegroundColor White
Write-Host "4. Monitor enrichment progress with:" -ForegroundColor White
Write-Host "   SELECT enrichment_status, COUNT(*) FROM food_servings GROUP BY enrichment_status;" -ForegroundColor Gray

Write-Host "`n=== SQL PREVIEW ===" -ForegroundColor Cyan
Get-Content $sqlPath -TotalCount 50 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
Write-Host "..." -ForegroundColor Gray
Write-Host "(Total lines: $($(Get-Content $sqlPath).Count))" -ForegroundColor Yellow
