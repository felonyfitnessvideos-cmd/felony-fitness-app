#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test database connection for backup readiness

.DESCRIPTION
    Verifies all prerequisites are met for reliable database backups:
    - PostgreSQL client tools installed
    - Environment variables configured
    - Network connectivity to Supabase
    - Database credentials valid

.EXAMPLE
    .\test-backup-connection.ps1
#>

$ErrorActionPreference = "Continue"

Write-Host "`n=== Database Backup Connection Test ===" -ForegroundColor Cyan
Write-Host "Testing prerequisites for backup-database.ps1`n" -ForegroundColor Gray

$allPassed = $true

# ==============================================================================
# Test 1: PostgreSQL Client Tools
# ==============================================================================

Write-Host "[1/5] Checking PostgreSQL client tools..." -ForegroundColor Yellow
try {
    $pgVersion = & pg_dump --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ PASS: $pgVersion" -ForegroundColor Green
    } else {
        throw "Command failed"
    }
}
catch {
    Write-Host "  ❌ FAIL: pg_dump not found" -ForegroundColor Red
    Write-Host "     Install: choco install postgresql" -ForegroundColor Yellow
    Write-Host "     Or download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $allPassed = $false
}

# ==============================================================================
# Test 2: Environment Variables
# ==============================================================================

Write-Host "`n[2/5] Checking environment variables..." -ForegroundColor Yellow

# Try to load from .env.local
$envFile = Join-Path $PSScriptRoot ".." ".env.local"
if (Test-Path $envFile) {
    Write-Host "  Found .env.local file" -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "  No .env.local file found (checking system environment)" -ForegroundColor Gray
}

$projectId = $env:SUPABASE_PROJECT_ID
$dbPassword = $env:SUPABASE_DB_PASSWORD

if ($projectId) {
    Write-Host "  ✅ PASS: SUPABASE_PROJECT_ID set ($projectId)" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAIL: SUPABASE_PROJECT_ID not set" -ForegroundColor Red
    Write-Host "     Add to .env.local: SUPABASE_PROJECT_ID=wkmrdelhoeqhsdifrarn" -ForegroundColor Yellow
    $allPassed = $false
}

if ($dbPassword) {
    $masked = "*" * $dbPassword.Length
    Write-Host "  ✅ PASS: SUPABASE_DB_PASSWORD set ($masked)" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAIL: SUPABASE_DB_PASSWORD not set" -ForegroundColor Red
    Write-Host "     Add to .env.local: SUPABASE_DB_PASSWORD=your-password" -ForegroundColor Yellow
    $allPassed = $false
}

# ==============================================================================
# Test 3: Network Connectivity
# ==============================================================================

Write-Host "`n[3/5] Checking network connectivity..." -ForegroundColor Yellow

if ($projectId) {
    $dbHost = "db.$projectId.supabase.co"
    
    try {
        $ping = Test-Connection -ComputerName $dbHost -Count 1 -Quiet -ErrorAction Stop
        if ($ping) {
            Write-Host "  ✅ PASS: Can reach $dbHost" -ForegroundColor Green
        } else {
            throw "Ping failed"
        }
    }
    catch {
        Write-Host "  ⚠️  WARN: Cannot ping $dbHost" -ForegroundColor Yellow
        Write-Host "     This may be normal (ICMP blocked), testing TCP connection..." -ForegroundColor Gray
        
        try {
            $tcpTest = Test-NetConnection -ComputerName $dbHost -Port 5432 -WarningAction SilentlyContinue -ErrorAction Stop
            if ($tcpTest.TcpTestSucceeded) {
                Write-Host "  ✅ PASS: TCP port 5432 is open" -ForegroundColor Green
            } else {
                throw "TCP connection failed"
            }
        }
        catch {
            Write-Host "  ❌ FAIL: Cannot connect to port 5432" -ForegroundColor Red
            Write-Host "     Check firewall/VPN settings" -ForegroundColor Yellow
            $allPassed = $false
        }
    }
} else {
    Write-Host "  ⏭️  SKIP: No project ID to test" -ForegroundColor Gray
}

# ==============================================================================
# Test 4: SSL/TLS Support
# ==============================================================================

Write-Host "`n[4/5] Checking SSL/TLS support..." -ForegroundColor Yellow

if ($projectId -and $dbPassword) {
    $dbHost = "db.$projectId.supabase.co"
    $env:PGPASSWORD = $dbPassword
    $env:PGSSLMODE = "require"
    
    try {
        # Try a simple psql command to test connection
        $testQuery = "SELECT version();"
        $result = & psql --host=$dbHost --port=5432 --username=postgres --dbname=postgres --tuples-only --no-align --command="$testQuery" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ PASS: SSL connection successful" -ForegroundColor Green
            $version = ($result -split "`n")[0] -replace "^\s+", ""
            Write-Host "     Database version: $version" -ForegroundColor Gray
        } else {
            throw "Connection test failed"
        }
    }
    catch {
        Write-Host "  ❌ FAIL: Cannot establish SSL connection" -ForegroundColor Red
        Write-Host "     Error: $_" -ForegroundColor Yellow
        Write-Host "     Check database password is correct" -ForegroundColor Yellow
        $allPassed = $false
    }
    finally {
        $env:PGPASSWORD = $null
    }
} else {
    Write-Host "  ⏭️  SKIP: Missing credentials for connection test" -ForegroundColor Gray
}

# ==============================================================================
# Test 5: Backup Directory
# ==============================================================================

Write-Host "`n[5/5] Checking backup directory..." -ForegroundColor Yellow

$backupDir = Join-Path $PSScriptRoot ".." "backups"
if (Test-Path $backupDir) {
    $backupCount = (Get-ChildItem $backupDir -Filter "*.sql" -ErrorAction SilentlyContinue).Count
    Write-Host "  ✅ PASS: Backup directory exists" -ForegroundColor Green
    Write-Host "     Location: $backupDir" -ForegroundColor Gray
    Write-Host "     Existing backups: $backupCount" -ForegroundColor Gray
    
    # Check disk space
    $drive = (Get-Item $backupDir).PSDrive
    $freeSpaceGB = [Math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -gt 1) {
        Write-Host "  ✅ PASS: Sufficient disk space ($freeSpaceGB GB free)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  WARN: Low disk space ($freeSpaceGB GB free)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ️  INFO: Backup directory will be created automatically" -ForegroundColor Cyan
}

# ==============================================================================
# Summary
# ==============================================================================

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "`nYou're ready to run backups!" -ForegroundColor White
    Write-Host "  .\scripts\backup-database.ps1`n" -ForegroundColor Cyan
} else {
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "`nFix the issues above before running backups." -ForegroundColor Yellow
    Write-Host "See docs\DATABASE_BACKUP_GUIDE.md for troubleshooting.`n" -ForegroundColor Cyan
    exit 1
}
