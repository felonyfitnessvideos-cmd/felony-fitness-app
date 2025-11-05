# 🛠️ DEVELOPMENT TOOLS & SCRIPTS

This folder contains automated scripts for managing your Felony Fitness development environment.

## 🚀 QUICK START

### **One-Click Startup**
```bash
# Windows (Double-click)
START_DEV.bat

# Or PowerShell
.\start-dev.ps1
```

### **Interactive Dashboard**
```powershell
.\project-dashboard.ps1
```

### **Quick Status Check**
```powershell
.\check-status.ps1
```

---

## 📋 AVAILABLE SCRIPTS

### **🔧 Core Scripts**

| Script | Purpose | Usage |
|--------|---------|--------|
| `START_DEV.bat` | **One-click startup** | Double-click to start everything |
| `start-dev.ps1` | **Automated startup** | Full environment bootstrap + VS Code |
| `check-status.ps1` | **Health check** | Verify all services + extensions |
| `project-dashboard.ps1` | **Interactive menu** | Full project management + VS Code tools |

### **📚 Documentation**

| File | Purpose |
|------|---------|
| `STARTUP_PROCEDURE.md` | **Complete startup guide** |
| `DEPLOYMENT_STATUS.md` | **Production deployment info** |
| `MASTER_DATABASE_REQUIREMENTS.md` | **Database schema documentation** |
| `END_OF_DAY_REPORT.md` | **Session completion report** |

---

## 🎯 WHAT EACH SCRIPT DOES

### **`START_DEV.bat` - One-Click Startup**
- ✅ Starts Docker Desktop (if not running)
- ✅ Launches Supabase local environment  
- ✅ Starts React development server
- ✅ Verifies database connectivity
- ✅ Checks external service authentication
- ✅ **Installs VS Code extensions automatically**
- ✅ **Opens VS Code workspace**
- ✅ **Opens development URLs in browser**

**Total Time:** ~6-7 minutes for full cold start

### **`check-status.ps1` - System Health Check**
- 🔍 Docker container status
- 🔍 Development server connectivity  
- 🔍 Database accessibility and data verification
- 🔍 API endpoint health
- 🔍 External service authentication status
- 🔍 Running process verification

### **`project-dashboard.ps1` - Interactive Management**
- 🚀 Start/stop services
- 🗄️ Database operations (backup, import, shell access)
- 🌐 Development tools (testing, building)
- ☁️ Deployment management
- 🔧 Maintenance utilities
- 🧩 **VS Code extension management**

---

## 🌐 SERVICE URLS

After startup, you'll have access to:

| Service | URL | Purpose |
|---------|-----|---------|
| **React App** | http://localhost:5173/ | Main application |
| **Database Studio** | http://127.0.0.1:54323 | Database management |
| **API Explorer** | http://127.0.0.1:54321 | API testing |
| **Email Testing** | http://127.0.0.1:54324 | Email development |

---

## 🧩 VS CODE INTEGRATION

### **Automatic Extension Installation**
The startup script automatically installs these essential extensions:

- **Supabase** - Database management and queries
- **SQLTools** - SQL query runner with connections configured
- **GitHub Copilot** - AI code assistance
- **Prettier** - Code formatting
- **Tailwind CSS** - CSS utility classes
- **TypeScript** - Enhanced TypeScript support
- **PowerShell** - Script debugging and management

### **Pre-configured Database Connections**
- 🟢 **Local Development**: `localhost:54322` (auto-configured)
- 🔵 **Production**: Supabase cloud (credentials stored securely)

### **Built-in VS Code Tasks**
Access via `Ctrl+Shift+P` → "Tasks: Run Task":
- 🚀 **Start Development Environment** - Full automated startup
- 🔍 **Check System Status** - Health monitoring
- 🛠️ **Project Dashboard** - Interactive management
- ⚡ **Dev Server Only** - React server without full setup

### **Workspace Features**
- Auto-save enabled (1 second delay)
- Optimized search exclusions (node_modules, etc.)
- Bracket pair colorization
- Integrated terminal defaults to PowerShell

---

## ⚡ QUICK COMMANDS

### **Start Everything**
```powershell
.\START_DEV.bat
```

### **Check System Health**
```powershell
.\check-status.ps1
```

### **Database Shell**
```powershell
docker exec -it supabase_db_felony-fitness-app psql -U postgres -d postgres
```

### **Create Backup**
```powershell
docker exec supabase_db_felony-fitness-app pg_dump -U postgres -d postgres --clean --if-exists > "backups/backup_$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
```

### **Stop Everything**
```powershell
# Stop dev server
Get-Process -Name "node" | Stop-Process -Force

# Stop Supabase
npx supabase stop
```

---

## 🔧 TROUBLESHOOTING

### **Common Issues**

#### **"Docker not running"**
```powershell
# Start Docker Desktop manually
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

#### **"Port already in use"**
```powershell
# Check what's using the port
netstat -ano | findstr :5173
netstat -ano | findstr :54321

# Stop conflicting services
npx supabase stop
```

#### **"Database connection failed"**
```powershell
# Reset database
npx supabase db reset
# Then re-import food database via dashboard
```

#### **"Dependencies out of sync"**
```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
npm ci
```

---

## 📊 ESTIMATED TIMINGS

| Operation | Cold Start | Warm Start |
|-----------|------------|------------|
| Docker Desktop | ~2 minutes | ~10 seconds |
| Supabase Services | ~3 minutes | ~30 seconds |
| React Dev Server | ~30 seconds | ~10 seconds |
| **Total** | **~6 minutes** | **~1 minute** |

---

## 🎯 DAILY WORKFLOW

### **Morning Routine**
1. Run `START_DEV.bat`
2. Check `project-dashboard.ps1` for any issues
3. Verify production status if needed

### **Development**
- Use hot reload for React development
- Access Database Studio for schema work
- Run tests via dashboard when needed

### **End of Day**
- Commit and push changes
- Run shutdown protocol (stops all services)
- Create backup if significant changes made

---

*🚀 Everything you need for efficient Felony Fitness development!*