/**
 * @fileoverview Schedule Routine Modal Component
 * @description Modal component for scheduling workout routines with clients via Google Calendar integration.
 * Handles client selection, date/time picking, and calls the schedule-routine Edge Function.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires Supabase
 * 
 * @component ScheduleRoutineModal
 * @example
 * <ScheduleRoutineModal
 *   routine={selectedRoutine}
 *   clients={clientsList}
 *   onSuccess={handleSuccess}
 *   onClose={handleClose}
 * />
 */

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../useAuth';
import './ScheduleRoutineModal.css';

/**
 * @typedef {Object} ScheduleRoutineModalProps
 * @property {Object} routine - Routine object to schedule
 * @property {Array} clients - List of available clients
 * @property {Function} onSuccess - Success callback function
 * @property {Function} onClose - Close callback function
 */

/**
 * Schedule Routine Modal Component
 * @param {ScheduleRoutineModalProps} props - Component props
 * @returns {JSX.Element} Schedule routine modal
 */
const ScheduleRoutineModal = ({ routine, clients, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get minimum date for date picker (today)
   * @function getMinDate
   * @returns {string} Minimum date in YYYY-MM-DD format
   */
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /**
   * Get suggested time slots based on time of day
   * @function getSuggestedTimes
   * @returns {Array<Object>} Array of suggested time objects
   */
  const getSuggestedTimes = () => {
    return [
      { value: '06:00', label: '6:00 AM - Early Morning' },
      { value: '07:00', label: '7:00 AM - Morning' },
      { value: '08:00', label: '8:00 AM - Morning' },
      { value: '09:00', label: '9:00 AM - Mid Morning' },
      { value: '10:00', label: '10:00 AM - Late Morning' },
      { value: '12:00', label: '12:00 PM - Lunch Break' },
      { value: '13:00', label: '1:00 PM - Early Afternoon' },
      { value: '17:00', label: '5:00 PM - After Work' },
      { value: '18:00', label: '6:00 PM - Evening' },
      { value: '19:00', label: '7:00 PM - Evening' },
      { value: '20:00', label: '8:00 PM - Late Evening' }
    ];
  };

  /**
   * Handle form submission
   * @async
   * @function handleSubmit
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClientId || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      // Combine date and time into ISO string
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      if (startDateTime < new Date()) {
        throw new Error('Cannot schedule routines in the past');
      }

      // Get selected client info
      const selectedClient = clients.find(client => client.id === selectedClientId);
      if (!selectedClient) {
        throw new Error('Selected client not found');
      }

      // Call the schedule-routine Edge Function
      const { data, error: scheduleError } = await supabase.functions.invoke('schedule-routine', {
        body: {
          routine_id: routine.id,
          routine_name: routine.name,
          client_id: selectedClientId,
          client_email: selectedClient.email,
          client_name: selectedClient.full_name,
          start_time: startDateTime.toISOString(),
          estimated_duration_minutes: routine.estimated_duration_minutes || 60,
          notes: notes || null,
          trainer_id: user.id
        }
      });

      if (scheduleError) {
        throw new Error(scheduleError.message || 'Failed to schedule routine');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule routine');
      }

      // Call success callback with scheduling data
      onSuccess({
        ...data.data,
        clientName: selectedClient.full_name,
        routineName: routine.name,
        scheduledTime: startDateTime.toISOString()
      });

    } catch (err) {
      console.error('Schedule routine error:', err);
      setError(err.message || 'Failed to schedule routine. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  /**
   * Handle modal backdrop click
   * @function handleBackdropClick
   * @param {Event} e - Click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Format routine duration for display
   * @function formatDuration
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration string
   */
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="schedule-modal-backdrop" onClick={handleBackdropClick}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📅 Schedule Workout</h3>
          <button onClick={onClose} className="close-button" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Routine Info */}
          <div className="routine-info">
            <h4 className="routine-name">{routine.name}</h4>
            <div className="routine-details">
              <span className="detail">⏱️ {formatDuration(routine.estimated_duration_minutes || 60)}</span>
              {routine.difficulty_level && (
                <span className="detail">
                  {routine.difficulty_level === 'beginner' && '🟢'} 
                  {routine.difficulty_level === 'intermediate' && '🟡'} 
                  {routine.difficulty_level === 'advanced' && '🔴'} 
                  {routine.difficulty_level.charAt(0).toUpperCase() + routine.difficulty_level.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Scheduling Form */}
          <form onSubmit={handleSubmit} className="schedule-form">
            {/* Client Selection */}
            <div className="form-group">
              <label htmlFor="client-select" className="form-label">
                👤 Select Client *
              </label>
              <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="form-select"
                required
                disabled={isScheduling}
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="form-group">
              <label htmlFor="date-select" className="form-label">
                📅 Select Date *
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="form-input"
                required
                disabled={isScheduling}
              />
            </div>

            {/* Time Selection */}
            <div className="form-group">
              <label htmlFor="time-select" className="form-label">
                ⏰ Select Time *
              </label>
              <select
                id="time-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="form-select"
                required
                disabled={isScheduling}
              >
                <option value="">Choose a time...</option>
                {getSuggestedTimes().map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                💡 Times are suggestions. You can also type a custom time.
              </small>
            </div>

            {/* Custom Time Input */}
            <div className="form-group">
              <label htmlFor="custom-time" className="form-label">
                🕐 Or Enter Custom Time
              </label>
              <input
                id="custom-time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="form-input"
                disabled={isScheduling}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes-input" className="form-label">
                📝 Notes (Optional)
              </label>
              <textarea
                id="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes for this workout..."
                className="form-textarea"
                rows="3"
                disabled={isScheduling}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isScheduling}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="schedule-button"
                disabled={isScheduling || !selectedClientId || !selectedDate || !selectedTime}
              >
                {isScheduling ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Scheduling...
                  </>
                ) : (
                  '📅 Schedule Workout'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Schedule Info */}
        <div className="modal-footer">
          <div className="schedule-info">
            <h5>🔄 What happens next:</h5>
            <ul>
              <li>📧 Your client will receive a calendar invitation</li>
              <li>📱 They'll get a reminder notification before the workout</li>
              <li>📊 The workout will appear in your dashboard</li>
              <li>✅ They can log their progress directly from the reminder</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRoutineModal;