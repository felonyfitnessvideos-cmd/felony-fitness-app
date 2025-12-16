# Exercise Icons Deployment Guide

## Overview

This guide covers the deployment of muscle group icons for exercises in the workout logging interface.

## Current Status

- ✅ Frontend code ready (WorkoutLogPage.jsx already displays `thumbnail_url`)
- ✅ SQL mapping script created (`update_exercise_icons.sql`)
- ✅ Icon files created (23 PNG files in `src/assets/Icons/output/`)
- ⏳ Need to configure Supabase Storage bucket
- ⏳ Need to run SQL update script

## Files Involved

### Frontend

- **WorkoutLogPage.jsx** (lines 948-960): Displays exercise thumbnails
  ```jsx
  <img
    src={
      item.exercises.thumbnail_url ||
      "https://placehold.co/50x50/4a556j8/ffffff?text=IMG"
    }
    alt={item.exercises.name}
    width="50"
    height="50"
    loading="lazy"
  />
  ```

### Backend

- **update_exercise_icons.sql**: Maps 50+ primary_muscle values to 23 icon URLs
- **exercises table**: `thumbnail_url` column stores icon URLs

### Assets

- **src/assets/Icons/output/**: 23 PNG files (50x50px muscle group icons)
  - Adductors.png, Biceps.png, Brachialis.png, Calves.png, etc.

## Deployment Steps

### 1. Upload Icons to Supabase Storage

**Option A: Via Supabase Dashboard**

1. Go to Supabase Dashboard → Storage
2. Select (or create) the `exercise_icons` bucket
3. Click "Upload Files"
4. Select all 23 PNG files from `src/assets/Icons/output/`
5. Upload to root of bucket (not in any subfolder)

**Option B: Via Supabase CLI**

```powershell
# Navigate to icons directory
cd c:\Users\david\felony-fitness-app-production\src\assets\Icons\output

# Upload all PNG files (requires Supabase CLI and auth)
Get-ChildItem -Filter *.png | ForEach-Object {
  supabase storage upload exercise_icons $_.Name --file $_.FullName
}
```

### 2. Make Bucket Public

**Via Supabase Dashboard:**

1. Go to Storage → Buckets
2. Find `exercise_icons` bucket
3. Click "Settings" (gear icon)
4. Toggle "Public bucket" to ON
5. Save changes

**Via SQL:**

```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'exercise_icons';
```

### 3. Verify Bucket URL Format

Public bucket URLs should follow this format:

```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/exercise_icons/[ICON_NAME].png
```

Example:

```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/exercise_icons/Biceps.png
```

### 4. Update SQL Script with Your Project URL

Edit `update_exercise_icons.sql` and replace the placeholder URL:

```sql
-- Find and replace this base URL with your project URL:
-- FROM: https://[PROJECT_REF].supabase.co/storage/v1/object/public/exercise_icons/
-- TO:   https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/exercise_icons/
```

### 5. Run SQL Update Script

**Via Supabase Dashboard:**

1. Go to SQL Editor
2. Click "New Query"
3. Paste contents of `update_exercise_icons.sql`
4. Click "Run"
5. Verify: Should update ~50-200 rows (depending on exercise count)

**Via Supabase CLI:**

```powershell
# From project root
supabase db execute -f update_exercise_icons.sql
```

### 6. Verify Database Updates

Run this query to check populated thumbnails:

```sql
SELECT
  name,
  primary_muscle,
  thumbnail_url
FROM exercises
WHERE thumbnail_url IS NOT NULL
LIMIT 10;
```

Expected result: Each row should have a full URL pointing to the appropriate icon.

### 7. Test in Development

1. Start dev server: `npm run dev`
2. Navigate to workout log: `/workouts/select-routine-log`
3. Select any routine
4. Check horizontal thumbnail scroller at top
5. Verify icons display correctly (not placeholder)

### 8. Test in Production

After deploying to production:

1. Go to production URL
2. Navigate to workout log
3. Verify icons load (check browser DevTools Network tab for 200 responses)

## Icon Mapping Reference

| Primary Muscle Value                | Icon File        | Target Muscle Group |
| ----------------------------------- | ---------------- | ------------------- |
| Biceps, Biceps Brachii              | Biceps.png       | Biceps              |
| Triceps, Triceps Brachii            | Triceps.png      | Triceps             |
| Chest, Pectorals, Middle Chest      | Middle_Chest.png | Chest               |
| Upper Chest, Upper Pectorals        | Upper_Chest.png  | Upper Chest         |
| Quadriceps, Quads                   | Quads.png        | Quadriceps          |
| Hamstrings                          | Hamstrings.png   | Hamstrings          |
| Glutes, Gluteus Maximus             | Glutes.png       | Glutes              |
| Calves, Gastrocnemius               | Calves.png       | Calves              |
| Lats, Latissimus Dorsi              | Lats.png         | Back                |
| Shoulders, Deltoids, Front Deltoids | Front_Delts.png  | Shoulders           |
| Rear Deltoids                       | Rear_Delts.png   | Rear Delts          |
| Traps, Trapezius, Upper Traps       | Traps.png        | Traps               |
| Abs, Abdominals, Upper Abs          | Upper_abs.png    | Core                |
| Lower Abs                           | Lower_Abs.png    | Lower Core          |
| Obliques                            | Obliques.png     | Obliques            |
| Forearms                            | Forearms.png     | Forearms            |
| Full Body, Compound                 | Full_body.png    | Full Body           |

_(See `update_exercise_icons.sql` for complete mapping of 50+ muscle variations)_

## Troubleshooting

### Icons Not Displaying

1. **Check browser console** for 404 errors
   - If 404: Bucket not public OR icons not uploaded
2. **Verify bucket is public** in Supabase Dashboard
3. **Check URL format** in database (should be full HTTPS URL)
4. **Test icon URL directly** in browser address bar

### Placeholder Images Still Showing

1. **Check database** - `thumbnail_url` column should not be NULL
2. **Run SQL script** if not already executed
3. **Clear browser cache** and reload page
4. **Check SQL WHERE clause** - ensure exercises have `primary_muscle` set

### Icons Display but Look Wrong

1. **Verify icon file names** match SQL script exactly (case-sensitive)
2. **Check muscle mapping** in SQL - may need to add new muscle variations
3. **Verify image dimensions** (should be 50x50px minimum)

### CORS Errors

- Public buckets should not have CORS issues
- If using signed URLs instead, check bucket CORS policy

## Performance Notes

- Icons use `loading="lazy"` for performance
- 50x50px thumbnails are small (~2-5KB each)
- Total icon payload: ~50-100KB for all 23 icons
- Browser caching will prevent re-downloading

## Future Enhancements

1. **Add hover tooltips** showing muscle group name
2. **Animated muscle map** showing primary/secondary muscles
3. **Exercise video previews** on thumbnail hover
4. **Color-coded borders** by muscle group category
5. **Dark mode icon variants** for better contrast

## Rollback Plan

If issues occur, remove icons:

```sql
UPDATE exercises
SET thumbnail_url = NULL;
```

This will cause WorkoutLogPage to fall back to placeholder images.

---

**Last Updated**: 2025-01-20  
**Related Files**: `update_exercise_icons.sql`, `icon_urls.txt`, WorkoutLogPage.jsx  
**Dependencies**: Supabase Storage (public bucket), exercises table
