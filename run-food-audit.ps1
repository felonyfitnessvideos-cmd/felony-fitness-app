#!/usr/bin/env pwsh
# Quick food audit runner
# Usage: .\run-food-audit.ps1

Write-Host "Food Values Audit Runner" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Check if psql is available
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "PostgreSQL client (psql) not found. Please install PostgreSQL or use Supabase dashboard." -ForegroundColor Red
    exit 1
}

# Prompt for database password
$password = Read-Host -Prompt "Enter your Supabase database password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Connection details
$host = "db.wkmrdelhoeqhsdifrarn.supabase.co"
$port = "5432"
$database = "postgres"
$username = "postgres"

Write-Host "Connecting to Supabase database..." -ForegroundColor Yellow

# Set environment variable for password
$env:PGPASSWORD = $passwordText

try {
    # Run the audit script
    psql -h $host -p $port -d $database -U $username -f "food-audit.sql" -o "food-audit-results.txt"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Audit complete! Results saved to food-audit-results.txt" -ForegroundColor Green
    } else {
        Write-Host "Audit failed. Check your connection details." -ForegroundColor Red
    }
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}