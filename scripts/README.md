# Scripts Directory

This directory contains utility scripts for database operations and content management.

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
