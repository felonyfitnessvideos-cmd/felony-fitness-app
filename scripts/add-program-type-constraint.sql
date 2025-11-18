/**
 * @file add-program-type-constraint.sql
 * @description Add CHECK constraint to program_type column to enforce valid values
 * @date 2025-11-17
 * 
 * PROBLEM: program_type column has no validation, allowing invalid values
 * SOLUTION: Add CHECK constraint to only allow: strength, hypertrophy, endurance, flexibility, recovery
 * 
 * This ensures all programs are properly categorized and filterable in the UI
 */

-- Add CHECK constraint to program_type column
ALTER TABLE programs
DROP CONSTRAINT IF EXISTS programs_program_type_check;

ALTER TABLE programs
ADD CONSTRAINT programs_program_type_check 
CHECK (program_type IN ('strength', 'hypertrophy', 'endurance', 'flexibility', 'recovery'));

-- Verify the constraint was added
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'programs_program_type_check';

SELECT '✅ Successfully added program_type CHECK constraint!' as status;
SELECT '📋 Valid program_type values: strength, hypertrophy, endurance, flexibility, recovery' as info;
