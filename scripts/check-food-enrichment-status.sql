-- Quick check of food_servings enrichment status

SELECT 
    COUNT(*) as total_foods,
    COUNT(CASE WHEN enrichment_status = 'enriched' THEN 1 END) as enriched,
    COUNT(CASE WHEN enrichment_status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN enrichment_status = 'failed' THEN 1 END) as failed,
    ROUND(AVG(quality_score)::numeric, 2) as avg_quality,
    COUNT(CASE WHEN quality_score >= 70 THEN 1 END) as high_quality,
    ROUND((COUNT(CASE WHEN enrichment_status = 'enriched' THEN 1 END)::numeric / COUNT(*)::numeric * 100), 1) as pct_enriched
FROM food_servings;

-- Show recent enrichment activity
SELECT 
    food_name,
    enrichment_status,
    quality_score,
    last_enriched_at
FROM food_servings
WHERE enrichment_status = 'enriched'
ORDER BY last_enriched_at DESC
LIMIT 10;
