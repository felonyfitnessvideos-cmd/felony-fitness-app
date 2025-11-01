/**
 * @file googleCalendar.js
 * @description Google Calendar API integration service
 * @project Felony Fitness
 * 
 * Provides Google Calendar integration for trainer appointments and scheduling.
 * Handles authentication, event creation, updates, and synchronization.
 * 
 * Required Google Calendar API scopes:
 * - https://www.googleapis.com/auth/calendar.readonly
 * - https://www.googleapis.com/auth/calendar.events
 */

// Google Calendar API configuration
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/**
 * Google Calendar API service class
 * Handles all calendar operations including authentication and CRUD operations
 */
class GoogleCalendarService {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
    this.isSignedIn = false;
    this.authInstance = null;
  }

  /**
   * Initialize Google Calendar API
   * @param {string} apiKey - Google API key
   * @param {string} clientId - Google OAuth client ID
   * @returns {Promise<boolean>} Success status
   */
  async initialize(apiKey, clientId) {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      this.gapi = window.gapi;

      // Initialize the API
      await new Promise((resolve) => {
        this.gapi.load('client:auth2', resolve);
      });

      await this.gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });

      this.authInstance = this.gapi.auth2.getAuthInstance();
      this.isInitialized = true;
      this.isSignedIn = this.authInstance.isSignedIn.get();

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar API:', error);
      return false;
    }
  }

  /**
   * Load Google API script dynamically
   * @returns {Promise<void>}
   */
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in to Google account
   * @returns {Promise<boolean>} Success status
   */
  async signIn() {
    if (!this.isInitialized) {
      console.error('Google Calendar API not initialized');
      return false;
    }

    try {
      if (!this.isSignedIn) {
        await this.authInstance.signIn();
        this.isSignedIn = true;
      }
      return true;
    } catch (error) {
      console.error('Failed to sign in to Google:', error);
      return false;
    }
  }

  /**
   * Sign out from Google account
   * @returns {Promise<boolean>} Success status
   */
  async signOut() {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await this.authInstance.signOut();
      this.isSignedIn = false;
      return true;
    } catch (error) {
      console.error('Failed to sign out from Google:', error);
      return false;
    }
  }

  /**
   * Get current authentication status
   * @returns {boolean} Sign-in status
   */
  isAuthenticated() {
    return this.isInitialized && this.isSignedIn;
  }

  /**
   * Get user's calendar list
   * @returns {Promise<Array>} List of calendars
   */
  async getCalendars() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
      throw error;
    }
  }

  /**
   * Get events from calendar within date range
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} List of events
   */
  async getEvents(calendarId = 'primary', startDate, endDate) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  /**
   * Create a new calendar event
   * @param {Object} eventData - Event details
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: eventData
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an existing calendar event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event details
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, eventData, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: eventData
      });

      return response.result;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   * @param {string} eventId - Event ID
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<boolean>} Success status
   */
  async deleteEvent(eventId, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Check for available time slots
   * @param {Date} startDate - Start date to check
   * @param {Date} endDate - End date to check
   * @param {number} duration - Duration in minutes
   * @param {string} calendarId - Calendar ID (default: 'primary')
   * @returns {Promise<Array>} Available time slots
   */
  async getAvailableSlots(startDate, endDate, duration = 60, calendarId = 'primary') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      // Get existing events
      const events = await this.getEvents(calendarId, startDate, endDate);
      
      // Generate potential slots (every 30 minutes during business hours)
      const slots = [];
      const current = new Date(startDate);
      
      while (current < endDate) {
        // Only consider business hours (9 AM - 6 PM)
        const hour = current.getHours();
        if (hour >= 9 && hour < 18) {
          const slotEnd = new Date(current.getTime() + duration * 60000);
          
          // Check if slot conflicts with existing events
          const hasConflict = events.some(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            
            return (current < eventEnd && slotEnd > eventStart);
          });
          
          if (!hasConflict) {
            slots.push({
              start: new Date(current),
              end: new Date(slotEnd),
              duration: duration
            });
          }
        }
        
        // Move to next 30-minute slot
        current.setTime(current.getTime() + 30 * 60000);
      }
      
      return slots;
    } catch (error) {
      console.error('Failed to get available slots:', error);
      throw error;
    }
  }

  /**
   * Format appointment data for Google Calendar event
   * @param {Object} appointment - Appointment data
   * @returns {Object} Google Calendar event format
   */
  formatAppointmentForCalendar(appointment) {
    const startDateTime = new Date(appointment.date);
    const endDateTime = new Date(startDateTime.getTime() + appointment.duration * 60000);

    return {
      summary: `${appointment.type} - ${appointment.clientName}`,
      description: appointment.notes || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: appointment.location || '',
      attendees: appointment.clientEmail ? [{ email: appointment.clientEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }       // 30 minutes before
        ]
      }
    };
  }
}

// Create singleton instance
const googleCalendarService = new GoogleCalendarService();

export default googleCalendarService;