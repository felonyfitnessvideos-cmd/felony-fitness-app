/**
 * @file create-pipeline-status-trigger.sql
 * @description Create trigger to automatically update nutrition_pipeline_status
 * @date 2025-11-17
 * 
 * This will automatically refresh the pipeline status whenever food_servings changes
 */

-- Drop existing function and triggers if they exist
DROP TRIGGER IF EXISTS trigger_refresh_pipeline_on_insert ON food_servings;
DROP TRIGGER IF EXISTS trigger_refresh_pipeline_on_update ON food_servings;
DROP TRIGGER IF EXISTS trigger_refresh_pipeline_on_delete ON food_servings;
DROP TRIGGER IF EXISTS trigger_refresh_pipeline_on_queue_change ON nutrition_enrichment_queue;
DROP FUNCTION IF EXISTS refresh_pipeline_status();

-- Create function to refresh pipeline status
CREATE FUNCTION refresh_pipeline_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old status
  DELETE FROM nutrition_pipeline_status;
  
  -- Insert fresh status with current data
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on food_servings INSERT
CREATE TRIGGER trigger_refresh_pipeline_on_insert
AFTER INSERT ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

-- Create trigger on food_servings UPDATE
CREATE TRIGGER trigger_refresh_pipeline_on_update
AFTER UPDATE ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

-- Create trigger on food_servings DELETE
CREATE TRIGGER trigger_refresh_pipeline_on_delete
AFTER DELETE ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

-- Also create trigger on nutrition_enrichment_queue for queue_size changes
CREATE TRIGGER trigger_refresh_pipeline_on_queue_change
AFTER INSERT OR UPDATE OR DELETE ON nutrition_enrichment_queue
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

-- Test: Verify triggers are created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE 'trigger_refresh_pipeline%'
ORDER BY event_object_table, trigger_name;
