/**
 * @file TrainerCalendar.jsx
 * @description Calendar management page for trainers with Google Calendar integration
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, MapPin, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import useGoogleCalendar from '../../hooks/useGoogleCalendar.jsx';
import './TrainerCalendar.css';

const TrainerCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localEvents, setLocalEvents] = useState([]);
  
  // Google Calendar integration
  const {
    isLoading,
    isAuthenticated,
    isConfigured,
    events,
    error,
    signIn,
    signOut,
    loadEvents,
    createEvent,
    clearError
  } = useGoogleCalendar();

  // Load Google Calendar events when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      loadEvents('primary', today, nextMonth);
    }
  }, [isAuthenticated, loadEvents]);

  // Convert Google Calendar events to appointment format
  useEffect(() => {
    if (events.length > 0) {
      const convertedEvents = events.map(event => ({
        id: event.id,
        clientName: event.summary?.split(' - ')[1] || 'Unknown Client',
        date: event.start?.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }) : 'All Day',
        duration: event.start?.dateTime && event.end?.dateTime ? 
          Math.round((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / (1000 * 60)) : 60,
        type: event.summary?.split(' - ')[0] || 'Appointment',
        location: event.location || 'TBD',
        status: 'confirmed',
        googleEventId: event.id,
        source: 'google'
      }));
      setLocalEvents(convertedEvents);
    }
  }, [events]);
  
  // Mock local appointments data (fallback when not using Google Calendar)
  useEffect(() => {
    if (!isAuthenticated || !isConfigured) {
      const today = new Date().toISOString().split('T')[0];
      
      setAppointments([
        {
          id: 1,
          clientName: "John Dough",
          date: today,
          time: "10:00 AM",
          duration: 60,
          type: "Personal Training",
          location: "Gym Floor A",
          status: "confirmed",
          source: 'local'
        },
        {
          id: 2,
          clientName: "Jane Smith", 
          date: today,
          time: "2:00 PM",
          duration: 45,
          type: "Consultation",
          location: "Office",
          status: "pending",
          source: 'local'
        }
      ]);
    } else {
      setAppointments(localEvents);
    }
  }, [isAuthenticated, isConfigured, localEvents]);

  const handleGoogleCalendarSync = async () => {
    if (!isAuthenticated) {
      try {
        await signIn();
      } catch (err) {
        console.error('Failed to sign in to Google Calendar:', err);
      }
    } else {
      // Refresh events
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      await loadEvents('primary', today, nextMonth);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocalEvents([]);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleCreateTestEvent = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to Google Calendar first');
      return;
    }

    try {
      const testAppointment = {
        clientName: 'Test Client',
        type: 'Personal Training',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        location: 'Gym Studio A',
        notes: 'Test appointment created from Felony Fitness app',
        clientEmail: '' // Optional
      };

      await createEvent(testAppointment);
      alert('Test appointment created successfully!');
    } catch (err) {
      console.error('Failed to create test event:', err);
      alert('Failed to create test appointment: ' + err.message);
    }
  };

  // Get today's appointments
  const todaysAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  return (
    <div className="trainer-calendar-container">
      <div className="calendar-header">
        <h2><Calendar size={24} />Calendar Management</h2>
        <div className="calendar-actions">
          {/* Google Calendar Status */}
          <div className="google-calendar-status">
            {!isConfigured ? (
              <div className="status-badge warning">
                <AlertCircle size={16} />
                <span>Not Configured</span>
              </div>
            ) : isAuthenticated ? (
              <div className="status-badge success">
                <CheckCircle size={16} />
                <span>Connected</span>
              </div>
            ) : (
              <div className="status-badge neutral">
                <Clock size={16} />
                <span>Not Connected</span>
              </div>
            )}
          </div>

          {/* Calendar Action Buttons */}
          {isConfigured && (
            <>
              {!isAuthenticated ? (
                <button 
                  onClick={handleGoogleCalendarSync} 
                  className="sync-button"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                  {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleGoogleCalendarSync} 
                    className="sync-button"
                    disabled={isLoading}
                  >
                    <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                    {isLoading ? 'Syncing...' : 'Sync Calendar'}
                  </button>
                  <button onClick={handleSignOut} className="signout-button">
                    Sign Out
                  </button>
                </>
              )}
            </>
          )}
          
          <button 
            className="new-appointment-button"
            onClick={isAuthenticated ? handleCreateTestEvent : undefined}
            disabled={isLoading}
          >
            <Plus size={18} />
            {isAuthenticated ? 'Create Test Event' : 'New Appointment'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}

      {/* Configuration Notice */}
      {!isConfigured && (
        <div className="config-notice">
          <AlertCircle size={20} />
          <div>
            <h4>Google Calendar Setup Required</h4>
            <p>To enable Google Calendar integration, please set up your API credentials:</p>
            <ol>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable the Google Calendar API</li>
              <li>Create credentials (API Key and OAuth 2.0 Client ID)</li>
              <li>Set environment variables: VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID</li>
            </ol>
          </div>
        </div>
      )}

      <div className="calendar-layout">
        <div className="calendar-sidebar">
          <h3>
            Today's Appointments 
            {isAuthenticated && <span className="google-badge">Google Calendar</span>}
          </h3>
          
          {todaysAppointments.length === 0 ? (
            <div className="no-appointments">
              <Calendar size={32} />
              <p>No appointments today</p>
              {isAuthenticated && <p>Synced with Google Calendar</p>}
            </div>
          ) : (
            todaysAppointments.map(appointment => (
              <div key={appointment.id} className={`appointment-card ${appointment.source || 'local'}`}>
                <div className="appointment-time">
                  <Clock size={16} />
                  {appointment.time}
                </div>
                <div className="appointment-details">
                  <div className="client-name">
                    <User size={16} />
                    {appointment.clientName}
                  </div>
                  <div className="appointment-type">{appointment.type}</div>
                  <div className="appointment-location">
                    <MapPin size={14} />
                    {appointment.location}
                  </div>
                  {appointment.source === 'google' && (
                    <div className="google-sync-indicator">
                      <CheckCircle size={12} />
                      Synced with Google
                    </div>
                  )}
                </div>
                <div className={`appointment-status ${appointment.status}`}>
                  {appointment.status}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="calendar-main">
          <div className="calendar-widget">
            <div className="calendar-grid">
              <h4>Calendar View</h4>
              {isAuthenticated ? (
                <div className="calendar-stats">
                  <div className="stat-card">
                    <div className="stat-number">{events.length}</div>
                    <div className="stat-label">Total Events</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{todaysAppointments.length}</div>
                    <div className="stat-label">Today's Appointments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{todaysAppointments.filter(a => a.status === 'confirmed').length}</div>
                    <div className="stat-label">Confirmed</div>
                  </div>
                </div>
              ) : (
                <div className="calendar-placeholder">
                  <Calendar size={48} />
                  <h5>Connect Google Calendar</h5>
                  <p>Sync your appointments and manage your schedule</p>
                  {isConfigured && (
                    <button onClick={handleGoogleCalendarSync} className="connect-button">
                      Connect Now
                    </button>
                  )}
                </div>
              )}
              
              <div className="upcoming-events">
                <h5>Upcoming Events</h5>
                {appointments.slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="event-item">
                    <div className="event-time">{appointment.time}</div>
                    <div className="event-details">
                      <div className="event-title">{appointment.type}</div>
                      <div className="event-client">{appointment.clientName}</div>
                    </div>
                    <div className="event-status">
                      {appointment.source === 'google' ? '🔗' : '📅'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerCalendar;
