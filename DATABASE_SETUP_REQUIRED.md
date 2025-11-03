# 🚨 URGENT: Database Setup Required

## The Program Library tables don't exist yet in your Supabase database!

### Step 1: Run Database Migration (Required)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql
2. **Copy the entire contents** of `program_library_setup.sql` (the file you have open)
3. **Paste it into the SQL Editor**
4. **Click "Run"** 

This will create:
- ✅ `programs` table
- ✅ `program_routines` table  
- ✅ `scheduled_routines` table
- ✅ `notification_queue` table
- ✅ Sample data (5 programs with routines)

### Step 2: Refresh the Page

After running the SQL, refresh your trainer dashboard at http://localhost:5173/trainer-dashboard/programs

### What the Error Means

The console error shows:
```
Could not find a relationship between 'programs' and 'user_profiles'
```

This happens because:
1. ❌ The `programs` table doesn't exist yet
2. ❌ Without the table, Supabase can't process the query

### After Running the Migration

You should see:
- ✅ 5 sample workout programs
- ✅ Filter functionality working
- ✅ Program details and routines
- ✅ No more console errors

### If It Still Doesn't Work

1. Check the SQL Editor for any error messages
2. Verify the migration completed successfully
3. Check browser network tab for any 400/500 errors
4. Let me know and I'll help debug further

**Run the SQL migration now and then refresh the page!** 🚀