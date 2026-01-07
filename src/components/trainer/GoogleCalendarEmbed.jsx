/**
 * @file GoogleCalendarEmbed.jsx
 * @description Embedded Google Calendar with event management for trainers
 * @project Felony Fitness
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, X, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import useGoogleCalendar from '../../hooks/useGoogleCalendar';
import CreateEventModal from './CreateEventModal';
import ViewEventModal from './ViewEventModal';
import './GoogleCalendarEmbed.css';

/**
 * Google Calendar Embedded Component
 * 
 * @component
 * @description Displays embedded Google Calendar with ability to:
 * - View calendar events
 * - Click on dates to view/create events
 * - Manage Supabase scheduled routines
 * - Real-time sync with Supabase
 * 
 * @param {Object} props
 * @param {string} props.trainerId - Trainer's user ID
 * @returns {React.ReactElement}
 */
const GoogleCalendarEmbed = ({ trainerId }) => {
  const [scheduledRoutines, setScheduledRoutines] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated: isGoogleAuthenticated } = useGoogleCalendar();

  /**
   * Load scheduled routines from Supabase
   */
  const loadScheduledRoutines = useCallback(async () => {
    if (!trainerId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('scheduled_routines')
        .select(`
          id,
          routine_id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          client_id,
          client_name,
          client_email,
          notes,
          is_completed,
          completed_at,
          google_event_id,
          created_at,
          updated_at,
          workout_routines:routine_id(id, name, estimated_duration_minutes)
        `)
        .eq('user_id', trainerId)
        .gte('scheduled_date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
        .lte('scheduled_date', new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true });

      if (fetchError) throw fetchError;

      setScheduledRoutines(data || []);
      setError(null);
    } catch (err) {
      console.warn('Error loading scheduled routines:', err.message);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    if (!trainerId) return;

    loadScheduledRoutines();

    const subscription = supabase
      .channel(`scheduled_routines:${trainerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_routines',
          filter: `user_id=eq.${trainerId}`,
        },
        () => {
          loadScheduledRoutines();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [trainerId, loadScheduledRoutines]);

  /**
   * Handle calendar date click
   */
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    const events = scheduledRoutines.filter(
      (routine) => routine.scheduled_date === dateStr
    );
    setDayEvents(events);
  };

  /**
   * Handle event click to view details
   */
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  /**
   * Handle create new event
   */
  const handleCreateEvent = async (eventData) => {
    try {
      const { error: insertError } = await supabase
        .from('scheduled_routines')
        .insert([
          {
            user_id: trainerId,
            routine_id: eventData.routineId,
            scheduled_date: eventData.date,
            scheduled_time: eventData.time,
            duration_minutes: eventData.duration,
            client_id: eventData.clientId,
            client_name: eventData.clientName,
            client_email: eventData.clientEmail,
            notes: eventData.notes,
            is_completed: false,
            google_event_id: eventData.googleEventId || null,
          },
        ]);

      if (insertError) throw insertError;

      setShowCreateModal(false);
      await loadScheduledRoutines();
    } catch (err) {
      console.warn('Error creating event:', err.message);
      setError('Failed to create event');
    }
  };

  /**
   * Handle event update
   */
  const handleUpdateEvent = async (eventId, updates) => {
    try {
      const { error: updateError } = await supabase
        .from('scheduled_routines')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', trainerId);

      if (updateError) throw updateError;

      setShowViewModal(false);
      await loadScheduledRoutines();
    } catch (err) {
      console.warn('Error updating event:', err.message);
      setError('Failed to update event');
    }
  };

  /**
   * Handle event deletion
   */
  const handleDeleteEvent = async (eventId) => {
    try {
      const { error: deleteError } = await supabase
        .from('scheduled_routines')
        .delete()
        .eq('id', eventId)
        .eq('user_id', trainerId);

      if (deleteError) throw deleteError;

      setShowViewModal(false);
      await loadScheduledRoutines();
    } catch (err) {
      console.warn('Error deleting event:', err.message);
      setError('Failed to delete event');
    }
  };

  /**
   * Render calendar grid
   */
  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Week header
    const header = weekDays.map((day) => (
      <div key={day} className="calendar-week-header">
        {day}
      </div>
    ));

    // Calendar days
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvents = scheduledRoutines.filter(
        (routine) => routine.scheduled_date === dateStr
      );
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === today.toISOString().split('T')[0];

      calendarDays.push(
        <div
          key={dateStr}
          className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => isCurrentMonth && handleDateClick(dateStr)}
        >
          <div className="day-number">{currentDate.getDate()}</div>
          <div className="day-events">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`day-event ${event.is_completed ? 'completed' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
                title={event.workout_routines?.name}
              >
                {event.workout_routines?.name?.substring(0, 12)}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="more-events">+{dayEvents.length - 2}</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-grid">
        {header}
        {calendarDays}
      </div>
    );
  };

  if (loading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  return (
    <div className="google-calendar-embed">
      {error && (
        <div className="calendar-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="calendar-header">
        <h2>Trainer Calendar</h2>
        <button
          className="btn-create-event"
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setShowCreateModal(true);
          }}
        >
          <Plus size={18} />
          New Event
        </button>
      </div>

      {/* Main calendar view */}
      <div className="calendar-container">
        <div className="calendar-main">{renderCalendar()}</div>

        {/* Selected day sidebar */}
        {selectedDate && (
          <div className="calendar-sidebar">
            <div className="sidebar-header">
              <h3>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <button
                className="btn-close"
                onClick={() => {
                  setSelectedDate(null);
                  setDayEvents([]);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {dayEvents.length === 0 ? (
              <div className="no-events">
                <p>No events scheduled</p>
                <button
                  className="btn-add-event"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} />
                  Add Event
                </button>
              </div>
            ) : (
              <div className="events-list">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-item ${event.is_completed ? 'completed' : ''}`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="event-time">
                      <Clock size={16} />
                      {event.scheduled_time || '09:00'}
                    </div>
                    <div className="event-title">
                      {event.workout_routines?.name || 'Workout'}
                    </div>
                    {event.client_name && (
                      <div className="event-client">
                        <Users size={14} />
                        {event.client_name}
                      </div>
                    )}
                    {event.notes && (
                      <div className="event-notes">
                        <FileText size={14} />
                        {event.notes}
                      </div>
                    )}
                    <div className="event-status">
                      {event.is_completed ? (
                        <span className="status-badge completed">Completed</span>
                      ) : (
                        <span className="status-badge pending">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          trainerId={trainerId}
          defaultDate={selectedDate}
          onCreate={handleCreateEvent}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showViewModal && selectedEvent && (
        <ViewEventModal
          event={selectedEvent}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {!isGoogleAuthenticated && (
        <div className="calendar-note">
          💡 Connect Google Calendar for enhanced sync capabilities
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarEmbed;
