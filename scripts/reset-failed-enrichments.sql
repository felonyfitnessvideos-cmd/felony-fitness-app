-- Migration: Auto-retry failed food enrichments after 24 hours
-- Created: November 24, 2025
-- Purpose: Reset failed foods to pending status so workers can retry them automatically

-- Create function to reset old failed foods to pending
CREATE OR REPLACE FUNCTION reset_old_failed_enrichments()
RETURNS void AS $$
BEGIN
  UPDATE food_servings
  SET 
    enrichment_status = 'pending',
    last_enrichment = NULL
  WHERE 
    enrichment_status = 'failed'
    AND last_enrichment < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to run daily (if pg_cron is available)
-- Note: This requires pg_cron extension, may need to enable in Supabase dashboard
-- SELECT cron.schedule('reset-failed-enrichments', '0 2 * * *', 'SELECT reset_old_failed_enrichments()');

-- Manual execution (run once now to clear current failed foods)
SELECT reset_old_failed_enrichments();

-- Verify results
SELECT 
  enrichment_status,
  COUNT(*) as count,
  MIN(last_enrichment) as oldest_attempt,
  MAX(last_enrichment) as newest_attempt
FROM food_servings
GROUP BY enrichment_status
ORDER BY enrichment_status;
