-- Re-enable triggers and ensure RLS is properly configured
-- This fixes the issue by disabling RLS on nutrition_pipeline_status

-- First, disable RLS on the cache table (it's a single-row cache, no need for RLS)
ALTER TABLE nutrition_pipeline_status DISABLE ROW LEVEL SECURITY;

-- Re-enable the triggers now that RLS is disabled
ALTER TABLE food_servings ENABLE TRIGGER trigger_refresh_pipeline_on_insert;
ALTER TABLE food_servings ENABLE TRIGGER trigger_refresh_pipeline_on_update;
ALTER TABLE food_servings ENABLE TRIGGER trigger_refresh_pipeline_on_delete;

-- Test by refreshing the status
DELETE FROM nutrition_pipeline_status;
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

SELECT 'Triggers re-enabled and RLS disabled on nutrition_pipeline_status' as status;
SELECT * FROM nutrition_pipeline_status;
