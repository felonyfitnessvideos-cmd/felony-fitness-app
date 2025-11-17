# Database Export Script for Supabase
# Creates SQL dumps of all tables in the public schema

param(
    [string]$BackupDir = ""
)

if (-not $BackupDir) {
    $BackupDir = Get-ChildItem "backups" -Directory | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}

Write-Output "🗄️ Exporting Supabase Database..."
Write-Output "Backup location: $BackupDir`n"

# Read Supabase credentials from environment or .env
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^VITE_SUPABASE_URL=(.+)$') {
            $supabaseUrl = $Matches[1]
        }
        if ($_ -match '^VITE_SUPABASE_ANON_KEY=(.+)$') {
            $supabaseKey = $Matches[1]
        }
    }
}

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Output "❌ Could not find Supabase credentials in .env.local"
    Write-Output ""
    Write-Output "📋 Manual Export Instructions:"
    Write-Output "1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn"
    Write-Output "2. Navigate to Database > Backups"
    Write-Output "3. Click 'Download' on the latest backup"
    Write-Output "4. Save the file to: $BackupDir"
    Write-Output ""
    Write-Output "OR use pg_dump directly:"
    Write-Output "pg_dump -h db.wkmrdelhoeqhsdifrarn.supabase.co -U postgres -d postgres --schema=public -f `"$BackupDir\database-dump.sql`""
    exit 1
}

Write-Output "✅ Supabase credentials loaded"
Write-Output ""

# List of critical tables to backup
$tables = @(
    "user_profiles",
    "routines",
    "exercises",
    "routine_exercises",
    "workout_logs",
    "workout_log_entries",
    "food_servings",
    "nutrition_logs",
    "user_meals",
    "user_meal_foods",
    "meal_plans",
    "meal_plan_entries",
    "trainer_clients",
    "direct_messages",
    "scheduled_routines",
    "programs",
    "program_routines",
    "mesocycles",
    "mesocycle_weeks",
    "mesocycle_sessions",
    "bug_reports",
    "bug_report_replies"
)

Write-Output "📊 Tables to export: $($tables.Count)"
Write-Output ""

# Create export directory
$exportDir = Join-Path $BackupDir "database_export"
New-Item -ItemType Directory -Path $exportDir -Force | Out-Null

$exportedCount = 0
$failedTables = @()

foreach ($table in $tables) {
    Write-Output "Exporting $table..."
    
    try {
        $uri = "$supabaseUrl/rest/v1/$table`?select=*"
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        }
        
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
        $jsonFile = Join-Path $exportDir "$table.json"
        $response | ConvertTo-Json -Depth 10 | Set-Content $jsonFile
        
        $count = if ($response -is [Array]) { $response.Count } else { 1 }
        Write-Output "   ✅ Exported $count records to $table.json"
        $exportedCount++
    }
    catch {
        Write-Output "   ⚠️  Failed: $($_.Exception.Message)"
        $failedTables += $table
    }
}

Write-Output ""
Write-Output "🎉 Export Complete!"
Write-Output "   Exported: $exportedCount/$($tables.Count) tables"
Write-Output "   Location: $exportDir"

if ($failedTables.Count -gt 0) {
    Write-Output ""
    Write-Output "⚠️  Failed tables: $($failedTables -join ', ')"
}

# Create export manifest
$manifest = @"
# Database Export Manifest
Export Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Export Method: Supabase REST API
Format: JSON (one file per table)

## Tables Exported: $exportedCount/$($tables.Count)
$($tables | ForEach-Object { "- $_" } | Out-String)

## Notes:
- This is a JSON export of table data
- For SQL format, use Supabase Dashboard > Database > Backups
- Or use pg_dump with direct database connection
"@

Set-Content -Path (Join-Path $exportDir "EXPORT_MANIFEST.md") -Value $manifest

Write-Output ""
Write-Output "📄 Manifest created: $exportDir\EXPORT_MANIFEST.md"
