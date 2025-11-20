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

Food: ${foodData.food_name} ${foodData.brand ? `(${foodData.brand})` : ''}
Current data:
- Calories: ${foodData.calories || 'MISSING'}
- Protein: ${foodData.protein_g || 'MISSING'}g
- Carbs: ${foodData.carbs_g || 'MISSING'}g  
- Fat: ${foodData.fat_g || 'MISSING'}g
- Fiber: ${foodData.fiber_g || 'MISSING'}g
- Sugar: ${foodData.sugar_g || 'MISSING'}g
- Sodium: ${foodData.sodium_mg || 'MISSING'}mg
- Serving: ${foodData.serving_description || 'MISSING'}

Rules:
1. Only fill in MISSING values with realistic estimates
2. Ensure calories ≈ (4×carbs + 4×protein + 9×fat)
3. Fiber should be ≤ total carbs
4. Sugar should be ≤ total carbs
5. Values should be realistic for the serving size

Return ONLY a valid JSON object (no markdown, no code blocks, no formatting):
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
      console.error(`OpenAI API failed: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    
    // Validate response structure
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(aiData));
      throw new Error('Invalid OpenAI response structure');
    }
    
    const messageContent = aiData.choices[0].message.content;
    console.log('OpenAI response:', messageContent);
    
    // Clean up markdown code blocks if present
    let cleanContent = messageContent.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const completedData = JSON.parse(cleanContent);

    // Merge with original data - map AI field names to database column names
    const enriched = { ...foodData };
    
    // Map AI response fields to database columns
    const fieldMapping: { [key: string]: string } = {
      'calories': 'calories',
      'protein': 'protein_g',
      'carbs': 'carbs_g',
      'fat': 'fat_g',
      'fiber': 'fiber_g',
      'sugar': 'sugar_g',
      'sodium': 'sodium_mg',
      'serving_description': 'serving_description'
    };
    
    Object.keys(completedData).forEach(key => {
      if (key !== 'confidence' && key !== 'reasoning') {
        const dbColumn = fieldMapping[key] || key;
        // Only update if the original value is null or undefined (not 0, as 0 is valid)
        if (foodData[dbColumn] === null || foodData[dbColumn] === undefined) {
          enriched[dbColumn] = completedData[key];
        }
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
  const calculatedCalories = (foodData.protein_g || 0) * 4 + (foodData.carbs_g || 0) * 4 + (foodData.fat_g || 0) * 9;
  const caloriesDiff = Math.abs((foodData.calories || 0) - calculatedCalories);
  
  if (caloriesDiff > calculatedCalories * 0.2) { // More than 20% difference
    issues.push(`Calorie calculation mismatch: stated ${foodData.calories}, calculated ${calculatedCalories.toFixed(0)}`);
    corrections.calories = Math.round(calculatedCalories);
  }

  // Fiber validation
  if (foodData.fiber_g && foodData.carbs_g && foodData.fiber_g > foodData.carbs_g) {
    issues.push('Fiber cannot exceed total carbohydrates');
    corrections.fiber_g = Math.min(foodData.fiber_g, foodData.carbs_g);
  }

  // Sugar validation
  if (foodData.sugar_g && foodData.carbs_g && foodData.sugar_g > foodData.carbs_g) {
    issues.push('Sugar cannot exceed total carbohydrates');
    corrections.sugar_g = Math.min(foodData.sugar_g, foodData.carbs_g);
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
  // Check for presence of required fields (0 is valid - supplements can have 0 calories)
  const fields = ['calories', 'protein_g', 'carbs_g', 'fat_g'];
  const optionalFields = ['fiber_g', 'sugar_g', 'sodium_mg'];
  
  const completeFields = fields.filter(field => foodData[field] !== null && foodData[field] !== undefined);
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

    // Update database - ensure NO null values after enrichment
    console.log(`Updating food ID: ${food.id} with quality score: ${qualityScore}`);
    
    const updateData = {
      // Core macros (from AI)
      calories: finalData.calories ?? 0,
      protein_g: finalData.protein_g ?? 0,
      carbs_g: finalData.carbs_g ?? 0,
      fat_g: finalData.fat_g ?? 0,
      fiber_g: finalData.fiber_g ?? 0,
      sugar_g: finalData.sugar_g ?? 0,
      sodium_mg: finalData.sodium_mg ?? 0,
      serving_description: finalData.serving_description,
      // Micronutrients - set to 0 if not provided (never null after enrichment)
      calcium_mg: finalData.calcium_mg ?? 0,
      iron_mg: finalData.iron_mg ?? 0,
      vitamin_c_mg: finalData.vitamin_c_mg ?? 0,
      vitamin_a_mcg: finalData.vitamin_a_mcg ?? 0,
      vitamin_b12_mcg: finalData.vitamin_b12_mcg ?? 0,
      vitamin_b6_mg: finalData.vitamin_b6_mg ?? 0,
      vitamin_e_mg: finalData.vitamin_e_mg ?? 0,
      vitamin_k_mcg: finalData.vitamin_k_mcg ?? 0,
      potassium_mg: finalData.potassium_mg ?? 0,
      magnesium_mg: finalData.magnesium_mg ?? 0,
      zinc_mg: finalData.zinc_mg ?? 0,
      copper_mg: finalData.copper_mg ?? 0,
      selenium_mcg: finalData.selenium_mcg ?? 0,
      phosphorus_mg: finalData.phosphorus_mg ?? 0,
      folate_mcg: finalData.folate_mcg ?? 0,
      thiamin_mg: finalData.thiamin_mg ?? 0,
      riboflavin_mg: finalData.riboflavin_mg ?? 0,
      niacin_mg: finalData.niacin_mg ?? 0,
      // Enrichment metadata
      quality_score: qualityScore,
      enrichment_status: 'completed',
      last_enrichment: new Date().toISOString()
    };
    
    console.log('Update data:', JSON.stringify(updateData));
    
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('food_servings')
      .update(updateData)
      .eq('id', food.id)
      .select();

    if (updateError) {
      console.error('Update error details:', JSON.stringify(updateError));
      throw new Error(`Database update failed: ${updateError.message} (Code: ${updateError.code}, Details: ${updateError.details})`);
    }
    
    console.log('Update result:', JSON.stringify(updateResult));

    console.log(`✓ Completed: ${food.food_name} (Quality: ${qualityScore}%)`);
    return { success: true };

  } catch (error) {
    console.error(`✗ Failed: ${food.food_name}`, error);
    
    // Determine if this is a temporary or permanent failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTemporaryError = errorMessage.includes('rate limit') || 
                            errorMessage.includes('timeout') || 
                            errorMessage.includes('network') ||
                            errorMessage.includes('503') ||
                            errorMessage.includes('429');
    
    // Mark as failed in database
    // For temporary errors, don't set enrichment_status so it can be retried
    // For permanent errors, mark as 'failed'
    await supabaseAdmin
      .from('food_servings')
      .update({ 
        enrichment_status: isTemporaryError ? null : 'failed',
        last_enrichment: new Date().toISOString()
      })
      .eq('id', food.id);

    return {
      success: false,
      error: errorMessage
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
    
    // Validate OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error('❌ CRITICAL: OPENAI_API_KEY environment variable is not set!');
      return new Response(JSON.stringify({
        error: 'OPENAI_API_KEY is not configured',
        success: false,
        processed: 0,
        remaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    console.log('✓ OpenAI API key found');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get foods that need enrichment
    // Priority: Never-enriched foods (null status) first, then pending, failed, and low-quality foods
    const { data: foods, error: fetchError } = await supabaseAdmin
      .from('food_servings')
      .select('id, food_name, brand, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, serving_description, source, quality_score, enrichment_status')
      .or('enrichment_status.is.null,enrichment_status.eq.pending,enrichment_status.eq.failed,and(quality_score.lt.70,enrichment_status.eq.completed)')
      .neq('enrichment_status', 'processing')
      .order('enrichment_status', { ascending: false, nullsFirst: true }) // null first (never enriched)
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
