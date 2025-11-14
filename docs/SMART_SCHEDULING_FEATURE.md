# Smart Scheduling Feature Documentation

**Version:** 1.0.0  
**Created:** November 14, 2025  
**Status:** Ready for Testing  
**Commit:** f4e7d33

---

## 📋 Overview

The Smart Scheduling feature provides trainers with a drag-and-drop interface to assign workout routines from a client's program to specific days of the week, then export the entire schedule to a calendar with recurring weekly sessions for the program duration.

---

## 🎯 Features

### Core Functionality
1. **Client Integration**
   - Automatically displays when client is selected from TrainerClients
   - Shows client name, assigned program, sessions per week, start date, program duration
   - Reads workout days from client onboarding data

2. **Drag-and-Drop Scheduler**
   - Routine cards displayed on left (from assigned program)
   - Seven day slots (Monday-Sunday) in weekly grid
   - HTML5 drag-and-drop API for intuitive assignment
   - Visual feedback (hover states, grab cursors, border colors)
   - Remove button to unassign routines from days

3. **Calendar Export**
   - "Save to Calendar" button creates recurring sessions
   - Calculates first occurrence of each day based on start date
   - Creates sessions for entire program duration (default 12 weeks)
   - Stores in `scheduled_routines` database table
   - Success/error status messages

4. **Empty States**
   - No client selected: Display placeholder with instructions
   - No program assigned: Inform trainer and suggest assigning program
   - No routines generated: Show empty routines panel

---

## 🏗️ Architecture

### Component Structure

```
SmartScheduling.jsx (364 lines)
├── Props
│   ├── selectedClient (Object|null) - Client from TrainerClients
│   └── onScheduleCreated (Function) - Callback after save
│
├── State
│   ├── clientProgram - Assigned program details
│   ├── programRoutines - Generated workout routines
│   ├── weeklySchedule - Day → Routine mapping
│   ├── draggedRoutine - Currently dragged routine
│   ├── isSaving - Save operation status
│   └── statusMessage - User feedback
│
└── Functions
    ├── loadClientProgram() - Fetch program and routines
    ├── handleDragStart() - Initiate drag operation
    ├── handleDrop() - Assign routine to day
    ├── handleRemoveFromDay() - Unassign routine
    └── handleSaveToCalendar() - Create recurring sessions
```

### Integration Points

**TrainerDashboard.jsx**
```javascript
// State management
const [selectedClient, setSelectedClient] = useState(null);

// Pass to SmartScheduling
<SmartScheduling selectedClient={selectedClient} />

// Pass to TrainerClients
<TrainerClients onClientSelect={setSelectedClient} />
```

**TrainerClients.jsx**
```javascript
// Accept callback prop
const TrainerClients = ({ onClientSelect }) => {

// Notify when client expanded
onClick={() => {
  const newExpandedId = expandedClient === client.id ? null : client.id;
  setExpandedClient(newExpandedId);
  if (onClientSelect) {
    onClientSelect(newExpandedId ? client : null);
  }
}}
```

---

## 🗄️ Database Schema

### `scheduled_routines` Table

```sql
CREATE TABLE scheduled_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_scheduled_routines_user_id` - Fast user lookups
- `idx_scheduled_routines_routine_id` - Fast routine lookups
- `idx_scheduled_routines_scheduled_date` - Date range queries
- `idx_scheduled_routines_user_date` - Combined user + date lookups

### RLS Policies

**Users:**
- `user_can_view_own_scheduled_routines` - SELECT own sessions
- `user_can_update_own_scheduled_routines` - UPDATE own sessions (mark completed)

**Trainers:**
- `trainer_can_view_client_scheduled_routines` - SELECT for clients
- `trainer_can_insert_client_scheduled_routines` - INSERT for clients
- `trainer_can_update_client_scheduled_routines` - UPDATE for clients
- `trainer_can_delete_client_scheduled_routines` - DELETE for clients

All trainer policies use:
```sql
WHERE user_id IN (
  SELECT client_id FROM trainer_clients WHERE trainer_id = auth.uid()
)
```

---

## 🎨 Styling

### Color Scheme (Dark Theme)
```css
Background: #1a202c (main), #2d3748 (cards)
Borders: #4a5568
Text: #f7fafc (primary), #cbd5e0 (labels), #718096 (secondary)
Accent: #667eea (primary), #48bb78 (success), #fc8181 (error)
```

### Key CSS Classes
- `.smart-scheduling-container` - Main wrapper with padding
- `.client-info-card` - Client details display
- `.scheduling-workspace` - 280px / 1fr grid layout
- `.routines-panel` - Left panel with draggable routines
- `.schedule-grid` - Right panel with day slots
- `.routine-card.draggable` - Draggable routine with grab cursor
- `.day-slot` - Drop target with dashed border
- `.day-slot.has-routine` - Filled slot with solid green border
- `.save-schedule-btn` - Primary action button

### Responsive Breakpoints
- **1024px**: Single column (routines below schedule)
- **768px**: Full mobile layout, stacked day slots

---

## 🔄 User Workflow

### Trainer Perspective

**Step 1: Select Client**
```
TrainerDashboard → Clients Tab → Click client card to expand
Result: Client appears in Smart Scheduling workspace
```

**Step 2: View Program**
```
SmartScheduling displays:
- Client name
- Assigned program name
- Sessions per week (from onboarding workoutDays)
- Start date
- Program duration
```

**Step 3: Assign Routines**
```
Drag routine cards from left panel → Drop on day slots
Actions:
- Hover over day = highlight border
- Drop = routine assigned, green border
- Click X = remove routine from day
```

**Step 4: Save Schedule**
```
Click "Save to Calendar" button
System:
1. Calculate first occurrence of each assigned day
2. Create sessions for each week in program duration
3. Insert all sessions into scheduled_routines table
4. Show success message (✅ Created X recurring sessions!)
5. Clear schedule after 3 seconds
```

**Step 5: Client Receives Schedule**
```
Future: Email notification with calendar invite
Client can view scheduled sessions in their dashboard
```

### Data Flow

```
1. Client Selection
   TrainerClients.onClick → setSelectedClient → SmartScheduling.props

2. Load Program
   SmartScheduling.useEffect → loadClientProgram()
   └─ Query trainer_clients (assigned_program_id, generated_routine_ids, notes)
   └─ Parse notes for workoutDays JSON
   └─ Query programs table
   └─ Query workout_routines table

3. Drag & Drop
   handleDragStart(routine) → setDraggedRoutine
   handleDrop(day) → setWeeklySchedule({ [day]: routine })

4. Save Schedule
   handleSaveToCalendar()
   └─ For each day in weeklySchedule:
      └─ Calculate firstOccurrence date
      └─ For each week in program duration:
         └─ Create session object with scheduled_date
   └─ Bulk insert to scheduled_routines
   └─ Show success message
   └─ Clear weeklySchedule after 3 seconds
```

---

## 🧪 Testing Checklist

### Setup
- [ ] Run `create-scheduled-routines-table.sql` in Supabase SQL Editor
- [ ] Verify table created with indexes and RLS policies
- [ ] Ensure client has assigned program with generated routines
- [ ] Client should have start date and workout days in onboarding data

### UI Testing
- [ ] No client selected → "No Client Selected" placeholder shown
- [ ] Client selected with no program → "No Program Assigned" shown
- [ ] Client selected with program → Info card displays correctly
- [ ] Routine cards are draggable (grab cursor on hover)
- [ ] Day slots highlight on drag over
- [ ] Routine assigned to day → Green border, routine name shown
- [ ] Click X button → Routine removed from day
- [ ] Schedule progress counter updates (e.g., "2 of 3 sessions assigned")

### Functionality Testing
- [ ] Drag routine to Monday → Assigned correctly
- [ ] Drag same routine to Tuesday → Can assign same routine multiple times
- [ ] Drag different routine to Monday → Replaces previous routine
- [ ] Remove routine from day → Slot returns to empty state
- [ ] Save with 0 routines → Error message shown
- [ ] Save with routines → Success message shown
- [ ] Check database → scheduled_routines rows created
- [ ] Verify recurring sessions span full program duration
- [ ] Verify scheduled_date is correct for each day of week

### Edge Cases
- [ ] Client with no start date → Uses current date
- [ ] Program with no duration_weeks → Defaults to 12 weeks
- [ ] Client with no workoutDays → Uses routine count
- [ ] Trainer switches client mid-schedule → Schedule clears
- [ ] Save fails (database error) → Error message shown

### Responsive Testing
- [ ] Desktop (1920px) → Two column layout works
- [ ] Tablet (768px) → Single column, routines below schedule
- [ ] Mobile (375px) → Stacked day slots, full width

---

## 🔧 Configuration

### Constants

```javascript
// Days of week order
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

// Default program duration
const DEFAULT_PROGRAM_WEEKS = 12;

// Status message timeout
const STATUS_MESSAGE_TIMEOUT = 3000; // 3 seconds
```

### Customization Points

**Sessions Per Week Calculation**
```javascript
// Current: workoutDays.length or routine count
const sessionsPerWeek = clientProgram?.workoutDays?.length || programRoutines.length;

// Alternative: Fixed value from program
const sessionsPerWeek = clientProgram?.sessions_per_week || 3;
```

**Start Date Source**
```javascript
// Current: From selectedClient object
const startDate = new Date(selectedClient.startDate || new Date());

// Alternative: From program assignment date
const startDate = new Date(clientProgram.start_date || new Date());
```

**Recurring Session Logic**
```javascript
// Current: Weekly for program duration
for (let week = 0; week < programDurationWeeks; week++) {
  sessionDate.setDate(sessionDate.getDate() + (week * 7));
}

// Alternative: Until specific end date
const endDate = new Date(startDate);
endDate.setDate(endDate.getDate() + (programDurationWeeks * 7));
while (sessionDate <= endDate) {
  // create session
  sessionDate.setDate(sessionDate.getDate() + 7);
}
```

---

## 📧 Email Notifications (Future)

### Planned Implementation

```javascript
// In handleSaveToCalendar() after successful insert:

// Send welcome email with schedule overview
await sendEmail({
  to: selectedClient.email,
  subject: `Your ${clientProgram.name} Schedule is Ready!`,
  template: 'schedule_created',
  data: {
    clientName: selectedClient.name,
    programName: clientProgram.name,
    startDate: selectedClient.startDate,
    sessions: scheduledSessions.map(s => ({
      day: DAYS_OF_WEEK[new Date(s.scheduled_date).getDay()],
      date: s.scheduled_date,
      routine: s.routine_id
    }))
  }
});

// Create calendar invite (.ics file)
const icsFile = generateICS({
  summary: `${routine.name} Workout`,
  description: `Scheduled workout session`,
  start: sessionDate,
  duration: { hours: 1 },
  recurrence: {
    freq: 'WEEKLY',
    count: programDurationWeeks
  }
});

// Send reminder emails 24 hours before each session
await scheduleReminders(scheduledSessions);
```

### Email Service Integration
- Use SendGrid, Mailgun, or Supabase Edge Function with SMTP
- Store email preferences in `user_profiles`
- Allow clients to opt-out of reminders
- Track email open rates and click-through

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No email notifications** - Placeholder only, requires email service integration
2. **No time slot selection** - Sessions created with date only, not specific time
3. **Single routine per day** - Cannot assign multiple routines to same day
4. **Manual start date** - Must be set in client onboarding, not auto-calculated
5. **No schedule editing** - Once saved, cannot edit without deleting and recreating

### Planned Enhancements
- [ ] Time slot selection (morning, afternoon, evening)
- [ ] Multiple routines per day with time ranges
- [ ] Edit existing schedules without recreation
- [ ] Drag entire schedule card to calendar widget
- [ ] Copy schedule from previous week
- [ ] Template schedules for common programs
- [ ] Visual calendar view with all clients
- [ ] Client availability integration (no conflicts)
- [ ] Rest day indicators and recommendations

---

## 🚨 Troubleshooting

### "No program assigned to this client yet"
**Cause:** Client's `trainer_clients.assigned_program_id` is NULL  
**Fix:** Go to Programs tab, select program, click "Assign to Client"

### "No routines generated yet"
**Cause:** `trainer_clients.generated_routine_ids` is empty  
**Fix:** Program assignment should create routines automatically. Check `handleAssignToClient()` in `TrainerPrograms.jsx`

### Routines not draggable
**Cause:** Missing `draggable` attribute or drag handlers  
**Fix:** Verify `<div className="routine-card draggable" draggable onDragStart={...}>`

### Drop not working
**Cause:** Missing `onDragOver` with `e.preventDefault()`  
**Fix:** Add `onDragOver={handleDragOver}` to day slots

### Sessions not created in database
**Cause:** RLS policy blocking INSERT or incorrect client ID  
**Fix:** 
1. Check Supabase error in console
2. Verify trainer has client in `trainer_clients`
3. Run: `SELECT * FROM trainer_clients WHERE trainer_id = 'your-trainer-uuid'`
4. Check RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'scheduled_routines'`

### Wrong scheduled dates
**Cause:** Day index calculation error or timezone issues  
**Fix:** 
1. Check `DAYS_OF_WEEK` array matches JavaScript `getDay()` (Sunday = 0)
2. Verify start date parsing: `new Date(selectedClient.startDate)`
3. Use `.toISOString().split('T')[0]` for date-only strings

---

## 📊 Performance Considerations

### Database Queries
- Load program and routines: **2 queries** (trainer_clients + programs, then workout_routines)
- Save schedule: **1 bulk insert** (all sessions in single INSERT statement)
- Future optimization: Use database function to create recurring sessions server-side

### React Rendering
- Drag state changes trigger re-renders of day slots only (not entire component)
- Use `React.memo()` for RoutineCard if performance issues arise
- Consider virtualizing day slots if week view expands to month view

### Bundle Size
- SmartScheduling.jsx: ~11 KB
- SmartScheduling.css: ~8 KB
- Total impact: +19 KB (acceptable for major feature)

---

## 🔗 Related Documentation

- **Database Schema:** `docs/WORKOUT_SCHEMA_REDESIGN_PROPOSAL.md`
- **Client Onboarding:** `src/pages/trainer/ClientOnboarding.jsx`
- **Program Assignment:** `src/pages/trainer/TrainerPrograms.jsx`
- **Trainer Dashboard Layout:** `docs/TRAINER_DASHBOARD_LAYOUT.md` (if exists)
- **RLS Policies:** `scripts/create-scheduled-routines-table.sql`

---

## 📝 Changelog

### Version 1.0.0 (November 14, 2025)
- ✅ Initial release
- ✅ Drag-and-drop scheduler with weekly day slots
- ✅ Client selection integration
- ✅ Recurring session creation for program duration
- ✅ Database table with RLS policies
- ✅ Empty state handling
- ✅ Responsive design
- ⏳ Email notifications (planned)

---

## 👥 Support

For questions or issues:
1. Check this documentation first
2. Review code comments in `SmartScheduling.jsx`
3. Test with sample client and program
4. Check Supabase logs for RLS/database errors
5. Contact development team

**Development Team:** Felony Fitness Development  
**Last Updated:** November 14, 2025  
**Commit:** f4e7d33
