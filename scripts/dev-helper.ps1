#!/usr/bin/env pwsh
# Daily Development Helper Script
# Created: 2025-11-03
# Purpose: Automate common end-of-day development tasks

param(
    [switch]$RunAll,
    [switch]$Backup,
    [switch]$Types,
    [switch]$Tests,
    [switch]$Status,
    [switch]$Help
)

function Show-Help {
    Write-Host "🛠️  Daily Development Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\dev-helper.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -RunAll    Run all daily tasks in sequence"
    Write-Host "  -Backup    Run database backup"
    Write-Host "  -Types     Generate fresh TypeScript types"
    Write-Host "  -Tests     Run all tests"
    Write-Host "  -Status    Show git and database status"
    Write-Host "  -Help      Show this help message"
    Write-Host ""
}

function Invoke-Backup {
    Write-Host "🔄 Running daily backup..." -ForegroundColor Blue
    try {
        & ".\scripts\daily-backup.ps1"
        Write-Host "✅ Backup completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-GenerateTypes {
    Write-Host "🔄 Generating TypeScript types..." -ForegroundColor Blue
    try {
        npx supabase gen types typescript --linked > src/types/supabase.ts
        Write-Host "✅ Types generated successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Type generation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Invoke-RunTests {
    Write-Host "🔄 Running all tests..." -ForegroundColor Blue
    try {
        npm test -- --watchAll=false
        Write-Host "✅ Tests completed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Tests failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "📊 Project Status" -ForegroundColor Cyan
    Write-Host ""
    
    # Git Status
    Write-Host "Git Status:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    # Database Status
    Write-Host "Database Status:" -ForegroundColor Yellow
    try {
        npx supabase db diff --linked
    } catch {
        Write-Host "No database changes detected" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Recent Commits
    Write-Host "Recent Commits:" -ForegroundColor Yellow
    git log --oneline -5
    Write-Host ""
}

# Main execution logic
if ($Help) {
    Show-Help
    exit 0
}

if ($RunAll) {
    Write-Host "🚀 Running all daily tasks..." -ForegroundColor Magenta
    Show-Status
    Invoke-GenerateTypes
    Invoke-RunTests
    Invoke-Backup
    Write-Host "🎉 All daily tasks completed!" -ForegroundColor Green
    exit 0
}

if ($Status) {
    Show-Status
}

if ($Types) {
    Invoke-GenerateTypes
}

if ($Tests) {
    Invoke-RunTests
}

if ($Backup) {
    Invoke-Backup
}

if (-not ($Status -or $Types -or $Tests -or $Backup)) {
    Write-Host "No options specified. Use -Help for usage information." -ForegroundColor Yellow
    Show-Help
}