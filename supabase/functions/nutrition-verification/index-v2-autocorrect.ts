/**
 * @file supabase/functions/nutrition-verification/index-v2-autocorrect.ts
 * @description AUTO-CORRECTING Nutrition Verification Worker
 * 
 * NEW VERIFICATION FLOW:
 * 1. Initial deterministic checks (Atwater, Physics, Outliers)
 * 2. If issues found → Ask GPT-4 for corrections
 * 3. Apply corrections to database
 * 4. Re-verify corrected values
 * 5. Loop until verified OR max attempts (3) reached
 * 6. Mark as verified (100%) OR flag for human review
 * 
 * BATCH SIZE: 1 food per run (ensures full correction before moving on)
 * FREQUENCY: Every 2 minutes = 30 foods/hour = 720 foods/day
 * TIMELINE: ~7.5 days for 5,400 foods (but with higher quality)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const MAX_CORRECTION_ATTEMPTS = 3
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface FoodServing {
  id: string
  food_name: string
  serving_description: string
  serving_amount: number
  serving_unit: string
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
  serving_weight_g?: number
}

interface VerificationResult {
  passed: boolean
  flags: string[]
  severity: 'pass' | 'warning' | 'critical'
  details: Record<string, any>
}

interface CorrectionResult {
  needsCorrection: boolean
  correctedValues?: Partial<FoodServing>
  reasoning?: string
  confidence?: number
}

/**
 * DETERMINISTIC CHECK 1: Atwater Check
 * Note: Alcohol provides 7 cal/g but isn't tracked in standard macros
 */
function atwaterCheck(food: FoodServing): VerificationResult {
  const calculatedCalories = (food.protein_g * 4) + (food.carbs_g * 4) + (food.fat_g * 9)
  const difference = Math.abs(food.calories - calculatedCalories)
  const percentDifference = food.calories > 0 ? (difference / food.calories) * 100 : 0

  // Alcohol exception: Allow higher tolerance for beverages
  // Alcohol = 7 cal/g but isn't tracked in protein/carbs/fat
  const isAlcoholic = /whiskey|vodka|rum|gin|tequila|beer|wine|bourbon|scotch|brandy|cocktail/i.test(food.food_name || '')
  const tolerance = isAlcoholic ? 50 : 20 // 50% for alcohol, 20% for regular food

  if (percentDifference > tolerance && food.calories > 10) {
    return {
      passed: false,
      flags: ['ATWATER_MISMATCH'],
      severity: 'warning',
      details: {
        listed_calories: food.calories,
        calculated_calories: calculatedCalories.toFixed(1),
        difference: difference.toFixed(1),
        percent_difference: percentDifference.toFixed(1) + '%',
        note: isAlcoholic ? 'Alcohol contains ~7 cal/g not accounted for in standard macros' : undefined
      }
    }
  }

  return { passed: true, flags: [], severity: 'pass', details: {} }
}

/**
 * DETERMINISTIC CHECK 2: Physics Check
 */
function physicsCheck(food: FoodServing): VerificationResult {
  const servingWeightG = food.serving_weight_g || (food.serving_amount * 100)
  const totalMacrosG = food.protein_g + food.carbs_g + food.fat_g

  if (totalMacrosG > servingWeightG * 1.1) {
    return {
      passed: false,
      flags: ['PHYSICS_VIOLATION'],
      severity: 'critical',
      details: {
        serving_weight_g: servingWeightG,
        total_macros_g: totalMacrosG.toFixed(1),
        reason: 'Sum of macros exceeds serving weight (impossible)'
      }
    }
  }

  return { passed: true, flags: [], severity: 'pass', details: {} }
}

/**
 * DETERMINISTIC CHECK 3: Outlier Check
 * Catches categorization errors and nutritional anomalies
 */
function outlierCheck(food: FoodServing): VerificationResult {
  const flags: string[] = []
  const category = food.category?.toLowerCase() || ''
  const foodName = food.food_name?.toLowerCase() || ''

  // CATEGORIZATION ERROR DETECTION
  
  // Alcohol miscategorized as Grains
  if (category.includes('grain') || category.includes('bread') || category.includes('pasta')) {
    if (/whiskey|vodka|rum|gin|tequila|beer|wine|bourbon|scotch|brandy|cocktail|margarita|mojito/i.test(foodName)) {
      flags.push('ALCOHOL_MISCATEGORIZED_AS_GRAINS')
    }
    if (/vegetable oil|olive oil|canola oil|coconut oil|oil/i.test(foodName)) {
      flags.push('OIL_MISCATEGORIZED_AS_GRAINS')
    }
    if (/turnip|collard|mustard greens|chard|kale|spinach/i.test(foodName)) {
      flags.push('VEGETABLE_MISCATEGORIZED_AS_GRAINS')
    }
  }
  
  // Chips miscategorized as Dairy
  if (category.includes('dairy')) {
    if (/chip|dorito|frito|nacho|tortilla chip|potato chip/i.test(foodName)) {
      flags.push('CHIPS_MISCATEGORIZED_AS_DAIRY')
    }
  }
  
  // Oil/fat products miscategorized
  if (/oil|lard|shortening|ghee/i.test(foodName) && !category.includes('fat') && !category.includes('oil')) {
    flags.push('OIL_WRONG_CATEGORY')
  }

  // NUTRITIONAL OUTLIER DETECTION
  
  // Vegetables: High fat or calorie check
  if (category.includes('vegetable')) {
    if (food.fat_g > 10) flags.push('VEGETABLE_HIGH_FAT')
    if (food.calories > 150) flags.push('VEGETABLE_HIGH_CALORIE')
  }

  // Fruits: High protein or fat (except avocados)
  if (category.includes('fruit')) {
    if (food.protein_g > 5 && !foodName.includes('avocado')) flags.push('FRUIT_HIGH_PROTEIN')
    if (food.fat_g > 15 && !foodName.includes('avocado')) flags.push('FRUIT_HIGH_FAT')
  }

  // Protein sources: Low protein
  if (category.includes('meat') || category.includes('fish') || category.includes('poultry')) {
    if (food.protein_g < 10) flags.push('PROTEIN_SOURCE_LOW_PROTEIN')
  }

  // Grains: Low carbs (but not if it's actually alcohol!)
  if (category.includes('grain') || category.includes('bread') || category.includes('pasta')) {
    if (food.carbs_g < 20 && !flags.includes('ALCOHOL_MISCATEGORIZED_AS_GRAINS')) {
      flags.push('GRAIN_LOW_CARB')
    }
  }

  // Fats/Oils: Low fat
  if (category.includes('oil') || category.includes('butter') || category.includes('fat')) {
    if (food.fat_g < 50) flags.push('FAT_SOURCE_LOW_FAT')
  }
  
  // Beverages: Alcohol calorie check
  if (category.includes('beverage')) {
    const isAlcoholic = /whiskey|vodka|rum|gin|tequila|beer|wine|bourbon|scotch|brandy|cocktail/i.test(foodName)
    const isDiet = /diet|zero|light|low cal/i.test(foodName)
    
    // Diet paradox: Diet version should have FEWER calories than regular
    if (isDiet && food.calories > 100) {
      flags.push('DIET_BEVERAGE_HIGH_CALORIE')
    }
    
    // Alcohol with impossibly low calories (should be at least 60-80 cal for standard drink)
    if (isAlcoholic && food.calories < 50 && food.serving_amount >= 100) {
      flags.push('ALCOHOL_SUSPICIOUSLY_LOW_CALORIE')
    }
    
    // Alcohol with zero macros but has calories = missing alcohol content
    if (isAlcoholic && food.calories > 50 && food.protein_g === 0 && food.carbs_g < 5 && food.fat_g === 0) {
      flags.push('ALCOHOL_CALORIES_WITHOUT_MACROS')
    }
  }

  return {
    passed: flags.length === 0,
    flags,
    severity: flags.length > 0 ? 'warning' : 'pass',
    details: flags.length > 0 ? { category, triggered_rules: flags } : {}
  }
}

/**
 * Ask GPT-4 to provide corrected nutrition values
 */
async function getCorrectionFromGPT(food: FoodServing, issues: string[]): Promise<CorrectionResult> {
  try {
    const prompt = `You are a nutrition data expert. Review this food entry and provide CORRECTED values if needed.

CURRENT DATA:
Food: ${food.food_name}
Serving: ${food.serving_description} (${food.serving_amount} ${food.serving_unit})
Category: ${food.category}

CURRENT VALUES:
- Calories: ${food.calories} kcal
- Protein: ${food.protein_g}g
- Carbs: ${food.carbs_g}g
- Fat: ${food.fat_g}g
- Fiber: ${food.fiber_g}g
- Sugar: ${food.sugar_g}g

MICRONUTRIENTS:
- Sodium: ${food.sodium_mg}mg
- Calcium: ${food.calcium_mg}mg
- Iron: ${food.iron_mg}mg
- Vitamin C: ${food.vitamin_c_mg}mg
- Vitamin A: ${food.vitamin_a_mcg}mcg
- Potassium: ${food.potassium_mg}mg

IDENTIFIED ISSUES:
${issues.join('\n')}

IMPORTANT RULES:
1. ALCOHOL: Alcohol provides 7 calories per gram but is NOT tracked in protein/carbs/fat
   - Whiskey, vodka, rum, gin (80 proof) = ~64 cal per 1 oz (pure alcohol)
   - Beer = ~12g carbs + alcohol per 12 oz (~150 cal)
   - Wine = ~4g carbs + alcohol per 5 oz (~120 cal)
   - Mixed drinks = mixer carbs/sugar + alcohol calories
   - Diet mixers should have FEWER calories than regular versions

2. CATEGORIZATION CORRECTIONS:
   - Alcoholic beverages → "Beverages" (NOT "Grains, Bread & Pasta")
   - Cooking oils (vegetable oil, olive oil) → "Fats & Oils" (NOT "Grains")
   - Leafy greens (turnip greens, collards) → "Vegetables" (NOT "Grains")
   - Chips (Doritos, tortilla chips) → "Snacks & Treats" (NOT "Dairy & Eggs")
   - Whipped topping, fat-free → "Fats & Oils" (NOT "Grains")

3. MACRO VALIDATION:
   - Calories should ≈ (Protein×4) + (Carbs×4) + (Fat×9) + (Alcohol×7 if present)
   - If sugar is present, there MUST be corresponding carbs and calories
   - Total macros (P+C+F) cannot exceed serving weight by more than 10%

TASK:
1. Check if category is correct - fix if miscategorized
2. Determine if nutritional values are accurate for this food and serving size
3. If INACCURATE: Provide corrected values based on USDA/reliable nutrition databases
4. If ACCURATE: Confirm they are correct

Return JSON in this EXACT format:
{
  "needsCorrection": true/false,
  "correctedValues": {
    "category": "<correct category>",
    "calories": <number>,
    "protein_g": <number>,
    "carbs_g": <number>,
    "fat_g": <number>,
    "fiber_g": <number>,
    "sugar_g": <number>,
    "sodium_mg": <number>,
    "calcium_mg": <number>,
    "iron_mg": <number>,
    "vitamin_c_mg": <number>,
    "vitamin_a_mcg": <number>,
    "potassium_mg": <number>
  },
  "reasoning": "Brief explanation of corrections",
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

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    return result as CorrectionResult

  } catch (error) {
    console.error('GPT correction failed:', error)
    return { needsCorrection: false }
  }
}

/**
 * Verify corrected values with GPT-4
 */
async function verifyCorrectionsWithGPT(food: FoodServing): Promise<boolean> {
  try {
    const prompt = `You are a nutrition data validator. Verify if these nutrition values are ACCURATE.

Food: ${food.food_name}
Serving: ${food.serving_description}

VALUES TO VERIFY:
- Calories: ${food.calories} kcal
- Protein: ${food.protein_g}g, Carbs: ${food.carbs_g}g, Fat: ${food.fat_g}g
- Fiber: ${food.fiber_g}g, Sugar: ${food.sugar_g}g
- Sodium: ${food.sodium_mg}mg, Calcium: ${food.calcium_mg}mg
- Iron: ${food.iron_mg}mg, Vitamin C: ${food.vitamin_c_mg}mg

QUESTIONS:
1. Do calories match the Atwater formula? (P×4 + C×4 + F×9)
2. Are macros realistic for this food and serving size?
3. Are micronutrients reasonable for this food type?
4. Is this overall a high-quality, accurate nutrition entry?

Return JSON: {"accurate": true/false, "confidence": 0-100, "issues": [list any remaining issues]}`

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

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    
    return result.accurate && result.confidence >= 80

  } catch (error) {
    console.error('GPT verification failed:', error)
    return false
  }
}

/**
 * Main auto-correction loop for a single food
 */
async function autoCorrectFood(supabaseAdmin: any, food: FoodServing): Promise<{
  success: boolean
  verified: boolean
  flagged: boolean
  attempts: number
  finalValues?: Partial<FoodServing>
}> {
  console.log(`\n🔄 Auto-correcting: ${food.food_name}`)
  
  let currentFood = { ...food }
  let attempt = 0

  while (attempt < MAX_CORRECTION_ATTEMPTS) {
    attempt++
    console.log(`\n   Attempt ${attempt}/${MAX_CORRECTION_ATTEMPTS}`)

    // Run deterministic checks
    const atwaterResult = atwaterCheck(currentFood)
    const physicsResult = physicsCheck(currentFood)
    const outlierResult = outlierCheck(currentFood)

    const allFlags = [
      ...atwaterResult.flags,
      ...physicsResult.flags,
      ...outlierResult.flags
    ]

    console.log(`   Atwater: ${atwaterResult.passed ? '✅' : '⚠️'}`)
    console.log(`   Physics: ${physicsResult.passed ? '✅' : '⚠️'}`)
    console.log(`   Outlier: ${outlierResult.passed ? '✅' : '⚠️'}`)

    // If all deterministic checks pass, do final GPT verification
    if (allFlags.length === 0) {
      console.log(`   🤖 Final GPT-4 verification...`)
      const gptVerified = await verifyCorrectionsWithGPT(currentFood)
      
      if (gptVerified) {
        console.log(`   ✅ VERIFIED! All checks passed.`)
        
        // Update database with verified values
        await supabaseAdmin
          .from('food_servings')
          .update({
            ...currentFood,
            is_verified: true,
            quality_score: 100,
            enrichment_status: 'verified',
            needs_review: false,
            review_flags: null,
            verification_details: {
              attempts: attempt,
              final_check: 'all_passed',
              timestamp: new Date().toISOString()
            },
            last_verification: new Date().toISOString()
          })
          .eq('id', food.id)

        return { success: true, verified: true, flagged: false, attempts: attempt }
      }
    }

    // Issues found - ask GPT for corrections
    console.log(`   🤖 Asking GPT-4 for corrections...`)
    const correction = await getCorrectionFromGPT(currentFood, allFlags)

    if (!correction.needsCorrection) {
      console.log(`   ⚠️  GPT says values are actually correct, but deterministic checks failed`)
      // This is a conflict - flag for human review
      break
    }

    console.log(`   🔧 Applying corrections (confidence: ${correction.confidence}%)`)
    console.log(`   📝 ${correction.reasoning}`)

    // Apply corrections
    currentFood = {
      ...currentFood,
      ...correction.correctedValues
    }

    // Log the changes
    console.log(`   Updated values:`)
    console.log(`      Calories: ${food.calories} → ${currentFood.calories}`)
    console.log(`      Protein: ${food.protein_g}g → ${currentFood.protein_g}g`)
    console.log(`      Carbs: ${food.carbs_g}g → ${currentFood.carbs_g}g`)
    console.log(`      Fat: ${food.fat_g}g → ${currentFood.fat_g}g`)

    // Loop will re-check with new values
  }

  // Max attempts reached without verification - flag for human review
  console.log(`   ❌ Could not verify after ${MAX_CORRECTION_ATTEMPTS} attempts - flagging for review`)
  
  await supabaseAdmin
    .from('food_servings')
    .update({
      needs_review: true,
      review_flags: ['MAX_CORRECTION_ATTEMPTS_EXCEEDED'],
      review_details: {
        attempts: attempt,
        original_values: food,
        last_attempted_values: currentFood,
        reason: 'Could not achieve verified status after corrections'
      },
      last_verification: new Date().toISOString()
    })
    .eq('id', food.id)

  return { success: true, verified: false, flagged: true, attempts: attempt, finalValues: currentFood }
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get next 1 food to verify (batch size = 1)
    const { data: foods, error } = await supabaseAdmin
      .from('food_servings')
      .select('*')
      .in('enrichment_status', ['completed', 'verified'])
      .or('is_verified.is.null,is_verified.eq.false')
      .order('quality_score', { ascending: false })
      .limit(1)

    if (error) throw error

    if (!foods || foods.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No foods to verify',
          verified: 0,
          flagged: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process the single food with auto-correction
    const result = await autoCorrectFood(supabaseAdmin, foods[0])

    // Count remaining foods
    const { count } = await supabaseAdmin
      .from('food_servings')
      .select('*', { count: 'exact', head: true })
      .in('enrichment_status', ['completed', 'verified'])
      .or('is_verified.is.null,is_verified.eq.false')

    return new Response(
      JSON.stringify({
        success: true,
        verified: result.verified ? 1 : 0,
        flagged: result.flagged ? 1 : 0,
        errors: 0,
        remaining: count || 0,
        attempts: result.attempts,
        food_name: foods[0].food_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
