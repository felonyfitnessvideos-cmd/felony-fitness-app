#!/usr/bin/env pwsh
# Daily backup script for Felony Fitness App
# Run this at the end of each development day

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "daily-backups\$timestamp"

Write-Host "🔄 Starting daily backup process..." -ForegroundColor Blue

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# 1. Database backup (export schema and data)
Write-Host "📊 Backing up database schema..." -ForegroundColor Yellow
npx supabase db dump --linked --schema public > "$backupDir\schema-$timestamp.sql"

# 2. Export current migrations
Write-Host "📁 Backing up migrations..." -ForegroundColor Yellow
Copy-Item -Path "supabase\migrations\*" -Destination "$backupDir\migrations\" -Recurse -Force

# 3. Backup critical source files
Write-Host "💾 Backing up source code..." -ForegroundColor Yellow
$srcDirs = @('src\components', 'src\pages', 'src\utils', 'src\context')
foreach ($dir in $srcDirs) {
    if (Test-Path $dir) {
        Copy-Item -Path $dir -Destination "$backupDir\src\" -Recurse -Force
    }
}

# 4. Backup configuration files
Write-Host "⚙️ Backing up config files..." -ForegroundColor Yellow
$configFiles = @('.env', 'package.json', 'vite.config.js', 'tsconfig.json')
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $backupDir -Force
    }
}

# 5. Generate fresh types
Write-Host "🔧 Generating fresh TypeScript types..." -ForegroundColor Yellow
npx supabase gen types typescript --linked > "src\types\supabase.ts"

# 6. Run tests (if they exist)
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        npm test -- --run --reporter=verbose > "$backupDir\test-results-$timestamp.log" 2>&1
    }
}

# 7. Git commit (if in git repo)
Write-Host "📝 Creating git commit..." -ForegroundColor Yellow
git add .
git commit -m "Daily backup: $timestamp" -q 2>$null

# 8. Cleanup old backups (keep last 7 days)
Write-Host "🧹 Cleaning up old backups..." -ForegroundColor Yellow
Get-ChildItem "daily-backups" -Directory | Sort-Object CreationTime -Descending | Select-Object -Skip 7 | Remove-Item -Recurse -Force

# 9. Generate backup report
$report = @"
# Daily Backup Report - $timestamp

## ✅ Backup Completed Successfully

### Files Backed Up:
- Database schema: schema-$timestamp.sql
- Migrations: $(Get-ChildItem "$backupDir\migrations" | Measure-Object | Select-Object -ExpandProperty Count) files
- Source files: $(Get-ChildItem "$backupDir\src" -Recurse | Measure-Object | Select-Object -ExpandProperty Count) files
- Config files: $(Get-ChildItem $backupDir -File | Where-Object { $_.Name -notlike "*.sql" -and $_.Name -notlike "*.log" } | Measure-Object | Select-Object -ExpandProperty Count) files

### Database Tables:
$(npx supabase inspect db table-stats --linked | Out-String)

### Next Steps:
- [ ] Review any test failures
- [ ] Check for any pending migrations
- [ ] Verify all components have tests
- [ ] Plan tomorrow's development tasks

### Backup Location: $backupDir
"@

$report | Out-File "$backupDir\BACKUP-REPORT.md" -Encoding UTF8

Write-Host "✅ Daily backup completed successfully!" -ForegroundColor Green
Write-Host "📍 Backup location: $backupDir" -ForegroundColor Cyan
Write-Host "📋 Report: $backupDir\BACKUP-REPORT.md" -ForegroundColor Cyan