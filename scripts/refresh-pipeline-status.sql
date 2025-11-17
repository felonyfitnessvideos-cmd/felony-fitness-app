/**
 * @file refresh-pipeline-status.sql
 * @description Update nutrition_pipeline_status with real-time data from food_servings
 * @date 2025-11-17
 * 
 * Run this whenever you add new foods or want to refresh the pipeline dashboard stats
 */

-- First, check if the table exists and has data
SELECT * FROM nutrition_pipeline_status LIMIT 1;

-- Delete all existing rows (this table should only have one status row)
DELETE FROM nutrition_pipeline_status;

-- Insert fresh pipeline status with current data
INSERT INTO nutrition_pipeline_status (
  total_foods,
  total_verified,
  total_pending,
  foods_below_threshold,
  average_quality_score,
  queue_size,
  last_updated
)
SELECT 
  (SELECT COUNT(*) FROM food_servings),
  (SELECT COUNT(*) FROM food_servings WHERE quality_score >= 70),
  (SELECT COUNT(*) FROM food_servings WHERE quality_score < 70 OR quality_score IS NULL),
  (SELECT COUNT(*) FROM food_servings WHERE quality_score < 70),
  (SELECT COALESCE(AVG(quality_score), 0) FROM food_servings WHERE quality_score > 0),
  (SELECT COUNT(*) FROM nutrition_enrichment_queue WHERE status = 'pending'),
  NOW();

-- Verify the update
SELECT 
  total_foods,
  total_verified,
  total_pending,
  foods_below_threshold,
  average_quality_score,
  queue_size,
  last_updated
FROM nutrition_pipeline_status
LIMIT 1;
