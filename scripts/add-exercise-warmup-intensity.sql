-- Add warmup flag and target intensity percentage to program_routines_exercises
-- This allows trainers to mark exercises as warmup sets and specify expected intensity

-- Add is_warmup column (defaults to false)
ALTER TABLE program_routines_exercises 
ADD COLUMN IF NOT EXISTS is_warmup BOOLEAN DEFAULT false;

-- Add target_intensity_pct column (percentage of 1RM, defaults to 75%)
ALTER TABLE program_routines_exercises 
ADD COLUMN IF NOT EXISTS target_intensity_pct INTEGER DEFAULT 75
CHECK (target_intensity_pct >= 0 AND target_intensity_pct <= 100);

-- Add comments for documentation
COMMENT ON COLUMN program_routines_exercises.is_warmup IS 
'Indicates if this exercise is a warmup set (true) or working set (false)';

COMMENT ON COLUMN program_routines_exercises.target_intensity_pct IS 
'Target intensity as percentage of 1RM (0-100). Typical ranges: Warmup 40-60%, Working 70-85%, Peak 90-100%';

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'program_routines_exercises'
  AND column_name IN ('is_warmup', 'target_intensity_pct')
ORDER BY column_name;
