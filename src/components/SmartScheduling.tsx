/**
 * @fileoverview Intelligent drag-and-drop workout scheduler for trainer-client programming
 * @description Advanced scheduling interface allowing trainers to assign workout routines
 * to specific days of the week, export schedules to Google Calendar with recurring events,
 * and send automated email notifications to clients about their programmed training sessions.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-15
 */

import {
  Calendar,
  Clock,
  Dumbbell,
  User
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Tables } from '../database.types';
import googleCalendarService from '../services/googleCalendar.js';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient.js';
import { Client } from '../types';
import './SmartScheduling.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type Program = Tables<'programs'> & { workoutDays?: string[] };
type Routine = Tables<'workout_routines'>;

interface CreatedEvent {
  day: string;
  routine: string;
  eventId: string;
}

interface SmartSchedulingProps {
  selectedClient: Client | null;
  onScheduleCreated?: (schedule: CreatedEvent[]) => void;
}

/**
 * SmartScheduling component for client program scheduling
 */
const SmartScheduling = ({ selectedClient, onScheduleCreated }: SmartSchedulingProps) => {
  const [clientProgram, setClientProgram] = useState<Program | null>(null);
  const [programRoutines, setProgramRoutines] = useState<Routine[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, Routine>>({});
  const [draggedRoutine, setDraggedRoutine] = useState<Routine | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00:00');
  const [durationMinutes, setDurationMinutes] = useState(60);

  const { user: _user } = useAuth();

  const loadClientProgram = useCallback(async () => {
    if (!selectedClient?.clientId || !_user?.id) return;

    try {
      const { data: trainerClient, error: tcError } = await supabase
        .from('trainer_clients')
        .select('assigned_program_id, generated_routine_ids, notes')
        .eq('trainer_id', _user.id)
        .eq('client_id', selectedClient.clientId)
        .single();

      if (tcError || !trainerClient?.assigned_program_id) {
        setStatusMessage('No program assigned to this client yet');
        setClientProgram(null);
        return;
      }

      let workoutDays = [];
      if (trainerClient.notes) {
        try {
          const intakeData = JSON.parse(trainerClient.notes);
          workoutDays = intakeData?.goalsPreferences?.workoutDays || [];
        } catch {
          // Notes not in JSON format, skip
        }
      }

      const { data: program, error: progError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', trainerClient.assigned_program_id)
        .single();

      if (progError) throw progError;

      setClientProgram({ ...program, workoutDays });
      setStatusMessage('');

      if (trainerClient.generated_routine_ids && trainerClient.generated_routine_ids.length > 0) {
        const { data: routines, error: routError } = await supabase
          .from('workout_routines')
          .select('*')
          .in('id', trainerClient.generated_routine_ids)
          .eq('user_id', selectedClient.clientId);

        if (routError) throw routError;

        setProgramRoutines(routines || []);
      }

    } catch (error) {
      console.error('Error loading client program:', error);
      setStatusMessage('Error loading program data');
    }
  }, [selectedClient, _user]);

  useEffect(() => {
    if (!selectedClient) {
      setClientProgram(null);
      setProgramRoutines([]);
      setWeeklySchedule({});
      return;
    }

    loadClientProgram();
  }, [selectedClient, loadClientProgram]);

  const handleDrop = (day: string, routine: Routine | null = null) => {
    const routineToAdd = routine || draggedRoutine;
    if (!routineToAdd) return;

    setWeeklySchedule(prev => ({
      ...prev,
      [day]: routineToAdd
    }));

    setDraggedRoutine(null);
  };

  const handleRemoveFromDay = (day: string) => {
    setWeeklySchedule(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
  };

  const handleSaveToCalendar = async () => {
    if (!selectedClient || !clientProgram || Object.keys(weeklySchedule).length === 0) {
      setStatusMessage('Please assign at least one routine to a day');
      return;
    }

    if (!googleCalendarService.isAuthenticated()) {
      setStatusMessage('❌ Please sign in to Google Calendar first');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Creating recurring sessions...');

    try {
      const startDate = new Date();
      const programDurationWeeks = clientProgram.estimated_weeks || 12;
      const totalSessions = programDurationWeeks;
      
      const clientEmail = selectedClient.email;
      const clientName = selectedClient.full_name || selectedClient.name || `${selectedClient.first_name} ${selectedClient.last_name}`;

      if (!clientEmail) {
        setStatusMessage('⚠️ Client has no email address. Please add one to their profile first.');
        setIsSaving(false);
        return;
      }

      const dayCodeMap: { [key: string]: string } = {
        'Monday': 'MO',
        'Tuesday': 'TU',
        'Wednesday': 'WE',
        'Thursday': 'TH',
        'Friday': 'FR'
      };

      const createdEvents: CreatedEvent[] = [];

      for (const [day, routine] of Object.entries(weeklySchedule)) {
        const dayCode = dayCodeMap[day];
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        
        const firstOccurrence = new Date(startDate);
        const currentDayIndex = firstOccurrence.getDay();
        const targetDayIndex = dayIndex + 1;
        let daysUntilFirst = targetDayIndex - currentDayIndex;
        if (daysUntilFirst < 0) daysUntilFirst += 7;
        firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirst);

        const [hours, minutes] = scheduledTime.split(':');
        const startDateTime = new Date(firstOccurrence);
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);

        const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayCode};COUNT=${totalSessions}`;

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
              { method: 'email', minutes: 60 },
              { method: 'popup', minutes: 30 }
            ]
          }
        };

        try {
          const createdEvent = await googleCalendarService.createEvent(eventData, 'primary');
          const googleEventId = createdEvent.id;

          const { error: dbError } = await supabase
            .from('scheduled_routines')
            .insert({
              user_id: selectedClient.clientId,
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
          }

          createdEvents.push({ day, routine: routine.name || '', eventId: googleEventId });
        } catch (eventError) {
          const err = eventError as Error;
          console.error(`Failed to create event for ${day}:`, err);
          setStatusMessage(`⚠️ Failed to create event for ${day}: ${err.message}`);
        }
      }

      if (createdEvents.length > 0) {
        setStatusMessage(`✅ Created ${createdEvents.length} recurring events in Google Calendar!`);
        
        if (onScheduleCreated) {
          onScheduleCreated(createdEvents);
        }

        setTimeout(() => {
          setWeeklySchedule({});
          setStatusMessage('');
        }, 3000);
      } else {
        setStatusMessage('❌ No events were created. Please try again.');
      }

    } catch (error) {
      const err = error as Error;
      console.error('Error saving schedule:', err);
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedClient) {
    return (
      <div className="smart-scheduling-empty">
        <Calendar size={48} className="empty-icon" />
        <h3>No Client Selected</h3>
        <p>Select a client from the left menu to begin scheduling</p>
      </div>
    );
  }

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

  const scheduledCount = Object.keys(weeklySchedule).length;

  return (
    <div className="smart-scheduling-container">
      <div className="scheduling-topbar">
        <div className="client-info-inline">
          <User size={12} />
          <span className="client-name">{selectedClient.name || `${selectedClient.first_name} ${selectedClient.last_name}`}</span>
          <span className="separator">•</span>
          <span className="program-name">{clientProgram.name}</span>
        </div>

        <div className="schedule-controls">
          <div className="control-group">
            <Clock size={10} />
            <select 
              className="time-select"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            >
              <option value="06:00:00">6:00 AM</option>
              <option value="07:00:00">7:00 AM</option>
              <option value="08:00:00">8:00 AM</option>
              <option value="09:00:00">9:00 AM</option>
              <option value="17:00:00">5:00 PM</option>
              <option value="18:00:00">6:00 PM</option>
            </select>
          </div>

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
              <option value={75}>75 min</option>
              <option value={90}>90 min</option>
            </select>
          </div>

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

      <div className="scheduling-layout">
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
                    if (routine) handleDrop(day, routine);
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
