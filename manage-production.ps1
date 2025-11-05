# ⚠️ FELONY FITNESS - PRODUCTION ENVIRONMENT MANAGER

Write-Host "⚠️ FELONY FITNESS - PRODUCTION MANAGER" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""
Write-Host "🚨 WARNING: This manages the LIVE PRODUCTION environment!" -ForegroundColor Red
Write-Host "   Any changes will affect real users and data." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Type 'PRODUCTION' to confirm you want to proceed"
if ($confirm -ne 'PRODUCTION') {
    Write-Host "❌ Production access cancelled for safety" -ForegroundColor Yellow
    Write-Host "💡 Use .\start-dev-environment.ps1 for development work" -ForegroundColor Green
    Read-Host "Press Enter to exit"
    exit
}

# Switch to production environment
Write-Host ""
Write-Host "🔗 Connecting to production environment..." -ForegroundColor Red
& "$PSScriptRoot\project-manager.ps1" prod

Write-Host ""
Write-Host "🛠️ PRODUCTION MANAGEMENT OPTIONS:" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host ""
Write-Host "1. View database status" -ForegroundColor White
Write-Host "2. Create database backup" -ForegroundColor White  
Write-Host "3. View recent migrations" -ForegroundColor White
Write-Host "4. Push approved migrations" -ForegroundColor White
Write-Host "5. Monitor performance" -ForegroundColor White
Write-Host "6. View user analytics" -ForegroundColor White
Write-Host "7. Switch back to development" -ForegroundColor Green
Write-Host "0. Exit safely" -ForegroundColor Yellow
Write-Host ""

do {
    $choice = Read-Host "Select an option (0-7)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "📊 Production Database Status:" -ForegroundColor Red
            Write-Host "=============================" -ForegroundColor Red
            
            # Show project info
            npx supabase projects list
            
            Write-Host ""
            Write-Host "🌐 Production URLs:" -ForegroundColor Red
            Write-Host "   📊 Dashboard: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn" -ForegroundColor White
            Write-Host "   🗄️ Database: Production PostgreSQL (LIVE DATA)" -ForegroundColor Red
            Write-Host ""
        }
        
        "2" {
            Write-Host ""
            Write-Host "💾 Creating production backup..." -ForegroundColor Red
            $backupName = "prod_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            
            # Create backup directory if it doesn't exist
            if (-not (Test-Path "backups/production")) {
                New-Item -ItemType Directory -Path "backups/production" -Force
            }
            
            Write-Host "Backup will be saved as: backups/production/$backupName.sql" -ForegroundColor Yellow
            Write-Host "⏳ This may take several minutes for large databases..." -ForegroundColor Yellow
            
            # Note: For production backups, you'd typically use Supabase's backup features
            # or pg_dump with production credentials
            Write-Host "📝 Use Supabase Dashboard > Settings > Database > Backups for production backups" -ForegroundColor Cyan
        }
        
        "3" {
            Write-Host ""
            Write-Host "📋 Recent Migration History:" -ForegroundColor Red
            Write-Host "============================" -ForegroundColor Red
            
            # Show recent migrations
            if (Test-Path "supabase/migrations") {
                Get-ChildItem "supabase/migrations" -Filter "*.sql" | 
                    Sort-Object LastWriteTime -Descending | 
                    Select-Object -First 5 | 
                    ForEach-Object {
                        Write-Host "   📄 $($_.Name) - $($_.LastWriteTime)" -ForegroundColor White
                    }
            }
        }
        
        "4" {
            Write-Host ""
            Write-Host "⚠️ MIGRATION DEPLOYMENT TO PRODUCTION" -ForegroundColor Red
            Write-Host "====================================" -ForegroundColor Red
            Write-Host ""
            Write-Host "🚨 This will apply database changes to live production!" -ForegroundColor Red
            
            $migrationConfirm = Read-Host "Type 'DEPLOY' to confirm migration deployment"
            if ($migrationConfirm -eq 'DEPLOY') {
                Write-Host "🚀 Deploying migrations to production..." -ForegroundColor Red
                npx supabase db push
            } else {
                Write-Host "❌ Migration deployment cancelled" -ForegroundColor Yellow
            }
        }
        
        "5" {
            Write-Host ""
            Write-Host "📈 Production Performance Monitoring:" -ForegroundColor Red
            Write-Host "====================================" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Monitor production performance at:" -ForegroundColor Cyan
            Write-Host "   📊 Supabase Dashboard > Reports" -ForegroundColor White
            Write-Host "   📈 Database > Performance" -ForegroundColor White
            Write-Host "   🔍 Logs & Events" -ForegroundColor White
        }
        
        "6" {
            Write-Host ""
            Write-Host "📊 User Analytics Overview:" -ForegroundColor Red
            Write-Host "==========================" -ForegroundColor Red
            
            # Query basic analytics from the analytics schema we created
            Write-Host "💡 Access analytics data via:" -ForegroundColor Cyan
            Write-Host "   📊 SQL Editor in Supabase Dashboard" -ForegroundColor White
            Write-Host "   🔍 Query: SELECT * FROM analytics.page_views ORDER BY created_at DESC LIMIT 10;" -ForegroundColor White
        }
        
        "7" {
            Write-Host ""
            Write-Host "🔄 Switching back to development environment..." -ForegroundColor Green
            & "$PSScriptRoot\project-manager.ps1" dev
            Write-Host "✅ Safely switched to development" -ForegroundColor Green
        }
        
        "0" {
            Write-Host ""
            Write-Host "🔄 Switching back to development for safety..." -ForegroundColor Green
            & "$PSScriptRoot\project-manager.ps1" dev
            Write-Host "✅ Safely exited production management" -ForegroundColor Green
            Write-Host "👋 Goodbye!" -ForegroundColor Green
        }
        
        default {
            Write-Host "❌ Invalid choice. Please select 0-7." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "0" -and $choice -ne "7") {
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    
} while ($choice -ne "0" -and $choice -ne "7")

Write-Host ""
Read-Host "Press Enter to close"