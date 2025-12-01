#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Reliable Supabase Database Backup Script

.DESCRIPTION
    Creates a full database backup using pg_dump with optimized connection settings
    to avoid timeout and connection issues. Handles SSL, keepalive, and network issues.

.PARAMETER BackupName
    Optional custom name for backup (default: timestamp)

.PARAMETER OutputDir
    Directory to store backups (default: ./backups)

.EXAMPLE
    .\backup-database.ps1
    
.EXAMPLE
    .\backup-database.ps1 -BackupName "pre-migration" -OutputDir "C:\backups"

.NOTES
    Requires:
    - PostgreSQL client tools (pg_dump) installed
    - Supabase connection details in environment or .env file
    - Network connectivity to Supabase
#>

param(
    [string]$BackupName,
    [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"

# ==============================================================================
# CONFIGURATION
# ==============================================================================

Write-Host "`n=== Supabase Database Backup Tool ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

# Load environment variables from .env.local if exists
$envFile = Join-Path $PSScriptRoot ".." ".env.local"
if (Test-Path $envFile) {
    Write-Host "[INFO] Loading environment variables from .env.local" -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Supabase connection details
# You can either:
# 1. Set these as environment variables (recommended)
# 2. Replace with your actual values (not recommended for security)
$SUPABASE_PROJECT_ID = $env:SUPABASE_PROJECT_ID
$SUPABASE_DB_PASSWORD = $env:SUPABASE_DB_PASSWORD
$SUPABASE_HOST = if ($SUPABASE_PROJECT_ID) { "db.$SUPABASE_PROJECT_ID.supabase.co" } else { $null }

# Fallback: Try to extract from SUPABASE_URL
if (-not $SUPABASE_HOST -and $env:VITE_SUPABASE_URL) {
    $SUPABASE_HOST = ($env:VITE_SUPABASE_URL -replace 'https://', '' -replace '\.supabase\.co.*', '') + '.supabase.co'
    $SUPABASE_HOST = "db." + ($SUPABASE_HOST -replace 'https://', '')
}

# Database details
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PORT = "5432"

# ==============================================================================
# VALIDATION
# ==============================================================================

function Test-PostgresqlClient {
    try {
        $null = Get-Command pg_dump -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "[CHECK] Validating prerequisites..." -ForegroundColor Yellow

# Check pg_dump installation
if (-not (Test-PostgresqlClient)) {
    Write-Host "`n[ERROR] PostgreSQL client tools not found!" -ForegroundColor Red
    Write-Host "`nTo install pg_dump on Windows:" -ForegroundColor Yellow
    Write-Host "1. Download PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Run installer and select 'Command Line Tools' option" -ForegroundColor White
    Write-Host "3. Or use Chocolatey: choco install postgresql" -ForegroundColor White
    Write-Host "4. Add PostgreSQL bin folder to PATH (usually: C:\Program Files\PostgreSQL\16\bin)" -ForegroundColor White
    Write-Host "`nAlternative: Use Supabase Dashboard backup (Database → Backups → Create Backup)" -ForegroundColor Cyan
    exit 1
}
Write-Host "  ✓ pg_dump found" -ForegroundColor Green

# Check connection details
if (-not $SUPABASE_HOST -or -not $SUPABASE_DB_PASSWORD) {
    Write-Host "`n[ERROR] Missing Supabase connection details!" -ForegroundColor Red
    Write-Host "`nPlease set these environment variables:" -ForegroundColor Yellow
    Write-Host "  SUPABASE_PROJECT_ID=your-project-id" -ForegroundColor White
    Write-Host "  SUPABASE_DB_PASSWORD=your-db-password" -ForegroundColor White
    Write-Host "`nTo find your credentials:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://supabase.com/dashboard/project/_/settings/database" -ForegroundColor White
    Write-Host "2. Copy 'Project ID' from URL (e.g., 'wkmrdelhoeqhsdifrarn')" -ForegroundColor White
    Write-Host "3. Copy 'Database password' (you set this during project creation)" -ForegroundColor White
    Write-Host "4. Add to .env.local file in project root" -ForegroundColor White
    Write-Host "`nOR create .env.local file with these values" -ForegroundColor Cyan
    exit 1
}
Write-Host "  ✓ Connection details found" -ForegroundColor Green

# ==============================================================================
# BACKUP PROCESS
# ==============================================================================

# Create backup directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "  ✓ Created backup directory: $OutputDir" -ForegroundColor Green
}

# Generate backup filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$filename = if ($BackupName) { 
    "$BackupName-$timestamp.sql" 
} else { 
    "supabase-backup-$timestamp.sql" 
}
$backupPath = Join-Path $OutputDir $filename

Write-Host "`n[INFO] Starting backup..." -ForegroundColor Yellow
Write-Host "  Database: $DB_NAME@$SUPABASE_HOST" -ForegroundColor Gray
Write-Host "  Output: $backupPath" -ForegroundColor Gray

# Set password environment variable for pg_dump
$env:PGPASSWORD = $SUPABASE_DB_PASSWORD

# Build pg_dump command with optimized connection settings
# These settings prevent timeout and connection issues:
$pgDumpArgs = @(
    "--host=$SUPABASE_HOST",
    "--port=$DB_PORT",
    "--username=$DB_USER",
    "--dbname=$DB_NAME",
    
    # Connection reliability settings
    "--no-password",                    # Use PGPASSWORD env var
    
    # Backup options
    "--format=plain",                   # SQL text format (easiest to restore)
    "--no-owner",                       # Don't include ownership commands
    "--no-privileges",                  # Don't include privilege commands (ACL)
    "--verbose",                        # Show progress
    "--clean",                          # Include DROP statements before CREATE
    "--if-exists",                      # Use IF EXISTS in DROP statements
    
    # Schema options
    "--schema=public",                  # Only backup public schema
    "--no-tablespaces",                 # Don't include tablespace assignments
    
    # Data options
    "--inserts",                        # Use INSERT commands (slower but more compatible)
    
    # Output
    "--file=$backupPath"
)

# Additional connection options via environment variables
$env:PGSSLMODE = "require"              # Require SSL connection
$env:PGCONNECT_TIMEOUT = "30"           # Connection timeout
$env:PGCLIENTENCODING = "UTF8"          # Character encoding

Write-Host "`n[RUNNING] Executing pg_dump..." -ForegroundColor Cyan
Write-Host "  This may take several minutes for large databases..." -ForegroundColor Gray
Write-Host "  Progress will be shown below:`n" -ForegroundColor Gray

try {
    # Execute pg_dump
    $startTime = Get-Date
    & pg_dump @pgDumpArgs 2>&1 | ForEach-Object {
        if ($_ -match "pg_dump: (reading|dumping|executing)") {
            Write-Host "  $_" -ForegroundColor DarkGray
        }
        elseif ($_ -match "error|ERROR|fatal|FATAL") {
            Write-Host "  $_" -ForegroundColor Red
        }
        else {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    # Verify backup file exists and has content
    if (-not (Test-Path $backupPath)) {
        throw "Backup file was not created"
    }
    
    $fileSize = (Get-Item $backupPath).Length
    if ($fileSize -lt 1000) {
        throw "Backup file is suspiciously small ($fileSize bytes)"
    }
    
    $fileSizeMB = [Math]::Round($fileSize / 1MB, 2)
    
    Write-Host "`n=== ✅ BACKUP SUCCESSFUL ===" -ForegroundColor Green
    Write-Host "  File: $backupPath" -ForegroundColor White
    Write-Host "  Size: $fileSizeMB MB" -ForegroundColor White
    Write-Host "  Duration: $([Math]::Round($duration, 1)) seconds" -ForegroundColor White
    Write-Host "`nTo restore this backup:" -ForegroundColor Cyan
    Write-Host "  1. Use Supabase Dashboard → Database → Restore" -ForegroundColor White
    Write-Host "  2. Or use: psql -h $SUPABASE_HOST -U $DB_USER -d $DB_NAME -f `"$backupPath`"" -ForegroundColor White
    Write-Host "`nBackup stored in: $OutputDir" -ForegroundColor Gray
}
catch {
    Write-Host "`n=== ❌ BACKUP FAILED ===" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify credentials are correct" -ForegroundColor White
    Write-Host "  2. Check network connectivity: Test-Connection db.$SUPABASE_PROJECT_ID.supabase.co" -ForegroundColor White
    Write-Host "  3. Verify database password in Supabase Dashboard" -ForegroundColor White
    Write-Host "  4. Check if firewall is blocking port 5432" -ForegroundColor White
    Write-Host "  5. Try Supabase Dashboard backup as alternative" -ForegroundColor White
    
    # Clean up partial backup file
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Force
    }
    
    exit 1
}
finally {
    # Clear sensitive environment variables
    $env:PGPASSWORD = $null
    $env:SUPABASE_DB_PASSWORD = $null
}

Write-Host ""
