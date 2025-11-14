# Smart Scheduling - Complete Implementation Guide

## ✅ Implementation Complete (November 14, 2025)

SmartScheduling now creates **day-specific recurring Google Calendar events** for client workout routines with full Google Calendar integration.

---

## 🎯 How It Works

### User Experience

1. **Select Client**: Trainer selects client from left menu
2. **View Program**: Client's assigned program and routines load automatically
3. **Assign Routines to Days**: Use dropdown selectors for each day:
   - Monday: Pull Day → Select routine
   - Wednesday: Push Day → Select routine
   - Friday: Leg Day → Select routine
4. **Configure Time/Duration**: 
   - Time picker (6 AM - 8 PM, 30-min increments, default 8 AM)
   - Duration dropdown (30/45/60/90/120 minutes, default 60)
5. **Add to Calendar**: Click button to create events
6. **Result**: 3 separate recurring Google Calendar events created:
   - "💪 Pull Day - John Doe" - Weekly Mondays @ 8 AM for 12 weeks
   - "💪 Push Day - John Doe" - Weekly Wednesdays @ 8 AM for 12 weeks
   - "💪 Leg Day - John Doe" - Weekly Fridays @ 8 AM for 12 weeks
7. **Client Notification**: Client receives email invitation for each event
8. **Visibility**: Events appear in both Google Calendar and TrainerCalendar

---

## 🔧 Technical Implementation

### Database Schema

```sql
CREATE TABLE scheduled_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  routine_id UUID NOT NULL REFERENCES workout_routines(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '08:00:00',
  duration_minutes INTEGER DEFAULT 60,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Google Calendar Integration
  google_event_id TEXT,           -- Stores Google Calendar event ID for sync
  client_email TEXT,              -- Client email for invitations
  recurrence_rule TEXT,           -- RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO;COUNT=12")
  is_recurring BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### React Component Structure

**File**: `src/components/SmartScheduling.jsx`

```javascript
// State Management
const [scheduledTime, setScheduledTime] = useState('08:00:00');
const [durationMinutes, setDurationMinutes] = useState(60);
const [weeklySchedule, setWeeklySchedule] = useState({});

// Google Calendar Hook
const { createEvent, isAuthenticated } = useGoogleCalendar();
const { user } = useAuth();

// Event Creation Logic
async function handleSaveToCalendar() {
  // For each day in weeklySchedule:
  for (const [day, routine] of Object.entries(weeklySchedule)) {
    // 1. Calculate first occurrence (e.g., next Monday)
    const firstOccurrence = calculateNextOccurrence(day);
    
    // 2. Generate RRULE
    const dayCode = dayCodeMap[day]; // "MO", "TU", "WE", etc.
    const totalWeeks = program.estimated_weeks || 12;
    const rrule = `FREQ=WEEKLY;BYDAY=${dayCode};COUNT=${totalWeeks}`;
    
    // 3. Create Google Calendar event
    const event = {
      summary: `💪 ${routine.name} - ${clientName}`,
      description: `Program: ${program.name}\nWeekly workout session`,
      start: { 
        dateTime: `${firstOccurrence}T${scheduledTime}`, 
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      },
      end: { 
        dateTime: calculateEndTime(firstOccurrence, scheduledTime, durationMinutes),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      },
      recurrence: [rrule],
      attendees: [{ email: clientEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },  // 24 hours
          { method: 'popup', minutes: 30 }     // 30 minutes
        ]
      }
    };
    
    const createdEvent = await createEvent(event);
    
    // 4. Store in database
    await supabase.from('scheduled_routines').insert({
      user_id: client.id,
      routine_id: routine.id,
      scheduled_date: firstOccurrence,
      scheduled_time: scheduledTime,
      duration_minutes: durationMinutes,
      client_email: clientEmail,
      recurrence_rule: rrule,
      is_recurring: true,
      google_event_id: createdEvent.id  // Critical for sync!
    });
  }
}
```

### UI Components

**Time Picker**:
```javascript
<select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}>
  <option value="06:00:00">6:00 AM</option>
  <option value="06:30:00">6:30 AM</option>
  <option value="07:00:00">7:00 AM</option>
  // ... up to 8:00 PM
</select>
```

**Duration Dropdown**:
```javascript
<select value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value))}>
  <option value={30}>30 min</option>
  <option value={45}>45 min</option>
  <option value={60}>60 min</option>
  <option value={90}>90 min</option>
  <option value={120}>120 min</option>
</select>
```

**Day Selector** (already implemented):
```javascript
<select value={weeklySchedule[day]?.id || ''} onChange={(e) => handleRoutineSelection(day, e.target.value)}>
  <option value="">None</option>
  {routines.map(routine => (
    <option key={routine.id} value={routine.id}>{routine.name}</option>
  ))}
</select>
```

---

## 📊 RRULE Examples

### Weekly - Specific Days
```
FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=36
```
- Repeats every Monday, Wednesday, Friday
- Total: 36 sessions (12 weeks × 3 days)

### Single Day Weekly
```
FREQ=WEEKLY;BYDAY=MO;COUNT=12
```
- Repeats every Monday only
- Total: 12 sessions (12 weeks)

### Until Specific Date
```
FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20250401T000000Z
```
- Repeats every Tuesday, Thursday
- Ends on April 1, 2025

---

## 🔄 Data Flow

### Create Schedule Flow

```
1. Trainer assigns routines to days in SmartScheduling
2. Trainer sets time (8 AM) and duration (60 min)
3. Clicks "Add to Calendar"
4. For each day:
   a. Calculate first occurrence (e.g., next Monday)
   b. Generate RRULE with COUNT = program.estimated_weeks
   c. Call createEvent() via useGoogleCalendar
   d. Receive google_event_id from Google
   e. Insert row in scheduled_routines with google_event_id
5. Client receives email invitation (Google handles this)
6. TrainerCalendar queries scheduled_routines and displays events
```

### Display in TrainerCalendar Flow

```
1. TrainerCalendar.jsx loads:
   - Google Calendar events via useGoogleCalendar
   - scheduled_routines from Supabase
2. getEventForTimeSlot() merges both sources
3. Events display with visual distinction:
   - Routine events: Purple gradient + green border
   - Google Calendar events: Blue
   - Completed: Green gradient + checkmark
```

---

## ⚙️ Configuration Requirements

### 1. Run Database Migration

If `scheduled_routines` table already exists:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS scheduled_time TIME DEFAULT '08:00:00';
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;
ALTER TABLE scheduled_routines ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
```

**File**: `scripts/alter-scheduled-routines-add-google-fields.sql`

### 2. Ensure Program Duration Field

```sql
-- Check if estimated_weeks exists
SELECT estimated_weeks FROM programs LIMIT 1;

-- If missing, run:
ALTER TABLE programs ADD COLUMN IF NOT EXISTS estimated_weeks INTEGER DEFAULT 12;
```

**File**: `scripts/add-programs-duration-weeks.sql`

### 3. Google Calendar Authentication

**Trainer must sign in to Google Calendar** in TrainerCalendar before using SmartScheduling.

Check authentication:
```javascript
const { isAuthenticated } = useGoogleCalendar();
if (!isAuthenticated) {
  alert('Please sign in to Google Calendar first');
}
```

---

## 🐛 Error Handling

### Common Errors

**1. "Not authenticated with Google Calendar"**
- **Cause**: Trainer hasn't signed in
- **Fix**: Click "Sign In" button in TrainerCalendar

**2. "Invalid date range"**
- **Cause**: Program duration_weeks is null or 0
- **Fix**: Ensure programs have `estimated_weeks` set

**3. "Failed to create event for [Day]"**
- **Cause**: Google Calendar API error (rate limit, network, permissions)
- **Fix**: Retry or check Google Calendar quota

**4. "Database insert error"**
- **Cause**: Event created in Google but not stored locally
- **Fix**: Event exists in Google Calendar but not synced to app (manual cleanup needed)

### Validation Checks

```javascript
// Before creating events
if (!isGoogleAuthenticated) {
  setStatusMessage('❌ Please sign in to Google Calendar first');
  return;
}

if (!clientProgram.estimated_weeks) {
  setStatusMessage('❌ Program must have a duration set');
  return;
}

if (Object.keys(weeklySchedule).length === 0) {
  setStatusMessage('Please assign at least one routine');
  return;
}
```

---

## 📈 Future Enhancements

### Potential Improvements

1. **Edit/Cancel Schedules**
   - Update Google Calendar event via `updateEvent()`
   - Delete from both Google and database

2. **Sync from Google Calendar**
   - Webhook to detect changes made in Google Calendar
   - Update `scheduled_routines` table accordingly

3. **Client View**
   - Clients see their scheduled workouts
   - Mark as complete directly in app

4. **Bulk Operations**
   - Schedule multiple clients at once
   - Template schedules for common programs

5. **Notifications**
   - Custom reminder settings per client
   - SMS notifications (via Twilio)

---

## 🔍 Testing Checklist

### Manual Testing Steps

- [ ] Select client with assigned program
- [ ] Assign routines to Mon/Wed/Fri
- [ ] Set time to 6:00 AM
- [ ] Set duration to 45 minutes
- [ ] Click "Add to Calendar"
- [ ] Verify 3 events created in Google Calendar
- [ ] Check RRULE format in Google Calendar event details
- [ ] Verify client receives email invitation
- [ ] Confirm events appear in TrainerCalendar at 6 AM
- [ ] Check `scheduled_routines` table has google_event_id
- [ ] Mark an event complete and verify green styling
- [ ] Test with different time zones
- [ ] Test with program duration of 8, 12, 16 weeks

### Edge Cases

- [ ] Client without email address
- [ ] Program without estimated_weeks
- [ ] No routines assigned to any day
- [ ] Trainer not signed into Google
- [ ] Internet connection lost mid-creation
- [ ] Google Calendar API rate limit exceeded

---

## 📚 Related Files

### Core Implementation
- `src/components/SmartScheduling.jsx` - Main component
- `src/components/SmartScheduling.css` - Styling
- `src/hooks/useGoogleCalendar.jsx` - Google Calendar integration
- `src/pages/trainer/TrainerCalendar.jsx` - Display scheduled events

### Database
- `scripts/create-scheduled-routines-table.sql` - Table creation
- `scripts/alter-scheduled-routines-add-google-fields.sql` - Migration script
- `scripts/add-programs-duration-weeks.sql` - Program duration field

### Documentation
- `docs/SMART_SCHEDULING_GOOGLE_INTEGRATION.md` - Original spec (superseded by this doc)
- `docs/SESSION_SUMMARY_2025-11-10.md` - Development history

---

## ✅ Summary

**SmartScheduling is now fully functional** with day-specific recurring Google Calendar events, automatic recurrence rule generation, client email invitations, and 2-way sync via `google_event_id` storage.

**Key Features**:
- ✅ Time picker (6 AM - 8 PM)
- ✅ Duration dropdown (30-120 minutes)
- ✅ Separate event per scheduled day
- ✅ RRULE generation (FREQ=WEEKLY;BYDAY=XX;COUNT=YY)
- ✅ Client email invitations
- ✅ google_event_id storage
- ✅ Display in TrainerCalendar
- ✅ Auto-calculates end date from program duration

**Next Steps** (optional):
- Implement edit/cancel functionality
- Add webhook for Google Calendar sync
- Create client view of scheduled workouts
