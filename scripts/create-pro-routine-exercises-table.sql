/**
 * @file create-pro-routine-exercises-table.sql
 * @description Create pro_routine_exercises table to link professional routines with exercises
 * @date 2025-11-22
 * 
 * ISSUE: Pro routines in pro_routines table have no exercises linked to them
 * SOLUTION: Create pro_routine_exercises junction table (similar to routine_exercises for user routines)
 * 
 * This table structure mirrors routine_exercises but links to pro_routines instead of workout_routines
 */

-- Create pro_routine_exercises table
-- IMPORTANT: This structure EXACTLY matches routine_exercises so exercises can be copied between tables
CREATE TABLE IF NOT EXISTS public.pro_routine_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    routine_id uuid NOT NULL,  -- References pro_routines.id (NOT pro_routine_id)
    exercise_id uuid NOT NULL,
    target_sets integer DEFAULT 1 NOT NULL,
    sets integer,  -- Nullable, tracks completed sets
    reps character varying(20),  -- Nullable, tracks completed reps
    weight_kg numeric(6,2),  -- Nullable, tracks completed weight
    rest_seconds integer,
    notes text,
    exercise_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_warmup boolean,  -- Nullable
    target_reps text,  -- Nullable
    target_intensity_pct integer DEFAULT 75,
    
    -- Constraints
    CONSTRAINT pro_routine_exercises_target_intensity_pct_check 
        CHECK ((target_intensity_pct >= 0) AND (target_intensity_pct <= 100)),
    
    -- Foreign keys
    CONSTRAINT pro_routine_exercises_routine_id_fkey 
        FOREIGN KEY (routine_id) 
        REFERENCES public.pro_routines(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT pro_routine_exercises_exercise_id_fkey 
        FOREIGN KEY (exercise_id) 
        REFERENCES public.exercises(id) 
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_routine_exercises_routine_order 
    ON public.pro_routine_exercises (routine_id, exercise_order);

CREATE INDEX IF NOT EXISTS idx_pro_routine_exercises_exercise_id 
    ON public.pro_routine_exercises (exercise_id);

-- Add comments for documentation
COMMENT ON TABLE public.pro_routine_exercises IS 
    'Links professional routines to their exercises with workout parameters';

COMMENT ON COLUMN public.pro_routine_exercises.is_warmup IS 
    'Indicates if this exercise is a warmup set (true) or working set (false)';

COMMENT ON COLUMN public.pro_routine_exercises.target_intensity_pct IS 
    'Target intensity as percentage of 1RM (0-100). Typical ranges: Warmup 40-60%, Working 70-85%, Peak 90-100%';

-- Enable Row Level Security
ALTER TABLE public.pro_routine_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Pro routine exercises are public (read-only for all users)
-- Only service role (system/admin) can modify via Edge Functions
CREATE POLICY "Pro routine exercises are viewable by everyone"
    ON public.pro_routine_exercises
    FOR SELECT
    USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users
-- Modifications should only be done via service role or admin tools

-- Verification query
SELECT '✅ pro_routine_exercises table created successfully!' as status;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pro_routine_exercises'
ORDER BY ordinal_position;
