# Scripts Directory

This directory contains utility scripts for database operations, backups, migrations, and content management.

## 🔧 Database Backup & Connection Scripts

### `backup-database.ps1` ⭐ NEW
**Purpose:** Create reliable full database backups with optimized connection settings

**Features:**
- Automatic retry logic and connection timeout handling
- SSL/TLS support with proper configuration
- Progress reporting and file size verification
- Comprehensive error messages with troubleshooting
- Handles large databases without memory issues

**Usage:**
```powershell
# Basic backup (auto-generated name with timestamp)
.\scripts\backup-database.ps1

# Custom name (recommended for pre-migration backups)
.\scripts\backup-database.ps1 -BackupName "pre-usda-import"

# Custom output directory
.\scripts\backup-database.ps1 -OutputDir "C:\Backups"
```

**Requirements:**
- PostgreSQL client tools (`pg_dump`) - Install: `choco install postgresql`
- `.env.local` with `SUPABASE_PROJECT_ID` and `SUPABASE_DB_PASSWORD`

**Documentation:** [Database Backup Guide](../docs/DATABASE_BACKUP_GUIDE.md)

---

### `test-backup-connection.ps1` ⭐ NEW
**Purpose:** Verify backup readiness before running actual backups

**Tests:**
1. ✅ PostgreSQL client tools installed
2. ✅ Environment variables configured
3. ✅ Network connectivity to Supabase
4. ✅ SSL/TLS connection works
5. ✅ Disk space available

**Usage:**
```powershell
.\scripts\test-backup-connection.ps1
```

**When to use:**
- First-time setup verification
- Troubleshooting connection issues
- Before important backups
- After changing credentials

---

## 📁 Current Scripts

### Database Utilities
- **audit-current-content.sql** - Query to audit current database content (exercises, foods, meals, programs)

### Template Scripts (Ready to Use)
- **create-crossfit-circuit-program.sql** - Template for creating a CrossFit-style training program

## 📖 Documentation
- **EXERCISE_INSERT_INSTRUCTIONS.md** - Instructions for adding new exercises to the database
- **FOOD_INSERT_INSTRUCTIONS.md** - Instructions for adding new foods to the database

---

## 🗂️ Archived Scripts

Completed one-time operations have been moved to `OldFiles/`:
- **one-off-scripts/** - Diagnostic, debugging, and migration scripts (already executed)
- **completed-inserts/** - Batch insert scripts for exercises, foods, and meals (already executed)

---

## ⚡ Automated Processes

The following processes run automatically and don't require manual scripts:
- **Nutrition Enrichment** - GitHub Actions runs every 5 minutes via `.github/workflows/nutrition-enrichment.yml`
- **Food Database Updates** - AI enrichment worker processes pending foods automatically
