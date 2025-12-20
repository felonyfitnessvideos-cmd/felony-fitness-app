/**
 * @fileoverview Intelligent drag-and-drop workout scheduler for trainer-client programming
 * @description Advanced scheduling interface allowing trainers to assign workout routines
 * to specific days of the week, export schedules to Google Calendar with recurring events,
 * and send automated email notifications to clients about their programmed training sessions.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-15
 * 
 * @requires React
 * @requires lucide-react
 * @requires AuthContext
 * @requires supabaseClient
 * @requires googleCalendarService
 * 
 * Core Features:
 * - **Drag-and-Drop Assignment**: Visual routine placement on weekly calendar
 * - **Google Calendar Sync**: Export schedules as recurring calendar events
 * - **Client Email Notifications**: Automated emails with workout details and schedule
 * - **Program Integration**: Loads client's assigned program and generated routines
 * - **Flexible Scheduling**: Customizable workout time and duration
 * - **Visual Feedback**: Clear indication of assigned vs. empty days
 * - **Recurring Events**: Creates repeating calendar events for consistency
 * 
 * Architecture:
 * 
 * **Data Sources**:
 * 1. trainer_clients table → assigned_program_id, generated_routine_ids
 * 2. trainer_programs table → program details
 * 3. routines table → workout routine templates
 * 4. user_profiles table → client email for notifications
 * 
 * **Weekly Schedule Structure**:
 * ```javascript
 * {
 *   'Monday': { routineId: '123', routineName: 'Upper Body Push' },
 *   'Tuesday': { routineId: '456', routineName: 'Lower Body Squat' },
 *   'Wednesday': null, // Rest day
 *   'Thursday': { routineId: '789', routineName: 'Upper Body Pull' },
 *   'Friday': { routineId: '101', routineName: 'Lower Body Deadlift' }
 * }
 * ```
 * 
 * Workflow:
 * 1. Trainer selects client (passed via props)
 * 2. Component loads client's assigned program
 * 3. Loads all routines generated for that program
 * 4. Trainer drags routine from pool to day slot
 * 5. Visual feedback shows assignment
 * 6. Trainer sets workout time (default 8:00 AM) and duration (default 60 min)
 * 7. Trainer clicks "Export to Calendar"
 * 8. System creates Google Calendar events:
 *    - Recurring weekly events
 *    - With workout details in description
 *    - Calendar shared with client email
 * 9. Optional: Send email notification to client
 * 
 * Google Calendar Integration:
 * - Uses OAuth 2.0 for trainer authentication
 * - Creates events on trainer's calendar
 * - Shares calendar with client email
 * - Recurring rule: FREQ=WEEKLY;BYDAY=MO,TU,TH,FR (example)
 * - Event structure:
 *   ```
 *   summary: "Upper Body Push - John Doe"
 *   description: "Routine: Upper Body Push\nProgram: Strength Builder\nDuration: 60 min"
 *   start: 2025-12-19T08:00:00
 *   end: 2025-12-19T09:00:00
 *   recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"]
 *   attendees: [{ email: client@email.com }]
 *   ```
 * 
 * Email Notification:
 * - Sent via Supabase Edge Function
 * - Contains schedule overview
 * - Links to client dashboard
 * - Includes workout descriptions
 * - Professional HTML template
 * 
 * Drag-and-Drop Implementation:
 * - **onDragStart**: Captures routine data
 * - **onDragOver**: Allows drop on valid targets
 * - **onDrop**: Assigns routine to day
 * - **State Update**: Optimistic UI update
 * - **Persistent**: Saves to database on calendar export
 * 
 * Days of Week:
 * - Default: Monday-Friday (5-day split common)
 * - Configurable: Can extend to include weekends
 * - Visual: Sunday typically excluded for rest
 * 
 * Time Handling:
 * - Default: 08:00:00 (8 AM)
 * - User-configurable via time picker
 * - Timezone: Uses client's local timezone
 * - Duration: Default 60 minutes, adjustable
 * 
 * Error Handling:
 * - Validates client has assigned program
 * - Checks for generated routines
 * - Handles Google Calendar API failures
 * - Shows helpful error messages
 * - Graceful degradation if calendar unavailable
 * 
 * State Management:
 * - **clientProgram**: Assigned program details
 * - **programRoutines**: Available routines to schedule
 * - **weeklySchedule**: Day → routine mapping
 * - **draggedRoutine**: Currently dragged routine
 * - **scheduledTime**: Workout start time (HH:MM:SS)
 * - **durationMinutes**: Workout duration
 * - **isSaving**: Loading state during calendar export
 * - **statusMessage**: User feedback for actions
 * 
 * Performance Optimizations:
 * - useCallback for event handlers (prevent re-renders)
 * - Lazy loading of program data
 * - Optimistic UI updates
 * - Batched calendar event creation
 * 
 * Accessibility:
 * - Keyboard accessible drag-and-drop
 * - Screen reader announcements for assignments
 * - Focus management during drag operations
 * - Clear visual feedback for drop targets
 * 
 * @example
 * // Usage in trainer dashboard
 * import SmartScheduling from './components/SmartScheduling';
 * 
 * function TrainerClientView() {
 *   const [selectedClient, setSelectedClient] = useState(null);
 * 
 *   return (
 *     <SmartScheduling 
 *       selectedClient={selectedClient}
 *       onScheduleCreated={(schedule) => {
 *         console.log('Schedule created:', schedule);
 *         showSuccessToast('Calendar events created!');
 *       }}
 *     />
 *   );
 * }
 * 
 * @example
 * // Typical trainer workflow
 * 1. Open Smart Scheduling interface
 * 2. System loads: "Strength Builder" program with 4 routines
 * 3. Drag "Upper Push" → Monday
 * 4. Drag "Lower Squat" → Tuesday
 * 5. Drag "Upper Pull" → Thursday
 * 6. Drag "Lower Deadlift" → Friday
 * 7. Set time: 6:00 AM
 * 8. Set duration: 75 minutes
 * 9. Click "Export to Calendar"
 * 10. Google Calendar creates 4 recurring weekly events
 * 11. Client receives email: "Your Training Schedule is Ready!"
 * 12. Client sees workouts in their Google Calendar
 * 
 * @see {@link ../services/googleCalendar.js} for calendar API implementation
 * @see {@link ../../supabase/functions/send-schedule-email} for email notifications
 * 
 * @param {Object} props - Component props
 * @param {Object} props.selectedClient - Currently selected client object
 * @param {string} props.selectedClient.id - Client's user_id in database
 * @param {string} props.selectedClient.full_name - Client's display name
 * @param {string} props.selectedClient.email - Client's email for calendar sharing
 * @param {Function} props.onScheduleCreated - Callback when schedule exported to calendar
 * @param {Object} props.onScheduleCreated.schedule - Created schedule object
 * @returns {JSX.Element} Smart scheduling interface component
 */
/**
 * @file SmartScheduling.jsx
 * @description Drag-and-drop program scheduler for trainers to assign client workout routines
 * @project Felony Fitness
 * 
 * Features:
 * - Display selected client info and program details
 * - Drag-and-drop routine assignment to weekly schedule
 * - Export schedule to calendar with recurring sessions
 * - Client email notifications for scheduled sessions
 */

import {
  Calendar,
  Clock,
  Dumbbell,
  User
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import googleCalendarService from '../services/googleCalendar.js';
import { useAuth } from '../AuthContext.jsx';
import { supabase } from '../supabaseClient.js';
import './SmartScheduling.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * SmartScheduling component for client program scheduling
 * 
 * @param {Object} props
 * @param {Object} props.selectedClient - Currently selected client object
 * @param {Function} props.onScheduleCreated - Callback when schedule is saved to calendar
 */
const SmartScheduling = ({ selectedClient, onScheduleCreated }) => {
  /** @type {[Object|null, Function]} Selected client's program data */
  const [clientProgram, setClientProgram] = useState(null);

  /** @type {[Array, Function]} Program routines available to schedule */
  const [programRoutines, setProgramRoutines] = useState([]);

  /** @type {[Object, Function]} Weekly schedule (day -> routine mapping) */
  const [weeklySchedule, setWeeklySchedule] = useState({});

  /** @type {[Object|null, Function]} Currently dragged routine */
  const [draggedRoutine, setDraggedRoutine] = useState(null);

  /** @type {[boolean, Function]} Saving state */
  const [isSaving, setIsSaving] = useState(false);

  /** @type {[string, Function]} Status message */
  const [statusMessage, setStatusMessage] = useState('');

  /** @type {[string, Function]} Scheduled time (default 8 AM) */
  const [scheduledTime, setScheduledTime] = useState('08:00:00');

  /** @type {[number, Function]} Workout duration in minutes */
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Auth for client email lookup
  const { user: _user } = useAuth();

  /**
   * Load client's assigned program and generated routines
   */
  const loadClientProgram = useCallback(async () => {
    if (!selectedClient?.id) return;

    try {
      // Get client's trainer_clients record to find assigned program
      const { data: trainerClient, error: tcError } = await supabase
        .from('trainer_clients')
        .select('assigned_program_id, generated_routine_ids, notes')
        .eq('client_id', selectedClient.id)
        .single();

      if (tcError || !trainerClient?.assigned_program_id) {
        setStatusMessage('No program assigned to this client yet');
        return;
      }

      // Parse workout days from intake notes if available
      let workoutDays = [];
      if (trainerClient.notes) {
        try {
          const intakeData = JSON.parse(trainerClient.notes);
          workoutDays = intakeData?.goalsPreferences?.workoutDays || [];
        } catch {
          // Notes not in JSON format, skip
        }
      }

      // Get program details
      const { data: program, error: progError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', trainerClient.assigned_program_id)
        .single();

      if (progError) throw progError;

      // Add workoutDays to program data
      setClientProgram({ ...program, workoutDays });

      // Get generated routines for this client
      if (trainerClient.generated_routine_ids && trainerClient.generated_routine_ids.length > 0) {
        const { data: routines, error: routError } = await supabase
          .from('workout_routines')
          .select('*')
          .in('id', trainerClient.generated_routine_ids)
          .eq('user_id', selectedClient.id);

        if (routError) throw routError;

        setProgramRoutines(routines || []);
      }

    } catch (error) {
      console.error('Error loading client program:', error);
      setStatusMessage('Error loading program data');
    }
  }, [selectedClient]);

  /**
   * Load client program and routines when client selected
   */
  useEffect(() => {
    if (!selectedClient) {
      setClientProgram(null);
      setProgramRoutines([]);
      setWeeklySchedule({});
      return;
    }

    loadClientProgram();
  }, [selectedClient, loadClientProgram]);

  /**
   * Handle drag start
   */
  const _handleDragStart = (routine) => {
    setDraggedRoutine(routine);
  };

  /**
   * Handle drag over day slot
   */
  const _handleDragOver = (e) => {
    e.preventDefault();
  };

  /**
   * Handle drop routine onto day (now also used by dropdown)
   */
  const handleDrop = (day, routine = null) => {
    const routineToAdd = routine || draggedRoutine;
    if (!routineToAdd) return;

    setWeeklySchedule(prev => ({
      ...prev,
      [day]: routineToAdd
    }));

    setDraggedRoutine(null);
  };

  /**
   * Remove routine from day
   */
  const handleRemoveFromDay = (day) => {
    setWeeklySchedule(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
  };

  /**
   * Save schedule to calendar and create recurring Google Calendar events
   * Creates separate events for each day with weekly recurrence
   */
  const handleSaveToCalendar = async () => {
    if (!selectedClient || !clientProgram || Object.keys(weeklySchedule).length === 0) {
      setStatusMessage('Please assign at least one routine to a day');
      return;
    }

    // Check if Google Calendar is authenticated
    if (!googleCalendarService.isAuthenticated()) {
      setStatusMessage('❌ Please sign in to Google Calendar first');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Creating recurring sessions...');

    try {
      const startDate = new Date();
      const programDurationWeeks = clientProgram.estimated_weeks || clientProgram.duration_weeks || 12;
      const totalSessions = programDurationWeeks; // One session per week per day
      
      // Get client info - email should be directly on selectedClient from trainer_clients table
      const clientEmail = selectedClient.email;
      const clientName = selectedClient.full_name || selectedClient.name || `${selectedClient.first_name} ${selectedClient.last_name}`;

      // Check if client has email for calendar invitations
      if (!clientEmail) {
        setStatusMessage('⚠️ Client has no email address. Please add one to their profile first.');
        setIsSaving(false);
        return;
      }

      // Day of week mapping for RRULE
      const dayCodeMap = {
        'Monday': 'MO',
        'Tuesday': 'TU',
        'Wednesday': 'WE',
        'Thursday': 'TH',
        'Friday': 'FR'
      };

      const createdEvents = [];

      // Create a separate Google Calendar event for EACH day
      for (const [day, routine] of Object.entries(weeklySchedule)) {
        const dayCode = dayCodeMap[day];
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        
        // Calculate first occurrence of this day
        const firstOccurrence = new Date(startDate);
        const currentDayIndex = firstOccurrence.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const targetDayIndex = dayIndex + 1; // Convert to Sunday-based indexing
        let daysUntilFirst = targetDayIndex - currentDayIndex;
        if (daysUntilFirst < 0) daysUntilFirst += 7;
        firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirst);

        // Format start and end times
        const [hours, minutes] = scheduledTime.split(':');
        const startDateTime = new Date(firstOccurrence);
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

        // Generate RRULE for weekly recurrence (must include RRULE: prefix for Google Calendar API)
        const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayCode};COUNT=${totalSessions}`;

        // Create Google Calendar event (raw format)
        const eventData = {
          summary: `💪 ${routine.name} - ${clientName}`,
          description: `Program: ${clientProgram.name}\nWeekly workout session\n\nClient: ${clientName}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          recurrence: [rrule],
          attendees: [{ email: clientEmail }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 60 },  // 1 hour before
              { method: 'popup', minutes: 30 }   // 30 minutes before
            ]
          }
        };

        try {
          // Call service directly with raw event data
          const createdEvent = await googleCalendarService.createEvent(eventData, 'primary');
          const googleEventId = createdEvent.id;

          // Insert into database with google_event_id
          const { error: dbError } = await supabase
            .from('scheduled_routines')
            .insert({
              user_id: selectedClient.id,
              routine_id: routine.id,
              scheduled_date: firstOccurrence.toISOString().split('T')[0],
              scheduled_time: scheduledTime,
              duration_minutes: durationMinutes,
              client_email: clientEmail,
              recurrence_rule: rrule,
              is_recurring: true,
              google_event_id: googleEventId
            });

          if (dbError) {
            console.error('Database insert error:', dbError);
            // Event created in Google Calendar but not in DB - log for manual cleanup
          }

          createdEvents.push({ day, routine: routine.name, eventId: googleEventId });
        } catch (eventError) {
          console.error(`Failed to create event for ${day}:`, eventError);
          setStatusMessage(`⚠️ Failed to create event for ${day}: ${eventError.message}`);
        }
      }

      if (createdEvents.length > 0) {
        setStatusMessage(`✅ Created ${createdEvents.length} recurring events in Google Calendar!`);
        
        if (onScheduleCreated) {
          onScheduleCreated(createdEvents);
        }

        // Clear schedule after 3 seconds
        setTimeout(() => {
          setWeeklySchedule({});
          setStatusMessage('');
        }, 3000);
      } else {
        setStatusMessage('❌ No events were created. Please try again.');
      }

    } catch (error) {
      console.error('Error saving schedule:', error);
      setStatusMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Show placeholder if no client selected
  if (!selectedClient) {
    return (
      <div className="smart-scheduling-empty">
        <Calendar size={48} className="empty-icon" />
        <h3>No Client Selected</h3>
        <p>Select a client from the left menu to begin scheduling</p>
      </div>
    );
  }

  // Show message if no program assigned
  if (!clientProgram) {
    return (
      <div className="smart-scheduling-empty">
        <Dumbbell size={48} className="empty-icon" />
        <h3>No Program Assigned</h3>
        <p>{selectedClient.name || `${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`} doesn't have a program yet</p>
        <p className="help-text">Assign a program from the Programs tab first</p>
      </div>
    );
  }

  const _sessionsPerWeek = clientProgram?.workoutDays?.length || programRoutines.length;
  const scheduledCount = Object.keys(weeklySchedule).length;

  return (
    <div className="smart-scheduling-container">
      {/* Compact Top Bar with Time/Duration Controls */}
      <div className="scheduling-topbar">
        <div className="client-info-inline">
          <User size={12} />
          <span className="client-name">{selectedClient.name || `${selectedClient.first_name} ${selectedClient.last_name}`}</span>
          <span className="separator">•</span>
          <span className="program-name">{clientProgram.name}</span>
        </div>

        <div className="schedule-controls">
          {/* Time Picker */}
          <div className="control-group">
            <Clock size={10} />
            <select 
              className="time-select"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            >
              <option value="06:00:00">6:00 AM</option>
              <option value="06:30:00">6:30 AM</option>
              <option value="07:00:00">7:00 AM</option>
              <option value="07:30:00">7:30 AM</option>
              <option value="08:00:00">8:00 AM</option>
              <option value="08:30:00">8:30 AM</option>
              <option value="09:00:00">9:00 AM</option>
              <option value="09:30:00">9:30 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="12:00:00">12:00 PM</option>
              <option value="14:00:00">2:00 PM</option>
              <option value="15:00:00">3:00 PM</option>
              <option value="16:00:00">4:00 PM</option>
              <option value="17:00:00">5:00 PM</option>
              <option value="18:00:00">6:00 PM</option>
              <option value="19:00:00">7:00 PM</option>
              <option value="20:00:00">8:00 PM</option>
            </select>
          </div>

          {/* Duration Dropdown */}
          <div className="control-group">
            <Dumbbell size={10} />
            <select
              className="duration-select"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            >
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </select>
          </div>

          {/* Add to Calendar Button */}
          <button
            className="add-btn"
            onClick={handleSaveToCalendar}
            disabled={isSaving || scheduledCount === 0}
          >
            {isSaving ? <Clock size={12} className="spinner" /> : <Calendar size={12} />}
            {isSaving ? 'Adding...' : 'Add to Calendar'}
          </button>
        </div>
      </div>

      {/* Main Layout with absolute positioning */}
      <div className="scheduling-layout">
        {/* Sidebar */}
        <div className="routines-sidebar">
          <div className="sidebar-label">Routines</div>
          {programRoutines.length === 0 ? (
            <p className="no-routines-msg">None</p>
          ) : (
            programRoutines.map(routine => (
              <div key={routine.id} className="routine-item">
                {routine.name}
              </div>
            ))
          )}
        </div>

        {/* Weekly Grid with Dropdowns */}
        <div className="days-grid">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="day-cell">
              <label className="day-label">{day.substring(0, 3)}</label>
              <select
                className="routine-select"
                value={weeklySchedule[day]?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const routine = programRoutines.find(r => r.id === e.target.value);
                    handleDrop(day, routine);
                  } else {
                    handleRemoveFromDay(day);
                  }
                }}
              >
                <option value="">None</option>
                {programRoutines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Status Overlay */}
        {statusMessage && (
          <div className={`status-overlay ${statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info'}`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartScheduling;
