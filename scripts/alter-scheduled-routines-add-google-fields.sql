/**
 * Add Google Calendar integration fields to existing scheduled_routines table
 * 
 * Run this if the table already exists and you need to add the new columns
 * for time, duration, recurrence, and Google Calendar sync
 */

-- Add time and duration fields
ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS scheduled_time TIME DEFAULT '08:00:00';

ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Add Google Calendar integration fields
ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS client_email TEXT;

ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;

ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

ALTER TABLE scheduled_routines 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Add column comments
COMMENT ON COLUMN scheduled_routines.scheduled_time IS 'Time of day for the workout (default 8:00 AM)';
COMMENT ON COLUMN scheduled_routines.duration_minutes IS 'Expected duration in minutes (default 60)';
COMMENT ON COLUMN scheduled_routines.google_event_id IS 'Google Calendar event ID for syncing';
COMMENT ON COLUMN scheduled_routines.client_email IS 'Client email for calendar invitations';
COMMENT ON COLUMN scheduled_routines.recurrence_rule IS 'iCalendar RRULE format for recurring events';
COMMENT ON COLUMN scheduled_routines.recurrence_end_date IS 'End date for recurring series';
COMMENT ON COLUMN scheduled_routines.is_recurring IS 'Whether this is a recurring event';
