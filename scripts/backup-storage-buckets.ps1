# Backup Supabase Storage Buckets
# Downloads all files from storage buckets to local directory

param(
    [string]$BackupName = "storage-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
)

$backupDir = "backups\$BackupName"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "`n=== 📦 Starting Storage Bucket Backup ===" -ForegroundColor Cyan
Write-Host "Backup Directory: $backupDir" -ForegroundColor Gray

# List of buckets to backup
$buckets = @(
    "trainer-manual-chapters",
    "email-assets",
    "logo_banner",
    "Staff Headshots",
    "BodyFatImages",
    "exercise_icons"
)

$totalBuckets = $buckets.Count
$currentBucket = 0
$successCount = 0
$errorCount = 0

foreach ($bucket in $buckets) {
    $currentBucket++
    Write-Host "`n[$currentBucket/$totalBuckets] Backing up bucket: $bucket..." -ForegroundColor Cyan
    
    try {
        $bucketDir = Join-Path $backupDir $bucket
        New-Item -ItemType Directory -Path $bucketDir -Force | Out-Null
        
        # Download entire bucket recursively
        $result = npx supabase storage cp --linked --experimental -r -j 4 "ss:///$bucket" $bucketDir 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            # Count files in bucket
            $fileCount = (Get-ChildItem $bucketDir -Recurse -File | Measure-Object).Count
            $bucketSize = (Get-ChildItem $bucketDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
            $bucketSizeMB = [math]::Round($bucketSize / 1MB, 2)
            
            Write-Host "   ✅ Downloaded $fileCount files ($bucketSizeMB MB)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ⚠️  Warning: $result" -ForegroundColor Yellow
            $errorCount++
        }
        
    } catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
        
        # Save error log
        $errorFile = Join-Path $backupDir "$bucket.error.txt"
        $_.Exception | Out-File $errorFile
    }
}

# Create metadata file
$metadata = @{
    backup_name = $BackupName
    backup_date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    buckets_backed_up = $buckets
    total_buckets = $buckets.Count
    successful = $successCount
    failed = $errorCount
} | ConvertTo-Json

$metadata | Set-Content (Join-Path $backupDir "metadata.json") -Encoding UTF8

# Calculate total backup size
$totalSize = (Get-ChildItem $backupDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
$totalFiles = (Get-ChildItem $backupDir -Recurse -File | Measure-Object).Count

Write-Host "`n=== ✅ Storage Backup Complete ===" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Cyan
Write-Host "Total Size: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host "Total Files: $totalFiles" -ForegroundColor Cyan
Write-Host "Successful Buckets: $successCount/$totalBuckets" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })

if ($errorCount -gt 0) {
    Write-Host "`n⚠️  $errorCount bucket(s) had errors. Check error logs in backup directory." -ForegroundColor Yellow
}

Write-Host "`n💡 To restore storage buckets, use: npx supabase storage cp -r <local-dir> ss:///bucket-name" -ForegroundColor Yellow

# Open backup folder
explorer $backupDir
