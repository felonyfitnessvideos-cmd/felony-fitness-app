-- Add program_name column to trainer_clients table
-- This provides human-readable program identification alongside the program_id

-- Add the column
ALTER TABLE trainer_clients 
ADD COLUMN IF NOT EXISTS program_name TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN trainer_clients.program_name IS 'Human-readable program name for easy identification (e.g., "Strength Builder", "Fat Loss Program")';

-- Optional: If you have existing data and want to update it based on assigned_program_id
-- You would need to join with your programs table to populate this
-- Example (adjust based on your actual programs table structure):
-- UPDATE trainer_clients tc
-- SET program_name = p.name
-- FROM programs p
-- WHERE tc.assigned_program_id = p.id
-- AND tc.program_name IS NULL;

-- Note: You may want to add this column to your database.types.ts after running this migration
