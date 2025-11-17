/**
 * @file check-enrichment-status.sql
 * @description Check the status of nutrition enrichment queue and processing
 * @date 2025-11-17
 */

-- Check enrichment queue status distribution
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM nutrition_enrichment_queue
GROUP BY status
ORDER BY status;

-- Check food_servings enrichment status
SELECT 
  enrichment_status,
  COUNT(*) as count,
  AVG(quality_score) as avg_quality_score,
  MIN(quality_score) as min_quality_score,
  MAX(quality_score) as max_quality_score
FROM food_servings
WHERE enrichment_status IS NOT NULL
GROUP BY enrichment_status
ORDER BY enrichment_status;

-- Check recently enriched foods
SELECT 
  id,
  food_name,
  quality_score,
  enrichment_status,
  last_enrichment
FROM food_servings
WHERE last_enrichment IS NOT NULL
ORDER BY last_enrichment DESC
LIMIT 20;

-- Check foods with pending status
SELECT 
  COUNT(*) as pending_count
FROM food_servings
WHERE enrichment_status = 'pending';

-- Check foods that were supposed to be enriched today
SELECT 
  COUNT(*) as processed_today
FROM food_servings
WHERE DATE(last_enrichment) = CURRENT_DATE;
