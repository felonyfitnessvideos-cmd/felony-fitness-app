#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run nutrition enrichment worker manually and monitor progress
.DESCRIPTION
    Calls the nutrition-queue-worker Edge Function to process 5 foods at a time.
    Can be run repeatedly or scheduled locally to process entire queue.
.PARAMETER Loop
    Continue running every 5 minutes until queue is empty
.EXAMPLE
    .\run-enrichment-worker.ps1
.EXAMPLE
    .\run-enrichment-worker.ps1 -Loop
#>

param(
    [switch]$Loop = $false
)

$SUPABASE_URL = "https://wkmrdelhoeqhsdifrarn.supabase.co"
$FUNCTION_URL = "$SUPABASE_URL/functions/v1/nutrition-queue-worker"

# You'll need to set this environment variable with your service role key
# Or replace with actual key (DO NOT COMMIT)
$SERVICE_ROLE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SERVICE_ROLE_KEY) {
    Write-Host "❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Set it with:" -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Find your key at:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/settings/api" -ForegroundColor Cyan
    exit 1
}

function Invoke-EnrichmentWorker {
    Write-Host ""
    Write-Host "=== Running Nutrition Enrichment Worker ===" -ForegroundColor Cyan
    Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""

    try {
        $headers = @{
            "Authorization" = "Bearer $SERVICE_ROLE_KEY"
            "Content-Type" = "application/json"
        }

        $response = Invoke-RestMethod -Uri $FUNCTION_URL -Method Post -Headers $headers -Body "{}"
        
        Write-Host "✓ Worker completed successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "Results:" -ForegroundColor White
        Write-Host "  Processed:  $($response.processed)" -ForegroundColor Cyan
        Write-Host "  Successful: $($response.successful)" -ForegroundColor Green
        Write-Host "  Failed:     $($response.failed)" -ForegroundColor $(if ($response.failed -gt 0) { "Yellow" } else { "Gray" })
        Write-Host "  Remaining:  $($response.remaining)" -ForegroundColor White
        
        if ($response.errors -and $response.errors.Count -gt 0) {
            Write-Host ""
            Write-Host "Errors:" -ForegroundColor Yellow
            foreach ($errorItem in $response.errors) {
                Write-Host "  - $($errorItem.food_name): $($errorItem.error)" -ForegroundColor Red
            }
        }

        if ($response.remaining -eq 0) {
            Write-Host ""
            Write-Host "🎉 All foods enriched! Queue is complete." -ForegroundColor Green
            return $true  # Queue complete
        }

        return $false  # Queue has more items

    } catch {
        Write-Host "❌ Error calling worker:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        }
        
        return $false
    }
}

# Main execution
if ($Loop) {
    Write-Host "🔄 Starting continuous enrichment worker (Ctrl+C to stop)" -ForegroundColor Cyan
    Write-Host "   Processing 5 foods every 5 minutes" -ForegroundColor Gray
    
    $iteration = 1
    while ($true) {
        Write-Host ""
        Write-Host "--- Iteration $iteration ---" -ForegroundColor Magenta
        
        $queueComplete = Invoke-EnrichmentWorker
        
        if ($queueComplete) {
            Write-Host ""
            Write-Host "✓ Queue processing complete!" -ForegroundColor Green
            break
        }
        
        Write-Host ""
        Write-Host "⏱️  Waiting 5 minutes before next batch..." -ForegroundColor Yellow
        Start-Sleep -Seconds 300  # 5 minutes
        
        $iteration++
    }
} else {
    # Single run
    Invoke-EnrichmentWorker
    Write-Host ""
    Write-Host "Tip: Run with -Loop to continuously process until queue is empty" -ForegroundColor Gray
}
