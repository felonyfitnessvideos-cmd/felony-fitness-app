# 🚀 FELONY FITNESS APP - STARTUP PROCEDURE
*Complete Development Environment Bootstrap*

---

## 📋 **PRE-STARTUP CHECKLIST**

### **🔧 System Requirements**
- [ ] **Docker Desktop** - Running and responsive
- [ ] **Node.js** - Version 18+ installed
- [ ] **Git** - Authenticated and ready
- [ ] **VS Code** - Extensions loaded
- [ ] **PowerShell** - Administrator privileges (if needed)

---

## 🎯 **STARTUP SEQUENCE**

### **PHASE 1: Core System Initialization** ⏱️ ~2 minutes

#### **1.1 Docker Desktop Startup**
```powershell
# Check if Docker is running
docker version

# If not running, start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to be ready (30-60 seconds)
do {
    Start-Sleep -Seconds 5
    $dockerStatus = docker version 2>$null
} while (-not $dockerStatus)

Write-Host "✅ Docker Desktop: READY" -ForegroundColor Green
```

#### **1.2 Project Directory & Git Status**
```powershell
# Navigate to project
cd C:\Users\david\felony-fitness-app

# Verify git status
git status
git pull origin main

Write-Host "✅ Git Repository: SYNCHRONIZED" -ForegroundColor Green
```

### **PHASE 2: Database Environment** ⏱️ ~3 minutes

#### **2.1 Supabase Local Startup**
```powershell
# Start local Supabase environment
npx supabase start

# Wait for all services to be healthy
Write-Host "⏳ Starting Supabase services..." -ForegroundColor Yellow

# Services will show URLs when ready:
# - API URL: http://127.0.0.1:54321
# - Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# - Studio URL: http://127.0.0.1:54323
```

#### **2.2 Database Verification**
```powershell
# Verify database schema is loaded
docker exec supabase_db_felony-fitness-app psql -U postgres -d postgres -c "SELECT COUNT(*) as food_count FROM food_servings;"

# Should show 369 foods if properly imported
Write-Host "✅ Database: VERIFIED" -ForegroundColor Green
```

### **PHASE 3: Development Server** ⏱️ ~30 seconds

#### **3.1 Install Dependencies (if needed)**
```powershell
# Check if node_modules is up to date
if (-not (Test-Path "node_modules") -or (Get-ChildItem "node_modules").Count -lt 10) {
    npm ci
    Write-Host "✅ Dependencies: INSTALLED" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies: UP TO DATE" -ForegroundColor Green
}
```

#### **3.2 Start Development Server**
```powershell
# Start React development server
npm run dev

# Should show:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### **PHASE 4: External Services** ⏱️ ~1 minute

#### **4.1 Vercel Connection**
```powershell
# Check Vercel CLI status
npx vercel --version
npx vercel whoami

Write-Host "✅ Vercel: AUTHENTICATED" -ForegroundColor Green
```

#### **4.2 GitHub Integration**
```powershell
# Verify GitHub connection
gh auth status 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub CLI: AUTHENTICATED" -ForegroundColor Green
} else {
    Write-Host "⚠️ GitHub CLI: Not authenticated (manual check needed)" -ForegroundColor Yellow
}
```

#### **4.3 Supabase Production Connection**
```powershell
# Check Supabase CLI authentication
npx supabase projects list

Write-Host "✅ Supabase Production: CONNECTED" -ForegroundColor Green
```

### **PHASE 5: VS Code Extensions & IDE Setup** ⏱️ ~1-2 minutes

#### **5.1 Extension Installation**
```powershell
# Check VS Code CLI availability
$codeCommand = Get-Command "code" -ErrorAction SilentlyContinue
if ($codeCommand) {
    Write-Host "✅ VS Code CLI: DETECTED" -ForegroundColor Green
    
    # Install essential extensions
    $extensions = @(
        "supabase.supabase",
        "mtxr.sqltools", 
        "GitHub.copilot",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss"
    )
    
    foreach ($ext in $extensions) {
        code --install-extension $ext --force
        Write-Host "✅ $ext: INSTALLED" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ VS Code CLI: NOT FOUND" -ForegroundColor Yellow
}
```

#### **5.2 Workspace Configuration**
```powershell
# Open VS Code workspace
Start-Process "code" -ArgumentList "."
Write-Host "✅ VS Code Workspace: OPENED" -ForegroundColor Green

# Database connections automatically configured via .vscode/settings.json:
# - Local Development: localhost:54322
# - Production: Supabase cloud with credentials
```

#### **5.3 Browser Setup**
```powershell
# Open development URLs
Start-Process "http://localhost:5173/"      # React App
Start-Process "http://127.0.0.1:54323"     # Database Studio

Write-Host "✅ Development URLs: OPENED IN BROWSER" -ForegroundColor Green
```

---

## 🌐 **SERVICE ACCESS URLS**

Once startup is complete, you'll have access to:

### **Local Development**
- 🎯 **React App**: http://localhost:5173/
- 🗄️ **Supabase Studio**: http://127.0.0.1:54323
- 📊 **API Explorer**: http://127.0.0.1:54321
- 📧 **Mailpit (Email Testing)**: http://127.0.0.1:54324

### **Production Services**
- 🚀 **Live App**: https://felony-fitness-app.vercel.app
- ☁️ **Supabase Dashboard**: https://supabase.com/dashboard/projects
- 📦 **Vercel Dashboard**: https://vercel.com/dashboard
- 🐙 **GitHub Repository**: https://github.com/felonyfitnessvideos-cmd/felony-fitness-app

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Docker Issues**
```powershell
# If Docker containers fail to start
docker system prune -f
npx supabase stop
npx supabase start
```

#### **Port Conflicts**
```powershell
# If ports are already in use
npx supabase stop --project-id felony-fitness-admin
netstat -ano | findstr :5173
netstat -ano | findstr :54321
```

#### **Database Connection Issues**
```powershell
# Reset database to clean state
npx supabase db reset
# Food database will need to be re-imported locally
```

#### **Node/NPM Issues**
```powershell
# Clear npm cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm ci
```

---

## ✅ **STARTUP VERIFICATION CHECKLIST**

After running the startup sequence, verify:

- [ ] **Docker Desktop**: Running with green status
- [ ] **Supabase Local**: All services healthy (Studio accessible)
- [ ] **Database**: 369 foods available in food_servings table
- [ ] **React App**: Loading at localhost:5173 without errors
- [ ] **API Connection**: App can connect to local Supabase
- [ ] **Git Status**: Repository synchronized with remote
- [ ] **Vercel**: CLI authenticated and ready
- [ ] **Production Access**: Can access Supabase dashboard

---

## 🎯 **QUICK START COMMAND**

For rapid startup, run this comprehensive command:

```powershell
# One-command startup (save as start-dev.ps1)
Write-Host "🚀 Starting Felony Fitness Development Environment..." -ForegroundColor Cyan

# Start Docker if not running
if (-not (docker version 2>$null)) {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "⏳ Starting Docker Desktop..."
    do { Start-Sleep -Seconds 3 } while (-not (docker version 2>$null))
}

# Navigate to project and sync
cd C:\Users\david\felony-fitness-app
git pull origin main

# Start Supabase
npx supabase start

# Start development server in background
Start-Process powershell -ArgumentList "-Command", "npm run dev"

Write-Host "🎉 Development environment ready!" -ForegroundColor Green
Write-Host "📱 App: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "🗄️ Database Studio: http://127.0.0.1:54323" -ForegroundColor Yellow
```

---

## 📊 **ESTIMATED STARTUP TIME**

**Total Time: ~6-7 minutes**
- Docker Desktop: ~2 minutes
- Supabase Services: ~3 minutes  
- Development Server: ~30 seconds
- Verification: ~1 minute

*Times may vary based on system performance and network speed*

---

## 🔄 **DAILY WORKFLOW INTEGRATION**

### **Morning Startup:**
1. Run startup procedure
2. Check overnight GitHub notifications
3. Review Vercel deployment status
4. Verify production database health

### **Throughout Development:**
- Use hot reload for React development
- Access Supabase Studio for database work
- Monitor Docker container health
- Test changes locally before deployment

### **End of Day:**
- Run shutdown procedure (already created)
- Commit and push changes
- Create backups if significant schema changes

---

*🚀 Ready to code! All systems operational and development environment fully bootstrapped.*