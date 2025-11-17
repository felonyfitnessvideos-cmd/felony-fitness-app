-- Temporary workaround: Disable triggers on food_servings
-- This will let you test food logging while we debug the RLS issue

ALTER TABLE food_servings DISABLE TRIGGER trigger_refresh_pipeline_on_insert;
ALTER TABLE food_servings DISABLE TRIGGER trigger_refresh_pipeline_on_update;
ALTER TABLE food_servings DISABLE TRIGGER trigger_refresh_pipeline_on_delete;

SELECT 'Triggers disabled - you can now log foods. Run refresh-pipeline-status.sql manually to update stats.' as status;
