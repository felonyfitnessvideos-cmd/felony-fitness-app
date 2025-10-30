-- Nutrition Pipeline Monitoring Views and Functions
-- Supporting database functions for the monitoring dashboard

-- Create enrichment status summary function
DROP FUNCTION IF EXISTS get_enrichment_status();
CREATE OR REPLACE FUNCTION get_enrichment_status()
RETURNS TABLE (
  status text,
  count bigint,
  avg_priority numeric,
  oldest_created timestamptz,
  newest_created timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    neq.status::text,
    COUNT(*) as count,
    AVG(neq.priority)::numeric as avg_priority,
    MIN(neq.created_at) as oldest_created,
    MAX(neq.created_at) as newest_created
  FROM nutrition_enrichment_queue neq
  WHERE neq.created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY neq.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create quality distribution function
CREATE OR REPLACE FUNCTION get_quality_distribution()
RETURNS TABLE (
  quality_range text,
  count bigint,
  avg_score numeric,
  min_score numeric,
  max_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN f.quality_score >= 90 THEN '90-100% (Excellent)'
      WHEN f.quality_score >= 80 THEN '80-89% (Good)'
      WHEN f.quality_score >= 70 THEN '70-79% (Fair)'
      WHEN f.quality_score >= 60 THEN '60-69% (Poor)'
      ELSE '0-59% (Very Poor)'
    END as quality_range,
    COUNT(*) as count,
    AVG(f.quality_score)::numeric as avg_score,
    MIN(f.quality_score)::numeric as min_score,
    MAX(f.quality_score)::numeric as max_score
  FROM foods f
  WHERE f.quality_score IS NOT NULL
  GROUP BY quality_range
  ORDER BY avg_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create pipeline metrics view
CREATE OR REPLACE VIEW nutrition_pipeline_status AS
SELECT 
  'active_searches' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_TIMESTAMP as last_updated
FROM nutrition_enrichment_queue 
WHERE status = 'processing'
AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'

UNION ALL

SELECT 
  'completed_today' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_TIMESTAMP as last_updated
FROM nutrition_enrichment_queue 
WHERE status = 'completed'
AND created_at >= CURRENT_DATE

UNION ALL

SELECT 
  'failed_today' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_TIMESTAMP as last_updated
FROM nutrition_enrichment_queue 
WHERE status = 'failed'
AND created_at >= CURRENT_DATE

UNION ALL

SELECT 
  'pending_items' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_TIMESTAMP as last_updated
FROM nutrition_enrichment_queue 
WHERE status = 'pending'

UNION ALL

SELECT 
  'avg_quality_score' as metric_name,
  ROUND(AVG(quality_score)::numeric, 1) as metric_value,
  CURRENT_TIMESTAMP as last_updated
FROM foods 
WHERE quality_score IS NOT NULL;

-- Create function to get foods needing enrichment
CREATE OR REPLACE FUNCTION get_foods_needing_enrichment(
  quality_threshold integer DEFAULT 70,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  food_id bigint,
  food_name text,
  quality_score numeric,
  enrichment_status text,
  last_enrichment timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as food_id,
    f.name as food_name,
    f.quality_score,
    COALESCE(f.enrichment_status, 'never_enriched')::text as enrichment_status,
    f.last_enrichment,
    f.created_at
  FROM foods f
  WHERE f.quality_score < quality_threshold
    OR f.quality_score IS NULL
    OR f.enrichment_status IS NULL
    OR f.enrichment_status != 'completed'
  ORDER BY 
    COALESCE(f.quality_score, 0) ASC,
    f.last_enrichment ASC NULLS FIRST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get enrichment statistics
CREATE OR REPLACE FUNCTION get_enrichment_statistics(
  days_back integer DEFAULT 7
)
RETURNS TABLE (
  total_foods bigint,
  enriched_foods bigint,
  pending_enrichment bigint,
  failed_enrichment bigint,
  avg_quality_before numeric,
  avg_quality_after numeric,
  improvement_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM foods) as total_foods,
    (SELECT COUNT(*) FROM foods WHERE enrichment_status = 'completed') as enriched_foods,
    (SELECT COUNT(*) FROM nutrition_enrichment_queue WHERE status = 'pending') as pending_enrichment,
    (SELECT COUNT(*) FROM nutrition_enrichment_queue WHERE status = 'failed' AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back) as failed_enrichment,
    (SELECT AVG(quality_score) FROM foods WHERE last_enrichment IS NULL AND quality_score IS NOT NULL)::numeric as avg_quality_before,
    (SELECT AVG(quality_score) FROM foods WHERE last_enrichment IS NOT NULL AND quality_score IS NOT NULL)::numeric as avg_quality_after,
    (
      SELECT 
        CASE 
          WHEN AVG(CASE WHEN last_enrichment IS NULL THEN quality_score END) > 0 
          THEN ROUND(
            ((AVG(CASE WHEN last_enrichment IS NOT NULL THEN quality_score END) - 
              AVG(CASE WHEN last_enrichment IS NULL THEN quality_score END)) /
              AVG(CASE WHEN last_enrichment IS NULL THEN quality_score END) * 100)::numeric, 
            2
          )
          ELSE 0
        END
      FROM foods 
      WHERE quality_score IS NOT NULL
    ) as improvement_percentage;
END;
$$ LANGUAGE plpgsql;

-- Create function to retry failed enrichments
CREATE OR REPLACE FUNCTION retry_failed_enrichments(
  max_retries integer DEFAULT 3,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  food_id bigint,
  retry_count integer,
  status text
) AS $$
BEGIN
  -- Update failed items to pending for retry
  UPDATE nutrition_enrichment_queue
  SET 
    status = 'pending',
    retry_count = COALESCE(retry_count, 0) + 1,
    updated_at = CURRENT_TIMESTAMP,
    error_message = NULL
  WHERE status = 'failed'
    AND COALESCE(retry_count, 0) < max_retries
    AND id IN (
      SELECT id 
      FROM nutrition_enrichment_queue 
      WHERE status = 'failed' 
        AND COALESCE(retry_count, 0) < max_retries
      ORDER BY created_at DESC 
      LIMIT limit_count
    );

  -- Return updated items
  RETURN QUERY
  SELECT 
    neq.food_id,
    neq.retry_count,
    neq.status::text
  FROM nutrition_enrichment_queue neq
  WHERE neq.status = 'pending'
    AND neq.updated_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute'
  ORDER BY neq.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up completed queue items
CREATE OR REPLACE FUNCTION cleanup_completed_queue_items(
  days_old integer DEFAULT 7
)
RETURNS bigint AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM nutrition_enrichment_queue
  WHERE status = 'completed'
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_foods_quality_enrichment 
ON foods(quality_score, enrichment_status, last_enrichment);

CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status_created 
ON nutrition_enrichment_queue(status, created_at);

CREATE INDEX IF NOT EXISTS idx_enrichment_queue_food_status 
ON nutrition_enrichment_queue(food_id, status);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_enrichment_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_quality_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION get_foods_needing_enrichment(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enrichment_statistics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION retry_failed_enrichments(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_completed_queue_items(integer) TO authenticated;

-- Grant access to views
GRANT SELECT ON nutrition_pipeline_status TO authenticated;