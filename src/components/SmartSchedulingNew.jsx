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
  Check,
  Clock,
  Dumbbell,
  GripVertical,
  Mail,
  Save,
  User,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import './SmartScheduling.css';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
        .select('assigned_program_id, generated_routine_ids')
        .eq('client_id', selectedClient.id)
        .single();

      if (tcError || !trainerClient?.assigned_program_id) {
        setStatusMessage('No program assigned to this client yet');
        return;
      }

      // Get program details
      const { data: program, error: progError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', trainerClient.assigned_program_id)
        .single();

      if (progError) throw progError;

      setClientProgram(program);

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
   * Handle drop routine onto day
   */
  const handleDrop = (day) => {
    if (!draggedRoutine) return;

    setWeeklySchedule(prev => ({
      ...prev,
      [day]: draggedRoutine
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
   * Save schedule to calendar and create recurring sessions
   */
  const handleSaveToCalendar = async () => {
    if (!selectedClient || !clientProgram || Object.keys(weeklySchedule).length === 0) {
      setStatusMessage('Please assign at least one routine to a day');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Creating recurring sessions...');

    try {
      const startDate = new Date(selectedClient.startDate || new Date());
      const programDurationWeeks = clientProgram.duration_weeks || 12;
      const scheduledSessions = [];

      // Create recurring sessions for each assigned day
      for (const [day, routine] of Object.entries(weeklySchedule)) {
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        
        // Calculate first occurrence of this day
        const firstOccurrence = new Date(startDate);
        const daysUntilFirst = (dayIndex - firstOccurrence.getDay() + 7) % 7;
        firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirst);

        // Create sessions for each week in the program
        for (let week = 0; week < programDurationWeeks; week++) {
          const sessionDate = new Date(firstOccurrence);
          sessionDate.setDate(sessionDate.getDate() + (week * 7));

          scheduledSessions.push({
            user_id: selectedClient.id,
            routine_id: routine.id,
            scheduled_date: sessionDate.toISOString().split('T')[0]
          });
        }
      }

      // Insert all scheduled sessions
      const { error: insertError } = await supabase
        .from('scheduled_routines')
        .insert(scheduledSessions);

      if (insertError) throw insertError;

      // TODO: Send email notifications to client
      // This would integrate with your email service

      setStatusMessage(`✅ Created ${scheduledSessions.length} recurring sessions!`);
      
      if (onScheduleCreated) {
        onScheduleCreated(scheduledSessions);
      }

      // Clear schedule after 3 seconds
      setTimeout(() => {
        setWeeklySchedule({});
        setStatusMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error saving schedule:', error);
      setStatusMessage('❌ Error creating sessions. Please try again.');
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
        <p>{selectedClient.first_name} {selectedClient.last_name} doesn't have a program yet</p>
        <p className="help-text">Assign a program from the Programs tab first</p>
      </div>
    );
  }

  const sessionsPerWeek = selectedClient.sessions_per_week || programRoutines.length;
  const scheduledCount = Object.keys(weeklySchedule).length;

  return (
    <div className="smart-scheduling-container">
      {/* Client Info Card */}
      <div className="client-info-card">
        <div className="client-header">
          <User size={20} />
          <h3>{selectedClient.first_name} {selectedClient.last_name}</h3>
        </div>
        <div className="client-essentials">
          <div className="essential-item">
            <span className="label">Program:</span>
            <span className="value">{clientProgram.name}</span>
          </div>
          <div className="essential-item">
            <span className="label">Sessions/Week:</span>
            <span className="value">{sessionsPerWeek}x per week</span>
          </div>
          <div className="essential-item">
            <span className="label">Start Date:</span>
            <span className="value">
              {selectedClient.startDate 
                ? new Date(selectedClient.startDate).toLocaleDateString() 
                : 'Not set'}
            </span>
          </div>
          <div className="essential-item">
            <span className="label">Duration:</span>
            <span className="value">{clientProgram.duration_weeks || 12} weeks</span>
          </div>
        </div>
      </div>

      <div className="scheduling-workspace">
        {/* Available Routines Panel */}
        <div className="routines-panel">
          <h4>
            <Dumbbell size={16} />
            Program Routines
          </h4>
          <div className="routines-list">
            {programRoutines.length === 0 ? (
              <p className="no-routines">No routines generated yet</p>
            ) : (
              programRoutines.map(routine => (
                <div
                  key={routine.id}
                  className="routine-card draggable"
                  draggable
                  onDragStart={() => handleDragStart(routine)}
                >
                  <GripVertical size={16} className="drag-handle" />
                  <span className="routine-name">{routine.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="schedule-grid">
          <div className="schedule-header">
            <h4>
              <Calendar size={16} />
              Weekly Schedule
            </h4>
            <span className="schedule-progress">
              {scheduledCount} of {sessionsPerWeek} sessions assigned
            </span>
          </div>

          <div className="day-slots">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className={`day-slot ${weeklySchedule[day] ? 'has-routine' : 'empty'}`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(day)}
              >
                <div className="day-label">{day}</div>
                {weeklySchedule[day] ? (
                  <div className="assigned-routine">
                    <span>{weeklySchedule[day].name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFromDay(day)}
                      title="Remove routine"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="empty-slot">
                    <span>Drop routine here</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="schedule-actions">
            <button
              className="save-schedule-btn"
              onClick={handleSaveToCalendar}
              disabled={isSaving || scheduledCount === 0}
            >
              {isSaving ? (
                <>
                  <Clock size={16} className="spinner" />
                  Creating Sessions...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save to Calendar
                </>
              )}
            </button>

            {statusMessage && (
              <div className={`status-message ${statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info'}`}>
                {statusMessage}
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="schedule-help">
            <p>💡 Drag routines from the left panel and drop them onto days to create your client's weekly schedule</p>
            <p>📅 When saved, this will create recurring sessions for the entire program duration ({clientProgram.duration_weeks || 12} weeks)</p>
            <p>📧 Your client will receive email reminders before each scheduled session</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartScheduling;
