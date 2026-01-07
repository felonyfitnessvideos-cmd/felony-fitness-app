/**
 * @file calendarSyncService.js
 * @description Service for syncing events between Supabase and Google Calendar
 * Handles two-way sync with smart scheduling integration
 */

import { supabase } from '../supabaseClient';
import googleCalendarService from './googleCalendar';

/**
 * Calendar Sync Service
 * Manages two-way synchronization between Supabase and Google Calendar
 */
class CalendarSyncService {
  /**
   * Create event in both Supabase and Google Calendar
   * @param {Object} eventData - Event data
   * @param {string} eventData.trainerId - Trainer's user ID
   * @param {string} eventData.routineId - Routine ID to schedule
   * @param {string} eventData.clientId - Client's user ID
   * @param {string} eventData.clientName - Client's name
   * @param {string} eventData.clientEmail - Client's email
   * @param {string} eventData.scheduledDate - Date (YYYY-MM-DD)
   * @param {string} eventData.scheduledTime - Time (HH:MM)
   * @param {number} eventData.durationMinutes - Duration in minutes
   * @param {string} eventData.notes - Optional notes
   * @param {boolean} eventData.syncToGoogle - Whether to sync to Google Calendar
   * @returns {Promise<Object>} Created event with IDs
   */
  static async createEvent(eventData) {
    const {
      trainerId,
      routineId,
      clientName,
      clientEmail,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      notes,
      syncToGoogle = true,
    } = eventData;

    try {
      // 1. Get routine details
      const { data: routine, error: routineError } = await supabase
        .from('workout_routines')
        .select('name, estimated_duration_minutes')
        .eq('id', routineId)
        .single();

      if (routineError) throw new Error(`Failed to fetch routine: ${routineError.message}`);

      const actualDuration = durationMinutes || routine?.estimated_duration_minutes || 60;
      const routineName = routine?.name || 'Workout';

      // 2. Create in Supabase
      const { data: supabaseEvent, error: supabaseError } = await supabase
        .from('scheduled_routines')
        .insert([
          {
            user_id: trainerId,
            routine_id: routineId,
            client_name: clientName,
            client_email: clientEmail,
            scheduled_date: scheduledDate,
            scheduled_time: scheduledTime,
            duration_minutes: actualDuration,
            notes,
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (supabaseError) throw new Error(`Failed to create Supabase event: ${supabaseError.message}`);

      // 3. Create in Google Calendar if authenticated and requested
      let googleEventId = null;
      if (syncToGoogle) {
        try {
          const startDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
          const endDateTime = new Date(startDateTime.getTime() + actualDuration * 60000);

          const googleEvent = await googleCalendarService.createEvent({
            summary: `${routineName} - ${clientName}`,
            description: `Fitness session for client: ${clientName}\n${notes ? `Notes: ${notes}` : ''}`,
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: clientEmail ? [{ email: clientEmail }] : [],
            location: 'To be determined',
          });

          googleEventId = googleEvent.id;

          // Update Supabase with Google event ID
          const { error: updateError } = await supabase
            .from('scheduled_routines')
            .update({ google_event_id: googleEventId })
            .eq('id', supabaseEvent.id);

          if (updateError) {
            console.warn('Failed to update Google event ID:', updateError);
          }
        } catch (googleError) {
          console.warn('Failed to sync to Google Calendar:', googleError);
          // Continue without Google sync - don't fail the operation
        }
      }

      return {
        ...supabaseEvent,
        google_event_id: googleEventId,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update event in both systems
   * @param {string} eventId - Supabase event ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated event
   */
  static async updateEvent(eventId, updateData) {
    try {
      // 1. Get current event to check if it has Google event ID
      const { data: currentEvent, error: fetchError } = await supabase
        .from('scheduled_routines')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Update in Supabase
      const { data: updatedEvent, error: updateError } = await supabase
        .from('scheduled_routines')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. Update Google Calendar if event exists there
      if (currentEvent.google_event_id) {
        try {
          const googleUpdateData = {};

          if (updateData.scheduled_date || updateData.scheduled_time) {
            const startDateTime = new Date(
              `${updateData.scheduled_date || currentEvent.scheduled_date}T${updateData.scheduled_time || currentEvent.scheduled_time}`
            );
            const durationMinutes = updateData.duration_minutes || currentEvent.duration_minutes || 60;
            const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

            googleUpdateData.start = {
              dateTime: startDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };
            googleUpdateData.end = {
              dateTime: endDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };
          }

          if (updateData.notes) {
            googleUpdateData.description = updateData.notes;
          }

          if (Object.keys(googleUpdateData).length > 0) {
            await googleCalendarService.updateEvent(currentEvent.google_event_id, googleUpdateData);
          }
        } catch (googleError) {
          console.warn('Failed to update Google Calendar event:', googleError);
        }
      }

      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete event from both systems
   * @param {string} eventId - Supabase event ID
   * @returns {Promise<void>}
   */
  static async deleteEvent(eventId) {
    try {
      // 1. Get event to check for Google event ID
      const { data: event, error: fetchError } = await supabase
        .from('scheduled_routines')
        .select('google_event_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete from Google Calendar if it exists there
      if (event?.google_event_id) {
        try {
          await googleCalendarService.deleteEvent(event.google_event_id);
        } catch (googleError) {
          console.warn('Failed to delete from Google Calendar:', googleError);
        }
      }

      // 3. Delete from Supabase
      const { error: deleteError } = await supabase
        .from('scheduled_routines')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Mark event as completed in both systems
   * @param {string} eventId - Supabase event ID
   * @returns {Promise<Object>} Updated event
   */
  static async markEventComplete(eventId) {
    const now = new Date().toISOString();
    return this.updateEvent(eventId, {
      is_completed: true,
      completed_at: now,
    });
  }

  /**
   * Sync scheduled event to Google Calendar
   * (Use when an event was created before Google auth)
   * @param {string} eventId - Supabase event ID
   * @returns {Promise<string>} Google event ID
   */
  static async syncToGoogle(eventId) {
    try {
      // Get event details
      const { data: event, error: fetchError } = await supabase
        .from('scheduled_routines')
        .select(`
          *,
          workout_routines:routine_id(name)
        `)
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      if (event.google_event_id) return event.google_event_id; // Already synced

      // Create in Google Calendar
      const startDateTime = new Date(`${event.scheduled_date}T${event.scheduled_time}`);
      const endDateTime = new Date(startDateTime.getTime() + (event.duration_minutes || 60) * 60000);

      const googleEvent = await googleCalendarService.createEvent({
        summary: `${event.workout_routines?.name || 'Workout'} - ${event.client_name}`,
        description: event.notes || '',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: event.client_email ? [{ email: event.client_email }] : [],
      });

      // Update Supabase with Google event ID
      await supabase
        .from('scheduled_routines')
        .update({ google_event_id: googleEvent.id })
        .eq('id', eventId);

      return googleEvent.id;
    } catch (error) {
      console.error('Error syncing to Google:', error);
      throw error;
    }
  }

  /**
   * Get all events for a trainer
   * @param {string} trainerId - Trainer's user ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of events
   */
  static async getEvents(trainerId, startDate, endDate) {
    try {
      const { data: events, error } = await supabase
        .from('scheduled_routines')
        .select(`
          *,
          workout_routines:routine_id(name, estimated_duration_minutes)
        `)
        .eq('user_id', trainerId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}

export default CalendarSyncService;
