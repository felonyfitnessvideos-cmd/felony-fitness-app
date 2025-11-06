-- Check current RLS policies on trainer_clients table
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'trainer_clients';
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own trainer relationships" ON trainer_clients;
DROP POLICY IF EXISTS "Users can insert their own trainer relationships" ON trainer_clients;
DROP POLICY IF EXISTS "Trainers can manage their client relationships" ON trainer_clients;
-- Create policies that allow trainers to add clients
CREATE POLICY "Trainers can insert client relationships" ON trainer_clients FOR
INSERT TO authenticated WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "Users can view relationships where they are trainer or client" ON trainer_clients FOR
SELECT TO authenticated USING (
        auth.uid() = trainer_id
        OR auth.uid() = client_id
    );
CREATE POLICY "Trainers can update their client relationships" ON trainer_clients FOR
UPDATE TO authenticated USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "Trainers can delete their client relationships" ON trainer_clients FOR DELETE TO authenticated USING (auth.uid() = trainer_id);
-- Enable RLS if not already enabled
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;
-- Check the new policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'trainer_clients'
ORDER BY cmd,
    policyname;