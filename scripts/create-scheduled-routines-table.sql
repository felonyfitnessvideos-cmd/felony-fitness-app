/**
 * Create scheduled_routines table for Smart Scheduling feature
 * 
 * This table stores the weekly schedule assignments created by trainers
 * for their clients. Each row represents one scheduled workout session.
 * 
 * Features:
 * - Links to workout_routines and user profiles
 * - Tracks scheduled date for each session
 * - Supports recurring weekly schedules
 * - Allows notifications and reminders
 */

-- Create scheduled_routines table
CREATE TABLE IF NOT EXISTS scheduled_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_routines_user_id 
  ON scheduled_routines(user_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_routines_routine_id 
  ON scheduled_routines(routine_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_routines_scheduled_date 
  ON scheduled_routines(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_scheduled_routines_user_date 
  ON scheduled_routines(user_id, scheduled_date);

-- Enable Row Level Security
ALTER TABLE scheduled_routines ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own scheduled routines
CREATE POLICY user_can_view_own_scheduled_routines ON scheduled_routines
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own scheduled routines (mark completed)
CREATE POLICY user_can_update_own_scheduled_routines ON scheduled_routines
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Trainers can view their clients' scheduled routines
CREATE POLICY trainer_can_view_client_scheduled_routines ON scheduled_routines
  FOR SELECT
  USING (
    user_id IN (
      SELECT client_id
      FROM trainer_clients
      WHERE trainer_id = auth.uid()
    )
  );

-- RLS Policy: Trainers can insert scheduled routines for their clients
CREATE POLICY trainer_can_insert_client_scheduled_routines ON scheduled_routines
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR
    user_id IN (
      SELECT client_id
      FROM trainer_clients
      WHERE trainer_id = auth.uid()
    )
  );

-- RLS Policy: Trainers can update their clients' scheduled routines
CREATE POLICY trainer_can_update_client_scheduled_routines ON scheduled_routines
  FOR UPDATE
  USING (
    user_id IN (
      SELECT client_id
      FROM trainer_clients
      WHERE trainer_id = auth.uid()
    )
  );

-- RLS Policy: Trainers can delete their clients' scheduled routines
CREATE POLICY trainer_can_delete_client_scheduled_routines ON scheduled_routines
  FOR DELETE
  USING (
    user_id IN (
      SELECT client_id
      FROM trainer_clients
      WHERE trainer_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE scheduled_routines IS 'Weekly workout schedules created by trainers for clients';
COMMENT ON COLUMN scheduled_routines.user_id IS 'Client who will perform this workout';
COMMENT ON COLUMN scheduled_routines.routine_id IS 'Workout routine to be performed';
COMMENT ON COLUMN scheduled_routines.scheduled_date IS 'Date this routine is scheduled for';
COMMENT ON COLUMN scheduled_routines.completed IS 'Whether client has completed this session';
COMMENT ON COLUMN scheduled_routines.completed_at IS 'Timestamp when session was marked complete';
COMMENT ON COLUMN scheduled_routines.notes IS 'Optional notes from trainer or client';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER scheduled_routines_updated_at
  BEFORE UPDATE ON scheduled_routines
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_routines_updated_at();
