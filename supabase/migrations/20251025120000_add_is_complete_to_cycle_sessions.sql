-- Add is_complete column to cycle_sessions so we can track completed sessions independently
ALTER TABLE IF EXISTS cycle_sessions
ADD COLUMN IF NOT EXISTS is_complete boolean NOT NULL DEFAULT false;

-- optional index to query by mesocycle and completion
CREATE INDEX IF NOT EXISTS idx_cycle_sessions_mesocycle_is_complete ON cycle_sessions (mesocycle_id, is_complete);
