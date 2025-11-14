-- Add program assignment tracking columns to trainer_clients table
-- This allows trainers to track which programs and routines are assigned to each client

-- Add assigned_program_id to track which program template was assigned
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS assigned_program_id UUID REFERENCES programs(id) ON DELETE SET NULL;

-- Add generated_routine_ids to track the actual workout_routines created for the client
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS generated_routine_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trainer_clients_assigned_program 
ON trainer_clients(assigned_program_id);

CREATE INDEX IF NOT EXISTS idx_trainer_clients_generated_routines 
ON trainer_clients USING GIN(generated_routine_ids);

-- Add comment for documentation
COMMENT ON COLUMN trainer_clients.assigned_program_id IS 'Reference to the program template that was assigned to this client';
COMMENT ON COLUMN trainer_clients.generated_routine_ids IS 'Array of workout_routines IDs that were generated from the assigned program for this client';
