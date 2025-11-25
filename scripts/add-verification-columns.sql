-- Add verification columns to food_servings table
-- Created: November 25, 2025
-- Purpose: Support automated nutrition data verification system

-- Add is_verified column
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add needs_review column (for flagged foods)
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;

-- Add review_flags column (array of flag strings)
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS review_flags TEXT[];

-- Add review_details column (JSONB for detailed check results)
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS review_details JSONB;

-- Add verification_details column (JSONB for successful verification details)
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS verification_details JSONB;

-- Add last_verification timestamp
ALTER TABLE food_servings 
ADD COLUMN IF NOT EXISTS last_verification TIMESTAMPTZ;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_food_servings_is_verified ON food_servings(is_verified);
CREATE INDEX IF NOT EXISTS idx_food_servings_needs_review ON food_servings(needs_review);
CREATE INDEX IF NOT EXISTS idx_food_servings_last_verification ON food_servings(last_verification);

-- Create index for verification worker queries
CREATE INDEX IF NOT EXISTS idx_food_servings_verification_queue 
ON food_servings(enrichment_status, is_verified, quality_score DESC)
WHERE enrichment_status IN ('completed', 'verified') 
AND (is_verified IS NULL OR is_verified = FALSE);

-- Comment on columns
COMMENT ON COLUMN food_servings.is_verified IS 'TRUE when food has passed all verification checks (quality score = 100)';
COMMENT ON COLUMN food_servings.needs_review IS 'TRUE when food failed verification checks and needs manual review';
COMMENT ON COLUMN food_servings.review_flags IS 'Array of flag codes for failed checks (e.g., ATWATER_MISMATCH, PHYSICS_VIOLATION)';
COMMENT ON COLUMN food_servings.review_details IS 'Detailed results from failed verification checks';
COMMENT ON COLUMN food_servings.verification_details IS 'Detailed results from successful verification (all checks passed)';
COMMENT ON COLUMN food_servings.last_verification IS 'Timestamp of last verification attempt';

-- Update enrichment_status enum to include 'verified' state
-- ALTER TYPE enrichment_status_enum ADD VALUE IF NOT EXISTS 'verified';
-- Note: Uncomment above if you want 'verified' as a distinct status from 'completed'

-- View to show foods needing review
CREATE OR REPLACE VIEW foods_needing_review AS
SELECT 
  id,
  food_name,
  serving_description,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  category,
  needs_review,
  review_flags,
  review_details,
  quality_score,
  last_verification
FROM food_servings
WHERE needs_review = TRUE
ORDER BY last_verification DESC;

-- View to show verification queue
CREATE OR REPLACE VIEW verification_queue AS
SELECT 
  id,
  food_name,
  serving_description,
  enrichment_status,
  quality_score,
  is_verified,
  last_verification
FROM food_servings
WHERE enrichment_status IN ('completed', 'verified')
  AND (is_verified IS NULL OR is_verified = FALSE)
ORDER BY quality_score DESC
LIMIT 100;

-- Verification statistics function
CREATE OR REPLACE FUNCTION get_verification_stats()
RETURNS TABLE (
  total_foods BIGINT,
  verified_foods BIGINT,
  needs_review_foods BIGINT,
  pending_verification_foods BIGINT,
  verification_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_foods,
    COUNT(*) FILTER (WHERE is_verified = TRUE)::BIGINT as verified_foods,
    COUNT(*) FILTER (WHERE needs_review = TRUE)::BIGINT as needs_review_foods,
    COUNT(*) FILTER (WHERE enrichment_status IN ('completed', 'verified') AND (is_verified IS NULL OR is_verified = FALSE))::BIGINT as pending_verification_foods,
    ROUND(
      (COUNT(*) FILTER (WHERE is_verified = TRUE)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
      2
    ) as verification_rate
  FROM food_servings;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON foods_needing_review TO authenticated;
GRANT SELECT ON verification_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_stats() TO authenticated;

-- Test the new columns
SELECT 
  COUNT(*) as total_foods,
  COUNT(*) FILTER (WHERE is_verified = TRUE) as verified,
  COUNT(*) FILTER (WHERE needs_review = TRUE) as flagged,
  COUNT(*) FILTER (WHERE enrichment_status IN ('completed', 'verified') AND (is_verified IS NULL OR is_verified = FALSE)) as pending_verification
FROM food_servings;

COMMENT ON SCRIPT IS 'Verification system schema - Run this to enable automated nutrition data verification';
