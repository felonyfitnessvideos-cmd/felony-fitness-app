# Backup Database via Supabase REST API
# This script works with the FREE tier and bypasses network/firewall issues

param(
    [string]$BackupType = "daily" # Options: "daily" or "weekly-complete"
)

# Generate backup name in format: YYYY-MM-DD-{type}
$timestamp = Get-Date -Format 'yyyy-MM-dd'
$BackupName = "$timestamp-$BackupType"

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
    Write-Host "[FAIL] Error: Missing Supabase credentials in .env.local" -ForegroundColor Red
    Write-Host "   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

$backupDir = "backups\$BackupName"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "`n=== [BACKUP] Starting API Backup ===" -ForegroundColor Cyan
Write-Host "Backup Directory: $backupDir" -ForegroundColor Gray
Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Gray

# Tables to backup (ALL tables from database.types.ts)
$tables = @(
    # Core User Data
    "user_profiles",
    "users",
    "trainer_clients",
    
    # Nutrition & Food
    "portions",
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
            $url = ('{0}/rest/v1/{1}?select=*&limit={2}&offset={3}' -f $SUPABASE_URL, $table, $limit, $offset)
            
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
        Write-Host "   [OK] Saved $($allRecords.Count) records ($fileSizeKB KB)" -ForegroundColor Green
        
    } catch {
        Write-Host "   [FAIL] An error occurred for table: $table" -ForegroundColor Red
        $errorDetails = $_ | ConvertTo-Json -Depth 5
        Write-Host $errorDetails
        
        # Save error log
        $errorFile = Join-Path $backupDir "$table.error.json" # save as json
        $errorDetails | Out-File $errorFile
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

# Copy schema and types files
Write-Host "`n=== [SCHEMA] Copying Schema Files ===" -ForegroundColor Cyan

if (Test-Path "schema.sql") {
    Copy-Item "schema.sql" -Destination (Join-Path $backupDir "schema.sql")
    $schemaSizeKB = [math]::Round((Get-Item (Join-Path $backupDir "schema.sql")).Length / 1KB, 2)
    Write-Host "[OK] Copied schema.sql ($schemaSizeKB KB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  schema.sql not found in root directory" -ForegroundColor Yellow
}

if (Test-Path "src\types\database.types.ts") {
    Copy-Item "src\types\database.types.ts" -Destination (Join-Path $backupDir "database.types.ts")
    $typesSizeKB = [math]::Round((Get-Item (Join-Path $backupDir "database.types.ts")).Length / 1KB, 2)
    Write-Host "[OK] Copied database.types.ts ($typesSizeKB KB)" -ForegroundColor Green
} else {
    Write-Host "⚠️  database.types.ts not found in src/types/" -ForegroundColor Yellow
}

# Calculate total backup size
$totalSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "`n=== [OK] Backup Complete ===" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Cyan
Write-Host "Total Size: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host "Files: $(Get-ChildItem $backupDir | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Cyan

# Cleanup: Keep only last 7 backups
Write-Host "`n=== [CLEANUP] Cleanup: Maintaining 7 Most Recent Backups ===" -ForegroundColor Yellow
$allBackups = Get-ChildItem backups | Sort-Object Name -Descending
if ($allBackups.Count -gt 7) {
    $toDelete = $allBackups | Select-Object -Skip 7
    foreach ($backup in $toDelete) {
        Write-Host "[DEL]  Deleting old backup: $($backup.Name)" -ForegroundColor DarkGray
        Remove-Item -Path $backup.FullName -Recurse -Force
    }
    Write-Host "[OK] Cleanup complete - kept $($allBackups.Count - $toDelete.Count) backups" -ForegroundColor Green
} else {
    Write-Host "[OK] Backup count OK ($($allBackups.Count)/7)" -ForegroundColor Green
}

Write-Host "`n[INFO] To restore from this backup, use the restore-from-api.ps1 script" -ForegroundColor Yellow

# Open backup folder
explorer $backupDir
