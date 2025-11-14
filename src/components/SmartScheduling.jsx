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
        <p>{selectedClient.name || `${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`} doesn't have a program yet</p>
        <p className="help-text">Assign a program from the Programs tab first</p>
      </div>
    );
  }

  const sessionsPerWeek = clientProgram?.workoutDays?.length || programRoutines.length;
  const scheduledCount = Object.keys(weeklySchedule).length;

  return (
    <div className="smart-scheduling-container">
      {/* Compact Header */}
      <div className="compact-header">
        <div className="client-info">
          <User size={14} />
          <span className="client-name">{selectedClient.name || `${selectedClient.first_name} ${selectedClient.last_name}`}</span>
          <span className="separator">•</span>
          <span className="program-name">{clientProgram.name}</span>
          <span className="separator">•</span>
          <span className="session-count">{sessionsPerWeek}x/week</span>
        </div>
        <button
          className="save-btn-compact"
          onClick={handleSaveToCalendar}
          disabled={isSaving || scheduledCount === 0}
        >
          {isSaving ? <Clock size={14} className="spinner" /> : <Calendar size={14} />}
          {isSaving ? 'Adding...' : 'Add to Calendar'}
        </button>
      </div>

      {/* Main Workspace */}
      <div className="compact-workspace">
        {/* Routines Bank */}
        <div className="routines-bank">
          <div className="bank-label">
            <Dumbbell size={12} />
            <span>Drag Routines</span>
          </div>
          {programRoutines.length === 0 ? (
            <p className="no-routines-compact">No routines</p>
          ) : (
            programRoutines.map(routine => (
              <div
                key={routine.id}
                className="routine-chip"
                draggable
                onDragStart={() => handleDragStart(routine)}
              >
                <GripVertical size={12} />
                <span>{routine.name}</span>
              </div>
            ))
          )}
        </div>

        {/* Weekly Grid */}
        <div className="weekly-grid">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className={`day-box ${weeklySchedule[day] ? 'filled' : 'empty'}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day)}
            >
              <div className="day-name">{day.substring(0, 3)}</div>
              {weeklySchedule[day] ? (
                <div className="routine-assigned">
                  <span className="routine-text">{weeklySchedule[day].name}</span>
                  <button
                    className="remove-x"
                    onClick={() => handleRemoveFromDay(day)}
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="drop-zone">+</div>
              )}
            </div>
          ))}
        </div>

        {/* Status */}
        {statusMessage && (
          <div className={`status-compact ${statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info'}`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartScheduling;
