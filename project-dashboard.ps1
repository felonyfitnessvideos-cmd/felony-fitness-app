# 🎛️ FELONY FITNESS - PROJECT DASHBOARD
# Interactive project management and quick actions

Write-Host ""
Write-Host "🎛️ FELONY FITNESS PROJECT DASHBOARD" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "📋 AVAILABLE ACTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 STARTUP & SHUTDOWN" -ForegroundColor Cyan
    Write-Host "   1. Start Development Environment" -ForegroundColor White
    Write-Host "   2. Stop All Services" -ForegroundColor White
    Write-Host "   3. Quick System Status Check" -ForegroundColor White
    Write-Host ""
    Write-Host "🗄️ DATABASE OPERATIONS" -ForegroundColor Cyan
    Write-Host "   4. Open Database Studio" -ForegroundColor White
    Write-Host "   5. Database Shell (psql)" -ForegroundColor White
    Write-Host "   6. Create Database Backup" -ForegroundColor White
    Write-Host "   7. Import Food Database" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 DEVELOPMENT" -ForegroundColor Cyan
    Write-Host "   8. Open React App in Browser" -ForegroundColor White
    Write-Host "   9. Run Tests" -ForegroundColor White
    Write-Host "  10. Build for Production" -ForegroundColor White
    Write-Host ""
    Write-Host "☁️ DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "  11. Deploy to Vercel" -ForegroundColor White
    Write-Host "  12. Push Database Changes" -ForegroundColor White
    Write-Host "  13. Check Production Status" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 UTILITIES" -ForegroundColor Cyan
    Write-Host "  14. Clean Node Modules" -ForegroundColor White
    Write-Host "  15. Update Dependencies" -ForegroundColor White
    Write-Host "  16. Generate Performance Report" -ForegroundColor White
    Write-Host "  17. Manage VS Code Extensions" -ForegroundColor White
    Write-Host ""
    Write-Host "  0. Exit Dashboard" -ForegroundColor Red
    Write-Host ""
}

function Execute-Action($choice) {
    switch ($choice) {
        1 {
            Write-Host "🚀 Starting development environment..." -ForegroundColor Green
            & "$PSScriptRoot\start-dev.ps1"
        }
        2 {
            Write-Host "⏹️ Stopping all services..." -ForegroundColor Yellow
            # Stop dev server
            Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
            # Stop Supabase
            npx supabase stop
            Write-Host "✅ All services stopped" -ForegroundColor Green
        }
        3 {
            Write-Host "🔍 Checking system status..." -ForegroundColor Yellow
            & "$PSScriptRoot\check-status.ps1"
        }
        4 {
            Write-Host "🗄️ Opening Database Studio..." -ForegroundColor Green
            Start-Process "http://127.0.0.1:54323"
        }
        5 {
            Write-Host "💻 Opening database shell..." -ForegroundColor Green
            docker exec -it supabase_db_felony-fitness-app psql -U postgres -d postgres
        }
        6 {
            Write-Host "💾 Creating database backup..." -ForegroundColor Green
            $backupFile = "backups/manual_backup_$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
            docker exec supabase_db_felony-fitness-app pg_dump -U postgres -d postgres --clean --if-exists > $backupFile
            Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
        }
        7 {
            Write-Host "📊 Importing food database..." -ForegroundColor Green
            Write-Host "Copying CSV files to container..."
            docker cp food_servings_build1.csv supabase_db_felony-fitness-app:/tmp/
            docker cp food_servings_build2.csv supabase_db_felony-fitness-app:/tmp/
            Write-Host "Importing food servings..."
            docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -c "\copy food_servings(food_name,serving_description,calories,protein_g,carbs_g,fat_g,fiber_g,sugar_g,sodium_mg,calcium_mg,iron_mg,vitamin_c_mg) FROM '/tmp/food_servings_build1.csv' WITH CSV HEADER"
            docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -c "\copy food_servings(food_name,serving_description,calories,protein_g,carbs_g,fat_g,fiber_g,sugar_g,sodium_mg,calcium_mg,iron_mg,vitamin_c_mg) FROM '/tmp/food_servings_build2.csv' WITH CSV HEADER"
            $count = docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM food_servings;"
            Write-Host "✅ Import complete: $($count.Trim()) foods available" -ForegroundColor Green
        }
        8 {
            Write-Host "🌐 Opening React app..." -ForegroundColor Green
            Start-Process "http://localhost:5173"
        }
        9 {
            Write-Host "🧪 Running tests..." -ForegroundColor Green
            npm test
        }
        10 {
            Write-Host "🏗️ Building for production..." -ForegroundColor Green
            npm run build
            Write-Host "✅ Build complete - check dist/ folder" -ForegroundColor Green
        }
        11 {
            Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
            npx vercel --prod
        }
        12 {
            Write-Host "☁️ Pushing database changes..." -ForegroundColor Green
            npx supabase db push
        }
        13 {
            Write-Host "🔍 Checking production status..." -ForegroundColor Green
            Write-Host "Vercel deployments:"
            npx vercel ls
            Write-Host ""
            Write-Host "Supabase projects:"
            npx supabase projects list
        }
        14 {
            Write-Host "🧹 Cleaning node_modules..." -ForegroundColor Yellow
            Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
            Write-Host "📦 Reinstalling dependencies..."
            npm ci
            Write-Host "✅ Dependencies refreshed" -ForegroundColor Green
        }
        15 {
            Write-Host "📋 Checking for dependency updates..." -ForegroundColor Green
            npm outdated
            Write-Host ""
            $update = Read-Host "Update dependencies? (y/N)"
            if ($update -eq 'y' -or $update -eq 'Y') {
                npm update
                Write-Host "✅ Dependencies updated" -ForegroundColor Green
            }
        }
        16 {
            Write-Host "📊 Generating performance report..." -ForegroundColor Green
            Write-Host "This will take a few minutes..."
            # Run Lighthouse if available
            if (Get-Command lighthouse -ErrorAction SilentlyContinue) {
                lighthouse http://localhost:5173 --output html --output-path ./performance-report-$(Get-Date -Format 'yyyyMMdd').html
                Write-Host "✅ Report generated" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Lighthouse not installed. Install with: npm install -g lighthouse" -ForegroundColor Yellow
            }
        }
        17 {
            Write-Host "🧩 Managing VS Code Extensions..." -ForegroundColor Green
            Write-Host ""
            
            $codeCommand = Get-Command "code" -ErrorAction SilentlyContinue
            if ($codeCommand) {
                Write-Host "VS Code Extension Manager" -ForegroundColor Cyan
                Write-Host "========================" -ForegroundColor Cyan
                Write-Host "1. Install all project extensions" -ForegroundColor White
                Write-Host "2. List installed extensions" -ForegroundColor White
                Write-Host "3. Open VS Code workspace" -ForegroundColor White
                Write-Host "4. Check extension status" -ForegroundColor White
                Write-Host "5. Configure SQLTools connection" -ForegroundColor White
                Write-Host ""
                
                $action = Read-Host "Choose action (1-5)"
                
                switch ($action) {
                    "1" {
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
                        
                        Write-Host "Installing project extensions..." -ForegroundColor Yellow
                        $successCount = 0
                        foreach ($ext in $extensions) {
                            Write-Host "Installing $ext..." -ForegroundColor White
                            try {
                                & code --install-extension $ext --force 2>$null
                                if ($LASTEXITCODE -eq 0) {
                                    Write-Host "  ✅ $ext" -ForegroundColor Green
                                    $successCount++
                                } else {
                                    Write-Host "  ⚠️  $ext (may already be installed)" -ForegroundColor Yellow
                                }
                            } catch {
                                Write-Host "  ❌ $ext (failed)" -ForegroundColor Red
                            }
                        }
                        Write-Host ""
                        Write-Host "✅ Extension installation complete! ($successCount/$($extensions.Count) processed)" -ForegroundColor Green
                    }
                    "2" {
                        Write-Host "📦 Installed VS Code extensions:" -ForegroundColor Green
                        $extensions = & code --list-extensions
                        $extensions | Sort-Object | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
                        Write-Host ""
                        Write-Host "Total: $($extensions.Count) extensions installed" -ForegroundColor Cyan
                    }
                    "3" {
                        Write-Host "🚀 Opening VS Code workspace..." -ForegroundColor Yellow
                        Start-Process "code" -ArgumentList "."
                        Write-Host "✅ VS Code opened" -ForegroundColor Green
                    }
                    "4" {
                        Write-Host "🔍 Checking extension status..." -ForegroundColor Yellow
                        $requiredExtensions = @(
                            "supabase.supabase",
                            "mtxr.sqltools", 
                            "GitHub.copilot",
                            "esbenp.prettier-vscode",
                            "bradlc.vscode-tailwindcss"
                        )
                        $installedExtensions = & code --list-extensions
                        
                        Write-Host "Essential extensions status:" -ForegroundColor Cyan
                        $missingCount = 0
                        foreach ($ext in $requiredExtensions) {
                            if ($installedExtensions -contains $ext) {
                                Write-Host "  ✅ $ext" -ForegroundColor Green
                            } else {
                                Write-Host "  ❌ $ext (missing)" -ForegroundColor Red
                                $missingCount++
                            }
                        }
                        
                        if ($missingCount -eq 0) {
                            Write-Host ""
                            Write-Host "🎉 All essential extensions are installed!" -ForegroundColor Green
                        } else {
                            Write-Host ""
                            Write-Host "⚠️  $missingCount extensions missing. Run option 1 to install." -ForegroundColor Yellow
                        }
                    }
                    "5" {
                        Write-Host "🔗 SQLTools connection info:" -ForegroundColor Yellow
                        Write-Host ""
                        Write-Host "Local Development Database:" -ForegroundColor Cyan
                        Write-Host "  Host: localhost" -ForegroundColor White
                        Write-Host "  Port: 54322" -ForegroundColor White
                        Write-Host "  Database: postgres" -ForegroundColor White
                        Write-Host "  Username: postgres" -ForegroundColor White
                        Write-Host "  Password: postgres" -ForegroundColor White
                        Write-Host ""
                        Write-Host "Production database connection is already configured in .vscode/settings.json" -ForegroundColor Green
                    }
                }
            } else {
                Write-Host "❌ VS Code CLI not found." -ForegroundColor Red
                Write-Host "Install VS Code and add 'code' command to PATH." -ForegroundColor Yellow
                Write-Host ""
                Write-Host "Installation steps:" -ForegroundColor Cyan
                Write-Host "1. Download VS Code from https://code.visualstudio.com/" -ForegroundColor White
                Write-Host "2. During installation, check 'Add to PATH'" -ForegroundColor White
                Write-Host "3. Restart terminal and try again" -ForegroundColor White
            }
            
            Write-Host ""
            Read-Host "Press Enter to continue"
        }
        0 {
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            return $false
        }
        default {
            Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red
        }
    }
    return $true
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Select an action (0-17)"
    Write-Host ""
    
    $continue = Execute-Action $choice
    
    if ($continue) {
        Write-Host ""
        Read-Host "Press Enter to return to dashboard"
        Clear-Host
    }
} while ($continue)

Write-Host "Dashboard closed." -ForegroundColor Gray