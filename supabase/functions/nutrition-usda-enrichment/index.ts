/**
 * @file supabase/functions/nutrition-usda-enrichment/index.ts
 * @description USDA FoodData Central API enrichment worker
 * 
 * FEATURES:
 * 1. Uses authoritative USDA nutrition database (400k+ foods)
 * 2. Smart search strategy: Branded → SR Legacy → Foundation
 * 3. Primary ingredient-based categorization
 * 4. Comprehensive validation and quality scoring
 * 5. Rate-limit friendly (5 foods per run, 2s delay)
 * 
 * USDA API DOCS: https://fdc.nal.usda.gov/api-guide.html
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const USDA_API_KEY = Deno.env.get("USDA_API_KEY");
const BATCH_SIZE = 5;
const DELAY_BETWEEN_REQUESTS_MS = 2000;

interface USDASearchResult {
  foods: Array<{
    fdcId: number;
    description: string;
    dataType: string;
    brandOwner?: string;
    foodNutrients: Array<{
      nutrientId: number;
      nutrientName: string;
      value: number;
      unitName: string;
    }>;
  }>;
  totalHits: number;
}

interface USDAFoodDetail {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{
    nutrient: {
      id: number;
      name: string;
      unitName: string;
    };
    amount: number;
  }>;
}

/**
 * USDA Nutrient ID Mapping
 * Complete list: https://fdc.nal.usda.gov/api-spec/fdc_api.html#/
 */
const NUTRIENT_MAP: { [key: string]: number } = {
  calories: 1008,        // Energy (kcal)
  protein: 1003,         // Protein
  carbs: 1005,           // Carbohydrate, by difference
  fat: 1004,             // Total lipid (fat)
  fiber: 1079,           // Fiber, total dietary
  sugar: 2000,           // Total Sugars
  sodium: 1093,          // Sodium
  calcium: 1087,         // Calcium
  iron: 1089,            // Iron
  vitamin_c: 1162,       // Vitamin C
  potassium: 1092,       // Potassium
  vitamin_a: 1106,       // Vitamin A (RAE)
  vitamin_e: 1109,       // Vitamin E
  vitamin_k: 1185,       // Vitamin K
  thiamin: 1165,         // Thiamin (B1)
  riboflavin: 1166,      // Riboflavin (B2)
  niacin: 1167,          // Niacin (B3)
  vitamin_b6: 1175,      // Vitamin B6
  folate: 1177,          // Folate (DFE)
  vitamin_b12: 1178,     // Vitamin B12
  magnesium: 1090,       // Magnesium
  phosphorus: 1091,      // Phosphorus
  zinc: 1095,            // Zinc
  copper: 1098,          // Copper
  selenium: 1103         // Selenium
};

/**
 * Category Detection by Primary Ingredient
 */
function detectPrimaryCategory(foodName: string, description: string): string {
  const text = `${foodName} ${description}`.toLowerCase();
  
  // Proteins & Meat (highest priority for meat-containing items)
  if (/(beef|steak|pork|lamb|veal|bison|venison|ribeye|sirloin|tenderloin|chuck|brisket|short rib)/i.test(text)) {
    return 'Meat & Poultry';
  }
  if (/(chicken|turkey|duck|goose|poultry|wings|drumstick|thigh|breast)/i.test(text)) {
    return 'Meat & Poultry';
  }
  if (/(bacon|sausage|ham|salami|pepperoni|hot dog|deli meat|bologna)/i.test(text)) {
    return 'Meat & Poultry';
  }
  
  // Seafood
  if (/(fish|salmon|tuna|cod|tilapia|shrimp|crab|lobster|oyster|clam|mussel|scallop|anchovy|sardine|caviar|seafood)/i.test(text)) {
    return 'Seafood';
  }
  
  // Dairy & Eggs
  if (/(egg|omelette|scrambled)/i.test(text) && !/(plant|vegan)/i.test(text)) {
    return 'Dairy & Eggs';
  }
  if (/(milk|cheese|yogurt|cottage cheese|cream cheese|sour cream|butter|ice cream)/i.test(text) && !/(coconut milk|almond milk|soy milk|oat milk)/i.test(text)) {
    return 'Dairy & Eggs';
  }
  
  // Fruits
  if (/(apple|banana|orange|grape|berry|strawberry|blueberry|raspberry|peach|pear|plum|cherry|melon|watermelon|cantaloupe|pineapple|mango|kiwi|papaya|avocado)/i.test(text)) {
    return 'Fruits';
  }
  
  // Vegetables
  if (/(broccoli|carrot|spinach|kale|lettuce|tomato|cucumber|pepper|onion|garlic|celery|asparagus|cauliflower|cabbage|brussels sprout|zucchini|squash|potato|sweet potato|bean|peas|corn)/i.test(text)) {
    return 'Vegetables';
  }
  
  // Grains, Bread & Pasta
  if (/(bread|bun|roll|bagel|tortilla|wrap|pita|naan|croissant|muffin|biscuit)/i.test(text)) {
    return 'Grains, Bread & Pasta';
  }
  if (/(pasta|spaghetti|macaroni|noodle|rice|quinoa|oats|oatmeal|barley|couscous|polenta)/i.test(text)) {
    return 'Grains, Bread & Pasta';
  }
  
  // Breakfast & Cereals
  if (/(cereal|granola|corn flakes|cheerios|frosted|lucky charms|raisin bran|special k)/i.test(text)) {
    return 'Breakfast & Cereals';
  }
  if (/(pancake|waffle|french toast|crepe)/i.test(text)) {
    return 'Breakfast & Cereals';
  }
  
  // Snacks & Treats
  if (/(chip|crisp|popcorn|pretzel|cracker|nacho|dorito|frito|cheeto|lay)/i.test(text)) {
    return 'Snacks & Treats';
  }
  if (/(nut|almond|cashew|peanut|walnut|pecan|pistachio|trail mix|seed|sunflower)/i.test(text)) {
    return 'Snacks & Treats';
  }
  
  // Desserts & Sweets
  if (/(cookie|cake|brownie|pie|donut|doughnut|pastry|danish|cinnamon roll|cupcake)/i.test(text)) {
    return 'Desserts & Sweets';
  }
  if (/(candy|chocolate|fudge|caramel|gummy|lollipop|taffy)/i.test(text)) {
    return 'Desserts & Sweets';
  }
  if (/(ice cream|gelato|sorbet|popsicle|frozen yogurt)/i.test(text)) {
    return 'Desserts & Sweets';
  }
  
  // Beverages
  if (/(juice|soda|pop|cola|sprite|coffee|tea|latte|cappuccino|espresso|smoothie|shake|energy drink|sports drink)/i.test(text)) {
    return 'Beverages';
  }
  
  // Supplements
  if (/(vitamin|supplement|protein powder|whey|creatine|bcaa|amino acid|capsule|tablet|multivitamin)/i.test(text)) {
    return 'Supplements';
  }
  if (/(probiotic|omega|fish oil|collagen|glucosamine|chondroitin)/i.test(text)) {
    return 'Supplements';
  }
  
  // Default fallback based on keyword priority
  if (/(sandwich|burger|wrap)/i.test(text)) return 'Meat & Poultry'; // Sandwiches go by primary ingredient
  if (/(pizza|quesadilla)/i.test(text)) return 'Grains, Bread & Pasta';
  if (/(soup|stew|chili)/i.test(text)) return 'Vegetables'; // Soups typically vegetable-based unless clearly meat
  if (/(salad)/i.test(text)) return 'Vegetables';
  
  // Final fallback
  return 'Grains, Bread & Pasta'; // Neutral default
}

/**
 * Search USDA FoodData Central
 */
async function searchUSDA(query: string): Promise<USDASearchResult | null> {
  try {
    // Try multiple search strategies
    const searchStrategies = [
      { query: query, dataType: ['Branded'] }, // Try branded foods first (most specific)
      { query: query, dataType: ['SR Legacy'] }, // Then standard reference
      { query: query, dataType: ['Foundation', 'Survey (FNDDS)'] }, // Then foundation foods
      { query: query.split(',')[0].trim(), dataType: [] } // Finally, try just the food name without brand
    ];
    
    for (const strategy of searchStrategies) {
      const params = new URLSearchParams({
        query: strategy.query,
        pageSize: '5',
        api_key: USDA_API_KEY!
      });
      
      if (strategy.dataType.length > 0) {
        params.append('dataType', strategy.dataType.join(','));
      }
      
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`;
      console.log(`Searching USDA: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`USDA API error: ${response.status}`);
        continue;
      }
      
      const data: USDASearchResult = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        console.log(`Found ${data.foods.length} results for "${strategy.query}" (${strategy.dataType.join(', ') || 'all types'})`);
        return data;
      }
    }
    
    console.log(`No USDA results found for: ${query}`);
    return null;
    
  } catch (error) {
    console.error('USDA search error:', error);
    return null;
  }
}

/**
 * Get detailed food information from USDA
 */
async function getFoodDetail(fdcId: number): Promise<USDAFoodDetail | null> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`USDA detail API error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('USDA detail error:', error);
    return null;
  }
}

/**
 * Extract nutrient value from USDA data
 */
function extractNutrient(nutrients: any[], nutrientId: number): number {
  const nutrient = nutrients.find(n => {
    const id = n.nutrient?.id || n.nutrientId;
    return id === nutrientId;
  });
  
  if (!nutrient) return 0;
  
  const value = nutrient.amount || nutrient.value || 0;
  return Math.round(value * 100) / 100; // Round to 2 decimal places
}

/**
 * Parse serving size from description string
 * Examples: "30g", "85g", "1 cup (47g)", "100g", "1 oz", "226GRM"
 */
function parseServingSize(servingDescription: string): { grams: number; original: string } {
  // Try to extract grams from parentheses first (e.g., "1 cup (47g)")
  const parenthesesMatch = servingDescription.match(/\((\d+\.?\d*)\s*g/i);
  if (parenthesesMatch) {
    return { grams: parseFloat(parenthesesMatch[1]), original: servingDescription };
  }
  
  // Try GRM format (e.g., "226GRM")
  const grmMatch = servingDescription.match(/(\d+\.?\d*)\s*GRM/i);
  if (grmMatch) {
    return { grams: parseFloat(grmMatch[1]), original: servingDescription };
  }
  
  // Try standard grams at end (e.g., "30g", "85g")
  const gramsMatch = servingDescription.match(/(\d+\.?\d*)\s*g$/i);
  if (gramsMatch) {
    return { grams: parseFloat(gramsMatch[1]), original: servingDescription };
  }
  
  // Try ounces
  const ozMatch = servingDescription.match(/(\d+\.?\d*)\s*oz/i);
  if (ozMatch) {
    return { grams: parseFloat(ozMatch[1]) * 28.35, original: servingDescription };
  }
  
  // Try any number followed by g anywhere
  const anyGramsMatch = servingDescription.match(/(\d+\.?\d*)\s*g/i);
  if (anyGramsMatch) {
    return { grams: parseFloat(anyGramsMatch[1]), original: servingDescription };
  }
  
  // Default to 100g if can't parse
  console.log(`⚠️ Could not parse serving size "${servingDescription}", assuming 100g`);
  return { grams: 100, original: servingDescription };
}

/**
 * Enrich food data with USDA information
 */
async function enrichWithUSDA(foodData: any): Promise<any> {
  try {
    // Search USDA database
    const searchQuery = foodData.brand 
      ? `${foodData.brand} ${foodData.food_name}`
      : foodData.food_name;
    
    const searchResults = await searchUSDA(searchQuery);
    
    if (!searchResults || searchResults.foods.length === 0) {
      throw new Error('No USDA data found');
    }
    
    // Get the first (best) match
    const bestMatch = searchResults.foods[0];
    console.log(`Using USDA food: ${bestMatch.description} (FDC ID: ${bestMatch.fdcId})`);
    
    // Get detailed nutrition information
    const detail = await getFoodDetail(bestMatch.fdcId);
    
    if (!detail) {
      throw new Error('Failed to get USDA food details');
    }
    
    const nutrients = detail.foodNutrients;
    
    // Parse our target serving size
    const targetServing = parseServingSize(foodData.serving_description || '100g');
    
    // USDA data is per 100g by default, so we need to scale to our serving size
    const scaleFactor = targetServing.grams / 100;
    
    console.log(`Scaling: USDA (per 100g) × ${scaleFactor.toFixed(3)} = ${targetServing.grams}g serving`);
    
    // Helper to extract and scale nutrient
    const extractScaledNutrient = (nutrients: any[], nutrientId: number): number => {
      const value = extractNutrient(nutrients, nutrientId);
      return Math.round(value * scaleFactor * 100) / 100; // Scale and round to 2 decimals
    };
    
    // Extract all nutrients using the mapping WITH SCALING
    const enrichedData: any = {
      ...foodData,
      // Macronutrients (scaled to serving size)
      calories: Math.round(extractNutrient(nutrients, NUTRIENT_MAP.calories) * scaleFactor),
      protein_g: extractScaledNutrient(nutrients, NUTRIENT_MAP.protein),
      carbs_g: extractScaledNutrient(nutrients, NUTRIENT_MAP.carbs),
      fat_g: extractScaledNutrient(nutrients, NUTRIENT_MAP.fat),
      fiber_g: extractScaledNutrient(nutrients, NUTRIENT_MAP.fiber),
      sugar_g: extractScaledNutrient(nutrients, NUTRIENT_MAP.sugar),
      sodium_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.sodium),
      
      // Micronutrients (scaled to serving size)
      calcium_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.calcium),
      iron_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.iron),
      vitamin_c_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_c),
      potassium_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.potassium),
      vitamin_a_mcg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_a),
      vitamin_e_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_e),
      vitamin_k_mcg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_k),
      thiamin_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.thiamin),
      riboflavin_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.riboflavin),
      niacin_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.niacin),
      vitamin_b6_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_b6),
      folate_mcg: extractScaledNutrient(nutrients, NUTRIENT_MAP.folate),
      vitamin_b12_mcg: extractScaledNutrient(nutrients, NUTRIENT_MAP.vitamin_b12),
      magnesium_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.magnesium),
      phosphorus_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.phosphorus),
      zinc_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.zinc),
      copper_mg: extractScaledNutrient(nutrients, NUTRIENT_MAP.copper),
      selenium_mcg: extractScaledNutrient(nutrients, NUTRIENT_MAP.selenium),
      
      // Metadata
      data_sources: 'USDA',
      usda_fdc_id: bestMatch.fdcId,
      usda_description: bestMatch.description,
      usda_data_type: bestMatch.dataType,
      brand: bestMatch.brandOwner || foodData.brand,
      
      // Auto-detect category based on primary ingredient
      category: foodData.category || detectPrimaryCategory(foodData.food_name, bestMatch.description)
    };
    
    // Keep original serving description (don't override with USDA's)
    // Our serving sizes are user-defined and should be preserved
    
    return enrichedData;
    
  } catch (error) {
    console.error('USDA enrichment error:', error);
    throw error;
  }
}

/**
 * Validate nutritional consistency
 */
function validateNutritionalConsistency(foodData: any): { isValid: boolean; issues: string[]; corrections: any } {
  const issues: string[] = [];
  const corrections: any = {};

  // Calculate expected calories
  const calculatedCalories = (foodData.protein_g || 0) * 4 + (foodData.carbs_g || 0) * 4 + (foodData.fat_g || 0) * 9;
  const caloriesDiff = Math.abs((foodData.calories || 0) - calculatedCalories);
  
  // Allow 20% variance for rounding and water content
  if (calculatedCalories > 0 && caloriesDiff > calculatedCalories * 0.20) {
    issues.push(`Calorie mismatch: stated ${foodData.calories}, calculated ${calculatedCalories.toFixed(0)}`);
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
  
  // High carbs in pure meat (not composite foods like sandwiches)
  const isPureMeat = /^(beef|chicken|pork|turkey|lamb|fish|salmon|tuna)\s+(breast|thigh|leg|wing|steak|fillet|tenderloin|ribeye|sirloin)/i.test(foodData.food_name);
  if (isPureMeat && foodData.carbs_g > 2) {
    issues.push(`Pure meat should have <2g carbs, has ${foodData.carbs_g}g`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    corrections
  };
}

/**
 * Calculate quality score
 */
function calculateQualityScore(foodData: any, validationResult: any): number {
  let score = 0;

  // Completeness (50 points)
  const requiredFields = ['calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g', 'sodium_mg'];
  const completeRequired = requiredFields.filter(f => foodData[f] !== null && foodData[f] !== undefined).length;
  score += (completeRequired / requiredFields.length) * 50;

  // Consistency (30 points)
  if (validationResult.isValid) {
    score += 30;
  } else {
    score += Math.max(0, 30 - validationResult.issues.length * 10);
  }

  // Source reliability (20 points) - USDA is gold standard
  if (foodData.data_sources === 'USDA') score += 20;
  else score += 10;

  return Math.min(100, Math.round(score));
}

/**
 * Process single food item
 */
async function processSingleFood(supabaseAdmin: any, food: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`\n▶ Processing: ${food.food_name} (ID: ${food.id})`);

    // Mark as processing
    await supabaseAdmin
      .from('food_servings')
      .update({ enrichment_status: 'processing' })
      .eq('id', food.id);

    // Enrich with USDA data
    const enrichedData = await enrichWithUSDA(food);
    
    // Validate
    const validation = validateNutritionalConsistency(enrichedData);
    
    if (validation.issues.length > 0) {
      console.log(`⚠ Validation warnings: ${validation.issues.join(', ')}`);
    }
    
    // Apply corrections
    const finalData = { ...enrichedData, ...validation.corrections };
    
    // Calculate quality score
    const qualityScore = calculateQualityScore(finalData, validation);

    // Update database
    const { error: updateError } = await supabaseAdmin
      .from('food_servings')
      .update({
        // Macros
        calories: finalData.calories,
        protein_g: finalData.protein_g,
        carbs_g: finalData.carbs_g,
        fat_g: finalData.fat_g,
        fiber_g: finalData.fiber_g,
        sugar_g: finalData.sugar_g,
        sodium_mg: finalData.sodium_mg,
        
        // Micronutrients
        calcium_mg: finalData.calcium_mg,
        iron_mg: finalData.iron_mg,
        vitamin_c_mg: finalData.vitamin_c_mg,
        potassium_mg: finalData.potassium_mg,
        vitamin_a_mcg: finalData.vitamin_a_mcg,
        vitamin_e_mg: finalData.vitamin_e_mg,
        vitamin_k_mcg: finalData.vitamin_k_mcg,
        thiamin_mg: finalData.thiamin_mg,
        riboflavin_mg: finalData.riboflavin_mg,
        niacin_mg: finalData.niacin_mg,
        vitamin_b6_mg: finalData.vitamin_b6_mg,
        folate_mcg: finalData.folate_mcg,
        vitamin_b12_mcg: finalData.vitamin_b12_mcg,
        magnesium_mg: finalData.magnesium_mg,
        phosphorus_mg: finalData.phosphorus_mg,
        zinc_mg: finalData.zinc_mg,
        copper_mg: finalData.copper_mg,
        selenium_mcg: finalData.selenium_mcg,
        
        // Metadata
        serving_description: finalData.serving_description,
        brand: finalData.brand,
        category: finalData.category,
        data_sources: finalData.data_sources,
        quality_score: qualityScore,
        enrichment_status: 'completed',
        last_enrichment: new Date().toISOString()
      })
      .eq('id', food.id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✓ Completed: ${food.food_name} (Quality: ${qualityScore}%, Category: ${finalData.category})`);
    return { success: true };

  } catch (error) {
    console.error(`✗ Failed: ${food.food_name}`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTemporaryError = errorMessage.includes('rate limit') || 
                            errorMessage.includes('timeout') || 
                            errorMessage.includes('429');
    
    await supabaseAdmin
      .from('food_servings')
      .update({ 
        enrichment_status: isTemporaryError ? 'pending' : 'failed',
        last_enrichment: new Date().toISOString()
      })
      .eq('id', food.id);

    return { success: false, error: errorMessage };
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body for worker configuration
    let workerConfig = { worker_id: 1, offset_multiplier: 0 };
    try {
      const body = await req.json();
      if (body.worker_id) workerConfig.worker_id = body.worker_id;
      if (body.offset_multiplier !== undefined) workerConfig.offset_multiplier = body.offset_multiplier;
    } catch {
      // No body provided, use defaults (worker 1)
    }

    console.log(`\n=== USDA Enrichment Worker ${workerConfig.worker_id} Started ===`);
    console.log(`Starting offset: ${workerConfig.offset_multiplier} rows\n`);
    
    if (!USDA_API_KEY) {
      throw new Error('USDA_API_KEY is not configured');
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get foods needing enrichment with offset for parallel workers
    // Each worker starts at a different point to avoid conflicts
    const { data: foods, error: fetchError } = await supabaseAdmin
      .from('food_servings')
      .select('*')
      .or('enrichment_status.is.null,enrichment_status.eq.pending,enrichment_status.eq.failed')
      .order('id', { ascending: true })
      .range(workerConfig.offset_multiplier, workerConfig.offset_multiplier + BATCH_SIZE - 1)
      .limit(BATCH_SIZE);

    if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

    if (!foods || foods.length === 0) {
      console.log('✓ No foods need enrichment');
      return new Response(JSON.stringify({ success: true, processed: 0, remaining: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${foods.length} foods to process\n`);

    const result = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process sequentially with delays
    for (let i = 0; i < foods.length; i++) {
      const processResult = await processSingleFood(supabaseAdmin, foods[i]);
      result.processed++;

      if (processResult.success) {
        result.successful++;
      } else {
        result.failed++;
        result.errors.push({
          food_id: foods[i].id,
          food_name: foods[i].food_name,
          error: processResult.error
        });
      }

      if (i < foods.length - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    // Get remaining count
    const { count } = await supabaseAdmin
      .from('food_servings')
      .select('id', { count: 'exact', head: true })
      .or('enrichment_status.is.null,enrichment_status.eq.pending');

    console.log(`\n=== Worker Completed ===`);
    console.log(`Processed: ${result.processed}, Success: ${result.successful}, Failed: ${result.failed}, Remaining: ${count || 0}`);

    return new Response(JSON.stringify({ ...result, remaining: count || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
