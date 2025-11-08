-- Drop foreign key constraints on direct_messages table referencing old users table
ALTER TABLE direct_messages DROP CONSTRAINT IF EXISTS direct_messages_sender_id_fkey;
ALTER TABLE direct_messages DROP CONSTRAINT IF EXISTS direct_messages_recipient_id_fkey;
-- Add correct foreign key constraints to user_profiles table
ALTER TABLE direct_messages
ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE direct_messages
ADD CONSTRAINT direct_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES user_profiles(id) ON DELETE CASCADE;