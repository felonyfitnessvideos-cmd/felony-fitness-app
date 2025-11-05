-- Consolidated Program Library Setup
-- Run this in Supabase SQL Editor to set up all Program Library features

-- =====================================
-- PART 1: Core Tables and Schema
-- =====================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if programs table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'programs') THEN
        -- Programs table: Store program templates and trainer programs
        CREATE TABLE programs (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            estimated_weeks INTEGER DEFAULT 4 CHECK (estimated_weeks > 0),
            target_muscle_groups TEXT[] DEFAULT '{}',
            created_by UUID REFERENCES auth.users(id),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_programs_created_by ON programs(created_by);
        CREATE INDEX idx_programs_difficulty ON programs(difficulty_level);
        CREATE INDEX idx_programs_is_active ON programs(is_active);
        
        -- Enable RLS
        ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policies
        CREATE POLICY "Anyone can view active programs" ON programs
            FOR SELECT USING (is_active = TRUE);
            
        CREATE POLICY "Creators can manage own programs" ON programs
            FOR ALL USING (created_by = auth.uid());
    ELSE
        RAISE NOTICE 'programs table already exists, skipping creation';
    END IF;
END
$$;

-- Check if program_routines table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'program_routines') THEN
        -- Program routines table: Individual workouts within programs
        CREATE TABLE program_routines (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            week_number INTEGER DEFAULT 1 CHECK (week_number > 0),
            day_number INTEGER DEFAULT 1 CHECK (day_number BETWEEN 1 AND 7),
            exercises JSONB DEFAULT '[]',
            estimated_duration_minutes INTEGER DEFAULT 60,
            difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
            equipment_needed TEXT[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_program_routines_program_id ON program_routines(program_id);
        CREATE INDEX idx_program_routines_week_day ON program_routines(week_number, day_number);
        
        -- Enable RLS
        ALTER TABLE program_routines ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policy - users can view routines from programs they can access
        CREATE POLICY "Users can view accessible program routines" ON program_routines
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM programs 
                    WHERE programs.id = program_routines.program_id 
                    AND programs.is_active = TRUE
                )
            );
    ELSE
        RAISE NOTICE 'program_routines table already exists, skipping creation';
    END IF;
END
$$;

-- Check if scheduled_routines table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scheduled_routines') THEN
        -- Scheduled routines table: Log of trainer-scheduled client workouts
        CREATE TABLE scheduled_routines (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            trainer_id UUID NOT NULL REFERENCES auth.users(id),
            client_id UUID NOT NULL REFERENCES auth.users(id),
            routine_id UUID REFERENCES program_routines(id),
            routine_name TEXT NOT NULL,
            start_time TIMESTAMPTZ NOT NULL,
            estimated_duration_minutes INTEGER DEFAULT 60,
            google_calendar_event_id TEXT,
            notes TEXT,
            reminder_sent BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_scheduled_routines_trainer_id ON scheduled_routines(trainer_id);
        CREATE INDEX idx_scheduled_routines_client_id ON scheduled_routines(client_id);
        CREATE INDEX idx_scheduled_routines_start_time ON scheduled_routines(start_time);
        CREATE INDEX idx_scheduled_routines_reminder_sent ON scheduled_routines(reminder_sent);
        
        -- Enable RLS
        ALTER TABLE scheduled_routines ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policies
        CREATE POLICY "Trainers can view own scheduled routines" ON scheduled_routines
            FOR SELECT USING (trainer_id = auth.uid());
            
        CREATE POLICY "Clients can view their scheduled routines" ON scheduled_routines
            FOR SELECT USING (client_id = auth.uid());
            
        CREATE POLICY "Trainers can manage scheduled routines" ON scheduled_routines
            FOR ALL USING (trainer_id = auth.uid());
    ELSE
        RAISE NOTICE 'scheduled_routines table already exists, skipping creation';
    END IF;
END
$$;

-- =====================================
-- PART 2: Notification System
-- =====================================

-- Check if notification_queue table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_queue') THEN
        -- Notification queue table for reliable message delivery
        CREATE TABLE notification_queue (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            type TEXT NOT NULL,
            recipient_id UUID NOT NULL REFERENCES auth.users(id),
            data JSONB NOT NULL,
            scheduled_for TIMESTAMPTZ NOT NULL,
            sent_at TIMESTAMPTZ NULL,
            error_message TEXT NULL,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);
        CREATE INDEX idx_notification_queue_sent_at ON notification_queue(sent_at);
        CREATE INDEX idx_notification_queue_type ON notification_queue(type);
        CREATE INDEX idx_notification_queue_recipient_id ON notification_queue(recipient_id);
        
        -- Enable RLS
        ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
        
        -- RLS policies
        CREATE POLICY "Service role can manage notifications" ON notification_queue
            FOR ALL USING (auth.role() = 'service_role');
            
        CREATE POLICY "Users can view own notifications" ON notification_queue
            FOR SELECT USING (recipient_id = auth.uid());
    ELSE
        RAISE NOTICE 'notification_queue table already exists, skipping creation';
    END IF;
END
$$;

-- =====================================
-- PART 3: Helper Functions
-- =====================================

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables (only if they don't exist)
DO $$
BEGIN
    -- Programs table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_programs_updated_at') THEN
        CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Program routines table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_program_routines_updated_at') THEN
        CREATE TRIGGER update_program_routines_updated_at BEFORE UPDATE ON program_routines
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Scheduled routines table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scheduled_routines_updated_at') THEN
        CREATE TRIGGER update_scheduled_routines_updated_at BEFORE UPDATE ON scheduled_routines
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Notification queue table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_queue_updated_at') THEN
        CREATE TRIGGER update_notification_queue_updated_at BEFORE UPDATE ON notification_queue
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- =====================================
-- PART 4: Sample Data
-- =====================================

-- Insert sample programs (only if none exist)
INSERT INTO programs (name, description, difficulty_level, estimated_weeks, target_muscle_groups, created_by, is_active)
SELECT * FROM (VALUES
    ('Beginner Strength Foundation', 'Perfect starting point for newcomers to strength training. Focuses on fundamental movement patterns and building a solid base.', 'beginner', 8, ARRAY['Full Body', 'Core'], NULL::UUID, TRUE),
    ('Intermediate Hypertrophy Builder', 'Designed for muscle growth with moderate to high volume training. Great for those with 6+ months experience.', 'intermediate', 12, ARRAY['Chest', 'Lats', 'Shoulders', 'Biceps', 'Quadriceps'], NULL::UUID, TRUE),
    ('Advanced Powerlifting Prep', 'Competition-style program focusing on squat, bench, and deadlift with periodized progression.', 'advanced', 16, ARRAY['Quadriceps', 'Chest', 'Lats'], NULL::UUID, TRUE),
    ('Functional Fitness Circuit', 'Dynamic program combining strength, cardio, and mobility for real-world fitness.', 'intermediate', 6, ARRAY['Full Body', 'Core'], NULL::UUID, TRUE),
    ('Recovery & Mobility Flow', 'Gentle program for active recovery, flexibility, and injury prevention.', 'beginner', 4, ARRAY['Core'], NULL::UUID, TRUE)
) AS v(name, description, difficulty_level, estimated_weeks, target_muscle_groups, created_by, is_active)
WHERE NOT EXISTS (SELECT 1 FROM programs LIMIT 1);

-- Insert sample routines for programs (only if none exist)
INSERT INTO program_routines (program_id, name, description, week_number, day_number, exercises, estimated_duration_minutes, difficulty_level, equipment_needed)
SELECT 
    p.id,
    r.name,
    r.description,
    r.week_number,
    r.day_number,
    r.exercises::jsonb,
    r.estimated_duration_minutes,
    r.difficulty_level,
    r.equipment_needed
FROM programs p
CROSS JOIN (VALUES
    ('Full Body Foundations A', 'Introduction to basic compound movements', 1, 1, '[{"name": "Bodyweight Squat", "sets": 3, "reps": "10-15"}, {"name": "Push-ups", "sets": 3, "reps": "8-12"}, {"name": "Bent Over Row", "sets": 3, "reps": "10-12"}]', 45, 'beginner', ARRAY['Dumbbells', 'Resistance Bands']),
    ('Full Body Foundations B', 'Building on movement patterns with progression', 1, 3, '[{"name": "Goblet Squat", "sets": 3, "reps": "12-15"}, {"name": "Incline Push-ups", "sets": 3, "reps": "10-15"}, {"name": "Single Arm Row", "sets": 3, "reps": "10-12"}]', 45, 'beginner', ARRAY['Dumbbells', 'Bench']),
    ('Full Body Foundations C', 'Adding complexity and challenge', 1, 5, '[{"name": "Dumbbell Deadlift", "sets": 3, "reps": "8-12"}, {"name": "Overhead Press", "sets": 3, "reps": "8-10"}, {"name": "Plank", "sets": 3, "reps": "30-60 seconds"}]', 50, 'beginner', ARRAY['Dumbbells'])
) AS r(name, description, week_number, day_number, exercises, estimated_duration_minutes, difficulty_level, equipment_needed)
WHERE p.name = 'Beginner Strength Foundation'
AND NOT EXISTS (SELECT 1 FROM program_routines LIMIT 1);

-- =====================================
-- PART 5: Notification Functions  
-- =====================================

-- Function to trigger routine reminders
CREATE OR REPLACE FUNCTION trigger_routine_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    routine_record RECORD;
BEGIN
    RAISE LOG 'trigger_routine_reminders: Starting reminder check at %', NOW();
    
    -- Find routines starting in 30-35 minutes that need reminders
    FOR routine_record IN
        SELECT 
            id,
            trainer_id,
            client_id,
            routine_name,
            start_time
        FROM scheduled_routines
        WHERE 
            start_time BETWEEN (NOW() + INTERVAL '30 minutes') AND (NOW() + INTERVAL '35 minutes')
            AND reminder_sent = FALSE
    LOOP
        BEGIN
            RAISE LOG 'Processing reminder for routine: % (ID: %), starting at %', 
                routine_record.routine_name, routine_record.id, routine_record.start_time;
            
            -- Update reminder_sent flag first to prevent duplicates
            UPDATE scheduled_routines 
            SET reminder_sent = TRUE, updated_at = NOW()
            WHERE id = routine_record.id;
            
            -- Insert into notification queue
            INSERT INTO notification_queue (
                type,
                recipient_id,
                data,
                scheduled_for,
                created_at
            ) VALUES (
                'routine_reminder',
                routine_record.client_id,
                jsonb_build_object(
                    'scheduled_routine_id', routine_record.id,
                    'routine_name', routine_record.routine_name,
                    'trainer_id', routine_record.trainer_id,
                    'start_time', routine_record.start_time
                ),
                routine_record.start_time - INTERVAL '30 minutes',
                NOW()
            );
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error processing routine reminder for ID %: %', routine_record.id, SQLERRM;
            
            -- Reset reminder_sent flag so it can be retried
            UPDATE scheduled_routines 
            SET reminder_sent = FALSE
            WHERE id = routine_record.id;
        END;
    END LOOP;
    
    RAISE LOG 'trigger_routine_reminders: Completed reminder check at %', NOW();
END;
$$;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notification_queue 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND sent_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE LOG 'Cleaned up % old notifications', deleted_count;
    
    RETURN deleted_count;
END;
$$;

-- Test function for the reminder system
CREATE OR REPLACE FUNCTION test_routine_reminders()
RETURNS TABLE(
    routine_id UUID,
    routine_name TEXT,
    start_time TIMESTAMPTZ,
    notification_created BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.routine_name,
        sr.start_time,
        EXISTS(
            SELECT 1 FROM notification_queue nq 
            WHERE nq.data->>'scheduled_routine_id' = sr.id::text
        ) as notification_created
    FROM scheduled_routines sr
    WHERE 
        sr.start_time BETWEEN (NOW() + INTERVAL '25 minutes') AND (NOW() + INTERVAL '40 minutes')
    ORDER BY sr.start_time;
END;
$$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Program Library setup completed successfully!';
    RAISE NOTICE '📋 Created tables: programs, program_routines, scheduled_routines, notification_queue';
    RAISE NOTICE '🔒 RLS policies configured for security';
    RAISE NOTICE '📊 Sample data inserted';
    RAISE NOTICE '⚡ Functions and triggers created';
    RAISE NOTICE '🚀 Ready to use Program Library features!';
END
$$;