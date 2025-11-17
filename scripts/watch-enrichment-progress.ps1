#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Monitor nutrition enrichment progress in real-time
.DESCRIPTION
    Polls GitHub Actions and displays workflow runs + queue status
#>

Write-Host "🔍 Monitoring Nutrition Enrichment Progress..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$lastRunId = $null

while ($true) {
    # Get latest workflow runs
    $runs = gh run list --workflow=nutrition-enrichment.yml --limit 5 --json databaseId,event,conclusion,createdAt,status | ConvertFrom-Json
    
    if ($runs -and $runs.Count -gt 0) {
        $latestRun = $runs[0]
        
        # Check if there's a new run
        if ($latestRun.databaseId -ne $lastRunId) {
            $lastRunId = $latestRun.databaseId
            $time = [DateTime]::Parse($latestRun.createdAt).ToLocalTime().ToString("HH:mm:ss")
            $eventType = $latestRun.event
            $status = $latestRun.status
            
            $emoji = if ($latestRun.conclusion -eq "success") { "✅" } 
                    elseif ($status -eq "in_progress") { "⏳" }
                    elseif ($latestRun.conclusion -eq "failure") { "❌" }
                    else { "⏸️" }
            
            Write-Host "$emoji [$time] New run detected: $eventType - $status" -ForegroundColor $(
                if ($latestRun.conclusion -eq "success") { "Green" }
                elseif ($status -eq "in_progress") { "Yellow" }
                else { "Red" }
            )
        }
    }
    
    # Display summary
    $scheduledRuns = ($runs | Where-Object { $_.event -eq "schedule" }).Count
    $manualRuns = ($runs | Where-Object { $_.event -eq "workflow_dispatch" }).Count
    
    Write-Host "`r📊 Scheduled: $scheduledRuns | Manual: $manualRuns | Last check: $(Get-Date -Format 'HH:mm:ss')" -NoNewline -ForegroundColor DarkGray
    
    Start-Sleep -Seconds 30
}
