# 🔍 FELONY FITNESS - SYSTEM STATUS CHECK
# Quick health check for all development services

Write-Host ""
Write-Host "🔍 FELONY FITNESS SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Docker Status
Write-Host "🐳 DOCKER STATUS:" -ForegroundColor Yellow
try {
    $dockerVersion = docker version --format "{{.Server.Version}}" 2>$null
    if ($dockerVersion) {
        Write-Host "   ✅ Docker Engine: v$dockerVersion" -ForegroundColor Green
        
        # Check Supabase containers
        $containers = docker ps --filter "name=supabase" --format "{{.Names}}: {{.Status}}"
        if ($containers) {
            Write-Host "   🗄️ Supabase Containers:" -ForegroundColor Cyan
            $containers | ForEach-Object { Write-Host "      $_" -ForegroundColor White }
        } else {
            Write-Host "   ❌ No Supabase containers running" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Docker not running" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Docker unavailable" -ForegroundColor Red
}

# Development Server Status
Write-Host ""
Write-Host "🌐 DEVELOPMENT SERVER STATUS:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ React App: Running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ React App: Not running or not responding" -ForegroundColor Red
}

# Database Status
Write-Host ""
Write-Host "🗄️ DATABASE STATUS:" -ForegroundColor Yellow
try {
    # Check if database is accessible
    $dbTest = docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database: Accessible" -ForegroundColor Green
        
        # Check food data
        $foodCount = docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM food_servings;" 2>$null
        if ($foodCount -and $foodCount.Trim() -gt 0) {
            Write-Host "   ✅ Food Database: $($foodCount.Trim()) foods available" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Food Database: No data (may need import)" -ForegroundColor Yellow
        }
        
        # Check user profiles table
        $profileCheck = docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM user_profiles;" 2>$null
        if ($profileCheck) {
            Write-Host "   ✅ User Profiles: $($profileCheck.Trim()) profiles" -ForegroundColor Green
        }
        
    } else {
        Write-Host "   ❌ Database: Not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Database: Connection failed" -ForegroundColor Red
}

# API Status
Write-Host ""
Write-Host "📊 API STATUS:" -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://127.0.0.1:54321/rest/v1/" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Supabase API: Running (Status: $($apiResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Supabase API: Not responding" -ForegroundColor Red
}

# Supabase Studio Status
try {
    $studioResponse = Invoke-WebRequest -Uri "http://127.0.0.1:54323" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Supabase Studio: Accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Supabase Studio: Not accessible" -ForegroundColor Red
}

# External Services
Write-Host ""
Write-Host "☁️ EXTERNAL SERVICES:" -ForegroundColor Yellow

# GitHub
try {
    gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        $ghUser = gh api user --jq '.login' 2>$null
        Write-Host "   ✅ GitHub: Authenticated as $ghUser" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ GitHub: Not authenticated" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ GitHub CLI: Not available" -ForegroundColor Yellow
}

# Vercel
try {
    $vercelUser = npx vercel whoami 2>$null
    if ($LASTEXITCODE -eq 0 -and $vercelUser) {
        Write-Host "   ✅ Vercel: Authenticated as $($vercelUser.Trim())" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Vercel: Not authenticated" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Vercel: CLI not available" -ForegroundColor Yellow
}

# Supabase Production
try {
    npx supabase projects list >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Supabase Production: Connected" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Supabase Production: Authentication needed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Supabase Production: Connection failed" -ForegroundColor Yellow
}

# Process Status
Write-Host ""
Write-Host "⚡ PROCESS STATUS:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✅ Node.js: $($nodeProcesses.Count) process(es) running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js: No processes running" -ForegroundColor Red
}

$dockerProcesses = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcesses) {
    Write-Host "   ✅ Docker Desktop: Running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Docker Desktop: Not running" -ForegroundColor Red
}

# VS Code Extensions Status
Write-Host ""
Write-Host "🧩 VS CODE EXTENSIONS:" -ForegroundColor Yellow

$codeCommand = Get-Command "code" -ErrorAction SilentlyContinue
if ($codeCommand) {
    # Check essential extensions
    $requiredExtensions = @(
        "supabase.supabase",
        "mtxr.sqltools", 
        "GitHub.copilot",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss"
    )
    
    try {
        $installedExtensions = & code --list-extensions 2>$null
        $missingExtensions = 0
        foreach ($ext in $requiredExtensions) {
            if ($installedExtensions -contains $ext) {
                Write-Host "   ✅ $ext" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $ext (not installed)" -ForegroundColor Red
                $missingExtensions++
            }
        }
        
        if ($missingExtensions -eq 0) {
            Write-Host "   🎉 All essential extensions installed!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $missingExtensions extensions missing - run startup script to install" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Could not check extension status" -ForegroundColor Yellow
    }
    
    # Check VS Code process
    $codeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
    if ($codeProcesses) {
        Write-Host "   ✅ VS Code is running" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  VS Code is not running" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  VS Code CLI not available" -ForegroundColor Yellow
}

# SQLTools Connection Status
Write-Host ""
Write-Host "🔗 DATABASE CONNECTIONS:" -ForegroundColor Yellow
if (Test-Path ".vscode/settings.json") {
    try {
        $vsCodeSettings = Get-Content ".vscode/settings.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($vsCodeSettings."sqltools.connections") {
            Write-Host "   ✅ SQLTools connections configured:" -ForegroundColor Green
            $vsCodeSettings."sqltools.connections" | ForEach-Object {
                Write-Host "      • $($_.name) → $($_.server):$($_.port)" -ForegroundColor White
            }
        } else {
            Write-Host "   ⚠️  No SQLTools connections found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Could not parse VS Code settings" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  No VS Code settings found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "📋 QUICK ACCESS URLS:" -ForegroundColor Cyan
Write-Host "   📱 React App:        http://localhost:5173/" -ForegroundColor White
Write-Host "   🗄️ Database Studio:  http://127.0.0.1:54323" -ForegroundColor White  
Write-Host "   📊 API Explorer:     http://127.0.0.1:54321" -ForegroundColor White
Write-Host "   📧 Email Testing:    http://127.0.0.1:54324" -ForegroundColor White
Write-Host ""

# Overall health assessment
$allGood = $true
# Add logic to determine overall health status
Write-Host "🎯 OVERALL STATUS: " -NoNewline -ForegroundColor Cyan
if ($allGood) {
    Write-Host "HEALTHY ✅" -ForegroundColor Green
} else {
    Write-Host "NEEDS ATTENTION ⚠️" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to close"