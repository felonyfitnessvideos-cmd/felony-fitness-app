/**
 * @file supabase/functions/nutrition-enrichment/index.ts
 * @description Automated Data Quality and Enrichment Pipeline
 * 
 * FEATURES:
 * 1. Real-time data validation and enrichment
 * 2. Missing data completion using AI
 * 3. Nutritional consistency checking  
 * 4. Automatic categorization improvement
 * 5. Data quality scoring and updates
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface EnrichmentRequest {
  food_id?: number;
  food_data?: any;
  enrichment_type: 'validate' | 'complete' | 'categorize' | 'full';
}

interface EnrichmentResult {
  original_data: any;
  enriched_data: any;
  changes_made: string[];
  quality_score: number;
  confidence: number;
  recommendations: string[];
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

    if (!response.ok) return foodData;

    const aiData = await response.json();
    const completedData = JSON.parse(aiData.choices[0].message.content);

    // Merge with original data, only replacing null/undefined values
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
    return foodData;
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

  // Unrealistic values validation
  if (foodData.protein && foodData.protein > 100) {
    issues.push('Protein content seems unrealistically high');
  }

  if (foodData.calories && foodData.calories > 2000) {
    issues.push('Calorie content seems unrealistically high for a single serving');
  }

  return {
    isValid: issues.length === 0,
    issues,
    corrections
  };
}

/**
 * Smart Category Enhancement
 */
async function enhanceCategory(foodData: any): Promise<{ category: string; confidence: number; reasoning: string }> {
  try {
    const prompt = `You are a food categorization expert. Analyze this food and determine the most appropriate category.

Food: ${foodData.food_name} ${foodData.brand_name ? `(${foodData.brand_name})` : ''}
Current category: ${foodData.category || 'Unknown'}

Available categories:
- Vegetables
- Fruits  
- Meat & Poultry
- Seafood
- Dairy & Eggs
- Grains, Bread & Pasta
- Protein & Supplements
- Beverages
- Breakfast & Cereals
- Desserts & Sweets

Rules:
1. Categorize by PRIMARY ingredient, not preparation method
2. If mixed dish, choose category of main component
3. If supplements/protein powder, use "Protein & Supplements"

Return JSON:
{
  "category": "most appropriate category",
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
        temperature: 0.2,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      return { category: foodData.category || 'Other', confidence: 50, reasoning: 'AI categorization failed' };
    }

    const aiData = await response.json();
    return JSON.parse(aiData.choices[0].message.content);

  } catch (error) {
    console.error('AI categorization error:', error);
    return { category: foodData.category || 'Other', confidence: 50, reasoning: 'Error occurred' };
  }
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
 * Main Enrichment Handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { food_id, food_data, enrichment_type = 'full' }: EnrichmentRequest = await req.json();
    
    if (!food_id && !food_data) {
      throw new Error("Either food_id or food_data is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let originalData = food_data;
    
    // If food_id provided, fetch from database
    if (food_id && !food_data) {
      const { data, error } = await supabaseAdmin
        .from('food_servings')
        .select('*')
        .eq('id', food_id)
        .single();
      
      if (error || !data) {
        throw new Error(`Food not found: ${error?.message || 'Unknown error'}`);
      }
      
      originalData = data;
    }

    console.log(`Enriching food: ${originalData.food_name} (type: ${enrichment_type})`);

    const result: EnrichmentResult = {
      original_data: originalData,
      enriched_data: { ...originalData },
      changes_made: [],
      quality_score: 0,
      confidence: 0,
      recommendations: []
    };

    // Step 1: Complete missing data (if requested)
    if (enrichment_type === 'complete' || enrichment_type === 'full') {
      const completedData = await completeNutritionData(originalData);
      
      Object.keys(completedData).forEach(key => {
        if (originalData[key] !== completedData[key] && key !== 'ai_completion_confidence' && key !== 'ai_reasoning') {
          result.changes_made.push(`Completed ${key}: ${originalData[key]} → ${completedData[key]}`);
          result.enriched_data[key] = completedData[key];
        }
      });
      
      result.confidence = completedData.ai_completion_confidence || 0;
      if (completedData.ai_reasoning) {
        result.recommendations.push(`AI completion: ${completedData.ai_reasoning}`);
      }
    }

    // Step 2: Validate consistency (if requested)
    if (enrichment_type === 'validate' || enrichment_type === 'full') {
      const validation = validateNutritionalConsistency(result.enriched_data);
      
      if (!validation.isValid) {
        Object.keys(validation.corrections).forEach(key => {
          result.changes_made.push(`Corrected ${key}: ${result.enriched_data[key]} → ${validation.corrections[key]}`);
          result.enriched_data[key] = validation.corrections[key];
        });
        
        result.recommendations.push(...validation.issues);
      }
    }

    // Step 3: Enhance categorization (if requested)
    if (enrichment_type === 'categorize' || enrichment_type === 'full') {
      const categoryResult = await enhanceCategory(result.enriched_data);
      
      if (categoryResult.category !== originalData.category) {
        result.changes_made.push(`Updated category: ${originalData.category} → ${categoryResult.category}`);
        result.enriched_data.category = categoryResult.category;
        result.recommendations.push(`Category: ${categoryResult.reasoning}`);
      }
    }

    // Step 4: Calculate quality score
    const validation = validateNutritionalConsistency(result.enriched_data);
    result.quality_score = calculateQualityScore(result.enriched_data, validation, result.confidence);

    // Step 5: Update database if food_id provided and changes were made
    if (food_id && result.changes_made.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('food_servings')
        .update({
          ...result.enriched_data,
          quality_score: result.quality_score,
          last_enrichment: new Date().toISOString()
        })
        .eq('id', food_id);

      if (updateError) {
        console.error('Database update error:', updateError);
        result.recommendations.push('Failed to update database');
      } else {
        result.recommendations.push('Database updated successfully');
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Enrichment error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});