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
import { useEffect, useState } from 'react';
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
  const { user } = useAuth();

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
  }, [selectedClient]);

  /**
   * Load client's assigned program and generated routines
   */
  const loadClientProgram = async () => {
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
  };

  /**
   * Handle drag start
   */
  const handleDragStart = (routine) => {
    setDraggedRoutine(routine);
  };

  /**
   * Handle drag over day slot
   */
  const handleDragOver = (e) => {
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

        // Generate RRULE for weekly recurrence
        const rrule = `FREQ=WEEKLY;BYDAY=${dayCode};COUNT=${totalSessions}`;

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
              { method: 'email', minutes: 1440 }, // 24 hours before
              { method: 'popup', minutes: 30 }    // 30 minutes before
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

  const sessionsPerWeek = clientProgram?.workoutDays?.length || programRoutines.length;
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
