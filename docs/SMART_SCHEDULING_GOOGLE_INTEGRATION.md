# Smart Scheduling - Google Calendar Integration

## Overview
The SmartScheduling component creates recurring workout events and syncs them with Google Calendar. Each scheduled routine can be configured with specific timing, duration, and recurrence rules.

## Required Information for Google Calendar Events

### 1. **Start Date & Time**
- **Field**: `scheduled_date` (DATE) + `scheduled_time` (TIME)
- **UI Input**: Date picker + Time picker
- **Default**: Today at 8:00 AM
- **Example**: `2025-01-15` + `08:00:00` = Jan 15, 2025 at 8:00 AM

### 2. **Duration**
- **Field**: `duration_minutes` (INTEGER)
- **UI Input**: Dropdown (30, 45, 60, 90, 120 minutes)
- **Default**: 60 minutes
- **Purpose**: Sets the end time for the calendar event

### 3. **Recurrence Pattern**
- **Field**: `recurrence_rule` (TEXT - RRULE format)
- **UI Input**: Recurrence options
- **Options**:
  - **Weekly** (most common for workouts)
  - **Daily**
  - **Every Other Day**
  - **Custom days** (Mon, Wed, Fri)
- **Format**: iCalendar RRULE standard
  - Example: `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12`

### 4. **Recurrence End**
- **Field**: `recurrence_end_date` (DATE)
- **UI Input**: Date picker OR count input
- **Options**:
  - **By date**: "Repeat until March 1, 2026"
  - **By count**: "Repeat 12 times" (based on program duration)
- **Default**: Program duration (e.g., 12 weeks)

### 5. **Client Email**
- **Field**: `client_email` (TEXT)
- **UI Input**: Auto-populated from client profile
- **Purpose**: Send Google Calendar invitation to client
- **Fallback**: Pull from `user_profiles.email` or `auth.users.email`

### 6. **Client Name**
- **Field**: From `user_profiles.full_name`
- **Purpose**: Display in calendar event title
- **Format**: "💪 Upper Body Strength - John Doe"

### 7. **Routine Details**
- **Field**: From `workout_routines.routine_name`
- **Purpose**: Event title and description
- **Description**: Include routine type, focus areas, notes

## SmartScheduling UI Requirements

The UI needs these inputs:

```
┌─────────────────────────────────────────┐
│ Smart Scheduling                        │
├─────────────────────────────────────────┤
│ Client: John Doe                        │
│ Program: 12-Week Strength Builder       │
├─────────────────────────────────────────┤
│                                         │
│ 📅 Start Date: [Jan 15, 2025      ▼]   │
│ 🕐 Time:       [8:00 AM           ▼]   │
│ ⏱️  Duration:   [60 minutes       ▼]   │
│                                         │
│ 🔄 Repeat:     [Weekly            ▼]   │
│    Days:       [☑ Mon ☑ Wed ☑ Fri   ]  │
│    End:        [○ After 12 weeks      ] │
│                [○ On date: [____]    ]  │
│                                         │
│ ✉️  Send invitation to: john@email.com │
│                                         │
│ Weekly Schedule:                        │
│ ┌─────┬─────┬─────┬─────┬─────┐       │
│ │ Mon │ Tue │ Wed │ Thu │ Fri │       │
│ ├─────┼─────┼─────┼─────┼─────┤       │
│ │Upper│ --- │Lower│ --- │ PPL │       │
│ │Body │     │Body │     │     │       │
│ └─────┴─────┴─────┴─────┴─────┘       │
│                                         │
│ [Cancel]  [Add to Google Calendar]     │
└─────────────────────────────────────────┘
```

## Google Calendar Event Format

### Event Object Structure
```javascript
{
  summary: "💪 Upper Body Strength - John Doe",
  description: "Weekly workout session\nProgram: 12-Week Strength Builder\nFocus: Upper body compound movements",
  start: {
    dateTime: "2025-01-15T08:00:00-05:00",
    timeZone: "America/New_York"
  },
  end: {
    dateTime: "2025-01-15T09:00:00-05:00",
    timeZone: "America/New_York"
  },
  recurrence: [
    "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12"
  ],
  attendees: [
    {
      email: "john@example.com",
      responseStatus: "needsAction"
    }
  ],
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 24 * 60 }, // 1 day before
      { method: "popup", minutes: 30 }        // 30 min before
    ]
  },
  colorId: "9" // Blue for workouts
}
```

### RRULE Examples
- **Weekly on Mon/Wed/Fri for 12 weeks**: `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=36`
- **Daily for 30 days**: `FREQ=DAILY;COUNT=30`
- **Every other day**: `FREQ=DAILY;INTERVAL=2;COUNT=18`
- **Weekly until specific date**: `FREQ=WEEKLY;UNTIL=20260301T000000Z`

## Database Flow

1. **User configures schedule** in SmartScheduling UI
2. **Validate inputs** (dates, times, client email)
3. **Create Google Calendar event** via API with recurrence
4. **Store in database**:
   ```sql
   INSERT INTO scheduled_routines (
     user_id,
     routine_id,
     scheduled_date,
     scheduled_time,
     duration_minutes,
     client_email,
     recurrence_rule,
     recurrence_end_date,
     is_recurring,
     google_event_id
   ) VALUES (
     'client-uuid',
     'routine-uuid',
     '2025-01-15',
     '08:00:00',
     60,
     'john@example.com',
     'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=36',
     '2025-04-15',
     true,
     'google_calendar_event_id_here'
   );
   ```
5. **Google Calendar syncs** and sends invitation to client
6. **TrainerCalendar displays** the events by reading from Google Calendar API

## Sync Strategy

### On Create:
1. Insert row in `scheduled_routines`
2. Call Google Calendar API `createEvent()`
3. Store returned `google_event_id` in database

### On Update:
1. Update `scheduled_routines` row
2. Call Google Calendar API `updateEvent(google_event_id)`

### On Delete:
1. Delete from `scheduled_routines`
2. Call Google Calendar API `deleteEvent(google_event_id)`

### On Calendar Change:
- Google Calendar webhook → Update `scheduled_routines`
- Mark as `is_completed` when client marks done in Google Calendar

## Implementation Checklist

- [ ] Update `scheduled_routines` table schema (run ALTER script)
- [ ] Add time picker to SmartScheduling UI
- [ ] Add duration dropdown (30/45/60/90/120 min)
- [ ] Add recurrence pattern selector
- [ ] Add end date/count input
- [ ] Auto-populate client email from profile
- [ ] Integrate Google Calendar API `createEvent()` in SmartScheduling
- [ ] Generate proper RRULE from UI selections
- [ ] Store `google_event_id` after creation
- [ ] Update TrainerCalendar to show time-specific events
- [ ] Add sync error handling (API rate limits, auth issues)
- [ ] Add "Edit Schedule" functionality (update existing events)
- [ ] Add "Cancel Schedule" functionality (delete events)

## Technical Notes

- **Timezone**: Use trainer's timezone for all events
- **Rate Limits**: Google Calendar API has quota limits (watch for bulk operations)
- **Authentication**: Trainer must be authenticated with Google
- **Client Invitations**: Require valid email addresses
- **Recurring vs Individual**: Store parent event ID for recurring series
- **Completion Tracking**: Individual instances can be marked complete independently
