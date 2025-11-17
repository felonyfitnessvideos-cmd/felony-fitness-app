/**
 * @file setup-enrichment-cron-simple.sql
 * @description Set up automatic nutrition enrichment using Supabase Edge Functions
 * @date 2025-11-17
 * 
 * NOTE: pg_cron may not be available on all Supabase plans.
 * Alternative: Use Supabase's built-in scheduled functions or external cron service
 */

-- First, let's check if pg_cron is available
SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';

-- If pg_cron exists, enable it:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Alternative approach: Create a function that can be called externally
-- This can be triggered by:
-- 1. GitHub Actions workflow (every 5 minutes)
-- 2. External cron service (cron-job.org, EasyCron, etc.)
-- 3. Vercel Cron Jobs
-- 4. Manual trigger from your app

CREATE OR REPLACE FUNCTION trigger_enrichment_worker()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- This function can be called from external services
  -- It will return statistics about foods needing enrichment
  
  SELECT json_build_object(
    'foods_needing_enrichment', (
      SELECT COUNT(*) 
      FROM food_servings 
      WHERE quality_score < 70 OR quality_score IS NULL
    ),
    'foods_processing', (
      SELECT COUNT(*) 
      FROM food_servings 
      WHERE enrichment_status = 'processing'
    ),
    'foods_completed_today', (
      SELECT COUNT(*) 
      FROM food_servings 
      WHERE DATE(last_enrichment) = CURRENT_DATE
    ),
    'average_quality', (
      SELECT ROUND(AVG(quality_score), 1) 
      FROM food_servings 
      WHERE quality_score IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Test the function
SELECT trigger_enrichment_worker();
