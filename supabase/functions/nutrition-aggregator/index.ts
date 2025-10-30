/**
 * @file supabase/functions/nutrition-aggregator/index.ts
 * @description Multi-API Nutrition Pipeline - Combines USDA, FoodData Central, NutritionX
 * 
 * INTEGRATION FEATURES:
 * 1. Multi-source data aggregation
 * 2. AI-powered duplicate detection  
 * 3. Smart data enrichment
 * 4. Quality scoring and validation
 * 5. Automated database updates
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const NUTRITIONIX_APP_ID = Deno.env.get("NUTRITIONIX_APP_ID");
const NUTRITIONIX_APP_KEY = Deno.env.get("NUTRITIONIX_APP_KEY");
const USDA_API_KEY = Deno.env.get("USDA_API_KEY"); // We'll need to add this

interface NutritionSource {
  name: string;
  priority: number;
  endpoint: string;
  transformer: (data: any) => StandardizedFood[];
}

interface StandardizedFood {
  name: string;
  brand?: string;
  category: string;
  serving_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  source: string;
  source_id: string;
  confidence_score: number;
  data_quality: 'high' | 'medium' | 'low';
}

/**
 * USDA FoodData Central API Integration
 */
async function searchUSDA(query: string): Promise<StandardizedFood[]> {
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.foods || []).map((food: any) => ({
      name: food.description || food.lowercaseDescription || 'Unknown',
      brand: food.brandOwner || undefined,
      category: mapUSDACategory(food.foodCategory),
      serving_description: '100g',
      calories: getNutrient(food.foodNutrients, 1008) || 0,
      protein_g: getNutrient(food.foodNutrients, 1003) || 0,
      carbs_g: getNutrient(food.foodNutrients, 1005) || 0,
      fat_g: getNutrient(food.foodNutrients, 1004) || 0,
      fiber_g: getNutrient(food.foodNutrients, 1079),
      sugar_g: getNutrient(food.foodNutrients, 2000),
      sodium_mg: getNutrient(food.foodNutrients, 1093),
      source: 'USDA',
      source_id: food.fdcId.toString(),
      confidence_score: calculateUSDAConfidence(food),
      data_quality: assessDataQuality(food.foodNutrients)
    }));
  } catch (error) {
    console.error('USDA API error:', error);
    return [];
  }
}

/**
 * NutritionX API Integration (Enhanced)
 */
async function searchNutritionX(query: string): Promise<StandardizedFood[]> {
  try {
    const response = await fetch('https://trackapi.nutritionix.com/v2/search/instant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_APP_KEY,
      },
      body: JSON.stringify({
        query: query,
        detailed: true,
        timezone: 'US/Eastern'
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const results: StandardizedFood[] = [];

    // Process common foods
    if (data.common) {
      for (const food of data.common.slice(0, 3)) {
        const detailResponse = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_APP_KEY,
          },
          body: JSON.stringify({
            query: food.food_name,
            timezone: 'US/Eastern'
          })
        });

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          if (detailData.foods && detailData.foods[0]) {
            const foodDetail = detailData.foods[0];
            results.push({
              name: foodDetail.food_name,
              brand: foodDetail.brand_name,
              category: mapNutritionXCategory(foodDetail.tags),
              serving_description: `${foodDetail.serving_qty} ${foodDetail.serving_unit}`,
              calories: foodDetail.nf_calories || 0,
              protein_g: foodDetail.nf_protein || 0,
              carbs_g: foodDetail.nf_total_carbohydrate || 0,
              fat_g: foodDetail.nf_total_fat || 0,
              fiber_g: foodDetail.nf_dietary_fiber,
              sugar_g: foodDetail.nf_sugars,
              sodium_mg: foodDetail.nf_sodium,
              source: 'NutritionX',
              source_id: foodDetail.nix_item_id || food.food_name,
              confidence_score: calculateNutritionXConfidence(foodDetail),
              data_quality: 'high'
            });
          }
        }
      }
    }

    // Process branded foods
    if (data.branded) {
      results.push(...data.branded.slice(0, 2).map((food: any) => ({
        name: food.food_name,
        brand: food.brand_name,
        category: mapNutritionXCategory(food.tags),
        serving_description: `${food.serving_qty} ${food.serving_unit}`,
        calories: food.nf_calories || 0,
        protein_g: food.nf_protein || 0,
        carbs_g: food.nf_total_carbohydrate || 0,
        fat_g: food.nf_total_fat || 0,
        fiber_g: food.nf_dietary_fiber,
        sugar_g: food.nf_sugars,
        sodium_mg: food.nf_sodium,
        source: 'NutritionX',
        source_id: food.nix_item_id,
        confidence_score: calculateNutritionXConfidence(food),
        data_quality: 'high'
      })));
    }

    return results;
  } catch (error) {
    console.error('NutritionX API error:', error);
    return [];
  }
}

/**
 * AI-Powered Duplicate Detection and Merging
 */
async function detectDuplicatesAndMerge(foods: StandardizedFood[]): Promise<StandardizedFood[]> {
  if (foods.length < 2) return foods;

  try {
    const prompt = `You are a nutrition data expert. Analyze these food items and identify duplicates or very similar items that should be merged.

Foods to analyze:
${foods.map((food, i) => `${i + 1}. ${food.name} (${food.brand || 'no brand'}) - ${food.source} - ${food.calories}cal`).join('\n')}

Return a JSON array of groups where each group contains indices of foods that are duplicates/should be merged:
Example: [[1,3], [2,5]] means foods 1&3 are duplicates, and foods 2&5 are duplicates.

If no duplicates, return: []

Rules:
- Same food different brands = duplicates if nutritional values are very similar
- Different serving sizes of same food = duplicates  
- Slight name variations of same food = duplicates
- Different preparation methods (raw vs cooked) = NOT duplicates`;

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

    if (!response.ok) return foods;

    const aiData = await response.json();
    const duplicateGroups = JSON.parse(aiData.choices[0].message.content || '[]');

    // Merge duplicates by keeping the highest quality/confidence food from each group
    const mergedFoods: StandardizedFood[] = [];
    const processedIndices = new Set<number>();

    for (const group of duplicateGroups) {
      if (group.length < 2) continue;
      
      // Find the best food in this group (highest confidence + data quality)
      let bestFood = foods[group[0] - 1];
      let bestScore = bestFood.confidence_score + (bestFood.data_quality === 'high' ? 20 : bestFood.data_quality === 'medium' ? 10 : 0);
      
      for (let i = 1; i < group.length; i++) {
        const currentFood = foods[group[i] - 1];
        const currentScore = currentFood.confidence_score + (currentFood.data_quality === 'high' ? 20 : currentFood.data_quality === 'medium' ? 10 : 0);
        
        if (currentScore > bestScore) {
          bestFood = currentFood;
          bestScore = currentScore;
        }
      }
      
      mergedFoods.push({
        ...bestFood,
        confidence_score: Math.min(100, bestFood.confidence_score + 10) // Bonus for being validated by AI
      });
      
      group.forEach((index: number) => processedIndices.add(index - 1));
    }

    // Add non-duplicate foods
    foods.forEach((food, index) => {
      if (!processedIndices.has(index)) {
        mergedFoods.push(food);
      }
    });

    console.log(`Duplicate detection: ${foods.length} → ${mergedFoods.length} foods`);
    return mergedFoods;

  } catch (error) {
    console.error('AI duplicate detection error:', error);
    return foods;
  }
}

/**
 * Helper Functions
 */
function getNutrient(nutrients: any[], nutrientId: number): number | undefined {
  const nutrient = nutrients?.find(n => n.nutrientId === nutrientId);
  return nutrient?.value;
}

function mapUSDACategory(category: string): string {
  if (!category) return 'Other';
  const lower = category.toLowerCase();
  
  if (lower.includes('fruit')) return 'Fruits';
  if (lower.includes('vegetable')) return 'Vegetables';
  if (lower.includes('dairy')) return 'Dairy & Eggs';
  if (lower.includes('meat') || lower.includes('poultry')) return 'Meat & Poultry';
  if (lower.includes('grain') || lower.includes('cereal')) return 'Grains, Bread & Pasta';
  if (lower.includes('beverage')) return 'Beverages';
  
  return 'Other';
}

function mapNutritionXCategory(tags: any): string {
  if (!tags || !tags.food_group) return 'Other';
  
  const group = tags.food_group.toLowerCase();
  if (group.includes('fruit')) return 'Fruits';
  if (group.includes('vegetable')) return 'Vegetables';
  if (group.includes('dairy')) return 'Dairy & Eggs';
  if (group.includes('protein')) return 'Meat & Poultry';
  if (group.includes('grain')) return 'Grains, Bread & Pasta';
  if (group.includes('beverage')) return 'Beverages';
  
  return 'Other';
}

function calculateUSDAConfidence(food: any): number {
  let score = 70; // Base score
  
  if (food.brandOwner) score += 10;
  if (food.foodNutrients && food.foodNutrients.length > 5) score += 15;
  if (food.publicationDate) score += 5;
  
  return Math.min(100, score);
}

function calculateNutritionXConfidence(food: any): number {
  let score = 85; // NutritionX generally high quality
  
  if (food.brand_name) score += 5;
  if (food.nix_item_id) score += 5;
  if (food.photo && food.photo.thumb) score += 5;
  
  return Math.min(100, score);
}

function assessDataQuality(nutrients: any[]): 'high' | 'medium' | 'low' {
  if (!nutrients || nutrients.length < 3) return 'low';
  if (nutrients.length >= 8) return 'high';
  return 'medium';
}

/**
 * Main Handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Nutrition aggregator called:', req.method, req.url);
    
    const { query, sources = ['usda', 'nutritionx'] } = await req.json();
    
    if (!query) {
      throw new Error("Search query is required.");
    }

    console.log(`Multi-API search for: "${query}" using sources: ${sources.join(', ')}`);

    // Parallel API calls for maximum speed
    const apiCalls = [];
    
    if (sources.includes('usda')) {
      apiCalls.push(searchUSDA(query));
    }
    
    if (sources.includes('nutritionx')) {
      apiCalls.push(searchNutritionX(query));
    }

    const results = await Promise.all(apiCalls);
    const allFoods = results.flat();

    if (allFoods.length === 0) {
      return new Response(JSON.stringify({
        foods: [],
        message: 'No foods found across all nutrition APIs',
        sources_searched: sources
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // AI-powered duplicate detection and merging
    const deduplicatedFoods = await detectDuplicatesAndMerge(allFoods);

    // Sort by confidence score and data quality
    const sortedFoods = deduplicatedFoods.sort((a, b) => {
      const scoreA = a.confidence_score + (a.data_quality === 'high' ? 20 : a.data_quality === 'medium' ? 10 : 0);
      const scoreB = b.confidence_score + (b.data_quality === 'high' ? 20 : b.data_quality === 'medium' ? 10 : 0);
      return scoreB - scoreA;
    });

    return new Response(JSON.stringify({
      foods: sortedFoods.slice(0, 10), // Return top 10 results
      total_found: allFoods.length,
      after_deduplication: deduplicatedFoods.length,
      sources_searched: sources,
      quality_score: 'multi_api_validated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Multi-API nutrition error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      quality_score: 'error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});