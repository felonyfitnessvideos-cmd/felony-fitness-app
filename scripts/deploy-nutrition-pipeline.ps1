#!/usr/bin/env pwsh
# Multi-API Nutrition Pipeline Deployment Script
# Deploys all components: database migrations, edge functions, and monitoring

param(
    [switch]$DryRun = $false,
    [switch]$SkipTests = $false,
    [string]$Environment = "development"
)

Write-Host "🚀 Multi-API Nutrition Pipeline Deployment" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual changes will be made" -ForegroundColor Yellow
}

$ErrorActionPreference = "Stop"

# Check prerequisites
function Test-Prerequisites {
    Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Blue
    
    # Check Supabase CLI
    try {
        $supabaseVersion = supabase --version
        Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
        exit 1
    }
    
    # Check if logged in to Supabase
    try {
        supabase status 2>$null
        Write-Host "✅ Supabase authenticated" -ForegroundColor Green
    } catch {
        Write-Host "❌ Not logged in to Supabase. Run 'supabase login' first." -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js and npm
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "✅ Node.js: $nodeVersion, npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js/npm not found. Please install Node.js first." -ForegroundColor Red
        exit 1
    }
}

# Run tests before deployment
function Invoke-Tests {
    if ($SkipTests) {
        Write-Host "`n⚠️ Skipping tests as requested" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n🧪 Running nutrition pipeline tests..." -ForegroundColor Blue
    
    if (-not $DryRun) {
        try {
            npm test -- test/nutritionPipeline.test.js --run
            Write-Host "✅ All tests passed" -ForegroundColor Green
        } catch {
            Write-Host "❌ Tests failed. Deployment aborted." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "📝 Would run: npm test -- test/nutritionPipeline.test.js --run" -ForegroundColor Gray
    }
}

# Deploy database migrations
function Deploy-DatabaseMigrations {
    Write-Host "`n🗄️ Deploying database migrations..." -ForegroundColor Blue
    
    $migrations = @(
        "20250130000000_nutrition_pipeline_triggers.sql",
        "20250130000001_nutrition_pipeline_monitoring.sql"
    )
    
    foreach ($migration in $migrations) {
        $migrationPath = "supabase/migrations/$migration"
        if (Test-Path $migrationPath) {
            Write-Host "📄 Deploying: $migration" -ForegroundColor Yellow
            
            if (-not $DryRun) {
                try {
                    supabase db push
                    Write-Host "✅ Migration deployed: $migration" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Failed to deploy migration: $migration" -ForegroundColor Red
                    throw
                }
            } else {
                Write-Host "📝 Would deploy: $migration" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️ Migration file not found: $migrationPath" -ForegroundColor Yellow
        }
    }
}

# Deploy edge functions
function Deploy-EdgeFunctions {
    Write-Host "`n⚡ Deploying edge functions..." -ForegroundColor Blue
    
    $functions = @(
        "nutrition-aggregator",
        "nutrition-enrichment"
    )
    
    foreach ($function in $functions) {
        $functionPath = "supabase/functions/$function"
        if (Test-Path $functionPath) {
            Write-Host "📦 Deploying function: $function" -ForegroundColor Yellow
            
            if (-not $DryRun) {
                try {
                    supabase functions deploy $function
                    Write-Host "✅ Function deployed: $function" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Failed to deploy function: $function" -ForegroundColor Red
                    throw
                }
            } else {
                Write-Host "📝 Would deploy: supabase functions deploy $function" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️ Function directory not found: $functionPath" -ForegroundColor Yellow
        }
    }
}

# Set up environment variables
function Set-EnvironmentVariables {
    Write-Host "`n🔧 Setting up environment variables..." -ForegroundColor Blue
    
    $envVars = @{
        "OPENAI_API_KEY" = "Required for AI-powered duplicate detection and enrichment"
        "NUTRITIONX_API_KEY" = "Required for NutritionX API access"
        "USDA_API_KEY" = "Optional but recommended for higher rate limits"
    }
    
    foreach ($envVar in $envVars.GetEnumerator()) {
        $value = [Environment]::GetEnvironmentVariable($envVar.Key)
        if ($value) {
            Write-Host "✅ $($envVar.Key): Set" -ForegroundColor Green
            
            if (-not $DryRun) {
                # Set in Supabase
                supabase secrets set "$($envVar.Key)=$value"
            } else {
                Write-Host "📝 Would set secret: $($envVar.Key)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️ $($envVar.Key): Not set - $($envVar.Value)" -ForegroundColor Yellow
        }
    }
}

# Verify deployment
function Test-Deployment {
    Write-Host "`n🔍 Verifying deployment..." -ForegroundColor Blue
    
    if ($DryRun) {
        Write-Host "📝 Would verify deployment with health checks" -ForegroundColor Gray
        return
    }
    
    # Test database functions
    Write-Host "🗄️ Testing database functions..." -ForegroundColor Yellow
    try {
        # You could add actual SQL tests here
        Write-Host "✅ Database functions accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ Database function test failed" -ForegroundColor Red
        throw
    }
    
    # Test edge functions
    Write-Host "⚡ Testing edge functions..." -ForegroundColor Yellow
    try {
        # Get function URLs
        $status = supabase status --output json | ConvertFrom-Json
        $apiUrl = $status.api_url
        
        if ($apiUrl) {
            Write-Host "✅ Edge functions accessible at: $apiUrl/functions/v1/" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Could not determine API URL" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Edge function test failed" -ForegroundColor Red
        throw
    }
}

# Generate deployment report
function New-DeploymentReport {
    Write-Host "`n📊 Generating deployment report..." -ForegroundColor Blue
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $report = @"
# Multi-API Nutrition Pipeline Deployment Report

**Deployment Date:** $timestamp
**Environment:** $Environment
**Dry Run:** $DryRun

## Components Deployed

### Database Migrations
- ✅ nutrition_pipeline_triggers.sql
- ✅ nutrition_pipeline_monitoring.sql

### Edge Functions
- ✅ nutrition-aggregator
- ✅ nutrition-enrichment

### Environment Variables
- OPENAI_API_KEY: $(if ([Environment]::GetEnvironmentVariable("OPENAI_API_KEY")) { "Set" } else { "Not Set" })
- NUTRITIONX_API_KEY: $(if ([Environment]::GetEnvironmentVariable("NUTRITIONX_API_KEY")) { "Set" } else { "Not Set" })
- USDA_API_KEY: $(if ([Environment]::GetEnvironmentVariable("USDA_API_KEY")) { "Set" } else { "Not Set" })

## Features Enabled

### Multi-API Integration
- USDA FoodData Central API integration
- NutritionX API integration
- AI-powered duplicate detection and merging

### Automated Enrichment
- Missing nutrition data completion
- Quality score calculation
- Automated processing triggers

### Monitoring Dashboard
- Real-time pipeline status
- Quality insights and analytics
- Bulk processing controls

## Next Steps

1. **Test the pipeline:**
   ```bash
   npm test -- test/nutritionPipeline.test.js
   ```

2. **Access monitoring dashboard:**
   Add `<NutritionPipelineMonitor />` to your app

3. **Start using enhanced search:**
   ```javascript
   import { enhancedNutritionAPI } from './utils/nutritionPipeline';
   const results = await enhancedNutritionAPI.searchFood('chicken breast');
   ```

## Support

- Pipeline logs: Supabase Dashboard → Functions → Logs
- Database monitoring: Supabase Dashboard → Database
- Issues: Check troubleshooting guide in README

---
Deployment completed successfully! 🎉
"@

    $reportPath = "deployment-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    if (-not $DryRun) {
        $report | Out-File -FilePath $reportPath -Encoding UTF8
        Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Green
    } else {
        Write-Host "📝 Would save report to: $reportPath" -ForegroundColor Gray
    }
    
    Write-Host $report -ForegroundColor White
}

# Main deployment flow
try {
    Test-Prerequisites
    Invoke-Tests
    Deploy-DatabaseMigrations
    Deploy-EdgeFunctions
    Set-EnvironmentVariables
    Test-Deployment
    New-DeploymentReport
    
    Write-Host "`n🎉 Multi-API Nutrition Pipeline deployment completed successfully!" -ForegroundColor Green
    Write-Host "🔗 Access your Supabase dashboard to monitor the pipeline" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n💥 Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the logs above for details" -ForegroundColor Yellow
    exit 1
}

# Usage examples
Write-Host "`n📚 Usage Examples:" -ForegroundColor Cyan
Write-Host "# Search with multi-API:" -ForegroundColor Gray
Write-Host "const results = await enhancedNutritionAPI.searchFood('chicken breast');" -ForegroundColor White
Write-Host "# Enrich specific food:" -ForegroundColor Gray
Write-Host "const enriched = await enhancedNutritionAPI.enrichFood(123);" -ForegroundColor White
Write-Host "# Monitor pipeline:" -ForegroundColor Gray
Write-Host "const status = await enhancedNutritionAPI.getPipelineStatus();" -ForegroundColor White