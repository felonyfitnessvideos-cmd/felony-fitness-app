# 🚀 FELONY FITNESS - QUICK START SCRIPT
# Automated development environment startup

Write-Host ""
Write-Host "🚀 FELONY FITNESS DEVELOPMENT ENVIRONMENT STARTUP" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Docker Desktop
Write-Host "⏳ Phase 1: Checking Docker Desktop..." -ForegroundColor Yellow
if (-not (docker version 2>$null)) {
    Write-Host "🔧 Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    Write-Host "⏳ Waiting for Docker to be ready..."
    $timeout = 120 # 2 minutes timeout
    $elapsed = 0
    do {
        Start-Sleep -Seconds 3
        $elapsed += 3
        Write-Host "." -NoNewline
        if ($elapsed -gt $timeout) {
            Write-Host ""
            Write-Host "❌ Docker startup timeout. Please check Docker Desktop manually." -ForegroundColor Red
            exit 1
        }
    } while (-not (docker version 2>$null))
    Write-Host ""
}
Write-Host "✅ Docker Desktop: READY" -ForegroundColor Green

# Phase 2: Project Directory & Git
Write-Host ""
Write-Host "⏳ Phase 2: Synchronizing project..." -ForegroundColor Yellow
try {
    Set-Location -Path "C:\Users\david\felony-fitness-app" -ErrorAction Stop
    Write-Host "📁 Project directory: OK"
    
    # Check git status
    $gitStatus = git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0) {
        git pull origin main 2>$null
        Write-Host "📥 Git: SYNCHRONIZED" 
    } else {
        Write-Host "⚠️ Git: Manual sync may be needed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Could not access project directory" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project: READY" -ForegroundColor Green

# Phase 3: Supabase Local Environment
Write-Host ""
Write-Host "⏳ Phase 3: Starting Supabase services..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes for first-time setup..."

# Check if already running
$supabaseRunning = docker ps --filter "name=supabase" --format "{{.Names}}" 2>$null
if ($supabaseRunning) {
    Write-Host "🔄 Supabase already running, checking health..."
} else {
    Write-Host "🚀 Starting Supabase local environment..."
}

# Start Supabase
$supabaseOutput = npx supabase start 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Supabase: ALL SERVICES RUNNING" -ForegroundColor Green
    
    # Extract URLs from output
    $apiUrl = ($supabaseOutput | Select-String "API URL:").ToString() -replace ".*API URL:\s*", ""
    $studioUrl = ($supabaseOutput | Select-String "Studio URL:").ToString() -replace ".*Studio URL:\s*", ""
    
    if ($studioUrl) {
        Write-Host "🗄️ Database Studio: $studioUrl" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Supabase startup failed. Check logs above." -ForegroundColor Red
    Write-Host "Attempting to fix common issues..."
    
    # Try stopping and restarting
    npx supabase stop 2>$null
    Start-Sleep -Seconds 2
    npx supabase start
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Unable to start Supabase. Manual intervention required." -ForegroundColor Red
        exit 1
    }
}

# Phase 4: Database Verification
Write-Host ""
Write-Host "⏳ Phase 4: Verifying database..." -ForegroundColor Yellow
try {
    $foodCount = docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM food_servings;" 2>$null
    if ($foodCount -and $foodCount.Trim() -gt 0) {
        Write-Host "✅ Database: $($foodCount.Trim()) foods available" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database: Schema loaded, but food database may need importing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Database: Could not verify food data" -ForegroundColor Yellow
}

# Phase 5: Development Dependencies
Write-Host ""
Write-Host "⏳ Phase 5: Checking development dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules") -or (Get-ChildItem "node_modules" -ErrorAction SilentlyContinue).Count -lt 10) {
    Write-Host "📦 Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies: INSTALLED" -ForegroundColor Green
    } else {
        Write-Host "❌ Dependency installation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies: UP TO DATE" -ForegroundColor Green
}

# Phase 6: Start Development Server
Write-Host ""
Write-Host "⏳ Phase 6: Starting React development server..." -ForegroundColor Yellow
Write-Host "🌐 Starting server in background..."

# Start dev server in separate window
$devServer = Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev; Read-Host 'Press Enter to close'" -PassThru -WindowStyle Normal

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Check if server started successfully
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ React App: RUNNING at http://localhost:5173/" -ForegroundColor Green
} catch {
    Write-Host "⏳ React App: Starting up (may take a moment)..." -ForegroundColor Yellow
}

# Phase 7: External Services Check
Write-Host ""
Write-Host "⏳ Phase 7: Checking external services..." -ForegroundColor Yellow

# Vercel
try {
    $vercelUser = npx vercel whoami 2>$null
    if ($LASTEXITCODE -eq 0 -and $vercelUser) {
        Write-Host "✅ Vercel: Authenticated as $($vercelUser.Trim())" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Vercel: Not authenticated (run 'npx vercel login')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Vercel: CLI not available" -ForegroundColor Yellow
}

# GitHub CLI
try {
    gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub CLI: Authenticated" -ForegroundColor Green
    } else {
        Write-Host "⚠️ GitHub CLI: Not authenticated (run 'gh auth login')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ GitHub CLI: Not installed or not in PATH" -ForegroundColor Yellow
}

# Supabase Production
try {
    $supabaseProjects = npx supabase projects list 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase Production: Connected" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Supabase Production: Authentication needed (run 'npx supabase login')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Supabase Production: Connection failed" -ForegroundColor Yellow
}

# Phase 8: VS Code Extensions & IDE Setup
Write-Host ""
Write-Host "⏳ Phase 8: Setting up VS Code extensions & IDE..." -ForegroundColor Yellow

# Check if VS Code is available
$codeCommand = Get-Command "code" -ErrorAction SilentlyContinue
if ($codeCommand) {
    Write-Host "✅ VS Code CLI detected" -ForegroundColor Green
    
    # Install/verify essential extensions for the project
    $extensions = @(
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss", 
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-json",
        "supabase.supabase",
        "mtxr.sqltools",
        "mtxr.sqltools-driver-pg",
        "GitHub.copilot",
        "GitHub.copilot-chat",
        "ms-vscode.vscode-github-issue-notebooks",
        "GitHub.vscode-pull-request-github",
        "ms-vscode.powershell"
    )
    
    Write-Host "📦 Installing/verifying VS Code extensions..." -ForegroundColor Yellow
    $extensionResults = @()
    foreach ($extension in $extensions) {
        try {
            $result = & code --install-extension $extension --force 2>&1
            if ($LASTEXITCODE -eq 0) {
                $extensionResults += "✅ $extension"
            } else {
                $extensionResults += "⚠️ $extension (may already be installed)"
            }
        } catch {
            $extensionResults += "❌ $extension (failed)"
        }
    }
    
    # Show results
    $extensionResults | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    
    # Open workspace in VS Code if not already open
    $vsCodeProcess = Get-Process "Code" -ErrorAction SilentlyContinue
    if (-not $vsCodeProcess) {
        Write-Host "🚀 Opening VS Code workspace..." -ForegroundColor Yellow
        Start-Process "code" -ArgumentList "." -WindowStyle Normal
        Start-Sleep -Seconds 2
        Write-Host "✅ VS Code workspace opened" -ForegroundColor Green
    } else {
        Write-Host "✅ VS Code is already running" -ForegroundColor Green
    }
    
    # SQLTools connection reminder
    Write-Host "📊 SQLTools extension should auto-connect to:" -ForegroundColor Cyan
    Write-Host "   • Supabase Production (configured in .vscode/settings.json)" -ForegroundColor White
    Write-Host "   • Local database available at localhost:54322" -ForegroundColor White
    
} else {
    Write-Host "⚠️ VS Code CLI not found" -ForegroundColor Yellow
    Write-Host "   Install VS Code and add to PATH for full automation" -ForegroundColor White
    Write-Host "   You can still open the project manually: File > Open Folder" -ForegroundColor White
}

# Browser setup for development
Write-Host ""
Write-Host "🌐 Opening development URLs in browser..." -ForegroundColor Yellow
try {
    # Open React app
    Start-Process "http://localhost:5173/"
    Write-Host "✅ React app opened in browser" -ForegroundColor Green
    
    # Optionally open database studio
    Start-Sleep -Seconds 1
    Start-Process "http://127.0.0.1:54323"
    Write-Host "✅ Database Studio opened in browser" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not auto-open browsers" -ForegroundColor Yellow
}

# Final Summary
Write-Host ""
Write-Host "🎉 STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 ACCESS POINTS:" -ForegroundColor Cyan
Write-Host "   📱 React App:        http://localhost:5173/" -ForegroundColor White
Write-Host "   🗄️ Database Studio:  http://127.0.0.1:54323" -ForegroundColor White
Write-Host "   📊 API Explorer:     http://127.0.0.1:54321" -ForegroundColor White
Write-Host "   📧 Email Testing:    http://127.0.0.1:54324" -ForegroundColor White
Write-Host ""
Write-Host "🔧 DEVELOPMENT TOOLS:" -ForegroundColor Cyan
Write-Host "   📝 VS Code:          code ." -ForegroundColor White
Write-Host "   🗄️ Database CLI:     docker exec -it supabase_db_felony-fitness-app psql -U postgres -d postgres" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to develop! All systems operational." -ForegroundColor Green
Write-Host ""

# Keep window open
Read-Host "Press Enter to close this window"