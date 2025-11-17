/**
 * @file fix-pipeline-trigger-rls.sql
 * @description Fix trigger to bypass RLS when updating pipeline status
 * @date 2025-11-17
 * 
 * ISSUE: DELETE requires WHERE clause due to RLS policies
 * FIX: Add SECURITY DEFINER to run trigger as function owner (bypasses RLS)
 */

-- Drop and recreate function with SECURITY DEFINER
DROP FUNCTION IF EXISTS refresh_pipeline_status() CASCADE;

CREATE FUNCTION refresh_pipeline_status()
RETURNS TRIGGER 
SECURITY DEFINER  -- This makes the function run with owner's permissions, bypassing RLS
SET search_path = public
AS $$
BEGIN
  -- Delete old status (now bypasses RLS)
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

-- Recreate all triggers (CASCADE above dropped them)
CREATE TRIGGER trigger_refresh_pipeline_on_insert
AFTER INSERT ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

CREATE TRIGGER trigger_refresh_pipeline_on_update
AFTER UPDATE ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

CREATE TRIGGER trigger_refresh_pipeline_on_delete
AFTER DELETE ON food_servings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

CREATE TRIGGER trigger_refresh_pipeline_on_queue_change
AFTER INSERT OR UPDATE OR DELETE ON nutrition_enrichment_queue
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_pipeline_status();

-- Verify triggers recreated
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'trigger_refresh_pipeline%'
ORDER BY event_object_table, trigger_name;

-- Test the fix by inserting a dummy food
SELECT 'Testing trigger...' as status;
