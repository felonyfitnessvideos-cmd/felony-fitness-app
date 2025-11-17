#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix pipeline trigger RLS issue
.DESCRIPTION
    Executes SQL to add SECURITY DEFINER to the trigger function
#>

$ErrorActionPreference = "Stop"

Write-Host "🔧 Fixing pipeline trigger RLS issue..." -ForegroundColor Cyan

$sql = Get-Content "scripts\fix-pipeline-trigger-rls.sql" -Raw

try {
    # Execute using psql via DATABASE_URL
    $sql | psql $env:DATABASE_URL
    
    Write-Host "✅ Trigger fixed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The trigger now runs with SECURITY DEFINER to bypass RLS." -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error executing SQL: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this SQL manually in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new" -ForegroundColor Cyan
    exit 1
}
