-- Drop foreign key constraints referencing the old users table
ALTER TABLE trainer_clients DROP CONSTRAINT IF EXISTS trainer_clients_trainer_id_fkey;
ALTER TABLE trainer_clients DROP CONSTRAINT IF EXISTS trainer_clients_client_id_fkey;
-- Add correct foreign key constraints to user_profiles table
ALTER TABLE trainer_clients
ADD CONSTRAINT trainer_clients_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE trainer_clients
ADD CONSTRAINT trainer_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES user_profiles(id) ON DELETE CASCADE;