#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Local USDA Enrichment Runner
    
.DESCRIPTION
    Calls the USDA nutrition enrichment worker every 5 minutes until all foods are processed.
    This is a backup solution if GitHub Actions cron isn't working reliably.
    
.EXAMPLE
    .\run-usda-enrichment-loop.ps1
#>

$ErrorActionPreference = "Stop"
$workerUrl = "https://wkmrdelhoeqhsdifrarn.supabase.co/functions/v1/nutrition-usda-enrichment"
$intervalSeconds = 300  # 5 minutes

Write-Host "=== USDA Enrichment Local Runner ===" -ForegroundColor Cyan
Write-Host "Interval: $($intervalSeconds / 60) minutes"
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

$runNumber = 0

while ($true) {
    $runNumber++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Run #$runNumber - Calling USDA enrichment worker..." -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri $workerUrl -Method POST -TimeoutSec 120
        
        Write-Host "  ✓ Processed: $($response.processed)" -ForegroundColor White
        Write-Host "  ✓ Successful: $($response.successful)" -ForegroundColor Green
        Write-Host "  ✓ Failed: $($response.failed)" -ForegroundColor $(if ($response.failed -gt 0) { "Red" } else { "White" })
        Write-Host "  ✓ Remaining: $($response.remaining)" -ForegroundColor Yellow
        
        if ($response.errors -and $response.errors.Count -gt 0) {
            Write-Host "`n  Errors:" -ForegroundColor Red
            foreach ($error in $response.errors) {
                Write-Host "    - $($error.food_name): $($error.error)" -ForegroundColor Red
            }
        }
        
        if ($response.remaining -eq 0) {
            Write-Host "`n🎉 ALL FOODS ENRICHED! Queue complete." -ForegroundColor Green
            Write-Host "Total runs: $runNumber`n"
            break
        }
        
        Write-Host "`n  Waiting $($intervalSeconds / 60) minutes until next run...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $intervalSeconds
        
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Retrying in $($intervalSeconds / 60) minutes...`n" -ForegroundColor Yellow
        Start-Sleep -Seconds $intervalSeconds
    }
}

Write-Host "Enrichment complete! Exiting." -ForegroundColor Cyan
