/**
 * @file manual-run-enrichment-worker.sql
 * @description Manually trigger the nutrition enrichment queue worker
 * @date 2025-11-17
 * 
 * Use this to test the worker or manually process a batch of foods
 * without waiting for the cron schedule
 */

-- Manually invoke the nutrition-queue-worker Edge Function
SELECT
  net.http_post(
    url := 'https://wkmrdelhoeqhsdifrarn.supabase.co/functions/v1/nutrition-queue-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) AS response;
