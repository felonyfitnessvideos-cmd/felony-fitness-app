# 🚀 FELONY FITNESS - DEVELOPMENT ENVIRONMENT STARTUP

Write-Host "🚀 FELONY FITNESS - DEVELOPMENT STARTUP" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Ensure we're linked to development project
Write-Host ""
Write-Host "🔗 Ensuring development environment connection..." -ForegroundColor Yellow
& "$PSScriptRoot\project-manager.ps1" dev

# Start local development (if Docker is available)
Write-Host ""
Write-Host "🐳 Checking Docker availability..." -ForegroundColor Yellow
$dockerRunning = docker version 2>$null
if ($dockerRunning -and $LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker is available" -ForegroundColor Green
    
    $startLocal = Read-Host "Start local Supabase environment? (Y/n)"
    if ($startLocal -ne 'n' -and $startLocal -ne 'N') {
        Write-Host "🏗️ Starting local Supabase..." -ForegroundColor Yellow
        npx supabase start
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Local Supabase started successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Local Supabase had issues, but cloud development is available" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️ Docker not available - using cloud development environment" -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules") -or (Get-ChildItem "node_modules" -ErrorAction SilentlyContinue).Count -lt 10) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm ci
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies are up to date" -ForegroundColor Green
}

# Start development server
Write-Host ""
Write-Host "⚡ Starting development server..." -ForegroundColor Yellow
$serverChoice = Read-Host "Start React development server? (Y/n)"
if ($serverChoice -ne 'n' -and $serverChoice -ne 'N') {
    # Start server in background
    $devServerJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    Write-Host "✅ Development server starting (Job ID: $($devServerJob.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 3
    
    # Test if server is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ React app is running at http://localhost:5173" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Development server is starting up..." -ForegroundColor Yellow
    }
}

# Development environment summary
Write-Host ""
Write-Host "🎯 DEVELOPMENT ENVIRONMENT READY!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 DEVELOPMENT URLS:" -ForegroundColor Cyan
Write-Host "   📱 React App:        http://localhost:5173/" -ForegroundColor White
Write-Host "   🗄️ Database Studio:  http://127.0.0.1:54323 (if local)" -ForegroundColor White
Write-Host "   📊 Dev Dashboard:    https://supabase.com/dashboard/project/ytpblkbwgdbiserhrlqm" -ForegroundColor White
Write-Host ""
Write-Host "🔧 DEVELOPMENT TOOLS:" -ForegroundColor Cyan  
Write-Host "   📊 Check Status:     .\check-status.ps1" -ForegroundColor White
Write-Host "   🔄 Switch to Prod:   .\project-manager.ps1 prod" -ForegroundColor White
Write-Host "   🛠️ Project Dashboard: .\project-dashboard.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ DEVELOPMENT NOTES:" -ForegroundColor Yellow
Write-Host "   • Safe to experiment - isolated from production" -ForegroundColor White
Write-Host "   • Database changes won't affect live users" -ForegroundColor White  
Write-Host "   • Use cloud database if local containers have issues" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy development!" -ForegroundColor Green

# Keep window open
Read-Host "Press Enter to close"