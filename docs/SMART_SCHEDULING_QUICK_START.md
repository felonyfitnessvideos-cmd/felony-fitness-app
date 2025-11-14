# Smart Scheduling - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Database Setup
Run this SQL script in your Supabase SQL Editor:

```bash
# Location: scripts/create-scheduled-routines-table.sql
```

Copy the contents and execute in Supabase Dashboard → SQL Editor → New Query

**What it does:**
- Creates `scheduled_routines` table
- Adds indexes for performance
- Sets up RLS policies for security
- Creates auto-update trigger

### Step 2: Test Client Setup
You need a client with:
1. ✅ Assigned program (from Programs tab)
2. ✅ Generated workout routines
3. ✅ Start date (optional, defaults to today)
4. ✅ Workout days (from Client Onboarding)

### Step 3: Access Smart Scheduling
1. Open Trainer Dashboard
2. Go to Clients tab
3. Click a client card to expand
4. Check workspace at bottom → Smart Scheduling should show client info

---

## 📝 How to Use

### Assign Routines to Days

**Drag & Drop:**
```
1. Grab a routine card from left panel
2. Drag to a day slot (Monday-Sunday)
3. Drop → Routine assigned ✅
4. Click X button to remove
```

**Visual Feedback:**
- Hover over day → Blue border
- Assigned day → Green border
- Dragging → Grab cursor

### Save to Calendar

**When ready:**
```
1. Assign at least one routine to a day
2. Click "Save to Calendar" button
3. Wait for success message ✅
4. Sessions created for entire program duration!
```

**What happens:**
- Creates recurring weekly sessions
- Stores in `scheduled_routines` table
- Calculates correct dates based on start date
- Example: Monday routine → Every Monday for 12 weeks

---

## 🧪 Quick Test Scenario

### Test with Sample Client

**1. Create Test Client**
```
TrainerDashboard → Clients → Add Client
- Name: "Test Client"
- Email: test@example.com
- Start Date: Today
- Workout Days: Monday, Wednesday, Friday
```

**2. Assign Program**
```
TrainerDashboard → Programs → Select Program → Assign to Client
Program should generate 3-5 routines automatically
```

**3. Schedule Workouts**
```
TrainerDashboard → Clients → Click "Test Client" → Expands
Smart Scheduling appears at bottom:
- Shows client name, program, 3 sessions/week
- Drag "Full Body A" to Monday
- Drag "Full Body B" to Wednesday  
- Drag "Full Body C" to Friday
- Click "Save to Calendar"
```

**4. Verify Database**
```sql
-- Run in Supabase SQL Editor
SELECT 
  scheduled_date,
  workout_routines.name as routine_name
FROM scheduled_routines
JOIN workout_routines ON workout_routines.id = scheduled_routines.routine_id
WHERE user_id = 'test-client-uuid'
ORDER BY scheduled_date;

-- Should show 36 rows (3 days × 12 weeks)
```

---

## 🔍 Troubleshooting

### "No program assigned"
**Fix:** Go to Programs tab → Select program → "Assign to Client"

### Routines not showing
**Fix:** Check that program assignment created routines:
```sql
SELECT * FROM trainer_clients WHERE client_id = 'client-uuid';
-- Check generated_routine_ids is not empty
```

### Drag not working
**Fix:** Refresh page, check browser console for errors

### Save fails
**Fix:** 
1. Check Supabase error in console
2. Verify RLS policies exist: `SELECT * FROM pg_policies WHERE tablename = 'scheduled_routines'`
3. Confirm you're the trainer: `SELECT * FROM trainer_clients WHERE trainer_id = 'your-uuid'`

---

## 💡 Tips

**Best Practices:**
- Assign routines based on client's workout days from onboarding
- Use program structure (e.g., upper/lower split across days)
- Save schedule before switching clients
- Review schedule before saving (no undo yet!)

**Performance:**
- Loading is instant (2 queries only)
- Saving takes 1-2 seconds for 36+ sessions
- All sessions created in single database transaction

**User Experience:**
- Schedule persists until client change or save
- Success message clears after 3 seconds
- Empty states guide user to next action

---

## 📊 Expected Results

After saving schedule for 3-day program (12 weeks):

**Database:**
```
36 rows in scheduled_routines
- 12 Mondays with routine A
- 12 Wednesdays with routine B
- 12 Fridays with routine C
```

**Client View (Future):**
```
Client dashboard shows:
- "You have 36 scheduled workouts"
- Calendar view with upcoming sessions
- Ability to mark sessions complete
```

---

## 🎯 Next Steps

**After successful test:**
1. ✅ Schedule real clients
2. ✅ Build client calendar view
3. ✅ Add email notifications
4. ✅ Implement time slot selection
5. ✅ Create schedule templates

**Full documentation:** `docs/SMART_SCHEDULING_FEATURE.md`

---

**Questions?** Check the full documentation or test with sample data first!

**Commit:** 78c2f28  
**Created:** November 14, 2025
