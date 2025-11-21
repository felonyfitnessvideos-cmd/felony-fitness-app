# Backup Database via Supabase REST API
# This script works with the FREE tier and bypasses network/firewall issues

param(
    [string]$BackupName = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
)

# Load environment variables
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "❌ Error: Missing Supabase credentials in .env.local" -ForegroundColor Red
    Write-Host "   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

$backupDir = "backups\$BackupName"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "`n=== 📦 Starting API Backup ===" -ForegroundColor Cyan
Write-Host "Backup Directory: $backupDir" -ForegroundColor Gray
Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Gray

# Tables to backup (ALL tables from database.types.ts)
$tables = @(
    # Core User Data
    "user_profiles",
    "users",
    "trainer_clients",
    
    # Nutrition & Food
    "food_servings",
    "foods",
    "nutrition_logs",
    "meals",
    "meal_foods",
    "user_meals",
    "user_meal_foods",
    "weekly_meal_plans",
    "weekly_meal_plan_entries",
    "nutrition_enrichment_queue",
    "nutrition_pipeline_status",
    
    # Training & Workouts
    "exercises",
    "programs",
    "workout_logs",
    "workout_log_entries",
    "workout_routines",
    "routine_exercises",
    "scheduled_routines",
    "pro_routines",
    
    # Periodization
    "mesocycles",
    "mesocycle_weeks",
    "cycle_sessions",
    
    # Goals & Metrics
    "goals",
    "body_metrics",
    "plans",
    
    # Communication
    "direct_messages",
    "email_campaigns",
    "email_events",
    "email_templates",
    "trainer_email_templates",
    
    # Bug Reporting
    "bug_reports",
    "bug_report_replies",
    
    # Tags & Grouping
    "tags",
    "user_tags",
    "trainer_group_tags",
    
    # Reference Data
    "muscle_groups"
)

$totalTables = $tables.Count
$currentTable = 0

foreach ($table in $tables) {
    $currentTable++
    Write-Host "`n[$currentTable/$totalTables] Backing up table: $table..." -ForegroundColor Cyan
    
    try {
        $headers = @{
            "apikey" = $SUPABASE_SERVICE_KEY
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Content-Type" = "application/json"
        }
        
        # Fetch all records (paginated)
        $allRecords = @()
        $offset = 0
        $limit = 1000
        $hasMore = $true
        
        while ($hasMore) {
            $url = "$SUPABASE_URL/rest/v1/$table`?select=*&limit=$limit&offset=$offset"
            
            $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -TimeoutSec 30
            
            if ($response -is [Array]) {
                $allRecords += $response
                
                if ($response.Count -lt $limit) {
                    $hasMore = $false
                } else {
                    $offset += $limit
                    Write-Host "   Fetched $($allRecords.Count) records..." -ForegroundColor Gray
                }
            } else {
                $allRecords += $response
                $hasMore = $false
            }
        }
        
        # Save to JSON file
        $outputFile = Join-Path $backupDir "$table.json"
        $allRecords | ConvertTo-Json -Depth 10 | Set-Content $outputFile -Encoding UTF8
        
        $fileSizeKB = [math]::Round((Get-Item $outputFile).Length / 1KB, 2)
        Write-Host "   ✅ Saved $($allRecords.Count) records ($fileSizeKB KB)" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Save error log
        $errorFile = Join-Path $backupDir "$table.error.txt"
        $_.Exception | Out-File $errorFile
    }
}

# Create metadata file
$metadata = @{
    backup_name = $BackupName
    backup_date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    supabase_url = $SUPABASE_URL
    tables_backed_up = $tables
    total_tables = $tables.Count
} | ConvertTo-Json

$metadata | Set-Content (Join-Path $backupDir "metadata.json") -Encoding UTF8

# Calculate total backup size
$totalSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "`n=== ✅ Backup Complete ===" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Cyan
Write-Host "Total Size: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host "Files: $(Get-ChildItem $backupDir | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Cyan

Write-Host "`n💡 To restore from this backup, use the restore-from-api.ps1 script" -ForegroundColor Yellow

# Open backup folder
explorer $backupDir
