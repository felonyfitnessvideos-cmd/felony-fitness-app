-- Migration: create cycles tables (macrocycle / mesocycle / weeks / sessions)
-- Generated: 2025-10-23

-- Note: this migration is additive and safe to run on a live DB.
-- It creates new tables to support macrocycles, mesocycles, weekly mappings,
-- and generated cycle sessions for calendar/logging integration.

-- Ensure uuid generation function is available (pgcrypto or pgUUID extension)
-- If your DB uses a different UUID generator, adjust DEFAULT expressions accordingly.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS macrocycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesocycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  macrocycle_id uuid REFERENCES macrocycles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  focus text,
  weeks int NOT NULL DEFAULT 4,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesocycle_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mesocycle_id uuid NOT NULL REFERENCES mesocycles(id) ON DELETE CASCADE,
  week_index int NOT NULL,
  day_index int,
  routine_id uuid REFERENCES workout_routines(id),
  session_order int DEFAULT 0,
  notes text
);

CREATE TABLE IF NOT EXISTS cycle_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  mesocycle_id uuid NOT NULL REFERENCES mesocycles(id) ON DELETE CASCADE,
  week_index int NOT NULL,
  day_index int,
  routine_id uuid REFERENCES workout_routines(id),
  scheduled_date date NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cycle_sessions_user_date ON cycle_sessions(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_mesocycles_user ON mesocycles(user_id);
CREATE INDEX IF NOT EXISTS idx_macrocycles_user ON macrocycles(user_id);

-- Add simple trigger to keep updated_at current (optional)
CREATE OR REPLACE FUNCTION refresh_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mesocycles_updated_at
BEFORE UPDATE ON mesocycles
FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at_column();

CREATE TRIGGER trg_macrocycles_updated_at
BEFORE UPDATE ON macrocycles
FOR EACH ROW
EXECUTE FUNCTION refresh_updated_at_column();
