# 🏗️ FELONY FITNESS - DEVELOPMENT ENVIRONMENT MANAGER

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "status")]
    [string]$Environment = "status"
)

Write-Host "🏗️ FELONY FITNESS - PROJECT MANAGER" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Project configurations
$projects = @{
    "dev" = @{
        "ref" = "ytpblkbwgdbiserhrlqm"
        "name" = "felony-fitness-dev"
        "description" = "Development Environment"
        "color" = "Yellow"
    }
    "prod" = @{
        "ref" = "wkmrdelhoeqhsdifrarn" 
        "name" = "felony-fitness-admin"
        "description" = "Production Environment"
        "color" = "Red"
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "📊 CURRENT PROJECT STATUS:" -ForegroundColor Cyan
    
    # Get current linked project
    $projectList = npx supabase projects list 2>$null
    if ($projectList) {
        $projectList | ForEach-Object {
            if ($_ -match "^\s*●") {
                $parts = $_ -split '\|'
                if ($parts.Length -ge 4) {
                    $refId = $parts[2].Trim()
                    $projectName = $parts[3].Trim()
                    
                    $envType = "Unknown"
                    $color = "White"
                    if ($refId -eq $projects["dev"]["ref"]) {
                        $envType = "DEVELOPMENT"
                        $color = "Yellow"
                    } elseif ($refId -eq $projects["prod"]["ref"]) {
                        $envType = "PRODUCTION" 
                        $color = "Red"
                    }
                    
                    Write-Host "   🔗 Linked to: $projectName" -ForegroundColor $color
                    Write-Host "   🏷️  Environment: $envType" -ForegroundColor $color
                    Write-Host "   🆔 Reference: $refId" -ForegroundColor White
                }
            }
        }
    }
    
    Write-Host ""
    Write-Host "📋 AVAILABLE PROJECTS:" -ForegroundColor Cyan
    foreach ($env in $projects.Keys) {
        $project = $projects[$env]
        Write-Host "   $($env.ToUpper()): $($project.name) - $($project.description)" -ForegroundColor $project.color
    }
}

function Switch-Environment($targetEnv) {
    $project = $projects[$targetEnv]
    if (-not $project) {
        Write-Host "❌ Invalid environment: $targetEnv" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "🔄 Switching to $($project.description)..." -ForegroundColor $project.color
    Write-Host "   Project: $($project.name)" -ForegroundColor White
    Write-Host "   Reference: $($project.ref)" -ForegroundColor White
    
    try {
        $result = npx supabase link --project-ref $project.ref 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully linked to $($project.description)" -ForegroundColor Green
            
            # Show environment-specific URLs
            Write-Host ""
            Write-Host "🌐 $($project.description.ToUpper()) URLS:" -ForegroundColor $project.color
            if ($targetEnv -eq "dev") {
                Write-Host "   📊 Dashboard: https://supabase.com/dashboard/project/$($project.ref)" -ForegroundColor White
                Write-Host "   🗄️  Database: Direct connection for development" -ForegroundColor White
                Write-Host "   🔧 Local: Use 'npx supabase start' for local development" -ForegroundColor White
            } else {
                Write-Host "   📊 Dashboard: https://supabase.com/dashboard/project/$($project.ref)" -ForegroundColor White
                Write-Host "   🗄️  Database: Production database (handle with care!)" -ForegroundColor Red
                Write-Host "   ⚠️  Warning: You are now connected to PRODUCTION!" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Failed to link to $($project.description)" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error switching environments: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
switch ($Environment.ToLower()) {
    "dev" {
        Switch-Environment "dev"
    }
    "prod" {
        Switch-Environment "prod"  
    }
    "status" {
        Show-Status
    }
    default {
        Show-Status
    }
}

Write-Host ""
Write-Host "💡 USAGE EXAMPLES:" -ForegroundColor Cyan
Write-Host "   .\project-manager.ps1 dev     # Switch to development" -ForegroundColor White
Write-Host "   .\project-manager.ps1 prod    # Switch to production" -ForegroundColor White  
Write-Host "   .\project-manager.ps1 status  # Show current status" -ForegroundColor White
Write-Host ""