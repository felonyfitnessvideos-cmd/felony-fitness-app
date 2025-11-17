/**
 * @file supabase/functions/nutrition-queue-worker/index.ts
 * @description Automatic nutrition enrichment queue worker
 * 
 * FEATURES:
 * 1. Processes 5 foods at a time (rate-limit friendly)
 * 2. Sequential processing with delays to avoid API limits
 * 3. Automatic retry on failures
 * 4. Progress tracking and logging
 * 5. Designed to run every 5 minutes via pg_cron
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const BATCH_SIZE = 5;
const DELAY_BETWEEN_REQUESTS_MS = 2000; // 2 seconds between each food

interface WorkerResult {
  processed: number;
  successful: number;
  failed: number;
  remaining: number;
  errors: Array<{ food_id: number; food_name: string; error: string }>;
}

/**
 * AI-Powered Missing Data Completion
 */
async function completeNutritionData(foodData: any): Promise<any> {
  try {
    const prompt = `You are a nutrition expert. Complete the missing nutritional information for this food item based on typical values for similar foods.

Food: ${foodData.food_name} ${foodData.brand_name ? `(${foodData.brand_name})` : ''}
Current data:
- Calories: ${foodData.calories || 'MISSING'}
- Protein: ${foodData.protein || 'MISSING'}g
- Carbs: ${foodData.carbs || 'MISSING'}g  
- Fat: ${foodData.fat || 'MISSING'}g
- Fiber: ${foodData.fiber || 'MISSING'}g
- Sugar: ${foodData.sugar || 'MISSING'}g
- Sodium: ${foodData.sodium || 'MISSING'}mg
- Serving: ${foodData.serving_description || 'MISSING'}

Rules:
1. Only fill in MISSING values with realistic estimates
2. Ensure calories ≈ (4×carbs + 4×protein + 9×fat)
3. Fiber should be ≤ total carbs
4. Sugar should be ≤ total carbs
5. Values should be realistic for the serving size

Return JSON with completed values:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "serving_description": "string",
  "confidence": number (0-100),
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    const completedData = JSON.parse(aiData.choices[0].message.content);

    // Merge with original data
    const enriched = { ...foodData };
    
    Object.keys(completedData).forEach(key => {
      if (key !== 'confidence' && key !== 'reasoning' && (foodData[key] === null || foodData[key] === undefined || foodData[key] === 0)) {
        enriched[key] = completedData[key];
      }
    });

    return {
      ...enriched,
      ai_completion_confidence: completedData.confidence,
      ai_reasoning: completedData.reasoning
    };

  } catch (error) {
    console.error('AI completion error:', error);
    throw error;
  }
}

/**
 * Nutritional Consistency Validation
 */
function validateNutritionalConsistency(foodData: any): { isValid: boolean; issues: string[]; corrections: any } {
  const issues: string[] = [];
  const corrections: any = {};

  // Calculate expected calories
  const calculatedCalories = (foodData.protein || 0) * 4 + (foodData.carbs || 0) * 4 + (foodData.fat || 0) * 9;
  const caloriesDiff = Math.abs((foodData.calories || 0) - calculatedCalories);
  
  if (caloriesDiff > calculatedCalories * 0.2) { // More than 20% difference
    issues.push(`Calorie calculation mismatch: stated ${foodData.calories}, calculated ${calculatedCalories.toFixed(0)}`);
    corrections.calories = Math.round(calculatedCalories);
  }

  // Fiber validation
  if (foodData.fiber && foodData.carbs && foodData.fiber > foodData.carbs) {
    issues.push('Fiber cannot exceed total carbohydrates');
    corrections.fiber = Math.min(foodData.fiber, foodData.carbs);
  }

  // Sugar validation
  if (foodData.sugar && foodData.carbs && foodData.sugar > foodData.carbs) {
    issues.push('Sugar cannot exceed total carbohydrates');
    corrections.sugar = Math.min(foodData.sugar, foodData.carbs);
  }

  return {
    isValid: issues.length === 0,
    issues,
    corrections
  };
}

/**
 * Calculate Overall Data Quality Score
 */
function calculateQualityScore(foodData: any, validationResult: any, completionConfidence: number): number {
  let score = 0;

  // Completeness (40 points)
  const fields = ['calories', 'protein', 'carbs', 'fat'];
  const optionalFields = ['fiber', 'sugar', 'sodium'];
  
  const completeFields = fields.filter(field => foodData[field] !== null && foodData[field] !== undefined && foodData[field] !== 0);
  const completeOptionalFields = optionalFields.filter(field => foodData[field] !== null && foodData[field] !== undefined);
  
  score += (completeFields.length / fields.length) * 30;
  score += (completeOptionalFields.length / optionalFields.length) * 10;

  // Consistency (30 points)
  if (validationResult.isValid) {
    score += 30;
  } else {
    score += Math.max(0, 30 - validationResult.issues.length * 10);
  }

  // Source reliability (20 points)
  if (foodData.source === 'USDA') score += 20;
  else if (foodData.source === 'NutritionX') score += 18;
  else score += 10;

  // AI completion confidence (10 points)
  score += (completionConfidence / 100) * 10;

  return Math.min(100, Math.round(score));
}

/**
 * Process a single food item
 */
async function processSingleFood(supabaseAdmin: any, food: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Processing: ${food.food_name} (ID: ${food.id})`);

    // Mark as processing
    await supabaseAdmin
      .from('food_servings')
      .update({ enrichment_status: 'processing' })
      .eq('id', food.id);

    // Complete nutrition data with AI
    const completedData = await completeNutritionData(food);
    
    // Validate consistency
    const validation = validateNutritionalConsistency(completedData);
    
    // Apply corrections
    const finalData = { ...completedData, ...validation.corrections };
    
    // Calculate quality score
    const qualityScore = calculateQualityScore(
      finalData,
      validation,
      completedData.ai_completion_confidence || 0
    );

    // Update database
    const { error: updateError } = await supabaseAdmin
      .from('food_servings')
      .update({
        calories: finalData.calories,
        protein: finalData.protein,
        carbs: finalData.carbs,
        fat: finalData.fat,
        fiber: finalData.fiber,
        sugar: finalData.sugar,
        sodium: finalData.sodium,
        serving_description: finalData.serving_description,
        quality_score: qualityScore,
        enrichment_status: 'completed',
        last_enrichment: new Date().toISOString()
      })
      .eq('id', food.id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✓ Completed: ${food.food_name} (Quality: ${qualityScore}%)`);
    return { success: true };

  } catch (error) {
    console.error(`✗ Failed: ${food.food_name}`, error);
    
    // Mark as failed in database
    await supabaseAdmin
      .from('food_servings')
      .update({ 
        enrichment_status: 'failed',
        last_enrichment: new Date().toISOString()
      })
      .eq('id', food.id);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main Queue Worker Handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Nutrition Queue Worker Started ===');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get foods that need enrichment (quality_score < 70 or null, not currently processing)
    const { data: foods, error: fetchError } = await supabaseAdmin
      .from('food_servings')
      .select('id, food_name, brand_name, calories, protein, carbs, fat, fiber, sugar, sodium, serving_description, source, quality_score')
      .or('quality_score.lt.70,quality_score.is.null')
      .neq('enrichment_status', 'processing')
      .order('quality_score', { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Failed to fetch foods: ${fetchError.message}`);
    }

    if (!foods || foods.length === 0) {
      console.log('✓ No foods need enrichment - queue is empty!');
      return new Response(JSON.stringify({
        success: true,
        message: 'No foods need enrichment',
        processed: 0,
        remaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log(`Found ${foods.length} foods to process`);

    const result: WorkerResult = {
      processed: 0,
      successful: 0,
      failed: 0,
      remaining: 0,
      errors: []
    };

    // Process foods sequentially with delays
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      
      const processResult = await processSingleFood(supabaseAdmin, food);
      result.processed++;

      if (processResult.success) {
        result.successful++;
      } else {
        result.failed++;
        result.errors.push({
          food_id: food.id,
          food_name: food.food_name,
          error: processResult.error || 'Unknown error'
        });
      }

      // Delay between requests (except after the last one)
      if (i < foods.length - 1) {
        console.log(`Waiting ${DELAY_BETWEEN_REQUESTS_MS}ms before next request...`);
        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    // Get remaining count
    const { count: remainingCount } = await supabaseAdmin
      .from('food_servings')
      .select('id', { count: 'exact', head: true })
      .or('quality_score.lt.70,quality_score.is.null')
      .neq('enrichment_status', 'processing');

    result.remaining = remainingCount || 0;

    console.log('=== Queue Worker Completed ===');
    console.log(`Processed: ${result.processed}, Successful: ${result.successful}, Failed: ${result.failed}, Remaining: ${result.remaining}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Queue worker error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
