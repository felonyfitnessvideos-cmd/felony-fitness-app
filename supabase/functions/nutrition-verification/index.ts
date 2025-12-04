/**
 * @file supabase/functions/nutrition-verification/index.ts
 * @description PORTION MINER - Nutrition Verification & Portion Discovery Worker
 * 
 * NEW ARCHITECTURE (2025-12-04):
 * This worker acts as a "Portion Miner" that:
 * 1. Normalizes ALL nutrition data to 100g baseline (stored in food_servings)
 * 2. Extracts common serving portions (packets, cups, etc.) and stores in food_portions
 * 3. Runs gentle, single-threaded to prevent database stampedes
 * 
 * VERIFICATION PROCESS:
 * 1. Get food from database
 * 2. Ask GPT-4 to provide:
 *    - Verified nutrition values normalized to 100g
 *    - Common serving portions (e.g., "1 packet = 28g", "1 cup = 240g")
 * 3. Update food_servings with 100g values (serving_description = '100g')
 * 4. Insert discovered portions into food_portions table
 * 5. Mark as verified with quality_score = 100
 * 
 * BATCH SIZE: Configurable (default: 5, recommended: 5-10 for gentle operation)
 * FREQUENCY: Single-threaded via GitHub Action concurrency control
 * PERFORMANCE: ~5-10 foods per run, gentle on database
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface FoodServing {
  id: string
  food_name: string
  serving_description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  sodium_mg: number
  calcium_mg: number
  iron_mg: number
  vitamin_c_mg: number
  vitamin_a_mcg: number
  vitamin_d_mcg: number
  vitamin_e_mg: number
  vitamin_k_mcg: number
  vitamin_b12_mcg: number
  folate_mcg: number
  potassium_mg: number
  magnesium_mg: number
  zinc_mg: number
  category: string
  data_sources: string
  quality_score: number
}

interface CommonPortion {
  portion_name: string  // e.g., "1 packet", "1 cup", "1 slice"
  gram_weight: number   // Weight in grams
}

interface GPTPortionMinerResult {
  verified_100g_values: {
    category: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
    sugar_g: number
    sodium_mg: number
    calcium_mg: number
    iron_mg: number
    vitamin_c_mg: number
    vitamin_a_mcg: number
    potassium_mg: number
  }
  common_portions: CommonPortion[]
  reasoning: string
  confidence: number
}

/**
 * Ask GPT-4 to normalize to 100g and discover common portions
 */
async function minePortionsFromGPT(food: FoodServing): Promise<GPTPortionMinerResult | null> {
  try {
    const prompt = `You are a nutrition data expert and portion discovery specialist. Your task is to:
1. Normalize nutrition values to 100g baseline
2. Discover common serving portions for this food

FOOD TO ANALYZE:
Name: ${food.food_name}
Current Serving: ${food.serving_description}
Category: ${food.category}

CURRENT VALUES (may not be 100g):
- Calories: ${food.calories} kcal
- Protein: ${food.protein_g}g
- Carbs: ${food.carbs_g}g
- Fat: ${food.fat_g}g
- Fiber: ${food.fiber_g}g
- Sugar: ${food.sugar_g}g
- Sodium: ${food.sodium_mg}mg
- Calcium: ${food.calcium_mg}mg
- Iron: ${food.iron_mg}mg
- Vitamin C: ${food.vitamin_c_mg}mg
- Vitamin A: ${food.vitamin_a_mcg}mcg
- Potassium: ${food.potassium_mg}mg

TASK 1: NORMALIZE TO 100G
Provide accurate nutrition values per 100 grams using USDA/reliable databases.
Apply physics-based validation:
- Total macros (P+C+F) cannot exceed ~100g
- Calories should ≈ (Protein×4) + (Carbs×4) + (Fat×9) + (Alcohol×7 if alcoholic)
- Ensure proper categorization (alcoholic beverages → "Beverages", not "Grains")

TASK 2: DISCOVER COMMON PORTIONS
Research and list typical serving sizes for this food. Examples:
- Chips: "1 packet", "1 serving (28g)"
- Whiskey: "1 shot (1.5 fl oz)", "1 jigger (44ml)"
- Bread: "1 slice", "2 slices"
- Cereal: "1 cup", "1 serving"
- Vegetables: "1 cup chopped", "100g"

Include ONLY portions you're confident about. If no standard portions exist, return empty array.

Return JSON in this EXACT format:
{
  "verified_100g_values": {
    "category": "<correct category>",
    "calories": <number per 100g>,
    "protein_g": <number per 100g>,
    "carbs_g": <number per 100g>,
    "fat_g": <number per 100g>,
    "fiber_g": <number per 100g>,
    "sugar_g": <number per 100g>,
    "sodium_mg": <number per 100g>,
    "calcium_mg": <number per 100g>,
    "iron_mg": <number per 100g>,
    "vitamin_c_mg": <number per 100g>,
    "vitamin_a_mcg": <number per 100g>,
    "potassium_mg": <number per 100g>
  },
  "common_portions": [
    {
      "portion_name": "1 packet",
      "gram_weight": 28
    },
    {
      "portion_name": "1 cup",
      "gram_weight": 240
    }
  ],
  "reasoning": "Brief explanation of normalization and portions found",
  "confidence": 0-100
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    })

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    return result as GPTPortionMinerResult

  } catch (error) {
    console.error('GPT portion mining failed:', error)
    return null
  }
}


/**
 * Process a single food: normalize to 100g and mine portions
 * This function only processes in memory - no database operations
 */
async function processFood(food: FoodServing): Promise<{
  success: boolean
  verified: boolean
  portions_found: number
  updatedFood?: Partial<FoodServing> & { id: string }
  discoveredPortions?: Array<{ food_id: string, portion_name: string, gram_weight: number }>
  error?: string
}> {
  console.log(`\n🔍 Processing: ${food.food_name}`)
  
  try {
    // Ask GPT to normalize to 100g and find common portions
    const result = await minePortionsFromGPT(food)
    
    if (!result) {
      console.log(`   ❌ Failed to get GPT response`)
      return { success: false, verified: false, portions_found: 0, error: 'GPT_FAILED' }
    }

    if (result.confidence < 70) {
      console.log(`   ⚠️  Low confidence (${result.confidence}%) - skipping`)
      return { success: false, verified: false, portions_found: 0, error: 'LOW_CONFIDENCE' }
    }

    console.log(`   ✅ GPT Result (confidence: ${result.confidence}%)`)
    console.log(`   📝 ${result.reasoning}`)

    // Build update object in memory (no database operation yet)
    const updatedFood = {
      id: food.id,
      serving_description: '100g',  // HARDCODED: Always 100g baseline
      category: result.verified_100g_values.category,
      calories: result.verified_100g_values.calories,
      protein_g: result.verified_100g_values.protein_g,
      carbs_g: result.verified_100g_values.carbs_g,
      fat_g: result.verified_100g_values.fat_g,
      fiber_g: result.verified_100g_values.fiber_g,
      sugar_g: result.verified_100g_values.sugar_g,
      sodium_mg: result.verified_100g_values.sodium_mg,
      calcium_mg: result.verified_100g_values.calcium_mg,
      iron_mg: result.verified_100g_values.iron_mg,
      vitamin_c_mg: result.verified_100g_values.vitamin_c_mg,
      vitamin_a_mcg: result.verified_100g_values.vitamin_a_mcg,
      potassium_mg: result.verified_100g_values.potassium_mg,
      is_verified: true,
      quality_score: 100,
      enrichment_status: 'verified',
      needs_review: false,
      review_flags: null,
      last_verification: new Date().toISOString(),
      verification_details: {
        method: 'portion_miner',
        confidence: result.confidence,
        reasoning: result.reasoning,
        timestamp: new Date().toISOString()
      }
    }

    // Build portions array in memory (no database operation yet)
    const discoveredPortions = (result.common_portions || []).map(portion => ({
      food_id: food.id,
      portion_name: portion.portion_name,
      gram_weight: portion.gram_weight
    }))

    console.log(`   ✅ Prepared update with ${discoveredPortions.length} portions`)

    return { 
      success: true, 
      verified: true, 
      portions_found: discoveredPortions.length,
      updatedFood,
      discoveredPortions
    }

  } catch (error) {
    console.error(`   ❌ Error processing food:`, error)
    return { 
      success: false, 
      verified: false, 
      portions_found: 0, 
      error: error.message 
    }
  }
}

/**
 * Main handler - 3-STEP PATTERN to prevent database timeouts
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse batch size from request body (default to 5)
    const requestBody = await req.json().catch(() => ({}))
    const batchSize = requestBody.batch_size || 5

    console.log(`\n🚀 Starting Portion Miner - Batch size: ${batchSize}`)

    // =====================================================================
    // STEP 1: FETCH & DISCONNECT (Get data and close connection FAST)
    // =====================================================================
    console.log('\n📥 STEP 1: Fetching foods from database...')
    
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    // Get next batch of unverified foods
    const { data: foods, error } = await supabaseAdmin
      .from('food_servings')
      .select('*')
      .or('is_verified.is.null,is_verified.eq.false')
      .order('quality_score', { ascending: true, nullsFirst: true })
      .limit(batchSize)

    if (error) throw error

    if (!foods || foods.length === 0) {
      console.log('✅ No foods to process - database is clean!')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No foods to verify',
          verified: 0,
          portions_found: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store foods in local memory
    const localFoods = [...foods]
    console.log(`✅ Fetched ${localFoods.length} foods - DATABASE CONNECTION CLOSED`)

    // =====================================================================
    // STEP 2: PROCESS IN MEMORY (OpenAI calls, no database connection)
    // =====================================================================
    console.log('\n🤖 STEP 2: Processing with OpenAI (database is idle)...')
    
    const updates: Array<Partial<FoodServing> & { id: string }> = []
    const allPortions: Array<{ food_id: string, portion_name: string, gram_weight: number }> = []
    let verifiedCount = 0
    let errorCount = 0
    const results = []

    for (const food of localFoods) {
      const result = await processFood(food)
      
      if (result.verified && result.updatedFood) {
        verifiedCount++
        updates.push(result.updatedFood)
        if (result.discoveredPortions) {
          allPortions.push(...result.discoveredPortions)
        }
      }
      
      if (!result.success) errorCount++
      
      results.push({ 
        food_name: food.food_name, 
        verified: result.verified,
        portions_found: result.portions_found,
        error: result.error
      })
    }

    console.log(`\n✅ Processing complete:`)
    console.log(`   Updates prepared: ${updates.length}`)
    console.log(`   Portions prepared: ${allPortions.length}`)
    console.log(`   Errors: ${errorCount}`)

    // =====================================================================
    // STEP 3: RECONNECT & SAVE (Bulk save, fast database operation)
    // =====================================================================
    console.log('\n💾 STEP 3: Saving to database (bulk operation)...')

    // Reconnect for bulk save
    const supabaseAdmin2 = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Bulk update food_servings
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabaseAdmin2
          .from('food_servings')
          .update(update)
          .eq('id', update.id)

        if (updateError) {
          console.error(`❌ Failed to update ${update.id}:`, updateError)
        }
      }
      console.log(`✅ Updated ${updates.length} foods in food_servings`)
    }

    // Bulk insert portions (with duplicate checking)
    if (allPortions.length > 0) {
      let insertedCount = 0
      
      for (const portion of allPortions) {
        // Check if portion already exists
        const { data: existing } = await supabaseAdmin2
          .from('food_portions')
          .select('id')
          .eq('food_id', portion.food_id)
          .eq('portion_name', portion.portion_name)
          .maybeSingle()

        if (existing) {
          console.log(`   ⏭️  Portion "${portion.portion_name}" already exists - skipping`)
          continue
        }

        // Insert new portion
        const { error: portionError } = await supabaseAdmin2
          .from('food_portions')
          .insert(portion)

        if (portionError) {
          console.error(`   ⚠️  Failed to insert portion "${portion.portion_name}":`, portionError)
        } else {
          insertedCount++
        }
      }
      
      console.log(`✅ Inserted ${insertedCount} new portions into food_portions`)
    }

    // Count remaining unverified foods
    const { count } = await supabaseAdmin2
      .from('food_servings')
      .select('*', { count: 'exact', head: true })
      .or('is_verified.is.null,is_verified.eq.false')

    console.log(`\n✅ Batch complete:`)
    console.log(`   Verified: ${verifiedCount}`)
    console.log(`   Portions found: ${allPortions.length}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Remaining: ${count || 0}`)

    return new Response(
      JSON.stringify({
        success: true,
        verified: verifiedCount,
        portions_found: allPortions.length,
        errors: errorCount,
        remaining: count || 0,
        batch_size: localFoods.length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})