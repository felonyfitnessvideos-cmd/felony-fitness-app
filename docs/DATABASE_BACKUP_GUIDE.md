# Database Backup Guide

## 🎯 Overview

This guide covers reliable database backup methods for Supabase, with solutions to common connection issues.

## 🚀 Quick Start

### Method 1: Automated Script (Recommended)

```powershell
# One-time setup: Install PostgreSQL client tools
choco install postgresql

# Run database backup
.\scripts\backup-database.ps1

# Custom backup name
.\scripts\backup-database.ps1 -BackupName "pre-migration"

# Run storage bucket backup (auto-cleans old backups, keeps 3 most recent)
.\scripts\backup-storage-buckets.ps1

# Keep only 2 most recent storage backups
.\scripts\backup-storage-buckets.ps1 -KeepBackups 2
```

### Method 2: Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/backups
2. Click "Create Backup"
3. Wait for completion
4. Download when needed

---

## 🔧 Setup Instructions

### Step 1: Install PostgreSQL Client Tools

**Windows (Chocolatey):**

```powershell
choco install postgresql
```

**Windows (Manual):**

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Select "Command Line Tools" during installation
4. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

**Verify Installation:**

```powershell
pg_dump --version
# Should output: pg_dump (PostgreSQL) 16.x
```

### Step 2: Configure Connection Details

Create `.env.local` in project root:

```env
# Supabase Database Connection
SUPABASE_PROJECT_ID=wkmrdelhoeqhsdifrarn
SUPABASE_DB_PASSWORD=your-database-password-here

# Optional: Full database URL (alternative format)
# DATABASE_URL=postgresql://postgres:your-password@db.wkmrdelhoeqhsdifrarn.supabase.co:5432/postgres
```

**To find your credentials:**

1. Go to: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/settings/database
2. Copy "Project ID" from URL (e.g., `wkmrdelhoeqhsdifrarn`)
3. Copy "Database password" (set during project creation)
   - If forgotten, you can reset it in Settings → Database

---

## 🔥 Common Issues & Solutions

### Issue 1: "Connection Timeout"

**Symptoms:**

- `pg_dump: error: connection to server at "db.xxx.supabase.co" ... failed`
- Hangs for 30+ seconds then fails

**Solutions:**

1. **Check network connectivity:**

   ```powershell
   Test-Connection db.wkmrdelhoeqhsdifrarn.supabase.co
   ```

2. **Verify port 5432 is open:**

   ```powershell
   Test-NetConnection -ComputerName db.wkmrdelhoeqhsdifrarn.supabase.co -Port 5432
   ```

3. **Check firewall/antivirus:**
   - Temporarily disable to test
   - Add exception for `pg_dump.exe`

4. **Try different network:**
   - Switch from WiFi to mobile hotspot
   - VPN may be blocking connection

5. **Use Supabase Dashboard instead:**
   - Dashboard backups don't require local pg_dump
   - More reliable on restricted networks

### Issue 2: "Authentication Failed"

**Symptoms:**

- `FATAL: password authentication failed for user "postgres"`

**Solutions:**

1. **Verify password:**
   - Check `.env.local` has correct password
   - No extra spaces or quotes around password
   - Password is case-sensitive

2. **Reset password:**
   - Go to: Settings → Database → Reset Database Password
   - Update `.env.local` with new password

3. **Check username:**
   - Always use `postgres` (default Supabase user)

### Issue 3: "SSL Connection Required"

**Symptoms:**

- `FATAL: no pg_hba.conf entry`
- `SSL connection is required`

**Solutions:**
The script sets `PGSSLMODE=require` automatically. If you're running manual pg_dump:

```powershell
$env:PGSSLMODE = "require"
pg_dump --host=db.wkmrdelhoeqhsdifrarn.supabase.co ...
```

### Issue 4: "Out of Memory" / Large Database

**Symptoms:**

- Backup fails halfway through
- PowerShell crashes
- "Out of memory" error

**Solutions:**

1. **Use compressed format:**

   ```powershell
   # Modify script to use custom format (smaller file)
   --format=custom --compress=9
   ```

2. **Backup specific tables:**

   ```powershell
   # Add to pg_dump command
   --table=food_servings --table=exercises
   ```

3. **Use Supabase Dashboard:**
   - Server-side backups handle large databases better

4. **Increase PowerShell memory:**
   ```powershell
   $env:PSModulePath = $env:PSModulePath
   ```

### Issue 5: "pg_dump not found"

**Symptoms:**

- `The term 'pg_dump' is not recognized`

**Solutions:**

1. **Add to PATH:**

   ```powershell
   # Find PostgreSQL installation
   Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_dump.exe"

   # Add to PATH (example - adjust version)
   $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
   ```

2. **Use full path:**

   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" --version
   ```

3. **Reinstall PostgreSQL client tools**

---

**Database Backups:**

## 📋 Backup Best Practices

### When to Backup

**Storage Bucket Backups:**

- **Auto-cleanup enabled:** Keeps 3 most recent backups by default
- **Size:** ~265 MB per backup (6 buckets)
- **Frequency:** Run weekly or before major changes
- **Override retention:** Use `-KeepBackups` parameter (e.g., `-KeepBackups 2`)

✅ **Always backup before:**

- Major schema changes (adding/dropping tables)
- Bulk data imports (USDA foods, exercises)
- Production deployments
- Database migrations
- Major version upgrades

✅ **Regular schedule:**

- Daily: Supabase automatic backups (enabled by default)
- Weekly: Manual full backup with script
- Monthly: Download and archive locally

### Backup Retention

- **Local backups:** Keep last 7 days (delete older)
- **Cloud backups:** Supabase keeps 7 days on free tier (30 days on Pro)
- **Critical backups:** Archive before major changes, keep indefinitely

### Backup Verification

Always verify backups work:

```powershell
# Check file size (should be > 1MB for your DB)
Get-Item backups\*.sql | Select-Object Name, @{N="Size (MB)";E={[Math]::Round($_.Length/1MB,2)}}

# Check file content (should have CREATE TABLE statements)
Select-String -Path backups\supabase-backup-*.sql -Pattern "CREATE TABLE" | Select-Object -First 5
```

---

## 🔄 Restore Instructions

### Restore from Local Backup

**Option 1: Supabase Dashboard (Recommended)**

1. Go to: Database → Backups
2. Click "Upload Backup"
3. Select your `.sql` file
4. Click "Restore"

**Option 2: Command Line**

```powershell
# Set password
$env:PGPASSWORD = "your-db-password"

# Restore
psql --host=db.wkmrdelhoeqhsdifrarn.supabase.co `
     --port=5432 `
     --username=postgres `
     --dbname=postgres `
     --file="backups\your-backup.sql"
```

⚠️ **WARNING:** Restore will overwrite existing data!

### Restore Specific Tables Only

```powershell
# Extract specific table from backup
Select-String -Path backups\backup.sql -Pattern "CREATE TABLE food_servings" -Context 0,1000 | Out-File temp-table.sql

# Restore just that table
psql ... --file="temp-table.sql"
```

---

## 🤖 Automation

### Scheduled Backups (Windows Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Supabase Daily Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `pwsh.exe`
   - Arguments: `-File "C:\path\to\scripts\backup-database.ps1"`
6. Finish

### Backup Cleanup Script

```powershell
# Keep only last 7 days of backups
Get-ChildItem backups\*.sql |
    Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item -Force
```

---

## 📊 Monitoring Backup Size

Track database growth over time:

```powershell
# List all backups with sizes
Get-ChildItem backups\*.sql |
    Select-Object Name, CreationTime, @{N="Size (MB)";E={[Math]::Round($_.Length/1MB,2)}} |
    Sort-Object CreationTime -Descending |
    Format-Table
```

---

## 🆘 Emergency Recovery

If something goes wrong:

1. **Check Supabase automatic backups:**
   - Dashboard → Database → Backups
   - Supabase creates daily backups automatically

2. **Point-in-time recovery (Pro plans only):**
   - Can restore to any point in last 30 days

3. **Contact Supabase support:**
   - support@supabase.io
   - Include project ID and approximate timestamp

---

## 🔗 Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Our Database Schema Migrations](./docs/SQL_MIGRATION_STATUS.md)

---

## 📝 Checklist: Pre-Migration Backup

Before running any migration script:

- [ ] Run `.\scripts\backup-database.ps1 -BackupName "pre-migration-description"`
- [ ] Verify backup file created successfully
- [ ] Check backup file size is reasonable (> 1MB)
- [ ] Test restore on local database (if available)
- [ ] Document what changed in git commit message
- [ ] Keep backup file until migration verified successful

---

**Last Updated:** 2025-11-20  
**Maintained By:** Felony Fitness Development Team
