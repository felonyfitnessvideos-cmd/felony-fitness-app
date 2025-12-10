-- Add food_id column to nutrition_logs table
-- This allows nutrition_logs to reference the new foods table

ALTER TABLE public.nutrition_logs 
ADD COLUMN IF NOT EXISTS food_id bigint REFERENCES public.foods(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_food_id ON public.nutrition_logs(food_id);

-- Add comment
COMMENT ON COLUMN public.nutrition_logs.food_id IS 'Reference to foods table (bigint USDA FDC ID). Replaces food_serving_id.';
