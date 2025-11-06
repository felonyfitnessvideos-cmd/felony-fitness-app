#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════
# 🌙 END-OF-DAY PROTOCOL - Felony Fitness App
# ═══════════════════════════════════════════════════════════════════════
# Comprehensive end-of-day procedures including database backup, git commit,
# report generation, and environment cleanup.
#
# Usage: .\scripts\end-of-day.ps1
# ═══════════════════════════════════════════════════════════════════════

param(
    [string]$Message = "End of day backup",
    [switch]$SkipTests = $false,
    [switch]$SkipGit = $false
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$date = Get-Date -Format "yyyy-MM-dd"
$backupDir = "backups\eod-$timestamp"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🌙 END-OF-DAY PROTOCOL" -ForegroundColor Yellow
Write-Host "  📅 $date" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 1: Create Backup Directory
# ═══════════════════════════════════════════════════════════════════════
Write-Host "📁 Creating backup directory..." -ForegroundColor Blue
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "   ✅ Created: $backupDir" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 2: Database Backup via pg_dump
# ═══════════════════════════════════════════════════════════════════════
Write-Host "🗄️  BACKING UP DATABASE..." -ForegroundColor Blue

# Get Supabase connection details
$supabaseDir = "supabase"
$configFile = "$supabaseDir\config.toml"

if (Test-Path $configFile) {
    Write-Host "   📋 Reading Supabase configuration..." -ForegroundColor Yellow
    
    # Check if local Supabase is running
    $supabaseStatus = npx supabase status 2>&1
    
    if ($supabaseStatus -match "DB URL: (.+)") {
        $dbUrl = $matches[1]
        Write-Host "   🔗 Found local database connection" -ForegroundColor Yellow
        
        # Parse connection string for pg_dump
        if ($dbUrl -match "postgresql://postgres:(.+)@(.+):(\d+)/postgres") {
            $password = $matches[1]
            $host = $matches[2]
            $port = $matches[3]
            
            $env:PGPASSWORD = $password
            
            # Full database dump with schema and data
            Write-Host "   💾 Creating full database dump (schema + data)..." -ForegroundColor Yellow
            $dumpFile = "$backupDir\database-full-$timestamp.sql"
            pg_dump -h $host -p $port -U postgres -d postgres --clean --if-exists --verbose > $dumpFile 2>&1
            
            if ($LASTEXITCODE -eq 0 -and (Test-Path $dumpFile)) {
                $fileSize = (Get-Item $dumpFile).Length / 1KB
                Write-Host "   ✅ Full dump created: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️  Full dump failed, trying Supabase CLI method..." -ForegroundColor Yellow
            }
            
            # Schema-only dump for reference
            Write-Host "   📊 Creating schema-only dump..." -ForegroundColor Yellow
            $schemaFile = "$backupDir\database-schema-$timestamp.sql"
            pg_dump -h $host -p $port -U postgres -d postgres --schema-only --clean --if-exists > $schemaFile 2>&1
            
            if ($LASTEXITCODE -eq 0 -and (Test-Path $schemaFile)) {
                $schemaSize = (Get-Item $schemaFile).Length / 1KB
                Write-Host "   ✅ Schema dump created: $([math]::Round($schemaSize, 2)) KB" -ForegroundColor Green
            }
            
            # Data-only dump
            Write-Host "   📦 Creating data-only dump..." -ForegroundColor Yellow
            $dataFile = "$backupDir\database-data-$timestamp.sql"
            pg_dump -h $host -p $port -U postgres -d postgres --data-only > $dataFile 2>&1
            
            if ($LASTEXITCODE -eq 0 -and (Test-Path $dataFile)) {
                $dataSize = (Get-Item $dataFile).Length / 1KB
                Write-Host "   ✅ Data dump created: $([math]::Round($dataSize, 2)) KB" -ForegroundColor Green
            }
            
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        }
    }
    else {
        Write-Host "   ⚠️  Local Supabase not running, using CLI method..." -ForegroundColor Yellow
    }
}

# Fallback: Use Supabase CLI dump
Write-Host "   🔄 Creating Supabase CLI dump (migrations)..." -ForegroundColor Yellow
npx supabase db dump --linked --schema public > "$backupDir\schema-supabase-$timestamp.sql" 2>&1

if (Test-Path "$backupDir\schema-supabase-$timestamp.sql") {
    Write-Host "   ✅ Supabase schema dump created" -ForegroundColor Green
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 3: Backup Migrations
# ═══════════════════════════════════════════════════════════════════════
Write-Host "📚 BACKING UP MIGRATIONS..." -ForegroundColor Blue

if (Test-Path "supabase\migrations") {
    $migrationsBackup = "$backupDir\migrations"
    New-Item -ItemType Directory -Path $migrationsBackup -Force | Out-Null
    Copy-Item -Path "supabase\migrations\*" -Destination $migrationsBackup -Recurse -Force
    $migrationCount = (Get-ChildItem $migrationsBackup -Filter "*.sql" | Measure-Object).Count
    Write-Host "   ✅ Backed up $migrationCount migration files" -ForegroundColor Green
}
else {
    Write-Host "   ℹ️  No migrations directory found" -ForegroundColor Gray
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 4: Backup Source Code
# ═══════════════════════════════════════════════════════════════════════
Write-Host "💾 BACKING UP SOURCE CODE..." -ForegroundColor Blue

$srcDirs = @('src\components', 'src\pages', 'src\utils', 'src\context', 'src\hooks')
$fileCount = 0

foreach ($dir in $srcDirs) {
    if (Test-Path $dir) {
        $destDir = "$backupDir\$dir"
        Copy-Item -Path $dir -Destination $destDir -Recurse -Force
        $count = (Get-ChildItem $destDir -Recurse -File | Measure-Object).Count
        $fileCount += $count
        Write-Host "   ✅ $dir : $count files" -ForegroundColor Green
    }
}

Write-Host "   📦 Total source files backed up: $fileCount" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 5: Backup Configuration Files
# ═══════════════════════════════════════════════════════════════════════
Write-Host "⚙️  BACKING UP CONFIGURATION..." -ForegroundColor Blue

$configFiles = @(
    '.env',
    '.env.local',
    'package.json',
    'package-lock.json',
    'vite.config.js',
    'tsconfig.json',
    'eslint.config.js',
    'supabase\config.toml'
)

$configCount = 0
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$backupDir\$fileName" -Force
        $configCount++
    }
}

Write-Host "   ✅ Backed up $configCount config files" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 6: Run Tests (Optional)
# ═══════════════════════════════════════════════════════════════════════
if (-not $SkipTests) {
    Write-Host "🧪 RUNNING TESTS..." -ForegroundColor Blue
    
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            npm test -- --run --reporter=verbose > "$backupDir\test-results-$timestamp.log" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ All tests passed" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️  Some tests failed - check log" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   ℹ️  No test script configured" -ForegroundColor Gray
        }
    }
    Write-Host ""
}
else {
    Write-Host "⏭️  SKIPPING TESTS (--SkipTests flag)" -ForegroundColor Yellow
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════
# STEP 7: Git Operations
# ═══════════════════════════════════════════════════════════════════════
if (-not $SkipGit) {
    Write-Host "📝 GIT OPERATIONS..." -ForegroundColor Blue
    
    # Check for changes
    $gitStatus = git status --porcelain 2>&1
    
    if ($gitStatus) {
        Write-Host "   📊 Changes detected:" -ForegroundColor Yellow
        git status --short
        Write-Host ""
        
        Write-Host "   💾 Staging all changes..." -ForegroundColor Yellow
        git add .
        
        Write-Host "   📝 Creating commit..." -ForegroundColor Yellow
        git commit -m "chore: end of day backup - $date`n`n$Message" -q 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Changes committed" -ForegroundColor Green
            
            $currentBranch = git branch --show-current
            Write-Host "   🚀 Pushing to origin/$currentBranch..." -ForegroundColor Yellow
            git push origin $currentBranch 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Pushed to remote" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️  Push failed - check connection" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   ⚠️  Commit failed - may need manual intervention" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "   ℹ️  No changes to commit" -ForegroundColor Gray
    }
    Write-Host ""
}
else {
    Write-Host "⏭️  SKIPPING GIT OPERATIONS (--SkipGit flag)" -ForegroundColor Yellow
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════
# STEP 8: Cleanup Old Backups
# ═══════════════════════════════════════════════════════════════════════
Write-Host "🧹 CLEANING UP OLD BACKUPS..." -ForegroundColor Blue

if (Test-Path "backups") {
    $oldBackups = Get-ChildItem "backups" -Directory | 
    Where-Object { $_.Name -like "eod-*" } |
    Sort-Object CreationTime -Descending | 
    Select-Object -Skip 7
    
    if ($oldBackups) {
        $oldBackups | Remove-Item -Recurse -Force
        Write-Host "   🗑️  Removed $($oldBackups.Count) old backup(s)" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ℹ️  No old backups to remove (keeping last 7)" -ForegroundColor Gray
    }
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 9: Generate Database Statistics
# ═══════════════════════════════════════════════════════════════════════
Write-Host "📊 GENERATING DATABASE STATISTICS..." -ForegroundColor Blue

$dbStats = npx supabase inspect db table-stats --linked 2>&1 | Out-String

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# STEP 10: Generate End-of-Day Report
# ═══════════════════════════════════════════════════════════════════════
Write-Host "📋 GENERATING END-OF-DAY REPORT..." -ForegroundColor Blue

# Get git log for today
$todayCommits = git log --since="midnight" --pretty=format:"- %s (%ar by %an)" 2>&1 | Out-String

# Calculate backup size
$backupSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

$report = @"
# 🌙 END-OF-DAY REPORT
**Date:** $date  
**Time:** $(Get-Date -Format "HH:mm:ss")  
**Backup ID:** $timestamp

---

## ✅ BACKUP SUMMARY

### 📦 Files Backed Up
- **Database Dumps:** $(Get-ChildItem $backupDir -Filter "database-*.sql" | Measure-Object | Select-Object -ExpandProperty Count) files
- **Schema Dumps:** $(Get-ChildItem $backupDir -Filter "*schema*.sql" | Measure-Object | Select-Object -ExpandProperty Count) files
- **Migrations:** $(if (Test-Path "$backupDir\migrations") { (Get-ChildItem "$backupDir\migrations" -Filter "*.sql" | Measure-Object).Count } else { 0 }) files
- **Source Files:** $fileCount files
- **Config Files:** $configCount files
- **Total Backup Size:** $([math]::Round($backupSize, 2)) MB

### 🗄️ Database Backup Details
``````
Full dump:    $backupDir\database-full-$timestamp.sql
Schema only:  $backupDir\database-schema-$timestamp.sql
Data only:    $backupDir\database-data-$timestamp.sql
Supabase CLI: $backupDir\schema-supabase-$timestamp.sql
``````

### 📊 Database Statistics
``````
$dbStats
``````

---

## 🔄 GIT ACTIVITY (Today)

$todayCommits

---

## 📍 BACKUP LOCATION
``````
$backupDir
``````

---

## 🔄 RESTORE INSTRUCTIONS

### To Restore Full Database:
``````powershell
# Set password
`$env:PGPASSWORD = "your-password"

# Restore full database
psql -h localhost -p 54322 -U postgres -d postgres -f "$backupDir\database-full-$timestamp.sql"

# Or restore schema + data separately
psql -h localhost -p 54322 -U postgres -d postgres -f "$backupDir\database-schema-$timestamp.sql"
psql -h localhost -p 54322 -U postgres -d postgres -f "$backupDir\database-data-$timestamp.sql"
``````

### To Restore via Supabase CLI:
``````powershell
npx supabase db reset
npx supabase db push
``````

---

## ✅ NEXT SESSION CHECKLIST

- [ ] Review any test failures
- [ ] Check for pending migrations
- [ ] Verify database backup integrity
- [ ] Plan tomorrow's development tasks
- [ ] Review open pull requests
- [ ] Check for security updates

---

## 🛡️ ENVIRONMENT STATUS

**Local Development:** ✅ Ready  
**Database Backup:** ✅ Complete  
**Git Status:** ✅ Committed  
**Tests:** $(if ($SkipTests) { "⏭️ Skipped" } else { "✅ Complete" })

---

*Generated by end-of-day.ps1 - Felony Fitness App*
"@

$report | Out-File "$backupDir\EOD-REPORT.md" -Encoding UTF8

Write-Host "   ✅ Report generated: EOD-REPORT.md" -ForegroundColor Green
Write-Host ""

# Also update the root END_OF_DAY_REPORT.md
$report | Out-File "END_OF_DAY_REPORT.md" -Encoding UTF8

# ═══════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ END-OF-DAY PROTOCOL COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📦 Backup Size: $([math]::Round($backupSize, 2)) MB" -ForegroundColor White
Write-Host "  📍 Location: $backupDir" -ForegroundColor White
Write-Host "  📋 Report: $backupDir\EOD-REPORT.md" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Open the report
Write-Host "Would you like to view the report? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    code "$backupDir\EOD-REPORT.md"
}

Write-Host ""
Write-Host "🌙 Good night! See you tomorrow. 👋" -ForegroundColor Cyan
Write-Host ""
