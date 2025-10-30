-- Database Triggers for Automated Nutrition Pipeline
-- File: supabase/migrations/20250130000000_nutrition_pipeline_triggers.sql

-- Add quality tracking columns to foods table
ALTER TABLE foods 
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_enrichment TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS data_sources TEXT[] DEFAULT '{}';

-- Create nutrition enrichment queue table
CREATE TABLE IF NOT EXISTS nutrition_enrichment_queue (
    id SERIAL PRIMARY KEY,
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    enrichment_type TEXT NOT NULL DEFAULT 'full',
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status_priority 
ON nutrition_enrichment_queue(status, priority DESC, created_at);

-- Function to calculate basic quality score
CREATE OR REPLACE FUNCTION calculate_basic_quality_score(food_row foods)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    field_count INTEGER := 0;
BEGIN
    -- Count non-null essential fields
    IF food_row.calories IS NOT NULL AND food_row.calories > 0 THEN
        field_count := field_count + 1;
    END IF;
    
    IF food_row.protein_g IS NOT NULL AND food_row.protein_g >= 0 THEN
        field_count := field_count + 1;
    END IF;
    
    IF food_row.carbs_g IS NOT NULL AND food_row.carbs_g >= 0 THEN
        field_count := field_count + 1;
    END IF;
    
    IF food_row.fat_g IS NOT NULL AND food_row.fat_g >= 0 THEN
        field_count := field_count + 1;
    END IF;
    
    -- Base score from completeness (60% weight)
    score := (field_count * 15);
    
    -- Bonus for optional fields (20% weight)
    IF food_row.fiber_g IS NOT NULL THEN score := score + 5; END IF;
    IF food_row.sugar_g IS NOT NULL THEN score := score + 5; END IF;
    IF food_row.sodium_mg IS NOT NULL THEN score := score + 5; END IF;
    IF food_row.serving_description IS NOT NULL THEN score := score + 5; END IF;
    
    -- Source reliability bonus (20% weight)
    IF food_row.source = 'USDA' THEN
        score := score + 20;
    ELSIF food_row.source = 'NutritionX' THEN
        score := score + 18;
    ELSIF food_row.source IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- Function to detect foods needing enrichment
CREATE OR REPLACE FUNCTION needs_enrichment(food_row foods)
RETURNS BOOLEAN AS $$
BEGIN
    -- Need enrichment if quality score is low
    IF COALESCE(food_row.quality_score, 0) < 70 THEN
        RETURN TRUE;
    END IF;
    
    -- Need enrichment if missing essential data
    IF food_row.calories IS NULL OR food_row.calories = 0 THEN
        RETURN TRUE;
    END IF;
    
    IF food_row.protein_g IS NULL OR food_row.carbs_g IS NULL OR food_row.fat_g IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Need enrichment if no category
    IF food_row.category IS NULL OR food_row.category = '' THEN
        RETURN TRUE;
    END IF;
    
    -- Need enrichment if never been enriched
    IF food_row.last_enrichment IS NULL THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for new/updated foods
CREATE OR REPLACE FUNCTION trigger_nutrition_enrichment()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate basic quality score
    NEW.quality_score := calculate_basic_quality_score(NEW);
    
    -- If this is an insert or the food needs enrichment, queue it
    IF TG_OP = 'INSERT' OR needs_enrichment(NEW) THEN
        -- Determine enrichment type based on what's missing
        DECLARE
            enrich_type TEXT := 'full';
            priority INTEGER := 5;
        BEGIN
            -- High priority for foods with no nutritional data
            IF NEW.calories IS NULL OR NEW.calories = 0 THEN
                priority := 1;
                enrich_type := 'complete';
            -- Medium priority for incomplete data
            ELSIF NEW.protein_g IS NULL OR NEW.carbs_g IS NULL OR NEW.fat_g IS NULL THEN
                priority := 3;
                enrich_type := 'complete';
            -- Lower priority for validation/categorization
            ELSIF NEW.category IS NULL OR NEW.quality_score < 80 THEN
                priority := 7;
                enrich_type := 'validate';
            END IF;
            
            -- Add to enrichment queue (avoid duplicates)
            INSERT INTO nutrition_enrichment_queue (food_id, enrichment_type, priority)
            VALUES (NEW.id, enrich_type, priority)
            ON CONFLICT DO NOTHING;
            
            -- Update enrichment status
            NEW.enrichment_status := 'queued';
        END;
    ELSE
        NEW.enrichment_status := 'complete';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS foods_enrichment_trigger ON foods;
CREATE TRIGGER foods_enrichment_trigger
    BEFORE INSERT OR UPDATE ON foods
    FOR EACH ROW
    EXECUTE FUNCTION trigger_nutrition_enrichment();

-- Function to process enrichment queue (called by cron job or external process)
CREATE OR REPLACE FUNCTION process_enrichment_queue(batch_size INTEGER DEFAULT 10)
RETURNS TABLE(
    processed_count INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    message TEXT
) AS $$
DECLARE
    queue_item RECORD;
    success_cnt INTEGER := 0;
    error_cnt INTEGER := 0;
    processed_cnt INTEGER := 0;
BEGIN
    -- Process pending items in priority order
    FOR queue_item IN 
        SELECT * FROM nutrition_enrichment_queue 
        WHERE status = 'pending' AND attempts < 3
        ORDER BY priority ASC, created_at ASC
        LIMIT batch_size
    LOOP
        BEGIN
            processed_cnt := processed_cnt + 1;
            
            -- Update status to processing
            UPDATE nutrition_enrichment_queue 
            SET status = 'processing', attempts = attempts + 1
            WHERE id = queue_item.id;
            
            -- Here we would call the enrichment function
            -- For now, we'll mark as success and update the food
            UPDATE foods 
            SET enrichment_status = 'processing'
            WHERE id = queue_item.food_id;
            
            -- Mark as completed (in real implementation, this would be done by the enrichment service)
            UPDATE nutrition_enrichment_queue
            SET status = 'completed', processed_at = NOW()
            WHERE id = queue_item.id;
            
            UPDATE foods 
            SET enrichment_status = 'complete', last_enrichment = NOW()
            WHERE id = queue_item.food_id;
            
            success_cnt := success_cnt + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Mark as failed
            UPDATE nutrition_enrichment_queue
            SET status = 'failed', 
                error_message = SQLERRM,
                processed_at = NOW()
            WHERE id = queue_item.id;
            
            error_cnt := error_cnt + 1;
        END;
    END LOOP;
    
    RETURN QUERY SELECT 
        processed_cnt,
        success_cnt, 
        error_cnt,
        format('Processed %s items: %s success, %s errors', processed_cnt, success_cnt, error_cnt);
END;
$$ LANGUAGE plpgsql;

-- Function to get enrichment queue status
CREATE OR REPLACE FUNCTION get_enrichment_status()
RETURNS TABLE(
    status TEXT,
    count BIGINT,
    avg_priority NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.status,
        COUNT(*),
        ROUND(AVG(q.priority), 2)
    FROM nutrition_enrichment_queue q
    GROUP BY q.status
    ORDER BY 
        CASE q.status 
            WHEN 'pending' THEN 1
            WHEN 'processing' THEN 2
            WHEN 'completed' THEN 3
            WHEN 'failed' THEN 4
            ELSE 5
        END;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed enrichments
CREATE OR REPLACE FUNCTION retry_failed_enrichments()
RETURNS INTEGER AS $$
DECLARE
    retry_count INTEGER;
BEGIN
    UPDATE nutrition_enrichment_queue
    SET status = 'pending', 
        attempts = 0,
        error_message = NULL,
        processed_at = NULL
    WHERE status = 'failed' AND attempts < 3;
    
    GET DIAGNOSTICS retry_count = ROW_COUNT;
    RETURN retry_count;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for enrichment queue
ALTER TABLE nutrition_enrichment_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to enrichment queue"
ON nutrition_enrichment_queue
FOR ALL
TO service_role
USING (true);

-- Create view for monitoring enrichment status
CREATE OR REPLACE VIEW nutrition_pipeline_status AS
SELECT 
    'Foods needing enrichment' as metric,
    COUNT(*) as value
FROM foods 
WHERE needs_enrichment(foods.*)
UNION ALL
SELECT 
    'Queue status: ' || status,
    COUNT(*)
FROM nutrition_enrichment_queue
GROUP BY status
UNION ALL
SELECT 
    'Average quality score',
    ROUND(AVG(quality_score))::BIGINT
FROM foods 
WHERE quality_score IS NOT NULL;

-- Grant necessary permissions
GRANT SELECT ON nutrition_pipeline_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_enrichment_status() TO authenticated;
GRANT EXECUTE ON FUNCTION process_enrichment_queue(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION retry_failed_enrichments() TO service_role;