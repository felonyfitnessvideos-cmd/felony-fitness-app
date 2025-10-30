/**
 * @file supabase/functions/food-search-v2/index.ts
 * @description Enhanced Edge Function with AI guardrails for food data quality
 *
 * @project Felony Fitness
 *
 * GUARDRAIL PRINCIPLES:
 * 1. Data Consistency: Nutritional values must be within realistic ranges
 * 2. Serving Size Validation: Standard serving descriptions with reasonable portions
 * 3. Category Enforcement: Foods categorized by primary ingredient, not preparation
 * 4. Duplicate Prevention: Smart matching to prevent database bloat
 * 5. Quality Control: Multi-stage validation before database insertion
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// GUARDRAIL CONFIGURATION
const NUTRITIONAL_LIMITS = {
  calories: { min: 0, max: 2000 },     // Per serving
  protein_g: { min: 0, max: 100 },    
  carbs_g: { min: 0, max: 200 },      
  fat_g: { min: 0, max: 100 }
};

const VALID_CATEGORIES = [
  "Vegetables", "Fruits", "Meat & Poultry", "Seafood", 
  "Dairy & Eggs", "Grains, Bread & Pasta", "Protein & Supplements",
  "Beverages", "Breakfast & Cereals", "Desserts & Sweets"
];

const SERVING_PATTERNS = [
  /^1 (cup|medium|large|small|piece|slice|serving|portion)/i,
  /^100g$/i,
  /^1 oz$/i,
  /^\d+\s*(g|oz|ml|cup|piece|slice|tbsp|tsp)$/i
];

/**
 * Clean search query to extract food name from serving size descriptions
 * Examples: "1/2 cup white rice" -> "white rice", "white rice 1 cup" -> "white rice"
 */
function cleanSearchQuery(query: string): string {
  const cleanQuery = query.toLowerCase().trim();
  
  // Common serving size patterns to remove
  const servingPatterns = [
    // Fractions with units: "1/2 cup", "3/4 oz", etc.
    /\b\d+\/\d+\s*(cup|cups|oz|ounce|ounces|g|grams|ml|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pound|pounds|lb|slice|slices)\b/gi,
    // Decimal amounts: "1.5 cups", "0.5 oz", etc.
    /\b\d+(\.\d+)?\s*(cup|cups|oz|ounce|ounces|g|grams|ml|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pound|pounds|lb|slice|slices)\b/gi,
    // Whole numbers: "2 cups", "100 grams", etc.
    /\b\d+\s*(cup|cups|oz|ounce|ounces|g|grams|ml|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pound|pounds|lb|slice|slices|small|medium|large|piece|pieces|item|items)\b/gi,
    // Word-based quantities: "half cup", "quarter pound", etc.
    /\b(half|quarter|one|two|three|four|five)\s*(cup|cups|oz|ounce|ounces|g|grams|ml|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pound|pounds|lb|slice|slices)\b/gi,
    // Standalone serving words: "cooked", "raw", "diced", "chopped", etc.
    /\b(cooked|raw|fresh|frozen|diced|chopped|sliced|steamed|boiled|grilled|baked)\b/gi
  ];
  
  let cleaned = cleanQuery;
  
  // Remove serving patterns
  for (const pattern of servingPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up extra spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If we removed everything, return original query
  if (!cleaned || cleaned.length < 2) {
    return query.trim();
  }
  
  return cleaned;
}

/**
 * Validates nutritional data against realistic ranges
 */
function validateNutrition(nutrition: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [nutrient, limits] of Object.entries(NUTRITIONAL_LIMITS)) {
    const value = nutrition[nutrient];
    if (value !== null && value !== undefined) {
      if (value < limits.min || value > limits.max) {
        errors.push(`${nutrient} value ${value} outside acceptable range (${limits.min}-${limits.max})`);
      }
    }
  }
  
  // Calorie consistency check (rough estimate: 4*carbs + 4*protein + 9*fat)
  const estimatedCalories = (nutrition.carbs_g || 0) * 4 + (nutrition.protein_g || 0) * 4 + (nutrition.fat_g || 0) * 9;
  const actualCalories = nutrition.calories || 0;
  const calorieDifference = Math.abs(estimatedCalories - actualCalories);
  
  if (calorieDifference > actualCalories * 0.3) { // 30% tolerance
    errors.push(`Calorie inconsistency: estimated ${estimatedCalories}, provided ${actualCalories}`);
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates and normalizes food category
 */
function validateCategory(food: any): string {
  const foodName = food.name?.toLowerCase() || '';
  
  // Category enforcement rules based on primary ingredient
  if (foodName.includes('chicken') || foodName.includes('beef') || foodName.includes('pork') || 
      foodName.includes('turkey') || foodName.includes('meat')) {
    return "Meat & Poultry";
  }
  
  if (foodName.includes('fish') || foodName.includes('salmon') || foodName.includes('tuna') || 
      foodName.includes('shrimp') || foodName.includes('crab')) {
    return "Seafood";
  }
  
  if (foodName.includes('milk') || foodName.includes('cheese') || foodName.includes('yogurt') || 
      foodName.includes('egg')) {
    return "Dairy & Eggs";
  }
  
  if (foodName.includes('rice') || foodName.includes('bread') || foodName.includes('pasta') || 
      foodName.includes('oats') || foodName.includes('cereal') || foodName.includes('chip')) {
    return "Grains, Bread & Pasta";
  }
  
  if (foodName.includes('protein') || foodName.includes('whey') || foodName.includes('casein') ||
      foodName.includes('supplement')) {
    return "Protein & Supplements";
  }
  
  if (foodName.includes('apple') || foodName.includes('banana') || foodName.includes('orange') || 
      foodName.includes('berry') || foodName.includes('fruit')) {
    return "Fruits";
  }
  
  if (foodName.includes('broccoli') || foodName.includes('spinach') || foodName.includes('carrot') || 
      foodName.includes('vegetable')) {
    return "Vegetables";
  }
  
  if (foodName.includes('coffee') || foodName.includes('tea') || foodName.includes('water') || 
      foodName.includes('juice') || foodName.includes('soda')) {
    return "Beverages";
  }
  
  if (foodName.includes('cake') || foodName.includes('cookie') || foodName.includes('ice cream') || 
      foodName.includes('candy') || foodName.includes('chocolate')) {
    return "Desserts & Sweets";
  }
  
  // Default fallback
  return "Grains, Bread & Pasta";
}

/**
 * Validates serving description format
 */
function validateServingDescription(description: string): boolean {
  return SERVING_PATTERNS.some(pattern => pattern.test(description.trim()));
}

/**
 * Enhanced AI prompt with strict guardrails
 */
function createEnhancedPrompt(query: string): string {
  return `You are a nutrition database expert. Provide accurate nutritional information for "${query}".

STRICT REQUIREMENTS:
1. Return 1-3 common serving sizes only
2. Use ONLY these categories: ${VALID_CATEGORIES.join(', ')}
3. Serving descriptions must follow patterns: "1 cup", "100g", "1 medium", "1 slice", etc.
4. Nutritional values must be realistic per serving:
   - Calories: 0-2000
   - Protein: 0-100g  
   - Carbs: 0-200g
   - Fat: 0-100g
5. Categorize by PRIMARY ingredient, not preparation method
6. Ensure calories ≈ (4×carbs + 4×protein + 9×fat)

Format as valid JSON:
{
  "results": [
    {
      "name": "exact food name",
      "category": "category from approved list",
      "serving_description": "standard serving format",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number
    }
  ]
}`;
}

/**
 * Fuzzy matching to prevent duplicates
 */
async function findSimilarFoods(supabase: any, foodName: string) {
  // Use PostgreSQL similarity functions if available, otherwise basic matching
  const { data } = await supabase
    .from('foods')
    .select('id, name, category')
    .ilike('name', `%${foodName.substring(0, 10)}%`)
    .limit(5);
    
  return data || [];
}

/**
 * Main handler with comprehensive guardrails
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error("Search query is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Clean the search query to extract food name from serving sizes
    const cleanedQuery = cleanSearchQuery(query);
    console.log(`Original query: "${query}" -> Cleaned: "${cleanedQuery}"`);
    
    // Step 2: Enhanced local search with better relevance ranking
    const searchTerms = cleanedQuery.toLowerCase().split(' ');
    const primaryTerm = searchTerms[0];
    const fullQuery = cleanedQuery.toLowerCase();
    
    const { data: allMatches, error: localError } = await supabaseAdmin
      .from('foods')
      .select('*, food_servings(*)')
      .ilike('name', `%${cleanedQuery}%`)
      .limit(20); // Get more results to rank them

    if (localError) throw localError;

    // If cleaned query returns no results, try original query as fallback
    let searchResults = allMatches || [];
    if (searchResults.length === 0 && cleanedQuery !== query.toLowerCase()) {
      console.log('No results with cleaned query, trying original query as fallback...');
      const { data: fallbackMatches, error: fallbackError } = await supabaseAdmin
        .from('foods')
        .select('*, food_servings(*)')
        .ilike('name', `%${query}%`)
        .limit(20);
      
      if (!fallbackError && fallbackMatches) {
        searchResults = fallbackMatches;
        console.log(`Fallback search found ${searchResults.length} results`);
      }
    }

    // Rank results by relevance
    const rankedResults = (searchResults || [])
      .map(food => {
        const name = food.name.toLowerCase();
        let score = 0;
        
        // Use cleanedQuery for scoring, but original query as backup
        const scoringQuery = searchResults === allMatches ? fullQuery : query.toLowerCase();
        const scoringTerms = searchResults === allMatches ? searchTerms : query.toLowerCase().split(' ');
        
        // Exact match gets highest score
        if (name === scoringQuery) score += 100;
        
        // Name starts with query gets high score
        if (name.startsWith(scoringQuery)) score += 50;
        
        // Contains all search terms gets good score
        if (scoringTerms.every(term => name.includes(term))) score += 30;
        
        // Contains primary term gets base score
        const primaryScoringTerm = scoringTerms[0];
        if (name.includes(primaryScoringTerm)) score += 10;
        
        // Penalty for very different length (likely irrelevant)
        const lengthDiff = Math.abs(name.length - scoringQuery.length);
        if (lengthDiff > scoringQuery.length * 2) score -= 20;
        
        return { ...food, relevanceScore: score };
      })
      .filter(food => food.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    if (rankedResults.length > 0) {
      return new Response(JSON.stringify({ 
        results: rankedResults, 
        source: 'local',
        quality_score: 'verified'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Step 2: Check for similar foods to prevent duplicates
    const similarFoods = await findSimilarFoods(supabaseAdmin, query);
    if (similarFoods.length > 0) {
      return new Response(JSON.stringify({
        results: [],
        source: 'duplicate_check',
        message: `Similar foods found: ${similarFoods.map((f: any) => f.name).join(', ')}. Consider using existing entries.`,
        similar_foods: similarFoods
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Step 3: AI generation with enhanced guardrails
    const enhancedPrompt = createEnhancedPrompt(cleanedQuery);
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: enhancedPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Very low for consistency
        max_tokens: 1000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const aiResults = JSON.parse(aiData.choices[0].message.content);
    
    // Step 4: Comprehensive validation
    const validatedResults = [];
    const validationErrors = [];
    
    for (const food of aiResults.results || []) {
      // Validate nutrition
      const nutritionCheck = validateNutrition(food);
      if (!nutritionCheck.isValid) {
        validationErrors.push(`${food.name}: ${nutritionCheck.errors.join(', ')}`);
        continue;
      }
      
      // Validate category
      if (!VALID_CATEGORIES.includes(food.category)) {
        food.category = validateCategory(food);
      }
      
      // Validate serving description
      if (!validateServingDescription(food.serving_description || '')) {
        validationErrors.push(`${food.name}: Invalid serving description format`);
        continue;
      }
      
      validatedResults.push({
        ...food,
        quality_score: 'ai_validated'
      });
    }

    return new Response(JSON.stringify({
      results: validatedResults,
      source: 'external',
      validation_errors: validationErrors,
      quality_score: validationErrors.length === 0 ? 'high' : 'medium'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      quality_score: 'error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});