# Backup Supabase Storage Buckets
# Downloads all files from storage buckets to local directory
# Keeps only the 3 most recent storage backups (auto-cleanup)

param(
    [string]$BackupName = "storage-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')",
    [int]$KeepBackups = 3
)

$backupDir = "backups\$BackupName"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "`n=== 📦 Starting Storage Bucket Backup ===" -ForegroundColor Cyan
Write-Host "Backup Directory: $backupDir" -ForegroundColor Gray
Write-Host "Retention Policy: Keep $KeepBackups most recent storage backups" -ForegroundColor Gray

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
            # Verify backup integrity
            $fileCount = (Get-ChildItem $bucketDir -Recurse -File | Measure-Object).Count
            $bucketSize = (Get-ChildItem $bucketDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
            $bucketSizeMB = [math]::Round($bucketSize / 1MB, 2)
            
            if ($fileCount -eq 0) {
                Write-Host "   ⚠️  Warning: No files found in bucket (may be empty)" -ForegroundColor Yellow
                $errorCount++
            } elseif ($bucketSize -eq 0) {
                Write-Host "   ❌ Error: Files downloaded but size is 0 bytes" -ForegroundColor Red
                $errorCount++
            } else {
                Write-Host "   ✅ Downloaded $fileCount files ($bucketSizeMB MB) - Verified" -ForegroundColor Green
                $successCount++
            }
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

# === CLEANUP OLD BACKUPS ===
Write-Host "`n=== 🧹 Cleaning Up Old Storage Backups ===" -ForegroundColor Cyan

# Get all storage backup directories
$allStorageBackups = Get-ChildItem "backups\" -Directory | 
    Where-Object { $_.Name -match '^storage-backup-' } | 
    Sort-Object CreationTime -Descending

$totalStorageBackups = $allStorageBackups.Count
Write-Host "Found $totalStorageBackups storage backup(s)" -ForegroundColor Gray

if ($totalStorageBackups -gt $KeepBackups) {
    $backupsToDelete = $allStorageBackups | Select-Object -Skip $KeepBackups
    $deleteCount = $backupsToDelete.Count
    
    Write-Host "Keeping $KeepBackups most recent, deleting $deleteCount old backup(s)..." -ForegroundColor Yellow
    
    foreach ($backup in $backupsToDelete) {
        try {
            $backupSize = (Get-ChildItem $backup.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
            $backupSizeMB = [math]::Round($backupSize / 1MB, 2)
            
            Write-Host "   🗑️  Deleting: $($backup.Name) ($backupSizeMB MB)..." -ForegroundColor Gray
            Remove-Item $backup.FullName -Recurse -Force
            Write-Host "   ✅ Deleted successfully" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to delete $($backup.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ Cleanup complete: $deleteCount old backup(s) removed" -ForegroundColor Green
} else {
    Write-Host "No cleanup needed (total backups: $totalStorageBackups, keep: $KeepBackups)" -ForegroundColor Green
}

# Open backup folder
explorer $backupDir
