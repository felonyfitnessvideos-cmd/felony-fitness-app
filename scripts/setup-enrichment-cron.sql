/**
 * @file setup-enrichment-cron.sql
 * @description Set up pg_cron job to automatically process nutrition enrichment queue
 * @date 2025-11-17
 * 
 * This creates a cron job that runs every 5 minutes and processes 5 foods at a time
 * until all foods reach quality_score >= 70
 */

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists
SELECT cron.unschedule('nutrition-enrichment-worker') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'nutrition-enrichment-worker'
);

-- Create cron job to run every 5 minutes
-- This will call the nutrition-queue-worker Edge Function
SELECT cron.schedule(
  'nutrition-enrichment-worker',           -- Job name
  '*/5 * * * *',                          -- Every 5 minutes (cron expression)
  $$
  SELECT
    net.http_post(
      url := 'https://wkmrdelhoeqhsdifrarn.supabase.co/functions/v1/nutrition-queue-worker',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'nutrition-enrichment-worker';

-- To manually check job run history later, use:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'nutrition-enrichment-worker') ORDER BY start_time DESC LIMIT 10;
