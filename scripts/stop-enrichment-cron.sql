/**
 * @file stop-enrichment-cron.sql
 * @description Stop the automatic nutrition enrichment queue worker
 * @date 2025-11-17
 * 
 * Run this when you want to stop automatic enrichment processing
 * (e.g., when all foods are enriched or you want to pause)
 */

-- Unschedule the nutrition enrichment worker
SELECT cron.unschedule('nutrition-enrichment-worker');

-- Verify it's been removed
SELECT * FROM cron.job WHERE jobname = 'nutrition-enrichment-worker';
-- Should return 0 rows if successfully removed
