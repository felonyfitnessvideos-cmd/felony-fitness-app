/**
 * @file useGoogleCalendar.jsx
 * @description React hook for Google Calendar integration
 * @project Felony Fitness
 * 
 * Custom React hook that provides Google Calendar functionality including
 * authentication, event management, and calendar synchronization.
 */

import { useState, useEffect, useCallback } from 'react';
import googleCalendarService from '../services/googleCalendar.js';
import { getGoogleCalendarConfig, isGoogleCalendarConfigured } from '../services/googleCalendarConfig.js';

/**
 * Custom hook for Google Calendar integration
 * 
 * Provides authentication, event management, and calendar sync functionality
 * 
 * @returns {Object} Calendar hook state and methods
 */
export default function useGoogleCalendar() {
  /** @type {[boolean, Function]} Loading state */
  const [isLoading, setIsLoading] = useState(false);
  
  /** @type {[boolean, Function]} Initialization state */
  const [isInitialized, setIsInitialized] = useState(false);
  
  /** @type {[boolean, Function]} Authentication state */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  /** @type {[Array, Function]} User's calendars */
  const [calendars, setCalendars] = useState([]);
  
  /** @type {[Array, Function]} Calendar events */
  const [events, setEvents] = useState([]);
  
  /** @type {[string|null, Function]} Error message */
  const [error, setError] = useState(null);
  
  /** @type {[boolean, Function]} Configuration status */
  const [isConfigured, setIsConfigured] = useState(false);

  /**
   * Initialize Google Calendar API
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if properly configured
      if (!isGoogleCalendarConfigured()) {
        setIsConfigured(false);
        setError('Google Calendar not configured. Please set API credentials.');
        return;
      }
      
      setIsConfigured(true);
      const config = getGoogleCalendarConfig();
      
      const success = await googleCalendarService.initialize(
        config.apiKey,
        config.clientId
      );
      
      if (success) {
        setIsInitialized(true);
        setIsAuthenticated(googleCalendarService.isAuthenticated());
      } else {
        setError('Failed to initialize Google Calendar API');
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Sign in to Google account
   */
  const signIn = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await googleCalendarService.signIn();
      if (success) {
        setIsAuthenticated(true);
        // Load user's calendars after successful sign-in
        await loadCalendars();
      } else {
        setError('Failed to sign in to Google Calendar');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Sign out from Google account
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await googleCalendarService.signOut();
      setIsAuthenticated(false);
      setCalendars([]);
      setEvents([]);
    } catch (err) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load user's calendars
   */
  const loadCalendars = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const calendarList = await googleCalendarService.getCalendars();
      setCalendars(calendarList);
    } catch (err) {
      setError(err.message || 'Failed to load calendars');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Load events from calendar
   * @param {string} calendarId - Calendar ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  const loadEvents = useCallback(async (calendarId = 'primary', startDate, endDate) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const eventList = await googleCalendarService.getEvents(calendarId, startDate, endDate);
      setEvents(eventList);
      return eventList;
    } catch (err) {
      setError(err.message || 'Failed to load events');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create a new calendar event
   * @param {Object} appointmentData - Appointment details
   * @param {string} calendarId - Calendar ID
   */
  const createEvent = useCallback(async (appointmentData, calendarId = 'primary') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const eventData = googleCalendarService.formatAppointmentForCalendar(appointmentData);
      const createdEvent = await googleCalendarService.createEvent(eventData, calendarId);
      
      // Refresh events after creation
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      await loadEvents(calendarId, today, nextMonth);
      
      return createdEvent;
    } catch (err) {
      setError(err.message || 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadEvents]);

  /**
   * Update an existing calendar event
   * @param {string} eventId - Event ID
   * @param {Object} appointmentData - Updated appointment details
   * @param {string} calendarId - Calendar ID
   */
  const updateEvent = useCallback(async (eventId, appointmentData, calendarId = 'primary') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const eventData = googleCalendarService.formatAppointmentForCalendar(appointmentData);
      const updatedEvent = await googleCalendarService.updateEvent(eventId, eventData, calendarId);
      
      // Refresh events after update
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      await loadEvents(calendarId, today, nextMonth);
      
      return updatedEvent;
    } catch (err) {
      setError(err.message || 'Failed to update event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadEvents]);

  /**
   * Delete a calendar event
   * @param {string} eventId - Event ID
   * @param {string} calendarId - Calendar ID
   */
  const deleteEvent = useCallback(async (eventId, calendarId = 'primary') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await googleCalendarService.deleteEvent(eventId, calendarId);
      
      // Refresh events after deletion
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      await loadEvents(calendarId, today, nextMonth);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadEvents]);

  /**
   * Get available time slots
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} duration - Duration in minutes
   * @param {string} calendarId - Calendar ID
   */
  const getAvailableSlots = useCallback(async (startDate, endDate, duration = 60, calendarId = 'primary') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const slots = await googleCalendarService.getAvailableSlots(startDate, endDate, duration, calendarId);
      return slots;
    } catch (err) {
      setError(err.message || 'Failed to get available slots');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isLoading,
    isInitialized,
    isAuthenticated,
    isConfigured,
    calendars,
    events,
    error,
    
    // Methods
    signIn,
    signOut,
    loadCalendars,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getAvailableSlots,
    clearError
  };
}